import {Currency, Pair} from '@safemoon/sdk'
import React, { useState, useContext, useCallback, useMemo } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { darken } from 'polished'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { RowBetween } from '../Row'
import { TYPE } from '../../theme'
import { Input as NumericalInput } from '../NumericalInput'
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'

import { useActiveWeb3React } from '../../hooks'
import { useTranslation } from 'react-i18next'
import getTokenSymbol from "../../utils/getTokenSymbol";

const InputRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  padding: 6px;
  border: 1px solid ${({ theme }) => theme.bg4};
  height: 56px;
  border-radius: 1rem;
  margin-top: 8px;
`

const InputContainer = styled.div`
  padding: 2px 2px 2px 0;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  max-width: 244px;
`

const CurrencySelect = styled.button<{ selected: boolean }>`
  align-items: center;
  height: 44px;
  font-size: 20px;
  font-weight: 500;
  background-color: transparent;
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
  border-radius: 12px;
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  outline: none;
  cursor: pointer;
  user-select: none;
  border: none;
  padding: 0 0.5rem;
  min-width: 160px;
  transition: 0.3s ease all;

  :focus,
  :hover {
    background-color: ${({ theme }) => theme.bg2};
  }
  
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    min-width: 115px;
  `};
`

const CurrencyInput = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
`

const LabelRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ theme }) => theme.text3};
  font-size: 0.875rem;
  line-height: 1rem;
  height: 24px;
  
  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.text2)};
  }
`

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
  margin: 0 0.25rem 0 0.5rem;
  height: 35%;

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
    stroke-width: 1.5px;
  }
`

const InputPanel = styled.div<{ hideInput?: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  z-index: 1;
`

const Container = styled.div<{ hideInput: boolean }>``

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size: .875rem;
  font-weight: 500;

`

const StyledBalanceMax = styled.button`
  height: 44px;
  background-color: ${({ theme }) => theme.bg3};
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 0.75rem;
  font-size: 0.875rem;
  padding: .5rem 1.5rem;
  font-weight: 500;

  cursor: pointer;
  margin-left: .5rem;
  color: ${({ theme }) => theme.text1};
  transition: 0.3s ease all;
  
  :hover {
    background-color: ${({ theme }) => theme.bg4};
  }
  :focus {
    background-color: ${({ theme }) => theme.bg2};
    outline: none;
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 0.25rem 0.5rem;
    height: 32px;
    border-radius: 0.5rem;
    margin-left: 0;
  `};
`

interface CurrencyInputPanelProps {
    value: string
    onUserInput: (value: string) => void
    onMax?: () => void
    showMaxButton: boolean
    label?: string
    onCurrencySelect?: (currency: Currency) => void
    currency?: Currency | null
    disableCurrencySelect?: boolean
    hideBalance?: boolean
    pair?: Pair | null
    hideInput?: boolean
    showSendWithSwap?: boolean
    otherCurrency?: Currency | null
    id: string,
    priceUsd?: any
}

export default function CurrencyInputPanel({
    value,
    onUserInput,
    onMax,
    showMaxButton,
    label = 'Input',
    onCurrencySelect = null,
    currency = null,
    disableCurrencySelect = false,
    hideBalance = false,
    pair = null, // used for double token logo
    hideInput = false,
    showSendWithSwap = false,
    otherCurrency = null,
    id,
    priceUsd={}
}: CurrencyInputPanelProps) {
    const {t} = useTranslation()
    const { chainId } = useActiveWeb3React();
    const [modalOpen, setModalOpen] = useState(false)
    const {account} = useActiveWeb3React()
    const selectedCurrencyBalance = useCurrencyBalance(account, currency)
    const theme = useContext(ThemeContext)

    const handleDismissSearch = useCallback(() => {
        setModalOpen(false)
    }, [setModalOpen])

    const tokenPriceUsd = useMemo(() => {
      const tokenCurrency: any = currency
      let address = tokenCurrency?.address
      if (tokenCurrency?.symbol === 'ETH') {
        if (chainId === 56) {
          address = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
        } else if (chainId === 1) {
          address = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
        }
      }
      return priceUsd[address]
    }, [priceUsd, (currency as any)?.address, chainId])

    // console.log(tokenPriceUsd?.toFixed(20).replace(/0*$/, ''))

    return (
        <InputPanel id={id}>
            <Container hideInput={hideInput}>
                {!hideInput && (
                    <LabelRow>
                        <RowBetween>
                            <TYPE.body color={theme.text3} fontWeight={400} fontSize={14}>
                                {label}
                            </TYPE.body>
                            {account && (
                                <TYPE.body
                                    onClick={onMax}
                                    color={theme.text3}
                                    fontWeight={400}
                                    fontSize={14}
                                    style={{display: 'inline', cursor: 'pointer'}}
                                >
                                    {!hideBalance && !!currency && selectedCurrencyBalance
                                        ? 'Balance: ' + selectedCurrencyBalance?.toSignificant(6)
                                        : ' -'}
                                </TYPE.body>
                            )}
                        </RowBetween>
                    </LabelRow>
                )}
                <InputRow style={hideInput ? {padding: '0', borderRadius: '8px'} : {}}>
                    <CurrencySelect
                        selected={!!currency}
                        className="open-currency-select-button"
                        onClick={() => {
                            if (!disableCurrencySelect) {
                                setModalOpen(true)
                            }
                        }}
                    >
                        <Aligner>
                            <CurrencyInput>
                                {pair ? (
                                    <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={24} margin={true}/>
                                ) : currency ? (
                                    <CurrencyLogo currency={currency} size={'24px'}/>
                                ) : null}
                                {pair ? (
                                    <StyledTokenName className="pair-name-container">
                                        {getTokenSymbol(pair?.token0, chainId)}:{getTokenSymbol(pair?.token1, chainId)}
                                    </StyledTokenName>
                                ) : (
                                    <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.symbol)}>
                                        {(currency && currency.symbol && currency.symbol.length > 20
                                            ? currency.symbol.slice(0, 4) +
                                            '...' +
                                            currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                                            : getTokenSymbol(currency, chainId)) || t('selectToken')}
                                    </StyledTokenName>
                                )}
                            </CurrencyInput>
                            {!disableCurrencySelect && <StyledDropDown selected={!!currency}/>}
                        </Aligner>
                    </CurrencySelect>
                    {!hideInput && (
                        <InputContainer>
                            <NumericalInput
                                className="token-amount-input"
                                value={value}
                                onUserInput={val => {
                                    onUserInput(val)
                                }}
                            />
                            {account && currency && showMaxButton && label !== 'To' && (
                                <StyledBalanceMax onClick={onMax}>Max</StyledBalanceMax>
                            )}
                        </InputContainer>
                    )}
                </InputRow>
                { tokenPriceUsd
                    && <p className='price-usd'>
                    Price: ${ tokenPriceUsd > 1 ? tokenPriceUsd : (+tokenPriceUsd).toFixed(13).replace(/0*$/, '')}
                  </p>
                }
                
            </Container>
            {!disableCurrencySelect && (
                <CurrencySearchModal
                    isOpen={modalOpen}
                    onDismiss={handleDismissSearch}
                    onCurrencySelect={onCurrencySelect}
                    showSendWithSwap={showSendWithSwap}
                    hiddenCurrency={currency}
                    otherSelectedCurrency={otherCurrency}
                />
            )}
        </InputPanel>
    )
};

