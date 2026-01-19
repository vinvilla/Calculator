import React, { useState, useEffect } from 'react';

function DeductionsStep({ data, updateData, nextStep, prevStep }) {
  const [formData, setFormData] = useState(data);

  useEffect(() => {
    updateData(formData);
  }, [formData]);

  const handleChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  const formatCurrency = (value) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  // Calculate potential itemized deductions (simplified - actual calc happens in tax engine)
  const saltTotal = formData.propertyTaxes + formData.stateIncomeTax;
  const saltDeduction = Math.min(10000, saltTotal); // Federal SALT cap

  const totalItemized =
    formData.mortgageInterest +
    saltDeduction +
    formData.charitableContributions +
    formData.medicalExpenses +
    formData.otherDeductions;

  return (
    <div className="step-content">
      <h2>Deductions</h2>
      <p className="step-description">
        Enter itemized deductions (leave blank to use standard deduction)
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="mortgageInterest">Mortgage Interest</label>
          <input
            type="number"
            id="mortgageInterest"
            min="0"
            step="0.01"
            value={formData.mortgageInterest || ''}
            onChange={(e) => handleChange('mortgageInterest', e.target.value)}
            className="form-control"
            placeholder="0"
          />
          <small className="form-hint">Interest paid on your primary residence</small>
        </div>

        <div className="form-group">
          <label htmlFor="propertyTaxes">Property Taxes</label>
          <input
            type="number"
            id="propertyTaxes"
            min="0"
            step="0.01"
            value={formData.propertyTaxes || ''}
            onChange={(e) => handleChange('propertyTaxes', e.target.value)}
            className="form-control"
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="stateIncomeTax">State Income Tax Paid</label>
          <input
            type="number"
            id="stateIncomeTax"
            min="0"
            step="0.01"
            value={formData.stateIncomeTax || ''}
            onChange={(e) => handleChange('stateIncomeTax', e.target.value)}
            className="form-control"
            placeholder="0"
          />
          <small className="form-hint">
            State/local income taxes paid (combined with property taxes, capped at $10,000 for federal)
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="charitableContributions">Charitable Contributions</label>
          <input
            type="number"
            id="charitableContributions"
            min="0"
            step="0.01"
            value={formData.charitableContributions || ''}
            onChange={(e) => handleChange('charitableContributions', e.target.value)}
            className="form-control"
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="medicalExpenses">Medical Expenses</label>
          <input
            type="number"
            id="medicalExpenses"
            min="0"
            step="0.01"
            value={formData.medicalExpenses || ''}
            onChange={(e) => handleChange('medicalExpenses', e.target.value)}
            className="form-control"
            placeholder="0"
          />
          <small className="form-hint">
            Only amounts exceeding 7.5% of AGI are deductible
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="otherDeductions">Other Itemized Deductions</label>
          <input
            type="number"
            id="otherDeductions"
            min="0"
            step="0.01"
            value={formData.otherDeductions || ''}
            onChange={(e) => handleChange('otherDeductions', e.target.value)}
            className="form-control"
            placeholder="0"
          />
          <small className="form-hint">Any other allowable itemized deductions</small>
        </div>

        <div className="info-box">
          <div className="info-row">
            <span>Total Itemized Deductions (estimated):</span>
            <strong>{formatCurrency(totalItemized)}</strong>
          </div>
          <div className="info-row">
            <span>2025 Standard Deduction (MFJ):</span>
            <strong>$30,000</strong>
          </div>
          <small className="form-hint">
            The calculator will automatically use whichever deduction is larger
          </small>
        </div>

        <div className="button-group">
          <button type="button" onClick={prevStep} className="btn btn-secondary">
            Back
          </button>
          <button type="submit" className="btn btn-primary">
            Next: Credits
          </button>
        </div>
      </form>
    </div>
  );
}

export default DeductionsStep;
