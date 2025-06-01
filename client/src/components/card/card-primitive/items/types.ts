import { type ColumnType } from '@/pragmatic-drag-and-drop/documentation/examples/data/people';

export interface MoveToOtherColumnItemProps {
  targetColumn: ColumnType;
  startIndex: number;
}

export interface LazyDropdownItemsProps {
  userId: string;
}
