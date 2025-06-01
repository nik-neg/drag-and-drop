import type { BoardState } from '@/components/board/types';
import { DataTypeEnum } from '@/enums/data-type.enum';
import { TriggerEnum } from '@/enums/trigger.enum';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import type { Registry } from '@/provider/registry';
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/dist/types/types';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { useEffect, type RefObject } from 'react';
import { useCallbacks } from './useCallbacks';
import invariant from 'tiny-invariant';

interface IUseBoardProps {
  data: BoardState;
  handleSetData: (data: BoardState) => void;
  boardStateRef: RefObject<BoardState>;
  registry: Registry;
  triggerPostMoveFlash: (element: HTMLElement) => void;
  liveRegion: { announce: (message: string) => void; cleanup: () => void };
  instanceId: symbol;
}
export const useBoard = ({
  data,
  handleSetData,
  boardStateRef,
  registry,
  triggerPostMoveFlash,
  liveRegion,
  instanceId,
}: IUseBoardProps) => {
  const { lastOperation } = data;

  const {
    getColumns,
    reorderColumn,
    reorderCardInSameColumn,
    moveCardToNewColumn,
    handleLastOperation,
  } = useCallbacks();

  useEffect(() => {
    boardStateRef.current = data;
  }, [data]);

  useEffect(() => {
    return liveRegion.cleanup();
  }, []);

  useEffect(() => {
    handleLastOperation({
      lastOperation,
      boardStateRef,
      registry,
      triggerPostMoveFlash,
      liveRegion,
    });
  }, [handleLastOperation]);

  useEffect(() => {
    return combine(
      monitorForElements({
        canMonitor({ source }) {
          return source.data.instanceId === instanceId;
        },
        onDrop(args) {
          const { location, source } = args;
          // didn't drop on anything
          if (!location.current.dropTargets.length) {
            return;
          }
          // need to handle drop

          // 1. remove element from original position
          // 2. move to new position

          if (source.data.type === DataTypeEnum.COLUMN) {
            const startIndex: number = data.orderedColumnIds.findIndex(
              columnId => columnId === source.data.columnId
            );

            const target = location.current.dropTargets[0];
            const indexOfTarget: number = data.orderedColumnIds.findIndex(
              id => id === target.data.columnId
            );
            const closestEdgeOfTarget: Edge | null = extractClosestEdge(target.data);

            const finishIndex = getReorderDestinationIndex({
              startIndex,
              indexOfTarget,
              closestEdgeOfTarget,
              axis: 'horizontal',
            });

            reorderColumn({
              startIndex,
              finishIndex,
              trigger: TriggerEnum.POINTER,
              boardState: boardStateRef,
              handleSetData,
            });
          }
          // Dragging a card
          if (source.data.type === DataTypeEnum.CARD) {
            const itemId = source.data.itemId;
            invariant(typeof itemId === 'string');
            // TODO: these lines not needed if item has columnId on it
            const [, startColumnRecord] = location.initial.dropTargets;
            const sourceId = startColumnRecord.data.columnId;
            invariant(typeof sourceId === 'string');
            const sourceColumn = data.columnMap[sourceId];
            const itemIndex = sourceColumn.items.findIndex(item => item.userId === itemId);

            if (location.current.dropTargets.length === 1) {
              const [destinationColumnRecord] = location.current.dropTargets;
              const destinationId = destinationColumnRecord.data.columnId;
              invariant(typeof destinationId === 'string');
              const destinationColumn = data.columnMap[destinationId];
              invariant(destinationColumn);

              // reordering in same column
              if (sourceColumn === destinationColumn) {
                const destinationIndex = getReorderDestinationIndex({
                  startIndex: itemIndex,
                  indexOfTarget: sourceColumn.items.length - 1,
                  closestEdgeOfTarget: null,
                  axis: 'vertical',
                });
                reorderCardInSameColumn({
                  columnId: sourceColumn.columnId,
                  startIndex: itemIndex,
                  finishIndex: destinationIndex,
                  trigger: TriggerEnum.POINTER,
                  boardState: boardStateRef,
                  handleSetData,
                });
                return;
              }

              // moving to a new column
              moveCardToNewColumn({
                itemIndexInStartColumn: itemIndex,
                startColumnId: sourceColumn.columnId,
                finishColumnId: destinationColumn.columnId,
                trigger: TriggerEnum.POINTER,
                boardState: boardStateRef,
                handleSetData,
              });
              return;
            }

            // dropping in a column (relative to a card)
            if (location.current.dropTargets.length === 2) {
              const [destinationCardRecord, destinationColumnRecord] = location.current.dropTargets;
              const destinationColumnId = destinationColumnRecord.data.columnId;
              invariant(typeof destinationColumnId === 'string');
              const destinationColumn = data.columnMap[destinationColumnId];

              const indexOfTarget = destinationColumn.items.findIndex(
                item => item.userId === destinationCardRecord.data.itemId
              );
              const closestEdgeOfTarget: Edge | null = extractClosestEdge(
                destinationCardRecord.data
              );

              // case 1: ordering in the same column
              if (sourceColumn === destinationColumn) {
                const destinationIndex = getReorderDestinationIndex({
                  startIndex: itemIndex,
                  indexOfTarget,
                  closestEdgeOfTarget,
                  axis: 'vertical',
                });
                reorderCardInSameColumn({
                  columnId: sourceColumn.columnId,
                  startIndex: itemIndex,
                  finishIndex: destinationIndex,
                  trigger: TriggerEnum.POINTER,
                  boardState: boardStateRef,
                  handleSetData,
                });
                return;
              }

              // case 2: moving into a new column relative to a card

              const destinationIndex =
                closestEdgeOfTarget === 'bottom' ? indexOfTarget + 1 : indexOfTarget;

              moveCardToNewColumn({
                itemIndexInStartColumn: itemIndex,
                startColumnId: sourceColumn.columnId,
                finishColumnId: destinationColumn.columnId,
                itemIndexInFinishColumn: destinationIndex,
                trigger: TriggerEnum.POINTER,
                boardState: boardStateRef,
                handleSetData,
              });
            }
          }
        },
      })
    );
  }, [data, instanceId, moveCardToNewColumn, reorderCardInSameColumn, reorderColumn]);

  return {
    getColumns,
    reorderColumn,
    reorderCardInSameColumn,
    moveCardToNewColumn,
  };
};
