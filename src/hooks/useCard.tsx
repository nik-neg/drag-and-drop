import {
  attachClosestEdge,
  extractClosestEdge,
  type Edge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { useEffect } from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import type { IUseCard, State } from '../components/card/types';
import { useBoardContext } from '@/provider/context';
import invariant from 'tiny-invariant';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { preserveOffsetOnSource } from '@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { dropTargetForExternal } from '@atlaskit/pragmatic-drag-and-drop/external/adapter';
import { DataTypeEnum } from '@/enums/data-type.enum';
import { StateEnum } from '@/enums/state.enum';

const idleState: State = { type: StateEnum.IDLE };
const draggingState: State = { type: StateEnum.DRAGGING };

export const useCard = ({ item }: IUseCard) => {
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
        getInitialData: () => ({ type: DataTypeEnum.CARD, itemId: userId, instanceId }),
        onGenerateDragPreview: ({ location, source, nativeSetDragImage }) => {
          const rect = source.element.getBoundingClientRect();

          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: preserveOffsetOnSource({
              element,
              input: location.current.input,
            }),
            render({ container }) {
              setState({ type: StateEnum.PREVIEW, container, rect });
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
          return source.data.instanceId === instanceId && source.data.type === DataTypeEnum.CARD;
        },
        getIsSticky: () => true,
        getData: ({ input, element }) => {
          const data = { type: DataTypeEnum.CARD, itemId: userId };

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

  return {
    ref,
    closestEdge,
    state,
    actionMenuTriggerRef,
  };
};
