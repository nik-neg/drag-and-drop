import React from 'react';
import { createRoot } from 'react-dom/client';
import '@atlaskit/css-reset';
import AppProvider from '@atlaskit/app-provider';
import Example from './example';

const root = createRoot(document.getElementById('root')!);
root.render(
  <AppProvider>
    <Example />
  </AppProvider>
);
