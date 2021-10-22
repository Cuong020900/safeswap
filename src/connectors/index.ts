import { InjectedConnector } from '@web3-react/injected-connector'
import { BinanceConnector } from '@bscswap/binance-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { PortisConnector } from '@web3-react/portis-connector'

import { FortmaticConnector } from './Fortmatic'
import { NetworkConnector } from './NetworkConnector'
import { ChainId } from '@safemoon/sdk'

const BSC_TESTNET_URL = process.env.REACT_APP_BSC_TESTNET_URL
const ETH_TESTNET_URL = process.env.REACT_APP_ETH_TESTNET_URL
const BSC_URL = process.env.REACT_APP_BSC_URL
const ETH_URL = process.env.REACT_APP_ETH_URL
const FORMATIC_KEY = process.env.REACT_APP_FORTMATIC_KEY
const PORTIS_ID = process.env.REACT_APP_PORTIS_ID

if (typeof BSC_URL === 'undefined' || typeof ETH_URL === 'undefined') {
  throw new Error(`REACT_APP_NETWORK_URL must be a defined environment variable`)
}

export const network = new NetworkConnector({
  urls: {
    [ChainId.BSC_TESTNET]: BSC_TESTNET_URL,
    [ChainId.ROPSTEN]: ETH_TESTNET_URL,
    [ChainId.MAINNET]: ETH_URL,
    [ChainId.BSC_MAINNET]: BSC_URL
  },
  defaultChainId: ChainId.BSC_MAINNET
})

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 56, 97]
})

export const binanceinjected = new BinanceConnector({
  supportedChainIds: [56, 97]
})

// mainnet only
export const walletconnect = new WalletConnectConnector({
  rpc: { [ChainId.MAINNET]: ETH_URL },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: 15000
})

export const walletconnectBSC = new WalletConnectConnector({
  rpc: { [ChainId.BSC_MAINNET]: BSC_URL },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: 15000
})

// mainnet only
export const fortmatic = new FortmaticConnector({
  apiKey: FORMATIC_KEY ?? '',
  chainId: 1
})

// mainnet only
export const portis = new PortisConnector({
  dAppId: PORTIS_ID ?? '',
  networks: [1]
})

// mainnet only
export const walletlink = new WalletLinkConnector({
  url: ETH_URL,
  appName: 'SafemoonSwap',
  appLogoUrl:
    'https://mpng.pngfly.com/20181202/bex/kisspng-emoji-domain-unicorn-pin-badges-sticker-unicorn-tumblr-emoji-unicorn-iphoneemoji-5c046729264a77.5671679315437924251569.jpg'
})
