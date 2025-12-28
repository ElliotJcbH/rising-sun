import { createRootRoute, createRoute } from "@tanstack/react-router";
import Root from "@/pages/__root";
import Index from "@/pages/_app/Index";

const rootRoute = createRootRoute({
    component: Root,
})

const appLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: '_app',

})

const authLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: '_auth',
    
})

const indexRoute = createRoute({
    getParentRoute: () => appLayoutRoute,
    path: '/',
    component: Index
})

export const routeTree = rootRoute.addChildren([
    indexRoute,
])