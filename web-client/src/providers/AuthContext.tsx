import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useMatches, useNavigate } from "@tanstack/react-router";
import { jwtDecode } from "jwt-decode";
import type { PropsWithChildren} from "react";
import type { JwtPayload } from "jwt-decode";

type AuthProviderProps = {
    session: Record<string, any> | null;
    verifySession: (accessToken: string) => any;
    logout: (() => void);
}

const AuthContext = createContext<AuthProviderProps>({
    session: null,
    verifySession: () => {}, // gives option to verify session manually, especially for critical tasks
    logout: () => { return null },
})



const AuthProvider = ({ children }: PropsWithChildren) => {

    const matches = useMatches();
    const navigate = useNavigate();

    const [globalSession, setGlobalSession] = useState(getCurrentSession());
    const [lastCheckedAccessToken, setLastCheckedAccessToken] = useState<string | null>(null);
    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const currentRoute = matches[matches.length - 1];
    const routeData = currentRoute.staticData as {requireAuth: boolean, requireRole: string};

    useEffect(() => { 
        startAuth();

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }
            if(refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
        }
    }, [currentRoute.id]);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "sessionInfo") {
                startAuth();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    async function startAuth() {
        try {
            const currentSession = getCurrentSession();

            if(!currentSession) {
                if (routeData.requireAuth) {
                    navigate({ to: '/', replace: true });
                }
                return;           
            };
            
            const accessToken = currentSession.accessToken;
            if(!accessToken){
                clearSession();
                return;
            }

            if(accessToken === lastCheckedAccessToken) return;

            setLastCheckedAccessToken(accessToken);
            await verifySession(accessToken);

        } catch(e) {
            console.log('error', e);
        }
    };

    function handleNewToken(payload: any) {
        const newAccessToken = payload.accessToken;     

        let decodedToken: JwtPayload;
        try {
            decodedToken = jwtDecode(newAccessToken);
        } catch(e) {
            clearSession();
            return;
        }

        const currentSession = getCurrentSession();
        if(!decodedToken.exp || !currentSession) {
            clearSession();
            return;
        };
        const newExp = decodedToken.exp;
        const newIat = decodedToken.iat;
        
        const newSession = {
            ...currentSession,
            accessToken: newAccessToken,
            exp: newExp,
            iat: newIat
        }
        localStorage.setItem('sessionInfo', JSON.stringify(newSession));
        setGlobalSession(newSession);

        const remainingTime = (decodedToken.exp * 1000) - Date.now();

        refreshTimeoutRef.current = setTimeout(() => {
            verifySession(newAccessToken);
        }, remainingTime);
    }

    function getCurrentSession(): Record<string, any> | null {

        const currentSession = localStorage.getItem("sessionInfo");

        if(!currentSession) return null;
        
        return JSON.parse(currentSession);
    }

    function clearSession() {
        window.localStorage.removeItem("sessionInfo");
        setGlobalSession(null);
        setLastCheckedAccessToken(null);

        if(routeData.requireAuth) {
            navigate({ to: '/' });
        }
    }

    async function verifySession(accessToken: string) { // the api will automatically send a new access token if the refresh token is invalid

        if (!abortControllerRef.current) {
            const controller = new AbortController();
            abortControllerRef.current = controller;
        }

        let res: Response | null = null;
        try {
            res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                signal: abortControllerRef.current.signal
            });
        } catch(e: unknown) {
            if(e instanceof Error && e.name === 'AbortError') {
                console.log('Fetch aborted');
                return;
            } 
            console.log('failed to fetch', e);
            clearSession();
        }

        console.log('res', res);
        if(!res || !res.ok) {
            alert('Failed to verify token');
            clearSession();
            return;
        }
        const payload = await res.json(); // TODO: create type for this

        handleNewToken(payload)
    }

    async function logout() {

        const session = getCurrentSession();
        
        if(!session || !session.accessToken) return;

        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${session.accessToken}` 
            },        
        })

        if(!res.ok) {
            alert('Failed to logout');
            return;
        }

        const { isRefreshTokenDeleted } = await res.json();
        if(isRefreshTokenDeleted == 'false') {
            alert('Returned false');
            return;
        }

        clearSession();
    }

    return (
        <AuthContext.Provider
            value={{
                session: globalSession,
                verifySession,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    )

}

export default AuthProvider;

export const useAuth = () => useContext(AuthContext);
