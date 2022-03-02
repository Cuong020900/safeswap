import { createAction } from '@reduxjs/toolkit'
import {ChainId} from "@safemoon/sdk";

export interface SerializedToken {
  chainId: number
  address: string
  decimals: number
  symbol?: string
  name?: string
}

export interface SerializedPair {
  token0: SerializedToken
  token1: SerializedToken
}

export const updateVersion = createAction<void>('updateVersion')
export const hideShowSlippageWarning = createAction<void>('hideShowSlippageWarning')
export const setCurrentAccount = createAction<{ currentAccount: string }>('setCurrentAccount')
export const setCurrentConnector = createAction<{ currentConnector: string }>('setCurrentConnector')
export const updateMatchesDarkMode = createAction<{ matchesDarkMode: boolean }>('updateMatchesDarkMode')
export const updateUserDarkMode = createAction<{ userDarkMode: boolean }>('updateUserDarkMode')
export const updateUserExpertMode = createAction<{ userExpertMode: boolean }>('updateUserExpertMode')
export const updateUserSlippageTolerance = createAction<{ userSlippageTolerance: number }>(
  'updateUserSlippageTolerance'
)
export const updateUserDeadline = createAction<{ userDeadline: number }>('updateUserDeadline')
export const addSerializedToken = createAction<{ serializedToken: SerializedToken }>('addSerializedToken')
export const removeSerializedToken = createAction<{ chainId: number; address: string }>('removeSerializedToken')
export const addSerializedPair = createAction<{ serializedPair: SerializedPair }>('addSerializedPair')
export const removeSerializedPair = createAction<{ chainId: number; tokenAAddress: string; tokenBAddress: string }>(
  'removeSerializedPair'
)
export const dismissTokenWarning = createAction<{ chainId: number; tokenAddress: string }>('dismissTokenWarning')

export const updateGasPrice = createAction<{ gasPrice: string, gasPriceType: string }>('updateGasPrice')
export const updateGasPricesList = createAction<{ gasPrices: any, chainId: ChainId }>("updateGasPricesList")
