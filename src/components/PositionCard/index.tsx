import { JSBI, Pair, Percent } from '@safemoon/sdk'
import { darken } from 'polished'
import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Link } from 'react-router-dom'
import { Text } from 'rebass'
import styled from 'styled-components'
import { useTotalSupply } from '../../data/TotalSupply'

import { useActiveWeb3React } from '../../hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { ExternalLink } from '../../theme'
import { currencyId } from '../../utils/currencyId'
import { unwrappedToken } from '../../utils/wrappedCurrency'
import {ButtonPrimary, ButtonSecondary} from '../Button'

import Card, { GreyCard } from '../Card'
import { AutoColumn } from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { AutoRow, RowBetween, RowFixed } from '../Row'
import { Dots } from '../swap/styleds'
import { useTranslation } from 'react-i18next'
import {useTheme} from "../../hooks/useTheme";
import getTokenSymbol from "../../utils/getTokenSymbol";

export const FixedHeightRow = styled(RowBetween)`
  height: 24px;
`

export const HoverCard = styled(Card)`
  border: 1px solid ${({ theme }) => theme.bg4};
  :hover {
    border: 1px solid ${({ theme }) => darken(0.06, theme.bg4)};
  }
`

interface PositionCardProps {
  pair: Pair
  showUnwrapped?: boolean
  border?: string,
  position?: string
}

export function MinimalPositionCard({ pair, showUnwrapped = false, border, position }: PositionCardProps) {
  const { account, chainId } = useActiveWeb3React()
  const { t } = useTranslation()
  const theme = useTheme()

  const currency0 = showUnwrapped ? pair.token0 : unwrappedToken(pair.token0)
  const currency1 = showUnwrapped ? pair.token1 : unwrappedToken(pair.token1)

  const [showMore, setShowMore] = useState(false)

  const userPoolBalance = useTokenBalance(account, pair.liquidityToken)
  const totalPoolTokens = useTotalSupply(pair.liquidityToken)

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false)
        ]
      : [undefined, undefined]

  return (
    <>
      {userPoolBalance && (
          <AutoColumn gap="12px">
            {position !== 'inside' && (
                <FixedHeightRow>
                  <RowFixed>
                    <Text fontWeight={500} fontSize={16}>
                      {t('yourPosition')}
                    </Text>
                  </RowFixed>
                </FixedHeightRow>
            )}
            <FixedHeightRow onClick={() => setShowMore(!showMore)}>
              <RowFixed>
                <DoubleCurrencyLogo currency0={currency0} currency1={currency1} margin={true} size={20} />
                <Text fontWeight={400} fontSize={16}>
                  {getTokenSymbol(currency0, chainId)}/{getTokenSymbol(currency1, chainId)}
                </Text>
              </RowFixed>
              <RowFixed>
                <Text fontWeight={500} fontSize={16}>
                  {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
                </Text>
              </RowFixed>
            </FixedHeightRow>
            <AutoColumn gap="4px">
              <FixedHeightRow>
                <Text color={theme.text3} fontSize={16} fontWeight={400}>
                  {getTokenSymbol(currency0, chainId)}:
                </Text>
                {token0Deposited ? (
                  <RowFixed>
                    <Text color={theme.green1} fontSize={16} fontWeight={500} marginLeft={'6px'}>
                      {token0Deposited?.toSignificant(6)}
                    </Text>
                  </RowFixed>
                ) : (
                  '-'
                )}
              </FixedHeightRow>
              <FixedHeightRow>
                <Text color={theme.text3} fontSize={16} fontWeight={400}>
                  {getTokenSymbol(currency1, chainId)}:
                </Text>
                {token1Deposited ? (
                  <RowFixed>
                    <Text color={theme.green1} fontSize={16} fontWeight={500} marginLeft={'6px'}>
                      {token1Deposited?.toSignificant(6)}
                    </Text>
                  </RowFixed>
                ) : (
                  '-'
                )}
              </FixedHeightRow>
            </AutoColumn>
          </AutoColumn>
      )}
    </>
  )
}

