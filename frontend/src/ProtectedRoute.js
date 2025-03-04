import React, {useState, useEffect} from "react";
import { Navigate } from "react-router-dom";
// import { getAuth } from "firebase/auth";
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";
const ProtectedRoute = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) return <div>Loading...</div>; 
    return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;