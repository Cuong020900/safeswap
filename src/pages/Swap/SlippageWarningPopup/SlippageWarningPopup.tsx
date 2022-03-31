/* eslint-disable */
import React from 'react'
import Modal from 'react-modal'
import closeIcon from '../../../assets/images/close.svg'
import './SlippageWarningPopup.css'

interface Props {
  show: boolean
  handleClose: any,
  handleHideSlippageWarning: any,
  slippage: number
}

const SlippageWarningPopup = ({ show, handleClose, handleHideSlippageWarning, slippage }: Props) => {
  return (
    <Modal isOpen={show} onRequestClose={handleClose} className="ModalSlippage" ariaHideApp={false}>
      <a
        className={'btn-close'}
        onClick={() => {
          handleClose()
        }}
      >
        <img className={'close-icon'} src={closeIcon} alt="closeIcon" />
      </a>
      <div className="slippage-warning">
        <h2 className="slippage-warning-title">Slippage settings have been updated!</h2>
        <p className="slippage-warning-description">
          We detected you added a token that requires a specific "slippage" in order to swap successfully, so we have automatically updated your settings for you.
        </p>
        <h3 className="slippage-warning-heading">Swap slippage auto-set. &#x1F447;</h3>
        <p className="slippage-warning-text">
          This token is unique, so we have automatically set the proper slippage for this swap contract as recommended by the development team.
        </p>
        <p className="slippage-warning-note">
          <b>Note:</b> You can always edit this setting at your own discretion by clicking the "slippage" settings button.
        </p>
        <div className={'center'}>
          <div className={'slippage-value'}>
            {slippage / 100}%
          </div>
        </div>
        
        <h3 className="slippage-warning-heading">What is slippage? &#x1f914;</h3>
        <p className="slippage-warning-text">
          The higher the slippage, the higher the chance that your transaction will succeed. However, a higher slippage may give you a less favorable price.
          <br /> <br />
          Many tokens have unique and diverse tokenomics built into their contracts. This means slippage will fluctuate based on the token transaction mechanisms that are executed when a "swap" takes place.
        </p>
        <div className='action-center'>
          <a
            className="btn"
            onClick={() => {
              handleClose()
            }}
          >
            Ok, got it!
          </a>
        </div>
       
        <a className={'btn-link'}
          onClick={() => {
            handleHideSlippageWarning()
            handleClose()
          }}
        >
          Don't show me again
        </a>
      </div>
    </Modal>
  )
}

export default SlippageWarningPopup