export const ButtonPrimaryStyled = styled(ButtonPrimary)`
  height: 40px;
  border-radius: 12px;
`
export const ButtonDanger = styled(ButtonPrimaryStyled)`
  background-color: ${({ theme }) => theme.red1};
  font-size: .875rem;
  color: white;
  &:focus {
    background-color: ${({ theme }) => darken(0.05, theme.red1)};
  }
  &:hover {
    background-color: ${({ theme }) => darken(0.05, theme.red1)};
  }
  &:active {
    background-color: ${({ theme }) => darken(0.1, theme.red1)};
  }
  &:disabled {
    background-color: ${({ theme, altDisbaledStyle }) => (altDisbaledStyle ? theme.red1 : theme.bg1)};
    color: ${({ theme, altDisbaledStyle }) => (altDisbaledStyle ? 'white' : theme.text3)};
    cursor: auto;
    box-shadow: none;
    border: 1px solid transparent;
    outline: none;
  }
`

export default function FullPositionCard({ pair, border }: PositionCardProps) {
  const { account, chainId } = useActiveWeb3React()
  const { t } = useTranslation()
  const theme = useTheme();

  const currency0 = unwrappedToken(pair.token0)
  const currency1 = unwrappedToken(pair.token1)

  const [showMore, setShowMore] = useState(false)

  const userPoolBalance = useTokenBalance(account, pair.liquidityToken)
  const totalPoolTokens = useTotalSupply(pair.liquidityToken)

  const poolTokenPercentage =
    !!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false)
        ]
      : [undefined, undefined]

  return (
    <HoverCard border={border}>
      <AutoColumn gap="12px">
        <FixedHeightRow onClick={() => setShowMore(!showMore)} style={{ cursor: 'pointer' }}>
          <RowFixed>
            <DoubleCurrencyLogo currency0={currency0} currency1={currency1} margin={true} size={20} />
            <Text fontWeight={500} fontSize={16}>
              {!currency0 || !currency1 ? <Dots>Loading</Dots> : `${getTokenSymbol(currency0, chainId)}/${getTokenSymbol(currency1, chainId)}`}
            </Text>
          </RowFixed>
          <RowFixed>
            {showMore ? (
              <ChevronUp size="20" style={{ marginLeft: '10px' }} />
            ) : (
              <ChevronDown size="20" style={{ marginLeft: '10px' }} />
            )}
          </RowFixed>
        </FixedHeightRow>
        {showMore && (
          <AutoColumn gap="8px">
            <FixedHeightRow>
              <RowFixed>
                <Text fontSize={16} fontWeight={400} color={theme.text3}>
                  {t('pooled')} {getTokenSymbol(currency0, chainId)}:
                </Text>
              </RowFixed>
              {token0Deposited ? (
                <RowFixed>
                  <Text fontSize={16} fontWeight={500} marginLeft={'6px'}>
                    {token0Deposited?.toSignificant(6)}
                  </Text>
                  <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={currency0} />
                </RowFixed>
              ) : (
                '-'
              )}
            </FixedHeightRow>

            <FixedHeightRow>
              <RowFixed>
                <Text fontSize={16} fontWeight={400} color={theme.text3}>
                  {t('pooled')} {getTokenSymbol(currency1, chainId)}:
                </Text>
              </RowFixed>
              {token1Deposited ? (
                <RowFixed>
                  <Text fontSize={16} fontWeight={500} marginLeft={'6px'}>
                    {token1Deposited?.toSignificant(6)}
                  </Text>
                  <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={currency1} />
                </RowFixed>
              ) : (
                '-'
              )}
            </FixedHeightRow>
            <FixedHeightRow>
              <Text fontSize={16} fontWeight={400} color={theme.text3}>
                {t('yourPoolTokens')}
              </Text>
              <Text fontSize={16} fontWeight={500} color={theme.green1}>
                {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
              </Text>
            </FixedHeightRow>
            <FixedHeightRow>
              <Text fontSize={16} fontWeight={400} color={theme.text3}>
                {t('yourPoolShares')}
              </Text>
              <Text fontSize={16} fontWeight={500} color={theme.green1}>
                {poolTokenPercentage ? poolTokenPercentage.toFixed(2) + '%' : '-'}
              </Text>
            </FixedHeightRow>
            <RowBetween marginTop="10px">
              <ButtonPrimaryStyled as={Link} to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`} width="48%">
                {t('add')}
              </ButtonPrimaryStyled>
              <ButtonDanger as={Link} width="48%" to={`/remove/${currencyId(currency0)}/${currencyId(currency1)}`}>
                {t('remove')}
              </ButtonDanger>
            </RowBetween>
          </AutoColumn>
        )}
      </AutoColumn>
    </HoverCard>
  )
}
