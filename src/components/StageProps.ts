// ANCHOR Types
import { JSX } from 'solid-js';
import { Room } from 'livekit-client';
import { RoomState } from '../signals/createRoom';
import { ControlsProps } from './ControlsView';
import { ParticipantProps } from './ParticipantView';

export interface StageProps {
  roomState: RoomState;
  participantRenderer?: (props: ParticipantProps) => JSX.Element;
  controlRenderer?: (props: ControlsProps) => JSX.Element;
  onLeave?: (room: Room) => void;
}
