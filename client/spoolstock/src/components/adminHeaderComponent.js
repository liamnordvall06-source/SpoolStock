import React, {useState, useEffect} from "react";
import styles from "./adminHeaderComponent.module.css";
import BrandLogo from "../assets/BlackLogo.png"
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { app } from "../middleware/firebase";
import { useNavigate } from "react-router-dom";


const auth = getAuth(app);

const AdminHeaderComponent = () => {

    const navigate = useNavigate();

    const handleSignout = async () => {
        await signOut(auth);
    }

    const handleRedirect = () => {
        navigate("/");
    }

    return (
        <div className={styles.mainContainer}>
            <div className={styles.bannerContainer}>
                <p>Inloggad som administratör</p>
            </div>
            <div className={styles.headerContainer}>
                <div className={styles.innerContainer}>
                    <img onClick={handleRedirect} src={BrandLogo} />
                     <div className={styles.rightContainer}>
                            <ul className={styles.linksContainer}>
                                <li><a href="/admin">Dashboard</a></li>
                                <li><a href="/admin">Kunder</a></li>
                                <li><a href="/admin">Transaktioner</a></li>
                                <li><a href="/admin">Lagersaldon</a></li>
                                <button onClick={handleSignout}>Logga ut</button>
                            </ul>
                     </div>
                </div>
               
            </div>
        </div>
    );
}


export default AdminHeaderComponent; 