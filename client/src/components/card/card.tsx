import { memo } from 'react';

import ReactDOM from 'react-dom';

import { Box } from '@atlaskit/primitives';

import { type Person } from '@/data';

import { CardPrimitive } from './card-primitive/card-primitive';
import { useCard } from './useCard';
import { StateEnum } from '@/enums/state.enum';

export const Card = memo(({ item }: { item: Person }) => {
  const { ref, closestEdge, state, actionMenuTriggerRef } = useCard({ item });

  return (
    <>
      <CardPrimitive
        ref={ref}
        item={item}
        state={state}
        closestEdge={closestEdge}
        actionMenuTriggerRef={actionMenuTriggerRef}
      />
      {state.type === StateEnum.PREVIEW &&
        ReactDOM.createPortal(
          <Box
            style={{
              /**
               * Ensuring the preview has the same dimensions as the original.
               *
               * Using `border-box` sizing here is not necessary in this
               * specific example, but it is safer to include generally.
               */
              boxSizing: 'border-box',
              width: state.rect.width,
              height: state.rect.height,
            }}
          >
            <CardPrimitive item={item} state={state} closestEdge={null} />
          </Box>,
          state.container
        )}
    </>
  );
});
