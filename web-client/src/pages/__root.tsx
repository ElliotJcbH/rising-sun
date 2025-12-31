import { Outlet } from "@tanstack/react-router";
import '@/styles/global.css';
import AuthProvider from "@/providers/AuthContext";

const Root = () => {

    return (
        <AuthProvider>
            {/* <h1>Some </h1> */}
            <Outlet  />
        </AuthProvider>
    )

}

export default Root;

 