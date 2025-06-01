import { createContext, useContext } from 'react';

// import invariant from 'tiny-invariant';

export type ColumnContextProps = {
  columnId: string;
  getCardIndex: (userId: string) => number;
  getNumCards: () => number;
};

export const ColumnContext = createContext<ColumnContextProps | null>(null);

export function useColumnContext() {
  const context = useContext(ColumnContext);
  if (!context) {
    throw new Error('useColumnContext must be used within a ColumnContext.Provider');
  }
  return context;
}
