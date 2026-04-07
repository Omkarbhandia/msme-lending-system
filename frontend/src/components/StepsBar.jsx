const StepsBar = ({ currentStep }) => {
  const steps = [
    { label: 'Business Profile', num: 1 },
    { label: 'Loan Details', num: 2 },
    { label: 'Decision', num: 3 },
  ];

  const getState = (num) => {
    if (num < currentStep) return 'done';
    if (num === currentStep) return 'active';
    return 'idle';
  };

  return (
    <div className="steps-bar">
      {steps.map((step, i) => (
        <div key={step.num} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div className="step-item" style={{ flex: 'none' }}>
            <div className={`step-dot ${getState(step.num)}`}>
              {getState(step.num) === 'done' ? '✓' : step.num}
            </div>
            <span className={`step-label ${getState(step.num)}`}>{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`step-connector ${getState(step.num) === 'done' ? 'done' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default StepsBar;
