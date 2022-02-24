// ANCHOR Solid
import {
  JSX,
  createEffect,
  onCleanup,
} from 'solid-js';

// ANCHOR LiveKit
import { Track } from 'livekit-client';

export interface AudioTrackProps {
  track: Track;
  isLocal: boolean;
}

export const AudioRenderer = (
  props: AudioTrackProps,
): JSX.Element => {
  let audioElement: HTMLAudioElement;

  createEffect(() => {
    // don't play own audio
    if (!props.isLocal) {
      audioElement = props.track.attach();

      if (props.track.sid) {
        audioElement.setAttribute('data-audio-track-id', props.track.sid);
      }
    }

    onCleanup(() => {
      props.track.detach().forEach((element) => element.remove());
    });
  });

  // TODO: allow set sink id
  return null;
};
