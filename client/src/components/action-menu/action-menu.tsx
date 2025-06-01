import { memo } from 'react';

import DropdownMenu, { type CustomTriggerProps } from '@atlaskit/dropdown-menu';
import { ActionMenuItems } from './action-menu-items';
import { IconButton } from '@atlaskit/button/dist/types/entry-points/new';
import mergeRefs from '@atlaskit/ds-lib/dist/types/utils/merge-refs';
import MoreIcon from '@atlaskit/icon/utility/migration/show-more-horizontal--editor-more';

function DropdownMenuTrigger({ triggerRef, ...triggerProps }: CustomTriggerProps) {
  return (
    <IconButton
      ref={mergeRefs([triggerRef])}
      appearance="subtle"
      label="Actions"
      spacing="compact"
      icon={MoreIcon}
      {...triggerProps}
    />
  );
}

export const ActionMenu = memo(() => {
  return (
    <DropdownMenu trigger={DropdownMenuTrigger}>
      <ActionMenuItems />
    </DropdownMenu>
  );
});
