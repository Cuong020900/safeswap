import { Trade, TradeType } from '@safemoon/sdk'
import React, { useContext } from 'react'
import { ThemeContext } from 'styled-components'
import { Field } from '../../state/swap/actions'
import { useUserSlippageTolerance } from '../../state/user/hooks'
import { TYPE } from '../../theme'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown } from '../../utils/prices'
import { AutoColumn } from '../Column'
import QuestionHelper from '../QuestionHelper'
import { RowBetween, RowFixed } from '../Row'
import FormattedPriceImpact from './FormattedPriceImpact'
import { SectionBreak } from './styleds'
import SwapRoute from './SwapRoute'
import { useTranslation } from 'react-i18next'
import Divider from "../Divider";

function TradeSummary({ trade, allowedSlippage }: { trade: Trade; allowedSlippage: number }) {
  const theme = useContext(ThemeContext)
  const { priceImpactWithoutFee, realizedLPFee } = computeTradePriceBreakdown(trade)
  const isExactIn = trade.tradeType === TradeType.EXACT_INPUT
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade, allowedSlippage)
  const { t } = useTranslation()

  return (
    <>
      <AutoColumn gap={'sm'} style={{ padding: '0' }}>
        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text3}>
              {isExactIn ? t('minimumReceived') : t('maximumSold')}
            </TYPE.black>
            <QuestionHelper text={t('yourTXWill3')} size={'sm'} />
          </RowFixed>
          <RowFixed>
            <TYPE.black color={theme.secondary2} fontSize={14} fontWeight={400}>
              {isExactIn
                ? `${slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4)} ${trade.outputAmount.currency.symbol}` ??
                  '-'
                : `${slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4)} ${trade.inputAmount.currency.symbol}` ??
                  '-'}
            </TYPE.black>
          </RowFixed>
        </RowBetween>
        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text3}>
              {t('priceImpact')}
            </TYPE.black>
            <QuestionHelper text={t('theDifference')} size={'sm'} />
          </RowFixed>
          <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
        </RowBetween>

        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text3}>
              {t('liquidityProvider')}
            </TYPE.black>
            <QuestionHelper text={t('aPortion')} size={'sm'} />
          </RowFixed>
          <TYPE.black fontSize={14} color={theme.yellow1} fontWeight={400}>
            {realizedLPFee ? `${realizedLPFee.toSignificant(4)} ${trade.inputAmount.currency.symbol}` : '-'}
          </TYPE.black>
        </RowBetween>
      </AutoColumn>
    </>
  )
}

export interface AdvancedSwapDetailsProps {
  trade?: Trade
}

export function AdvancedSwapDetails({ trade }: AdvancedSwapDetailsProps) {
  const theme = useContext(ThemeContext)
  const { t } = useTranslation()

  const [allowedSlippage] = useUserSlippageTolerance()

  const showRoute = Boolean(trade && trade.route.path.length > 2)

  return (
      <AutoColumn gap={'0px'} style={{ width: "100%" }}>
        <Divider/>
        <AutoColumn gap="md">
          {trade && (
              <>
                <TradeSummary trade={trade} allowedSlippage={allowedSlippage} />
                {showRoute && (
                    <>
                      <SectionBreak />
                      <AutoColumn style={{ padding: '0 24px' }}>
                        <RowFixed>
                          <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
                            {t('route')}
                          </TYPE.black>
                          <QuestionHelper text={t('routingThrough')} />
                        </RowFixed>
                        <SwapRoute trade={trade} />
                      </AutoColumn>
                    </>
                )}
              </>
          )}
        </AutoColumn>
      </AutoColumn>
  )
}
