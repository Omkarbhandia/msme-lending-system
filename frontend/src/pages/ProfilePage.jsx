import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { createProfile } from '../api/client';

const BUSINESS_TYPES = [
  { value: 'retail', label: 'Retail' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'services', label: 'Services' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'other', label: 'Other' },
];

const ProfilePage = ({ onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');

    try {
      const pan = data.pan.toUpperCase();
      const result = await createProfile({ ...data, pan });
      onComplete(result.data);
    } catch (err) {
      setApiError(err.message || 'Failed to create profile. Please try again.');
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
        <h2 className="form-title">Business Profile</h2>
        <p className="form-subtitle">Tell us about your business to begin your loan application.</p>

        {apiError && (
          <div className="error-banner">
            <span>⚠️</span> {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            {/* Business Name */}
            <div className="input-group">
              <label className="input-label">Business Name <span style={{ color: 'var(--accent-red)' }}>*</span></label>
              <input
                className={`input-field ${errors.name ? 'error' : ''}`}
                placeholder="e.g. Acme Traders Pvt Ltd"
                {...register('name', {
                  required: 'Business name is required',
                  minLength: { value: 2, message: 'Must be at least 2 characters' },
                })}
              />
              {errors.name && <span className="input-error-msg">{errors.name.message}</span>}
            </div>

            {/* PAN */}
            <div className="input-group">
              <label className="input-label">PAN Number <span style={{ color: 'var(--accent-red)' }}>*</span></label>
              <input
                className={`input-field ${errors.pan ? 'error' : ''}`}
                placeholder="ABCDE1234F"
                maxLength={10}
                style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}
                {...register('pan', {
                  required: 'PAN is required',
                  pattern: {
                    value: /^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/,
                    message: 'Invalid PAN format (e.g. ABCDE1234F)',
                  },
                })}
              />
              {errors.pan && <span className="input-error-msg">{errors.pan.message}</span>}
            </div>

            {/* Business Type */}
            <div className="input-group">
              <label className="input-label">Business Type <span style={{ color: 'var(--accent-red)' }}>*</span></label>
              <select
                className={`input-field ${errors.businessType ? 'error' : ''}`}
                {...register('businessType', { required: 'Business type is required' })}
              >
                <option value="">Select business type</option>
                {BUSINESS_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {errors.businessType && <span className="input-error-msg">{errors.businessType.message}</span>}
            </div>

            {/* Monthly Revenue */}
            <div className="input-group">
              <label className="input-label">Monthly Revenue (₹) <span style={{ color: 'var(--accent-red)' }}>*</span></label>
              <input
                type="number"
                className={`input-field ${errors.monthlyRevenue ? 'error' : ''}`}
                placeholder="e.g. 80000"
                min={1}
                {...register('monthlyRevenue', {
                  required: 'Monthly revenue is required',
                  min: { value: 1, message: 'Revenue must be greater than 0' },
                  valueAsNumber: true,
                })}
              />
              {errors.monthlyRevenue && (
                <span className="input-error-msg">{errors.monthlyRevenue.message}</span>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Saving...
                </>
              ) : (
                <>Continue to Loan Details →</>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
