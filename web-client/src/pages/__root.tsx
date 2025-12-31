import { Outlet } from "@tanstack/react-router";
import '@/styles/global.css';
import { useEffect, useState } from "react";

const Root = () => {

    const [authToken, setAuthToken] = useState(window.localStorage.getItem("authToken"));

    useEffect(() => {
        if(!authToken) return;
        
        const accessToken = JSON.parse(authToken).accessToken;
        if(!accessToken) return;
        
        setInterval
    }, [authToken]);

    window.addEventListener('storage', (e) => {
        if(e.key === authToken) {
            setAuthToken(window.localStorage.getItem("authToken"));
        }
    })

    return (
        <div>
            <h1>Fucker</h1>
            <Outlet />
        </div>
    )

}

export default Root;

 