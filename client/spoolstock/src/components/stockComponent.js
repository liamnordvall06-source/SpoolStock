import React, { useEffect, useState } from "react";
import styles from "./stockComponent.module.css";
import WithdrawalComponent from "./withdrawalComponent";
import { PiHandWithdraw } from "react-icons/pi";


const StockComponent = () => {

    const [withdrwalPopup, setWithdrawalPopup] = useState(false);
    const [choosenProduct, setChoosenProduct] = useState("");
    const [stock, setStock] = useState([]);

    
    const fetchStock = async (companyId) => {
        try {

            const response = await fetch(`https://api-najddsqtfa-uc.a.run.app/company/${companyId}/stock`);

            if (!response.ok) return; 

            const data = await response.json();

            setStock(Array.isArray(data) ? data : []); 
        } catch (e) {

            console.log("Fetch stock failed:", e.message);
        }
    };


    const handleWithdrawal = async (productId) => {
        try {
            window.scrollTo({ top: 0, behavior: "instant" });
            document.body.style.overflow = "hidden";

            setWithdrawalPopup(true);
            setChoosenProduct(productId);
        } catch (e) {
            console.log(e.message);
        }
    }


    const handleOnClose = () => {
        setWithdrawalPopup(false);

        document.body.style.overflow = "auto";
    }


    useEffect(() => {
        const companyId = localStorage.getItem("CID");
        fetchStock(companyId);
    }, [])


    return (
        <>
            {withdrwalPopup && <WithdrawalComponent productId={choosenProduct} onClose={() => handleOnClose()}/>}

            <div className={styles.stockContainer}>
                    <div className={styles.stockInnerContainer}>
                        <h1>Lagersaldon</h1>
                        <p>Tryck på kortet för att göra uttag</p>

                        <div className={styles.stockTableWrapper}>
                            <table>
                                <thead>
                                    <tr className={styles.tableHeader}>
                                    <th className={styles.distributorRowTh}>Leverantör</th>
                                    <th>Beskrivning</th>
                                    <th>Vikt</th>
                                    <th>Antal</th>
                                    </tr>
                                </thead>
                    
                                <tbody>
                                    {stock &&
                                        stock?.map(stockItem => {
                                            return (
                                                <tr onClick={() => handleWithdrawal(stockItem.id)}>
                                                    <td className={styles.distributorRowTh}>{stockItem.productDistributor}</td>
                                                    <td>{stockItem.productName}</td>
                                                    <td>{stockItem.productWeight} KG</td>
                                                    <td>{stockItem.quantity} ST</td>
                                                </tr>    
                                            );
                                        })
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>        
        </>
    );
}


export default StockComponent;