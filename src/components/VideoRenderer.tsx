// ANCHOR Solid
import {
  createSignal,
  createEffect,
  onCleanup,
  JSX,
} from 'solid-js';

// ANCHOR LiveKit
import { Track } from 'livekit-client';

// ANCHOR Styles
import './styles.module.css';

// ANCHOR Types
import { Property } from 'csstype';

export interface VideoRendererProps {
  track: Track;
  isLocal: boolean;
  objectFit?: Property.ObjectFit;
  className?: string;
  width?: Property.Width;
  height?: Property.Height;
  onSizeChanged?: (width: number, height: number) => void;
}

export const VideoRenderer = (
  props: VideoRendererProps,
): JSX.Element => {
  const [ref, setRef] = createSignal<HTMLVideoElement | null>(null);

  createEffect(() => {
    const videoElement = ref();
    if (videoElement) {
      videoElement.muted = true;
      props.track.attach(videoElement);
    }

    onCleanup(() => {
      if (videoElement) {
        props.track.detach(videoElement);
      }
    });
  });

  const handleResize = (event: UIEvent) => {
    if (event.target instanceof HTMLVideoElement) {
      if (props.onSizeChanged) {
        props.onSizeChanged(
          event.target.videoWidth,
          event.target.videoHeight,
        );
      }
    }
  };

  createEffect(() => {
    const videoElement = ref();

    if (videoElement) {
      videoElement.addEventListener('resize', handleResize);
    }

    onCleanup(() => {
      videoElement?.removeEventListener('resize', handleResize);
    });
  });

  const isFrontFacing = props.track.mediaStreamTrack?.getSettings().facingMode !== 'environment';

  const style = () => {
    const currentStyle: JSX.CSSProperties = {
      transform: props.isLocal && isFrontFacing
        ? 'rotateY(180deg)'
        : '',
      width: props.width,
      height: props.height,
    };

    if (props.objectFit) {
      currentStyle['object-fit'] = props.objectFit;
    }

    return currentStyle;
  };

  return (
    <video
      ref={setRef}
      className={props.className ?? 'video'}
      style={style()}
    />
  );
};
