// @ts-ignore

import { AbstractConnector } from '@web3-react/abstract-connector'
import { ChainId, JSBI, Percent, Token, WETH } from '@safemoon/sdk'

import { binanceinjected, injected, walletconnect, walletconnectBSC } from '../connectors'
import { BigNumber } from '@ethersproject/bignumber'
import { BigNumberish } from 'ethers'
import mitt from 'mitt'

export enum PopupTypes {
  BLACKLIST_WALLET = 'BLACKLIST_WALLET',
  BLACKLIST_TOKEN = 'BLACKLIST_TOKEN'
}

export const popupEmitter = mitt()

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}

type ChainAddress = {
  [chainId in ChainId]: string
}

type Address = {
  [chainId in ChainId]: string
}

type Tokens = {
  [chainId in ChainId]: Token
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const ROUTER_ADDRESS: ChainAddress = {
  [ChainId.MAINNET]: '0xCf7d4B75b7bCcDb8B4F992Fe05970680E2EE1A02',
  [ChainId.RINKEBY]: '',
  [ChainId.GÖRLI]: '',
  [ChainId.KOVAN]: '',
  [ChainId.BSC_MAINNET]: '0x5eeEee7715A606bba358Dac7114EB2f6d017f1a2',
  [ChainId.ROPSTEN]: '0x713702D3fb45BC9765d3A00e0B37c33f9CE9Ec91',
  [ChainId.BSC_TESTNET]: '0x36c4D6d43295c70b1a6636DBb21c90addBa90d06'
}

export const DAI = new Token(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin')
export const USDC = new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD//C')
export const USDT = new Token(ChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD')
export const COMP = new Token(ChainId.MAINNET, '0xc00e94Cb662C3520282E6f5717214004A7f26888', 18, 'COMP', 'Compound')
export const MKR = new Token(ChainId.MAINNET, '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', 18, 'MKR', 'Maker')
export const AMPL = new Token(ChainId.MAINNET, '0x6F46200B1fe80D118492E577B3c2c9Fc06A868D2', 9, 'AMPL', 'Ampleforth')

export const BAI = new Token(
  ChainId.BSC_MAINNET,
  '0xaA8012a0Ea627767545a8E435C2A2BD51f60173D',
  18,
  'BAI',
  'BAI Stablecoin'
)
export const B_DAI = new Token(
  ChainId.BSC_MAINNET,
  '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
  18,
  'DAI',
  'Dai Token'
)
export const BUSD = new Token(
  ChainId.BSC_MAINNET,
  '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
  18,
  'BUSD',
  'BUSD Token'
)
export const B_USDT = new Token(
  ChainId.BSC_MAINNET,
  '0x55d398326f99059fF775485246999027B3197955',
  18,
  'USDT',
  'Tether USD'
)

export const T_DAI = new Token(
  ChainId.BSC_TESTNET,
  '0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F6A0867',
  18,
  'DAI',
  'Dai Token'
)
export const T_BUSD = new Token(
  ChainId.BSC_TESTNET,
  '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee',
  6,
  'BUSD',
  'BUSD Token'
)
export const T_USDT = new Token(
  ChainId.BSC_TESTNET,
  '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
  6,
  'USDT',
  'Tether USD'
)

const WETH_ONLY: ChainTokenList = {
  [ChainId.MAINNET]: [WETH[ChainId.MAINNET]],
  [ChainId.ROPSTEN]: [WETH[ChainId.ROPSTEN]],
  [ChainId.RINKEBY]: [WETH[ChainId.RINKEBY]],
  [ChainId.GÖRLI]: [WETH[ChainId.GÖRLI]],
  [ChainId.KOVAN]: [WETH[ChainId.KOVAN]],
  [ChainId.BSC_MAINNET]: [WETH[ChainId.BSC_MAINNET]],
  [ChainId.BSC_TESTNET]: [WETH[ChainId.BSC_TESTNET]]
}

export const SFM_V1: Address = {
  [ChainId.MAINNET]: ZERO_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ADDRESS,
  [ChainId.KOVAN]: ZERO_ADDRESS,
  [ChainId.BSC_MAINNET]: process.env.REACT_APP_SAFEMOON_TOKEN || ZERO_ADDRESS,
  [ChainId.BSC_TESTNET]: process.env.REACT_APP_SAFEMOON_TESTNET_TOKEN || ZERO_ADDRESS
}

export const SFM_V2: Address = {
  [ChainId.MAINNET]: ZERO_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ADDRESS,
  [ChainId.KOVAN]: ZERO_ADDRESS,
  [ChainId.BSC_MAINNET]: process.env.REACT_APP_SAFEMOONV2_TOKEN || ZERO_ADDRESS,
  [ChainId.BSC_TESTNET]: process.env.REACT_APP_SAFEMOONV2_TESTNET_TOKEN || ZERO_ADDRESS
}

export const MIGRATION: Address = {
  [ChainId.MAINNET]: ZERO_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ADDRESS,
  [ChainId.KOVAN]: ZERO_ADDRESS,
  [ChainId.BSC_MAINNET]: process.env.REACT_APP_MIGRATION || ZERO_ADDRESS,
  [ChainId.BSC_TESTNET]: process.env.REACT_APP_MIGRATION_TESTNET || ZERO_ADDRESS
}

export const SfmV1: Tokens = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, SFM_V1[ChainId.MAINNET], 9, 'SAFEMOON', 'Safemoon'),
  [ChainId.ROPSTEN]: new Token(ChainId.ROPSTEN, SFM_V1[ChainId.ROPSTEN], 9, 'SAFEMOON', 'Safemoon'),
  [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, SFM_V1[ChainId.RINKEBY], 9, 'SAFEMOON', 'Safemoon'),
  [ChainId.GÖRLI]: new Token(ChainId.GÖRLI, SFM_V1[ChainId.GÖRLI], 9, 'SAFEMOON', 'Safemoon'),
  [ChainId.KOVAN]: new Token(ChainId.KOVAN, SFM_V1[ChainId.KOVAN], 9, 'SAFEMOON', 'Safemoon'),
  [ChainId.BSC_MAINNET]: new Token(ChainId.BSC_MAINNET, SFM_V1[ChainId.BSC_MAINNET], 9, 'SAFEMOON', 'Safemoon'),
  [ChainId.BSC_TESTNET]: new Token(ChainId.BSC_TESTNET, SFM_V1[ChainId.BSC_TESTNET], 9, 'SAFEMOON', 'Safemoon')
}

export const SfmV2: Tokens = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, SFM_V1[ChainId.MAINNET], 9, 'SAFEMOON', 'Safemoon'),
  [ChainId.ROPSTEN]: new Token(ChainId.ROPSTEN, SFM_V1[ChainId.ROPSTEN], 9, 'SAFEMOON', 'Safemoon'),
  [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, SFM_V1[ChainId.RINKEBY], 9, 'SAFEMOON', 'Safemoon'),
  [ChainId.GÖRLI]: new Token(ChainId.GÖRLI, SFM_V1[ChainId.GÖRLI], 9, 'SAFEMOON', 'Safemoon'),
  [ChainId.KOVAN]: new Token(ChainId.KOVAN, SFM_V1[ChainId.KOVAN], 9, 'SAFEMOON', 'Safemoon'),
  [ChainId.BSC_MAINNET]: new Token(ChainId.BSC_MAINNET, SFM_V2[ChainId.BSC_MAINNET], 9, 'SFM', 'Safemoon V2'),
  [ChainId.BSC_TESTNET]: new Token(ChainId.BSC_TESTNET, SFM_V2[ChainId.BSC_TESTNET], 9, 'SFM', 'Safemoon V2')
}

