import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { QueryClientProvider, dehydrate } from '@tanstack/react-query';
import { createStore } from './redux/store';
import App from './App';
import { createQueryClient } from './queries/client';

export async function render(url: string) {
  const store = createStore();

  const queryClient = createQueryClient();

  const html = renderToString(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App url={url} />
      </QueryClientProvider>
    </Provider>,
  );

  const dehydratedState = dehydrate(queryClient);

  return {
    html,
    headTags: '',
    dehydratedState,
  };
}
