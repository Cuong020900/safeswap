import { useDispatch, useSelector } from 'react-redux'
import { AppState } from '../index'
import { useMemo, useCallback } from 'react'
import axios from 'axios'
import { updateTokenBlackList, updateWalletBlackList } from './actions'
import { DEFAULT_TOKEN_BLACK_LIST, DEFAULT_WALLET_BLACK_LIST_URL } from '../../constants'

interface BlacklistItem {
  _id: string
  walletAddress?: string
  tokenContractAddress?: string
  blocker?: any
  updatedAt?: string
  createdAt?: string
  blockReason?: string
  __v?: number
}

export const useWalletBlacklist = () => {
  const blacklistedWallets = useSelector((state: AppState) => state.blacklists.walletAddresses)

  return useMemo(() => {
    return blacklistedWallets
  }, [blacklistedWallets])
}

export const useTokenBlacklist = () => {
  const blacklistedTokens = useSelector((state: AppState) => state.blacklists.tokenAddresses)

  return useMemo(() => {
    return blacklistedTokens
  }, [blacklistedTokens])
}

export const useBlacklistManager = () => {
  const dispatch = useDispatch()
  return useCallback(
    (data, type = 'token') => {
      if (type === 'token') {
        dispatch(updateTokenBlackList(data))
      } else {
        dispatch(updateWalletBlackList(data))
      }
    },
    [dispatch]
  )
}

export const useBlacklistFetcher = () => {
  return useCallback(async (type = 'token') => {
    const baseURL = type === 'token' ? DEFAULT_TOKEN_BLACK_LIST : DEFAULT_WALLET_BLACK_LIST_URL
    try {
      const response = await axios.get(baseURL)
      if (Array.isArray(response?.data?.data)) {
        return response?.data?.data.map((blacklistItem: BlacklistItem) =>
          type === 'token' ? blacklistItem?.tokenContractAddress : blacklistItem?.walletAddress
        )
      }
      return []
    } catch (e) {
      console.log(e)
      return []
    }
  }, [])
}
