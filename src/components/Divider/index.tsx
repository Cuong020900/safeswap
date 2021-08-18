import styled from "styled-components";
import React from 'react';

const Container = styled.div<{ margin?: string | number | undefined }>`
  width: 100%;
  height: 1px;
  margin: ${({ margin }) => typeof margin === 'number' ? `${margin}px` : margin ? margin : "1.5rem 0"};
  background-color: ${({ theme }) => theme.bg3};
`

interface DividerProps {
    margin?: string | number | undefined;
}

export default function Divider(props: DividerProps) {
    return (
        <Container
            margin={props.margin}
        />
    )
}