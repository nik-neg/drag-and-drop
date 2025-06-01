import type { Person } from '@/data';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/dist/types/types';
import type { Ref } from 'react';

export type State =
  | { type: 'idle' }
  | { type: 'preview'; container: HTMLElement; rect: DOMRect }
  | { type: 'dragging' };

export type CardPrimitiveProps = {
  closestEdge: Edge | null;
  item: Person;
  state: State;
  actionMenuTriggerRef?: Ref<HTMLButtonElement>;
};

export interface IUseCard {
  item: Person;
}
