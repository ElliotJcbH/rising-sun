import { Outlet } from "@tanstack/react-router";
import '@/styles/global.css';
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const Root = () => {

    const [authToken, setAuthToken] = useState<string | null>(window.localStorage.getItem("authToken") || '');

    useEffect(() => {
        if(!authToken) {
            clearAuthToken();
            return;
        };
        
        const accessToken = JSON.parse(authToken).accessToken;
        if(!accessToken){
            clearAuthToken();
            return;
        }

        const decodedToken = jwtDecode(accessToken);
        const remainingTime = Date.now() - (decodedToken.exp || Infinity);

        if(remainingTime <= 0 || remainingTime == Infinity) {
            clearAuthToken();
            return;
        };

        setTimeout(() => {clearAuthToken()}, remainingTime)
    }, [authToken]);

    window.addEventListener('storage', (e) => {
        if(e.key === authToken) {
            setAuthToken(window.localStorage.getItem("authToken"));
        }
    })

    async function clearAuthToken() {
        window.localStorage.removeItem("authToken");
        setAuthToken('');

        const newAccessToken = await fetch(`${import.meta.env.VITE_API_URL}/refresh-access-token`, {
            method: "GET",
                 headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: data.username,
                email: data.email,
                password: data.password
            })
        })
    }

    return (
        <div>
            <h1>Fucker</h1>
            <Outlet  />
        </div>
    )

}

export default Root;

 