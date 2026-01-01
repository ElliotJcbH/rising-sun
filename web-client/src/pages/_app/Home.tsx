import { useAuth } from "@/providers/AuthContext";
import { useNavigate } from "@tanstack/react-router";

const Home = () => {

    const navigate = useNavigate();
    const auth = useAuth();

    return (
        <div>
            <h1>'Welcome to the home page!'</h1>
            <button onClick={() => {auth.logout()}}>Logout</button>
        </div>
    )

}

export default Home;