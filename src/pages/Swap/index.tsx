/* eslint-disable */
import { ChainId, CurrencyAmount, JSBI, TokenAmount, Trade } from '@safemoon/sdk'
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import SVG from 'react-inlinesvg'
import ReactGA from 'react-ga'
import { Text } from 'rebass'
import { useTranslation } from 'react-i18next'
import styled, { ThemeContext } from 'styled-components'
import { RouteComponentProps } from 'react-router-dom'
import infoIcon from '../../assets/images/info.svg'
import { ButtonError, ButtonLight, ButtonPrimary } from '../../components/Button'
import Card, { GreyCard } from '../../components/Card'
import { AutoColumn } from '../../components/Column'
import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import { AutoRow, RowBetween } from '../../components/Row'
import AdvancedSwapDetailsDropdown from '../../components/swap/AdvancedSwapDetailsDropdown'
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
import { ArrowWrapper, BottomGrouping, Dots, Wrapper } from '../../components/swap/styleds'
import TradePrice from '../../components/swap/TradePrice'
import { TokenWarningCards } from '../../components/TokenWarningCard'

import { getTradeVersion } from '../../data/V1'
import { useActiveWeb3React } from '../../hooks'
import {
  ApprovalState,
  useApproveCallbackFromMigrate,
  useApproveCallbackFromTrade
} from '../../hooks/useApproveCallback'
import useENSAddress from '../../hooks/useENSAddress'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { useSettingsMenuOpen, useToggleSettingsMenu, useWalletModalToggle } from '../../state/application/hooks'
import { Field } from '../../state/swap/actions'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState
} from '../../state/swap/hooks'
import {
  useExpertModeManager,
  useTokenWarningDismissal,
  useUserDeadline,
  useUserSlippageTolerance
} from '../../state/user/hooks'
import { TYPE } from '../../theme'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import AppBody from '../AppBody'
// @ts-ignore
import TradeIcon from '../../assets/icons/trade.svg'

import QuestionHelper from '../../components/QuestionHelper'
// @ts-ignore
import SettingsIcon from '../../assets/icons/candle-2.svg'
import SettingsModal from '../../components/SettingsModal'
import getTokenSymbol from '../../utils/getTokenSymbol'
import { shouldShowSwapWarning } from '../../utils/shouldShowSwapWarning'
import { SlippageWarning } from '../../components/SlippageWarning/SlippageWarning'
import './Swap.css'
import { useCurrency } from '../../hooks/Tokens'
import ConsolidateV2Intro from './ConsolidateV2Intro'
import { consolidation } from '../../constants'
import useMigrationCallback, { MigrateType } from '../../hooks/useMigrationCallback'
import BigNumber from 'bignumber.js'
import WarningMigrate from './WarningMigrate'
import { WrappedTokenInfo } from '../../state/lists/hooks'

const SettingsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  outline: none;
  cursor: pointer;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.bg3};
  color: ${({ theme }) => theme.text1};
  margin-right: 8px;

  :hover,
  :focus {
    opacity: 0.7;
  }
`

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`

