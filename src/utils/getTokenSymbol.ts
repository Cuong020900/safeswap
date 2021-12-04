import { ChainId, Currency, Token } from '@safemoon/sdk'
import { consolidation } from '../constants'

export default function getTokenSymbol(token: Token | Currency | undefined, chainId: ChainId | undefined) {
  return token instanceof Token &&
    token.address?.toLowerCase() === consolidation.addresses.v2[chainId as ChainId]?.toLowerCase()
    ? 'SFM'
    : token?.symbol !== 'ETH'
    ? token?.symbol
    : chainId === ChainId.BSC_TESTNET || chainId === ChainId.BSC_MAINNET
    ? 'BNB'
    : 'ETH'
}
