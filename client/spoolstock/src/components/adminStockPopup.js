import React, { useEffect, useState } from "react";
import styles from "./adminStockPopup.module.css";
import { RxCross1 } from "react-icons/rx";
import { getAuth } from "firebase/auth";


const AdminStockPopup = ({productId, onClose}) => {
    const [productData, setProductData] = useState();
    const [quantity, setQuantity] = useState(0  );

    useEffect(() => {
        fetchProductData();
    }, [])


    const fetchProductData = async () => {
    try {
        const auth = getAuth();
        const user = auth.currentUser;

        const response = await fetch(
        `https://api-najddsqtfa-uc.a.run.app/shopify/variant`,
        {
            headers: {
            "x-variant-id": productId,     
            "x-shop": "brandit3d.myshopify.com",
            "x-customer-id": user.uid,
            },
        }
        );

        const data = await response.json();
        setProductData(data);
        console.log(data);  
    } catch (e) {
        console.log(e.message);
    }
    };


        return (
            <div className={styles.outerContainer}>
                <div className={styles.mainContainer}>
                    <div className={styles.innerContainer}>
                        <div className={styles.headerContainer}>
                            <h1>Gör uttag</h1>
                            <button className={styles.cancelBtn} onClick={onClose}><RxCross1 /></button>
                        </div>
                        <p>Tillgängligt lager: {productData?.stock}</p>
                        <div className={styles.imageContainer}>
                            <h2>{productData?.productName}</h2>
                            <img src={productData?.imageUrl} alt={productData?.productName} />
                            <label>Välj antal</label>
                            <input type="number" max={parseInt(productData?.stock)} value={quantity} onChange={(e) => e.target.value <= productData?.stock && setQuantity(e.target.value)}></input>
                        </div>
                        <div className={styles.footerContainer}>
                            <button className={styles.orderBtn}>Sätt in</button>
                            <button className={styles.withdrawBtn}>Ta ut</button>
                        </div>
    
    
                        <form>
    
                        </form>
                    </div>
                </div>
            </div>
        );
}


export default AdminStockPopup;