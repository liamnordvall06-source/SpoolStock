import React from "react";
import styles from "./productCataloguePage.module.css"
import HeaderComponent from "../components/headerComponent";
import ProductCatalogueComponent from "../components/productCatalogueComponent";


const ProductCataloguePage = () => {
    return (
        <div className={styles.mainContainer}>
            <HeaderComponent />

            <div className={styles.innerContainer}>
                <ProductCatalogueComponent />
            </div>
        </div>
    );
}


export default ProductCataloguePage;