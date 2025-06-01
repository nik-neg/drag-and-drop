import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import invariant from 'tiny-invariant';

import { triggerPostMoveFlash } from '@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';
import * as liveRegion from '@atlaskit/pragmatic-drag-and-drop-live-region';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import { type ColumnMap, getBasicData, } from './pragmatic-drag-and-drop/documentation/examples/data/people';
import { Board } from './pragmatic-drag-and-drop/documentation/examples/pieces/board/board';
import { BoardContext, type BoardContextValue } from './pragmatic-drag-and-drop/documentation/examples/pieces/board/board-context';
import { Column } from './pragmatic-drag-and-drop/documentation/examples/pieces/board/column';
import { createRegistry } from './pragmatic-drag-and-drop/documentation/examples/pieces/board/registry';
import { OutcomeEnum } from './enums/outcome.enum';
import { DataTypeEnum } from './enums/data-type.enum';
import { TriggerEnum } from './enums/trigger.enum';
import { useCallbacks } from './hooks/useCallbacks';
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

	const { getColumns, reorderColumn, reorderCardInSameColumn, moveCardToNewColumn, handleLastOperation } = useCallbacks();

	const [data, setData] = useState<BoardState>(initialData);

	const handleSetData = useCallback((data: BoardState) => {
		setData(data);
	}, []);

	const boardStateRef = useRef<BoardState>(data);

	const [registry] = useState(createRegistry);

	const { lastOperation } = data;

	const [instanceId] = useState(() => Symbol('instance-id'));

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
							(columnId) => columnId === source.data.columnId,
						);

						const target = location.current.dropTargets[0];
						const indexOfTarget: number = data.orderedColumnIds.findIndex(
							(id) => id === target.data.columnId,
						);
						const closestEdgeOfTarget: Edge | null = extractClosestEdge(target.data);

						const finishIndex = getReorderDestinationIndex({
							startIndex,
							indexOfTarget,
							closestEdgeOfTarget,
							axis: 'horizontal',
						});

						reorderColumn({ startIndex, finishIndex, trigger: TriggerEnum.POINTER, boardState: boardStateRef, handleSetData });
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
						const itemIndex = sourceColumn.items.findIndex((item) => item.userId === itemId);

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
								(item) => item.userId === destinationCardRecord.data.itemId,
							);
							const closestEdgeOfTarget: Edge | null = extractClosestEdge(
								destinationCardRecord.data,
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
			}),
		);
	}, [data, instanceId, moveCardToNewColumn, reorderCardInSameColumn, reorderColumn]);

	const contextValue: BoardContextValue = useMemo(() => {
		return {
			boardState: boardStateRef,
			handleSetData,
			getColumns: () => getColumns({ boardState: boardStateRef }),
			reorderColumn: (args: { startIndex: number; finishIndex: number; trigger?: TriggerEnum }) => reorderColumn({ ...args, boardState: boardStateRef, handleSetData }),
			reorderCardInSameColumn: (args: { columnId: string; startIndex: number; finishIndex: number; trigger?: TriggerEnum }) => reorderCardInSameColumn({ ...args, boardState: boardStateRef, handleSetData }),
			moveCardToNewColumn: (args: { startColumnId: string; finishColumnId: string; itemIndexInStartColumn: number; itemIndexInFinishColumn?: number; trigger?: TriggerEnum }) => moveCardToNewColumn({ ...args, boardState: boardStateRef, handleSetData }),
			registerCard: registry.registerCard,
			registerColumn: registry.registerColumn,
			instanceId,
		};
	}, [getColumns, reorderColumn, reorderCardInSameColumn, registry, moveCardToNewColumn, instanceId]);

	return (
		<BoardContext.Provider value={contextValue}>
			<Board>
				{data.orderedColumnIds.map((columnId) => {
					return <Column column={data.columnMap[columnId]} key={columnId} />;
				})}
			</Board>
		</BoardContext.Provider>
	);
}