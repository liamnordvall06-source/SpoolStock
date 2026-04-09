import React, { useState, useEffect } from "react";
import styles from "./adminStockComponent.module.css";
import { FaPrint } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import ProductCatalogueComponent from "./productCatalogueComponent";
import BrandLogo from "../assets/BlackLogo.png"
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


const AdminStockComponent = ({ customerId }) => {

    const API_BASE = "https://api-najddsqtfa-uc.a.run.app";

    const [stock, setStock] = useState([]);
    const [stockDepositePopup, setStockDepositePopup] = useState(false);
    const [stockValue, setStockValue] = useState(0);
    const [productCatalogue, setProductCatalogue] = useState([]);
    const [customerData, setCustomerData] = useState({});


    const fetchStock = async () => {
        try {
            
        let companyId = "";

        if (customerId) {
            companyId = customerId;
        } else {
            companyId = localStorage.getItem("CID");
        }

        const response = await fetch(`${API_BASE}/company/${companyId}/stock`);

        if (!response.ok) throw new Error("Kunde inte hämta lager");

        const data = await response.json();

        let stockCount = 0;

        for (let i = 0; i < data.length; i++) {
            stockCount += parseFloat(data[i].price) * parseFloat(data[i].quantity)
        }

        setStockValue(stockCount)


        setStock(data);
        } catch (e) {
        console.log("Fetch stock failed:", e.message);
        }
    };


    const fetchCustomer = async () => {
        try {
            let companyId = "";

            if (customerId) {
                companyId = customerId;
            } else {
                companyId = localStorage.getItem("CID");
            }

            const response = await fetch(`${API_BASE}/company/${companyId}`);

            const data = await response.json();

            setCustomerData(data);
            
            if (!response.ok) throw new Error("Kunde inte hämta lager");
        } catch (e) {
            console.log(e);
        }
    }

    const handleDeposite = async () => {
        setStockDepositePopup(true);
    }

    const onClose = async () => {
        setStockDepositePopup(false);
        await fetchStock();
    };

    useEffect(() => {
        const fetchData = async () => {
            await fetchCustomer();
            await fetchStock();
        }

        fetchData();

    }, []);



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
      doc.text(`Lagervärde: ${stockValue} SEK`, pageWidth - 14, 35, { align: "right" });
      doc.text(`Exportdatum: ${formattedDate}`, pageWidth - 14, 30, { align: "right" });
      doc.text(`Ägare: ${customerData.companyName}`, pageWidth - 14, 40, { align: "right" });

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

    
    return (
        <div>
        {!stockDepositePopup ? (
        <div className={styles.mainContainer}>
                <div className={styles.innerContainer}>
                                <div className={styles.headerContainer}>
                                    <div>
                                        <h1>Lagersaldon</h1>
                                        <p className={styles.stockValueText}>Lagervärde: {stockValue} SEK</p>
                                    </div>
                                    <div className={styles.buttonContainer}>
                                        <button
                                            className={styles.depositeBtn}
                                            aria-label="Skapa transaktion"
                                            onClick={handleDeposite}
                                        >
                                            <IoMdAdd />
                                        </button>  
                                        <button
                                            className={styles.shopBtn}
                                            aria-label="Skriv ut"
                                            onClick={handleExportPdf}
                                        >
                                            <FaPrint />
                                        </button>                      
                                    </div>
                
                                </div>
                                <div className={styles.stockTableWrapper}>
                                    <table>
                                        <thead>
                                        <tr className={styles.tableHeader}>             
                                            <th className={styles.distributorRowTh}>Leverantör</th>
                                            <th>Beskrivning</th>
                                            <th>Inköpspris</th>
                                            <th>Försäljningspris</th>
                                            <th>Marginal</th>
                                            <th>Antal</th>
                                            <th></th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                            {stock?.map((product) => (
                                                <tr
                                                key={product.variantId}
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
                                                    {Math.round(product.purchasePrice)} SEK
                                                </td>
                                                <td>
                                                    {Math.round(
                                                    product.price - product.price * (product.discount / 100)
                                                    )}{" "}
                                                    SEK
                                                </td>
                                                <td>
                                                    {Math.round(product.price - product.purchasePrice)} SEK / {Math.round(((product.price - product.purchasePrice) / product.price) * 100)} % 
                                                </td>
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
                            </div>
                                    </div>

            ) : (
                <div className={styles.catalogueTableWrapper}>
                    <ProductCatalogueComponent onClose={onClose} adminId={customerId} />
                </div>
            )}
            </div>
    );
}


export default AdminStockComponent;