export const consolidation = {
  addresses: {
    v1: SFM_V1,
    v2: SFM_V2,
    migration: MIGRATION
  },
  tokens: {
    v1: SfmV1,
    v2: SfmV2
  }
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], DAI, USDC, USDT, COMP, MKR],
  [ChainId.BSC_MAINNET]: [...WETH_ONLY[ChainId.BSC_MAINNET], BAI, B_USDT, BUSD, B_DAI]
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.MAINNET]: {
    [AMPL.address]: [DAI, WETH[ChainId.MAINNET]]
  }
}

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], DAI, USDC, USDT],
  [ChainId.BSC_MAINNET]: [...WETH_ONLY[ChainId.BSC_MAINNET], BAI, B_USDT, BUSD, B_DAI],
  [ChainId.BSC_TESTNET]: [...WETH_ONLY[ChainId.BSC_TESTNET], T_USDT, T_BUSD, T_DAI]
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], DAI, USDC, USDT],
  [ChainId.BSC_MAINNET]: [...WETH_ONLY[ChainId.BSC_MAINNET], BAI, B_USDT, BUSD, B_DAI],
  [ChainId.BSC_TESTNET]: [...WETH_ONLY[ChainId.BSC_TESTNET], T_USDT, T_BUSD, T_DAI]
}

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
  [ChainId.MAINNET]: [
    [
      new Token(ChainId.MAINNET, '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', 8, 'cDAI', 'Compound Dai'),
      new Token(ChainId.MAINNET, '0x39AA39c021dfbaE8faC545936693aC917d5E7563', 8, 'cUSDC', 'Compound USD Coin')
    ],
    [USDC, USDT],
    [DAI, USDT]
  ]
}

