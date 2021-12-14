import React, { useState, useEffect } from 'react'
import ReactGA from 'react-ga'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import usePrevious from '../../hooks/usePrevious'
import { useWalletModalOpen, useWalletModalToggle } from '../../state/application/hooks'

import Modal from '../Modal'
import AccountDetails from '../AccountDetails'
import PendingView from './PendingView'
import Option from './Option'
import { appEnv, SUPPORTED_WALLETS } from '../../constants'
import { ExternalLink } from '../../theme'
import MetamaskIcon from '../../assets/images/metamask.png'
import TrustWalletIcon from '../../assets/images/trustwallet.svg'
import MathWalletIcon from '../../assets/images/mathwallet.svg'
import BinanceIcon from '../../assets/images/bnb.svg'
import { ReactComponent as Close } from '../../assets/images/x.svg'
import { injected, binanceinjected, fortmatic, portis } from '../../connectors'
import { OVERLAY_READY } from '../../connectors/Fortmatic'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { useTranslation } from 'react-i18next'
import Row from '../Row'
import SVG from 'react-inlinesvg'
import ArrowLeft from '../../assets/icons/arrow-left-3.svg'
import { AutoColumn } from '../Column'
import { ConnectWalletTabs } from '../NavigationTabs'
// import de from "@walletconnect/qrcode-modal/dist/cjs/browser/languages/de";

const CloseIcon = styled.div`
  position: absolute;
  right: 2rem;
  top: 2rem;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    right: 1rem;
    top: 1rem;
  `};
`

const CloseColor = styled(Close)`
  path {
    stroke: ${({ theme }) => theme.text4};
  }
`

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  margin: 0;
  padding: 0;
  width: 100%;
`

const HeaderRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  padding: 2rem 2rem 0;
  font-weight: 500;
  color: ${props => (props.color === 'blue' ? ({ theme }) => theme.primary1 : 'inherit')};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`

const ContentWrapper = styled.div`
  padding: 2rem;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;

  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 1rem`};
`

const UpperSection = styled.div`
  position: relative;

  h5 {
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 400;
  }

  h5:last-child {
    margin-bottom: 0px;
  }

  h4 {
    margin-top: 0;
    font-weight: 500;
  }
`

const Blurb = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin: 1rem;
    font-size: 12px;
  `};
`

const OptionGrid = styled.div`
  display: grid;
  grid-gap: 16px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    grid-gap: 16px;
  `};
`

const HoverText = styled.div`
  :hover {
    cursor: pointer;
  }
`

const ActiveText = styled.div`
  font-weight: 500;
  font-size: 20px;
  margin-left: 8px;
`

const StyledArrowLeft = styled(SVG).attrs(props => ({
  ...props,
  src: ArrowLeft,
  width: 24,
  height: 24
}))`
  color: ${({ theme }) => theme.primary1};
  width: 24px;
  height: 24px;
`

const HistoryLinkButton = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`

const WALLET_VIEWS = {
  OPTIONS: 'options',
  OPTIONS_SECONDARY: 'options_secondary',
  ACCOUNT: 'account',
  PENDING: 'pending'
}

export const NETWORK_TYPE = {
  ETH: 'ethereum',
  BSC: 'binanceSmartChain'
}

