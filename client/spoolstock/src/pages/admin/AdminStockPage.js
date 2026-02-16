import React, { useEffect, useState } from "react";
import styles from "./AdminStockPage.module.css";
import HeaderComponent from "../../components/headerComponent";
import ShopifyProductsComponent from "../../components/shopifyProductsComponent";


const AdminStockPage = () => {
    return (
        <div className={styles.mainContainer}>
            <HeaderComponent />
            <div className={styles.innerContainer}>
                <div className={styles.stockWrapper}>
                    <ShopifyProductsComponent />
                </div>
            </div>
        </div>
    );
}


export default AdminStockPage;