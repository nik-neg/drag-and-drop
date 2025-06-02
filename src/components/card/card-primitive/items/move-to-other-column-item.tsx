import { useCallback } from 'react';

import { useColumnContext } from '@/provider/context';

import { useBoardContext } from '@/provider/context';
import { memo } from 'react';
import { DropdownItem } from '@atlaskit/dropdown-menu';
import type { MoveToOtherColumnItemProps } from './types';

export const MoveToOtherColumnItem = memo(
  ({ targetColumn, startIndex }: MoveToOtherColumnItemProps) => {
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