export default function Swap({
  match: {
    params: { currencyIdA, currencyIdB }
  },
  history
}: RouteComponentProps<{ currencyIdA?: string; currencyIdB?: string }>) {
  useDefaultsFromURLSearch()
  const { t } = useTranslation()
  const [showConsolidateV2Intro, setShowConsolidateV2Intro] = useState(false)
  const [showMigrateWarning, setShowMigrateWarning] = useState(false)
  const [readed, setReaded] = useState(false)

  const node = useRef<HTMLDivElement>()
  const open = useSettingsMenuOpen()
  const toggle = useToggleSettingsMenu()

  const handleClickOutside = (e: any) => {
    if (node.current?.contains(e.target) ?? false) {
    } else {
      toggle()
    }
  }

  const currencyA = useCurrency(currencyIdA)
  const currencyB = useCurrency(currencyIdB)

  const { account, chainId } = useActiveWeb3React()
  const theme = useContext(ThemeContext)

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // for expert mode
  const [isExpertMode] = useExpertModeManager()

  // get custom setting values for user
  const [deadline] = useUserDeadline()
  const [allowedSlippage] = useUserSlippageTolerance()

  // swap state
  const { independentField, typedValue, recipient } = useSwapState()
  const { v2Trade, currencyBalances, parsedAmount, currencies, inputError: swapInputError } = useDerivedSwapInfo()
  const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    typedValue
  )

  const { migrateType, execute: onMigrate, inputError: migrateInputError } = useMigrationCallback(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    typedValue
  )

  const showMigrate: boolean = migrateType !== MigrateType.NOT_APPLICABLE
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const showLegacyError: boolean =
    // @ts-ignore
    (currencies[Field.INPUT] instanceof WrappedTokenInfo && currencies[Field.INPUT]?.address?.toUpperCase() === consolidation.tokens.v1[chainId as ChainId]?.address?.toUpperCase() && currencies[Field.OUTPUT]?.address?.toUpperCase() !== consolidation.tokens.v2[chainId as ChainId]?.address?.toUpperCase())
    // @ts-ignore
    || (currencies[Field.INPUT] instanceof WrappedTokenInfo && currencies[Field.OUTPUT]?.address?.toUpperCase() === consolidation.tokens.v1[chainId as ChainId]?.address?.toUpperCase() && currencies[Field.INPUT]?.address?.toUpperCase() !== consolidation.tokens.v2[chainId as ChainId]?.address?.toUpperCase())
  const { address: recipientAddress } = useENSAddress(recipient)
  const trade = showWrap || showMigrate || showLegacyError ? undefined : v2Trade

  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount
      }
    : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount
      }

  const { onSwitchTokens, onCurrencySelection, onUserInput } = useSwapActionHandlers()
  const isValid = !swapInputError
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean
    tradeToConfirm: Trade | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined
  })

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showMigrate
      ? parsedAmounts[independentField]
        ? independentField === Field.INPUT
          ? new BigNumber(parsedAmounts[independentField]?.toExact() ?? 0)?.dividedBy(1000).toString(10)
          : new BigNumber(parsedAmounts[independentField]?.toExact() ?? 0)?.times(1000).toString(10)
        : ''
      : showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? ''
  }

  const route = trade?.route
  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )
  const noRoute = !route

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage)

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  const [migrationApproval, migrationApprovalCallback] = useApproveCallbackFromMigrate(
    typedValue && parsedAmount
      ? independentField === Field.INPUT
        ? parsedAmount
        : new TokenAmount(consolidation.tokens.v1[chainId as ChainId], parsedAmount.multiply('1000').toSignificant(12))
      : new TokenAmount(consolidation.tokens.v1[chainId as ChainId], '0')
  )

  const [migrationApprovalSubmitted, setMigrationApprovalSubmitted] = useState<boolean>(false)

  useEffect(() => {
    if (migrationApproval === ApprovalState.PENDING) {
      setMigrationApprovalSubmitted(true)
    }
  }, [migrationApproval, migrationApprovalSubmitted])

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
    trade,
    allowedSlippage,
    deadline,
    recipient
  )

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)

  const handleSwap = useCallback(() => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
      return
    }
    if (!swapCallback) {
      return
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined })
    swapCallback()
      .then(hash => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: hash })

        ReactGA.event({
          category: 'Swap',
          action:
            recipient === null
              ? 'Swap w/o Send'
              : (recipientAddress ?? recipient) === account
              ? 'Swap w/o Send + recipient'
              : 'Swap w/ Send',
          label: [
            trade?.inputAmount?.currency?.symbol,
            trade?.outputAmount?.currency?.symbol,
            getTradeVersion(trade)
          ].join('/')
        })
      })
      .catch(error => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined
        })
      })
  }, [tradeToConfirm, account, priceImpactWithoutFee, recipient, recipientAddress, showConfirm, swapCallback, trade])

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode)

  const showMigrateApproveFlow =
    migrationApproval === ApprovalState.NOT_APPROVED ||
    migrationApproval === ApprovalState.PENDING ||
    (migrationApprovalSubmitted && migrationApproval === ApprovalState.APPROVED)
  const [dismissedToken0] = useTokenWarningDismissal(chainId, currencies[Field.INPUT])
  const [dismissedToken1] = useTokenWarningDismissal(chainId, currencies[Field.OUTPUT])
  const showWarning =
    (!dismissedToken0 && !!currencies[Field.INPUT]) || (!dismissedToken1 && !!currencies[Field.OUTPUT])

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn, showConfirm })
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])

  const [swapWarningCurrency, setSwapWarningCurrency] = useState(null)

  const handleInputSelect = useCallback(
    inputCurrency => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
      const showSwapWarning = shouldShowSwapWarning(inputCurrency)
      if (showSwapWarning) {
        setSwapWarningCurrency(inputCurrency)
      } else {
        setSwapWarningCurrency(null)
      }
    },
    [onCurrencySelection]
  )

  const handleOutputSelect = useCallback(
    outputCurrency => {
      onCurrencySelection(Field.OUTPUT, outputCurrency)
      const showSwapWarning = shouldShowSwapWarning(outputCurrency)
      if (showSwapWarning) {
        setSwapWarningCurrency(outputCurrency)
      } else {
        setSwapWarningCurrency(null)
      }
    },
    [onCurrencySelection]
  )

  useEffect(() => {
    if (currencyA) {
      handleInputSelect(currencyA)
    }
    if (currencyB) {
      handleOutputSelect(currencyB)
    }
  }, [currencyA, currencyB, handleOutputSelect, handleInputSelect])

  const handleConvertV1ToV2 = useCallback(() => {
    if (!(chainId === ChainId.BSC_TESTNET || chainId === ChainId.BSC_MAINNET)) {
      return
    }
    setMigrationApprovalSubmitted(false)
    onCurrencySelection(Field.INPUT, consolidation.tokens.v1[chainId as ChainId])
    onCurrencySelection(Field.OUTPUT, consolidation.tokens.v2[chainId as ChainId])
    history.push(
      `/swap?inputCurrency=${consolidation.addresses.v1[chainId as ChainId]}&outputCurrency=${
        consolidation.addresses.v2[chainId as ChainId]
      }`
    )
  }, [chainId, history, onCurrencySelection])

  const disabledConsolidate = useMemo(
    () =>
      !(chainId === ChainId.BSC_TESTNET || chainId === ChainId.BSC_MAINNET) ||
      ((currencies[Field.INPUT] as any)?.address?.toUpperCase() ===
        consolidation.addresses.v1[chainId as ChainId]?.toUpperCase() &&
        (currencies[Field.OUTPUT] as any)?.address?.toUpperCase() ===
          consolidation.addresses.v2[chainId as ChainId]?.toUpperCase()),
    [currencies, chainId]
  )

  return (
    <>
      {/* eslint-disable-next-line @typescript-eslint/no-empty-function */}
      <TokenWarningCards currencies={currencies} open={showWarning} onDismiss={() => {}} />
      <SlippageWarning
        onDismiss={() => setSwapWarningCurrency(null)}
        open={swapWarningCurrency !== null}
        token={swapWarningCurrency}
      />
      {!showMigrateWarning && (
        <div className="row">
          <a className={`btn ${disabledConsolidate ? 'disabed' : ''}`} onClick={handleConvertV1ToV2}>
            <span>Consolidate to V2 SafeMoon!</span>
          </a>
          <a
            className="btnInfo"
            onClick={() => {
              setShowConsolidateV2Intro(true)
            }}
          >
            <img src={infoIcon} className="infoIcon" alt="information" />
          </a>
        </div>
      )}

      <AppBody disabled={showWarning} overflow={showMigrateWarning ? 'none' : ''}>
        {showMigrateWarning && (
          <WarningMigrate
            setShowMigrateWarning={setShowMigrateWarning}
            readed={readed}
            setReaded={setReaded}
            onMigrate={onMigrate}
            chainId={chainId}
          />
        )}

        <RowBetween>
          <SwapPoolTabs active={'swap'} />
          <HeaderWrapper>
            <SettingsWrapper onClick={toggle}>
              <SVG src={SettingsIcon} width={24} height={24} color={theme.text1} />
            </SettingsWrapper>
            <SettingsModal open={open} onDismiss={handleClickOutside} />
            <QuestionHelper text={t('swapDescription')} />
          </HeaderWrapper>
        </RowBetween>
        <Wrapper id="swap-page">
          <ConfirmSwapModal
            isOpen={showConfirm}
            trade={trade}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            allowedSlippage={allowedSlippage}
            onConfirm={handleSwap}
            swapErrorMessage={swapErrorMessage}
            onDismiss={handleConfirmDismiss}
          />

          <AutoColumn gap={'lg'}>
            <CurrencyInputPanel
              label={
                independentField === Field.OUTPUT && !(showWrap || showMigrate)
                  ? t('fromestimated')
                  : t('fromCapitalized')
              }
              value={formattedAmounts[Field.INPUT]}
              showMaxButton={!atMaxAmountInput}
              currency={currencies[Field.INPUT]}
              onUserInput={handleTypeInput}
              onMax={() => {
                maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact())
              }}
              onCurrencySelect={handleInputSelect}
              otherCurrency={currencies[Field.OUTPUT]}
              id="swap-currency-input"
            />

            <AutoColumn justify="space-between">
              <AutoRow justify="center" style={{ padding: '0 1rem' }}>
                <ArrowWrapper
                  clickable
                  onClick={() => {
                    setApprovalSubmitted(false) // reset 2 step UI for approvals
                    setMigrationApprovalSubmitted(false)
                    onSwitchTokens()
                  }}
                >
                  <SVG src={TradeIcon} width={32} height={32} stroke={theme.text1} />
                </ArrowWrapper>
              </AutoRow>
            </AutoColumn>
            <CurrencyInputPanel
              value={formattedAmounts[Field.OUTPUT]}
              onUserInput={handleTypeOutput}
              label={
                independentField === Field.INPUT && !(showWrap || showMigrate) ? t('toestimated') : t('toCapitalized')
              }
              showMaxButton={false}
              currency={currencies[Field.OUTPUT]}
              onCurrencySelect={handleOutputSelect}
              otherCurrency={currencies[Field.INPUT]}
              id="swap-currency-output"
            />

            {showWrap || showMigrate ? null : (
              <Card borderRadius={'20px'} padding={'0'}>
                <AutoColumn gap="4px" justify={'center'}>
                  <TradePrice
                    inputCurrency={currencies[Field.INPUT]}
                    outputCurrency={currencies[Field.OUTPUT]}
                    price={trade?.executionPrice}
                    showInverted={showInverted}
                    setShowInverted={setShowInverted}
                  />
                </AutoColumn>
              </Card>
            )}
          </AutoColumn>
          <BottomGrouping>
            {!account ? (
              <ButtonLight onClick={toggleWalletModal}>{t('connectWallet')}</ButtonLight>
            ) : showWrap ? (
              <ButtonPrimary disabled={Boolean(wrapInputError)} onClick={onWrap}>
                {wrapInputError ??
                  (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
              </ButtonPrimary>
            ) : showMigrate ? (
              showMigrateApproveFlow ? (
                <RowBetween>
                  <ButtonPrimary
                    onClick={migrationApprovalCallback}
                    disabled={migrationApproval !== ApprovalState.NOT_APPROVED || migrationApprovalSubmitted}
                    width="48%"
                    altDisbaledStyle={migrationApproval === ApprovalState.PENDING} // show solid button while waiting
                  >
                    {migrationApproval === ApprovalState.PENDING ? (
                      <Dots>Approving</Dots>
                    ) : migrationApprovalSubmitted && migrationApproval === ApprovalState.APPROVED ? (
                      'Approved'
                    ) : (
                      'Approve ' + getTokenSymbol(currencies[Field.INPUT], chainId)
                    )}
                  </ButtonPrimary>
                  <ButtonError
                    onClick={() => {
                      if (disabledConsolidate) {
                        setShowMigrateWarning(true)
                      } else if (onMigrate) {
                        onMigrate()
                      }
                    }}
                    width="48%"
                    id="migrate-button"
                    disabled={migrationApproval !== ApprovalState.APPROVED || Boolean(migrateInputError)}
                  >
                    <Text fontSize={16} fontWeight={500}>
                      {migrateInputError ?? (migrateType === MigrateType.MIGRATE ? 'Migrate' : null)}
                    </Text>
                  </ButtonError>
                </RowBetween>
              ) : (
                <ButtonPrimary
                  disabled={Boolean(migrateInputError)}
                  onClick={() => {
                    if (disabledConsolidate) {
                      setShowMigrateWarning(true)
                    } else if (onMigrate) {
                      onMigrate()
                    }
                  }}
                >
                  {migrateInputError ?? (migrateType === MigrateType.MIGRATE ? 'Migrate' : null)}
                </ButtonPrimary>
              )
            ) : showLegacyError ? (
              <GreyCard style={{ textAlign: 'center' }}>
                <TYPE.main mb="4px">Not Allowed Swapping v1</TYPE.main>
              </GreyCard>
            ) : noRoute && userHasSpecifiedInputOutput ? (
              <GreyCard style={{ textAlign: 'center' }}>
                <TYPE.main mb="4px">{t('insufficientLiquidityForThisTrade')}</TYPE.main>
              </GreyCard>
            ) : showApproveFlow ? (
              <RowBetween>
                <ButtonPrimary
                  onClick={approveCallback}
                  disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                  width="48%"
                  altDisbaledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
                >
                  {approval === ApprovalState.PENDING ? (
                    <Dots>Approving</Dots>
                  ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                    'Approved'
                  ) : (
                    'Approve ' + getTokenSymbol(currencies[Field.INPUT], chainId)
                  )}
                </ButtonPrimary>
                <ButtonError
                  onClick={() => {
                    if (isExpertMode) {
                      handleSwap()
                    } else {
                      setSwapState({
                        tradeToConfirm: trade,
                        attemptingTxn: false,
                        swapErrorMessage: undefined,
                        showConfirm: true,
                        txHash: undefined
                      })
                    }
                  }}
                  width="48%"
                  id="swap-button"
                  disabled={
                    !isValid || approval !== ApprovalState.APPROVED || (priceImpactSeverity > 3 && !isExpertMode)
                  }
                  error={isValid && priceImpactSeverity > 2}
                >
                  <Text fontSize={16} fontWeight={500}>
                    {priceImpactSeverity > 3 && !isExpertMode
                      ? `Price Impact High`
                      : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                  </Text>
                </ButtonError>
              </RowBetween>
            ) : (
              <ButtonError
                onClick={() => {
                  if (isExpertMode) {
                    handleSwap()
                  } else {
                    setSwapState({
                      tradeToConfirm: trade,
                      attemptingTxn: false,
                      swapErrorMessage: undefined,
                      showConfirm: true,
                      txHash: undefined
                    })
                  }
                }}
                id="swap-button"
                disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                error={isValid && priceImpactSeverity > 2 && !swapCallbackError}
              >
                <Text fontSize={16} fontWeight={500}>
                  {swapInputError
                    ? swapInputError
                    : priceImpactSeverity > 3 && !isExpertMode
                    ? `Price Impact Too High`
                    : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                </Text>
              </ButtonError>
            )}
          </BottomGrouping>
          <AdvancedSwapDetailsDropdown trade={trade} />
        </Wrapper>
      </AppBody>

      <ConsolidateV2Intro
        show={showConsolidateV2Intro}
        handleClose={() => {
          setShowConsolidateV2Intro(false)
        }}
        handleConvertV1ToV2={handleConvertV1ToV2}
      />
    </>
  )
}
