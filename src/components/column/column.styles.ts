import { xcss } from '@atlaskit/primitives';
import { easeInOut } from '@atlaskit/motion/curves';
import { durations } from '@atlaskit/motion/durations';
import { type State } from './types';

export const columnStyles = xcss({
  width: '250px',
  backgroundColor: 'elevation.surface.sunken',
  borderRadius: 'border.radius.300',
  transition: `background ${durations.medium}ms ${easeInOut}`,
  position: 'relative',
  /**
   * TODO: figure out hover color.
   * There is no `elevation.surface.sunken.hovered` token,
   * so leaving this for now.
   */
});

export const stackStyles = xcss({
  // allow the container to be shrunk by a parent height
  // https://www.joshwcomeau.com/css/interactive-guide-to-flexbox/#the-minimum-size-gotcha-11
  minHeight: '0',

  // ensure our card list grows to be all the available space
  // so that users can easily drop on en empty list
  flexGrow: 1,
});

export const scrollContainerStyles = xcss({
  height: '100%',
  overflowY: 'auto',
});

export const cardListStyles = xcss({
  boxSizing: 'border-box',
  minHeight: '100%',
  padding: 'space.100',
  gap: 'space.100',
});

export const columnHeaderStyles = xcss({
  paddingInlineStart: 'space.200',
  paddingInlineEnd: 'space.200',
  paddingBlockStart: 'space.100',
  color: 'color.text.subtlest',
  userSelect: 'none',
});

export const stateStyles: {
  [key in State['type']]: ReturnType<typeof xcss> | undefined;
} = {
  idle: xcss({
    cursor: 'grab',
  }),
  'is-card-over': xcss({
    backgroundColor: 'color.background.selected.hovered',
  }),
  'is-column-over': undefined,
  /**
   * **Browser bug workaround**
   *
   * _Problem_
   * When generating a drag preview for an element
   * that has an inner scroll container, the preview can include content
   * vertically before or after the element
   *
   * _Fix_
   * We make the column a new stacking context when the preview is being generated.
   * We are not making a new stacking context at all times, as this _can_ mess up
   * other layering components inside of your card
   *
   * _Fix: Safari_
   * We have not found a great workaround yet. So for now we are just rendering
   * a custom drag preview
   */
  'generate-column-preview': xcss({
    isolation: 'isolate',
  }),
  'generate-safari-column-preview': undefined,
};

export const isDraggingStyles = xcss({
  opacity: 0.4,
});
