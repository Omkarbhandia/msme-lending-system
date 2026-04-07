import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDecision } from '../api/client';
import usePolling from '../hooks/usePolling';

const REASON_LABELS = {
  LOW_REVENUE: 'Revenue below minimum threshold (₹15,000/month)',
  HIGH_EMI_BURDEN: 'EMI exceeds 50% of monthly revenue',
  LOAN_AMOUNT_TOO_HIGH: 'Loan amount exceeds 24× monthly revenue',
  TENURE_TOO_SHORT: 'Loan tenure is less than 3 months',
  INVALID_PAN: 'PAN number format is invalid',
  INCONSISTENT_DATA: 'Conflicting financial data detected',
};

const getScoreColor = (score) => {
  if (score >= 750) return '#22c55e';
  if (score >= 650) return '#3b82f6';
  if (score >= 550) return '#f59e0b';
  return '#ef4444';
};

const getScoreLabel = (score) => {
  if (score >= 750) return 'Excellent';
  if (score >= 650) return 'Good';
  if (score >= 550) return 'Fair';
  return 'Poor';
};

const DecisionPage = ({ applicationId, onReset }) => {
  const { status, loading: polling, error: pollError } = usePolling(applicationId, 2000);
  const [decision, setDecision] = useState(null);
  const [decisionError, setDecisionError] = useState('');
  const [animatedScore, setAnimatedScore] = useState(300);

  // Fetch decision result once status is DONE
  useEffect(() => {
    if (status !== 'DONE') return;
    getDecision(applicationId)
      .then((res) => setDecision(res.data))
      .catch((err) => setDecisionError(err.message));
  }, [status, applicationId]);

  // Animate credit score counter
  useEffect(() => {
    if (!decision) return;
    const target = decision.creditScore;
    let current = 300;
    const step = Math.ceil((target - 300) / 40);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      setAnimatedScore(current);
    }, 30);
    return () => clearInterval(timer);
  }, [decision]);

  const isApproved = decision?.decision === 'APPROVED';
  const scoreColor = decision ? getScoreColor(decision.creditScore) : '#3b82f6';
  const scoreBarWidth = decision
    ? Math.round(((decision.creditScore - 300) / 600) * 100)
    : 0;

  // ── Polling loading state
  if (polling || status === 'PENDING' || status === 'PROCESSING') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card"
      >
        <div className="spinner-wrap">
          <div className="spinner" />
          <p className="spinner-text">
            {status === 'PENDING' ? '⏳ Application queued for review…' : '🔍 Analysing your application…'}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Application ID: {applicationId}
          </p>
        </div>
      </motion.div>
    );
  }

  // ── Failed state
  if (status === 'FAILED' || pollError) {
    return (
      <div className="glass-card">
        <div className="spinner-wrap">
          <span style={{ fontSize: 48 }}>💥</span>
          <p className="spinner-text" style={{ color: 'var(--accent-red)' }}>
            Decision processing failed
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {pollError || 'Please try submitting again.'}
          </p>
          <button className="btn btn-ghost" onClick={onReset} style={{ marginTop: 8 }}>
            Start Over
          </button>
        </div>
      </div>
    );
  }

  if (decisionError) {
    return (
      <div className="error-banner">⚠️ {decisionError}</div>
    );
  }

  if (!decision) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Hero */}
        <div className="decision-hero">
          <h1>
            <span className="gradient-text">Credit Decision</span>
          </h1>
          <p>Here's your application result based on our automated analysis.</p>
        </div>

        {/* Grid: Verdict + Score */}
        <div className="decision-grid">
          {/* Verdict Card */}
          <motion.div
            className={`glass-card verdict-card ${isApproved ? 'approved' : 'rejected'}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className="verdict-icon">{isApproved ? '🎉' : '❌'}</span>
            <div className={`verdict-badge ${isApproved ? 'approved' : 'rejected'}`}>
              {isApproved ? '✓ Approved' : '✗ Rejected'}
            </div>
            <p className="verdict-subtitle" style={{ marginTop: 12 }}>
              {isApproved
                ? 'Your application meets our lending criteria.'
                : 'Your application did not meet the required criteria.'}
            </p>
          </motion.div>

          {/* Score Card */}
          <motion.div
            className="glass-card score-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              Credit Score
            </p>
            <div className="score-gauge-wrap">
              <span
                className="score-number"
                style={{ color: scoreColor }}
              >
                {animatedScore}
              </span>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: scoreColor }}>
              {getScoreLabel(decision.creditScore)}
            </p>
            <p className="score-range">Range: 300 – 900</p>
            <div className="score-bar-track">
              <div
                className="score-bar-fill"
                style={{ width: `${scoreBarWidth}%`, background: scoreColor }}
              />
            </div>
          </motion.div>
        </div>

        {/* Reason Codes */}
        <motion.div
          className="glass-card reasons-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{ marginBottom: 24 }}
        >
          <p className="reasons-title">⚡ Analysis Breakdown</p>
          {decision.reasonCodes.length === 0 ? (
            <p className="no-issues">
              <span>✅</span> All checks passed — no issues detected
            </p>
          ) : (
            <div className="reason-chips">
              {decision.reasonCodes.map((code) => (
                <div key={code} className="reason-chip negative">
                  <span>⚠</span>
                  {REASON_LABELS[code] || code}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Application metadata */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{ padding: '18px 28px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, background: 'var(--bg-primary)' }}
        >
          {[
            { label: 'Application ID', value: applicationId.slice(0, 8) + '...' },
            { label: 'Processing Time', value: `${decision.processingTimeMs}ms` },
            { label: 'Checks Passed', value: `${6 - decision.reasonCodes.length}/6` },
            { label: 'Score Band', value: getScoreLabel(decision.creditScore) },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                {item.label}
              </p>
              <p style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                {item.value}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Reset */}
        <div className="restart-area">
          <button className="btn btn-ghost" onClick={onReset}>
            ↩ Start a New Application
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DecisionPage;
