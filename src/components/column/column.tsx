import { memo, useCallback, useEffect, useMemo, useRef } from 'react';

import { createPortal } from 'react-dom';

import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';

import { Box, Flex, Inline, Stack } from '@atlaskit/primitives';
import { token } from '@atlaskit/tokens';

import { ColumnContext, type ColumnContextProps } from '@/provider/context';
import { cardListStyles, isDraggingStyles, stateStyles } from './column.styles';
import { columnHeaderStyles, scrollContainerStyles, stackStyles } from './column.styles';
import { columnStyles } from './column.styles';
import { Card } from '@/components/card/card';
import { type IColumn, type State } from './types';
import { ActionMenu } from '../action-menu/action-menu';
import { SafariColumnPreview } from './previews/safari-column-preview';
import { useColumn } from '@/hooks';
import Heading from '@atlaskit/heading';
import { StateEnum } from '@/enums/state.enum';

// preventing re-renders with stable state objects
export const idle: State = { type: StateEnum.IDLE };
export const isCardOver: State = { type: StateEnum.IS_CARD_OVER };

export const Column = memo(({ column }: IColumn) => {
  const { columnId, columnRef, columnInnerRef, headerRef, scrollableRef, state, isDragging } =
    useColumn({ column });

  const stableItems = useRef(column.items);

  useEffect(() => {
    stableItems.current = column.items;
  }, [column.items]);

  const getCardIndex = useCallback((userId: string) => {
    return stableItems.current.findIndex(item => item.userId === userId);
  }, []);

  const getNumCards = useCallback(() => {
    return stableItems.current.length;
  }, []);

  const contextValue: ColumnContextProps = useMemo(() => {
    return { columnId, getCardIndex, getNumCards };
  }, [columnId, getCardIndex, getNumCards]);

  return (
    <ColumnContext.Provider value={contextValue}>
      <Flex
        testId={`column-${columnId}`}
        ref={columnRef}
        direction="column"
        xcss={[columnStyles, stateStyles[state.type]]}
      >
        {/* This element takes up the same visual space as the column.
          We are using a separate element so we can have two drop targets
          that take up the same visual space (one for cards, one for columns)
        */}
        <Stack xcss={stackStyles} ref={columnInnerRef}>
          <Stack xcss={[stackStyles, isDragging ? isDraggingStyles : undefined]}>
            <Inline
              xcss={columnHeaderStyles}
              ref={headerRef}
              testId={`column-header-${columnId}`}
              spread="space-between"
              alignBlock="center"
            >
              <Heading size="xxsmall" as="span" testId={`column-header-title-${columnId}`}>
                {column.title}
              </Heading>
              <ActionMenu />
            </Inline>
            <Box xcss={scrollContainerStyles} ref={scrollableRef}>
              <Stack xcss={cardListStyles} space="space.100">
                {column.items.map(item => (
                  <Card item={item} key={item.userId} />
                ))}
              </Stack>
            </Box>
          </Stack>
        </Stack>
        {state.type === 'is-column-over' && state.closestEdge && (
          <DropIndicator edge={state.closestEdge} gap={token('space.200', '0')} />
        )}
      </Flex>
      {state.type === 'generate-safari-column-preview'
        ? createPortal(<SafariColumnPreview column={column} />, state.container)
        : null}
    </ColumnContext.Provider>
  );
});
