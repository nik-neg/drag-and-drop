import {
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

import Avatar from '@atlaskit/avatar';
import { IconButton } from '@atlaskit/button/new';
import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';
import mergeRefs from '@atlaskit/ds-lib/merge-refs';
import Heading from '@atlaskit/heading';
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

export const MoveToOtherColumnItem = memo(
  ({ targetColumn, startIndex }: { targetColumn: ColumnType; startIndex: number }) => {
    const { moveCardToNewColumn } = useBoardContext();
    const { columnId } = useColumnContext();

    const onClick = useCallback(() => {
      moveCardToNewColumn({
        startColumnId: columnId,
        finishColumnId: targetColumn.columnId,
        itemIndexInStartColumn: startIndex,
      });
    }, [columnId, moveCardToNewColumn, startIndex, targetColumn.columnId]);

    return <DropdownItem onClick={onClick}>{targetColumn.title}</DropdownItem>;
  }
);

export const LazyDropdownItems = memo(({ userId }: { userId: string }) => {
  const { getColumns, reorderCardInSameColumn } = useBoardContext();
  const { columnId, getCardIndex, getNumCards } = useColumnContext();

  const numCards = getNumCards();
  const startIndex = getCardIndex(userId);

  const moveToTop = useCallback(() => {
    reorderCardInSameColumn({ columnId, startIndex, finishIndex: 0 });
  }, [columnId, reorderCardInSameColumn, startIndex]);

  const moveUp = useCallback(() => {
    reorderCardInSameColumn({
      columnId,
      startIndex,
      finishIndex: startIndex - 1,
    });
  }, [columnId, reorderCardInSameColumn, startIndex]);

  const moveDown = useCallback(() => {
    reorderCardInSameColumn({
      columnId,
      startIndex,
      finishIndex: startIndex + 1,
    });
  }, [columnId, reorderCardInSameColumn, startIndex]);

  const moveToBottom = useCallback(() => {
    reorderCardInSameColumn({
      columnId,
      startIndex,
      finishIndex: numCards - 1,
    });
  }, [columnId, reorderCardInSameColumn, startIndex, numCards]);

  const isMoveUpDisabled = startIndex === 0;
  const isMoveDownDisabled = startIndex === numCards - 1;

  const moveColumnOptions = getColumns().filter(column => column.columnId !== columnId);

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
          {moveColumnOptions.map(column => (
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
});

export const CardPrimitive = forwardRef<HTMLDivElement, CardPrimitiveProps>(
  ({ closestEdge, item, state, actionMenuTriggerRef }, ref) => {
    const { avatarUrl, name, role, userId } = item;

    return (
      <Grid
        ref={ref}
        testId={`item-${userId}`}
        templateColumns="auto 1fr auto"
        columnGap="space.100"
        alignItems="center"
        xcss={[baseStyles, stateStyles[state.type]]}
      >
        <Box as="span" xcss={noPointerEventsStyles}>
          <Avatar size="large" src={avatarUrl} />
        </Box>

        <Stack space="space.050" grow="fill">
          <Heading size="xsmall" as="span">
            {name}
          </Heading>
          <Box as="small" xcss={noMarginStyles}>
            {role}
          </Box>
        </Stack>
        <Box xcss={buttonColumnStyles}>
          <DropdownMenu
            trigger={({ triggerRef, ...triggerProps }) => (
              <IconButton
                ref={
                  actionMenuTriggerRef
                    ? mergeRefs([triggerRef, actionMenuTriggerRef])
                    : // Workaround for IconButton typing issue
                      mergeRefs([triggerRef])
                }
                icon={MoreIcon}
                label={`Move ${name}`}
                appearance="default"
                spacing="compact"
                {...triggerProps}
              />
            )}
          >
            <LazyDropdownItems userId={userId} />
          </DropdownMenu>
        </Box>

        {closestEdge && <DropIndicator edge={closestEdge} gap={token('space.100', '0')} />}
      </Grid>
    );
  }
);

export const Card = memo(({ item }: { item: Person }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const { userId } = item;
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
  const [state, setState] = useState<State>(idleState);

  const actionMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const { instanceId, registerCard } = useBoardContext();
  useEffect(() => {
    invariant(actionMenuTriggerRef.current);
    invariant(ref.current);
    return registerCard({
      cardId: userId,
      element: ref.current,
      actionMenuTrigger: actionMenuTriggerRef.current,
    });
  }, [registerCard, userId]);

  useEffect(() => {
    const element = ref.current;
    invariant(element);
    return combine(
      draggable({
        element: element,
        getInitialData: () => ({ type: 'card', itemId: userId, instanceId }),
        onGenerateDragPreview: ({ location, source, nativeSetDragImage }) => {
          const rect = source.element.getBoundingClientRect();

          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: preserveOffsetOnSource({
              element,
              input: location.current.input,
            }),
            render({ container }) {
              setState({ type: 'preview', container, rect });
              return () => setState(draggingState);
            },
          });
        },

        onDragStart: () => setState(draggingState),
        onDrop: () => setState(idleState),
      }),
      dropTargetForExternal({
        element: element,
      }),
      dropTargetForElements({
        element: element,
        canDrop: ({ source }) => {
          return source.data.instanceId === instanceId && source.data.type === 'card';
        },
        getIsSticky: () => true,
        getData: ({ input, element }) => {
          const data = { type: 'card', itemId: userId };

          return attachClosestEdge(data, {
            input,
            element,
            allowedEdges: ['top', 'bottom'],
          });
        },
        onDragEnter: args => {
          if (args.source.data.itemId !== userId) {
            setClosestEdge(extractClosestEdge(args.self.data));
          }
        },
        onDrag: args => {
          if (args.source.data.itemId !== userId) {
            setClosestEdge(extractClosestEdge(args.self.data));
          }
        },
        onDragLeave: () => {
          setClosestEdge(null);
        },
        onDrop: () => {
          setClosestEdge(null);
        },
      })
    );
  }, [instanceId, item, userId]);

  return (
    <Fragment>
      <CardPrimitive
        ref={ref}
        item={item}
        state={state}
        closestEdge={closestEdge}
        actionMenuTriggerRef={actionMenuTriggerRef}
      />
      {state.type === 'preview' &&
        ReactDOM.createPortal(
          <Box
            style={{
              /**
               * Ensuring the preview has the same dimensions as the original.
               *
               * Using `border-box` sizing here is not necessary in this
               * specific example, but it is safer to include generally.
               */
              boxSizing: 'border-box',
              width: state.rect.width,
              height: state.rect.height,
            }}
          >
            <CardPrimitive item={item} state={state} closestEdge={null} />
          </Box>,
          state.container
        )}
    </Fragment>
  );
});
