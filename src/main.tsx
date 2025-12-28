import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import reportWebVitals from './reportWebVitals.ts'
import App from './App.tsx'

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      {/* <RouterProvider router={router} /> */}
      <App />
    </StrictMode>,
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()

// const rootRoute = createRootRoute({
//   component: () => (
//     <>
//       <Outlet />
//       <TanStackRouterDevtools />
//     </>
//   ),
// })

// const indexRoute = createRoute({
//   getParentRoute: () => rootRoute,
//   path: '/',
//   component: App,
// })

// const routeTree = rootRoute.addChildren([
//   indexRoute
// ])

// const router = createRouter({
//   routeTree,
//   context: {},
//   defaultPreload: 'intent',
//   scrollRestoration: true,
//   defaultStructuralSharing: true,
//   defaultPreloadStaleTime: 0,
// })

// declare module '@tanstack/react-router' {
//   interface Register {
//     router: typeof router
//   }
// }