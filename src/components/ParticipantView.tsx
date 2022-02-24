// ANCHOR Solid
import {
  JSX,
  createEffect,
  createSignal,
  onCleanup,
  Show,
  Switch,
  Match,
} from 'solid-js';
import AspectRatio from 'solid-aspect-ratio';

// ANCHOR Icons
import {
  FaSolidMicrophone,
  FaSolidMicrophoneSlash,
} from 'solid-icons/fa';

// ANCHOR LiveKit
import {
  ConnectionQuality,
  LocalTrack,
  Participant,
  RemoteTrack,
} from 'livekit-client';

// ANCHOR Types
import { Property } from 'csstype';

// ANCHOR Components
import { ConnectionQualityLow } from './ConnectionQualityLow';
import { ConnectionQualityMid } from './ConnectionQualityMid';
import { ConnectionQualityHigh } from './ConnectionQualityHigh';
import { useDisplay } from './DisplayContext';
import { VideoRenderer } from './VideoRenderer';

// ANCHOR Signals
import { createParticipant } from '../signals/createParticipant';

// ANCHOR Styles
import './styles.module.css';

export interface ParticipantProps {
  participant: Participant;
  displayName?: string;
  // width in CSS
  width?: Property.Width;
  // height in CSS
  height?: Property.Height;
  className?: string;
  // aspect ratio width, if set, maintains aspect ratio
  aspectWidth?: number;
  // aspect ratio height
  aspectHeight?: number;
  // determine whether to contain or cover video.
  // cover mode is used when layout orientation matches video orientation
  orientation?: 'landscape' | 'portrait';
  // true if overlay with participant info should be shown
  showOverlay?: boolean;
  // true if connection quality should be shown
  showConnectionQuality?: boolean;
  // additional classname when participant is currently speaking
  speakerClassName?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}

export const ParticipantView = (props: ParticipantProps): JSX.Element => {
  const participant = createParticipant(props.participant);

  const [videoSize, setVideoSize] = createSignal<string>();
  const [currentBitrate, setCurrentBitrate] = createSignal<number>();
  const [objectFit, setObjectFit] = createSignal<Property.ObjectFit>('contain');
  const [videoOrientation, setVideoOrientation] = createSignal<'landscape' | 'portrait'>();
  const [displayName, setDisplayName] = createSignal(props.displayName);

  const display = useDisplay();

  const handleResize = (width: number, height: number) => {
    setVideoSize(`${width}x${height}`);
  };

  createEffect(() => {
    const interval = setInterval(() => {
      let total = 0;

      props.participant.tracks.forEach((pub) => {
        if (
          pub.track instanceof LocalTrack
          || pub.track instanceof RemoteTrack
        ) {
          total += pub.track.currentBitrate;
        }
      });

      setCurrentBitrate(total);
    }, 1000);

    onCleanup(() => clearInterval(interval));
  });

  const containerStyles: JSX.CSSProperties = {
    width: props.width,
    height: props.height,
  };

  let { orientation } = props;

  if (!props.orientation && props.aspectWidth && props.aspectHeight) {
    orientation = props.aspectWidth > props.aspectHeight
      ? 'landscape'
      : 'portrait';
  }

  createEffect(() => {
    const dimensions = participant().cameraPublication?.dimensions;

    if (dimensions) {
      const orientationValue = dimensions.width > dimensions.height
        ? 'landscape'
        : 'portrait';

      setVideoOrientation(orientationValue);
    }
  });

  createEffect(() => {
    if (videoOrientation() === orientation) {
      setObjectFit('cover');
    }
  });

  createEffect(() => {
    const name = displayName();

    if (!name) {
      const suffix = participant().isLocal ? ' (You)' : '';
      const newName = `${props.participant.name || props.participant.identity}${suffix}`;

      setDisplayName(newName);
    }
  });

  const MainElement = (): JSX.Element => {
    const publication = () => participant().cameraPublication;

    return (
      <Show
        when={publication()?.isSubscribed
          && !publication()?.isMuted
          && publication()?.track}
        fallback={<div className="placeholder" />}
      >
        {(track) => (
          <VideoRenderer
            track={track}
            isLocal={participant().isLocal}
            objectFit={objectFit()}
            width="100%"
            height="100%"
            onSizeChanged={handleResize}
          />
        )}
      </Show>
    );
  };

  const speakerClassName = props.speakerClassName || 'speaker';

  return (
    <div
      classList={{
        participant: true,
        [props.className ?? '']: !!props.className,
        [speakerClassName]: participant().isSpeaking,
      }}
      style={containerStyles}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
      onClick={props.onClick}
    >
      <Show
        when={props.aspectWidth}
        fallback={<MainElement />}
      >
        {(aspectWidth) => (
          <Show
            when={props.aspectHeight}
            fallback={<MainElement />}
          >
            {(aspectHeight) => (
              <AspectRatio ratio={aspectWidth / aspectHeight}>
                <MainElement />
              </AspectRatio>
            )}
          </Show>
        )}
      </Show>

      <Show when={props.showOverlay || display.showStats}>
        <div className="participantBar">
          <div className="name">{displayName}</div>
          <div className="center">
            <Show when={display.showStats}>
              <div className="stats">
                <div>{videoSize}</div>
                <Show when={currentBitrate()}>
                  {(bitrate) => (
                    <Show when={bitrate > 0}>
                      <div>{Math.round(bitrate / 1024)} kbps</div>
                    </Show>
                  )}
                </Show>
              </div>
            </Show>
          </div>
          <div>
            <Show when={props.showConnectionQuality}>
              <Switch>
                <Match when={participant().connectionQuality === ConnectionQuality.Excellent}>
                  <ConnectionQualityHigh />
                </Match>
                <Match when={participant().connectionQuality === ConnectionQuality.Good}>
                  <ConnectionQualityMid />
                </Match>
                <Match when={participant().connectionQuality === ConnectionQuality.Poor}>
                  <ConnectionQualityLow />
                </Match>
              </Switch>
            </Show>
          </div>
          <div>
            <Show
              when={props.participant.isMicrophoneEnabled}
              fallback={(
                <FaSolidMicrophoneSlash height={24} className="iconRed" />
              )}
            >
              <FaSolidMicrophone height={24} className="iconGreen" />
            </Show>
          </div>
        </div>
      </Show>
    </div>
  );
};
