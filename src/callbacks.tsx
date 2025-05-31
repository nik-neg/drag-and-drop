import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import { OutcomeEnum } from "enums/outcome.enum";
import { TriggerEnum } from "enums/trigger.enum";
import { BoardState, Outcome } from "example";
import { ColumnMap, Person } from "pragmatic-drag-and-drop/documentation/examples/data/people";
import { ColumnType } from "pragmatic-drag-and-drop/documentation/examples/data/people";
import { RefObject, useCallback } from 'react';

interface IGetColumnsProps {
    boardState: RefObject<BoardState>;
}

export const getColumns = useCallback(({ boardState }: IGetColumnsProps) => {
    const { columnMap, orderedColumnIds } = boardState.current;

    return orderedColumnIds.map((columnId) => columnMap[columnId]);
}, []);


interface IReorderColumnProps {
    startIndex: number;
    finishIndex: number;
    trigger?: TriggerEnum;
    boardState: RefObject<BoardState>;
    handleSetData: (data: BoardState) => void;
}

export const reorderColumn = useCallback(
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

interface IReorderCardProps {
    columnId: string;
    startIndex: number;
    finishIndex: number;
    trigger?: TriggerEnum;
    boardState: RefObject<BoardState>;
    handleSetData: (data: BoardState) => void;
}

export const reorderCard = useCallback(
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

interface IMoveCardProps {
    startColumnId: string;
    finishColumnId: string;
    itemIndexInStartColumn: number;
    itemIndexInFinishColumn?: number;
    trigger?: TriggerEnum;
    boardState: RefObject<BoardState>;
    handleSetData: (data: BoardState) => void;
}

export const moveCard = useCallback(
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