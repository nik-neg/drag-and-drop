import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { useEffect } from 'react';
import { useState } from 'react';
import { useRef } from 'react';
import type { IColumn, State } from './types';
import { idle, isCardOver } from './column';
import { useBoardContext } from '@/provider/context';
import invariant from 'tiny-invariant';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { centerUnderPointer } from '@atlaskit/pragmatic-drag-and-drop/element/center-under-pointer';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { attachClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/types';
import type { CleanupFn } from '@atlaskit/pragmatic-drag-and-drop/dist/types/entry-point/types';
import { DataTypeEnum } from '@/enums/data-type.enum';
import { StateEnum } from '@/enums/state.enum';

export const useColumn = ({ column }: IColumn) => {
  const columnId = column.columnId;

  const columnRef = useRef<HTMLDivElement | null>(null);

  const columnInnerRef = useRef<HTMLDivElement | null>(null);

  const headerRef = useRef<HTMLDivElement | null>(null);

  const scrollableRef = useRef<HTMLDivElement | null>(null);

  const [state, setState] = useState<State>(idle);

  const [isDragging, setIsDragging] = useState<boolean>(false);

  const { instanceId, registerColumn } = useBoardContext();

  useEffect(() => {
    invariant(columnRef.current);

    invariant(columnInnerRef.current);

    invariant(headerRef.current);

    invariant(scrollableRef.current);

    return combine(
      registerColumn({
        columnId,
        element: columnRef.current,
      }) as unknown as CleanupFn,
      draggable({
        element: columnRef.current,
        dragHandle: headerRef.current,
        getInitialData: () => ({ columnId, type: DataTypeEnum.COLUMN, instanceId }),
        onGenerateDragPreview: ({ nativeSetDragImage }) => {
          const isSafari: boolean =
            navigator.userAgent.includes('AppleWebKit') && !navigator.userAgent.includes('Chrome');

          if (!isSafari) {
            setState({ type: 'generate-column-preview' });
            return;
          }
          setCustomNativeDragPreview({
            getOffset: centerUnderPointer,
            render: ({ container }) => {
              setState({
                type: 'generate-safari-column-preview',
                container,
              });
              return () => setState(idle);
            },
            nativeSetDragImage,
          });
        },
        onDragStart: () => {
          setIsDragging(true);
        },
        onDrop() {
          setState(idle);
          setIsDragging(false);
        },
      }),
      dropTargetForElements({
        element: columnInnerRef.current,
        getData: () => ({ columnId }),
        canDrop: ({ source }) => {
          return source.data.instanceId === instanceId && source.data.type === DataTypeEnum.CARD;
        },
        getIsSticky: () => true,
        onDragEnter: () => setState(isCardOver),
        onDragLeave: () => setState(idle),
        onDragStart: () => setState(isCardOver),
        onDrop: () => setState(idle),
      }),
      dropTargetForElements({
        element: columnRef.current,
        canDrop: ({ source }) => {
          return source.data.instanceId === instanceId && source.data.type === DataTypeEnum.COLUMN;
        },
        getIsSticky: () => true,
        getData: ({ input, element }) => {
          const data = {
            columnId,
          };
          return attachClosestEdge(data, {
            input,
            element,
            allowedEdges: ['left', 'right'],
          });
        },
        onDragEnter: args => {
          setState({
            type: StateEnum.IS_COLUMN_OVER,
            closestEdge: extractClosestEdge(args.self.data),
          });
        },
        onDrag: args => {
          // skip react re-render if edge is not changing
          setState(current => {
            const closestEdge: Edge | null = extractClosestEdge(args.self.data);
            if (current.type === StateEnum.IS_COLUMN_OVER && current.closestEdge === closestEdge) {
              return current;
            }
            return {
              type: StateEnum.IS_COLUMN_OVER,
              closestEdge,
            };
          });
        },
        onDragLeave: () => {
          setState(idle);
        },
        onDrop: () => {
          setState(idle);
        },
      }),
      autoScrollForElements({
        element: scrollableRef.current,
        canScroll: ({ source }) =>
          source.data.instanceId === instanceId && source.data.type === DataTypeEnum.CARD,
      })
    );
  }, [columnId, registerColumn, instanceId]);

  return {
    columnId,
    columnRef,
    columnInnerRef,
    headerRef,
    scrollableRef,
    state,
    isDragging,
  };
};
