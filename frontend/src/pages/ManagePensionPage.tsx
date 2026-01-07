import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { pensionApi } from "../api/pensions";
import { contributionApi } from "../api/contributions";
import { holdingApi } from "../api/holdings";
import type { Pension, Contribution, Holding } from "../types/pension";
import Layout from "../components/common/Layout";

const ManagePensionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pension, setPension] = useState<Pension | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form states
  const [newContribution, setNewContribution] = useState({
    amount: "",
    date: "",
  });
  const [newHolding, setNewHolding] = useState({ ticker: "", shares: "" });

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const pensionData = await pensionApi.getById(parseInt(id!));
      setPension(pensionData);

      const contribData = await contributionApi.getByPensionId(parseInt(id!));
      setContributions(contribData);

      if (pensionData.type === "SIPP") {
        const holdingsData = await holdingApi.getByPensionId(parseInt(id!));
        setHoldings(holdingsData);
      }
    } catch (err) {
      console.error("Error fetching pension data:", err);
      setError("Failed to load pension data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePension = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this pension? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await pensionApi.delete(parseInt(id!));
      navigate("/");
    } catch (err) {
      console.error("Error deleting pension:", err);
      setError("Failed to delete pension");
    }
  };

  const handleAddContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await contributionApi.create(parseInt(id!), {
        amount: parseFloat(newContribution.amount),
        contribution_date: newContribution.date,
      });
      setNewContribution({ amount: "", date: "" });
      fetchData();
    } catch (err) {
      console.error("Error adding contribution:", err);
      setError("Failed to add contribution");
    }
  };

  const handleDeleteContribution = async (contribId: number) => {
    if (!confirm("Delete this contribution?")) return;
    try {
      await contributionApi.delete(contribId);
      fetchData();
    } catch (err) {
      console.error("Error deleting contribution:", err);
      setError("Failed to delete contribution");
    }
  };

  const handleAddHolding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await holdingApi.create(parseInt(id!), {
        ticker: newHolding.ticker.toUpperCase(),
        shares: parseFloat(newHolding.shares),
      });
      setNewHolding({ ticker: "", shares: "" });
      fetchData();
    } catch (err) {
      console.error("Error adding holding:", err);
      setError(
        (err as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to add holding"
      );
    }
  };

  const handleDeleteHolding = async (holdingId: number) => {
    if (!confirm("Delete this holding?")) return;
    try {
      await holdingApi.delete(holdingId);
      fetchData();
    } catch (err) {
      console.error("Error deleting holding:", err);
      setError("Failed to delete holding");
    }
  };

  if (loading)
    return (
      <Layout>
        <div style={styles.loading}>Loading...</div>
      </Layout>
    );
  if (!pension)
    return (
      <Layout>
        <div style={styles.error}>Pension not found</div>
      </Layout>
    );

  return (
    <Layout>
      <div style={styles.container}>
        <h1 style={styles.title}>Manage {pension.name}</h1>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Pension Details</h2>
          <div style={styles.details}>
            <p>
              <strong>Type:</strong> {pension.type}
            </p>
            <p>
              <strong>Contribution Type:</strong> {pension.contribution_type}
            </p>
            {pension.monthly_amount && (
              <p>
                <strong>Monthly Amount:</strong> £{pension.monthly_amount}
              </p>
            )}
            {pension.day_of_month && (
              <p>
                <strong>Day of Month:</strong> {pension.day_of_month}
              </p>
            )}
          </div>
          <button onClick={handleDeletePension} style={styles.deleteButton}>
            Delete Pension
          </button>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Contributions</h2>
          {pension.contribution_type === "manual" && (
            <form onSubmit={handleAddContribution} style={styles.form}>
              <input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={newContribution.amount}
                onChange={(e) =>
                  setNewContribution({
                    ...newContribution,
                    amount: e.target.value,
                  })
                }
                style={styles.input}
                required
              />
              <input
                type="date"
                placeholder="Date"
                title="Date"
                value={newContribution.date}
                onChange={(e) =>
                  setNewContribution({
                    ...newContribution,
                    date: e.target.value,
                  })
                }
                style={styles.input}
                required
              />
              <button type="submit" style={styles.addButton}>
                Add Contribution
              </button>
            </form>
          )}

          {contributions.length === 0 ? (
            <p style={styles.empty}>No contributions yet</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((contrib) => (
                  <tr key={contrib.id}>
                    <td style={styles.td}>
                      {new Date(contrib.contribution_date).toLocaleDateString()}
                    </td>
                    <td style={styles.td}>£{contrib.amount.toFixed(2)}</td>
                    <td style={styles.td}>
                      <button
                        onClick={() => handleDeleteContribution(contrib.id)}
                        style={styles.smallDeleteButton}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pension.type === "SIPP" && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Stock Holdings</h2>
            <form onSubmit={handleAddHolding} style={styles.form}>
              <input
                type="text"
                placeholder="Ticker (e.g., AAPL)"
                value={newHolding.ticker}
                onChange={(e) =>
                  setNewHolding({ ...newHolding, ticker: e.target.value })
                }
                style={styles.input}
                required
              />
              <input
                type="number"
                step="0.0001"
                placeholder="Shares"
                value={newHolding.shares}
                onChange={(e) =>
                  setNewHolding({ ...newHolding, shares: e.target.value })
                }
                style={styles.input}
                required
              />
              <button type="submit" style={styles.addButton}>
                Add Holding
              </button>
            </form>

            {holdings.length === 0 ? (
              <p style={styles.empty}>No holdings yet</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Ticker</th>
                    <th style={styles.th}>Shares</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((holding) => (
                    <tr key={holding.id}>
                      <td style={styles.td}>{holding.ticker}</td>
                      <td style={styles.td}>{holding.shares.toFixed(4)}</td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleDeleteHolding(holding.id)}
                          style={styles.smallDeleteButton}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        <button onClick={() => navigate("/")} style={styles.backButton}>
          Back to Dashboard
        </button>
      </div>
    </Layout>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  title: {
    marginBottom: "2rem",
    color: "#333",
  },
  section: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    marginBottom: "1.5rem",
  },
  sectionTitle: {
    fontSize: "1.25rem",
    marginBottom: "1rem",
    color: "#495057",
  },
  details: {
    marginBottom: "1rem",
  },
  form: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  input: {
    flex: 1,
    padding: "0.5rem",
    border: "1px solid #ced4da",
    borderRadius: "4px",
  },
  addButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "0.75rem",
    borderBottom: "2px solid #dee2e6",
    color: "#495057",
  },
  td: {
    padding: "0.75rem",
    borderBottom: "1px solid #dee2e6",
  },
  smallDeleteButton: {
    padding: "0.25rem 0.75rem",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.875rem",
  },
  deleteButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  backButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  loading: {
    textAlign: "center",
    padding: "3rem",
  },
  error: {
    color: "#dc3545",
    padding: "1rem",
    backgroundColor: "#f8d7da",
    borderRadius: "4px",
    marginBottom: "1rem",
  },
  empty: {
    color: "#6c757d",
    fontStyle: "italic",
  },
};

export default ManagePensionPage;
