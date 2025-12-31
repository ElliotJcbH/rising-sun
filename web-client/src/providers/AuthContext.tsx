import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useMatches, useNavigate } from "@tanstack/react-router";
import { jwtDecode } from "jwt-decode";
import type { PropsWithChildren} from "react";
import type { JwtPayload } from "jwt-decode";

type AuthProviderProps = {
    session: Record<string, any> | null;
    clearSession: (() => void) | null;
}

const AuthContext = createContext<AuthProviderProps>({
    session: null,
    clearSession: null
})



const AuthProvider = ({ children }: PropsWithChildren) => {

    const matches = useMatches();
    const navigate = useNavigate();

    const [session, setSession] = useState<Record<string, any> | null>(null);
    const [lastCheckedAccessToken, setLastCheckedAccessToken] = useState<string | null>(null);
    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const currentRoute = matches[matches.length - 1];
    const routeData = currentRoute.staticData as {requireAuth: boolean, requireRole: string};

    useEffect(() => { 
        startAuth();
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
            setSession(currentSession);

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

    async function verifySession(accessToken: string) { // the api will automatically send a new access token if the refresh token is invalid

        let res: Response | null = null;
        try {
            res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
            });
        } catch(e) {
            console.log('failed to fetch', e);
        }
        if(!res || !res.ok) {
            alert('Failed to verify token');
            clearSession();
            return;
        }
        const payload = await res.json(); // TODO: create type for this
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
        setSession(newSession);

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
        setSession(null);
        setLastCheckedAccessToken(null);

        if(routeData.requireAuth) {
            navigate({ to: '/' });
        }
    }

    return (
        <AuthContext.Provider
            value={{
                session,
                clearSession
            }}
        >
            {children}
        </AuthContext.Provider>
    )

}

export default AuthProvider;

export const useAuth = () => useContext(AuthContext);