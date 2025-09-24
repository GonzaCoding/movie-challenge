import React from 'react';
import Router from './app/router';

interface AppProps {
  url?: string;
}

function App({ url }: AppProps) {
  return <Router url={url} />;
}

export default App;
