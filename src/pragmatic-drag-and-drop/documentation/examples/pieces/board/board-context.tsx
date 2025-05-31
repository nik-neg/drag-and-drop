import React, { createContext, useContext } from 'react';

import invariant from 'tiny-invariant';

import type { CleanupFn } from '@atlaskit/pragmatic-drag-and-drop/types';

import type { ColumnType } from '../../data/people';
import { TriggerEnum } from 'enums/trigger.enum';

export type BoardContextValue = {
	getColumns: () => any[];

	reorderColumn: (args: { startIndex: number; finishIndex: number; trigger?: TriggerEnum }) => void;

	reorderCard: (args: { columnId: string; startIndex: number; finishIndex: number; trigger?: TriggerEnum }) => void;

	moveCard: (args: {
		startColumnId: string;
		finishColumnId: string;
		itemIndexInStartColumn: number;
		itemIndexInFinishColumn?: number;
		trigger?: TriggerEnum;
	}) => void;

	registerCard: (args: { cardId: string; element: HTMLElement; actionMenuTrigger: HTMLElement }) => void;

	registerColumn: (args: { columnId: string; element: HTMLElement }) => void;

	instanceId: symbol;
};

export const BoardContext = createContext<BoardContextValue | null>(null);

export function useBoardContext() {
	const context = useContext(BoardContext);
	if (!context) {
		throw new Error('useBoardContext must be used within a BoardContext.Provider');
	}
	return context;
}
