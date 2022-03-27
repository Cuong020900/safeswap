import { getVersionUpgrade, VersionUpgrade } from '@uniswap/token-lists'
import { useEffect } from 'react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { DEFAULT_TOKEN_LIST_URL } from '../../constants'
import { addPopup } from '../application/actions'
import { AppDispatch, AppState } from '../index'
import { acceptListUpdate, addList, fetchTokenList } from './actions'
import { useUpdateListPairs } from './hooks'
import { Token } from '@safemoon/sdk'

export default function Updater(): null {
  const dispatch = useDispatch<AppDispatch>()
  const lists = useSelector<AppState, AppState['lists']['byUrl']>(state => state.lists.byUrl)

  // we should always fetch the default token list, so add it
  useEffect(() => {
    if (!lists[DEFAULT_TOKEN_LIST_URL]) dispatch(addList(DEFAULT_TOKEN_LIST_URL))
  }, [dispatch, lists])

  const { setPairs } = useUpdateListPairs()

  useEffect(() => {
    const getPairs = async () => {
      try {
        const result: any = await axios.get('https://marketdata.safemoon.net/api/pair/v3/list')

        let pairs: any = {}

        result?.data?.data.forEach((item: any) => {
          const pairTokens = [
            new Token(item.chainId, item.token0.contractAddress, item.token0.decimals, item.token0.symbol, item.token0.name),
            new Token(item.chainId, item.token1.contractAddress, item.token1.decimals, item.token1.symbol, item.token1.name)
          ]
          if (pairs[item.chainId]) {
            pairs = {
              ...pairs,
              [item.chainId]: [...pairs[item.chainId], pairTokens]
            }
          } else {
            pairs = {
              ...pairs,
              [item.chainId]: [pairTokens]
            }
          }
        })

        console.log('pairs ====>', pairs)

        setPairs(pairs)
      } catch (e) {
        console.log(e)
      }
    }

    getPairs()
  }, [])

  // on initial mount, refetch all the lists in storage
  useEffect(() => {
    Object.keys(lists).forEach(listUrl => dispatch(fetchTokenList(listUrl) as any))
    // we only do this once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch])

  // whenever a list is not loaded and not loading, try again to load it
  useEffect(() => {
    Object.keys(lists).forEach(listUrl => {
      const list = lists[listUrl]
      if (!list.current && !list.loadingRequestId && !list.error) {
        dispatch(fetchTokenList(listUrl) as any)
      }
    })
  }, [dispatch, lists])

  // automatically update lists if versions are minor/patch
  useEffect(() => {
    Object.keys(lists).forEach(listUrl => {
      const list = lists[listUrl]
      if (list.current && list.pendingUpdate) {
        const bump = getVersionUpgrade(list.current.version, list.pendingUpdate.version)
        switch (bump) {
          case VersionUpgrade.NONE:
            throw new Error('unexpected no version bump')
          case VersionUpgrade.PATCH:
          case VersionUpgrade.MINOR:
          case VersionUpgrade.MAJOR:
            // const min = minVersionBump(list.current.tokens, list.pendingUpdate.tokens)
            // automatically update minor/patch as long as bump matches the min update
            //if (bump >= min) {
            dispatch(acceptListUpdate(listUrl))
            dispatch(
              addPopup({
                key: listUrl,
                content: {
                  listUpdate: {
                    listUrl,
                    oldList: list.current,
                    newList: list.pendingUpdate,
                    auto: true
                  }
                }
              })
            )
            //} else {
            //    `List at url ${listUrl} could not automatically update because the version bump was only PATCH/MINOR while the update had breaking changes and should have been MAJOR`
            //  )
            //}
            break

          // this will be turned on later
          // case VersionUpgrade.MAJOR:
          // dispatch(
          //   addPopup({
          //     key: listUrl,
          //     content: {
          //       listUpdate: {
          //         listUrl,
          //         auto: false,
          //         oldList: list.current,
          //         newList: list.pendingUpdate
          //       }
          //     }
          //   })
          // )
        }
      }
    })
  }, [dispatch, lists])

  return null
}
