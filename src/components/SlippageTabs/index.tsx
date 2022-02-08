import React, { useState, useRef, useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { useTranslation } from 'react-i18next'

import QuestionHelper from '../QuestionHelper'
import { TYPE } from '../../theme'
import { AutoColumn } from '../Column'
import { RowBetween, RowFixed } from '../Row'

import { darken } from 'polished'
import { useGasPrices, useGasType } from '../../state/user/hooks'
import { BigNumber } from 'ethers'

enum SlippageError {
  InvalidInput = 'InvalidInput',
  RiskyLow = 'RiskyLow',
  RiskyHigh = 'RiskyHigh'
}

enum DeadlineError {
  InvalidInput = 'InvalidInput'
}

const FancyButton = styled.button`
  color: ${({ theme }) => theme.text3};
  align-items: center;
  height: 40px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  width: auto;
  min-width: 5.25rem;
  border: 1px solid ${({ theme }) => theme.bg1};
  outline: none;
  background: ${({ theme }) => theme.bg1};
  transition: 0.3s ease all;
  :hover {
    border: 1px solid ${({ theme }) => theme.bg3};
    background: ${({ theme }) => theme.bg3};
    color: ${({ theme }) => theme.text1};
  }
  :focus {
    border: 1px solid ${({ theme }) => theme.bg4};
    background: ${({ theme }) => theme.bg4};
    color: ${({ theme }) => theme.text1};
  }
`

const Option = styled(FancyButton)<{ active: boolean }>`
  margin-right: 8px;
  :hover {
    cursor: pointer;
  }
  background-color: ${({ active, theme }) => active && theme.primary1} !important;
  color: ${({ active, theme }) => (active ? theme.white : theme.text3)} !important;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: calc((100% - 16px) / 3);
    margin-bottom: 0.75rem;
    flex-grow: 1;
    
    &.last-child {
      margin-right: 0;
    }
  `};
`

const GasOption = styled(Option)`
  flex-grow: 1;

  &:last-child {
    margin-right: 0;
  }
`

const Input = styled.input`
  background: ${({ theme }) => theme.bg3};
  font-size: 16px;
  height: 40px;
  border-radius: 12px;
  width: auto;
  outline: none;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  color: ${({ theme, color }) => (color === 'red' ? theme.red1 : theme.text1)};
  text-align: left;
`

const OptionCustom = styled(FancyButton)<{ active?: boolean; warning?: boolean }>`
  background: ${({ theme }) => theme.bg3} !important;
  background-color: ${({ theme }) => theme.bg3} !important;
  height: 2.5rem;
  position: relative;
  padding: 0 0.75rem;
  flex: 1;
  border: ${({ theme, active, warning }) => active && `1px solid ${warning ? theme.red1 : theme.primary1}`};
  :hover {
    border: ${({ theme, active, warning }) =>
      active && `1px solid ${warning ? darken(0.1, theme.red1) : darken(0.1, theme.primary1)}`};
  }

  input {
    width: 100%;
    height: 100%;
    border: 0px;
    border-radius: 0.75rem;
  }
`

const SlippageEmojiContainer = styled.span`
  color: #f3841e;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `}
