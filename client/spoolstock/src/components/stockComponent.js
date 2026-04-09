import React, { useEffect, useState } from "react";
import styles from "./stockComponent.module.css";
import { FaShoppingCart, FaPrint } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { BounceLoader, ClipLoader } from "react-spinners";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import BrandLogo from "../assets/BlackLogo.png";

const StockComponent = ({ updateDashboard }) => {
  const auth = getAuth();
  const navigate = useNavigate();

  const [withdrwalPopup, setWithdrawalPopup] = useState(false);
  const [renderedPopup, setRenderedPopup] = useState(false);
  const [animClass, setAnimClass] = useState(styles.enter);
  const [loadingProductSpecification, setLoadingProductSpecification] = useState(false);

  const [choosenProduct, setChoosenProduct] = useState(null);
  const [stock, setStock] = useState([]);
  const [quantity, setQuantity] = useState("");
  const [variantData, setVariantData] = useState(null);
  const [errorText, setErrorText] = useState("");
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);

  const API_BASE = "https://api-najddsqtfa-uc.a.run.app";
  const SHOP = "brandit3d.myshopify.com";

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

  useEffect(() => {
    if (!choosenProduct) return;

    const fetchVariant = async () => {
      try {
        setLoadingProductSpecification(true);
        setErrorText("");
        setVariantData(null);
        setQuantity("");

        const companyId = localStorage.getItem("CID");
        const url = `${API_BASE}/company/${companyId}/article`;

        const response = await fetch(url, {
          headers: { "x-shopify-id": choosenProduct },
        });

        if (!response.ok) {
          throw new Error("Kunde inte hämta produktdata");
        }

        const data = await response.json();
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

      const response = await fetch(`${API_BASE}/company/${companyId}/stock`);
      if (!response.ok) throw new Error("Kunde inte hämta lager");

      const data = await response.json();
      setStock(data);
    } catch (e) {
      console.log("Fetch stock failed:", e.message);
      setErrorText(e.message);
    }
  };

  const handleWithdrawalShow = (productId) => {
    setErrorText("");
    setLoadingProductSpecification(true);
    setVariantData(null);
    setQuantity("");
    setChoosenProduct(productId);
    setWithdrawalPopup(true);
  };

  const handleRedirectProductCatalogue = () => {
    navigate("/catalogue");
  };

  const handleOnClose = () => {
    setWithdrawalPopup(false);
    setQuantity("");
    setVariantData(null);
    setChoosenProduct(null);
    setErrorText("");
  };

  const handleRedirect = (url) => {
    if (!url) return;
    window.location.href = url;
  };

  const handleRedirectDatasheet = () => {
    const datasheetPointer = variantData?.metafields?.nodes?.find(
      (m) => m.key === "datasheet"
    );

    if (datasheetPointer?.value) {
      window.location.href = datasheetPointer.value;
    }
  };

 const handleWithdrawal = async () => {
  if (isSubmittingWithdrawal) return;

  try {
    setIsSubmittingWithdrawal(true);

    const user = auth.currentUser;

    if (!user) {
      setErrorText("Du måste vara inloggad");
      return;
    }

    const parsedQuantity = parseInt(quantity, 10) || 0;
    const availableStock = variantData?.quantity ?? 0;

    if (availableStock <= 0) {
      setErrorText("Produkten är slut i lager");
      return;
    }

    if (parsedQuantity <= 0) {
      setErrorText("Ange ett giltigt antal");
      return;
    }

    if (parsedQuantity > availableStock) {
      setErrorText("Antalet överstiger lagersaldo");
      return;
    }

    const customerId = user.uid;
    const shopifyId = choosenProduct;
    const companyId = localStorage.getItem("CID");

    const response = await fetch(`${API_BASE}/company/stock`, {
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

    if (!response.ok) {
      throw new Error("Kunde inte genomföra uttag");
    }

    const data = await response.json();
    console.log(data);

    await fetchStock();
    updateDashboard?.();

    setQuantity("");
    setVariantData(null);
    setChoosenProduct(null);
    setErrorText("");
    setWithdrawalPopup(false);
  } catch (e) {
    console.log(e);
    setErrorText(e?.message || "Något gick fel vid uttag");
  } finally {
    setIsSubmittingWithdrawal(false);
  }
};

  const handleExportPdf = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    const img = new Image();
    img.src = BrandLogo;

    const now = new Date();
    const formattedDate = now.toLocaleDateString("sv-SE");

    const tableRows = stock.map((product) => [
      product.vendor,
      product.variantName,
      `${Math.round(product.price - product.price * (product.discount / 100))} SEK`,
      `${product.discount} %`,
      `${product.quantity} ST`,
      `${product.wantedStock} ST`,
      product.quantity < 1 ? "Ej i lager" : "I lager",
    ]);

    const renderPdf = () => {
      doc.setFontSize(16);
      doc.text("Lagersaldon", 14, 35);

      doc.setFontSize(10);
      doc.text(`Exportdatum: ${formattedDate}`, pageWidth - 14, 35, { align: "right" });

      autoTable(doc, {
        startY: 45,
        head: [[
          "Leverantör",
          "Beskrivning",
          "Pris",
          "Rabatt",
          "Antal",
          "Önskat antal",
          "Status",
        ]],
        body: tableRows,
        styles: {
          fontSize: 8,
          cellPadding: 4,
          minCellHeight: 12,
          valign: "middle",
          lineColor: [200, 200, 200],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [0, 0, 0],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240],
        },
        columnStyles: {
          2: { halign: "right" },
          3: { halign: "right" },
          4: { halign: "center" },
          5: { halign: "center" },
          6: { halign: "center" },
        },
      });

      window.open(doc.output("bloburl"));
    };

    img.onload = () => {
      const imgWidth = 50;
      const imgHeight = (img.height * imgWidth) / img.width;
      doc.addImage(img, "PNG", 14, 10, imgWidth, imgHeight);
      renderPdf();
    };

    img.onerror = () => {
      renderPdf();
    };
  };

  const maxStock = variantData?.quantity ?? 0;

  return (
    <div className={styles.stockContainer}>
      <div className={styles.stockInnerContainer}>
        <div className={styles.stage}>
          <div className={`${styles.view} ${animClass}`}>
            {renderedPopup ? (
              <div className={styles.productPreviewContainer}>
                <div className={styles.previewHeader}>
                  <div className={styles.headerLeftContainer}>
                    <button onClick={handleOnClose} className={styles.backBtn}>
                      <IoIosArrowBack />
                    </button>
                    <h1>
                      {loadingProductSpecification
                        ? "Laddar produkt..."
                        : `${variantData?.productName || ""} ${
                            variantData?.variantTitle !== "Default Title"
                              ? variantData?.variantTitle || ""
                              : ""
                          }`}
                    </h1>
                  </div>

                  <button
                    className={styles.shopBtn}
                    aria-label="Extra Beställning"
                    onClick={() => handleRedirect(variantData?.variantUrl)}
                    disabled={!variantData?.variantUrl}
                  >
                    <FaShoppingCart />
                  </button>
                </div>

                <div className={styles.previewContent}>
                  <div className={styles.middleContainer}>
                    <div className={styles.imageContainer}>
                      {!loadingProductSpecification ? (
                        <img
                          alt={variantData?.productName || "Produktbild"}
                          src={variantData?.imageUrl || variantData?.featuredImage}
                        />
                      ) : (
                        <div className={styles.loadingImageContainer}>
                          <BounceLoader size={60} color="#d3d3d3" />
                        </div>
                      )}

                      <h2>Gör uttag</h2>

                      <div className={styles.withdrawalContainer}>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="Skriv in antal"
                          value={quantity}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, "");

                            if (raw === "") {
                              setQuantity("");
                              setErrorText("");
                              return;
                            }

                            const parsed = parseInt(raw, 10);
                            const clamped = Math.min(maxStock, Math.max(0, parsed));

                            setQuantity(String(clamped));
                            setErrorText("");
                          }}
                          disabled={loadingProductSpecification || maxStock <= 0}
                        />

                          <button
                            className={styles.withdrawalBtn}
                            onClick={handleWithdrawal}
                            disabled={loadingProductSpecification || maxStock <= 0 || isSubmittingWithdrawal}
                          >
                          Gör uttag
                        </button>
                      </div>

                      <p className={styles.stockText}>
                        Antal tillgängliga:{" "}
                        {!loadingProductSpecification ? (
                          `${maxStock} ST`
                        ) : (
                          <ClipLoader size={10} color="#d3d3d3" />
                        )}
                      </p>

                      {errorText && <p className={styles.errorText}>{errorText}</p>}
                    </div>

                    {!loadingProductSpecification ? (
                      <div className={styles.previewText}>
                        <h1>Beskrivning</h1>
                        <p className={styles.variantDescription}>
                          {variantData?.productDescription}
                        </p>
                        <br />

                        <h1>Specifikationer</h1>

                        {variantData?.metafields?.nodes?.map((metafield) => {
                          if (
                            metafield.key !== "datasheet" &&
                            metafield.key !== "weight" &&
                            metafield.key !== "max_temperatur" &&
                            metafield.value
                          ) {
                            return (
                              <div
                                key={metafield.id || metafield.key}
                                className={styles.productSpecificationContainer}
                              >
                                <p className={styles.metafieldDescription}>
                                  {metafield.definition?.description}
                                </p>
                                <p className={styles.metafieldValue}>{metafield.value}</p>
                              </div>
                            );
                          }

                          return null;
                        })}

                        <br />

                        <h1 className={styles.datasheetTitle}>Produktdatablad</h1>
                        <p className={styles.datasheetText}>
                          Ta del av produktens fullständiga datablad.
                        </p>
                        <button
                          className={styles.downloadDataSheetButton}
                          onClick={handleRedirectDatasheet}
                        >
                          <p>Ladda ner datablad</p>
                        </button>
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

                  <button
                    className={styles.shopBtn}
                    aria-label="Skriv ut"
                    onClick={handleExportPdf}
                  >
                    <FaPrint />
                  </button>
                </div>

                <div className={styles.stockTableWrapper}>
                  <table>
                    <thead>
                      <tr className={styles.tableHeader}>
                        <th className={styles.distributorRowTh}>Leverantör</th>
                        <th>Beskrivning</th>
                        <th>Pris</th>
                        <th>Rabatt</th>
                        <th>Antal</th>
                        <th></th>
                      </tr>
                    </thead>

                    <tbody>
                      {stock?.map((product) => (
                        <tr
                          key={product.variantId}
                          onClick={() => handleWithdrawalShow(product.variantId)}
                        >
                          <td>
                            <img
                              alt={product.variantName}
                              src={product.variantImage || product.productImage}
                            />
                          </td>
                          <td className={styles.distributorRowTh}>{product.vendor}</td>
                          <td>{product.variantName}</td>
                          <td>
                            {Math.round(
                              product.price - product.price * (product.discount / 100)
                            )}{" "}
                            SEK
                          </td>
                          <td>{product.discount} %</td>
                          <td>{product.quantity} ST</td>
                          <td>
                            <div
                              className={
                                product.quantity < 1
                                  ? styles.availabilyIndicator
                                  : styles.availabilyIndicatorAvailable
                              }
                            ></div>
                          </td>
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