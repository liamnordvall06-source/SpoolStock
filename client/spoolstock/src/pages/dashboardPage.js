import React from "react";
import styles from "./dashboardPage.module.css";
import HeaderComponent from "../components/headerComponent";
import { BiDollar, BiBox } from "react-icons/bi";
import { BsGraphUp } from "react-icons/bs";
import { FaHandHolding } from "react-icons/fa6";


const DashboardPage = () => {
    return (
        <div className={styles.mainContainer}>
            <HeaderComponent />

            <div className={styles.innerContainer}>
                    <div className={styles.summaryContainer}>
                        <div className={styles.rowContainer1}>
                            <div className={styles.iconContainer}>
                                <BiDollar />
                            </div>
                            <h2>Månadskostnad</h2>
                            <h1>12 495 SEK</h1>
                        </div>
                        <div className={styles.rowContainer2}>
                            <div className={styles.iconContainer}>
                                <BiBox  />
                            </div>
                            <h2>Månadskostnad</h2>
                            <h1>12 495 SEK</h1>
                        </div>
                        <div className={styles.rowContainer3}>
                            <div className={styles.iconContainer}>
                                <FaHandHolding />
                            </div>
                            <h2>Månadskostnad</h2>
                            <h1>12 495 SEK</h1>
                        </div>
                        <div className={styles.rowContainer4}>
                            <div className={styles.iconContainer}>
                                <BsGraphUp />
                            </div>
                            <h2>Månadskostnad</h2>
                            <h1>12 495 SEK</h1>
                        </div>
                    </div>
                    <div className={styles.middleContainer}>
                        <div className={styles.stockContainer}>
            
                        </div>
                        <div className={styles.statisticsContainer}>
            
                        </div>
                    </div>
                    <div className={styles.transcationsContainer}>

                    </div>
            </div>
        </div>
    );
}


export default DashboardPage; 