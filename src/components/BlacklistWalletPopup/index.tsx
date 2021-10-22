import React from 'react'
import Modal from '../Modal'
import styled from 'styled-components'
import { AutoColumn } from '../Column'
import { AutoRow, RowBetween } from '../Row'
import { TYPE } from '../../theme'
import { AlertTriangle } from 'react-feather'
import { ButtonError } from '../Button'

const ModalWrapper = styled.div`
  padding: 1.5rem;
  box-sizing: border-box;
`

const StyledWarningIcon = styled(AlertTriangle)`
  stroke: ${({ theme }) => theme.red2};
`

const Mailto = styled.a`
  color: ${({ theme }) => theme.text1};
  outline: none;
  box-shadow: none;
  text-decoration: none;
  display: inline;
`

export function BlacklistWalletPopup({ open, onDismiss }: { open: boolean; onDismiss: () => void }) {
  return (
    <Modal isOpen={open} onDismiss={onDismiss}>
      <ModalWrapper>
        <AutoColumn gap="lg">
          <AutoRow gap="6px">
            <StyledWarningIcon />
            <TYPE.main color={'red2'}>Something went wrong</TYPE.main>
          </AutoRow>
          <TYPE.body color={'text3'} lineHeight={'1.6'}>
            Oops, this {`isn't`} a good look. Seems like something went wrong. Please contact{' '}
            <Mailto href="mailto:errorreporting@safemoonwallet.ltd">errorreporting@safemoonwallet.ltd</Mailto>
          </TYPE.body>
          <RowBetween>
            <div />
            <ButtonError
              error={true}
              width={'100%'}
              style={{
                borderRadius: '10px',
                height: 48
              }}
              onClick={onDismiss}
            >
              <TYPE.body color="white" className="token-dismiss-button">
                I understand
              </TYPE.body>
            </ButtonError>
            <div />
          </RowBetween>
        </AutoColumn>
      </ModalWrapper>
    </Modal>
  )
}
