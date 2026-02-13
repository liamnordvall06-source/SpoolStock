import styles from "./stockPage.module.css";
import HeaderComponent from "../components/headerComponent";
import { useEffect, useState } from "react";
import WithdrawalComponent from "../components/withdrawalComponent";


const StockPage = () => {

    const [stock, setStock] = useState([]);

    const [stockLoading, setStockLoading] = useState(false);
    
    const [withdrwalPopup, setWithdrawalPopup] = useState(false);
    const [choosenProduct, setChoosenProduct] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const CID = localStorage.getItem("CID")
            fetchStock(CID);
        }

        fetchData();
    }, [])

    const fetchStock = async (companyId) => {
        try {
            setStockLoading(true);

            const response = await fetch(`https://api-najddsqtfa-uc.a.run.app/company/${companyId}/stock`);

            if (!response.ok) return; // silently exit if server returns an error

            const data = await response.json();

            setStock(Array.isArray(data) ? data : []); // ensure stock is always an array
        } catch (e) {
            // silently fail
            console.log("Fetch stock failed:", e.message);
        } finally {
            setStockLoading(false); // always stop loading
        }
    };

    const handleWithdrawal = async (productId) => {
    try {
        setWithdrawalPopup(true);
        setChoosenProduct(productId)
    } catch (e) {
        console.log(e.message);
    }
}

    return (
        <div className={styles.mainContainer}>
            <HeaderComponent />
            {withdrwalPopup && <WithdrawalComponent productId={choosenProduct} onClose={() => setWithdrawalPopup(false)}/>}

            <div className={styles.innerContainer}>
                        <div className={styles.stockContainer}>
                            <div className={styles.stockInnerContainer}>
                                <h1>Lagersaldon</h1>
                                    <div className={styles.stockTableWrapper}>
                                    <table>
                                    <thead>
                                        <tr className={styles.tableHeader}>
                                        <th>Leverantör</th>
                                        <th>Beskrivning</th>
                                        <th>Färg</th>
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
            </div>
        </div>
    );
}


export default StockPage;