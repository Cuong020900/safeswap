import React, { useContext, useMemo } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { Pair } from '@safemoon/sdk'
import { Link } from 'react-router-dom'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import { useTranslation } from 'react-i18next'

import FullPositionCard from '../../components/PositionCard'
import { useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks'
import { StyledInternalLink, TYPE } from '../../theme'
import { Text } from 'rebass'
import { LightCard } from '../../components/Card'
import { RowBetween } from '../../components/Row'
import { ButtonPrimary} from '../../components/Button'
import { AutoColumn } from '../../components/Column'

import { useActiveWeb3React } from '../../hooks'
import { usePairs } from '../../data/Reserves'
import { toV2LiquidityToken, useTrackedTokenPairs } from '../../state/user/hooks'
import AppBody from '../AppBody'
import { Dots } from '../../components/swap/styleds'
import Divider from "../../components/Divider";
import QuestionHelper from "../../components/QuestionHelper";

const InternalLink = styled(StyledInternalLink)`
  color: ${({ theme }) => theme.yellow1};
  text-decoration: underline;
`

export default function Pool() {
  const theme = useContext(ThemeContext)
  const { t } = useTranslation()
  const { account } = useActiveWeb3React()

  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs()
  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map(tokens => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
    [trackedTokenPairs]
  )
  const liquidityTokens = useMemo(() => tokenPairsWithLiquidityTokens.map(tpwlt => tpwlt.liquidityToken), [
    tokenPairsWithLiquidityTokens
  ])
  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens
  )

  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan('0')
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances]
  )

  const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))
  const v2IsLoading =
    fetchingV2PairBalances || v2Pairs?.length < liquidityTokensWithBalances.length || v2Pairs?.some(V2Pair => !V2Pair)

  const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair))


  return (
    <>
      <AppBody>
        <RowBetween>
          <SwapPoolTabs active={'pool'} />
          <div style={{ marginBottom: 20 }}>
            <QuestionHelper text={t('whenyouaddtokenliquidity')} />
          </div>
        </RowBetween>
        <AutoColumn gap="lg" justify="center">
          <ButtonPrimary id="join-pool-button" as={Link} style={{ padding: 16 }} to="/add/BNB">
            <Text fontWeight={700} fontSize={16}>
              {t('addLiquidity')}
            </Text>
          </ButtonPrimary>

          <AutoColumn gap="12px" style={{ width: '100%' }}>
            <RowBetween padding={'0 8px'}>
              <Text color={theme.text3} fontSize={14} fontWeight={400}>
                {t('yourLiquidity')}
              </Text>
            </RowBetween>

            {!account ? (
              <LightCard padding="64px">
                <TYPE.body fontSize={14} color={theme.text3} textAlign="center">
                {t('connectToViewLiquidity')}
                </TYPE.body>
              </LightCard>
            ) : v2IsLoading ? (
              <LightCard padding="64px">
                <TYPE.body fontSize={14} color={theme.text3} textAlign="center">
                  <Dots>{t('loading')}</Dots>
                </TYPE.body>
              </LightCard>
            ) : allV2PairsWithLiquidity?.length > 0 ? (
              <>
                {allV2PairsWithLiquidity.map(v2Pair => (
                  <FullPositionCard key={v2Pair.liquidityToken.address} pair={v2Pair} border={theme.text3} />
                ))}
              </>
            ) : (
              <LightCard padding="64px">
                <TYPE.body fontSize={14} color={theme.text3} textAlign="center">
                  {t('noLiquidityFound')}
                </TYPE.body>
              </LightCard>
            )}
            <Divider/>
            <div>
              <Text fontSize={14} color={theme.text3}>
                {t('dontseeapoolyoujoined')}{' '}
                <InternalLink id="import-pool-link" to={'/find'}>
                  {t('importit')}
                </InternalLink>
              </Text>
            </div>
          </AutoColumn>
        </AutoColumn>
      </AppBody>
    </>
  )
}
