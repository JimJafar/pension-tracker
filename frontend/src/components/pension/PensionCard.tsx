import React from "react";
import { useNavigate } from "react-router-dom";
import type { PensionWithTotals, HoldingWithPrice } from "../../types/pension";

interface PensionCardProps {
  pension: PensionWithTotals;
  holdings: HoldingWithPrice[];
}

const PensionCard: React.FC<PensionCardProps> = ({ pension, holdings }) => {
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  const handleManage = () => {
    navigate(`/manage-pension/${pension.id}`);
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h2 style={styles.title}>{pension.name}</h2>
        <div style={styles.badges}>
          <span style={styles.badge}>{pension.type}</span>
          <span style={styles.badge}>
            {pension.contribution_type === "regular_fixed"
              ? "Regular"
              : "Manual"}
          </span>
        </div>
      </div>

      <div style={styles.totals}>
        <div style={styles.totalItem}>
          <span style={styles.totalLabel}>Total Contributions:</span>
          <span style={styles.totalValue}>
            {formatCurrency(pension.total_contributions)}
          </span>
        </div>
        <div style={styles.totalItem}>
          <span style={styles.totalLabel}>Cash:</span>
          <span style={styles.totalValue}>
            {formatCurrency(pension.cash || 0)}
          </span>
        </div>
        <div style={styles.totalItem}>
          <span style={styles.totalLabel}>Current Value:</span>
          <span style={styles.totalValue}>
            {formatCurrency(pension.current_value)}
          </span>
        </div>
      </div>

      {pension.type === "SIPP" && holdings.length > 0 && (
        <div style={styles.holdings}>
          <h3 style={styles.holdingsTitle}>Holdings</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Ticker</th>
                <th style={styles.th}>Shares</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Value</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding) => (
                <tr key={holding.id}>
                  <td style={styles.td}>{holding.ticker}</td>
                  <td style={styles.td}>{holding.shares.toFixed(4)}</td>
                  <td style={styles.td}>
                    {holding.current_price
                      ? formatCurrency(holding.current_price)
                      : "Loading..."}
                  </td>
                  <td style={styles.td}>
                    {holding.total_value
                      ? formatCurrency(holding.total_value)
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button onClick={handleManage} style={styles.manageButton}>
        Manage Pension
      </button>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    marginBottom: "1.5rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  title: {
    margin: 0,
    fontSize: "1.5rem",
    color: "#333",
  },
  badges: {
    display: "flex",
    gap: "0.5rem",
  },
  badge: {
    padding: "0.25rem 0.75rem",
    backgroundColor: "#e9ecef",
    borderRadius: "12px",
    fontSize: "0.875rem",
    color: "#495057",
  },
  totals: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1rem",
    marginBottom: "1.5rem",
    padding: "1rem",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
  },
  totalItem: {
    display: "flex",
    flexDirection: "column",
  },
  totalLabel: {
    fontSize: "0.875rem",
    color: "#6c757d",
    marginBottom: "0.25rem",
  },
  totalValue: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    color: "#007bff",
  },
  holdings: {
    marginBottom: "1.5rem",
  },
  holdingsTitle: {
    fontSize: "1rem",
    marginBottom: "0.75rem",
    color: "#495057",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "0.5rem",
    borderBottom: "2px solid #dee2e6",
    color: "#495057",
    fontSize: "0.875rem",
  },
  td: {
    padding: "0.5rem",
    borderBottom: "1px solid #dee2e6",
    color: "#212529",
  },
  manageButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
  },
};

export default PensionCard;
