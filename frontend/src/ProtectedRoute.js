import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { auth, monitorAuthState } from "./firebase.js";

const ProtectedRoute = () => {
    const [authUser, setAuthUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     const unsubscribe = monitorAuthState((currentUser) => {
    //         setAuthUser(currentUser);
    //         setLoading(false);
    //     });

    //     return () => unsubscribe();
    // }, []);

    

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }
    if (!localStorage.getItem("authToken")) {
        return <Navigate to="/login" replace />;
    }
   
  
    return <Outlet />;
};

export default ProtectedRoute;