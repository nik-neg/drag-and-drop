import { useCallback, useMemo, useRef, useState } from 'react';

import { triggerPostMoveFlash } from '@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash';
import * as liveRegion from '@atlaskit/pragmatic-drag-and-drop-live-region';
import { getBasicData } from '@/data';
import { BoardContext, type BoardContextValue } from '@/provider/context';
import { Column } from '@/components/column/column';
import { createRegistry } from '@/provider/registry';
import { TriggerEnum } from '@/enums/trigger.enum';
import { SBoardContainer } from './board.styles';
import { type BoardState } from './types';
import { useBoard } from '@/hooks';

const initialData: BoardState = { ...getBasicData(), lastOperation: null };

export const Board = () => {
  const [data, setData] = useState<BoardState>(initialData);

  const handleSetData = useCallback((data: BoardState) => {
    setData(data);
  }, []);

  const boardStateRef = useRef<BoardState>(data);

  const [registry] = useState(createRegistry);

  const [instanceId] = useState(() => Symbol('instance-id'));

  const { getColumns, reorderColumn, reorderCardInSameColumn, moveCardToNewColumn } = useBoard({
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
      reorderColumn: (args: { startIndex: number; finishIndex: number; trigger?: TriggerEnum }) =>
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
      <SBoardContainer>
        {data.orderedColumnIds.map(columnId => {
          return <Column column={data.columnMap[columnId]} key={columnId} />;
        })}
      </SBoardContainer>
    </BoardContext.Provider>
  );
};
