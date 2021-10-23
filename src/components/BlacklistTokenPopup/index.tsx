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

export function BlacklistTokenContent({ onDismiss }: { onDismiss: () => void }) {
  return (
    <ModalWrapper>
      <AutoColumn gap="lg">
        <AutoRow gap="6px">
          <StyledWarningIcon />
          <TYPE.main color={'red2'}>Something went wrong</TYPE.main>
        </AutoRow>
        <TYPE.body color={'text3'} lineHeight={'1.6'}>
          <strong>Warning:</strong> The contract address you have entered has been flagged by our internal system as an untrustworthy
          contract address. <br />
          This usually happens when a large amount of users complain about the validity, safety and security of a
          particular coin or token. We have taken measures to remove access to this contract from our products for the
          safety and security of our users.
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
  )
}

export function BlacklistTokenPopup({ open, onDismiss }: { open: boolean; onDismiss: () => void }) {
  return (
    <Modal isOpen={open} onDismiss={onDismiss}>
      <BlacklistTokenContent onDismiss={onDismiss} />
    </Modal>
  )
}
