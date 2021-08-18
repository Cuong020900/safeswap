import { Text } from 'rebass'
import styled from 'styled-components'

export const Wrapper = styled.div`
  position: relative;
`

export const ClickableText = styled(Text)`
  :hover {
    cursor: pointer;
  }
  color: ${({ theme }) => theme.primary1};
`
export const MaxButton = styled.button<{ width: string }>`
  padding: 0.5rem 1rem;
  background-color: ${({ theme }) => theme.bg1};
  border: 1px solid ${({ theme }) => theme.bg1};
  border-radius: 0.75rem;
  height: 40px;
  font-size: 1rem;
  flex-grow: 1;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0.25rem 0.5rem;
  `};
  font-weight: 500;
  cursor: pointer;
  margin: 0.25rem;
  overflow: hidden;
  color: ${({ theme }) => theme.text3};
  :hover {
    border: 1px solid ${({ theme }) => theme.bg3};
    background-color: ${({ theme }) => theme.bg3};
    color: ${({ theme }) => theme.text1};
  }
  :focus {
    border: 1px solid ${({ theme }) => theme.bg3};
    background-color: ${({ theme }) => theme.bg3};
    color: ${({ theme }) => theme.text1};
    outline: none;
  }
`

export const Dots = styled.span`
  &::after {
    display: inline-block;
    animation: ellipsis 1.25s infinite;
    content: '.';
    width: 1em;
    text-align: left;
  }
  @keyframes ellipsis {
    0% {
      content: '.';
    }
    33% {
      content: '..';
    }
    66% {
      content: '...';
    }
  }
`
