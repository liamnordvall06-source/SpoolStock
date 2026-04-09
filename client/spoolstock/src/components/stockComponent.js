import React, { useEffect, useState } from "react";
import styles from "./stockComponent.module.css";
import { FaShoppingCart } from "react-icons/fa";
import { IoIosArrowBack, IoMdAdd } from "react-icons/io";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { BeatLoader, BounceLoader, ClipLoader, GridLoader, PropagateLoader, RingLoader } from "react-spinners";


const StockComponent = ({ updateDashboard, extraOrderBtn=true }) => {
  const auth = getAuth();

  const [withdrwalPopup, setWithdrawalPopup] = useState(false);
  const [renderedPopup, setRenderedPopup] = useState(false);
  const [animClass, setAnimClass] = useState(styles.enter);
  const [loadingProductSpecification, setLoadingProductSpecification] = useState(false);

  const [choosenProduct, setChoosenProduct] = useState(null);
  const [stock, setStock] = useState([]);
  const [quantity, setQuantity] = useState(0);

  const [customerId, setCustomerId] = useState(null);
  const [variantData, setVariantData] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [errorText, setErrorText] = useState("");
  const API_BASE = "https://api-najddsqtfa-uc.a.run.app";
  const SHOP = "brandit3d.myshopify.com";

  const navigate = useNavigate();

  useEffect(() => {
    if (!choosenProduct) return;

    const fetchVariant = async () => {
      try {
        const companyId = localStorage.getItem("CID");
        const url = `${API_BASE}/company/${companyId}/article`;
        const response = await fetch(url, {
          headers: { "x-shopify-id": choosenProduct },
        });
        const data = await response.json();
        console.log(data);
        setVariantData(data);
      } catch (err) {
        console.error(err);
        setErrorText(err?.message || "Okänt fel");
      } finally {
        setLoadingProductSpecification(false); 
      }
    };

    fetchVariant();
  }, [choosenProduct]);



  const fetchStock = async () => {
    try {

      const companyId = localStorage.getItem("CID");

      const response = await fetch(
        `https://api-najddsqtfa-uc.a.run.app/company/${companyId}/stock`
      );
      if (!response.ok) return;
      const data = await response.json();

      console.log(data);
      setStock(data);

    } catch (e) {
      console.log("Fetch stock failed:", e.message);
    }
  };

  const handleWithdrawalShow = (productId) => {    
    setLoadingProductSpecification(true);
    setChoosenProduct(productId);
    setWithdrawalPopup(true);
  };

  const handleRedirectProductCatalogue = () => {
    navigate("/catalogue")
  }

  const handleOnClose = () => {
    setWithdrawalPopup(false);
  };

  useEffect(() => {
    fetchStock();
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


  const handleRedirect = (url) => {
    window.location.href = url;
  };

  const handleRedirectDatasheet = () => {
    const datasheet_pointer = variantData?.metafields?.nodes?.filter(m => m.key === "datasheet")[0];
    window.location.href = datasheet_pointer.value;

  }

const handleWithdrawal = async () => {
  try {
    const user = auth.currentUser;

    if (!user) {
      console.log("Not signed in");
      return;
    }

    const customerId = user.uid;
    const shopifyId = choosenProduct;
    const companyId = localStorage.getItem("CID");

    const response = await fetch(`https://api-najddsqtfa-uc.a.run.app/company/stock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-customer-id": customerId,
        "x-company-id": companyId,
        "x-quantity": String(quantity),
        "x-shopify-id": shopifyId,
        "x-customer-image": user.photoURL || "",
      },
    });

    const data = await response.json();
    console.log(data);

    await fetchStock();
    updateDashboard();
    setWithdrawalPopup(false);
  } catch (e) {
    console.log(e);
  }
};

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
                    <h1>{variantData?.productName} {variantData?.variantTitle != "Default Title" && variantData?.variantTitle}</h1>

                  </div>

                {extraOrderBtn &&
                  <button
                    className={styles.shopBtn}
                    aria-label="Extra Beställning"
                    onClick={() => handleRedirect(variantData?.variantUrl)}
                  >
                    <FaShoppingCart />
                  </button>
                }

                </div>

               
                <div className={styles.previewContent}>
                  <div className={styles.middleContainer}>
                    <div className={styles.imageContainer}>

                      {!loadingProductSpecification ? (
                        <img alt={variantData?.productName} src={variantData?.imageUrl || variantData?.featuredImage} />
                      ) : (
                        <div className={styles.loadingImageContainer}>
                          <BounceLoader size="60" color="#d3d3d3"/>
                        </div>
                      )}

                      <h2>Gör uttag</h2>

                      <div className={styles.withdrawalContainer}>
                      <input
                        placeholder="Skriv in antal"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(variantData?.quantity) >= e.target.value && e.target.value)}
                      />
                        <button className={styles.withdrawalBtn} onClick={() => handleWithdrawal()}>Gör uttag</button>
                      </div>

                      <p className={styles.stockText}>Antal tillgängliga: {!loadingProductSpecification ? variantData?.quantity : <ClipLoader size="10" color="#d3d3d3"/>} ST</p>
                      
                    </div>
                    {!loadingProductSpecification ? (
                      <div className={styles.previewText}>
                        <h1>Beskrivning</h1>
                        <p className={styles?.variantDescription}>{variantData?.productDescription}</p>
                        <br/>

                        <h1>Specifikationer</h1>

                        {variantData?.metafields?.nodes?.map((metafield) => {
                          if (metafield.key != "datasheet" && metafield.key != "weight" && metafield.key != "max_temperatur" && metafield.value) {
                            return (
                              <div className={styles.productSpecificationContainer}>
                                <p className={styles.metafieldDescription}>{metafield.definition?.description}</p>
                                <p className={styles.metafieldValue}>{metafield.value}</p>
                              </div>
                            )
                          }
                        })}
                        <br/>
                        

                        {variantData?.metafields?.nodes?.filter(m => m.key === "datasheet")[0] && 
                        <div>
                              <h1 className={styles.datasheetTitle}>Produktdatablad</h1>
                            <p className={styles.datasheetText}>Ta del av produktens fullständiga datablad.</p>
                            <button className={styles.downloadDataSheetButton} onClick={() => handleRedirectDatasheet()}><p>Ladda ner datablad</p></button>
                        </div>
                        }
                        <br />

                      </div>
                    ) : (
                      <div className={styles.loadingPreviewContainer}>                 
                        <BounceLoader color="#d3d3d3" />
                      </div>
                    )}

                  </div>
                </div>
              </div>
       
            ) : (
              <>

                <div className={styles.stockHeaderContainer}>
                  <div>
                    <h1>Lagersaldon</h1>
                    <p>Tryck på kortet för att göra uttag</p>
                  </div>
                  {extraOrderBtn &&
                    <button
                    className={styles.shopBtn}
                    aria-label="Lägg till artiklar"
                    onClick={handleRedirectProductCatalogue}
                  >
                    <IoMdAdd />
                  </button>
                  }
                </div>
                

                <div className={styles.stockTableWrapper}>
                  <table>
                    <thead>
                      <tr className={styles.tableHeader}>
                        <th className={styles.distributorRowTh}>Leverantör</th>
                        <th>Beskrivning</th>
                        <th>Tillgänglighet</th>
                        <th>Antal</th>
                      </tr>
                    </thead>

                    <tbody>
                      {stock?.map((product) => (
                        <tr
                          key={product.variantId}
                          onClick={() => handleWithdrawalShow(product.variantId)}
                        >
                          <td>
                            <img alt={product.variantName} src={product.variantImage ? product.variantImage : product.productImage} />
                          </td>
                          <td className={styles.distributorRowTh}>
                            {product.vendor}
                          </td>
                          <td>{product.variantName}</td>
                          <td>{product.quantity < 1 ? <p className={styles.availabilityText}>Ej Tillgänglig</p> : "Tillgänglig"}</td>
                          <td>{product.quantity} ST</td>
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