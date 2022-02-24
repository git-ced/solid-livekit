/* eslint-disable no-console */
// ANCHOR Solid
import {
  JSX, mergeProps, Show,
} from 'solid-js';

// ANCHOR Icons
import {
  FaSolidDesktop,
  FaSolidStop,
} from 'solid-icons/fa';

// ANCHOR LiveKit
import { Room } from 'livekit-client';

// ANCHOR Signals
import { createParticipant } from '../signals/createParticipant';

// ANCHOR Components
import { AudioSelectButton } from './AudioSelectButton';
import { VideoSelectButton } from './VideoSelectButton';
import { ControlButton } from './ControlButton';

// ANCHOR Styles
import './styles.module.css';

export interface ControlsProps {
  room: Room;
  enableScreenShare?: boolean;
  enableAudio?: boolean;
  enableVideo?: boolean;
  onLeave?: (room: Room) => void;
}

export const ControlsView = (
  props: ControlsProps,
): JSX.Element => {
  const mergedProps = mergeProps({
    enableScreenShare: true,
    enableVideo: true,
    enableAudio: true,
  }, props);

  const participant = createParticipant(props.room.localParticipant);

  const cameraPublication = () => participant().cameraPublication;

  const MuteButton = (): JSX.Element => {
    const enabled = props.room.localParticipant.isMicrophoneEnabled;

    return (
      <Show when={mergedProps.enableAudio}>
        <AudioSelectButton
          isMuted={!enabled}
          onClick={() => props.room.localParticipant.setMicrophoneEnabled(!enabled)}
          onSourceSelected={(device) => props.room.switchActiveDevice('audioinput', device.deviceId)
          }
        />
      </Show>
    );
  };

  const VideoButton = (): JSX.Element => {
    const enabled = !(cameraPublication()?.isMuted ?? true);

    return (
      <Show when={mergedProps.enableVideo}>
        <VideoSelectButton
          isEnabled={enabled}
          onClick={() => props.room.localParticipant.setCameraEnabled(!enabled)}
          onSourceSelected={(device) => {
            props.room.switchActiveDevice('videoinput', device.deviceId)
              .catch(console.error);
          }}
        />
      </Show>
    );
  };

  const ScreenButton = (): JSX.Element => {
    const enabled = props.room.localParticipant.isScreenShareEnabled;

    const ScreenButtonIcon = (): JSX.Element => (
      <Show
        when={enabled}
        fallback={<FaSolidDesktop className="icon" height={32} />}
      >
        <FaSolidStop className="icon" height={32} />
      </Show>
    );

    return (
      <Show when={mergedProps.enableScreenShare}>
        <ControlButton
          label={enabled ? 'Stop sharing' : 'Share screen'}
          icon={<ScreenButtonIcon />}
          onClick={() => {
            if (enabled) {
              props.room.localParticipant.setScreenShareEnabled(false)
                .catch(console.error);
            } else {
              props.room.localParticipant.setScreenShareEnabled(true)
                .catch(console.error);
            }
          }}
        />
      </Show>
    );
  };

  return (
    <div className="controlsWrapper">
      <MuteButton />
      <VideoButton />
      <ScreenButton />
      <Show when={props.onLeave}>
        {(onLeave) => (
          <ControlButton
            label="End"
            className="dangerButton"
            onClick={() => {
              props.room.disconnect();
              onLeave(props.room);
            }}
          />
        )}
      </Show>
    </div>
  );
};
