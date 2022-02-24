// ANCHOR Solid
import {
  JSX,
  createEffect,
  createSignal,
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
import { StageProps } from '../StageProps';

// ANCHOR Styles
import './styles.module.css';

export const SpeakerStage = (
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
                    width="100%"
                    height="100%"
                    orientation="landscape"
                    showOverlay={showOverlay()}
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
              <div className="stageCenter">
                <MainView />
              </div>
              <div className="sidebar">
                <For each={otherParticipants}>
                  {(participant) => (
                    <ParticipantRenderer
                      participant={participant}
                      width="100%"
                      aspectWidth={16}
                      aspectHeight={9}
                      showOverlay={showOverlay()}
                      onMouseEnter={() => setShowOverlay(true)}
                      onMouseLeave={() => setShowOverlay(false)}
                    />
                  )}
                </For>
              </div>
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
