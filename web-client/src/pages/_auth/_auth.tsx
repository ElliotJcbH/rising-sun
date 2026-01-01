import { Link, Outlet } from "@tanstack/react-router";
import { Activity, useState } from "react";
import { useAuth } from "@/providers/AuthContext";

const AuthLayout = () => {

    const auth = useAuth();
    
    return (
        <>
            <Activity mode={auth.session ? "visible" : "hidden"}>
                <div>
                    <Link className='link' to='/home'>
                        You are already signed in.
                    </Link>
                    <button onClick={() => auth.logout()}>Would you like to logout?</button>
                </div>
            </Activity>
            <Outlet />
        </>
    )

}

export default AuthLayout;