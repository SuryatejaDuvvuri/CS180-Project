import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "./firebase.js";

const ProtectedRoute = ({ children }) => {
    const [authUser, setAuthUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setAuthUser(currentUser);
            console.log(auth);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return authUser ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;