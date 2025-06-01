import { useCallback, useMemo, useRef, useState } from 'react';

import { triggerPostMoveFlash } from '@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash';
import * as liveRegion from '@atlaskit/pragmatic-drag-and-drop-live-region';

import {
  type ColumnMap,
  getBasicData,
} from './pragmatic-drag-and-drop/documentation/examples/data/people';
import { Board } from './pragmatic-drag-and-drop/documentation/examples/pieces/board/board';
import {
  BoardContext,
  type BoardContextValue,
} from './pragmatic-drag-and-drop/documentation/examples/pieces/board/board-context';
import { Column } from './pragmatic-drag-and-drop/documentation/examples/pieces/board/column';
import { createRegistry } from './pragmatic-drag-and-drop/documentation/examples/pieces/board/registry';
import { OutcomeEnum } from './enums/outcome.enum';
import { TriggerEnum } from './enums/trigger.enum';
import { useCallbacks } from './hooks/useCallbacks';
import { useBoard } from './hooks/useBoard';
// import { getColumns, moveCard, reorderCard, reorderColumn } from './useCallbacks';

export type Outcome =
  | {
      type: OutcomeEnum.COLUMN_REORDER;
      columnId: string;
      startIndex: number;
      finishIndex: number;
    }
  | {
      type: OutcomeEnum.CARD_REORDER;
      columnId: string;
      startIndex: number;
      finishIndex: number;
    }
  | {
      type: OutcomeEnum.CARD_MOVE;
      finishColumnId: string;
      itemIndexInStartColumn: number;
      itemIndexInFinishColumn: number;
    };

export type Operation = {
  trigger: TriggerEnum;
  outcome: Outcome;
};

export type BoardState = {
  columnMap: ColumnMap;
  orderedColumnIds: string[];
  lastOperation: Operation | null;
};

const initialData: BoardState = { ...getBasicData(), lastOperation: null };

export const BoardExample = () => {
  const [data, setData] = useState<BoardState>(initialData);

  const handleSetData = useCallback((data: BoardState) => {
    setData(data);
  }, []);

  const boardStateRef = useRef<BoardState>(data);

  const [registry] = useState(createRegistry);

  const [instanceId] = useState(() => Symbol('instance-id'));

  const {
    getColumns,
    reorderColumn,
    reorderCardInSameColumn,
    moveCardToNewColumn,
  } = useBoard({
    data,
    handleSetData,
    boardStateRef,
    registry,
    triggerPostMoveFlash,
    liveRegion,
    instanceId,
  });

  const contextValue: BoardContextValue = useMemo(() => {
    return {
      boardState: boardStateRef,
      handleSetData,
      getColumns: () => getColumns({ boardState: boardStateRef }),
      reorderColumn: (args: {
        startIndex: number;
        finishIndex: number;
        trigger?: TriggerEnum;
      }) =>
        reorderColumn({ ...args, boardState: boardStateRef, handleSetData }),
      reorderCardInSameColumn: (args: {
        columnId: string;
        startIndex: number;
        finishIndex: number;
        trigger?: TriggerEnum;
      }) =>
        reorderCardInSameColumn({
          ...args,
          boardState: boardStateRef,
          handleSetData,
        }),
      moveCardToNewColumn: (args: {
        startColumnId: string;
        finishColumnId: string;
        itemIndexInStartColumn: number;
        itemIndexInFinishColumn?: number;
        trigger?: TriggerEnum;
      }) =>
        moveCardToNewColumn({
          ...args,
          boardState: boardStateRef,
          handleSetData,
        }),
      registerCard: registry.registerCard,
      registerColumn: registry.registerColumn,
      instanceId,
    };
  }, [
    getColumns,
    reorderColumn,
    reorderCardInSameColumn,
    registry,
    moveCardToNewColumn,
    instanceId,
  ]);

  return (
    <BoardContext.Provider value={contextValue}>
      <Board>
        {data.orderedColumnIds.map(columnId => {
          return <Column column={data.columnMap[columnId]} key={columnId} />;
        })}
      </Board>
    </BoardContext.Provider>
  );
};
