import React, { useEffect, useState } from "react";
import styles from "./productCatalogueComponent.module.css";
import { IoIosArrowBack, IoMdAdd, IoMdArrowBack } from "react-icons/io";
import { getAuth } from "firebase/auth";


const ProductCatalogueComponent = ({ onClose, adminId }) => {

    const [products, setProducts] = useState();
    const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);
    const [quantity, setQuantity] = useState(0);
    const [choosenProduct, setChoosenProduct] = useState(null);


    const API_BASE = "https://api-najddsqtfa-uc.a.run.app";

    const auth = getAuth();

    useEffect(() => {
        fetchData();
    }, [])


    const fetchData = async () => {
        try {
            const response = await fetch(`https://api-najddsqtfa-uc.a.run.app/articles/`);

            const data = await response.json();

            setProducts(data);

        } catch (e) {
            console.log(e.message);
        }
    }

    const handleDeposite = async (productId) => {
        if (isSubmittingWithdrawal) return;

        try {
            setIsSubmittingWithdrawal(true);
            const user = auth.currentUser;

            const parsedQuantity = parseInt(quantity, 10);

            if (!parsedQuantity || parsedQuantity <= 0) {
            setIsSubmittingWithdrawal(false);
            return;
            }

            const customerId = user.uid;
            const shopifyId = productId;

            let companyId = "";

            if (adminId) {
                companyId = adminId;
            } else {
                companyId = localStorage.getItem("CID");
            }
            console.log(companyId)

            const response = await fetch(`${API_BASE}/company/stock/deposite`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-customer-id": customerId,
                "x-company-id": companyId,
                "x-quantity": String(parsedQuantity),
                "x-shopify-id": shopifyId,
                "x-customer-image": user.photoURL || "",
            },
            });

            const data = await response.json();
            console.log(data);

            setQuantity("");
            setChoosenProduct(null);

        } catch (e) {
            console.log(e);
        } finally {
            setIsSubmittingWithdrawal(false);
        }
    };

    return (
        <div className={styles.productCatalgoueContainer}>
            <div className={styles.productCatalgoueInnerContainer}>
                <div className={styles.headerContainer}>
                    <button className={styles.goBackBtn} onClick={onClose}><IoIosArrowBack /></button>
                    <h1>Fyll på lager</h1>
                                                                        <input
                                                    type="number"
                                                    placeholder="Skriv antal"
                                                    value={quantity}
                                                    onChange={(e) => setQuantity(e.target.value)}
                                                    />
                </div>
                   <div className={styles.ProductCatalogueTableWrapper}>
                        <table>
                            <thead>
                                <tr className={styles.tableHeader}>
                                    <th className={styles.distributorRowTh}>Leverantör</th>
                                    <th>Beskrivning</th>
                                    <th></th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {products?.map((product) => {
                                    return (
                                        <tr>
                                            <td><img src={product.variantImage ? product.variantImage : product.productImage} ></img></td>
                                            <td>{product.vendor}</td>
                                            <td>{product?.variantName}</td>
                                            <td></td>
                                            <td>
                                                <div className={styles.depositeInputContainer}>

                                                    <button onClick={() => handleDeposite(product.variantId)}><IoMdAdd /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}


export default ProductCatalogueComponent;