import React from 'react'
import { Currency, Price } from '@safemoon/sdk'
import { useContext } from 'react'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { StyledBalanceMaxMini } from './styleds'
// @ts-ignore
import ExchangePrice from '../../assets/icons/exchange-price.svg';
import SVG from 'react-inlinesvg'
import {useActiveWeb3React} from "../../hooks";
import getTokenSymbol from "../../utils/getTokenSymbol";

interface TradePriceProps {
  price?: Price
  inputCurrency?: Currency
  outputCurrency?: Currency
  showInverted: boolean
  setShowInverted: (showInverted: boolean) => void
}

export default function TradePrice({
  price,
  inputCurrency,
  outputCurrency,
  showInverted,
  setShowInverted
}: TradePriceProps) {
  const theme = useContext(ThemeContext)
  const { chainId } = useActiveWeb3React();

  const formattedPrice = showInverted ? price?.toSignificant(6) : price?.invert()?.toSignificant(6)

  const show = Boolean(inputCurrency && outputCurrency)
  const label = showInverted
    ? `${getTokenSymbol(outputCurrency, chainId)} per ${getTokenSymbol(inputCurrency, chainId)}`
    : `${getTokenSymbol(inputCurrency, chainId)} per ${getTokenSymbol(outputCurrency, chainId)}`

  return (
    <Text
      fontWeight={500}
      fontSize={14}
      color={theme.text2}
      style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}
    >
      {show ? (
        <>
          {formattedPrice ?? '-'} {label}
          <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>
            <SVG
              color={theme.text1}
              src={ExchangePrice}
              width={24}
              height={24}
            />
          </StyledBalanceMaxMini>
        </>
      ) : (
        '-'
      )}
    </Text>
  )
}
