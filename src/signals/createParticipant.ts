// ANCHOR Solid
import {
  createEffect,
  createSignal,
  Accessor,
  onCleanup,
} from 'solid-js';

// ANCHOR LiveKit
import {
  ConnectionQuality,
  LocalParticipant,
  Participant,
  ParticipantEvent,
  Track,
  TrackPublication,
} from 'livekit-client';

// ANCHOR Types
export interface ParticipantState {
  isSpeaking: boolean;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  connectionQuality: ConnectionQuality;
  isLocal: boolean;
  metadata: string | undefined;
  publications: TrackPublication[];
  subscribedTracks: TrackPublication[];
  cameraPublication?: TrackPublication;
  microphonePublication?: TrackPublication;
  screenSharePublication?: TrackPublication;
}

export function createParticipant(
  participant: Participant,
): Accessor<ParticipantState> {
  const [isAudioMuted, setIsAudioMuted] = createSignal(false);
  const [isVideoMuted, setIsVideoMuted] = createSignal(false);
  const [connectionQuality, setConnectionQuality] = createSignal<ConnectionQuality>(
    participant.connectionQuality,
  );
  const [isSpeaking, setSpeaking] = createSignal(false);
  const [metadata, setMetadata] = createSignal<string>();
  const [publications, setPublications] = createSignal<TrackPublication[]>([]);
  const [subscribedTracks, setSubscribedTracks] = createSignal<TrackPublication[]>(
    [],
  );

  const onPublicationsChanged = () => {
    const participantTracks = Array.from(participant.tracks.values());
    setPublications(participantTracks);
    setSubscribedTracks(participantTracks.filter((pub) => (
      pub.isSubscribed && pub.track !== undefined
    )));
  };

  const onMuted = (publication: TrackPublication) => {
    if (publication.kind === Track.Kind.Audio) {
      setIsAudioMuted(true);
    } else if (publication.kind === Track.Kind.Video) {
      setIsVideoMuted(true);
    }
  };

  const onUnmuted = (publication: TrackPublication) => {
    if (publication.kind === Track.Kind.Audio) {
      setIsAudioMuted(false);
    } else if (publication.kind === Track.Kind.Video) {
      setIsVideoMuted(false);
    }
  };

  const onMetadataChanged = () => {
    if (participant.metadata) {
      setMetadata(participant.metadata);
    }
  };

  const onIsSpeakingChanged = () => {
    setSpeaking(participant.isSpeaking);
  };

  const onConnectionQualityUpdate = () => {
    setConnectionQuality(participant.connectionQuality);
  };

  createEffect(() => {
    participant
      .on(ParticipantEvent.TrackMuted, onMuted)
      .on(ParticipantEvent.TrackUnmuted, onUnmuted)
      .on(ParticipantEvent.ParticipantMetadataChanged, onMetadataChanged)
      .on(ParticipantEvent.IsSpeakingChanged, onIsSpeakingChanged)
      .on(ParticipantEvent.TrackPublished, onPublicationsChanged)
      .on(ParticipantEvent.TrackUnpublished, onPublicationsChanged)
      .on(ParticipantEvent.TrackSubscribed, onPublicationsChanged)
      .on(ParticipantEvent.TrackUnsubscribed, onPublicationsChanged)
      .on(ParticipantEvent.LocalTrackPublished, onPublicationsChanged)
      .on(ParticipantEvent.LocalTrackUnpublished, onPublicationsChanged)
      .on(ParticipantEvent.ConnectionQualityChanged, onConnectionQualityUpdate);

    // set initial state
    onMetadataChanged();
    onIsSpeakingChanged();
    onPublicationsChanged();
  });

  onCleanup(() => {
    participant
      .off(ParticipantEvent.TrackMuted, onMuted)
      .off(ParticipantEvent.TrackUnmuted, onUnmuted)
      .off(ParticipantEvent.ParticipantMetadataChanged, onMetadataChanged)
      .off(ParticipantEvent.IsSpeakingChanged, onIsSpeakingChanged)
      .off(ParticipantEvent.TrackPublished, onPublicationsChanged)
      .off(ParticipantEvent.TrackUnpublished, onPublicationsChanged)
      .off(ParticipantEvent.TrackSubscribed, onPublicationsChanged)
      .off(ParticipantEvent.TrackUnsubscribed, onPublicationsChanged)
      .off(ParticipantEvent.LocalTrackPublished, onPublicationsChanged)
      .off(ParticipantEvent.LocalTrackUnpublished, onPublicationsChanged)
      .off(
        ParticipantEvent.ConnectionQualityChanged,
        onConnectionQualityUpdate,
      );
  });

  createEffect(() => {
    let muted: boolean | undefined;

    participant.audioTracks.forEach((publication) => {
      muted = publication.isMuted;
    });

    if (typeof muted === 'undefined') {
      muted = true;
    }

    setIsAudioMuted((currentValue) => {
      if (currentValue !== muted) {
        return !!muted;
      }

      return currentValue;
    });

    setIsVideoMuted((currentValue) => {
      if (currentValue !== muted) {
        return !!muted;
      }

      return currentValue;
    });
  });

  return () => ({
    isLocal: participant instanceof LocalParticipant,
    isSpeaking: isSpeaking(),
    isAudioMuted: isAudioMuted(),
    isVideoMuted: isVideoMuted(),
    connectionQuality: connectionQuality(),
    publications: publications(),
    subscribedTracks: subscribedTracks(),
    cameraPublication: participant.getTrack(Track.Source.Camera),
    microphonePublication: participant.getTrack(Track.Source.Microphone),
    screenSharePublication: participant.getTrack(Track.Source.ScreenShare),
    metadata: metadata(),
    tracks: participant.tracks,
  });
}
