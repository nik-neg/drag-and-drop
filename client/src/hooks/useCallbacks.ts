import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import { OutcomeEnum } from '@/enums/outcome.enum';
import { TriggerEnum } from '@/enums/trigger.enum';
import type { BoardState, Operation, Outcome } from '@/board-example';
import type {
  ColumnMap,
  Person,
} from '@/pragmatic-drag-and-drop/documentation/examples/data/people';
import type { ColumnType } from '@/pragmatic-drag-and-drop/documentation/examples/data/people';
import type { RefObject } from 'react';
import { useCallback } from 'react';
import type { Registry } from '@/pragmatic-drag-and-drop/documentation/examples/pieces/board/registry';

interface IGetColumnsProps {
  boardState: RefObject<BoardState>;
}

interface IReorderColumnProps {
  startIndex: number;
  finishIndex: number;
  trigger?: TriggerEnum;
  boardState: RefObject<BoardState>;
  handleSetData: (data: BoardState) => void;
}

interface IReorderCardProps {
  columnId: string;
  startIndex: number;
  finishIndex: number;
  trigger?: TriggerEnum;
  boardState: RefObject<BoardState>;
  handleSetData: (data: BoardState) => void;
}

interface IMoveCardProps {
  startColumnId: string;
  finishColumnId: string;
  itemIndexInStartColumn: number;
  itemIndexInFinishColumn?: number;
  trigger?: TriggerEnum;
  boardState: RefObject<BoardState>;
  handleSetData: (data: BoardState) => void;
}

interface IHandleLastOperationProps {
  lastOperation: Operation | null;
  boardStateRef: RefObject<BoardState>;
  registry: Registry;
  triggerPostMoveFlash: (element: HTMLElement) => void;
  liveRegion: { announce: (message: string) => void };
}

