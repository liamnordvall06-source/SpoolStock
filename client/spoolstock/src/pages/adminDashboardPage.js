import React from "react";
import styles from "./adminDashboardPage.module.css";
import AdminAnalyticsComponent from "../components/adminAnalyticsComponent";
import AdminSummaryComponent from "../components/adminSummaryComponent";
import AdminStockComponent from "../components/adminStockComponent";
import AdminTransactionsComponent from "../components/adminTransactionsComponent";
import AdminCustomersComponent from "../components/adminCustomersComponent";
import AdminHeaderComponent from "../components/adminHeaderComponent";

const AdminDashboardPage = () => {
    return (
        <div className={styles.mainContainer}>
            <AdminHeaderComponent />

            <div className={styles.innerContainer}>
                <div className={styles.topContainer}>
                    <AdminAnalyticsComponent />
                    <AdminSummaryComponent />
                </div>
                <div className={styles.bottomContainer}>
                    <AdminStockComponent />
                    <AdminCustomersComponent />
                    <AdminTransactionsComponent />
                </div>
            
            </div>
        </div>
    );
}


export default AdminDashboardPage;