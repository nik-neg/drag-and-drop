import { type ColumnType } from '@/data';

export interface MoveToOtherColumnItemProps {
  targetColumn: ColumnType;
  startIndex: number;
}

export interface LazyDropdownItemsProps {
  userId: string;
}
