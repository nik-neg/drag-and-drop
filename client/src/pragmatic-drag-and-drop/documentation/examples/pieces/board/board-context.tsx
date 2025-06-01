import { createContext, useContext } from 'react';
import type { RefObject } from 'react';

// import invariant from 'tiny-invariant';

// import type { CleanupFn } from '@atlaskit/pragmatic-drag-and-drop/types';

import type { ColumnType } from '@/pragmatic-drag-and-drop/documentation/examples/data/people';
import { TriggerEnum } from '@/enums/trigger.enum';
import type { BoardState } from '@/board-example';

export type BoardContextValue = {
  boardState: RefObject<BoardState>;
  handleSetData: (data: BoardState) => void;

  getColumns: () => ColumnType[];

  reorderColumn: (args: {
    startIndex: number;
    finishIndex: number;
    trigger?: TriggerEnum;
  }) => void;

  reorderCardInSameColumn: (args: {
    columnId: string;
    startIndex: number;
    finishIndex: number;
    trigger?: TriggerEnum;
  }) => void;

  moveCardToNewColumn: (args: {
    startColumnId: string;
    finishColumnId: string;
    itemIndexInStartColumn: number;
    itemIndexInFinishColumn?: number;
    trigger?: TriggerEnum;
  }) => void;

  registerCard: (args: {
    cardId: string;
    element: HTMLElement;
    actionMenuTrigger: HTMLElement;
  }) => void;

  registerColumn: (args: { columnId: string; element: HTMLElement }) => void;

  instanceId: symbol;
};

export const BoardContext = createContext<BoardContextValue | null>(null);

export const useBoardContext = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error(
      'useBoardContext must be used within a BoardContext.Provider'
    );
  }
  return context;
};