export const useCallbacks = () => {
  const getColumns = useCallback(({ boardState }: IGetColumnsProps) => {
    const { columnMap, orderedColumnIds } = boardState.current;

    return orderedColumnIds.map(columnId => columnMap[columnId]);
  }, []);

  const reorderColumn = useCallback(
    ({
      startIndex,
      finishIndex,
      trigger = TriggerEnum.KEYBOARD,
      boardState,
      handleSetData,
    }: IReorderColumnProps) => {
      const { orderedColumnIds, ...otherState } = boardState.current;

      const newBoardState: BoardState = {
        ...otherState,
        orderedColumnIds: reorder({
          list: orderedColumnIds,
          startIndex,
          finishIndex,
        }),
        lastOperation: {
          outcome: {
            type: OutcomeEnum.COLUMN_REORDER,
            columnId: orderedColumnIds[startIndex],
            startIndex,
            finishIndex,
          },
          trigger,
        },
      };

      handleSetData(newBoardState);
    },
    []
  );

  const reorderCardInSameColumn = useCallback(
    ({
      columnId,
      startIndex,
      finishIndex,
      trigger = TriggerEnum.KEYBOARD,
      boardState,
      handleSetData,
    }: IReorderCardProps) => {
      const { columnMap, ...otherState } = boardState.current;

      const sourceColumn = columnMap[columnId];
      const updatedItems = reorder({
        list: sourceColumn.items,
        startIndex,
        finishIndex,
      });

      const updatedSourceColumn: ColumnType = {
        ...sourceColumn,
        items: updatedItems,
      };

      const updatedMap: ColumnMap = {
        ...columnMap,
        [columnId]: updatedSourceColumn,
      };

      const newBoardState: BoardState = {
        ...otherState,
        columnMap: updatedMap,
        lastOperation: {
          trigger: trigger,
          outcome: {
            type: OutcomeEnum.CARD_REORDER,
            columnId,
            startIndex,
            finishIndex,
          },
        },
      };

      handleSetData(newBoardState);
    },
    []
  );

  const moveCardToNewColumn = useCallback(
    ({
      startColumnId,
      finishColumnId,
      itemIndexInStartColumn,
      itemIndexInFinishColumn,
      trigger = TriggerEnum.KEYBOARD,
      boardState,
      handleSetData,
    }: IMoveCardProps) => {
      const { columnMap, ...otherState } = boardState.current;

      // invalid cross column movement
      if (startColumnId === finishColumnId) {
        return;
      }
      const sourceColumn = columnMap[startColumnId];
      const destinationColumn = columnMap[finishColumnId];
      const item: Person = sourceColumn.items[itemIndexInStartColumn];

      const destinationItems = Array.from(destinationColumn.items);
      // Going into the first position if no index is provided
      const newIndexInDestination = itemIndexInFinishColumn ?? 0;
      destinationItems.splice(newIndexInDestination, 0, item);

      const updatedMap = {
        ...columnMap,
        [startColumnId]: {
          ...sourceColumn,
          items: sourceColumn.items.filter(i => i.userId !== item.userId),
        },
        [finishColumnId]: {
          ...destinationColumn,
          items: destinationItems,
        },
      };

      const outcome: Outcome | null = {
        type: OutcomeEnum.CARD_MOVE,
        finishColumnId,
        itemIndexInStartColumn,
        itemIndexInFinishColumn: newIndexInDestination,
      };

      const newBoardState: BoardState = {
        ...otherState,
        columnMap: updatedMap,
        lastOperation: {
          outcome,
          trigger: trigger,
        },
      };

      handleSetData(newBoardState);
    },
    []
  );

  const handleLastOperation = useCallback(
    ({
      lastOperation,
      boardStateRef,
      registry,
      triggerPostMoveFlash,
      liveRegion,
    }: IHandleLastOperationProps) => {
      if (lastOperation === null) {
        return;
      }
      const { outcome, trigger } = lastOperation;

      if (outcome.type === OutcomeEnum.COLUMN_REORDER) {
        const { startIndex, finishIndex } = outcome;

        const { columnMap, orderedColumnIds } = boardStateRef.current;

        const sourceColumn = columnMap[orderedColumnIds[finishIndex]];

        const entry = registry.getColumn(sourceColumn.columnId);

        triggerPostMoveFlash(entry.element);

        liveRegion.announce(
          `You've moved ${sourceColumn.title} from position ${
            startIndex + 1
          } to position ${finishIndex + 1} of ${orderedColumnIds.length}.`
        );

        return;
      }

      if (outcome.type === OutcomeEnum.CARD_REORDER) {
        const { columnId, startIndex, finishIndex } = outcome;

        const { columnMap } = boardStateRef.current;
        const column = columnMap[columnId];
        const item = column.items[finishIndex];

        const entry = registry.getCard(item.userId);
        triggerPostMoveFlash(entry.element);

        if (trigger !== 'keyboard') {
          return;
        }

        liveRegion.announce(
          `You've moved ${item.name} from position ${
            startIndex + 1
          } to position ${finishIndex + 1} of ${column.items.length} in the ${column.title} column.`
        );

        return;
      }

      if (outcome.type === OutcomeEnum.CARD_MOVE) {
        const {
          finishColumnId,
          itemIndexInStartColumn,
          itemIndexInFinishColumn,
        } = outcome;

        const data = boardStateRef.current;
        const destinationColumn = data.columnMap[finishColumnId];
        const item = destinationColumn.items[itemIndexInFinishColumn];

        const finishPosition =
          typeof itemIndexInFinishColumn === 'number'
            ? itemIndexInFinishColumn + 1
            : destinationColumn.items.length;

        const entry = registry.getCard(item.userId);
        triggerPostMoveFlash(entry.element);

        if (trigger !== 'keyboard') {
          return;
        }

        liveRegion.announce(
          `You've moved ${item.name} from position ${
            itemIndexInStartColumn + 1
          } to position ${finishPosition} in the ${destinationColumn.title} column.`
        );

        /**
         * Because the card has moved column, it will have remounted.
         * This means we need to manually restore focus to it.
         */
        entry.actionMenuTrigger.focus();

        return;
      }
    },
    []
  );

  return {
    getColumns,
    reorderColumn,
    reorderCardInSameColumn,
    moveCardToNewColumn,
    handleLastOperation,
  };
};
