import { DropdownItem } from '@atlaskit/dropdown-menu';

import { useCallback } from 'react';

import { useColumnContext } from '@/provider/context';

import { useBoardContext } from '@/provider/context';
import { memo } from 'react';
import { DropdownItemGroup } from '@atlaskit/dropdown-menu';
import { MoveToOtherColumnItem } from './move-to-other-column-item';
import type { LazyDropdownItemsProps } from './types';

export const LazyDropdownItems = memo(({ userId }: LazyDropdownItemsProps) => {
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
    <>
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
    </>
  );
});
