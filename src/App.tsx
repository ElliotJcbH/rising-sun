import { createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from './routes';

const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App
