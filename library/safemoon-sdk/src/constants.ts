import JSBI from 'jsbi'

// exports for external consumption
export type BigintIsh = JSBI | bigint | string

export enum ChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GÖRLI = 5,
  KOVAN = 42,
  BSC_MAINNET = 56,
  BSC_TESTNET = 97
}

export enum TradeType {
  EXACT_INPUT,
  EXACT_OUTPUT
}

export enum Rounding {
  ROUND_DOWN,
  ROUND_HALF_UP,
  ROUND_UP
}

type ChainAddress = {
  [chainId in ChainId]: string
}
export const FACTORY_ADDRESS: ChainAddress = {
  [ChainId.MAINNET]: "0x9Cf2f35E3656D4C68474525d67D9459Da3A000CD",
  [ChainId.ROPSTEN]: "0xDfD8bbA37423950bD8050C65E698610C57E55cea",
  [ChainId.RINKEBY]: "",
  [ChainId.GÖRLI]: "",
  [ChainId.KOVAN]: "",
  [ChainId.BSC_MAINNET]: "0x4d05D0045df5562D6D52937e93De6Ec1FECDAd21",
  [ChainId.BSC_TESTNET]: "0xB8554a2d68D052698b5EA538B0f3e1919a56e871"
}

export const INIT_CODE_HASH: ChainAddress = {
  [ChainId.MAINNET]: "0x8bc8f8336dcfcba44096a139671d89637695b1be1cf88aad5d7de56ae35b8bfd",
  [ChainId.ROPSTEN]: '0x8bc8f8336dcfcba44096a139671d89637695b1be1cf88aad5d7de56ae35b8bfd',
  [ChainId.RINKEBY]: "",
  [ChainId.GÖRLI]: "",
  [ChainId.KOVAN]: "",
  [ChainId.BSC_MAINNET]: "0x8bc8f8336dcfcba44096a139671d89637695b1be1cf88aad5d7de56ae35b8bfd",
  [ChainId.BSC_TESTNET]: '0x8bc8f8336dcfcba44096a139671d89637695b1be1cf88aad5d7de56ae35b8bfd'
}

export const MINIMUM_LIQUIDITY = JSBI.BigInt(1000)

// exports for internal consumption
export const ZERO = JSBI.BigInt(0)
export const ONE = JSBI.BigInt(1)
export const TWO = JSBI.BigInt(2)
export const THREE = JSBI.BigInt(3)
export const FIVE = JSBI.BigInt(5)
export const TEN = JSBI.BigInt(10)
export const _100 = JSBI.BigInt(100)
export const _9975 = JSBI.BigInt(9975)
export const _10000 = JSBI.BigInt(10000)

export enum SolidityType {
  uint8 = 'uint8',
  uint256 = 'uint256'
}

export const SOLIDITY_TYPE_MAXIMA = {
  [SolidityType.uint8]: JSBI.BigInt('0xff'),
  [SolidityType.uint256]: JSBI.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
}
