import {ChainId, Currency, ETHER, Token} from '@safemoon/sdk'
import React, {useState} from 'react'
import styled from 'styled-components'

import BNBLogo from '../../assets/images/bnb.svg'
import EthereumLogo from '../../assets/images/Ethereum.svg'
import { WrappedTokenInfo } from '../../state/lists/hooks'
import uriToHttp from '../../utils/uriToHttp'
import {useActiveWeb3React} from "../../hooks";

const getTokenLogoURL = address =>
  `/images/${address}.svg`
const BAD_URIS: { [tokenAddress: string]: true } = {}

const Image = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: 1rem;
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
`

const Emoji = styled.span<{ size?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ size }) => size};
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  margin-bottom: -4px;
`

const StyledEthereumLogo = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  border-radius: 24px;
`

export default function CurrencyLogo({
  currency,
  size = '24px',
  ...rest
}: {
  currency?: Currency
  size?: string
  style?: React.CSSProperties
}) {
  const { chainId } = useActiveWeb3React();
  const [, refresh] = useState<number>(0)

  if (currency === ETHER) {
    return <StyledEthereumLogo src={chainId === ChainId.BSC_MAINNET || chainId === ChainId.BSC_TESTNET ? BNBLogo : EthereumLogo} size={size} {...rest} />
  }

  if (currency instanceof Token) {
    let uri: string | undefined

    if (currency instanceof WrappedTokenInfo) {
        uri = getTokenLogoURL(currency.symbol)
    }

    if (!uri) {
      const defaultUri = getTokenLogoURL(currency.symbol)
      if (!BAD_URIS[defaultUri]) {
        uri = defaultUri
      }
    }

    if (uri) {
      return (
        <Image
          {...rest}
          alt={`${currency.name} Logo`}
          src={uri}
          size={size}
          onError={() => {
            if (currency instanceof Token) {
              BAD_URIS[uri] = true
            }
            refresh(i => i + 1)
          }}
        />
      )
    }
  }

  return (
    <Emoji {...rest} size={size}>
      <span role="img" aria-label="Thinking" style={{ fontSize: 16 }}>
        🤔
      </span>
    </Emoji>
  )
}
