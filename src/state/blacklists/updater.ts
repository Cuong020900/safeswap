import { useBlacklistFetcher, useBlacklistManager } from './hooks'
import { useCallback, useEffect } from 'react'

export default function Updater() {
  const blacklistUpdater = useBlacklistManager()
  const blacklistFetcher = useBlacklistFetcher()

  const updateBlacklist = useCallback(async () => {
    const promises = []
    promises.push(blacklistFetcher('token'))
    promises.push(blacklistFetcher('wallet'))

    const blacklists = await Promise.all(promises)

    blacklistUpdater(
      {
        walletAddresses: blacklists[0]
      },
      'token'
    )
    blacklistUpdater(
      {
        tokenAddresses: blacklists[1]
      },
      'wallet'
    )
  }, [blacklistFetcher, blacklistUpdater])

  useEffect(() => {
    updateBlacklist()
  }, [blacklistFetcher, blacklistUpdater, updateBlacklist])

  return null
}
