import { createAction } from '@reduxjs/toolkit'

export const updateWalletBlackList = createAction<{ walletAddresses: string[] }>('blacklists/walletAddresses')
export const updateTokenBlackList = createAction<{ tokenAddresses: string[] }>('blacklists/tokenAddresses')

export const resetBlackList = createAction('blacklists/reset')
