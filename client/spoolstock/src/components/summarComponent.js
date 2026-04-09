import React, { useEffect, useMemo, useState } from "react";
import styles from "./summarComponent.module.css";
import { TbPackage, TbCurrencyDollar, TbHandStop, TbChartAreaLine } from "react-icons/tb";
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";

const SummaryComponent = ({ reloadTrigger, customerId }) => {
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = async () => {
    try {
      let companyId = "";

      if (customerId) {
        companyId = customerId;
      } else {
        companyId = localStorage.getItem("CID");
      }

      const response = await fetch(
        `https://api-najddsqtfa-uc.a.run.app/company/${companyId}/transactions`
      );
      if (!response.ok) return;
      const data = await response.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log("Fetch transactions failed:", e.message);
      setTransactions([]);
    }
  };

  // 1) Fetch en gång vid mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [reloadTrigger]);

  // Hjälpfunktioner
  const toMonthKey = (dateObj) => `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;

  const calcGrowthPct = (current, previous) => {
    if (!previous || previous === 0) return null; // undvik division med 0
    return ((current - previous) / previous) * 100;
  };

  const formatPct = (pct) => {
    if (pct === null || Number.isNaN(pct)) return "—";
    const rounded = Math.round(pct);
    return `${rounded}%`;
  };

  // 2) Räkna ut summary + growth, baserat på transactions
  const summary = useMemo(() => {
    const now = new Date();
    const currentMonthKey = toMonthKey(now);

    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthKey = toMonthKey(prevMonth);

    // Summeringar per månad (endast withdrawals)
    const perMonth = new Map(); // monthKey -> { cost, weight, count }
    let weightSinceStart = 0;

    for (const t of transactions) {
      if (t?.type !== "withdrawal") continue;

      const seconds = t?.date?._seconds;
      if (!seconds) continue;

      const d = new Date(seconds * 1000);
      const key = toMonthKey(d);

      const quantity = parseFloat(t?.quantity ?? 0) || 0;
      const costPer = parseFloat(t?.productCost ?? 0) || 0;
      const weightPer = parseFloat(t?.productWeight ?? 0) || 0;

      const cost = costPer * quantity;
      const weight = weightPer * quantity;

      weightSinceStart += weight;

      const agg = perMonth.get(key) ?? { cost: 0, weight: 0, count: 0 };
      agg.cost += cost;
      agg.weight += weight;
      agg.count += 1; // antal withdrawals-transaktioner (inte antal produkter)
      perMonth.set(key, agg);
    }

    const cur = perMonth.get(currentMonthKey) ?? { cost: 0, weight: 0, count: 0 };
    const prev = perMonth.get(prevMonthKey) ?? { cost: 0, weight: 0, count: 0 };

    const costGrowth = calcGrowthPct(cur.cost, prev.cost);
    const weightGrowth = calcGrowthPct(cur.weight, prev.weight);
    const countGrowth = calcGrowthPct(cur.count, prev.count);

    return {
      turnoverMonthly: cur.cost,
      withdrawalWeight: cur.weight,
      withdrawalCount: cur.count,
      withdrawalWeightSinceStart: weightSinceStart,
      growth: {
        cost: costGrowth,
        weight: weightGrowth,
        count: countGrowth,
      },
    };
  }, [transactions]);

  const growthBadge = (pct) => {
    const isPositive = pct !== null && pct >= 0;
    const containerClass = isPositive
      ? styles.growthContainerPositive
      : styles.growthContainerNegative;

    return (
      <div className={containerClass}>
        {pct === null ? null : isPositive ? <FaArrowTrendUp /> : <FaArrowTrendDown />}
        <p>{formatPct(pct)}</p>
      </div>
    );
  };

  // formatering (valfritt)
  const formatNumber = (n) => Math.round(n).toLocaleString("sv-SE");

  return (
    <div className={styles.summaryContainer}>
      <div className={styles.rowContainer1}>
        <div className={styles.iconContainer}>
          <TbCurrencyDollar />
        </div>
        <h2>Månadskostnad</h2>
        <div className={styles.valueText}>
          <h1>{formatNumber(summary.turnoverMonthly)} SEK</h1>
          {growthBadge(summary.growth.cost)}
        </div>
      </div>

      <div className={styles.rowContainer2}>
        <div className={styles.iconContainer}>
          <TbPackage />
        </div>
        <h2>Månadsförbrukning</h2>
        <div className={styles.valueText}>
          <h1>{formatNumber(summary.withdrawalWeight)} KG</h1>
          {growthBadge(summary.growth.weight)}
        </div>
      </div>

      <div className={styles.rowContainer3}>
        <div className={styles.iconContainer}>
          <TbHandStop />
        </div>
        <h2>Antal uttag</h2>
        <div className={styles.valueText}>
          <h1>{formatNumber(summary.withdrawalCount)} ST</h1>
          {growthBadge(summary.growth.count)}
        </div>
      </div>

      <div className={styles.rowContainer4}>
        <div className={styles.iconContainer}>
          <TbChartAreaLine />
        </div>
        <h2>Förbrukat sen start</h2>
        <h1>{formatNumber(summary.withdrawalWeightSinceStart)} KG</h1>
      </div>
    </div>
  );
};

export default SummaryComponent;