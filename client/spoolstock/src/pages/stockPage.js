import styles from "./stockPage.module.css";
import HeaderComponent from "../components/headerComponent";
import { useEffect, useState } from "react";
import WithdrawalComponent from "../components/withdrawalComponent";
import StockComponent from "../components/stockComponent";


const StockPage = () => {

    return (
        <div className={styles.mainContainer}>
            <HeaderComponent />

            <div className={styles.innerContainer}>
                <StockComponent />
            </div>
        </div>
    );
}


export default StockPage;