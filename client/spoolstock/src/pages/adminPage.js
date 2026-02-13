import React, { useEffect, useState } from "react";
import styles from "./adminPage.module.css";

const AdminPage = () => {

    const [productName, setProductName] = useState("");
    const [productDescription, setProductDescription] = useState("");
    const [productImageUrl, setProductImageUrl] = useState("");
    const [productCost, setProductCost] = useState(0);
    const [productDistributor, setProductDistributor] = useState("");
    const [productOriginalUrl, setProductOriginalUrl] = useState("");
    const [productWeight, setProductWeight] = useState(0);

    const [companyName, setCompanyName] = useState("");

    const [products, setProducts] = useState([]);
    const [companies, setCompanies] = useState([]);

    const [quantity, setQuantity] = useState(0);

    const [selectedCompany, setSelectedCompany] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            fetchProducts();
            fetchCompanies();
        }

        fetchData();
    }, []);


    const fetchProducts = async () => {
        try {
            const response = await fetch("https://api-najddsqtfa-uc.a.run.app/product");

            const data = await response.json();
           
            setProducts(data);
        } catch (e) {
            console.log(e.message);
        }
    }

    const fetchCompanies = async () => {
        try {
            const response = await fetch("https://api-najddsqtfa-uc.a.run.app/company");

            const data = await response.json();

            setCompanies(Array.isArray(data) ? data : data.companies || []);
        } catch (e) {
            console.log(e.message);
        }
    }


    const depositeMaterial = async (productId) => {
        try {
            const jsonObj = {
                productId,
                quantity
            }

            const response = await fetch(`https://api-najddsqtfa-uc.a.run.app/company/${selectedCompany}/transactions/deposite`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(jsonObj)
            });

            const data = await response.json();

            console.log(data);
        
        } catch (e) {
            console.log(e.message);
        }
    }
    

    const handleAddProduct = async (e) => {
        e.preventDefault();

        const jsonObj = {
            productName,
            productDescription,
            productImageUrl,
            productCost,
            productDistributor,
            productOriginalUrl,
            productWeight
        }

        try {
            const response = await fetch("https://api-najddsqtfa-uc.a.run.app/product", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(jsonObj)
            })

            const data = await response.json();
            
            console.log(data);
        } catch (e) {
            console.log(e.message);
        }
    }


    const handleAddCompany = async (e) => {
        e.preventDefault();

        const jsonObj = {
            companyName
        }

        try {
            const response = await fetch("https://api-najddsqtfa-uc.a.run.app/company", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(jsonObj)
            })

            const data = await response.json();
            
            console.log(data);
        } catch (e) {
            console.log(e.message);
        }
    }


    return (
        <div>
            <h1>Lägg till produkt</h1>
            <form onSubmit={(e) => handleAddProduct(e)}>
                <label>Produktnamn</label>
                <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)}></input>

                <label>Produktbeskrivning</label>
                <input type="text" value={productDescription} onChange={(e) => setProductDescription(e.target.value)}></input>

                <label>Bild URL (https://brandit3d/...)</label>
                <input type="text" value={productImageUrl} onChange={(e) => setProductImageUrl(e.target.value)}></input>

                <label>Kostnad (kr)</label>
                <input type="number" value={productCost} onChange={(e) => setProductCost(e.target.value)}></input>

                <label>Leverantör</label>
                <input type="text" value={productDistributor} onChange={(e) => setProductDistributor(e.target.value)}></input>

                <label>Orginal URL (https://brandit3d/...)</label>
                <input type="text" value={productOriginalUrl} onChange={(e) => setProductOriginalUrl(e.target.value)}></input>

                <label>Vikt (kg)</label>
                <input type="number" value={productWeight} onChange={(e) => setProductWeight(e.target.value)}></input>

                <button type="submit">Lägg till</button>

            </form>

            <h1>Lägg till företag</h1>
            <form onSubmit={(e) => handleAddCompany(e)}>
                <label>Företagsnamn</label>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}></input>

                <button type="submit">Lägg till</button>
            </form>

            <h1>Företag</h1>
            <ul>
                {companies?.map(company => {
                    if (selectedCompany == company.id) {
                        return (
                        
                        <>
                            <li>{company.companyName} *Vald*</li>
                            <button onClick={() => setSelectedCompany(company.id)}>Välj</button>
                        </>
                        )
                    }
                    return (
                        <>
                            <li>{company.companyName}</li>
                            <button onClick={() => setSelectedCompany(company.id)}>Välj</button>
                        </>
                    );
                })}
            </ul>

            <h1>Produkter</h1>
            <label>Antal</label>
            <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)}></input>

            <ul>
                {products?.map(product => {
                    return (
                        <>
                            <li>{product.productName}</li>
                            <button onClick={() => depositeMaterial(product.id)}>Sätt in</button>
                        </>
                    );
                })}
            </ul>
        </div>
    );
}


export default AdminPage;