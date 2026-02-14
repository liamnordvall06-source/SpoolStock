import React, { useEffect, useState } from "react";
import styles from "./dashboardPage.module.css";
import HeaderComponent from "../components/headerComponent";
import SummaryComponent from "../components/summarComponent";
import StockComponent from "../components/stockComponent";
import TransactionsComponent from "../components/transactionsComponent";
import ChartComponent from "../components/chartComponent";


const DashboardPage = () => {


    return (
        <div className={styles.mainContainer}>
            <HeaderComponent />

            <div className={styles.innerContainer}>
                <SummaryComponent />


                <div className={styles.middleContainer}>
                    <div className={styles.stockWrapper}>
                        <StockComponent />
                    </div>

                    <div className={styles.chartWrapper}>
                        <ChartComponent />
                    </div>
                </div>

                <div className={styles.transactionsWrapper}>
                    <TransactionsComponent />
                </div>
            </div>
        </div>
    );
}


export default DashboardPage; 