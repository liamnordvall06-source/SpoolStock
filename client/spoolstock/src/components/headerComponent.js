import React, {useState, useEffect} from "react";
import styles from "./headerComponent.module.css";
import BrandLogo from "../assets/BlackLogo.png"
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { app } from "../middleware/firebase";

const auth = getAuth(app);

const HeaderComponent = () => {
    const [user, setUser] = useState(null);

    const handleSignout = async () => {
        await signOut(auth);
    }


    useEffect(() => {
        const auth = getAuth();
        
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className={styles.mainContainer}>
            <div className={styles.bannerContainer}>
                <p>Välkommen!</p>
            </div>
            <div className={styles.headerContainer}>
                <div className={styles.innerContainer}>
                    <img src={BrandLogo} />
                     <div className={styles.rightContainer}>
                        {user && 
                            <ul className={styles.linksContainer}>
                                <li><a href="/">Dashboard</a></li>
                                <li><a href="/stock">Lager</a></li>
                                <li><a href="/transcations">Transaktioner</a></li>
                                <button onClick={handleSignout}>Logga ut</button>
                            </ul>
                        }

                        {/* {user && 
                            <ul className={styles.linksContainer}>
                                <li><a href="/">Dashboard</a></li>
                                <li><a href="/admin/stock">Lager</a></li>
                                <li><a href="/transcations">Kunder</a></li>
                                <li><a href="/transcations">Transaktioner</a></li>
                                <button onClick={handleSignout}>Logga ut</button>
                            </ul>
                        } */}
                     </div>
                </div>
               
            </div>
        </div>
    );
}


export default HeaderComponent; 