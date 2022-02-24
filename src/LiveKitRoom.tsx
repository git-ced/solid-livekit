// ANCHOR Solid
import {
  createEffect,
  JSX,
  mergeProps,
  onCleanup,
} from 'solid-js';

// ANCHOR LiveKit
import {
  ConnectOptions,
  Participant,
  Room,
} from 'livekit-client';

// ANCHOR Signals
import { createRoom } from './signals/createRoom';

// ANCHOR Components
import { ControlsProps } from './components/ControlsView';
import { ParticipantProps } from './components/ParticipantView';
import { StageProps } from './components/StageProps';
import { StageView } from './components/StageView';

// ANCHOR Types
export type StageRenderer = (props: StageProps) => JSX.Element;
export type ParticipantRenderer = (props: ParticipantProps) => JSX.Element;
export type ControlsRenderer = (props: ControlsProps) => JSX.Element;

export interface RoomProps {
  url: string;
  token: string;
  connectOptions?: ConnectOptions;
  // override default participant sort
  sortParticipants?: (participants: Participant[]) => void;
  // when first connected to room
  onConnected?: (room: Room) => void;
  // when user leaves the room
  onLeave?: (room: Room) => void;
  stageRenderer?: StageRenderer;
  participantRenderer?: ParticipantRenderer;
  controlRenderer?: ControlsRenderer;
}

export const LiveKitRoom = (props: RoomProps): JSX.Element => {
  const mergedProps = mergeProps({ connectOptions: {} }, props);
  const roomState = createRoom({ sortParticipants: props.sortParticipants });

  createEffect(() => {
    roomState().connect(
      props.url,
      props.token,
      mergedProps.connectOptions,
    ).then((room) => {
      if (!room) {
        return;
      }

      if (props.onConnected) {
        props.onConnected(room);
      }

      onCleanup(() => {
        room.disconnect();
      });
    })
      // eslint-disable-next-line no-console
      .catch(console.error);
  });

  const selectedStageRenderer = props.stageRenderer ?? StageView;

  return selectedStageRenderer({
    roomState: roomState(),
    participantRenderer: props.participantRenderer,
    controlRenderer: props.controlRenderer,
    onLeave: props.onLeave,
  });
};
