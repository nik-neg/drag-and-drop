import React from 'react';
import styled from 'styled-components';

const BoardContainer = styled.div`
	display: flex;
	gap: 16px;
	padding: 16px;
	min-height: 100vh;
	background: #f4f5f7;
`;

export default function Board({ children }: { children: React.ReactNode }) {
	return <BoardContainer>{children}</BoardContainer>;
}
