import { useActiveWeb3React } from './index'
import { useMigrationContract, useSafemoonV2Contract } from './useContract'
import { useCallback, useEffect, useState } from 'react'

export enum MigrationStatus {
  NOT_STARTED,
  LOCKED,
  IN_PROGRESS
}

export default function useMigrationStatus(): {
  status: MigrationStatus
  error?: string
} {
  const [status, setStatus] = useState<MigrationStatus>(MigrationStatus.NOT_STARTED)
  const [error, setError] = useState('')
  const { chainId } = useActiveWeb3React()
  const safemoonContract = useSafemoonV2Contract()
  const migrationContract = useMigrationContract()

  const updateMigrationStatus = useCallback(async () => {
    let isStarted: boolean, isLocked: boolean
    try {
      isStarted = await safemoonContract?.isMigrationStarted()
    } catch (e) {
      isStarted = false
    }

    try {
      isLocked = await migrationContract?.isLocked()
    } catch (e) {
      isLocked = true
    }

    if (isLocked) {
      setStatus(MigrationStatus.LOCKED)
      setError('Migration is over or locked')
    } else if (!isStarted) {
      setStatus(MigrationStatus.NOT_STARTED)
      setError('Migration is not started yet')
    } else {
      setStatus(MigrationStatus.IN_PROGRESS)
      setError('')
    }
  }, [safemoonContract, migrationContract])

  useEffect(() => {
    updateMigrationStatus()
  }, [chainId, safemoonContract, migrationContract, updateMigrationStatus])

  return { status, error }
}
