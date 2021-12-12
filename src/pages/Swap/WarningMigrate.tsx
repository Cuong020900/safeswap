import React from 'react'
import { ChainId } from '@safemoon/sdk'
import checkIcon from '../../assets/images/check.svg'
import checkedIcon from '../../assets/images/checked.svg'
import closeIcon from '../../assets/images/close-btn.png'
import Copy from './Copy'
import { consolidation } from '../../constants'

interface Props {
  setShowMigrateWarning: React.Dispatch<React.SetStateAction<boolean>>
  readed: boolean
  setReaded: React.Dispatch<React.SetStateAction<boolean>>
  onMigrate: (() => Promise<void>) | undefined
  chainId: number | undefined
}

const WarningMigrate = ({ setShowMigrateWarning, readed, setReaded, onMigrate, chainId }: Props) => {
  return (
    <div className={'warning-swap'}>
      <a
	href='#/'
        className="btn-close-swap"
        onClick={() => {
          setShowMigrateWarning(false)
        }}
      >
        <img src={closeIcon} className="close-icon-swap" alt='close' />
      </a>
      <h3 className={'warning-swap-title'}>Important!</h3>
      <p className={'warning-swap-text'}>
        Please note that after your SafeMoon has been consolidated into V2 SafeMoon, it will not show a price for a
        period of time.
      </p>
      <h3 className={'warning-swap-title'}>Do not panic.</h3>
      <p className={'warning-swap-text'}>
        This is normal. Once a sizable amount of holders begin migrating, the market cap will eventually find a stable
        price and then it will be displayed. Please be patient during this time.
      </p>
      <p className={'warning-swap-text'}>SafeMoon V2 (SFM) contract:</p>

      <div className={'link-wrapper'}>
        <Copy toCopy={consolidation.addresses.v2[chainId as ChainId]}>
          <span className="address-token">{consolidation.addresses.v2[chainId as ChainId]}</span>
        </Copy>
      </div>

      <div
        className={'checkbox'}
        onClick={() => {
          setReaded((prev: boolean) => !prev)
        }}
      >
        <img src={readed ? checkedIcon : checkIcon} className={'checkIcon'} alt="check" />
        <span>I have read and I understand</span>
      </div>

      <a
	href='#/'
        className={`btn ${!readed && 'disabled'}`}
        onClick={() => {
          if (readed && onMigrate) {
            onMigrate()
            setShowMigrateWarning(false)
          }
        }}
      >
        Continue
      </a>
    </div>
  )
}

export default WarningMigrate
