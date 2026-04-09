import React, { useState, useEffect, useMemo } from "react";
import styles from "./adminAnalyticsComponent.module.css";
import {
  AreaChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  ReferenceDot,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  const value = payload[0].value ?? 0;

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{label}</div>
      <div className={styles.tooltipValue}>
        <span className={styles.tooltipNumber}>
          {value.toLocaleString("sv-SE")}
        </span>
        <span className={styles.tooltipUnit}> kg</span>
      </div>
      <div className={styles.tooltipHint}>Uttag denna månad</div>
    </div>
  );
};

const PulsingDot = ({ cx, cy }) => {
  if (cx == null || cy == null) return null;

  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill="#4294FF" opacity="0.25">
        <animate
          attributeName="r"
          from="6"
          to="18"
          dur="1.6s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          from="0.4"
          to="0"
          dur="1.6s"
          repeatCount="indefinite"
        />
      </circle>

      <circle cx={cx} cy={cy} r={6} fill="#fff" stroke="#4294FF" strokeWidth="2" />
    </g>
  );
};

const AdminAnalyticsComponent = () => {
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(
        "https://api-najddsqtfa-uc.a.run.app/transactions"
      );

      if (!response.ok) {
        console.log("Failed to fetch transactions");
        return;
      }

      const data = await response.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log("Fetch transactions failed:", e.message);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const chartData = useMemo(() => {
    const withdrawals = transactions.filter((t) => t.type === "withdrawal");

    if (withdrawals.length === 0) return [];

    const transactionDates = withdrawals
      .map((item) => {
        if (item?.date?._seconds) return new Date(item.date._seconds * 1000);
        if (item?.date) return new Date(item.date);
        return null;
      })
      .filter((d) => d instanceof Date && !Number.isNaN(d.getTime()));

    if (transactionDates.length === 0) return [];

    const oldestDate = new Date(Math.min(...transactionDates));
    const newestDate = new Date(Math.max(...transactionDates));

    const months = [];
    let tempDate = new Date(oldestDate.getFullYear(), oldestDate.getMonth(), 1);

    while (tempDate <= newestDate) {
      months.push({
        year: tempDate.getFullYear(),
        month: tempDate.getMonth(),
        weight: 0,
      });
      tempDate.setMonth(tempDate.getMonth() + 1);
    }

    withdrawals.forEach((item) => {
      let itemDate = null;

      if (item?.date?._seconds) {
        itemDate = new Date(item.date._seconds * 1000);
      } else if (item?.date) {
        itemDate = new Date(item.date);
      }

      if (!itemDate || Number.isNaN(itemDate.getTime())) return;

      const monthIndex = months.findIndex(
        (m) =>
          m.year === itemDate.getFullYear() &&
          m.month === itemDate.getMonth()
      );

      if (monthIndex !== -1) {
        const w = parseFloat(item.productWeight) || 0;
        const q = parseInt(item.quantity, 10) || 0;
        months[monthIndex].weight += w * q;
      }
    });

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    return months.map((m) => ({
      name: `${monthNames[m.month]} ${m.year}`,
      weight: m.weight,
    }));
  }, [transactions]);

  const { peakPoint, lastPoint, totalWeight } = useMemo(() => {
    if (!chartData.length) {
      return {
        peakPoint: null,
        lastPoint: null,
        totalWeight: 0,
      };
    }

    let peak = chartData[0];
    let total = 0;

    for (const p of chartData) {
      if ((p.weight ?? 0) > (peak.weight ?? 0)) peak = p;
      total += p.weight ?? 0;
    }

    const last = chartData[chartData.length - 1];

    return {
      peakPoint: peak,
      lastPoint: last,
      totalWeight: total,
    };
  }, [chartData]);

  const bestPeriodText = useMemo(() => {
    if (!peakPoint) return "Ingen data ännu";
    return `Bästa period: ${peakPoint.name} • ${peakPoint.weight.toLocaleString("sv-SE")} kg`;
  }, [peakPoint]);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.innerContainer}>
        <div className={styles.headerContainer}>
          <div>
            <h1>Analys</h1>

            <p className={styles.subtitle}>
              {chartData.length
                ? "Här är utvecklingen för alla transaktioner i systemet"
                : "Vi samlar in data… snart visas analysen här."}
            </p>

            {chartData.length > 0 && (
              <div className={styles.insightsRow}>
                <div className={styles.insight}>
                  <span className={styles.insightLabel}>Senaste</span>
                  <span className={styles.insightValue}>
                    {lastPoint?.weight?.toLocaleString("sv-SE")}{" "}
                    <span className={styles.insightUnit}>kg</span>
                  </span>
                </div>

                <div className={styles.insightDivider} />

                <div className={styles.insight}>
                  <span className={styles.insightLabel}>Bästa månad</span>
                  <span className={styles.insightValue}>
                    {peakPoint?.name}
                  </span>
                </div>

                <div className={styles.insightDivider} />

                <div className={styles.insight}>
                  <span className={styles.insightLabel}>Totalt</span>
                  <span className={styles.insightValue}>
                    {totalWeight.toLocaleString("sv-SE")}{" "}
                    <span className={styles.insightUnit}>kg</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className={styles.chip} title={bestPeriodText}>
            <span className={styles.chipDot} />
            <span className={styles.chipText}>{bestPeriodText}</span>
          </div>
        </div>

        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={600}>
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 5, bottom: 5 }}
            >
              <defs>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(59, 130, 246, 0.28)" />
                  <stop offset="60%" stopColor="rgba(59, 130, 246, 0.10)" />
                  <stop offset="100%" stopColor="rgba(59, 130, 246, 0.02)" />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
                label={{
                  value: "kg",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#6B7280",
                }}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="weight"
                stroke="rgba(59, 130, 246, 0.85)"
                strokeWidth={2.5}
                fill="url(#areaFill)"
                dot={false}
                activeDot={{ r: 6 }}
              />

              {peakPoint && (
                <ReferenceDot
                  x={peakPoint.name}
                  y={peakPoint.weight}
                  r={6}
                  isFront
                  shape={<PulsingDot />}
                />
              )}

              {lastPoint && (
                <ReferenceDot
                  x={lastPoint.name}
                  y={lastPoint.weight}
                  r={5}
                  fill="#4294FF"
                  stroke="#ffffff"
                  strokeWidth={2}
                  isFront
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsComponent;