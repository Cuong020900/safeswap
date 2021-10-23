import React, { useRef } from 'react'
import styled from 'styled-components'
import SVG from 'react-inlinesvg';

import { useSettingsMenuOpen, useToggleSettingsMenu } from '../../state/application/hooks'
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

export default function SettingsTab() {
  const node = useRef<HTMLDivElement>()
  const open = useSettingsMenuOpen()
  const toggle = useToggleSettingsMenu()

  const handleClickOutside = e => {
    if (node.current?.contains(e.target) ?? false) {
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
