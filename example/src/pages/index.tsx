// ANCHOR Solid
import { JSX, Show } from 'solid-js';
import { useRouter } from 'solid-tiny-router';

// ANCHOR LiveKit
import { Room } from 'livekit-client';
import { LiveKitRoom } from 'solid-livekit';
import 'solid-livekit/dist/esm/index.css';

async function onConnected(room: Room) {
  await room.localParticipant.setCameraEnabled(true);
  await room.localParticipant.setMicrophoneEnabled(true);
}

export default function ViewPage(): JSX.Element {
  const router = useRouter();
  const url = () => new URLSearchParams(router.search).get('url');
  const token = () => new URLSearchParams(router.search).get('token');

  return (
    <div className="roomContainer">
      <Show when={url()} fallback="Missing LiveKit URL">
        {(currentUrl) => (
          <Show when={token()} fallback="Missing LiveKit token">
            {(currentToken) => (
              <LiveKitRoom
                url={currentUrl}
                token={currentToken}
                onConnected={(room) => onConnected(room)}
              />
            )}
          </Show>
        )}
      </Show>
    </div>
  );
}
