// ANCHOR Solid
import { JSX } from 'solid-js';

// ANCHOR Solid Links
import AspectRatio from 'solid-aspect-ratio';

export default function ViewPage(): JSX.Element {
  return (
    <>
      <h1>Solid Aspect Ratio</h1>
      <div style={{ width: '20vw' }}>
        <AspectRatio
          ratio="16:9"
          style={{ background: '#000', color: '#fff' }}
        >
          <br />
          This has a 16:9 ratio container and was done with a string
          <br />
          <br />
          <code style={{ color: '#ff69b4', 'margin-top': '16px' }}>
            ratio=&quot;16:9&quot;
          </code>
        </AspectRatio>
        <br />
        <AspectRatio
          ratio={16 / 9}
          style={{ background: '#000', color: '#fff', 'text-align': 'center' }}
        >
          <br />
          This has a 16:9 ratio container and was done by getting their quotient
          <br />
          <br />
          <code style={{ color: '#ff69b4', 'margin-top': '16px' }}>
            ratio=&lbrace;16 / 9&rbrace;
          </code>
        </AspectRatio>
        <br />
        <AspectRatio
          ratio="3/4"
          style={{ background: '#000', color: '#fff' }}
        >
          <div
            style={{
              display: 'flex',
              'flex-direction': 'column',
              'justify-content': 'center',
              'align-items': 'center',
              'text-align': 'center',
              width: '100%',
              height: '100%',
            }}
          >
            This has a 3:4 ratio container and was done with a string
            <code style={{ color: '#ff69b4', 'margin-top': '16px' }}>
              ratio=&quot;3/4&quot;
            </code>
          </div>
        </AspectRatio>
        <br />
      </div>
      <h2>Image Example</h2>
      <div style={{ width: '20vw' }}>
        <h3>16:9</h3>
        <AspectRatio ratio={16 / 9}>
          <img
            src="https://picsum.photos/500"
            alt="Picsum"
            style={{ width: '100%', height: '100%', 'object-fit': 'cover' }}
          />
        </AspectRatio>
        <br />
        <h3>1:1</h3>
        <AspectRatio ratio={1}>
          <img
            src="https://picsum.photos/500"
            alt="Picsum"
            style={{ width: '100%', height: '100%', 'object-fit': 'cover' }}
          />
        </AspectRatio>
        <br />
        <h3>14:3</h3>
        <AspectRatio ratio={14 / 3}>
          <img
            src="https://picsum.photos/500"
            alt="Picsum"
            style={{ width: '100%', height: '100%', 'object-fit': 'cover' }}
          />
        </AspectRatio>
      </div>
      <h2>Video Example</h2>
      <div style={{ width: '20vw' }}>
        <h3>16:9</h3>
        <AspectRatio ratio={16 / 9}>
          <video
            poster="https://sveltejs.github.io/assets/caminandes-llamigos.jpg"
            src="https://sveltejs.github.io/assets/caminandes-llamigos.mp4"
            controls
            style={{ width: '100%', height: '100%' }}
          >
            <track kind="captions" />
          </video>
        </AspectRatio>
        <br />
        <h3>3:4</h3>
        <AspectRatio ratio={3 / 4} style={{ background: '#000' }}>
          <video
            poster="https://sveltejs.github.io/assets/caminandes-llamigos.jpg"
            src="https://sveltejs.github.io/assets/caminandes-llamigos.mp4"
            controls
            style={{ width: '100%', height: '100%' }}
          >
            <track kind="captions" />
          </video>
        </AspectRatio>
        <br />
        <h3>3:1</h3>
        <AspectRatio ratio={3 / 1} style={{ background: '#000' }}>
          <video
            poster="https://sveltejs.github.io/assets/caminandes-llamigos.jpg"
            src="https://sveltejs.github.io/assets/caminandes-llamigos.mp4"
            controls
            style={{ width: '100%', height: '100%' }}
          >
            <track kind="captions" />
          </video>
        </AspectRatio>
      </div>
      <h2>IFrame Example</h2>
      <div style={{ width: '20vw' }}>
        <h3>16:9</h3>
        <AspectRatio ratio={16 / 9}>
          <iframe
            src="https://www.youtube.com/embed/W86cTIoMv2U"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            style={{ width: '100%', height: '100%' }}
            title="16 by 9 W86cTIoMv2U"
          />
        </AspectRatio>
        <br />
        <h3>3:4</h3>
        <AspectRatio ratio={3 / 4} style={{ background: '#000' }}>
          <iframe
            src="https://www.youtube.com/embed/W86cTIoMv2U"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            style={{ width: '100%', height: '100%' }}
            title="3 by 4 W86cTIoMv2U"
          />
        </AspectRatio>
        <br />
        <h3>3:1</h3>
        <AspectRatio ratio={3 / 1} style={{ background: '#000' }}>
          <iframe
            src="https://www.youtube.com/embed/W86cTIoMv2U"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            style={{ width: '100%', height: '100%' }}
            title="3 by 1 W86cTIoMv2U"
          />
        </AspectRatio>
      </div>
    </>
  );
}
