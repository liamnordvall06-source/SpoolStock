import React, { useEffect, useState } from "react";
import styles from "./summarComponent.module.css";
import { TbPackage, TbCurrencyDollar, TbHandStop, TbChartAreaLine } from "react-icons/tb";


const SummaryComponent = () => {

    const [turnoverMonthly, setTurnoverMonthly] = useState(0);
    const [withdrawalCount, setWithdrawalCount] = useState(0);
    const [withdrawalWeight, setWithdrawalWeight] = useState(0);
    const [withdrawalWeightSinceStart, setWithdrawalWeightSinceStart] = useState(0);

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
    

    const getTranscationSummary = () => {
        let numberOfWithdrawals = 0;
        let monthlyCost = 0;
        let monthlyWeight = 0;
        let weightSinceStart = 0;

        const currentDate = new Date().getMonth();

        for (let i = 0; i < transactions.length; i++) {
            if (transactions[i].type == "withdrawal") {

                const itemDate = new Date(transactions[i].date._seconds * 1000).getMonth();

                if (itemDate === currentDate) {
                    numberOfWithdrawals ++;

                    monthlyCost += parseInt(transactions[i].productCost) * parseInt(transactions[i].quantity);
                    
                    monthlyWeight += parseInt(transactions[i].productWeight) * parseInt(transactions[i].quantity);
                }

                weightSinceStart += parseInt(transactions[i].productWeight) * parseInt(transactions[i].quantity);
            }
        }
 
        setWithdrawalCount(numberOfWithdrawals);    
        setTurnoverMonthly(monthlyCost);
        setWithdrawalWeight(monthlyWeight);
        setWithdrawalWeightSinceStart(weightSinceStart)
    }


    useEffect(() => {
        const CID = localStorage.getItem("CID");
        fetchTranscations(CID);  
        getTranscationSummary();
    }, [transactions])


    return (
        <div className={styles.summaryContainer}>
            <div className={styles.rowContainer1}>
                <div className={styles.iconContainer}>
                    <TbCurrencyDollar  />
                </div>
                <h2>Månadskostnad</h2>
                <h1>{turnoverMonthly} SEK</h1>
            </div>
            <div className={styles.rowContainer2}>
                <div className={styles.iconContainer}>
                    <TbPackage  />
                </div>
                <h2>Månadsförbrukning</h2>
                <h1>{withdrawalWeight} KG</h1>
            </div>
            <div className={styles.rowContainer3}>
                <div className={styles.iconContainer}>
                    <TbHandStop  />
                </div>
                <h2>Antal uttag</h2>
                <h1>{withdrawalCount} ST</h1>
            </div>
            <div className={styles.rowContainer4}>
                <div className={styles.iconContainer}>
                    <TbChartAreaLine />
                </div>
                <h2>Förbrukat sen start</h2>
                <h1>{withdrawalWeightSinceStart} KG</h1>
            </div>
        </div>
    );
}


export default SummaryComponent;