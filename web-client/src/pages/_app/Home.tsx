import { useNavigate } from "@tanstack/react-router";

const Home = () => {

    const navigate = useNavigate();

    const logout = async () => {

        const sessionInfo = localStorage.getItem('sessionInfo');

        let userId: string;
        if(sessionInfo) {
            userId = JSON.parse(sessionInfo).user.user_id as string;
        } else {
            return;
        }

        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: userId })
        })

        if(!res.ok) {
            alert('Failed to logout');
            return;
        };

        const { isRefreshTokenDeleted } = await res.json();
        if(isRefreshTokenDeleted == 'false') {
            alert('Returned false');
            return;
        };

        localStorage.removeItem('sessionInfo');
        navigate({ to: '/' })
    }

    return (
        <div>
            <h1>'Welcome to the home page!'</h1>
            <button onClick={logout}>Logout</button>
        </div>
    )

}

export default Home;