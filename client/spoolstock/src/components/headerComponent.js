import React from "react";
import styles from "./headerComponent.module.css";
import BrandLogo from "../assets/BlackLogo.png"


const HeaderComponent = () => {
    return (
        <div className={styles.mainContainer}>
            <div className={styles.bannerContainer}>
                <p>Välkommen!</p>
            </div>
            <div className={styles.headerContainer}>
                <div className={styles.innerContainer}>
                    <img src={BrandLogo} />
                     <div className={styles.rightContainer}>
                        <ul className={styles.linksContainer}>
                            <li><a href="/">Lager</a></li>
                            <li><a href="/">Uttag</a></li>
                            <li><a href="/">Fakturor</a></li>
                            <li><a href="/">Konto</a></li>
                        </ul>
                     </div>
                </div>
               
            </div>
        </div>
    );
}


export default HeaderComponent; 