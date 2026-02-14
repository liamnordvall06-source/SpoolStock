import React, { useEffect } from "react";
import styles from "./withdrawalPage.module.css";
import HeaderComponent from "../components/headerComponent";
import WithdrawalComponent from "../components/withdrawalComponent";
import { useNavigate, useParams } from "react-router-dom";


const WithdrawalPage = () => {

    const { productId } = useParams();
    const navigate = useNavigate();
    

    const handleOnClose = () => {
        navigate("/");
    }
    

    return (
        <div className={styles.mainContainer}>
            <HeaderComponent />
            {productId && <WithdrawalComponent productId={productId} onClose={() => handleOnClose()}/>}
        </div>
    );
}


export default WithdrawalPage;