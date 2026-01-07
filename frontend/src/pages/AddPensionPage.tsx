import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pensionApi } from '../api/pensions';
import { PensionType, ContributionType } from '../types/pension';
import Layout from '../components/common/Layout';

const AddPensionPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    type: 'SIPP' as PensionType,
    contribution_type: 'manual' as ContributionType,
    monthly_amount: '',
    day_of_month: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data: any = {
        name: formData.name,
        type: formData.type,
        contribution_type: formData.contribution_type,
      };

      if (formData.contribution_type === 'regular_fixed') {
        if (!formData.monthly_amount || !formData.day_of_month) {
          setError('Monthly amount and day of month are required for regular fixed contributions');
          setLoading(false);
          return;
        }
        data.monthly_amount = parseFloat(formData.monthly_amount);
        data.day_of_month = parseInt(formData.day_of_month);
      }

      await pensionApi.create(data);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create pension');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={styles.container}>
        <h1 style={styles.title}>Add New Pension</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="name" style={styles.label}>
              Pension Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="type" style={styles.label}>
              Pension Type *
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as PensionType })}
              style={styles.select}
            >
              <option value="SIPP">SIPP</option>
              <option value="managed">Managed</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="contribution_type" style={styles.label}>
              Contribution Type *
            </label>
            <select
              id="contribution_type"
              value={formData.contribution_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  contribution_type: e.target.value as ContributionType,
                })
              }
              style={styles.select}
            >
              <option value="manual">Manual</option>
              <option value="regular_fixed">Regular Fixed</option>
            </select>
          </div>

          {formData.contribution_type === 'regular_fixed' && (
            <>
              <div style={styles.formGroup}>
                <label htmlFor="monthly_amount" style={styles.label}>
                  Monthly Amount (£) *
                </label>
                <input
                  id="monthly_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.monthly_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, monthly_amount: e.target.value })
                  }
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="day_of_month" style={styles.label}>
                  Day of Month (1-31) *
                </label>
                <input
                  id="day_of_month"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.day_of_month}
                  onChange={(e) =>
                    setFormData({ ...formData, day_of_month: e.target.value })
                  }
                  style={styles.input}
                  required
                />
              </div>
            </>
          )}

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.buttonGroup}>
            <button type="submit" disabled={loading} style={styles.submitButton}>
              {loading ? 'Creating...' : 'Create Pension'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  title: {
    marginBottom: '2rem',
    color: '#333',
  },
  form: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#495057',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
  },
  submitButton: {
    flex: 1,
    padding: '0.75rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  cancelButton: {
    flex: 1,
    padding: '0.75rem',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  error: {
    color: '#dc3545',
    marginTop: '1rem',
    padding: '0.75rem',
    backgroundColor: '#f8d7da',
    borderRadius: '4px',
  },
};

export default AddPensionPage;
