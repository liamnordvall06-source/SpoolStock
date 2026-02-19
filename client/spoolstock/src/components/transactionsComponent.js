import React, {useState, useEffect} from "react";
import styles from "./transactionsComponent.module.css";


const TransactionsComponent = () => {

    const [transactions, setTransactions] = useState([]);


    const fetchTranscations = async (companyId) => {
        try {
            const response = await fetch(`https://api-najddsqtfa-uc.a.run.app/company/${companyId}/transactions`);

            if (!response.ok) return; 

            const data = await response.json();

            setTransactions(Array.isArray(data) ? data : []); 
        } catch (e) {
            console.log("Fetch transactions failed:", e.message);
        } 
    };


    useEffect(() => {
        const CID = localStorage.getItem("CID");
        fetchTranscations(CID);  
    }, [])


    return (
        <div className={styles.transcationsContainer}>
            <div className={styles.transcationsInnerContainer}>
                <h1>Transaktioner</h1>
                
                <div className={styles.transcationsTableWrapper}>
                    <table>
                        <thead>
                            <tr className={styles.tableHeader}>
                                <th className={styles.transcationIdContainer}>Transaktion ID</th>
                                <th>Datum</th>
                                <th>Artikel</th>
                                <th>Antal uttagna</th>
                                <th>Typ</th>
                            </tr>
                        </thead>
                        
                        <tbody>
                            {transactions && transactions    .sort((a, b) => {
                                const dateA = a.date?._seconds ? a.date._seconds : new Date(a.date).getTime() / 1000;
                                const dateB = b.date?._seconds ? b.date._seconds : new Date(b.date).getTime() / 1000;
                                return dateB - dateA;
                            }).map((transaction) => {
                                let dateStr = "N/A";
                                if (transaction.date) {
                                    if (transaction.date.toDate) {
                                        dateStr = transaction.date.toDate().toLocaleDateString();
                                    } 
                                    else if (transaction.date._seconds) {
                                        dateStr = new Date(transaction.date._seconds * 1000).toLocaleDateString();
                                    }
                                }

                                    return (
                                        <tr key={transaction.id}>
                                            <td ></td>
                                            <td className={styles.transcationIdContainer}>#{transaction.id}</td>
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
    );
}


export default TransactionsComponent;