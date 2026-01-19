import React, { useState } from 'react';
import PersonalInfo from './components/PersonalInfo';
import IncomeStep from './components/IncomeStep';
import WithholdingStep from './components/WithholdingStep';
import DeductionsStep from './components/DeductionsStep';
import CreditsStep from './components/CreditsStep';
import ResultsStep from './components/ResultsStep';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    personalInfo: {
      filingStatus: 'Married Filing Jointly',
      numDependents: 0,
      hasChildInCollege: false,
      state: 'California'
    },
    income: {
      w2Wages1: 0,
      w2Wages2: 0,
      interestIncome: 0,
      dividendIncome: 0,
      capitalGains: 0,
      seIncome: 0,
      seExpenses: 0
    },
    withholding: {
      federalWithheld: 0,
      caWithheld: 0
    },
    deductions: {
      mortgageInterest: 0,
      propertyTaxes: 0,
      charitableContributions: 0,
      stateIncomeTax: 0,
      medicalExpenses: 0,
      otherDeductions: 0
    },
    credits: {}
  });

  const totalSteps = 6;

  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfo
            data={formData.personalInfo}
            updateData={(data) => updateFormData('personalInfo', data)}
            nextStep={nextStep}
          />
        );
      case 2:
        return (
          <IncomeStep
            data={formData.income}
            updateData={(data) => updateFormData('income', data)}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 3:
        return (
          <WithholdingStep
            data={formData.withholding}
            updateData={(data) => updateFormData('withholding', data)}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 4:
        return (
          <DeductionsStep
            data={formData.deductions}
            updateData={(data) => updateFormData('deductions', data)}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 5:
        return (
          <CreditsStep
            data={formData.credits}
            personalInfo={formData.personalInfo}
            updateData={(data) => updateFormData('credits', data)}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 6:
        return (
          <ResultsStep
            formData={formData}
            prevStep={prevStep}
            goToStep={goToStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Tax Estimator 2025</h1>
        <p className="subtitle">Federal and California State Tax Calculator</p>
      </header>

      <div className="progress-bar">
        <div className="progress-steps">
          {[
            'Personal Info',
            'Income',
            'Withholding',
            'Deductions',
            'Credits',
            'Results'
          ].map((label, index) => (
            <div
              key={index}
              className={`progress-step ${
                currentStep === index + 1 ? 'active' : ''
              } ${currentStep > index + 1 ? 'completed' : ''}`}
              onClick={() => currentStep > index + 1 && goToStep(index + 1)}
            >
              <div className="step-number">{index + 1}</div>
              <div className="step-label">{label}</div>
            </div>
          ))}
        </div>
        <div className="progress-line">
          <div
            className="progress-line-fill"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>
      </div>

      <div className="step-container">{renderStep()}</div>

      <footer className="app-footer">
        <p>
          This is a directional tax estimator for the 2025 tax year.
          Results are estimates only and should not be used for actual tax filing.
        </p>
      </footer>
    </div>
  );
}

export default App;
