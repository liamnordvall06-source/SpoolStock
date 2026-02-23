import React, { useEffect, useState } from "react";
import styles from "./authenticationPage.module.css";
import HeaderComponent from "../components/headerComponent";
import GoogleLogo from "../assets/GoogleLogo.png"
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { app } from "../middleware/firebase";
import {  useNavigate } from "react-router-dom";
import SpoolStockBanner from "../assets/SpoolStockBanner.png"
import BrandIt3DLogo from "../assets/BlackLogo.png";

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
                    <div className={styles.innerAuthContainer}>
                        <div className={styles.headerContainer}>
                            <img src={BrandIt3DLogo} alt="BrandIt3D" />
                            <h1>Välkommen tillbaka till SpoolStock</h1>
                            <p>Ha koll på dina lagersaldon och gör uttag från ditt filament lager</p>
                        </div>

                        <div className={styles.footerContainer}>
                            <button onClick={handleGoogleSign}>
                                <img src={GoogleLogo} alt="Google"/>
                                <p>Logga in med Google</p>
                            </button>
                            {/* <p className={styles.createAccntText}>Har du inget konto? <a href="/">Skapa ett</a></p> */}
                        </div>
                    </div>
                </div>
                <div className={styles.bannerContainer}>
                    <img src={SpoolStockBanner} alt="SpoolStock" />
                </div>
            </div>            
        </div>
    );
}


export default AuthenticationPage;