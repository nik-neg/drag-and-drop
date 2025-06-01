import { token } from '@atlaskit/tokens';

import { Box, Stack } from '@atlaskit/primitives';

import { baseStyles, buttonColumnStyles, noMarginStyles } from '../card.styles';
import { IconButton } from '@atlaskit/button/new';
import { Grid } from '@atlaskit/primitives';
import { forwardRef } from 'react';
import { noPointerEventsStyles, stateStyles } from '../card.styles';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { LazyDropdownItems } from './items';
import DropdownMenu from '@atlaskit/dropdown-menu';
import mergeRefs from '@atlaskit/ds-lib/merge-refs';
import type { CardPrimitiveProps } from '../types';
import Avatar from '@atlaskit/avatar';
import MoreIcon from '@atlaskit/icon/utility/migration/show-more-horizontal--editor-more';
import Heading from '@atlaskit/heading';

export const CardPrimitive = forwardRef<HTMLDivElement, CardPrimitiveProps>(
  ({ closestEdge, item, state, actionMenuTriggerRef }, ref) => {
    const { avatarUrl, name, role, userId } = item;

    return (
      <Grid
        ref={ref}
        testId={`item-${userId}`}
        templateColumns="auto 1fr auto"
        columnGap="space.100"
        alignItems="center"
        xcss={[baseStyles, stateStyles[state.type]]}
      >
        <Box as="span" xcss={noPointerEventsStyles}>
          <Avatar size="large" src={avatarUrl} />
        </Box>

        <Stack space="space.050" grow="fill">
          <Heading size="xsmall" as="span">
            {name}
          </Heading>
          <Box as="small" xcss={noMarginStyles}>
            {role}
          </Box>
        </Stack>
        <Box xcss={buttonColumnStyles}>
          <DropdownMenu
            trigger={({ triggerRef, ...triggerProps }) => (
              <IconButton
                ref={
                  actionMenuTriggerRef
                    ? mergeRefs([triggerRef, actionMenuTriggerRef])
                    : // Workaround for IconButton typing issue
                      mergeRefs([triggerRef])
                }
                icon={MoreIcon}
                label={`Move ${name}`}
                appearance="default"
                spacing="compact"
                {...triggerProps}
              />
            )}
          >
            <LazyDropdownItems userId={userId} />
          </DropdownMenu>
        </Box>

        {closestEdge && <DropIndicator edge={closestEdge} gap={token('space.100', '0')} />}
      </Grid>
    );
  }
);
