import React, { useEffect, useState } from "react";
import styles from "./productCatalogueComponent.module.css";


const ProductCatalogueComponent = () => {

    const [products, setProducts] = useState();

    useEffect(() => {
        fetchData();
    }, [])


    const fetchData = async () => {
        try {
            const response = await fetch(`https://api-najddsqtfa-uc.a.run.app/articles/`);

            const data = await response.json();

            setProducts(data);

            console.log(data);

        } catch (e) {
            console.log(e.message);
        }
    }

    return (
        <div className={styles.productCatalgoueContainer}>
            <div className={styles.productCatalgoueInnerContainer}>
                <h1>Produktkatalog</h1>

                   <div className={styles.ProductCatalogueTableWrapper}>
                        <table>
                            <thead>
                                <tr className={styles.tableHeader}>
                                    <th className={styles.distributorRowTh}>Leverantör</th>
                                    <th>Beskrivning</th>
                                    <th>Pris</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td></td>
                                    <td><p>Produktkatalogen och möjligheten att utöka ditt lager lanseras inom kort!</p></td>
                                </tr>
                                {/* {products?.map((product) => {
                                    return (
                                        <tr>
                                            <td><img src={product.variantImage ? product.variantImage : product.productImage} ></img></td>
                                            <td>{product.vendor}</td>
                                            <td>{product?.variantName}</td>
                                            <td>{product.price} SEK</td>
                                        </tr>
                                    );
                                })} */}
                            </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}


export default ProductCatalogueComponent;