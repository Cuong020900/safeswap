import React from 'react'
import styled from 'styled-components'
import { darken } from 'polished'
import { useTranslation } from 'react-i18next'
import { NavLink, Link } from 'react-router-dom'
import SVG from 'react-inlinesvg'

import ArrowLeft from '../../assets/icons/arrow-left-3.svg'
import Row, { RowBetween } from '../Row'
import QuestionHelper from '../QuestionHelper'
import { ButtonGray } from '../Button'
import { NETWORK_TYPE } from '../WalletModal'

const Tabs = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  border-radius: 0.75rem;
  justify-content: space-evenly;
  margin-bottom: 2rem;
`

const LimitedTabs = styled(Tabs)`
  max-width: 144px;
  background-color: ${({ theme }) => theme.bg1};
`

const WalletTabs = styled(Tabs)`
  background-color: ${({ theme }) => theme.bg1};
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: center;
  height: 40px;
  border-radius: 0.75rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text3};
  font-size: 0.875rem;
  width: 66px;
  transition: all ease 0.3s;

  &.${activeClassName} {
    width: 78px;
    font-weight: 500;
    color: ${({ theme }) => theme.text1};
    background-color: ${({ theme }) => theme.bg3};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }
`

const WalletButton = styled.button<{ active?: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: center;
  height: 40px;
  border-radius: 0.75rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme, active }) => (active ? theme.text1 : theme.text3)};
  background-color: ${({ theme, active }) => (active ? theme.bg3 : 'transparent')};
  border: none;
  font-size: 0.875rem;
  width: 50%;
  transition: all ease 0.3s;

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
    outline: none;
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
  color: ${({ theme }) => theme.text1};
  width: 24px;
  height: 24px;
`

const HistoryLink = styled(Link)`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`
const HistoryLinkButton = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`

const StyledGrayButton = styled(ButtonGray)`
  height: 40px;
  border-radius: 12px;
  color: ${({ theme }) => theme.text1};
  max-width: 103px;
`

export function SwapPoolTabs({ active }: { active: 'swap' | 'pool' }) {
  const { t } = useTranslation()
  return (
    <LimitedTabs style={{ marginBottom: '20px' }}>
      <StyledNavLink id={`swap-nav-link`} to={'/swap'} isActive={() => active === 'swap'}>
        {t('swap')}
      </StyledNavLink>
      <StyledNavLink id={`pool-nav-link`} to={'/pool'} isActive={() => active === 'pool'}>
        {t('pool')}
      </StyledNavLink>
    </LimitedTabs>
  )
}

export function ConnectWalletTabs({ active, onChangeProviders }: { active: string; onChangeProviders: (newNetwork: string) => void }) {
  return (
    <WalletTabs style={{ marginBottom: '20px' }}>
      <WalletButton
        id={`bsc-network`}
        active={active === NETWORK_TYPE.BSC}
        onClick={onChangeProviders.bind(this, NETWORK_TYPE.BSC)}
      >
        BSC
      </WalletButton>
      <WalletButton 
        id={`ethereum-network`} 
        active={active === NETWORK_TYPE.ETH}
        onClick={onChangeProviders.bind(this, NETWORK_TYPE.ETH)}
      >
        Ethereum
      </WalletButton>
    </WalletTabs>
  )
}

export function FindPoolTabs() {
  const { t } = useTranslation()
  return (
    <Tabs>
      <RowBetween>
        <Row align={'center'}>
          <HistoryLink to="/pool">
            <StyledArrowLeft />
          </HistoryLink>
          <ActiveText>{t('importpool')}</ActiveText>
        </Row>
        <QuestionHelper text={t('usethistool')} />
      </RowBetween>
    </Tabs>
  )
}

export function AddTabs() {
  const { t } = useTranslation()
  return (
    <Tabs>
      <RowBetween>
        <Row align={'center'}>
          <HistoryLink to="/pool">
            <StyledArrowLeft />
          </HistoryLink>
          <ActiveText>{t('addLiquidity')}</ActiveText>
        </Row>
        <QuestionHelper text={t('whenyouaddliquidity')} />
      </RowBetween>
    </Tabs>
  )
}

export function RemoveTabs({ onChangeDetails, detailed }: any) {
  const { t } = useTranslation()
  return (
    <Tabs>
      <RowBetween>
        <Row align={'center'}>
          <HistoryLink to="/pool">
            <StyledArrowLeft />
          </HistoryLink>
          <ActiveText>{t('removeLiquidity')}</ActiveText>
        </Row>
        <StyledGrayButton onClick={onChangeDetails}>{detailed ? 'Simple' : 'Detailed'}</StyledGrayButton>
      </RowBetween>
    </Tabs>
  )
}

export function SelectToken({ onDismiss, tooltipOpen }: { tooltipOpen: boolean; onDismiss: () => void }) {
  const { t } = useTranslation()
  return (
    <Tabs style={{ marginBottom: '0.625rem' }}>
      <RowBetween>
        <Row align={'center'}>
          <HistoryLinkButton onClick={onDismiss}>
            <StyledArrowLeft />
          </HistoryLinkButton>
          <ActiveText>{t('selectToken')}</ActiveText>
        </Row>
        <QuestionHelper disabled={tooltipOpen} text={t('findAToken')} />
      </RowBetween>
    </Tabs>
  )
}

export function SettingsTab({ onDismiss }: { onDismiss: any }) {
  return (
    <Tabs style={{ marginBottom: '0.625rem' }}>
      <RowBetween>
        <Row align={'center'}>
          <HistoryLinkButton onClick={onDismiss}>
            <StyledArrowLeft />
          </HistoryLinkButton>
          <ActiveText>Settings</ActiveText>
        </Row>
      </RowBetween>
    </Tabs>
  )
}
