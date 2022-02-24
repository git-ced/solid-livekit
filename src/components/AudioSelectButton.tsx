// ANCHOR Solid
import {
  createEffect,
  createSignal,
  JSX,
  mergeProps,
  onCleanup,
  Show,
} from 'solid-js';

// ANCHOR Icons
import {
  FaSolidMicrophone,
  FaSolidMicrophoneSlash,
} from 'solid-icons/fa';

// ANCHOR LiveKit
import { Room } from 'livekit-client';

// ANCHOR Components
import { ControlButton, MenuItem } from './ControlButton';

// ANCHOR Styles
import './styles.module.css';

export interface AudioSelectButtonProps {
  isMuted: boolean;
  onClick?: () => void;
  onSourceSelected?: (device: MediaDeviceInfo) => void;
  muteText?: string;
  unmuteText?: string;
  className?: string;
  popoverContainerClassName?: string;
  popoverTriggerBtnClassName?: string;
  popoverTriggerBtnSeparatorClassName?: string;
}

export const AudioSelectButton = (
  props: AudioSelectButtonProps,
): JSX.Element => {
  const mergedProps = mergeProps({
    muteText: 'Mute',
    unmuteText: 'Unmute',
  }, props);

  const [sources, setSources] = createSignal<MediaDeviceInfo[]>([]);
  const [menuItems, setMenuItems] = createSignal<MenuItem[]>([]);

  const listAudioDevices = () => {
    Room.getLocalDevices('audioinput')
      .then((devices) => {
        setSources(devices);
        setMenuItems(
          devices.map((item) => ({ label: item.label })),
        );
        // eslint-disable-next-line no-console
      }, console.error);
  };

  createEffect(() => {
    listAudioDevices();
    navigator.mediaDevices.addEventListener('devicechange', listAudioDevices);

    onCleanup(() => {
      navigator.mediaDevices.removeEventListener(
        'devicechange',
        listAudioDevices,
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

  const AudioSelectIcon = (): JSX.Element => (
    <Show
      when={props.isMuted}
      fallback={<FaSolidMicrophone className="icon" height={32} />}
    >
      <FaSolidMicrophoneSlash className="icon" height={32} />
    </Show>
  );

  return (
    <ControlButton
      label={props.isMuted
        ? mergedProps.unmuteText
        : mergedProps.muteText}
      icon={<AudioSelectIcon />}
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
