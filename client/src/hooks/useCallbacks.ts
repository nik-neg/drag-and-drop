import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import { OutcomeEnum } from "@/enums/outcome.enum";
import { TriggerEnum } from "@/enums/trigger.enum";
import type { BoardState, Outcome } from "@/example";
import type { ColumnMap, Person } from "@/pragmatic-drag-and-drop/documentation/examples/data/people";
import type { ColumnType } from "@/pragmatic-drag-and-drop/documentation/examples/data/people";
import type { RefObject } from 'react';
import { useCallback } from 'react';


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


export const useCallbacks = () => {

    const getColumns = useCallback(({ boardState }: IGetColumnsProps) => {
        const { columnMap, orderedColumnIds } = boardState.current;

        return orderedColumnIds.map((columnId) => columnMap[columnId]);
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
            }

            handleSetData(newBoardState);
        },
        [],
    );

    const reorderCard = useCallback(
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
        }, []
    );

    const moveCard = useCallback(
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
                    items: sourceColumn.items.filter((i) => i.userId !== item.userId),
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
        }, []);


    return {
        getColumns,
        reorderColumn,
        reorderCard,
        moveCard
    }
}


