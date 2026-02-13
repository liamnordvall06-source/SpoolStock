import React, { useEffect, useState } from "react";
import styles from "./authenticationPage.module.css";
import HeaderComponent from "../components/headerComponent";
import GoogleLogo from "../assets/GoogleLogo.png"
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { app } from "../middleware/firebase";

const AuthenticationPage = () => {

    const provider = new GoogleAuthProvider();
    const auth = getAuth(app);


const handleGoogleSign = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const response = await fetch(`https://api-najddsqtfa-uc.a.run.app/customer/loQT32cudJUjpJyEPZP4X62Rznd2`);

    const data = await response.json();
    if (!response.ok) {
      console.warn("Customer not found:", data.error);
      // Maybe create a new customer here, or redirect user to setup page
      return;
    }

    console.log("Customer data:", data);
    localStorage.setItem("CID", data.companyId);
  } catch (err) {
    console.error("Google sign-in error:", err);
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