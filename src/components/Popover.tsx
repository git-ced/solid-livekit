/* eslint-disable @typescript-eslint/no-unsafe-call */
// ANCHOR Solid
import {
  createSignal,
  JSX,
} from 'solid-js';

// ANCHOR Headless
import {
  Popover as HeadlessPopover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from 'solid-headless';

// ANCHOR Popper
import usePopper from 'solid-popper';

export declare type AutoPlacement = 'auto' | 'auto-start' | 'auto-end';
export declare type VariationPlacement = 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'right-start' | 'right-end' | 'left-start' | 'left-end';
export declare type BasePlacement = 'top' | 'bottom' | 'left' | 'right';
export declare type Placement = AutoPlacement | BasePlacement | VariationPlacement;

export interface PopoverProps {
  children: JSX.Element;
  isOpen?: boolean;
  placement?: Placement;
  content: JSX.Element;
}

export const Popover = (
  props: PopoverProps,
): JSX.Element => {
  const [anchor, setAnchor] = createSignal<HTMLElement>();
  const [popper, setPopper] = createSignal<HTMLElement>();

  usePopper(anchor, popper, {
    placement: props.placement ?? 'auto',
  });

  return (
    <HeadlessPopover isOpen={props.isOpen}>
      {({ isOpen }) => (
        <>
          <PopoverButton ref={setAnchor} type="button">
            {props.children}
          </PopoverButton>
          <Transition show={isOpen() as boolean}>
            <PopoverPanel ref={setPopper}>
              {props.content}
            </PopoverPanel>
          </Transition>
        </>
      )}
    </HeadlessPopover>
  );
};
