import { xcss } from '@atlaskit/primitives';

import Heading from '@atlaskit/heading';
import { Box } from '@atlaskit/primitives';
import { memo } from 'react';
import type { ColumnType } from '@/pragmatic-drag-and-drop/documentation/examples/data/people';
import { columnHeaderStyles } from '../column.styles';

const safariPreviewStyles = xcss({
  width: '250px',
  backgroundColor: 'elevation.surface.sunken',
  borderRadius: 'border.radius',
  padding: 'space.200',
});

export const SafariColumnPreview = memo(({ column }: { column: ColumnType }) => {
  return (
    <Box xcss={[columnHeaderStyles, safariPreviewStyles]}>
      <Heading size="xxsmall" as="span">
        {column.title}
      </Heading>
    </Box>
  );
});
