import { useNavigate } from "@tanstack/react-router";

const Home = () => {

    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem('authToken');
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