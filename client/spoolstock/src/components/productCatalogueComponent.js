import React from "react";
import styles from "./productCatalogueComponent.module.css";


const ProductCatalogueComponent = () => {
    return (
        <div className={styles.productCatalgoueContainer}>
            <div className={styles.productCatalgoueInnerContainer}>
                <h1>Produktkatalog</h1>

                   <div className={styles.ProductCatalogueTableWrapper}>
                        <table>
                            <thead>
                                <tr className={styles.tableHeader}>
                                    <th></th>
                                    <th className={styles.distributorRowTh}>Leverantör</th>
                                    <th>Beskrivning</th>
                                    <th>Vikt</th>
                                    <th>Pris</th>
                                </tr>
                            </thead>
                    </table>
                </div>
            </div>
        </div>
    );
}


export default ProductCatalogueComponent;