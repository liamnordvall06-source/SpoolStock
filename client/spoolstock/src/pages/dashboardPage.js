import React, { useEffect, useState } from "react";
import styles from "./dashboardPage.module.css";
import HeaderComponent from "../components/headerComponent";
import { TbPackage, TbCurrencyDollar, TbHandStop, TbChartAreaLine } from "react-icons/tb";
import WithdrawalComponent from "../components/withdrawalComponent";
import { AreaChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area } from "recharts";


const DashboardPage = () => {

    const [stock, setStock] = useState([]);
    const [transactions, setTransactions] = useState([]);

    const [stockLoading, setStockLoading] = useState(false);
    const [transactionsLoading, setTransactionsLoading] = useState(false);

    const [withdrwalPopup, setWithdrawalPopup] = useState(false);
    const [choosenProduct, setChoosenProduct] = useState("");

    const [turnoverMonthly, setTurnoverMonthly] = useState(0);
    const [withdrawalCount, setWithdrawalCount] = useState(0);
    const [withdrawalWeight, setWithdrawalWeight] = useState(0);
    const [withdrawalWeightSinceStart, setWithdrawalWeightSinceStart] = useState(0);

    const fetchData = async () => {
        fetchStock("0LhqIqojEDGj4rIfZWkU");
        fetchTranscations("0LhqIqojEDGj4rIfZWkU");
    }

    useEffect(() => {
        fetchData();
    }, [])


const fetchStock = async (companyId) => {
    try {
        setStockLoading(true);

        const response = await fetch(`https://api-najddsqtfa-uc.a.run.app/company/${companyId}/stock`);

        if (!response.ok) return; 

        const data = await response.json();

        setStock(Array.isArray(data) ? data : []); 
    } catch (e) {

        console.log("Fetch stock failed:", e.message);
    } finally {
        setStockLoading(false); 
    }
};

const fetchTranscations = async (companyId) => {
    try {
        setTransactionsLoading(true);

        const response = await fetch(`https://api-najddsqtfa-uc.a.run.app/company/${companyId}/transactions`);

        if (!response.ok) return; 



        const data = await response.json();

        let numberOfWithdrawals = 0;
        let monthlyCost = 0;
        let monthlyWeight = 0;
        let weightSinceStart = 0;

        const currentDate = new Date().getMonth();


        for (let i = 0; i < data.length; i++) {
            if (data[i].type == "withdrawal") {

                const itemDate = new Date(data[i].date._seconds * 1000).getMonth();

                if (itemDate === currentDate) {
                    numberOfWithdrawals ++;

                    monthlyCost += parseInt(data[i].productCost) * parseInt(data[i].quantity);
                    
                    monthlyWeight += parseInt(data[i].productWeight) * parseInt(data[i].quantity);
                }

                weightSinceStart += parseInt(data[i].productWeight) * parseInt(data[i].quantity);
            }
        }

        
        setWithdrawalCount(numberOfWithdrawals);    
        setTurnoverMonthly(monthlyCost);
        setWithdrawalWeight(monthlyWeight);
        setWithdrawalWeightSinceStart(weightSinceStart)

        setTransactions(Array.isArray(data) ? data : []); // ensure transactions is always an array
    } catch (e) {
        // silently fail
        console.log("Fetch transactions failed:", e.message);
    } finally {
        setTransactionsLoading(false); // always stop loading
    }
};

const handleWithdrawal = async (productId) => {
    try {
        setWithdrawalPopup(true);
        setChoosenProduct(productId);
    } catch (e) {
        console.log(e.message);
    }
}

const handleOnClose = () => {
    setWithdrawalPopup(false)
    fetchData();
}

  const transactionDates = transactions
    .filter(item => item.type === "withdrawal")
    .map(item => new Date(item.date._seconds * 1000));

    const oldestDate = new Date(Math.min(...transactionDates));
    const newestDate = new Date(Math.max(...transactionDates));

    // 2. Create months between oldest and newest
    const months = [];
    let tempDate = new Date(oldestDate.getFullYear(), oldestDate.getMonth(), 1);

    while (tempDate <= newestDate) {
        months.push({ year: tempDate.getFullYear(), month: tempDate.getMonth(), weight: 0 });
        tempDate.setMonth(tempDate.getMonth() + 1);
    }

    // 3. Sum weight per month
    transactions.forEach(item => {
        if (item.type === "withdrawal") {
        const itemDate = new Date(item.date._seconds * 1000);
        const monthIndex = months.findIndex(
            m => m.year === itemDate.getFullYear() && m.month === itemDate.getMonth()
        );
        if (monthIndex !== -1) {
            months[monthIndex].weight += parseInt(item.productWeight) * parseInt(item.quantity);
        }
        }
    });

    // Month names array
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // 4. Prepare data for the chart with Month Year format
    const chartData = months.map(m => ({
        name: `${monthNames[m.month]} ${m.year}`, // e.g., Feb 2026
        weight: m.weight
    }));


    return (
        <div className={styles.mainContainer}>
            <HeaderComponent />
            {withdrwalPopup && <WithdrawalComponent productId={choosenProduct} onClose={() => handleOnClose()}/>}
            <div className={styles.innerContainer}>
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


                    <div className={styles.middleContainer}>
                        <div className={styles.stockContainer}>
                            <div className={styles.stockInnerContainer}>
                                <h1>Lagersaldon</h1>
                                    <div className={styles.stockTableWrapper}>
                                    <table>
                                    <thead>
                                        <tr className={styles.tableHeader}>
                                        <th>Leverantör</th>
                                        <th>Beskrivning</th>
                                        <th>Vikt</th>
                                        <th>Antal</th>
                                        <th>Uttag</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {stock &&
                                            stock?.map(stockItem => {
                                                return (
                                                    <tr>
                                                        <td>{stockItem.productDistributor}</td>
                                                        <td>{stockItem.productName}</td>
                                                        <td>{stockItem.productWeight} KG</td>
                                                        <td>{stockItem.quantity} ST</td>
                                                        <td><button onClick={() => handleWithdrawal(stockItem.id)}>Ta ut</button></td>
                                                    </tr>    
                                                );
                                            })
                                        }
                                     
                                    </tbody>
                                    </table>
                                    </div>
                            </div>
                        </div>
                        <div className={styles.statisticsContainer}>
                            <div className={styles.statisticsInnerContainer}>
                                <h1>Utveckling</h1>
                                <p>Följ din utveckling och se dina bästa perioder</p>
                                <div className={styles.chartContainer}>
                                    <ResponsiveContainer width="100%" height={400}>
                                    <AreaChart
                                        data={chartData}
                                        margin={{ top: 20, right: 30, left: 5, bottom: 5 }}
                                    >
                                        <XAxis dataKey="name" />
                                        <YAxis label={{ value: "kg", angle: -90, position: "insideLeft" }} />
                                        <Tooltip />

                                        {/* Use weight instead of uv */}
                                        <Area
                                        type="natural"
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
                    </div>


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


export default DashboardPage; 