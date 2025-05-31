import React, {
	forwardRef,
	Fragment,
	memo,
	type Ref,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';

import ReactDOM from 'react-dom';
import invariant from 'tiny-invariant';
import styled from 'styled-components';

import Avatar from '@atlaskit/avatar';
import { IconButton } from '@atlaskit/button/new';
import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';
// eslint-disable-next-line @atlaskit/design-system/no-banned-imports
import mergeRefs from '@atlaskit/ds-lib/merge-refs';
import Heading from '@atlaskit/heading';
// This is the smaller MoreIcon soon to be more easily accessible with the
// ongoing icon project
import MoreIcon from '@atlaskit/icon/utility/migration/show-more-horizontal--editor-more';
import {
	attachClosestEdge,
	type Edge,
	extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
	draggable,
	dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { preserveOffsetOnSource } from '@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { dropTargetForExternal } from '@atlaskit/pragmatic-drag-and-drop/external/adapter';
import { Box, Grid, Stack, xcss } from '@atlaskit/primitives';
import { token } from '@atlaskit/tokens';

import { type ColumnType, type Person } from '../../data/people';

import { useBoardContext } from './board-context';
import { useColumnContext } from './column-context';

type State =
	| { type: 'idle' }
	| { type: 'preview'; container: HTMLElement; rect: DOMRect }
	| { type: 'dragging' };

const idleState: State = { type: 'idle' };
const draggingState: State = { type: 'dragging' };

const noMarginStyles = xcss({ margin: 'space.0' });
const noPointerEventsStyles = xcss({ pointerEvents: 'none' });
const baseStyles = xcss({
	width: '100%',
	padding: 'space.100',
	backgroundColor: 'elevation.surface',
	borderRadius: 'border.radius.200',
	position: 'relative',
	':hover': {
		backgroundColor: 'elevation.surface.hovered',
	},
});

const stateStyles: {
	[Key in State['type']]: ReturnType<typeof xcss> | undefined;
} = {
	idle: xcss({
		cursor: 'grab',
		boxShadow: 'elevation.shadow.raised',
	}),
	dragging: xcss({
		opacity: 0.4,
		boxShadow: 'elevation.shadow.raised',
	}),
	// no shadow for preview - the platform will add it's own drop shadow
	preview: undefined,
};

const buttonColumnStyles = xcss({
	alignSelf: 'start',
});

type CardPrimitiveProps = {
	closestEdge: Edge | null;
	item: Person;
	state: State;
	actionMenuTriggerRef?: Ref<HTMLButtonElement>;
};

function MoveToOtherColumnItem({
	targetColumn,
	startIndex,
}: {
	targetColumn: ColumnType;
	startIndex: number;
}) {
	const { moveCard } = useBoardContext();
	const { columnId } = useColumnContext();

	const onClick = useCallback(() => {
		moveCard({
			startColumnId: columnId,
			finishColumnId: targetColumn.columnId,
			itemIndexInStartColumn: startIndex,
		});
	}, [columnId, moveCard, startIndex, targetColumn.columnId]);

	return <DropdownItem onClick={onClick}>{targetColumn.title}</DropdownItem>;
}

function LazyDropdownItems({ userId }: { userId: string }) {
	const { getColumns, reorderCard } = useBoardContext();
	const { columnId, getCardIndex, getNumCards } = useColumnContext();

	const numCards = getNumCards();
	const startIndex = getCardIndex(userId);

	const moveToTop = useCallback(() => {
		reorderCard({ columnId, startIndex, finishIndex: 0 });
	}, [columnId, reorderCard, startIndex]);

	const moveUp = useCallback(() => {
		reorderCard({ columnId, startIndex, finishIndex: startIndex - 1 });
	}, [columnId, reorderCard, startIndex]);

	const moveDown = useCallback(() => {
		reorderCard({ columnId, startIndex, finishIndex: startIndex + 1 });
	}, [columnId, reorderCard, startIndex]);

	const moveToBottom = useCallback(() => {
		reorderCard({ columnId, startIndex, finishIndex: numCards - 1 });
	}, [columnId, reorderCard, startIndex, numCards]);

	const isMoveUpDisabled = startIndex === 0;
	const isMoveDownDisabled = startIndex === numCards - 1;

	const moveColumnOptions = getColumns().filter((column) => column.columnId !== columnId);

	return (
		<Fragment>
			<DropdownItemGroup title="Reorder">
				<DropdownItem onClick={moveToTop} isDisabled={isMoveUpDisabled}>
					Move to top
				</DropdownItem>
				<DropdownItem onClick={moveUp} isDisabled={isMoveUpDisabled}>
					Move up
				</DropdownItem>
				<DropdownItem onClick={moveDown} isDisabled={isMoveDownDisabled}>
					Move down
				</DropdownItem>
				<DropdownItem onClick={moveToBottom} isDisabled={isMoveDownDisabled}>
					Move to bottom
				</DropdownItem>
			</DropdownItemGroup>
			{moveColumnOptions.length ? (
				<DropdownItemGroup title="Move to">
					{moveColumnOptions.map((column) => (
						<MoveToOtherColumnItem
							key={column.columnId}
							targetColumn={column}
							startIndex={startIndex}
						/>
					))}
				</DropdownItemGroup>
			) : null}
		</Fragment>
	);
}

// const CardPrimitive = forwardRef<HTMLDivElement, CardPrimitiveProps>(function CardPrimitive(
// 	{ closestEdge, item, state, actionMenuTriggerRef },
// 	ref,
// ) {
// 	const { avatarUrl, name, role, userId } = item;

// 	return (
// 		<Grid
// 			ref={ref}
// 			testId={`item-${userId}`}
// 			templateColumns="auto 1fr auto"
// 			columnGap="space.100"
// 			alignItems="center"
// 			xcss={[baseStyles, stateStyles[state.type]]}
// 		>
// 			<Box as="span" xcss={noPointerEventsStyles}>
// 				<Avatar size="large" src={avatarUrl} />
// 			</Box>

// 			<Stack space="space.050" grow="fill">
// 				<Heading size="xsmall" as="span">
// 					{name}
// 				</Heading>
// 				<Box as="small" xcss={noMarginStyles}>
// 					{role}
// 				</Box>
// 			</Stack>
// 			<Box xcss={buttonColumnStyles}>
// 				<DropdownMenu
// 					trigger={({ triggerRef, ...triggerProps }) => (
// 						<IconButton
// 							ref={
// 								actionMenuTriggerRef
// 									? mergeRefs([triggerRef, actionMenuTriggerRef])
// 									: // Workaround for IconButton typing issue
// 									mergeRefs([triggerRef])
// 							}
// 							icon={MoreIcon}
// 							label={`Move ${name}`}
// 							appearance="default"
// 							spacing="compact"
// 							{...triggerProps}
// 						/>
// 					)}
// 				>
// 					<LazyDropdownItems userId={userId} />
// 				</DropdownMenu>
// 			</Box>

// 			{closestEdge && <DropIndicator edge={closestEdge} gap={token('space.100', '0')} />}
// 		</Grid>
// 	);
// });

const CardContainer = styled.div`
	background: white;
	border-radius: 4px;
	padding: 12px;
	margin-bottom: 8px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	cursor: pointer;
	&:hover {
		background: #f4f5f7;
	}
`;

export const Card = memo(function Card({ item }: { item: Person }) {
	const cardRef = useRef<HTMLDivElement>(null);
	const { registerCard } = useBoardContext();
	const { columnId } = useColumnContext();

	useEffect(() => {
		if (!cardRef.current) return;

		registerCard({
			cardId: item.userId,
			element: cardRef.current,
			actionMenuTrigger: cardRef.current,
		});
	}, [item.userId, registerCard]);

	return (
		<CardContainer ref={cardRef}>
			{item.name}
		</CardContainer>
	);
});
