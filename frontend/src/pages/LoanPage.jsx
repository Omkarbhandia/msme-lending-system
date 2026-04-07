import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { createApplication } from '../api/client';

const LoanPage = ({ profile, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const loanAmount = watch('loanAmount') || 0;
  const tenureMonths = watch('tenureMonths') || 1;
  const emi = tenureMonths > 0 ? Math.round(Number(loanAmount) / Number(tenureMonths)) : 0;

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');
    try {
      const result = await createApplication({
        profileId: profile.id,
        loanAmount: Number(data.loanAmount),
        tenureMonths: Number(data.tenureMonths),
        loanPurpose: data.loanPurpose,
      });
      onComplete(result.data.applicationId);
    } catch (err) {
      setApiError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card"
    >
      <div className="form-section">
        <h2 className="form-title">Loan Application</h2>
        <p className="form-subtitle">
          Applying as <strong style={{ color: 'var(--text-primary)' }}>{profile.name}</strong> ·{' '}
          {profile.businessType}
        </p>

        {/* Live EMI preview */}
        {loanAmount > 0 && tenureMonths > 0 && (
          <div className="info-card glass-card" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
            <span className="info-icon">💡</span>
            <div className="info-text">
              Estimated monthly EMI:{' '}
              <strong style={{ color: 'var(--text-primary)', fontSize: 16 }}>
                ₹{emi.toLocaleString('en-IN')}
              </strong>{' '}
              for {tenureMonths} months on a ₹{Number(loanAmount).toLocaleString('en-IN')} loan.
              Your reported monthly revenue is{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                ₹{Number(profile.monthlyRevenue).toLocaleString('en-IN')}
              </strong>
              .
            </div>
          </div>
        )}

        {apiError && (
          <div className="error-banner">
            <span>⚠️</span> {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            {/* Loan Amount */}
            <div className="input-group">
              <label className="input-label">Loan Amount (₹)</label>
              <input
                type="number"
                className={`input-field ${errors.loanAmount ? 'error' : ''}`}
                placeholder="e.g. 500000"
                min={1000}
                {...register('loanAmount', {
                  required: 'Loan amount is required',
                  min: { value: 1000, message: 'Minimum loan amount is ₹1,000' },
                  valueAsNumber: true,
                })}
              />
              {errors.loanAmount && <span className="input-error-msg">{errors.loanAmount.message}</span>}
            </div>

            {/* Tenure */}
            <div className="input-group">
              <label className="input-label">Tenure (months)</label>
              <input
                type="number"
                className={`input-field ${errors.tenureMonths ? 'error' : ''}`}
                placeholder="e.g. 24"
                min={1}
                max={360}
                {...register('tenureMonths', {
                  required: 'Tenure is required',
                  min: { value: 1, message: 'Minimum tenure is 1 month' },
                  max: { value: 360, message: 'Maximum tenure is 360 months' },
                  valueAsNumber: true,
                })}
              />
              {errors.tenureMonths && <span className="input-error-msg">{errors.tenureMonths.message}</span>}
            </div>

            {/* Loan Purpose */}
            <div className="input-group full-width">
              <label className="input-label">Loan Purpose</label>
              <textarea
                className={`input-field ${errors.loanPurpose ? 'error' : ''}`}
                placeholder="Describe why you need this loan (e.g. Purchase machinery, working capital expansion...)"
                rows={3}
                {...register('loanPurpose', {
                  required: 'Loan purpose is required',
                  minLength: { value: 5, message: 'Must be at least 5 characters' },
                })}
              />
              {errors.loanPurpose && <span className="input-error-msg">{errors.loanPurpose.message}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Submitting...
                </>
              ) : (
                <>Submit for Decision →</>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default LoanPage;
