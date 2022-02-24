// ANCHOR Solid
import {
  JSX,
  mergeProps,
  createSignal,
  createEffect,
  Show,
  onCleanup,
} from 'solid-js';

// ANCHOR Icons
import {
  FaSolidVideo,
  FaSolidVideoSlash,
} from 'solid-icons/fa';

// ANCHOR LiveKit
import { Room } from 'livekit-client';

// ANCHOR Components
import { ControlButton, MenuItem } from './ControlButton';

export interface VideoSelectButtonProps {
  isEnabled: boolean;
  onClick?: () => void;
  onSourceSelected?: (device: MediaDeviceInfo) => void;
  disableText?: string;
  enableText?: string;
  className?: string;
  popoverContainerClassName?: string;
  popoverTriggerBtnClassName?: string;
  popoverTriggerBtnSeparatorClassName?: string;
}

export const VideoSelectButton = (
  props: VideoSelectButtonProps,
): JSX.Element => {
  const mergedProps = mergeProps({
    disableText: 'Disable Video',
    enableText: 'Enable Video',
  }, props);

  const [sources, setSources] = createSignal<MediaDeviceInfo[]>([]);
  const [menuItems, setMenuItems] = createSignal<MenuItem[]>([]);

  const listVideoDevices = () => {
    Room.getLocalDevices('videoinput')
      .then((devices) => {
        setSources(devices);
        setMenuItems(
          devices.map((item) => ({ label: item.label })),
        );
        // eslint-disable-next-line no-console
      }, console.error);
  };

  createEffect(() => {
    listVideoDevices();
    navigator.mediaDevices.addEventListener('devicechange', listVideoDevices);

    onCleanup(() => {
      navigator.mediaDevices.removeEventListener(
        'devicechange',
        listVideoDevices,
      );
    });
  });

  const handleMenuItem = (item: MenuItem) => {
    const device = sources().find((source) => (
      source.label === item.label
    ));

    if (device && props.onSourceSelected) {
      props.onSourceSelected(device);
    }
  };

  const VideoSelectedIcon = (): JSX.Element => (
    <Show
      when={props.isEnabled}
      fallback={<FaSolidVideoSlash className="icon" height={32} />}
    >
      <FaSolidVideo className="icon" height={32} />
    </Show>
  );

  return (
    <ControlButton
      label={props.isEnabled
        ? mergedProps.disableText
        : mergedProps.enableText}
      icon={<VideoSelectedIcon />}
      onClick={props.onClick}
      menuItems={menuItems()}
      onMenuItemClick={handleMenuItem}
      className={props.className}
      popoverContainerClassName={props.popoverContainerClassName}
      popoverTriggerBtnClassName={props.popoverTriggerBtnClassName}
      popoverTriggerBtnSeparatorClassName={props.popoverTriggerBtnSeparatorClassName}
    />
  );
};
