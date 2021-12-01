import { ChainId, Currency, currencyEquals } from '@safemoon/sdk'
import { useActiveWeb3React } from './index'
import { useCurrencyBalance } from '../state/wallet/hooks'
import { useMemo } from 'react'
import { tryParseAmount } from '../state/swap/hooks'
import { useTransactionAdder } from '../state/transactions/hooks'
import { consolidation } from '../constants'
import { useMigrationContract } from './useContract'
import useMigrationStatus, { MigrationStatus } from './useMigrationStatus'
import { calculateGasMargin } from '../utils'
import { BigNumber } from '@ethersproject/bignumber'
import { useGasPrice } from '../state/user/hooks'

export enum MigrateType {
  NOT_APPLICABLE,
  MIGRATE,
  WRONG_MIGRATE
}

const NOT_APPLICABLE = { migrateType: MigrateType.NOT_APPLICABLE }
const WRONG_MIGRATE = {
  migrateType: MigrateType.WRONG_MIGRATE,
  inputError: 'Not Allowed'
}

/**
 * Given the selected input and output currency, return a migration callback
 * @param inputCurrency the selected input currency
 * @param outputCurrency the selected output currency
 * @param typedValue the user input value
 */
export default function useMigrationCallback(
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
  typedValue: string | undefined
): {
  migrateType: MigrateType
  execute?: undefined | (() => Promise<void>)
  inputError?: string
} {
  const { chainId, account } = useActiveWeb3React()
  const balance = useCurrencyBalance(account ?? undefined, inputCurrency)
  const inputAmount = useMemo(() => tryParseAmount(typedValue, inputCurrency), [inputCurrency, typedValue])
  const addTransaction = useTransactionAdder()
  const gasPrice = useGasPrice()
  const migrationContract = useMigrationContract()
  const { status: migrationStatus, error } = useMigrationStatus()

  return useMemo(() => {
    if (
      !chainId ||
      !inputCurrency ||
      !outputCurrency ||
      !(chainId === ChainId.BSC_TESTNET || chainId === ChainId.BSC_MAINNET)
    )
      return NOT_APPLICABLE

    if (
      currencyEquals(inputCurrency, consolidation.tokens.v1[chainId as ChainId]) &&
      currencyEquals(outputCurrency, consolidation.tokens.v2[chainId as ChainId])
    ) {
      const sufficientBalance = inputAmount && balance && !balance.lessThan(inputAmount)

      let inputError = undefined
      if (!sufficientBalance) {
        if (inputAmount) {
          inputError = 'Insufficient Safemoon balance'
        } else {
          inputError = 'Enter Amount'
        }
      } else if (migrationStatus !== MigrationStatus.IN_PROGRESS) {
        inputError = error
      }

      const execute =
        sufficientBalance && inputAmount
          ? async () => {
              try {
                const args = [`0x${inputAmount?.raw.toString(16)}`]
                const estimatedGas = await migrationContract?.estimateGas?.migrate(...args)

                try {
                  const txReceipt = await migrationContract?.migrate(...args, {
                    gasLimit: calculateGasMargin(estimatedGas || BigNumber.from(21000)),
                    gasPrice
                  })
                  addTransaction(txReceipt, {
                    summary: `Migrate ${inputAmount.toSignificant(6)} Safemoon v1 to ${inputAmount
                      .divide('1000')
                      ?.toSignificant(6)} Safemoon v2`
                  })
                } catch (e) {
                  console.log('MIGRATE_ERROR', e)
                }
              } catch (e) {
                console.log('ESTIMATE_MIGRATE_ERROR', e)
              }
            }
          : undefined

      return {
        migrateType: MigrateType.MIGRATE,
        execute,
        inputError
      }
    } else if (
      currencyEquals(inputCurrency, consolidation.tokens.v2[chainId as ChainId]) &&
      currencyEquals(outputCurrency, consolidation.tokens.v1[chainId as ChainId])
    ) {
      return WRONG_MIGRATE
    } else {
      return NOT_APPLICABLE
    }
  }, [
    chainId,
    inputCurrency,
    outputCurrency,
    inputAmount,
    balance,
    migrationStatus,
    error,
    migrationContract,
    gasPrice,
    addTransaction
  ])
}
