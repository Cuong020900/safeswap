import { ChainId } from '@safemoon/sdk'
import React from 'react'
import { isMobile } from 'react-device-detect'
import { Text } from 'rebass'

import styled from 'styled-components'

import Logo from '../../assets/images/SafeMoon-Logo.png';
import LogoType from '../../assets/images/SafeMoonSwap-LogoType.svg';
import { useActiveWeb3React } from '../../hooks'

import Settings from '../Settings'

import { RowBetween } from '../Row'
import Web3Status from '../Web3Status'

const HeaderFrame = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  width: 100%;
  top: 0;
  position: absolute;
  z-index: 3;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 12px 0 0 0;
    width: calc(100%);
    position: relative;
  `};
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;
`

const HeaderElementWrap = styled.div`
  display: flex;
  align-items: center;

`

const Title = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;

  :hover {
    cursor: pointer;
  }
`

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.bg1};
  border-radius: 12px;
  white-space: nowrap;
  width: 100%;
  height: 40px;

  :focus {
    border: 1px solid blue;
  }
`


const NetworkCard = styled.div`
  color: ${({ theme }) => theme.text1};
  width: fit-content;
  padding-left: 14px;
  position: relative;
  font-weight: 400;
  
  &::before {
    content: "";
    width: 6px;
    height: 6px;
    background-color: ${({ theme }) => theme.primary1};
    position: absolute;
    left: 0;
    top: calc(50% - 2px);
    border-radius: 50%;
  }
`

const SafeMoonIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

`

const NetworkStatus = styled(Text)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

const SafeMoonLogo = styled.img`
  width: 40px;
  height: 40px;
  margin-right: 12px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-right: 0;
  `}

`

const SafeMoonType = styled.img`
  width: 116px;
  height: 34px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `}
`

const StyledRowBetween = styled(RowBetween)`
  padding: 1.5rem 5rem 0 5rem;
  
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem 1rem 0 1rem;
  `} 
`

const NETWORK_LABELS: { [chainId in ChainId]: string | null } = {
  [ChainId.MAINNET]: 'Wrong Network',
  [ChainId.RINKEBY]: 'Wrong Network',
  [ChainId.ROPSTEN]: 'Wrong Network',
  [ChainId.GÖRLI]: 'Wrong Network',
  [ChainId.KOVAN]: 'Wrong Network',
  [ChainId.BSC_MAINNET]: null,
  [ChainId.BSC_TESTNET]: 'Testnet'
}

export default function Header() {
  const { account, chainId } = useActiveWeb3React()

  return (
    <HeaderFrame>
      <StyledRowBetween style={{ alignItems: 'flex-start'}}>
        <HeaderElement>
          <Title href=".">
            <SafeMoonIcon>
              <SafeMoonLogo src={Logo} alt="SafeMoon" />
              <SafeMoonType src={LogoType} alt="SafeMoon" />
            </SafeMoonIcon>
          </Title>
        </HeaderElement>
        <HeaderControls>
          <HeaderElement>
            <AccountElement active={!!account} style={{ pointerEvents: 'auto' }}>
              <NetworkStatus style={{ flexShrink: 0 }} pl="1.25rem" pr="1rem" fontWeight={500}>
                {!isMobile && NETWORK_LABELS[chainId] && <NetworkCard>{NETWORK_LABELS[chainId]}</NetworkCard>}
              </NetworkStatus>
              <Web3Status />
            </AccountElement>
          </HeaderElement>
          <HeaderElementWrap>
            <Settings />
          </HeaderElementWrap>
        </HeaderControls>
      </StyledRowBetween>
    </HeaderFrame>
  )
}