export default function WalletModal({
  pendingTransactions,
  confirmedTransactions,
  ENSName
}: {
  pendingTransactions: string[] // hashes of pending
  confirmedTransactions: string[] // hashes of confirmed
  ENSName?: string
}) {
  // important that these are destructed from the account-specific web3-react context
  const { active, account, connector, activate, error, chainId } = useWeb3React()
  const [selectedNetwork, setSelectedNetwork] = useState(NETWORK_TYPE.BSC)

  const { t } = useTranslation()

  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT)

  const [pendingWallet, setPendingWallet] = useState()

  const [pendingError, setPendingError] = useState<boolean>()

  const walletModalOpen = useWalletModalOpen()
  const toggleWalletModal = useWalletModalToggle()

  const previousAccount = usePrevious(account)

  useEffect(() => {
    if (chainId) {
      if (chainId === 56 || chainId === 97) {
        setSelectedNetwork(NETWORK_TYPE.BSC)
      } else {
        setSelectedNetwork(NETWORK_TYPE.ETH)
      }
    }
  }, [chainId])

  // close on connection, when logged out before
  useEffect(() => {
    if (account && !previousAccount && walletModalOpen) {
      toggleWalletModal()
    }
  }, [account, previousAccount, toggleWalletModal, walletModalOpen])

  // always reset to account view
  useEffect(() => {
    if (walletModalOpen) {
      setPendingError(false)
      setWalletView(WALLET_VIEWS.ACCOUNT)
    }
  }, [walletModalOpen])

  // close modal when a connection is successful
  const activePrevious = usePrevious(active)
  const connectorPrevious = usePrevious(connector)
  useEffect(() => {
    if (walletModalOpen && ((active && !activePrevious) || (connector && connector !== connectorPrevious && !error))) {
      setWalletView(WALLET_VIEWS.ACCOUNT)
    }
  }, [setWalletView, active, error, connector, walletModalOpen, activePrevious, connectorPrevious])

  const tryActivation = async connector => {
    // debugger
    let name = ''
    Object.keys(SUPPORTED_WALLETS).map(key => {
      if (connector === SUPPORTED_WALLETS[key].connector) {
        return (name = SUPPORTED_WALLETS[key].name)
      }
      return true
    })
    // log selected wallet
    ReactGA.event({
      category: 'Wallet',
      action: 'Change Wallet',
      label: name
    })
    setPendingWallet(connector) // set wallet for pending view
    setWalletView(WALLET_VIEWS.PENDING)

    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    if (connector instanceof WalletConnectConnector) {
      connector.walletConnectProvider = undefined
    }

    activate(connector, undefined, true).catch(error => {
      if (error instanceof UnsupportedChainIdError) {
        activate(connector) // a little janky...can't use setError because the connector isn't set
        debugger
      } else {
        setPendingError(true)
      }
    })
  }

  // close wallet modal if fortmatic modal is active
  useEffect(() => {
    fortmatic.on(OVERLAY_READY, () => {
      toggleWalletModal()
    })
  }, [toggleWalletModal])

  // get wallets user can switch too, depending on device/browser
  function getOptions() {
    const isMetamask = window.ethereum && window.ethereum.isMetaMask
    return Object.keys(SUPPORTED_WALLETS).map(key => {
      const option = SUPPORTED_WALLETS[key]

      let isValid = true
      if (selectedNetwork === NETWORK_TYPE.BSC) {
        if (
          (appEnv === 'production' && !option.chainIds.includes(56)) ||
          (appEnv !== 'production' && !option.chainIds.includes(97))
        ) {
          isValid = false
        }
      } else {
        if (
          (appEnv === 'production' && !option.chainIds.includes(1)) ||
          (appEnv !== 'production' && !option.chainIds.includes(3))
        ) {
          isValid = false
        }
      }
      if (!isValid) {
        return null
      }
      // check for mobile options
      if (isMobile) {
        //disable portis on mobile for now
        if (option.connector === portis) {
          return null
        }

        if (!window.web3 && !window.ethereum && !window.BinanceChain && option.mobile) {
          return (
            <Option
              onClick={() => {
                option.connector !== connector && !option.href && tryActivation(option.connector)
              }}
              id={`connect-${key}`}
              key={key}
              active={option.connector && option.connector === connector}
              color={option.color}
              link={option.href}
              header={option.name}
              subheader={null}
              icon={require('../../assets/images/' + option.iconName)}
            />
          )
        }
        return null
      }

      // overwrite injected when needed
      if (option.connector === injected) {
        // don't show injected if there's no injected provider
        if (!(window.web3 || window.ethereum)) {
          if (option.name === 'MetaMask') {
            return (
              <Option
                id={`connect-${key}`}
                key={key}
                color={'#E8831D'}
                header={'Install Metamask'}
                subheader={null}
                link={'https://metamask.io/'}
                icon={MetamaskIcon}
              />
            )
          } else if (option.name === 'TrustWallet') {
            return (
              <Option
                id={`connect-${key}`}
                key={key}
                color={'#3375BB'}
                header={'Download TrustWallet App'}
                subheader={null}
                link={'https://trustwallet.com/'}
                icon={TrustWalletIcon}
              />
            )
          } else if (option.name === 'MathWallet') {
            return (
              <Option
                id={`connect-${key}`}
                key={key}
                color={'#000000'}
                header={'Get MathWallet App'}
                subheader={null}
                link={'https://mathwallet.org/'}
                icon={MathWalletIcon}
              />
            )
          } else {
            return null //dont want to return install twice
          }
        }
        // don't return metamask if injected provider isn't metamask
        else if (option.name === 'MetaMask' && !isMetamask) {
          return null
        }
        // likewise for generic
        else if (option.name === 'Injected' && isMetamask) {
          return null
        }
      }

      // overwrite injected when needed
      if (option.connector === binanceinjected) {
        // don't show injected if there's no injected provider
        if (!(window.web3 || window.BinanceChain)) {
          if (option.name === 'Binance Chain Wallet') {
            return (
              <Option
                id={`connect-${key}`}
                key={key}
                color={'#F9A825'}
                header={'Install Binance Chain Wallet'}
                subheader={null}
                link={'https://docs.binance.org/smart-chain/wallet/binance.html'}
                icon={BinanceIcon}
              />
            )
          } else {
            return null //dont want to return install twice
          }
        }
      }

      // return rest of options
      return (
        !isMobile &&
        !option.mobileOnly && (
          <Option
            id={`connect-${key}`}
            onClick={() => {
              if(option.connector === connector) {
                setWalletView(WALLET_VIEWS.ACCOUNT)
              } else {
                !option.href && tryActivation(option.connector)
              }
            }}
            key={key}
            active={option.connector === connector}
            color={option.color}
            link={option.href}
            header={option.name}
            subheader={null} //use option.descriptio to bring back multi-line
            icon={require('../../assets/images/' + option.iconName)}
          />
        )
      )
    })
  }

  function getModalContent() {
    if (error) {
      return (
        <UpperSection>
          <CloseIcon onClick={toggleWalletModal}>
            <CloseColor />
          </CloseIcon>
          <HeaderRow>{error instanceof UnsupportedChainIdError ? 'Wrong Network' : 'Error connecting'}</HeaderRow>
          <ContentWrapper>
            {error instanceof UnsupportedChainIdError ? (
              <h5>Please connect to the appropriate Ethereum network.</h5>
            ) : (
              'Error connecting. Try refreshing the page.'
            )}
          </ContentWrapper>
        </UpperSection>
      )
    }
    if (account && walletView === WALLET_VIEWS.ACCOUNT) {
      return (
        <AccountDetails
          toggleWalletModal={toggleWalletModal}
          pendingTransactions={pendingTransactions}
          confirmedTransactions={confirmedTransactions}
          ENSName={ENSName}
          openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)}
        />
      )
    }
    return (
      <UpperSection>
        <CloseIcon onClick={toggleWalletModal}>
          <CloseColor />
        </CloseIcon>
        {walletView !== WALLET_VIEWS.ACCOUNT ? (
          <HeaderRow color="blue">
            <Row align={'center'}>
              <HistoryLinkButton
                  onClick={() => {
                    setPendingError(false)
                    setWalletView(WALLET_VIEWS.ACCOUNT)
                  }}
              >
                <StyledArrowLeft />
              </HistoryLinkButton>
              <ActiveText>Back</ActiveText>
            </Row>
          </HeaderRow>
        ) : (
          <HeaderRow>
            <HoverText>{t('connectToWallet')}</HoverText>
          </HeaderRow>
        )}
        <ContentWrapper>
          {walletView === WALLET_VIEWS.PENDING ? (
            <PendingView
              connector={pendingWallet}
              error={pendingError}
              setPendingError={setPendingError}
              tryActivation={tryActivation}
            />
          ) : (
            <AutoColumn gap={'sm'}>
              <ConnectWalletTabs active={selectedNetwork} onChangeProviders={(newNetwork) => {setSelectedNetwork(newNetwork)}}/>
              <OptionGrid>{getOptions()}</OptionGrid>
            </AutoColumn>
          )}
          {walletView !== WALLET_VIEWS.PENDING && (
            <Blurb>
              <span>New to Binance Smart Chain? &nbsp;</span>{' '}
              <ExternalLink href="https://docs.binance.org/smart-chain/wallet/metamask.html">Learn more about wallets</ExternalLink>
            </Blurb>
          )}
        </ContentWrapper>
      </UpperSection>
    )
  }

  return (
    <Modal isOpen={walletModalOpen} onDismiss={toggleWalletModal} minHeight={null} maxHeight={90}>
      <Wrapper>{getModalContent()}</Wrapper>
    </Modal>
  )
}
