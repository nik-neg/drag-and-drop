import type { ColumnType } from '@/data';
import { type Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { StateEnum } from '@/enums/state.enum';

/**
 * Note: not making `'is-dragging'` a `State` as it is
 * a _parallel_ state to `'is-column-over'`.
 *
 * Our board allows you to be over the column that is currently dragging
 */
export type State =
  | { type: StateEnum.IDLE }
  | { type: StateEnum.IS_CARD_OVER }
  | { type: StateEnum.IS_COLUMN_OVER; closestEdge: Edge | null }
  | { type: StateEnum.GENERATE_SAFARI_COLUMN_PREVIEW; container: HTMLElement }
  | { type: StateEnum.GENERATE_COLUMN_PREVIEW };

export interface IColumn {
  column: ColumnType;
}
