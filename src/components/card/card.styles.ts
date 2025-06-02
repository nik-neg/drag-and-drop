import { xcss } from '@atlaskit/primitives';
import { type State } from './types';

export const noMarginStyles = xcss({ margin: 'space.0' });
export const noPointerEventsStyles = xcss({ pointerEvents: 'none' });
export const baseStyles = xcss({
  width: '100%',
  padding: 'space.100',
  backgroundColor: 'elevation.surface',
  borderRadius: 'border.radius.200',
  position: 'relative',
  ':hover': {
    backgroundColor: 'elevation.surface.hovered',
  },
});

export const stateStyles: {
  [Key in State['type']]: ReturnType<typeof xcss> | undefined;
} = {
  idle: xcss({
    cursor: 'grab',
    boxShadow: 'elevation.shadow.raised',
  }),
  dragging: xcss({
    opacity: 0.4,
    boxShadow: 'elevation.shadow.raised',
  }),
  // no shadow for preview - the platform will add it's own drop shadow
  preview: undefined,
};

export const buttonColumnStyles = xcss({
  alignSelf: 'start',
});
