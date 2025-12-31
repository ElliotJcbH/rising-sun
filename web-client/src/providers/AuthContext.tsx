import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useLocation, useNavigate } from "@tanstack/react-router";
import type { PropsWithChildren} from "react";

type AuthProviderProps = {
    remainingAccessTimeMs: number | null;
}

const AuthContext = createContext<AuthProviderProps>({
    // user: ,
    remainingAccessTimeMs: null
})

const AuthProvider = ({ children }: PropsWithChildren) => {

    const location = useLocation();
    const navigate = useNavigate();

    const [authToken, setAuthToken] = useState<string | null>(window.localStorage.getItem("authToken"));
    const [remainingAccessTimeMs, setRemainingAccessTimeMs] = useState<number | null>(null);

    const isAuthRoute = location.pathname === '/' || 
                    location.pathname.startsWith('/login') || 
                    location.pathname.startsWith('/register');

    const isAppRoute = !isAuthRoute;

    useEffect(() => {
        try {
            if(!authToken) {
                if (isAppRoute) {
                    navigate({ to: '/', replace: true });
                }
                return;           
            };
            
            const accessToken = JSON.parse(authToken).accessToken;
            if(!accessToken){
                clearAuthToken();
                return;
            }

            const decodedToken = jwtDecode(accessToken);
            const remainingTime = (decodedToken.exp || 0) * 1000 - Date.now();
            // const remainingTime = Date.now() - (decodedToken.exp || Infinity);

            if(remainingTime <= 0 || remainingTime == Infinity) {
                clearAuthToken();
                return;
            };

            const timeoutId = setTimeout(() => {
                clearAuthToken();
            }, remainingTime);

            navigate({ to: '/home', replace: true });
        
            return () => clearTimeout(timeoutId);

        } catch(e) {
            console.log('error', e);
        }
    }, [authToken, isAppRoute]);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "authToken") {
                setAuthToken(window.localStorage.getItem("authToken"));
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    function clearAuthToken() {
        window.localStorage.removeItem("authToken");
        setAuthToken(null);
        setRemainingAccessTimeMs(null);

        if(isAppRoute) {
            navigate({ to: '/' });
        }
        // const newAccessToken = await fetch(`${import.meta.env.VITE_API_URL}/refresh-access-token`, {
        //     method: "GET",
        //          headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         username: data.username,
        //         email: data.email,
        //         password: data.password
        //     })
        // })
    }

    return (
        <AuthContext.Provider
            value={{
                remainingAccessTimeMs
            }}
        >
            {children}
        </AuthContext.Provider>
    )

}

export default AuthProvider;

export const useAuth = () => useContext(AuthContext);