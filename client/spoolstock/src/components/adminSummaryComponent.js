import React from "react";
import styles from "./adminSummaryComponent.module.css";
import { BiCart } from "react-icons/bi";
import { TbCashRegister, TbClockDollar, TbCurrencyDollar, TbCurrencyKroneSwedish, TbHandGrab, TbShoppingCart } from "react-icons/tb";
import { FaShoppingCart } from "react-icons/fa";

const AdminSummaryComponent = () => {
    return (
        <div className={styles.mainContainer}>
            <ul className={styles.listContainer}>
                <li className={styles.rowContainer}>
                    <div className={styles.iconContainer}>
                        <TbCashRegister />
                    </div>
                    <h2>Försäljning Mars</h2>
                    <h1>0 SEK</h1>
                </li>
                <li className={styles.rowContainer}>
                    <div className={styles.iconContainer}>
                      <TbShoppingCart />
                    </div>
                    <h2>Förbruknings Mars</h2>
                    <h1>0 KG</h1>
                </li>
                <li className={styles.rowContainer}>
                    <div className={styles.iconContainer}>
                        <TbHandGrab />
                    </div>
                    <h2>Vinst Mars</h2>
                    <h1>0 SEK</h1>
                </li>
                <li>
                    <div className={styles.iconContainer}>
                      <TbClockDollar />
                    </div>
                    <h2>Förbrukat sen start</h2>
                    <h1>0 KG</h1>
                </li>
            </ul>
        </div>
    );
}


export default AdminSummaryComponent