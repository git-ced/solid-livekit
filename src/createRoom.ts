// ANCHOR Solid
import {
  createSignal,
  Accessor,
} from 'solid-js';

// ANCHOR LiveKit
import {
  AudioTrack,
  connect,
  ConnectOptions,
  Participant,
  RemoteTrack,
  Room,
  RoomEvent,
  Track,
} from 'livekit-client';

// ANCHOR Utils
import { sortParticipants } from './sortParticipants';

// ANCHOR Types
export interface RoomState {
  connect: (
    url: string,
    token: string,
    options?: ConnectOptions
  ) => Promise<Room | undefined>;
  isConnecting: Accessor<boolean>;
  room: Accessor<Room | undefined>;
  /* all participants in the room, including the local participant. */
  participants: Accessor<Participant[]>;
  /* all subscribed audio tracks in the room, not including local participant. */
  audioTracks: Accessor<AudioTrack[]>;
  error: Accessor<Error | undefined>;
}

export interface RoomOptions {
  sortParticipants?: (participants: Participant[]) => void;
}

export function createRoom(options?: RoomOptions): RoomState {
  const [room, setRoom] = createSignal<Room>();
  const [isConnecting, setIsConnecting] = createSignal(false);
  const [error, setError] = createSignal<Error>();
  const [participants, setParticipants] = createSignal<Participant[]>([]);
  const [audioTracks, setAudioTracks] = createSignal<AudioTrack[]>([]);

  const sortFunction = options?.sortParticipants ?? sortParticipants;

  const connectFunction = async (
    url: string,
    token: string,
    connectOptions?: ConnectOptions,
  ) => {
    setIsConnecting(true);

    try {
      const newRoom = await connect(url, token, connectOptions);
      setRoom(newRoom);

      const onParticipantsChanged = () => {
        const remotes: Participant[] = Array.from(newRoom.participants.values());
        const localParticipants = [newRoom.localParticipant, ...remotes];
        sortFunction(localParticipants, newRoom.localParticipant);
        setParticipants(localParticipants);
      };

      const onSubscribedTrackChanged = (track?: RemoteTrack) => {
        // ordering may have changed, re-sort
        onParticipantsChanged();

        if (!track || track.kind === Track.Kind.Audio) {
          const tracks: AudioTrack[] = [];
          newRoom.participants.forEach((participant) => {
            participant.audioTracks.forEach(({ audioTrack }) => {
              if (audioTrack) {
                tracks.push(audioTrack);
              }
            });
          });
          setAudioTracks(tracks);
        }
      };

      newRoom.once(RoomEvent.Disconnected, () => {
        setTimeout(() => setRoom(undefined));

        newRoom
          .off(RoomEvent.ParticipantConnected, onParticipantsChanged)
          .off(RoomEvent.ParticipantDisconnected, onParticipantsChanged)
          .off(RoomEvent.ActiveSpeakersChanged, onParticipantsChanged)
          .off(RoomEvent.TrackSubscribed, onSubscribedTrackChanged)
          .off(RoomEvent.TrackUnsubscribed, onSubscribedTrackChanged)
          .off(RoomEvent.LocalTrackPublished, onParticipantsChanged)
          .off(RoomEvent.LocalTrackUnpublished, onParticipantsChanged)
          .off(RoomEvent.AudioPlaybackStatusChanged, onParticipantsChanged);
      });

      newRoom
        .on(RoomEvent.ParticipantConnected, onParticipantsChanged)
        .on(RoomEvent.ParticipantDisconnected, onParticipantsChanged)
        .on(RoomEvent.ActiveSpeakersChanged, onParticipantsChanged)
        .on(RoomEvent.TrackSubscribed, onSubscribedTrackChanged)
        .on(RoomEvent.TrackUnsubscribed, onSubscribedTrackChanged)
        .on(RoomEvent.LocalTrackPublished, onParticipantsChanged)
        .on(RoomEvent.LocalTrackUnpublished, onParticipantsChanged)
      // trigger a state change by re-sorting participants
        .on(RoomEvent.AudioPlaybackStatusChanged, onParticipantsChanged);

      setIsConnecting(false);
      onSubscribedTrackChanged();

      return newRoom;
    } catch (err) {
      setIsConnecting(false);

      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error('an error has occured'));
      }

      return undefined;
    }
  };

  return {
    connect: connectFunction,
    isConnecting,
    room,
    error,
    participants,
    audioTracks,
  };
}
