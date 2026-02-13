import React, { useEffect, useState } from "react";
import styles from "./transactionsPage.module.css";
import HeaderComponent from "../components/headerComponent";


const TranscationsPage = () => {

    const [transactions, setTransactions] = useState([]);
    
    const [transactionsLoading, setTransactionsLoading] = useState(false);


    useEffect(() => {
        const fetchData = async () => {
            const CID = localStorage.getItem("CID")

            fetchTranscations(CID);
        }

        fetchData();
    }, [])
    

    const fetchTranscations = async (companyId) => {
        try {
            setTransactionsLoading(true);

            const response = await fetch(`https://api-najddsqtfa-uc.a.run.app/company/${companyId}/transactions`);

            if (!response.ok) return; // silently exit on error

            const data = await response.json();

            setTransactions(Array.isArray(data) ? data : []); // ensure transactions is always an array
        } catch (e) {
            // silently fail
            console.log("Fetch transactions failed:", e.message);
        } finally {
            setTransactionsLoading(false); // always stop loading
        }
    };
    return (
        <div className={styles.mainContainer}>
            <HeaderComponent />

            <div className={styles.innerContainer}>
            <div className={styles.transcationsContainer}>
                            <div className={styles.transcationsInnerContainer}>
                                <h1>Transaktioner</h1>
                                <div className={styles.transcationsTableWrapper}>
                                    <table>
                                    <thead>
                                        <tr className={styles.tableHeader}>
                                        <th>Transaktion ID</th>
                                        <th>Datum</th>
                                        <th>Artikel</th>
                                        <th>Antal uttagna</th>
                                        <th>Typ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {transactions && transactions.map((transaction) => {
                                        // Handle Firestore Timestamp or raw _seconds object
                                        let dateStr = "N/A";
                                        if (transaction.date) {
                                        if (transaction.date.toDate) {
                                            dateStr = transaction.date.toDate().toLocaleString();
                                        } else if (transaction.date._seconds) {
                                            dateStr = new Date(transaction.date._seconds * 1000).toLocaleString();
                                        }
                                        }

                                        return (
                                        <tr key={transaction.id}>
                                            <td>#{transaction.id}</td>
                                            <td>{dateStr}</td>
                                            <td>{transaction.productName}</td>
                                            <td>{transaction.quantity + " ST"}</td>
                                            <td>{transaction.type === "deposite" ? "Insättning" : "Uttag"}</td>
                                        </tr>
                                        );
                                    })}
                                    </tbody>
                                    </table>
                                    </div>
                            </div>     
                        </div>
           
            </div>            
        </div>
    );
}


export default TranscationsPage;