import React from 'react'
import styled from 'styled-components'
import Noise from '../assets/images/noise.png';

export const BodyWrapper = styled.div<{ disabled?: boolean }>`
  position: relative;
  max-width: 451px;
  width: 100%;
  background-color: ${({ theme }) => theme.bg1};
  border-radius: 24px;
  padding: 1.5rem;
  opacity: ${({ disabled }) => (disabled ? '0.4' : '1')};
  pointer-events: ${({ disabled }) => disabled && 'none'};
  overflow: hidden;

  @supports ((-webkit-backdrop-filter: blur(10px)) or (backdrop-filter: blur(10px))) {
    background-color: rgba(255, 255, 255, 0.1);
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
  }
  
  &::before {
    content: "";
    z-index: -1;
    background-image: url(${Noise});
    background-repeat: repeat;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    mix-blend-mode: overlay;
    border-radius: 24px;
    background-blend-mode: overlay;
    opacity: 0.02;
  }
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  return <BodyWrapper disabled={disabled}>{children}</BodyWrapper>
}
