import styles from "./transactionsPage.module.css";
import HeaderComponent from "../components/headerComponent";
import TransactionsComponent from "../components/transactionsComponent";


const TransactionsPage = () => {

    return (
        <div className={styles.mainContainer}>
            <HeaderComponent />

            <div className={styles.innerContainer}>
                <TransactionsComponent />
            </div>
        </div>
    );
}


export default TransactionsPage;