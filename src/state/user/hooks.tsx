import { ChainId, Currency, Pair, Token } from '@safemoon/sdk'
import flatMap from 'lodash.flatmap'
import { useCallback, useMemo } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { BASES_TO_TRACK_LIQUIDITY_FOR, PINNED_PAIRS, popupEmitter, PopupTypes } from '../../constants'

import { useActiveWeb3React } from '../../hooks'
import { useAllTokens } from '../../hooks/Tokens'
import { AppDispatch, AppState } from '../index'
import {
  addSerializedPair,
  addSerializedToken,
  dismissTokenWarning,
  removeSerializedToken,
  SerializedPair,
  SerializedToken,
  updateGasPrice,
  updateUserDarkMode,
  updateUserDeadline,
  updateUserExpertMode,
  updateUserSlippageTolerance,
  hideShowSlippageWarning,
  setCurrentAccount,
  setCurrentConnector
} from './actions'
import { useDefaultTokenList } from '../lists/hooks'
import { isDefaultToken } from '../../utils'
import { parseUnits } from 'ethers/lib/utils'

function serializeToken(token: Token): SerializedToken {
  return {
    chainId: token.chainId,
    address: token.address,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name
  }
}

function deserializeToken(serializedToken: SerializedToken): Token {
  return new Token(
    serializedToken.chainId,
    serializedToken.address,
    serializedToken.decimals,
    serializedToken.symbol,
    serializedToken.name
  )
}

export enum GAS_PRICE {
  default = '5',
  fast = '6',
  instant = '7',
  testnet = '10'
}

export const GAS_PRICE_GWEI = {
  default: parseUnits(GAS_PRICE.default, 'gwei').toString(),
  fast: parseUnits(GAS_PRICE.fast, 'gwei').toString(),
  instant: parseUnits(GAS_PRICE.instant, 'gwei').toString(),
  testnet: parseUnits(GAS_PRICE.testnet, 'gwei').toString()
}

export function useIsDarkMode(): boolean {
  const { userDarkMode, matchesDarkMode } = useSelector<
    AppState,
    { userDarkMode: boolean | null; matchesDarkMode: boolean }
  >(
    ({ user: { matchesDarkMode, userDarkMode } }) => ({
      userDarkMode,
      matchesDarkMode
    }),
    shallowEqual
  )

  return userDarkMode === null ? matchesDarkMode : userDarkMode
}

export function useDarkModeManager(): [boolean, () => void] {
  const dispatch = useDispatch<AppDispatch>()
  const darkMode = useIsDarkMode()

  const toggleSetDarkMode = useCallback(() => {
    dispatch(updateUserDarkMode({ userDarkMode: !darkMode }))
  }, [darkMode, dispatch])

  return [darkMode, toggleSetDarkMode]
}

export function useIsExpertMode(): boolean {
  return useSelector<AppState, AppState['user']['userExpertMode']>(state => state.user.userExpertMode)
}

export function useExpertModeManager(): [boolean, () => void] {
  const dispatch = useDispatch<AppDispatch>()
  const expertMode = useIsExpertMode()

  const toggleSetExpertMode = useCallback(() => {
    dispatch(updateUserExpertMode({ userExpertMode: !expertMode }))
  }, [expertMode, dispatch])

  return [expertMode, toggleSetExpertMode]
}

export function useUserSlippageTolerance(): [number, (slippage: number) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const userSlippageTolerance = useSelector<AppState, AppState['user']['userSlippageTolerance']>(state => {
    return state.user.userSlippageTolerance
  })

  const setUserSlippageTolerance = useCallback(
    (userSlippageTolerance: number) => {
      dispatch(updateUserSlippageTolerance({ userSlippageTolerance }))
    },
    [dispatch]
  )

  return [userSlippageTolerance, setUserSlippageTolerance]
}

export function useHideSlippageWarning(): [boolean | undefined, () => void] {
  const dispatch = useDispatch<AppDispatch>()
  const hideSlippageWarning = useSelector<AppState, AppState['user']['hideSlippageWarning']>(state => {
    return state.user.hideSlippageWarning
  })

  const handleHideSlippageWarning = useCallback(() => {
    dispatch(hideShowSlippageWarning())
  }, [dispatch])

  return [hideSlippageWarning, handleHideSlippageWarning]
}

