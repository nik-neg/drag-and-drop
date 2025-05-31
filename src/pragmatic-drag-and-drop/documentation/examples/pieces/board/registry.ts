import invariant from 'tiny-invariant';

import type { CleanupFn } from '@atlaskit/pragmatic-drag-and-drop/types';

export type CardEntry = {
	element: HTMLElement;
	actionMenuTrigger: HTMLElement;
};

export type ColumnEntry = {
	element: HTMLElement;
};

type Registry = {
	cards: Map<string, CardEntry>;
	columns: Map<string, ColumnEntry>;
	registerCard: (args: { cardId: string; element: HTMLElement; actionMenuTrigger: HTMLElement }) => void;
	registerColumn: (args: { columnId: string; element: HTMLElement }) => void;
	getCard: (cardId: string) => CardEntry;
	getColumn: (columnId: string) => ColumnEntry;
};

/**
 * Registering cards and their action menu trigger element,
 * so that we can restore focus to the trigger when a card moves between columns.
 */
export const createRegistry = (): Registry => {
	const cards = new Map<string, CardEntry>();
	const columns = new Map<string, ColumnEntry>();

	return {
		cards,
		columns,
		registerCard: ({ cardId, element, actionMenuTrigger }) => {
			cards.set(cardId, { element, actionMenuTrigger });
		},
		registerColumn: ({ columnId, element }) => {
			columns.set(columnId, { element });
		},
		getCard: (cardId: string) => {
			const entry = cards.get(cardId);
			if (!entry) {
				throw new Error(`Card ${cardId} not found in registry`);
			}
			return entry;
		},
		getColumn: (columnId: string) => {
			const entry = columns.get(columnId);
			if (!entry) {
				throw new Error(`Column ${columnId} not found in registry`);
			}
			return entry;
		},
	};
}
