import React, { useEffect, useRef, useState } from "react";
import styles from "./stockComponent.module.css";
import WithdrawalComponent from "./withdrawalComponent";
import { PiHandWithdraw } from "react-icons/pi";
import { FaShoppingCart } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";

const StockComponent = () => {
  const [withdrwalPopup, setWithdrawalPopup] = useState(false);
  const [renderedPopup, setRenderedPopup] = useState(false); // what is actually shown
  const [animClass, setAnimClass] = useState(styles.enter);

  const [choosenProduct, setChoosenProduct] = useState();
  const [stock, setStock] = useState([]);

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

  const handleWithdrawal = (productId) => {
    setChoosenProduct(stock.filter(item => item.id === productId));
    setWithdrawalPopup(true); // triggers animated transition
  };

  const handleOnClose = () => {
    setWithdrawalPopup(false); // triggers animated transition back
  };

  useEffect(() => {
    const companyId = localStorage.getItem("CID");
    fetchStock(companyId);
    console.log(stock);
  }, []);

  // Animate when switching between list <-> preview
  useEffect(() => {
    // play exit
    setAnimClass(styles.exit);

    const exitMs = 220;
    const enterMs = 20; // next tick-ish

    const t1 = setTimeout(() => {
      // swap what's rendered after exit
      setRenderedPopup(withdrwalPopup);

      // start enter
      setAnimClass(styles.enter);
    }, exitMs);

    return () => clearTimeout(t1);
  }, [withdrwalPopup]);

    const handleRedirect = () => {
        window.location.href = choosenProduct[0]?.productOriginalUrl;
    }

  return (
    <div className={styles.stockContainer}>
      <div className={styles.stockInnerContainer}>
        <div className={styles.stage}>
          <div className={`${styles.view} ${animClass}`}>
            {renderedPopup ? (
              <div className={styles.productPreviewContainer}>
                <div className={styles.headerContainer}>
                  <div className={styles.leftHeaderContainer}>
                    <button onClick={handleOnClose} className={styles.backBtn}><IoIosArrowBack /></button>
                    <h1>{choosenProduct[0]?.productName}</h1>
                  </div>
                    <button className={styles.shopBtn} aria-label="Extra Beställning" onClick={handleRedirect}>
                    <FaShoppingCart />
                    </button>
                </div>

                <div className={styles.middleContainer}>
                  <img
                    alt=""
                    src={choosenProduct[0]?.productImageUrl}
                  />
                </div>
                <div className={styles.footerContainer}>

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
                          onClick={() => handleWithdrawal(stockItem.id)}
                        >
                          <td>
                            <img alt="" src={stockItem.productImageUrl} />
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