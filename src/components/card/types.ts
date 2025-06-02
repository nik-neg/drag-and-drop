import type { Person } from '@/data';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/dist/types/types';
import type { Ref } from 'react';
import { StateEnum } from '@/enums/state.enum';

export type State =
  | { type: StateEnum.IDLE }
  | { type: StateEnum.PREVIEW; container: HTMLElement; rect: DOMRect }
  | { type: StateEnum.DRAGGING };

export type CardPrimitiveProps = {
  closestEdge: Edge | null;
  item: Person;
  state: State;
  actionMenuTriggerRef?: Ref<HTMLButtonElement>;
};

export interface IUseCard {
  item: Person;
}
