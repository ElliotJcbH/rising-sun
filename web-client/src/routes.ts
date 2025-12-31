import { createRootRoute, createRoute } from "@tanstack/react-router";
import Root from "@/pages/__root";
import AuthLayout from "@/pages/_auth/_auth";
import AppLayout from "@/pages/_app/_app";
import Index from "@/pages/_auth/Index";
import Home from "@/pages/_app/Home";

const rootRoute = createRootRoute({
    component: Root,
})

const appLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: '_app',
    component: AppLayout
})

const authLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: '_auth',
    component: AuthLayout,
    
})

const indexRoute = createRoute({
    getParentRoute: () => authLayoutRoute,
    path: '/',
    component: Index
})

const homeRoute = createRoute({
    getParentRoute: () => appLayoutRoute,
    path: '/home',
    component: Home 
})

export const routeTree = rootRoute.addChildren([
    authLayoutRoute.addChildren([
        indexRoute
    ]),
    appLayoutRoute.addChildren([
        homeRoute
    ])
])