import React, { useRef } from 'react'
import { X } from 'react-feather'
import styled from 'styled-components'
import SVG from 'react-inlinesvg';

import { useSettingsMenuOpen, useToggleSettingsMenu } from '../../state/application/hooks'
import { useTranslation } from 'react-i18next'
import More2 from '../../assets/icons/more-2.svg';
import SettingsModal from "../SettingsModal";

const Settings = styled(SVG).attrs(props => ({
  ...props,
  src: More2,
  width: 24,
  height: 24
}))`
  color: ${({ theme }) => theme.text1};
`

const StyledMenuIcon = styled(Settings)`
  height: 24px;
  width: 24px;

  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`

const StyledCloseIcon = styled(X)`
  height: 20px;
  width: 20px;
  :hover {
    cursor: pointer;
  }

  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`

const StyledMenuButton = styled.button`
  position: relative;
  width: 40px;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  height: 40px;
  background-color: ${({ theme }) => theme.bg3};

  padding: 0.15rem 0.5rem;
  border-radius: 0.75rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.bg4};
  }

  svg {
    margin-top: 2px;
  }
`
const EmojiWrapper = styled.div`
  position: absolute;
  bottom: -6px;
  right: 0px;
  font-size: 14px;
`

const StyledMenu = styled.div`
  margin-left: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;


  ${({ theme }) => theme.mediaWidth.upToSmall`
  margin-left: 1rem;
`};
`

const MenuFlyout = styled.span`
  min-width: 20.125rem;
  background-color: ${({ theme }) => theme.bg1};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);

  border: 1px solid ${({ theme }) => theme.bg3};

  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  top: 3rem;
  right: 0rem;
  z-index: 100;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    min-width: 18.125rem;
    right: -46px;
  `};
`

const Break = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.bg3};
`

const ModalContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  background-color: ${({ theme }) => theme.bg2};
  border-radius: 20px;
`

export default function SettingsTab() {
  const node = useRef<HTMLDivElement>()
  const open = useSettingsMenuOpen()
  const toggle = useToggleSettingsMenu()

  const handleClickOutside = e => {
    if (node.current?.contains(e.target) ?? false) {
      console.log("")
    } else {
      toggle()

    }
  }

  return (
    <StyledMenu ref={node}>
      <StyledMenuButton onClick={toggle} id="open-settings-dialog-button">
        <StyledMenuIcon />
      </StyledMenuButton>
      <SettingsModal open={open} onDismiss={handleClickOutside} />
    </StyledMenu>
  )
}
