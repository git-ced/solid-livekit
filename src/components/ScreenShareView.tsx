// ANCHOR Solid
import { JSX } from 'solid-js';

// ANCHOR LiveKit
import { Track } from 'livekit-client';

// ANCHOR Types
import { Property } from 'csstype';

// ANCHOR Styles
import './styles.module.css';

// ANCHOR Components
import { VideoRenderer } from './VideoRenderer';

interface ScreenShareProps {
  track: Track;
  width?: Property.Width;
  height?: Property.Height;
}

export const ScreenShareView = (
  props: ScreenShareProps,
): JSX.Element => (
  <div className="screenShare">
    <VideoRenderer
      track={props.track}
      isLocal={false}
      width={props.width}
      height={props.height}
    />
  </div>
);