export interface WalletInfo {
  connector?: AbstractConnector
  name: string
  iconName: string
  description: string
  href: string | null
  color: string
  primary?: true
  mobile?: true
  mobileOnly?: true
  chainIds: number[]
  hrefIos?: string
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  SAFEMOON_WALLET_BSC: {
    connector: walletconnectBSC,
    name: 'SafeMoon Wallet',
    iconName: 'SafeMoonWallet.svg',
    description: 'A secure place to store and trade your SafeMoon.',
    href: null,
    color: '#008a81',
    chainIds: [56],
    mobile: true,
    hrefIos:
      'https://safemoon.com/wc?uri=wc%3A465fdefd-c2f9-47ca-98b2-007b2b26ded1%401%3Fbridge%3Dhttps%253A%252F%252Fj.bridge.walletconnect.org%26key%3D458380949414c0a8e6467aec9cdfe4fbd29dd7bbf0ff0b334d6dc15b43299847'
  },
  SAFEMOON_WALLET: {
    connector: walletconnect,
    name: 'SafeMoon Wallet',
    iconName: 'SafeMoonWallet.svg',
    description: 'A secure place to store and trade your SafeMoon.',
    href: null,
    color: '#008a81',
    chainIds: [1],
    mobile: true,
    hrefIos:
      'https://safemoon.com/wc?uri=wc%3A465fdefd-c2f9-47ca-98b2-007b2b26ded1%401%3Fbridge%3Dhttps%253A%252F%252Fj.bridge.walletconnect.org%26key%3D458380949414c0a8e6467aec9cdfe4fbd29dd7bbf0ff0b334d6dc15b43299847'
  },
  INJECTED: {
    connector: injected,
    name: 'Injected',
    iconName: 'arrow-right.svg',
    description: 'Injected web3 provider.',
    href: null,
    color: '#010101',
    primary: true,
    chainIds: [1, 3, 56, 97]
  },
  WALLETCONNECT: {
    connector: walletconnect,
    name: 'WalletConnect',
    iconName: 'walletConnectIcon.svg',
    description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
    href: null,
    color: '#3375BB',
    chainIds: [1],
    mobile: true
  },
  WALLETCONNECT_BSC: {
    connector: walletconnectBSC,
    name: 'WalletConnect',
    iconName: 'walletConnectIcon.svg',
    description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
    href: null,
    color: '#3375BB',
    chainIds: [56],
    mobile: true
  },
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    iconName: 'metamask.png',
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D',
    chainIds: [1, 3, 56, 97],
    mobile: true
  },
  TRUSTWALLET: {
    connector: walletconnect,
    name: 'TrustWallet',
    iconName: 'trustwallet.svg',
    description: 'The most trusted & secure crypto wallet',
    href: null,
    color: '#3375BB',
    chainIds: [1],
    mobile: true
  },
  TRUSTWALLET_TESTNET: {
    connector: injected,
    name: 'TrustWallet',
    iconName: 'trustwallet.svg',
    description: 'The most trusted & secure crypto wallet',
    href: null,
    color: '#3375BB',
    chainIds: [3, 97]
  },
  TRUSTWALLET_BSC: {
    connector: walletconnectBSC,
    name: 'TrustWallet',
    iconName: 'trustwallet.svg',
    description: 'The most trusted & secure crypto wallet',
    href: null,
    color: '#3375BB',
    chainIds: [56],
    mobile: true
  },
  BINANCE: {
    connector: binanceinjected,
    name: 'Binance Chain Wallet',
    iconName: 'bnb.svg',
    description: 'A Crypto Wallet for Binance Smart Chain',
    href: null,
    color: '#F9A825',
    chainIds: [56, 97]
  },
  MATHWALLET: {
    connector: injected,
    name: 'MathWallet',
    iconName: 'mathwallet.svg',
    description: 'Your Gateway to the World of Blockchain',
    href: null,
    color: '#000000',
    chainIds: [1, 3, 56, 97]
  }
}

export const NetworkContextName = 'NETWORK'

export const appEnv: string = process.env.REACT_APP_ENV || 'development'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.multiply(JSBI.BigInt(2), JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16))) // .02 ETH
export const BETTER_TRADE_LINK_THRESHOLD = new Percent(JSBI.BigInt(75), JSBI.BigInt(10000))

export const MAX_PRIORITY_FEE: BigNumberish = BigNumber.from(2).mul(10 ** 9)

export const ETHERSCAN_API_KEY: string = process.env.REACT_APP_ETHERSCAN_API_KEY || ''

// the Safemoon Default token list lives here
export const DEFAULT_TOKEN_LIST_URL: string =
  process.env.REACT_APP_DEFAULT_TOKEN_LIST_URL || 'https://marketdata.safemoon.net/api/swap/v5/tokens'

export const DEFAULT_TOKEN_BLACK_LIST: string =
  process.env.REACT_APP_DEFAULT_TOKEN_BLACK_LIST_URL || 'https://marketdata.safemoon.net/api/swap/token-blacklist'

export const DEFAULT_WALLET_BLACK_LIST_URL: string =
  process.env.REACT_APP_DEFAULT_WALLET_BLACK_LIST_URL ||
  'https://marketdata.safemoon.net/api/swap/walletaddress-blacklist'

export const BLACKLIST_TOKENS_SAFEMOON_V1 = [
  '0X8076C74C5E3F5852037F31FF0093EEB8C8ADD8D3',
  '0XDD6999EC25948811D7C671051F5B4E44B175239E'
]

export const TOKENS_SAFEMOON_V2 = [
  '0X42981D0BFBAF196529376EE702F2A9EB9092FCB5',
  '0X8DF4AAE3A61BC5092EC332F40378A67A70187D46'
]
