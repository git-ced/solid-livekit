// ANCHOR Solid
import {
  JSX,
  createSignal,
  createEffect,
  Show,
  For,
} from 'solid-js';

// ANCHOR Icons
import { FaSolidChevronDown } from 'solid-icons/fa';

// ANCHOR Components
import { Popover } from './Popover';

// ANCHOR Styles
import './styles.module.css';

interface ButtonProps {
  label: string;
  disabled?: boolean;
  onClick?: () => void;
  icon?: JSX.Element;
  className?: string;
  popoverContainerClassName?: string;
  popoverTriggerBtnClassName?: string;
  popoverTriggerBtnSeparatorClassName?: string;
  menuItems?: MenuItem[];
  onMenuItemClick?: (item: MenuItem) => void;
}

export interface MenuItem {
  label: string;
}

export const ControlButton = (
  props: ButtonProps,
): JSX.Element => {
  const [menuVisible, setMenuVisible] = createSignal(false);
  const [classes, setClasses] = createSignal('button');

  createEffect(() => {
    if (props.className) {
      setClasses((current) => {
        if (props.className) {
          return `${current} ${props.className}`;
        }

        return current;
      });
    }

    if (props.menuItems && props.menuItems.length > 0) {
      setClasses((current) => `${current} hasDropdown`);
    }
  });

  const handleMenuClick = (item: MenuItem) => {
    setMenuVisible(false);

    if (props.onMenuItemClick) {
      props.onMenuItemClick(item);
    }
  };

  const MenuTrigger = (): JSX.Element => (
    <Show when={props.menuItems}>
      {(menuItems) => (
        <Show when={menuItems.length > 0}>
          <button
            disabled={props.disabled}
            classList={{
              'button dropdown': true,
              [props.popoverTriggerBtnClassName ?? '']: !!props.popoverTriggerBtnClassName,
            }}
          >
            <div
              classList={{
                separator: true,
                [props.popoverTriggerBtnSeparatorClassName ?? '']: !!props.popoverTriggerBtnSeparatorClassName,
              }}
            />
            <FaSolidChevronDown height={32} />
          </button>
        </Show>
      )}
    </Show>
  );

  const Menu = (): JSX.Element => (
    <Show when={props.menuItems}>
      {(menuItems) => (
        <Show when={menuItems.length > 0}>
          <div
            classList={{
              popoverMenu: true,
              [props.popoverContainerClassName ?? '']: !!props.popoverContainerClassName,
            }}
          >
            <ul className="list">
              <For each={menuItems}>
                {(item) => (
                  <li onClick={() => handleMenuClick(item)}>
                    {item.label}
                  </li>
                )}
              </For>
            </ul>
          </div>
        </Show>
      )}
    </Show>
  );

  return (
    <Popover
      isOpen={menuVisible()}
      placement={'top'}
      content={<Menu />}
    >
      <div className="buttonWrapper">
        <button
          disabled={props.disabled}
          className={classes()}
          onClick={() => {
            if (props.onClick) {
              props.onClick();
            }
          }}
        >
          <Show when={props.icon}>
            {(icon) => icon}
          </Show>
          {props.label}
        </button>
        {<MenuTrigger />}
      </div>
    </Popover>
  );
};
