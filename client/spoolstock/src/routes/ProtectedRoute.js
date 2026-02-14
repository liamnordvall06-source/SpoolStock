// ProtectedRoute.js
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import {  useNavigate } from "react-router-dom";


const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      fetchCompanyId(currentUser);
    });

    return () => unsubscribe();
  }, []);

  
  const fetchCompanyId = async (user) => {

        const response = await fetch(`https://api-najddsqtfa-uc.a.run.app/customer/${user?.uid}`);

        const data = await response.json();
        

        if (data) {
            localStorage.setItem("CID", data.companyId);
        } else {
            localStorage.removeItem("CID");
        }
  }

  if (loading) return <div>Loading...</div>; // Or a spinner

  if (!user) return <Navigate to="/auth" replace />;

  return children;
};

export default ProtectedRoute;
