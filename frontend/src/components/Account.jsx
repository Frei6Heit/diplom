import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Account.scss";
import Cookies from "js-cookie";
import { toast } from 'react-toastify';
import icons from "../components/import/ImportSVG.jsx"


const Account = () => {
    const [currentUser, setCurrentUser] = useState("");
    const [otherUsers, setOtherUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchUserData = async (token) => {
        try {
            const response = await fetch("http://localhost:5000/auth/current_user", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch user data");
            }

            const data = await response.json();
            setCurrentUser(data.current_user);
            setOtherUsers(data.all_users.filter(user => user !== data.current_user));
            setError(null);
        } catch (err) {
            console.error("Error fetching user data:", err);
            setError(err.message);
            handleLogout();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login", { replace: true });
            return;
        }
        fetchUserData(token);
    }, [navigate]);

    const handleSwitchUser = async (username) => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/auth/get_user_token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ username })
            });

            if (!response.ok) {
                throw new Error("Failed to switch user");
            }

            const { token } = await response.json();
            localStorage.setItem("token", token);
            await fetchUserData(token);
            
            // Уведомление об успешном переключении
            toast.success(`Successfully switched to ${username}`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            
        } catch (err) {
            console.error("Error switching user:", err);
            setError(err.message);
            // Уведомление об ошибке
            toast.error(`Failed to switch to ${username}: ${err.message}`, {
                position: "top-right",
                autoClose: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        Cookies.remove("rememberedUser");
        navigate("/login", { replace: true });
    };

    if (loading) {
        return (
            <div className="account-loading">
                <p>Loading user data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="account-error">
                <p>Error: {error}</p>
                <button onClick={handleLogout}>Return to Login</button>
            </div>
        );
    }

    return (
        <>
        <div className="account-container shadow">
            <div className="account-header">
                <h1>account information</h1>
            </div>

            <div className="user-info shadow">
                <h2>current user: <span className="username">{currentUser}</span></h2>
                
                {otherUsers.length > 0 && (
                    <div className="other-users">
                        <h3>other accounts on this device:</h3>
                        <ul>
                            {otherUsers.map((user, index) => (
                                <li key={index}>
                                    <span>{user}</span>
                                    <button 
                                        onClick={() => handleSwitchUser(user)}
                                        className="switch-btn"
                                        disabled={loading}
                                    >
                                        {loading ? "switching..." : "switch"}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <button onClick={handleLogout} className="logout-btn">
                    logout <icons.LogOut />
                </button>
            </div>

            <div className="pattern">
                <icons.Pattern/>
            </div>
        </div>
        </>
    );
};

export default Account;
