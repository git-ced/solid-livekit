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
import { Participant } from 'livekit-client';

// ANCHOR Components
import { ControlsView } from '../ControlsView';
import { ParticipantView } from '../ParticipantView';
import { StageProps } from '../StageProps';

// ANCHOR Styles
import './styles.module.css';

export const GridStage = (
  props: StageProps,
): JSX.Element => {
  const [visibleParticipants, setVisibleParticipants] = createSignal<Participant[]>(
    [],
  );
  const [showOverlay, setShowOverlay] = createSignal(false);
  const [gridClass, setGridClass] = createSignal('grid1x1');

  // compute visible participants and sort.
  createEffect(() => {
    // determine grid size
    let numVisible = 1;
    const participantCount = props.roomState.participants.length;

    if (participantCount === 1) {
      setGridClass('grid1x1');
    } else if (participantCount === 2) {
      setGridClass('grid2x1');
      numVisible = 2;
    } else if (participantCount <= 4) {
      setGridClass('grid2x2');
      numVisible = Math.min(participantCount, 4);
    } else if (participantCount <= 9) {
      setGridClass('grid3x3');
      numVisible = Math.min(participantCount, 9);
    } else if (participantCount <= 16) {
      setGridClass('grid4x4');
      numVisible = Math.min(participantCount, 16);
    } else {
      setGridClass('grid4x4');
      numVisible = Math.min(participantCount, 25);
    }

    setVisibleParticipants((current) => {
      // remove any participants that are no longer connected
      const newParticipants: Participant[] = [];

      const currentRoom = props.roomState.room;

      current.forEach((p) => {
        if (currentRoom?.participants.has(p.sid)
          || currentRoom?.localParticipant.sid === p.sid
        ) {
          newParticipants.push(p);
        }
      });

      // ensure active speakers are all visible
      currentRoom?.activeSpeakers?.forEach((speaker) => {
        if (newParticipants.includes(speaker)
          || (speaker !== currentRoom?.localParticipant
            && !currentRoom?.participants.has(speaker.sid))
        ) {
          return;
        }

        // find a non-active speaker and switch
        const idx = newParticipants.findIndex((participant) => (
          !participant.isSpeaking
        ));
        if (idx >= 0) {
          newParticipants[idx] = speaker;
        } else {
          newParticipants.push(speaker);
        }
      });

      // add other non speakers
      props.roomState.participants.forEach((participant) => {
        const isFull = newParticipants.length >= numVisible;
        const isVisible = newParticipants.includes(participant) || participant.isSpeaking;

        if (!isFull && !isVisible) {
          newParticipants.push(participant);
        }
      });

      if (newParticipants.length > numVisible) {
        newParticipants.splice(numVisible, newParticipants.length - numVisible);
      }

      return newParticipants;
    });
  });

  return (
    <Switch
      fallback={() => {
        const ParticipantRenderer = props.participantRenderer ?? ParticipantView;
        const ControlRenderer = props.controlRenderer ?? ControlsView;

        return (
          // global container
          <div className="container">
            <div className={`gridStage ${gridClass()}`}>
              <For each={visibleParticipants()}>
                {(participant) => (
                  <ParticipantRenderer
                    participant={participant}
                    orientation="landscape"
                    width="100%"
                    height="100%"
                    showOverlay={showOverlay()}
                    showConnectionQuality
                    onMouseEnter={() => setShowOverlay(true)}
                    onMouseLeave={() => setShowOverlay(false)}
                  />
                )}
              </For>
            </div>
            <div className="controlsArea">
              <Show when={props.roomState.room}>
                {(room) => (
                  <ControlRenderer room={room} onLeave={props.onLeave} />
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
