import { createRoot } from 'react-dom/client';
import '@atlaskit/css-reset';
import AppProvider from '@atlaskit/app-provider';
import { Board } from './components/board/board';

const root = createRoot(document.getElementById('root')!);
root.render(
  <AppProvider>
    <Board />
  </AppProvider>
);
