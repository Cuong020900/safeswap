import { Placement } from '@popperjs/core'
import React, { useState } from 'react'
import { usePopper } from 'react-popper'
import styled from 'styled-components'
import useInterval from '../../hooks/useInterval'
import Portal from '@reach/portal'

const PopoverContainer = styled.div<{ show: boolean }>`
  z-index: 9999;

  visibility: ${props => (props.show ? 'visible' : 'hidden')};
  opacity: ${props => (props.show ? 1 : 0)};
  transition: visibility 150ms linear, opacity 150ms linear;

  background: ${({ theme }) => theme.bg3};
  color: ${({ theme }) => theme.text5};
  line-height: 24px;
  font-size: 0.875rem;
  border-radius: 12px;

  @supports ((-webkit-backdrop-filter: blur(2em)) or (backdrop-filter: blur(2em))) {
    background: rgba(52, 58, 63, 0.5);
    backdrop-filter: blur(50px);
    -webkit-backdrop-filter: blur(50px);
  }
`

const ReferenceElement = styled.div`
  display: inline-block;
`

export interface PopoverProps {
  content: React.ReactNode
  show: boolean
  children: React.ReactNode
  placement?: Placement
}

export default function Popover({ content, show, children, placement = 'right' }: PopoverProps) {
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement>(null)
  const [popperElement, setPopperElement] = useState<HTMLDivElement>(null)
  const { styles, update, attributes } = usePopper(referenceElement, popperElement, {
    placement,
    strategy: 'fixed',
    modifiers: [{ name: 'offset', options: { offset: [32, 32] } }]
  })
  useInterval(update, show ? 100 : null)

  return (
    <>
      <ReferenceElement ref={setReferenceElement}>{children}</ReferenceElement>
      <Portal>
        <PopoverContainer show={show} ref={setPopperElement} style={styles.popper} {...attributes.popper}>
          {content}
        </PopoverContainer>
      </Portal>
    </>
  )
}
