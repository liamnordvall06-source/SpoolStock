import React, { useEffect, useState } from "react";
import styles from "./dashboardPage.module.css";
import HeaderComponent from "../components/headerComponent";
import SummaryComponent from "../components/summarComponent";
import StockComponent from "../components/stockComponent";
import TransactionsComponent from "../components/transactionsComponent";
import ChartComponent from "../components/chartComponent";

import Alert from '@mui/material/Alert';
import AlertTitle from "@mui/material/AlertTitle";


const DashboardPage = () => {


    return (
        <div className={styles.mainContainer}>
            <HeaderComponent />
{/* 
            <Alert className={styles.notification} severity="warning">
                <AlertTitle>Ditt lager börjar ta slut!</AlertTitle>
                Flera av dina material börjar ta slut. Kontakta oss för att boka <br /> en leverans.
            </Alert> */}

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