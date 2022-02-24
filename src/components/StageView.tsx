// ANCHOR Solid
import {
  JSX,
  Show,
  createSignal,
  createEffect,
  For,
} from 'solid-js';

// ANCHOR Icons
import { FaSolidVolumeMute } from 'solid-icons/fa';

// ANCHOR LiveKit
import { Track, VideoTrack } from 'livekit-client';

// ANCHOR Signals
import createMediaQuery from '@solid-primitives/media';

// ANCHOR Components
import { AudioRenderer } from './AudioRenderer';
import { GridStage } from './desktop/GridStage';
import { SpeakerStage } from './desktop/SpeakerStage';
import { MobileStage } from './mobile/MobileStage';
import { useDisplay } from './DisplayContext';

// ANCHOR Types
import { StageProps } from './StageProps';

// ANCHOR Styles
import './styles.module.css';

export const StageView = (
  props: StageProps,
): JSX.Element => {
  const isDesktop = createMediaQuery('(min-width: 800px)');
  const display = useDisplay();

  const MainElement = (): JSX.Element => (
    <Show
      when={isDesktop()}
      fallback={<MobileStage {...props} />}
    >
      {() => {
        // find first participant with screen shared
        const [screenTrack, setScreenTrack] = createSignal<VideoTrack>();

        createEffect(() => {
          props.roomState.participants.forEach((participant) => {
            setScreenTrack((current) => {
              if (!current) {
                const track = participant.getTrack(Track.Source.ScreenShare);

                if (track?.isSubscribed && track.videoTrack) {
                  return track.videoTrack;
                }
              }

              return current;
            });
          });
        });

        return (
          <Show
            when={display.stageLayout === 'grid'
              && screenTrack === undefined}
            fallback={<SpeakerStage {...props} />}
          >
            <GridStage {...props} />
          </Show>
        );
      }}
    </Show>
  );

  return (
    <div className="container">
      <MainElement />
      <For each={props.roomState.audioTracks}>
        {(track) => (
          <AudioRenderer track={track} isLocal={false} />
        )}
      </For>

      <Show when={props.roomState.room?.canPlaybackAudio === false}>
        <div className="overlay">
          <button
            className="unmuteButton"
            onClick={() => {
              props.roomState.room?.startAudio()
                // eslint-disable-next-line no-console
                .catch(console.error);
            }}
          >
            <FaSolidVolumeMute
              className="icon"
              size="1x"
            />
            Click to Unmute
          </button>
        </div>
      </Show>
    </div>
  );
};
