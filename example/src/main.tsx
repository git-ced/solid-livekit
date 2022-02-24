// ANCHOR Solid
import { render } from 'solid-js/web';

// ANCHOR Components
import App from './App';

const root = document.getElementById('app');

if (root) {
  render(() => <App />, root);
}
