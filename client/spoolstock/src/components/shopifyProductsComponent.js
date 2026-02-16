import React, { useEffect, useRef, useState } from "react";
import styles from "./shopifyProductsComponent.module.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import AdminStockPopup from "../components/adminStockPopup.js";

const API_BASE = "https://api-najddsqtfa-uc.a.run.app";
const SHOP = "brandit3d.myshopify.com";

export default function ShopifyProductsComponent() {
  const [variants, setVariants] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    const auth = getAuth();

    return onAuthStateChanged(auth, async (user) => {
      try {
        const url = `${API_BASE}/shopify/variants?shop=${SHOP}&customerId=${user.uid}`;
        console.log("Fetching:", url);

        const response = await fetch(url);
        const data = await response.json();


        setVariants(data.variants);
     
      } catch (err) {
        console.error(err);
        setErrorText(err?.message || "Okänt fel");
      } 
    });
  }, []);

  useEffect(() => {
    console.log(variants)
  }, [variants])


  const openPopup = (productId) => setSelectedProductId(productId);
  const closePopup = () => setSelectedProductId(null);

  return (
    <div className={styles.stockContainer}>
      {selectedProductId && (
        <AdminStockPopup productId={selectedProductId} onClose={closePopup} />
      )}

      <div className={styles.stockInnerContainer}>
        <h1>Lagersaldon</h1>
        <p>Importerad från Shopify</p>
            <div className={styles.stockTableWrapper}>
                <table>
                    <thead>
                    <tr className={styles.tableHeader}>
                        <th className={styles.distributorRowTh}>Leverantör</th>
                        <th>Variant</th>
                        <th>Pris</th>
                        <th>Antal</th>
                    </tr>
                    </thead>

                    <tbody>

                    {variants &&
                        variants.map((variant) => (
                        <tr className={styles.variantRow} onClick={() => variant.variantId && openPopup(variant.variantId)}>
                            <td><img src={variant.image ? variant.image : variant.productImage}></img></td>
                            <td>{variant.name ?? "—"}</td>
                            <td>{variant.price - variant.price * 0.2 ?? "—"} SEK</td>
                            <td>{variant.inventoryQuantity ?? "—"} ST</td>
                        </tr>
                        ))}

                    </tbody>
                </table>
            </div>
        </div>
      </div>
  );
}
