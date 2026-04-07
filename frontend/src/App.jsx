import { useState } from 'react';
import Navbar from './components/Navbar';
import StepsBar from './components/StepsBar';
import ProfilePage from './pages/ProfilePage';
import LoanPage from './pages/LoanPage';
import DecisionPage from './pages/DecisionPage';

const STEPS = { PROFILE: 1, LOAN: 2, DECISION: 3 };

function App() {
  const [step, setStep] = useState(STEPS.PROFILE);
  const [profile, setProfile] = useState(null);
  const [applicationId, setApplicationId] = useState(null);

  const handleProfileComplete = (profileData) => {
    setProfile(profileData);
    setStep(STEPS.LOAN);
  };

  const handleLoanComplete = (appId) => {
    setApplicationId(appId);
    setStep(STEPS.DECISION);
  };

  const handleReset = () => {
    setStep(STEPS.PROFILE);
    setProfile(null);
    setApplicationId(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '0 0 80px' }}>
        {step !== STEPS.DECISION && (
          <div className="container">
            {/* Hero */}
            <div className="page-hero" style={{ paddingBottom: 0 }}>
              <h1>
                Smart Lending
                <br />
                <span className="gradient-text">Decisions for MSMEs</span>
              </h1>
              <p style={{ marginTop: 16 }}>
                Get an instant credit decision powered by our automated risk engine.
                Apply in minutes, know your result in seconds.
              </p>
            </div>

            <StepsBar currentStep={step} />
          </div>
        )}

        <div className="container">
          {step === STEPS.PROFILE && (
            <ProfilePage onComplete={handleProfileComplete} />
          )}
          {step === STEPS.LOAN && (
            <LoanPage profile={profile} onComplete={handleLoanComplete} />
          )}
          {step === STEPS.DECISION && (
            <div style={{ padding: '60px 0 0' }}>
              <DecisionPage applicationId={applicationId} onReset={handleReset} />
            </div>
          )}
        </div>
      </main>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '20px 0', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          © 2026 Vitto · MSME Lending Platform ·{' '}
          <span style={{ color: 'var(--accent-blue)' }}>Built by Omkar Bhandia</span>
        </p>
      </footer>
    </div>
  );
}

export default App;
