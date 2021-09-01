import { ChainId, Currency, Token } from '@safemoon/sdk'
import React, { useMemo } from 'react'
import styled from 'styled-components'
import { useActiveWeb3React } from '../../hooks'
import { useAllTokens } from '../../hooks/Tokens'
import { useDefaultTokenList } from '../../state/lists/hooks'
import { Field } from '../../state/swap/actions'
import { ExternalLink, TYPE } from '../../theme'
import { getEtherscanLink, isDefaultToken } from '../../utils'
import PropsOfExcluding from '../../utils/props-of-excluding'
import CurrencyLogo from '../CurrencyLogo'
import { AutoRow, RowBetween } from '../Row'
import { AutoColumn } from '../Column'
import { AlertTriangle } from 'react-feather'
import { ButtonError } from '../Button'
import { useTokenWarningDismissal } from '../../state/user/hooks'
import Modal from '../Modal'

const Wrapper = styled.div<{ error: boolean }>`
  background: ${({ theme }) => theme.bg1};
  border: 1px solid ${({ theme }) => theme.text4};
  padding: 0.75rem;
  border-radius: 20px;
`

const ModalWrapper = styled.div`
  padding: 1.5rem;
  box-sizing: border-box;
`

const StyledWarningIcon = styled(AlertTriangle)`
  stroke: ${({ theme }) => theme.red2};
`

interface TokenWarningCardProps extends PropsOfExcluding<typeof Wrapper, 'error'> {
  token?: Token
}

export default function TokenWarningCard({ token, ...rest }: TokenWarningCardProps) {
  const { chainId } = useActiveWeb3React()
  const defaultTokens = useDefaultTokenList()
  const isDefault = isDefaultToken(defaultTokens, token)

  const tokenSymbol = token?.symbol?.toLowerCase() ?? ''
  const tokenName = token?.name?.toLowerCase() ?? ''

  const allTokens = useAllTokens()

  const duplicateNameOrSymbol = useMemo(() => {
    if (isDefault || !token || !chainId) return false

    return Object.keys(allTokens).some(tokenAddress => {
      const userToken = allTokens[tokenAddress]
      if (userToken.equals(token)) {
        return false
      }
      return userToken.symbol.toLowerCase() === tokenSymbol || userToken.name.toLowerCase() === tokenName
    })
  }, [isDefault, token, chainId, allTokens, tokenSymbol, tokenName])

  if (isDefault || !token) return null

  return (
    <Wrapper error={duplicateNameOrSymbol} {...rest}>
      <AutoRow gap="6px">
        <AutoColumn gap="24px">
          <CurrencyLogo currency={token} size={'16px'} />
          <div> </div>
        </AutoColumn>
        <AutoColumn gap="10px" justify="flex-start">
          <TYPE.main>
            {token && token.name && token.symbol && token.name !== token.symbol
              ? `${token.name} (${token.symbol})`
              : token.name || token.symbol}
          </TYPE.main>
          <ExternalLink style={{ fontWeight: 400 }} href={getEtherscanLink(chainId, token.address, 'token')}>
            <TYPE.blue>
              (View on {chainId === ChainId.MAINNET || chainId === ChainId.ROPSTEN ? 'Etherscan' : 'BscScan'})
            </TYPE.blue>
          </ExternalLink>
        </AutoColumn>
      </AutoRow>
    </Wrapper>
  )
}

export function TokenWarningCards({
  currencies,
  open,
  onDismiss
}: {
  currencies: { [field in Field]?: Currency }
  open: boolean
  onDismiss: () => void
}) {
  const { chainId } = useActiveWeb3React()
  const [dismissedToken0, dismissToken0] = useTokenWarningDismissal(chainId, currencies[Field.INPUT])
  const [dismissedToken1, dismissToken1] = useTokenWarningDismissal(chainId, currencies[Field.OUTPUT])

  return (
    <Modal isOpen={open} onDismiss={onDismiss}>
      <ModalWrapper>
        <AutoColumn gap="lg">
          <AutoRow gap="6px">
            <StyledWarningIcon />
            <TYPE.main color={'red2'}>Token imported</TYPE.main>
          </AutoRow>
          <TYPE.body color={'text3'} lineHeight={'1.6'}>
            Anyone can create and name any{' '}
            {chainId === ChainId.MAINNET || chainId === ChainId.ROPSTEN ? 'ERC20' : 'BEP20'} token on{' '}
            {chainId === ChainId.MAINNET || chainId === ChainId.ROPSTEN ? 'Ethereum' : 'Binance Smart Chain'}, including
            creating fake versions of existing tokens and tokens that claim to represent projects that do not have a
            token.
          </TYPE.body>
          <TYPE.body color={'text3'} lineHeight={'1.6'}>
            Similar to {chainId === ChainId.MAINNET || chainId === ChainId.ROPSTEN ? 'Etherscan' : 'BscScan'}, this site
            can load arbitrary tokens via token addresses. Please do your own research before interacting with any{' '}
            {chainId === ChainId.MAINNET || chainId === ChainId.ROPSTEN ? 'ERC20' : 'BEP20'}
            token.
          </TYPE.body>
          {Object.keys(currencies).map(field => {
            const dismissed = field === Field.INPUT ? dismissedToken0 : dismissedToken1
            return currencies[field] instanceof Token && !dismissed ? (
              <TokenWarningCard key={field} token={currencies[field]} />
            ) : null
          })}
          <RowBetween>
            <div />
            <ButtonError
              error={true}
              width={'100%'}
              style={{
                borderRadius: '10px',
                height: 48
              }}
              onClick={() => {
                dismissToken0 && dismissToken0()
                dismissToken1 && dismissToken1()
              }}
            >
              <TYPE.body color="white" className="token-dismiss-button">
                I understand
              </TYPE.body>
            </ButtonError>
            <div />
          </RowBetween>
        </AutoColumn>
      </ModalWrapper>
    </Modal>
  )
}