export function useGetCurrentAccount(): [string, (account: string) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const currentAccount = useSelector<AppState, AppState['user']['currentAccount']>(state => {
    return state.user.currentAccount
  })

  const handleSetCurrentAccount = useCallback(
    (account: string) => {
      dispatch(setCurrentAccount({ currentAccount: account }))
    },
    [dispatch]
  )

  return [currentAccount, handleSetCurrentAccount]
}

export function useGetCurrentConnector(): [string, (connector: string) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const currentConnector = useSelector<AppState, AppState['user']['currentConnector']>(state => {
    return state.user.currentConnector
  })

  const handleSetCurrentConnector = useCallback(
    (connector: string) => {
      dispatch(setCurrentConnector({ currentConnector: connector }))
    },
    [dispatch]
  )

  return [currentConnector, handleSetCurrentConnector]
}

export function useUserDeadline(): [number, (slippage: number) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const userDeadline = useSelector<AppState, AppState['user']['userDeadline']>(state => {
    return state.user.userDeadline
  })

  const setUserDeadline = useCallback(
    (userDeadline: number) => {
      dispatch(updateUserDeadline({ userDeadline }))
    },
    [dispatch]
  )

  return [userDeadline, setUserDeadline]
}

export function useAddUserToken(): (token: Token) => void {
  const dispatch = useDispatch<AppDispatch>()
  const blacklistTokens: string[] = useSelector((state: AppState) => state.blacklists.tokenAddresses)

  return useCallback(
    (token: Token) => {
      const isBadToken = blacklistTokens?.includes(token.address)
      if (isBadToken) {
        popupEmitter.emit(PopupTypes.BLACKLIST_TOKEN)
      } else {
        dispatch(addSerializedToken({ serializedToken: serializeToken(token) }))
      }
    },
    [dispatch, blacklistTokens]
  )
}

export function useRemoveUserAddedToken(): (chainId: number, address: string) => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (chainId: number, address: string) => {
      dispatch(removeSerializedToken({ chainId, address }))
    },
    [dispatch]
  )
}

export function useUserAddedTokens(): Token[] {
  const { chainId } = useActiveWeb3React()
  const serializedTokensMap = useSelector<AppState, AppState['user']['tokens']>(({ user: { tokens } }) => tokens)

  return useMemo(() => {
    if (!chainId) return []
    return Object.values(serializedTokensMap?.[chainId as ChainId] ?? {}).map(deserializeToken)
  }, [serializedTokensMap, chainId])
}

function serializePair(pair: Pair): SerializedPair {
  return {
    token0: serializeToken(pair.token0),
    token1: serializeToken(pair.token1)
  }
}

export function usePairAdder(): (pair: Pair) => void {
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(
    (pair: Pair) => {
      dispatch(addSerializedPair({ serializedPair: serializePair(pair) }))
    },
    [dispatch]
  )
}

/**
 * Returns whether a token warning has been dismissed and a callback to dismiss it,
 * iff it has not already been dismissed and is a valid token.
 */
export function useTokenWarningDismissal(chainId?: number, token?: Currency): [boolean, null | (() => void)] {
  const dismissalState = useSelector<AppState, AppState['user']['dismissedTokenWarnings']>(
    state => state.user.dismissedTokenWarnings
  )

  const dispatch = useDispatch<AppDispatch>()

  // get default list, mark as dismissed if on list
  const defaultList = useDefaultTokenList()
  const isDefault = isDefaultToken(defaultList, token)

  return useMemo(() => {
    if (!chainId || !token) return [false, null]

    const dismissed: boolean =
      token instanceof Token ? dismissalState?.[chainId]?.[token.address] === true || isDefault : true

    const callback =
      dismissed || !(token instanceof Token)
        ? null
        : () => dispatch(dismissTokenWarning({ chainId, tokenAddress: token.address }))

    return [dismissed, callback]
  }, [chainId, token, dismissalState, isDefault, dispatch])
}

