import React, { useEffect, useState } from "react";
import styles from "./authenticationPage.module.css";
import HeaderComponent from "../components/headerComponent";
import GoogleLogo from "../assets/GoogleLogo.png"
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { app } from "../middleware/firebase";
import {  useNavigate } from "react-router-dom";

const AuthenticationPage = () => {

    const navigate = useNavigate();
    const provider = new GoogleAuthProvider();
    const auth = getAuth(app);


const handleGoogleSign = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const response = await fetch(`https://api-najddsqtfa-uc.a.run.app/customer/${user.uid}`);

    const data = await response.json();
    
    console.log("Customer data:", data);

    if (data) {
        localStorage.setItem("CID", data.companyId);
        navigate("/");
    } else {
        localStorage.removeItem("CID");
        navigate("/");
    }

  } catch (err) {
    console.error("Google sign-in error:", err);
    localStorage.removeItem("CID");
    navigate("/");
  }
};



    return (
        <div className={styles.mainContainer}>
            <HeaderComponent />

            <div className={styles.innerContainer}>
                <div className={styles.authenticationContainer}>
                    <h1>Välkommen tillbaka</h1>
                    <p>Skriv in dina inloggnignsuppgifter eller logga in med Google</p>

                    <form>
                        <label>Email</label>
                        <input type="text"></input>
                        <label>Lösenord</label>
                        <input type="password"></input>
                        <button type="submit" className={styles.loginBtn}>Logga in</button>

                    </form>

                        <button className={styles.signinGoogleBtn} onClick={handleGoogleSign}>
                            <img src={GoogleLogo} alt="Google"></img>
                            <p>Logga in med Google</p>
                        </button>

                </div>
            </div>            
        </div>
    );
}


export default AuthenticationPage;