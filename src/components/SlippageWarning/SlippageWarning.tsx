import { Token } from '@safemoon/sdk'
import Modal from '../Modal'
import { AutoColumn } from '../Column'
import { AutoRow, RowBetween } from '../Row'
import { TYPE } from '../../theme'
import { ButtonError } from '../Button'
import React from 'react'
import styled from 'styled-components'
import { AlertTriangle } from 'react-feather'

const ModalWrapper = styled.div`
  padding: 1.5rem;
  box-sizing: border-box;
`

const StyledWarningIcon = styled(AlertTriangle)`
  stroke: ${({ theme }) => theme.yellow1};
`

export function SlippageWarning({
  open,
  onDismiss,
  token
}: {
  open: boolean
  onDismiss: () => void
  token: Token | null
}) {
  return (
    <Modal isOpen={open} onDismiss={onDismiss} maxHeight={60}>
      <ModalWrapper>
        <AutoColumn gap="lg">
          <AutoRow gap="6px">
            <StyledWarningIcon />
            <TYPE.main color={'yellow1'}>Notice for trading {token?.name || ''}</TYPE.main>
          </AutoRow>
          <AutoColumn gap={'0'}>
            <TYPE.body color={'text2'} lineHeight={'1.6'} marginBottom={'0.25rem'}>
              To trade {token?.name || ''}, you must:
            </TYPE.body>
            <TYPE.body color={'text2'} lineHeight={'1.6'} paddingLeft={'4px'}>
              • Click on the settings icon
            </TYPE.body>
            <TYPE.body color={'text2'} lineHeight={'1.6'} paddingLeft={'4px'}>
              • Set your slippage tolerance to 12%
            </TYPE.body>
            <TYPE.body color={'text2'} lineHeight={'1.6'} marginTop={'1.5rem'} marginBottom={'0.25rem'}>
              This is because SafeMoon taxes a 10% fee on each transaction:
            </TYPE.body>
            <TYPE.body color={'text2'} lineHeight={'1.6'} paddingLeft={'4px'}>
              • 4% fee = Redistributed to all existing holders
            </TYPE.body>
            <TYPE.body color={'text2'} lineHeight={'1.6'} paddingLeft={'4px'}>
              • 3% fee = Added to liquidity
            </TYPE.body>
            <TYPE.body color={'text2'} lineHeight={'1.6'} paddingLeft={'4px'}>
              • 2% fee = Tokens burned
            </TYPE.body>
            <TYPE.body color={'text2'} lineHeight={'1.6'} paddingLeft={'4px'}>
              • 1% fee = Added to Ecosystem Growth Fund
            </TYPE.body>
          </AutoColumn>
          <RowBetween>
            <div />
            <ButtonError
              error={false}
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