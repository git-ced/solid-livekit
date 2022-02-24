// ANCHOR Solid
import {
  JSX,
  createSignal,
  createEffect,
  Switch,
  Match,
  Show,
  For,
} from 'solid-js';

// ANCHOR LiveKit
import { Track, VideoTrack } from 'livekit-client';

// ANCHOR Components
import { ControlsView } from '../ControlsView';
import { ParticipantView } from '../ParticipantView';
import { ScreenShareView } from '../ScreenShareView';

// ANCHOR Styles
import './styles.module.css';

// ANCHOR Types
import { StageProps } from '../StageProps';

export const MobileStage = (
  props: StageProps,
): JSX.Element => {
  const [showOverlay, setShowOverlay] = createSignal(false);

  return (
    <Switch
      fallback={() => {
        const ParticipantRenderer = props.participantRenderer ?? ParticipantView;
        const ControlRenderer = props.controlRenderer ?? ControlsView;

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

        const otherParticipants = props.roomState.participants;

        const MainView = (): JSX.Element => (
          <Show
            when={screenTrack()}
            fallback={(
              <Show when={props.roomState.participants[0]}>
                {(participant) => (
                  <ParticipantRenderer
                    participant={participant}
                    showOverlay={showOverlay()}
                    width="100%"
                    height="100%"
                    orientation="portrait"
                    showConnectionQuality
                    onMouseEnter={() => setShowOverlay(true)}
                    onMouseLeave={() => setShowOverlay(false)}
                  />
                )}
              </Show>
            )}
          >
            {(track) => (
              <ScreenShareView
                track={track}
                height="100%"
                width="100%"
              />
            )}
          </Show>
        );

        return (
          // global container
          <div className="container">
            <div className="stage">
              <MainView />
            </div>
            <div className="participantsArea">
              <For each={otherParticipants}>
                {(participant) => (
                  <ParticipantRenderer
                    participant={participant}
                    className="participant"
                    aspectWidth={4}
                    aspectHeight={3}
                    showOverlay={showOverlay()}
                    onMouseEnter={() => setShowOverlay(true)}
                    onMouseLeave={() => setShowOverlay(false)}
                  />
                )}
              </For>
            </div>
            <div className="controlsArea">
              <Show when={props.roomState.room}>
                {(room) => (
                  <ControlRenderer
                    room={room}
                    enableScreenShare={false}
                    onLeave={props.onLeave}
                  />
                )}
              </Show>
            </div>
          </div>
        );
      }}
    >
      <Match when={props.roomState.error}>
        {(error) => <div>error {error.message}</div>}
      </Match>
      <Match when={props.roomState.isConnecting}>
        {() => <div>connecting</div>}
      </Match>
      <Match when={!props.roomState.room}>
        {() => <div>room closed</div>}
      </Match>
      <Match when={!props.roomState.participants.length}>
        {() => <div>no one is in the room</div>}
      </Match>
    </Switch>
  );
};