`

export interface SlippageTabsProps {
  rawSlippage: number
  setRawSlippage: (rawSlippage: number) => void
  deadline: number
  setDeadline: (deadline: number) => void
  gasPrice: string
  setGasPrice: (gasPrice: string, gasPriceType: string) => void
}

export default function SlippageTabs({
  rawSlippage,
  setRawSlippage,
  deadline,
  setDeadline,
  gasPrice,
  setGasPrice
}: SlippageTabsProps) {
  const theme = useContext(ThemeContext)
  const { t } = useTranslation()
  const gasPrices = useGasPrices()
  const gasType = useGasType()

  const inputRef = useRef<HTMLInputElement>()

  const [slippageInput, setSlippageInput] = useState('')
  const [deadlineInput, setDeadlineInput] = useState('')

  const slippageInputIsValid =
    slippageInput === '' || (rawSlippage / 100).toFixed(2) === Number.parseFloat(slippageInput).toFixed(2)
  const deadlineInputIsValid = deadlineInput === '' || (deadline / 60).toString() === deadlineInput

  let slippageError: SlippageError
  if (slippageInput !== '' && !slippageInputIsValid) {
    slippageError = SlippageError.InvalidInput
  } else if (slippageInputIsValid && rawSlippage < 50) {
    slippageError = SlippageError.RiskyLow
  } else if (slippageInputIsValid && rawSlippage > 500) {
    slippageError = SlippageError.RiskyHigh
  }

  let deadlineError: DeadlineError
  if ((deadlineInput !== '' && !deadlineInputIsValid) || +deadlineInput > 60) {
    deadlineError = DeadlineError.InvalidInput
  }

  function parseCustomSlippage(event) {
    setSlippageInput(event.target.value)

    let valueAsIntFromRoundedFloat: number
    try {
      valueAsIntFromRoundedFloat = Number.parseInt((Number.parseFloat(event.target.value) * 100).toString())
    } catch {}

    if (
      typeof valueAsIntFromRoundedFloat === 'number' &&
      !Number.isNaN(valueAsIntFromRoundedFloat) &&
      valueAsIntFromRoundedFloat < 5000
    ) {
      setRawSlippage(valueAsIntFromRoundedFloat)
    }
  }

  function parseCustomDeadline(event) {
    setDeadlineInput(event.target.value)

    let valueAsInt: number
    try {
      valueAsInt = Number.parseInt(event.target.value) * 60
    } catch {}

    if (typeof valueAsInt === 'number' && !Number.isNaN(valueAsInt) && valueAsInt > 0) {
      setDeadline(valueAsInt)
    }
  }

  return (
    <AutoColumn gap="lg">
      <AutoColumn gap={'sm'}>
        <RowBetween style={{ height: 24 }}>
          <TYPE.black fontWeight={400} fontSize={14} color={theme.text3}>
            {t('transactionSpeed')}
          </TYPE.black>
          <QuestionHelper text={t('adjustYourGasPrice')} size={'sm'} />
        </RowBetween>
        <RowBetween style={{ flexWrap: 'wrap' }}>
          <GasOption
            onClick={() => {
              setGasPrice(gasPrices.default, 'default')
            }}
            active={gasType === 'default'}
          >
            Standard (
            {BigNumber.from(gasPrices.default)
              .div(10 ** 9)
              .toString()}
            )
          </GasOption>
          <GasOption
            onClick={() => {
              setGasPrice(gasPrices.fast, 'fast')
            }}
            active={gasType === 'fast'}
          >
            Fast (
            {BigNumber.from(gasPrices.fast)
              .div(10 ** 9)
              .toString()}
            )
          </GasOption>
          <GasOption
            onClick={() => {
              setGasPrice(gasPrices.instant, 'instant')
            }}
            active={gasType === 'instant'}
          >
            Instant (
            {BigNumber.from(gasPrices.instant)
              .div(10 ** 9)
              .toString()}
            )
          </GasOption>
        </RowBetween>
      </AutoColumn>
      <AutoColumn gap="sm">
        <RowBetween style={{ height: 24 }}>
          <TYPE.black fontWeight={400} fontSize={14} color={theme.text3}>
            {t('slippageTolerance')}
          </TYPE.black>
          <QuestionHelper text={t('yourTXWill')} size={'sm'} />
        </RowBetween>
        <RowBetween style={{ flexWrap: 'wrap' }}>
          <Option
            onClick={() => {
              setSlippageInput('')
              setRawSlippage(10)
            }}
            active={rawSlippage === 10}
          >
            0.1%
          </Option>
          <Option
            onClick={() => {
              setSlippageInput('')
              setRawSlippage(50)
            }}
            active={rawSlippage === 50}
          >
            0.5%
          </Option>
          <Option
            className={'last-child'}
            onClick={() => {
              setSlippageInput('')
              setRawSlippage(100)
            }}
            active={rawSlippage === 100}
          >
            1%
          </Option>
          <OptionCustom active={![10, 50, 100].includes(rawSlippage)} warning={!slippageInputIsValid} tabIndex={-1}>
            <RowBetween>
              {!!slippageInput &&
              (slippageError === SlippageError.RiskyLow || slippageError === SlippageError.RiskyHigh) ? (
                <SlippageEmojiContainer>
                  <span role="img" aria-label="warning">
                    ⚠️
                  </span>
                </SlippageEmojiContainer>
              ) : null}
              <Input
                ref={inputRef}
                placeholder={(rawSlippage / 100).toFixed(2)}
                value={slippageInput}
                onBlur={() => {
                  parseCustomSlippage({ target: { value: (rawSlippage / 100).toFixed(2) } })
                }}
                onChange={parseCustomSlippage}
                color={!slippageInputIsValid ? 'red' : ''}
              />
              %
            </RowBetween>
          </OptionCustom>
        </RowBetween>
        {!!slippageError && (
          <RowBetween
            style={{
              fontSize: '14px',
              paddingTop: '7px',
              color: slippageError === SlippageError.InvalidInput ? 'red' : '#F3841E'
            }}
          >
            {slippageError === SlippageError.InvalidInput
              ? t('enterAValid')
              : slippageError === SlippageError.RiskyLow
              ? t('yourTXMayFail')
              : t('yourTXMayFront')}
          </RowBetween>
        )}
      </AutoColumn>

      <AutoColumn gap="sm">
        <RowBetween>
          <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
            {t('transactionDeadline')}
          </TYPE.black>
          <QuestionHelper text={t('yourTXWill2')} size={'sm'} />
        </RowBetween>
        <RowFixed style={{ width: '100%' }}>
          <OptionCustom style={{ width: '100%' }} tabIndex={-1}>
            <RowBetween>
              <Input
                color={!!deadlineError ? 'red' : undefined}
                onBlur={() => {
                  parseCustomDeadline({ target: { value: (deadline > 3600 ? 60 : deadline / 60).toString() } })
                }}
                placeholder={(deadline / 60).toString()}
                value={deadlineInput}
                onChange={parseCustomDeadline}
              />
              <TYPE.body style={{ paddingRight: '8px' }} fontSize={14}>
                {t('minutes')}
              </TYPE.body>
            </RowBetween>
          </OptionCustom>
        </RowFixed>
        { deadline > 3600
          && <p style={{fontSize: '12px', color: 'red', marginBottom: 0, marginTop: '-4px'}}>
            The limit maximum is 60 minutes
          </p>
        }
      </AutoColumn>
    </AutoColumn>
  )
}
