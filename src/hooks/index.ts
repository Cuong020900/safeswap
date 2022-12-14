/* eslint-disable react-hooks/exhaustive-deps */
import { Web3Provider } from '@ethersproject/providers'
import { ChainId } from '@safemoon/sdk'
import { useWeb3React as useWeb3ReactCore } from '@web3-react/core'
import { Web3ReactContextInterface } from '@web3-react/core/dist/types'
import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { injected, binanceinjected } from '../connectors'
import { NetworkContextName, popupEmitter, PopupTypes } from '../constants'
import { useSelector } from 'react-redux'
import { AppState } from '../state'
import { useGetCurrentAccount, useGetCurrentConnector } from '../state/user/hooks'

export function useActiveWeb3React(): Web3ReactContextInterface<Web3Provider> & { chainId?: ChainId } {
  const context = useWeb3ReactCore<Web3Provider>()
  const contextNetwork = useWeb3ReactCore<Web3Provider>(NetworkContextName)
  // console.log('context', context)
  // console.log('contextNetwork', contextNetwork)
  return context.active ? context : contextNetwork
}

export function useEagerConnect() {
  const { activate, active, account, deactivate, connector } = useWeb3ReactCore() // specifically using useWeb3ReactCore because of what this hook does
  const [tried, setTried] = useState(false)
  const blacklistWallets: string[] = useSelector((state: AppState) => state.blacklists.walletAddresses)
  const [currentAccount, setCurrentAccount] = useGetCurrentAccount()
  const [currentConnector, setCurrentConnector] = useGetCurrentConnector()
  useEffect(() => {
    if (typeof account === 'string' && blacklistWallets) {
      // console.log('blacklistWallets ===>', blacklistWallets)
      // console.log('account ===>', account)
      const isBadAccount = blacklistWallets?.includes(account?.toLowerCase())
      if (isBadAccount) {
        popupEmitter.emit(PopupTypes.BLACKLIST_WALLET)
        deactivate()
      }
    }
  }, [account, blacklistWallets, deactivate])

  useEffect(() => {
    if (connector === binanceinjected) {
      setCurrentConnector('BINANCE')
    } else {
      setCurrentConnector('')
    }
  }, [connector])

  useEffect(() => {
    if (account) {
      setCurrentAccount(account)
    } else {
      setCurrentAccount('')
    }
  }, [account, setCurrentAccount])

  useEffect(() => {
    injected.isAuthorized().then(isAuthorized => {
      if (isAuthorized && currentAccount && currentConnector !== 'BINANCE') {
        activate(injected, undefined, true).catch(() => {
          setTried(true)
        })
      } else {
        if (isMobile && window.ethereum) {
          activate(injected, undefined, true).catch(() => {
            setTried(true)
          })
        } else {
          setTried(true)
        }
      }
    })
  }, []) // intentionally only running on mount (make sure it's only mounted once :))

  useEffect(() => {
    if (currentConnector === 'BINANCE') {
      binanceinjected.isAuthorized().then(isAuthorized => {
        if (isAuthorized && currentAccount && currentConnector === 'BINANCE') {
          activate(binanceinjected, undefined, true).catch(() => {
            setTried(true)
          })
        } else {
          if (isMobile && window.BinanceChain) {
            activate(binanceinjected, undefined, true).catch(() => {
              setTried(true)
            })
          } else {
            setTried(true)
          }
        }
      })
    }
  }, [currentConnector]) // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (active && !tried) {
      setTried(true)
    }
  }, [active, tried])

  return tried
}

/**
 * Use for network and injected - logs user in
 * and out after checking what network theyre on
 */
export function useInactiveListener(suppress = false) {
  const { active, error, activate, deactivate } = useWeb3ReactCore() // specifically using useWeb3React because of what this hook does
  const blacklistWallets: string[] = useSelector((state: AppState) => state.blacklists.walletAddresses)

  useEffect(() => {
    const { ethereum } = window

    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleChainChanged = () => {
        // eat errors
        activate(injected, undefined, true).catch(error => {
        })
      }

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          const badAccountIndex = accounts.findIndex(account => {
            return blacklistWallets && blacklistWallets?.includes(account?.toLowerCase())
          })

          if (badAccountIndex > -1) {
            popupEmitter.emit(PopupTypes.BLACKLIST_WALLET)
            deactivate()
          } else {
            // eat errors
            activate(injected, undefined, true).catch(error => {
              console.error('Failed to activate after accounts changed', error)
            })
          }
        }
      }

      ethereum.on('chainChanged', handleChainChanged)
      ethereum.on('accountsChanged', handleAccountsChanged)

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('chainChanged', handleChainChanged)
          ethereum.removeListener('accountsChanged', handleAccountsChanged)
        }
      }
    }
    return
  }, [active, error, suppress, activate, blacklistWallets, deactivate])
}
