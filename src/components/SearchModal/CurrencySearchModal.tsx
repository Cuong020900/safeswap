import { Currency, ETHER, Token } from '@safemoon/sdk'
import React, { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { useActiveWeb3React } from '../../hooks'
import { useAllTokens, useToken } from '../../hooks/Tokens'
import useInterval from '../../hooks/useInterval'
import { useAllTokenBalances, useTokenBalance } from '../../state/wallet/hooks'
import { isAddress } from '../../utils'
import Column from '../Column'
import Modal from '../Modal'
import Tooltip from '../Tooltip'
import { filterTokens } from './filtering'
import { useTokenComparator } from './sorting'
import { InputContainer, PaddedColumn, SearchInput } from './styleds'
import CurrencyList from './CurrencyList'
import { SelectToken } from '../NavigationTabs'
import SVG from 'react-inlinesvg'
import SearchIcon from '../../assets/icons/search-normal.svg'
import { BLACKLIST_TOKENS_SAFEMOON_V1 } from '../../constants'

const SearchBarIcon = styled(SVG).attrs(props => ({
  ...props,
  src: SearchIcon,
  width: 24,
  height: 24
}))`
  color: ${({ theme }) => theme.text1};
  position: absolute;
  top: 16px;
  left: 16px;
`
interface CurrencySearchModalProps {
  isOpen?: boolean
  onDismiss?: () => void
  hiddenCurrency?: Currency
  showSendWithSwap?: boolean
  onCurrencySelect?: (currency: Currency) => void
  otherSelectedCurrency?: Currency
}

export default function CurrencySearchModal({
  isOpen,
  onDismiss,
  onCurrencySelect,
  hiddenCurrency,
  showSendWithSwap,
  otherSelectedCurrency
}: CurrencySearchModalProps) {
  const { t } = useTranslation()
  const { account } = useActiveWeb3React()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false)
  const [invertSearchOrder] = useState<boolean>(false)
  const allTokens = useAllTokens()

  // if the current input is an address, and we don't have the token in context, try to fetch it and import
  const searchToken = useToken(
    searchQuery && BLACKLIST_TOKENS_SAFEMOON_V1.indexOf(searchQuery.toUpperCase()) === -1 ? searchQuery : ''
  )
  const searchTokenBalance = useTokenBalance(account, searchToken)
  const allTokenBalances_ = useAllTokenBalances()
  const allTokenBalances = searchToken
    ? {
        [searchToken.address]: searchTokenBalance
      }
    : allTokenBalances_ ?? {}

  const tokenComparator = useTokenComparator(invertSearchOrder)

  const { filteredTokens, fixedTokens }: any = useMemo(() => {
    if (searchToken) return [searchToken]
    const tokens: Token[] = filterTokens(Object.values(allTokens), searchQuery)
    const fixedTokens: Token[] = []
    const resultFilteredTokens: Token[] = []
    tokens.forEach((item: Token) => {
      if (item.symbol === 'SFM') {
        fixedTokens.push(item)
      } else {
        resultFilteredTokens.push(item)
      }
    })
    return {
      fixedTokens,
      filteredTokens: resultFilteredTokens
    }
  }, [searchToken, allTokens, searchQuery])

  const filteredSortedTokens: Token[] = useMemo(() => {
    if (searchToken) return [searchToken]
    const sorted = filteredTokens.sort(tokenComparator)
    const symbolMatch = searchQuery
      .toLowerCase()
      .split(/\s+/)
      .filter(s => s.length > 0)

    if (symbolMatch.length > 1) return sorted

    return [
      ...(searchToken ? [searchToken] : []),
      // sort any exact symbol matches first
      ...sorted.filter(token => token.symbol.toLowerCase() === symbolMatch[0]),
      ...sorted.filter(token => token.symbol.toLowerCase() !== symbolMatch[0])
    ]
  }, [filteredTokens, searchQuery, searchToken, tokenComparator])

  const currencies: Currency[] = useMemo(() => {
    if ('eth'.includes(searchQuery.toLowerCase()) || 'ethereum'.includes(searchQuery.toLowerCase())) {
      return [ETHER, ...filteredSortedTokens]
    }

    return filteredSortedTokens
  }, [searchQuery, filteredSortedTokens])

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency)
      onDismiss()
    },
    [onDismiss, onCurrencySelect]
  )

  // clear the input on open
  useEffect(() => {
    if (isOpen) setSearchQuery('')
  }, [isOpen, setSearchQuery])

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>()
  const handleInput = useCallback(event => {
    const input = event.target.value
    const checksummedInput = isAddress(input)
    setSearchQuery(checksummedInput || input)
    setTooltipOpen(false)
  }, [])

  const closeTooltip = useCallback(() => setTooltipOpen(false), [setTooltipOpen])

  useInterval(
    () => {
      setTooltipOpen(false)
    },
    tooltipOpen ? 4000 : null,
    false
  )

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && filteredSortedTokens.length > 0) {
        if (
          filteredSortedTokens[0].symbol.toLowerCase() === searchQuery.trim().toLowerCase() ||
          filteredSortedTokens.length === 1
        ) {
          handleCurrencySelect(filteredSortedTokens[0])
        }
      }
    },
    [filteredSortedTokens, handleCurrencySelect, searchQuery]
  )

  return (
    <Modal
      isOpen={isOpen}
      onDismiss={onDismiss}
      maxHeight={70}
      initialFocusRef={isMobile ? undefined : inputRef}
      minHeight={70}
      forceMaxHeight={'80vh'}
    >
      <Column style={{ width: '100%' }}>
        <PaddedColumn gap="24px">
          <SelectToken onDismiss={onDismiss} tooltipOpen={tooltipOpen} />
          <Tooltip text={t('importAnyToken')} show={tooltipOpen} placement="bottom">
            <InputContainer>
              <SearchBarIcon />
              <SearchInput
                type="text"
                id="token-search-input"
                placeholder={t('tokenSearchPlaceholder')}
                value={searchQuery}
                ref={inputRef}
                onChange={handleInput}
                onFocus={closeTooltip}
                onBlur={closeTooltip}
                onKeyDown={handleEnter}
              />
            </InputContainer>
          </Tooltip>
        </PaddedColumn>
        {fixedTokens && fixedTokens.length > 0 && (
          <CurrencyList
            currencies={fixedTokens}
            allBalances={allTokenBalances}
            onCurrencySelect={handleCurrencySelect}
            otherCurrency={otherSelectedCurrency}
            selectedCurrency={hiddenCurrency}
            showSendWithSwap={showSendWithSwap}
            height={56}
          />
        )}

        <CurrencyList
          currencies={currencies}
          allBalances={allTokenBalances}
          onCurrencySelect={handleCurrencySelect}
          otherCurrency={otherSelectedCurrency}
          selectedCurrency={hiddenCurrency}
          showSendWithSwap={showSendWithSwap}
        />
      </Column>
    </Modal>
  )
}
