import React, { useState } from "react";
import styles from "./dashboardPage.module.css";
import HeaderComponent from "../components/headerComponent";
import SummaryComponent from "../components/summarComponent";
import StockComponent from "../components/stockComponent";
import TransactionsComponent from "../components/transactionsComponent";
import ChartComponent from "../components/chartComponent";

const DashboardPage = () => {
    // Ett "trigger" state som ändras när vi vill reloada child-komponenter
    const [reloadTrigger, setReloadTrigger] = useState(0);

    // Funktion som barnen kan anropa för att trigga reload
    const updateDashboard = () => {
        setReloadTrigger(prev => prev + 1); // ändrar state → forcear children att uppdatera
    };

    return (
        <div className={styles.mainContainer}>
            <HeaderComponent />

            <div className={styles.innerContainer}>
                {/* skicka reloadTrigger som prop */}
                <SummaryComponent reloadTrigger={reloadTrigger} />

                <div className={styles.middleContainer}>
                    <div className={styles.stockWrapper}>
                        {/* skicka funktionen till StockComponent */}
                        <StockComponent updateDashboard={updateDashboard} />
                    </div>

                    <div className={styles.chartWrapper}>
                        <ChartComponent reloadTrigger={reloadTrigger} />
                    </div>
                </div>

                <div className={styles.transactionsWrapper}>
                    <TransactionsComponent reloadTrigger={reloadTrigger} />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;