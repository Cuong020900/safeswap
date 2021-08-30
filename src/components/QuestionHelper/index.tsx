import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import Tooltip from '../Tooltip'
import SVG from "react-inlinesvg";
import InfoCircle from '../../assets/icons/info-circle.svg';
import {useTheme} from "../../hooks/useTheme";

const QuestionWrapper = styled.div<{ size?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ size }) => size === 'lg' ? '40px' : size === 'md' ? '32px' : '24px'};
  height: ${({ size }) => size === 'lg' ? '40px' : size === 'md' ? '32px' : '24px'};
  border: none;
  outline: none;
  cursor: default;
  border-radius: ${({ size }) => size === 'lg' ? '8px' : size === 'md' ? '4px' : '36px'};
  background-color: ${({ theme }) => theme.bg3};
  color: ${({ theme }) => theme.text1};
  

  :hover,
  :focus {
    opacity: 0.7;
  }
`

export default function QuestionHelper({ text, disabled, size = 'lg' }: { text: string; disabled?: boolean, size?: string }) {
  const [show, setShow] = useState<boolean>(false)
  const theme = useTheme();

  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])

  return (
    <span style={{ marginLeft: 4 }}>
      <Tooltip text={text} show={show && !disabled}>
        <QuestionWrapper onClick={open} onMouseEnter={open} onMouseLeave={close} size={size}>
          <SVG
            src={InfoCircle}
            width={size === 'lg' ? 24 : size === 'md' ? 20 : 16}
            height={size === 'lg' ? 24 : size === 'md' ? 20 : 16}
            color={theme.text1}
          />
        </QuestionWrapper>
      </Tooltip>
    </span>
  )
}
