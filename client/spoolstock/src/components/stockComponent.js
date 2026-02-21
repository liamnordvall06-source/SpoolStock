import React, { useEffect, useState } from "react";
import styles from "./stockComponent.module.css";
import { FaShoppingCart } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import { getAuth, onAuthStateChanged } from "firebase/auth";


const StockComponent = () => {
  const [withdrwalPopup, setWithdrawalPopup] = useState(false);
  const [renderedPopup, setRenderedPopup] = useState(false);
  const [animClass, setAnimClass] = useState(styles.enter);

  const [choosenProduct, setChoosenProduct] = useState(null);
  const [stock, setStock] = useState([]);
  const [quantity, setQuantity] = useState(0);



  const [variantData, setVariantData] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [errorText, setErrorText] = useState("");
  const API_BASE = "https://api-najddsqtfa-uc.a.run.app";
  const SHOP = "brandit3d.myshopify.com";


  useEffect(() => {
    if (choosenProduct) {
      const auth = getAuth();

      return onAuthStateChanged(auth, async (user) => {
        try {
          const url = `${API_BASE}/shopify/variant`;

          const response = await fetch(url, {
            headers: {
              "x-variant-id": choosenProduct?.shopifyId
            }
          });

          const data = await response.json();

          setVariantData(data);
          console.log(data);
        } catch (err) {
          console.error(err);
          setErrorText(err?.message || "Okänt fel");
        } 
      });
    }
   
  }, [choosenProduct]);



  const fetchStock = async (companyId) => {
    try {
      const response = await fetch(
        `https://api-najddsqtfa-uc.a.run.app/company/${companyId}/stock`
      );
      if (!response.ok) return;
      const data = await response.json();
      setStock(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log("Fetch stock failed:", e.message);
    }
  };

  const handleWithdrawalShow = (productId) => {
    const picked = stock.find((item) => item.id === productId) || null;
    setChoosenProduct(picked);
    setWithdrawalPopup(true);
  };

  const handleOnClose = () => {
    setWithdrawalPopup(false);
  };

  useEffect(() => {
    const companyId = localStorage.getItem("CID");
    fetchStock(companyId);
  }, []);

  useEffect(() => {
    setAnimClass(styles.exit);

    const exitMs = 220;
    const t1 = setTimeout(() => {
      setRenderedPopup(withdrwalPopup);
      setAnimClass(styles.enter);
    }, exitMs);

    return () => clearTimeout(t1);
  }, [withdrwalPopup]);


  const handleRedirect = () => {
    if (!choosenProduct?.productOriginalUrl) return;
    window.location.href = choosenProduct.productOriginalUrl;
  };

  const handleRedirectDatasheet = () => {
    const datasheet_pointer = variantData?.metafields?.nodes?.filter(m => m.key === "datasheet")[0];
    window.location.href = datasheet_pointer.value;

  }


  const handleWithdrawal = async () => {
    try {
            const productId = choosenProduct?.id;

            const jsonObj = {
                quantity,
                productId
            }

            const CID = localStorage.getItem("CID");

            const response = await fetch(`https://api-najddsqtfa-uc.a.run.app/company/${CID}/stock`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(jsonObj)
            })

            const data = await response.json();
            await fetchStock();
            
            setWithdrawalPopup(false);

        } catch (e) {
            console.log(e.message);
        }
    }

  return (
    <div className={styles.stockContainer}>
      <div className={styles.stockInnerContainer}>
        <div className={styles.stage}>
          <div className={`${styles.view} ${animClass}`}>
            {renderedPopup ? (
              <div className={styles.productPreviewContainer}>
                {/* HEADER (sticky) */}
                <div className={styles.previewHeader}>
                  <div className={styles.headerLeftContainer}>
                    
                    <button onClick={handleOnClose} className={styles.backBtn}>
                      <IoIosArrowBack />
                    </button>
                    <h1>{variantData?.productName} {variantData?.variantTitle}</h1>

                  </div>

                  <button
                    className={styles.shopBtn}
                    aria-label="Extra Beställning"
                    onClick={handleRedirect}
                  >
                    <FaShoppingCart />
                  </button>
                </div>

                {/* SCROLL CONTENT */}
                <div className={styles.previewContent}>
                  <div className={styles.middleContainer}>
                    <div className={styles.imageContainer}>

                      <img alt={variantData?.productName} src={variantData?.imageUrl || null} />

                      <h2>Gör uttag</h2>

                      <div className={styles.withdrawalContainer}>
                      <input
                        placeholder="Skriv in antal"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(choosenProduct?.quantity >= e.target.value && e.target.value)}
                      />
                        <button className={styles.withdrawalBtn} onClick={handleWithdrawal}>Gör uttag</button>
                      </div>

                      <p className={styles.stockText}>Antal tillgängliga: {choosenProduct?.quantity} ST</p>

                    </div>
                    <div className={styles.previewText}>
                      <h1>Beskrivning</h1>
                      <p className={styles.variantDescription}>{variantData?.productDescription}</p>
                      <br/>

                      <h1>Specifikationer</h1>

                      {variantData?.metafields?.nodes?.map((metafield) => {
                        if (metafield.key != "datasheet") {
                          return (
                            <div className={styles.productSpecificationContainer}>
                              <p className={styles.metafieldDescription}>{metafield.definition.description}</p>
                              <p className={styles.metafieldValue}>{metafield.value}</p>
                            </div>
                          )
                        }
                      })}
                      <br/>
                      <h1>Datablad</h1>
                      <button className={styles.downloadDataSheetButton} onClick={() => handleRedirectDatasheet()}>Ladda ner datablad</button>
                      <br />
                    </div>
                  </div>
                </div>


              </div>
            ) : (
              <>
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
                      {stock?.map((stockItem) => (
                        <tr
                          key={stockItem.id}
                          onClick={() => handleWithdrawalShow(stockItem.id)}
                        >
                          <td>
                            <img alt={stockItem.productName} src={stockItem.productImageUrl} />
                          </td>
                          <td className={styles.distributorRowTh}>
                            {stockItem.productDistributor}
                          </td>
                          <td>{stockItem.productName}</td>
                          <td>{stockItem.productWeight} KG</td>
                          <td>{stockItem.quantity} ST</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockComponent;