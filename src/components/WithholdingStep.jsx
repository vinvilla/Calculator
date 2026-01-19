import React, { useState, useEffect } from 'react';

function WithholdingStep({ data, updateData, nextStep, prevStep }) {
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

  const totalWithheld = formData.federalWithheld + formData.caWithheld;

  return (
    <div className="step-content">
      <h2>Tax Withholding</h2>
      <p className="step-description">
        Enter the total taxes withheld from your paychecks in 2025
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="federalWithheld">Federal Tax Withheld</label>
          <input
            type="number"
            id="federalWithheld"
            min="0"
            step="0.01"
            value={formData.federalWithheld || ''}
            onChange={(e) => handleChange('federalWithheld', e.target.value)}
            className="form-control"
            placeholder="0"
          />
          <small className="form-hint">
            Total federal income tax withheld from all W-2 forms (Box 2)
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="caWithheld">California State Tax Withheld</label>
          <input
            type="number"
            id="caWithheld"
            min="0"
            step="0.01"
            value={formData.caWithheld || ''}
            onChange={(e) => handleChange('caWithheld', e.target.value)}
            className="form-control"
            placeholder="0"
          />
          <small className="form-hint">
            Total California state income tax withheld from all W-2 forms (Box 17)
          </small>
        </div>

        <div className="summary-box">
          <strong>Total Withholding: {formatCurrency(totalWithheld)}</strong>
        </div>

        <div className="button-group">
          <button type="button" onClick={prevStep} className="btn btn-secondary">
            Back
          </button>
          <button type="submit" className="btn btn-primary">
            Next: Deductions
          </button>
        </div>
      </form>
    </div>
  );
}

export default WithholdingStep;
