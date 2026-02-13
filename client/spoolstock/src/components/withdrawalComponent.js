import React, { useEffect, useState } from "react";
import styles from "./withdrawalComponent.module.css";
import { RxCross1 } from "react-icons/rx";


const WithdrawalComponent = ({productId, onClose}) => {

    const [productData, setProductData] = useState();
    const [quantity, setQuantity] = useState(1);
    
    useEffect(() => {
        const fetchProductData = async () => {
            const response = await fetch(`https://api-najddsqtfa-uc.a.run.app/product/${productId}`);

            const data = await response.json();

            console.log(data);

            setProductData(data);
        }

        fetchProductData();
    }, [])

    const handleRedirect = () => {
        window.location.href = productData?.productOriginalUrl;
    }

    const handleWithdrawal = async () => {
        try {

            const jsonObj = {
                quantity,
                productId
            }

            const response = await fetch(`https://api-najddsqtfa-uc.a.run.app/company/0LhqIqojEDGj4rIfZWkU/stock`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(jsonObj)
            })

            const data = await response.json();

            console.log(data);

            onClose();

        } catch (e) {
            console.log(e.message);
        }
    }


    return (
        <div className={styles.outerContainer}>
            <div className={styles.mainContainer}>
                <div className={styles.innerContainer}>
                    <div className={styles.headerContainer}>
                        <h1>Gör uttag</h1>
                        <button className={styles.cancelBtn} onClick={onClose}><RxCross1 /></button>
                    </div>
                    <div className={styles.imageContainer}>
                        <h2>{productData?.productName}</h2>
                        <img src={productData?.productImageUrl} alt={productData?.productName} />
                        <label>Välj antal</label>
                        <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)}></input>
                    </div>

                    <div className={styles.footerContainer}>
                        <button className={styles.orderBtn} onClick={handleRedirect}>Snabb Beställning</button>
                        <button className={styles.withdrawBtn} onClick={handleWithdrawal}>Ta ut</button>
                    </div>


                    <form>

                    </form>
                </div>
            </div>
        </div>
    );
}


export default WithdrawalComponent;