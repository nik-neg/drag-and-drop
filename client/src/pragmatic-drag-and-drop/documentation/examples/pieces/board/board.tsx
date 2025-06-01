import { memo, type ReactNode } from 'react';
import styled from 'styled-components';

const BoardContainer = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  min-height: 100vh;
  background: #f4f5f7;
`;

export const Board = memo(({ children }: { children: ReactNode }) => {
  return <BoardContainer>{children}</BoardContainer>;
});
