import type { ColumnType } from '@/data';
import { type Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';

/**
 * Note: not making `'is-dragging'` a `State` as it is
 * a _parallel_ state to `'is-column-over'`.
 *
 * Our board allows you to be over the column that is currently dragging
 */
export type State =
  | { type: 'idle' }
  | { type: 'is-card-over' }
  | { type: 'is-column-over'; closestEdge: Edge | null }
  | { type: 'generate-safari-column-preview'; container: HTMLElement }
  | { type: 'generate-column-preview' };

export interface IColumn {
  column: ColumnType;
}
