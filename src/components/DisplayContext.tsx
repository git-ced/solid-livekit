import { useContext, createContext } from 'solid-js';

export interface DisplayOptions {
  stageLayout?: string;
  /** display debugging stats */
  showStats?: boolean;
}

export const DisplayContext = createContext<DisplayOptions>({
  stageLayout: 'grid',
  showStats: false,
});

export const useDisplay = (): DisplayOptions => (
  useContext(DisplayContext)
);
