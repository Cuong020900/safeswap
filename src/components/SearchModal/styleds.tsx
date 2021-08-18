import styled from 'styled-components'
import { AutoColumn } from '../Column'
import { RowBetween, RowFixed } from '../Row'

export const ModalInfo = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  padding: 1rem 1rem;
  margin: 0.25rem 0.5rem;
  justify-content: center;
  flex: 1;
  user-select: none;
`

export const FadedSpan = styled(RowFixed)`
  color: ${({ theme }) => theme.primary1};
  font-size: 14px;
`

export const GreySpan = styled.span`
  color: ${({ theme }) => theme.text3};
  font-weight: 400;
`

export const InputContainer = styled.div`
  height: 56px;
  width: 100%;
  padding: 16px;
  position: relative;
  display: flex;
  align-items: center;
  border-radius: 16px;
  color: ${({ theme }) => theme.text1};
  border-style: solid;
  border: 1px solid ${({ theme }) => theme.bg4};
  transition: border 100ms;
  padding-left: 48px;
  
  :focus {
    border: 1px solid ${({ theme }) => theme.primary1};
    outline: none;
  }
`
export const Input = styled.input`
  white-space: nowrap;
  background: none;
  border: none;
  outline: none;
  -webkit-appearance: none;
  font-size: 18px;

  ::placeholder {
    color: ${({ theme }) => theme.text3};
  }
`

export const PaddedColumn = styled(AutoColumn)`
  padding: 20px;
  padding-bottom: 12px;
`

export const MenuItem = styled(RowBetween)`
  padding: 4px 20px;
  height: 56px;
  margin-bottom: 12px;
  cursor: ${({ disabled }) => !disabled && 'pointer'};
  pointer-events: ${({ disabled }) => disabled && 'none'};
  :hover {
    background-color: ${({ theme, disabled }) => !disabled && theme.bg2};
  }
  opacity: ${({ disabled, selected }) => (disabled || selected ? 0.5 : 1)};
`

export const SearchInput = styled(Input)`
  color: ${({ theme }) => theme.text1};
`
