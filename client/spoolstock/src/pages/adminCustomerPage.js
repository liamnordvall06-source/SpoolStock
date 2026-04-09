import React, { useEffect, useState } from "react";
import styles from "./adminCustomerPage.module.css";
import AdminHeaderComponent from "../components/adminHeaderComponent";
import SummaryComponent from "../components/summarComponent";
import StockComponent from "../components/stockComponent";
import TransactionsComponent from "../components/transactionsComponent";
import { useParams } from "react-router-dom";
import AdminStockComponent from "../components/adminStockComponent";
import AdminTransactionsComponent from "../components/adminTransactionsComponent";


const AdminCustomerPage = () => {
   
    const API_BASE = "https://api-najddsqtfa-uc.a.run.app";

    const { customerId } = useParams();

    const [customerData, setCustomerData] = useState({});

    const fetchCustomer = async () => {
        try {
            let companyId = "";

            if (customerId) {
                companyId = customerId;
            } else {
                companyId = localStorage.getItem("CID");
            }

            const response = await fetch(`${API_BASE}/company/${companyId}`);

            const data = await response.json();

            setCustomerData(data);
            
            if (!response.ok) throw new Error("Kunde inte hämta lager");
        } catch (e) {
            console.log(e);
        }
    }

    
    useEffect(() => {
        fetchCustomer();
    }, [])


    return (
        <div className={styles.mainContainer}>
            <AdminHeaderComponent />

            <div className={styles.innerContainer}>
                <h1>{customerData?.companyName}</h1>
                
                <SummaryComponent customerId={customerId}/>

                <div className={styles.stockWrapper}>
                    <AdminStockComponent customerId={customerId} />
                </div>

                <div className={styles.transactionsWrapper}>
                    <AdminTransactionsComponent customerId={customerId} />
                </div>

            </div>
        </div>
    );
}


export default AdminCustomerPage;