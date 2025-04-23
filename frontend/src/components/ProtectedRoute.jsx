import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
        navigate("/login", { replace: true });
        }
    }, [navigate]);

    return <Outlet />;
};

export default ProtectedRoute;
