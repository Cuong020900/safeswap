import { createReducer } from '@reduxjs/toolkit'
import { resetBlackList, updateTokenBlackList, updateWalletBlackList } from './actions'

interface BlacklistsState {
  walletAddresses: string[]
  tokenAddresses: string[]
}

const initialState: BlacklistsState = {
  walletAddresses: [],
  tokenAddresses: []
}

export default createReducer(initialState, builder =>
  builder
    .addCase(updateWalletBlackList, (state, action) => {
      state.walletAddresses = action.payload.walletAddresses
    })
    .addCase(updateTokenBlackList, (state, action) => {
      state.tokenAddresses = action.payload.tokenAddresses
    })
    .addCase(resetBlackList, state => {
      state.tokenAddresses = []
      state.walletAddresses = []
    })
)
