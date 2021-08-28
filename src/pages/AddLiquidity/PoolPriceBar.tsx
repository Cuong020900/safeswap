import { Currency, Percent, Price } from '@safemoon/sdk'
import React, { useContext } from 'react'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { AutoColumn } from '../../components/Column'
import { AutoRow } from '../../components/Row'
import { ONE_BIPS } from '../../constants'
import { Field } from '../../state/mint/actions'
import { TYPE } from '../../theme'
import { useTranslation } from 'react-i18next'
import {useActiveWeb3React} from "../../hooks";
import getTokenSymbol from "../../utils/getTokenSymbol";

export function PoolPriceBar({
  currencies,
  noLiquidity,
  poolTokenPercentage,
  price
}: {
  currencies: { [field in Field]?: Currency }
  noLiquidity?: boolean
  poolTokenPercentage?: Percent
  price?: Price
}) {
  const { t } = useTranslation()
  const theme = useContext(ThemeContext)
    const { chainId } = useActiveWeb3React();
  return (
    <AutoColumn gap="md" style={{ width: '100%'}}>
      <AutoRow justify="space-between" align={'center'} gap="4px">
        <TYPE.black color={theme.text3}>{price?.toSignificant(6) ?? '-'}</TYPE.black>
        <Text fontWeight={500} fontSize={14} color={theme.text1} pt={1}>
          {getTokenSymbol(currencies[Field.CURRENCY_B], chainId)} per {getTokenSymbol(currencies[Field.CURRENCY_A], chainId)}
        </Text>
      </AutoRow>
      <AutoRow justify="space-between" align={'center'} gap="4px">
        <TYPE.black color={theme.text3}>{price?.invert()?.toSignificant(6) ?? '-'}</TYPE.black>
        <Text fontWeight={500} fontSize={14} color={theme.text1} pt={1}>
          {getTokenSymbol(currencies[Field.CURRENCY_A], chainId)} per {getTokenSymbol(currencies[Field.CURRENCY_B], chainId)}
        </Text>
      </AutoRow>
      <AutoRow justify="space-between" align={'center'} gap="4px">
        <TYPE.black color={theme.text3}>
          {noLiquidity && price
              ? '100'
              : (poolTokenPercentage?.lessThan(ONE_BIPS) ? '<0.01' : poolTokenPercentage?.toFixed(2)) ?? '0'}
          %
        </TYPE.black>
        <Text fontWeight={500} fontSize={14} color={theme.green1} pt={1}>
          {t('shareOfPool')}
        </Text>
      </AutoRow>
    </AutoColumn>
  )
}
