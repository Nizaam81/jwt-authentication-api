import "./Home.css";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { api } from "../axios";

function Home() {
    const navigate = useNavigate();

    const getHomeData = async () => {
        try {
            const res = await api.get("/home");

            console.log("Protected Route Response:", res.data);
        } catch (error) {
            console.log("Error:", error.response?.data || error.message);
        }
    };

    useEffect(() => {
        getHomeData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        navigate("/");
    };

    return (
        <div className="home">
            <div className="hero">
                <h1>Welcome to My Website</h1>

                <p>
                    Build amazing applications with React and Node.js.
                </p>

                <button className="btn">
                    Get Started
                </button>

                <button
                    className="logout-btn"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Home;