/**
 * Given two tokens return the liquidity token that represents its liquidity shares
 * @param tokenA one of the two tokens
 * @param tokenB the other token
 */
export function toV2LiquidityToken([tokenA, tokenB]: [Token, Token]): Token {
  return new Token(tokenA.chainId, Pair.getAddress(tokenA, tokenB, tokenA.chainId), 18, 'SFS-LP', 'Safeswap LPs')
}

/**
 * Returns all the pairs of tokens that are tracked by the user for the current chain ID.
 */
export function useTrackedTokenPairs(): [Token, Token][] {
  const { chainId } = useActiveWeb3React()
  const tokens = useAllTokens()

  // pinned pairs
  const pinnedPairs = useMemo(() => (chainId ? PINNED_PAIRS[chainId] ?? [] : []), [chainId])

  // pairs for every token against every base
  const generatedPairs: [Token, Token][] = useMemo(
    () =>
      chainId
        ? flatMap(Object.keys(tokens), tokenAddress => {
            const token = tokens[tokenAddress]
            // for each token on the current chain,
            return (
              // loop though all bases on the current chain
              (BASES_TO_TRACK_LIQUIDITY_FOR[chainId] ?? [])
                // to construct pairs of the given token with each base
                .map(base => {
                  if (base.address === token.address) {
                    return null
                  } else {
                    return [base, token]
                  }
                })
                .filter((p): p is [Token, Token] => p !== null)
            )
          })
        : [],
    [tokens, chainId]
  )

  // pairs saved by users
  const savedSerializedPairs = useSelector<AppState, AppState['user']['pairs']>(({ user: { pairs } }) => pairs)

  const userPairs: [Token, Token][] = useMemo(() => {
    if (!chainId || !savedSerializedPairs) return []
    const forChain = savedSerializedPairs[chainId]
    if (!forChain) return []

    return Object.keys(forChain).map(pairId => {
      return [deserializeToken(forChain[pairId].token0), deserializeToken(forChain[pairId].token1)]
    })
  }, [savedSerializedPairs, chainId])

  const combinedList = useMemo(() => userPairs.concat(generatedPairs).concat(pinnedPairs), [
    generatedPairs,
    pinnedPairs,
    userPairs
  ])

  return useMemo(() => {
    // dedupes pairs of tokens in the combined list
    const keyed = combinedList.reduce<{ [key: string]: [Token, Token] }>((memo, [tokenA, tokenB]) => {
      const sorted = tokenA.sortsBefore(tokenB)
      const key = sorted ? `${tokenA.address}:${tokenB.address}` : `${tokenB.address}:${tokenA.address}`
      if (memo[key]) return memo
      memo[key] = sorted ? [tokenA, tokenB] : [tokenB, tokenA]
      return memo
    }, {})

    return Object.keys(keyed).map(key => keyed[key])
  }, [combinedList])
}

export function useGasPrice(): string {
  const { chainId } = useActiveWeb3React()
  const userGas = useSelector<AppState, AppState['user']['gasPrice']>(state => state.user.gasPrice)
  return chainId === ChainId.BSC_TESTNET ? GAS_PRICE_GWEI.testnet : userGas
}

export function useGasPrices(): any {
  const { chainId } = useActiveWeb3React()
  const gasPrices = useSelector<AppState, AppState['user']['gasPrices']>(
    state => state.user.gasPrices?.[chainId || ChainId.MAINNET] || state.user.gasPrices?.[ChainId.MAINNET]
  )

  return gasPrices || GAS_PRICE_GWEI
}
export function useGasType(): any {
  const gasPrices = useSelector<AppState, AppState['user']['gasPrices']>(state => state.user.gasPriceType)

  return gasPrices || 'default'
}

export function useGasPriceManager(): [string, (userGasPrice: string, gasPriceType: string) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const userGasPrice = useGasPrice()

  const setGasPrice = useCallback(
    (gasPrice: string, gasPriceType = 'default') => {
      dispatch(updateGasPrice({ gasPrice, gasPriceType: gasPriceType }))
    },
    [dispatch]
  )

  return [userGasPrice, setGasPrice]
}
