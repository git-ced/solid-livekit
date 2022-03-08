// ANCHOR Solid
import {
  createSignal,
  Accessor,
  onCleanup,
} from 'solid-js';

// ANCHOR LiveKit
import {
  AudioTrack,
  connect,
  ConnectOptions,
  Participant,
  RemoteTrack,
  Room,
  Track,
} from 'livekit-client';

// ANCHOR Utils
import { sortParticipants } from '../utils/sortParticipants';

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

export function createRoom(
  options?: RoomOptions,
): RoomState {
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

      newRoom.once('disconnected', () => {
        const timeoutId = setTimeout(() => setRoom(undefined));

        newRoom
          .off('participantConnected', onParticipantsChanged)
          .off('participantDisconnected', onParticipantsChanged)
          .off('activeSpeakersChanged', onParticipantsChanged)
          .off('trackSubscribed', onSubscribedTrackChanged)
          .off('trackUnsubscribed', onSubscribedTrackChanged)
          .off('localTrackPublished', onParticipantsChanged)
          .off('localTrackUnpublished', onParticipantsChanged)
          .off('audioPlaybackChanged', onParticipantsChanged);

        onCleanup(() => clearTimeout(timeoutId));
      });

      newRoom
        .on('participantConnected', onParticipantsChanged)
        .on('participantDisconnected', onParticipantsChanged)
        .on('activeSpeakersChanged', onParticipantsChanged)
        .on('trackSubscribed', onSubscribedTrackChanged)
        .on('trackUnsubscribed', onSubscribedTrackChanged)
        .on('localTrackPublished', onParticipantsChanged)
        .on('localTrackUnpublished', onParticipantsChanged)
      // trigger a state change by re-sorting participants
        .on('audioPlaybackChanged', onParticipantsChanged);

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
