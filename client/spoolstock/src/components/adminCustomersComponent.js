import React, { useEffect, useState } from "react";
import styles from "./adminCustomersComponent.module.css";
import { FaPrint } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AdminCustomersComponent = () => {

    const [companyData, setCompanyData] = useState([]);

    const navigate = useNavigate();


    useEffect(() => {
        fetchCustomerData();
    }, [])


    const fetchCustomerData = async () => {
        try {
            const response = await fetch ("https://api-najddsqtfa-uc.a.run.app/company");

            const data = await response.json();

            setCompanyData(data);
        } catch (e) {
            console.error(e);
        }
    }


    const redirectToCustomerPage = (companyId) => {
        window.scrollTo({ top: 0, behavior: "instant" }); 
        navigate(`/company/${companyId}`);
    }


    return (
        <div className={styles.mainContainer}>
            <div className={styles.innerContainer}>
                <div className={styles.headerContainer}>
                    <h1>Kunder</h1>
                </div>
                <div className={styles.customersTableWrapper}>
                    <table>
                        <thead>
                            <tr className={styles.tableHeader}>
                                <th>ID</th>
                                <th>Företagsnamn</th>
                                <th>Kontaktperson</th>
                                <th>Telefon</th>
                                <th>Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {companyData?.map((company) => (
                                <tr onClick={() => redirectToCustomerPage(company.id)}>
                                    <td></td>
                                    <td>#{company.id}</td>
                                    <td>{company.companyName}</td>
                                    <td>{company.contactPerson}</td>
                                    <td>{company.phoneNumber}</td>
                                    <td>  <a href={`mailto:${company.email}`}>{company.email}</a></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>                    
                </div>
                
            </div>
        </div>
    );
}


export default AdminCustomersComponent;