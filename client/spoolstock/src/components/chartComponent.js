import React, {useState, useEffect} from "react";
import styles from "./chartComponent.module.css";
import { AreaChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area } from "recharts";


const ChartComponent = () => {
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

    
    const transactionDates = transactions.filter(item => item.type === "withdrawal").map(item => new Date(item.date._seconds * 1000));

    const oldestDate = new Date(Math.min(...transactionDates));
    const newestDate = new Date(Math.max(...transactionDates));

    const months = [];
    let tempDate = new Date(oldestDate.getFullYear(), oldestDate.getMonth(), 1);

    while (tempDate <= newestDate) {
        months.push({ year: tempDate.getFullYear(), month: tempDate.getMonth(), weight: 0 });
        tempDate.setMonth(tempDate.getMonth() + 1);
    }

    transactions.forEach(item => {
        if (item.type === "withdrawal") {
            const itemDate = new Date(item.date._seconds * 1000);
            const monthIndex = months.findIndex(m => m.year === itemDate.getFullYear() && m.month === itemDate.getMonth());

            if (monthIndex !== -1) {
                months[monthIndex].weight += parseInt(item.productWeight) * parseInt(item.quantity);
            }
        }
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const chartData = months.map(m => ({
        name: `${monthNames[m.month]} ${m.year}`,
        weight: m.weight
    }));


    return (
        <div className={styles.statisticsContainer}>
            <div className={styles.statisticsInnerContainer}>
                <h1>Utveckling</h1>
                <p>Följ din utveckling och se dina bästa perioder</p>
                <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 5, bottom: 5 }}>
                            <XAxis dataKey="name" />
                            <YAxis label={{ value: "kg", angle: -90, position: "insideLeft" }} />
                            <Tooltip />
                            <Area
                                type="monotone"
                                dataKey="weight"
                                stroke="#4294FF"
                                fill="#4294FF"
                                fillOpacity={0.3}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>   
            </div>
        </div>
    );
}


export default ChartComponent;