/* eslint-disable */
import React from 'react'
import Modal from 'react-modal'
import closeIcon from '../../../assets/images/close.svg'
import './ConsolidateV2Intro.css'

interface Props {
  show: boolean
  handleClose: any
  handleConvertV1ToV2: any
}

const ConsolidateV2Intro = ({ show, handleClose, handleConvertV1ToV2 }: Props) => {
  return (
    <Modal isOpen={show} onRequestClose={handleClose} className="Modal">
      <a
        className={'btn-close'}
        onClick={() => {
          handleClose()
        }}
      >
        <img className={'close-icon'} src={closeIcon} alt="closeIcon" />
      </a>
      <div className="consolidate-intro">
        <h2 className="consolidate-intro-title">Consolidate your V1 SafeMoon to V2 SafeMoon!</h2>
        <p className="consolidate-intro-description">
          We detected you have a balance of V1 SafeMoon. However, we have recently upgraded our contract to V2.
          Conversion to V2 will be required to hold the proper SafeMoon in order to obtain value from our ecosystem and
          smart contract moving forward.
        </p>
        <h3 className="consolidate-intro-heading">What is V2 SafeMoon? ❗️❓</h3>
        <p className="consolidate-intro-text">
          Simply put, SafeMoon V2 is version 2 of the SafeMoon Smart Contract. We have improved the flexibility,
          security and accessibility of the traditional SafeMoon token by adding mechanisms that allow SafeMoon to be
          more widely utilized within our ecosystem and future partners. This upgrade will allow SafeMoon to be more
          scalable and interoperable within the cryptocurrency landscape.
        </p>
        <p className="consolidate-intro-note">
          <b>Note:</b> There is NO cost of SafeMoon to convert. Your full amount of SafeMoon V2 will be equal in value
          to your initial V1 SafeMoon after conversion.
        </p>
        <h3 className="consolidate-intro-heading">What will I need to do? 🤔</h3>
        <p className="consolidate-intro-text">
          <b>Step 1:</b> Ensure you have enough BNB in your wallet set aside for the &ldquo;gas fee&ldquo;: Typically
          just a few dollars should be enough. You will first need to approve the new contract for trade, and then &ldquo;Swap&ldquo; your V1 SafeMoon to V2 SafeMoon. Unfortunately, this is a blockchain cost we do not control as token developers.
          <br /> <br />
          <b>Step 2 (optional):</b> Click the <b>&ldquo;Consolidate Now&ldquo;</b> button then add a small amount of V1
          SafeMoon to &ldquo;Swap&ldquo; for V2 SafeMoon as a test transaction.
          <br /> <br />
          <b>Step 3:</b> After you are comfortable, you can now swap all of your V1 SafeMoon for V2 SafeMoon by clicking
          <b>&ldquo;Max&ldquo;</b> on the swap. This will fill in the max amount of V1 SafeMoon you have in your balance
          to &ldquo;swap&ldquo; for the upgraded V2 SafeMoon. Then just click <b>&ldquo;Swap&ldquo;</b> to initiate the
          transaction.
        </p>
        <h3 className="consolidate-intro-heading">You&apos;re all set</h3>
        <p className="consolidate-intro-text">
          Once the swap transaction is confirmed on the blockchain, your upgraded V2 tokens will appear in your wallet
          as the new V2 SafeMoon token in your <b>&ldquo;My Tokens&ldquo;</b> section of the app.
        </p>
        <h3 className="consolidate-intro-heading">Get started!</h3>

        <a
          className="btn"
          onClick={() => {
            handleConvertV1ToV2()
            handleClose()
          }}
        >
          Consolidate now
        </a>
      </div>
    </Modal>
  )
}

export default ConsolidateV2Intro
