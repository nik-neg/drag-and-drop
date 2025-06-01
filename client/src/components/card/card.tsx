import { Fragment, memo } from 'react';

import ReactDOM from 'react-dom';

import { Box } from '@atlaskit/primitives';

import { type Person } from '@/data';

import { CardPrimitive } from './card-primitive/card-primitive';
import { useCard } from './useCard';

export const Card = memo(({ item }: { item: Person }) => {
  const { ref, closestEdge, state, actionMenuTriggerRef } = useCard({ item });

  return (
    <Fragment>
      <CardPrimitive
        ref={ref}
        item={item}
        state={state}
        closestEdge={closestEdge}
        actionMenuTriggerRef={actionMenuTriggerRef}
      />
      {state.type === 'preview' &&
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
    </Fragment>
  );
});
