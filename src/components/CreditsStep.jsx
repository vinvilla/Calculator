import React, { useState, useEffect } from 'react';

function CreditsStep({ data, personalInfo, updateData, nextStep, prevStep }) {
  const [formData, setFormData] = useState(data);

  useEffect(() => {
    updateData(formData);
  }, [formData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <div className="step-content">
      <h2>Tax Credits</h2>
      <p className="step-description">
        Review potential tax credits based on your information
      </p>

      <form onSubmit={handleSubmit}>
        <div className="credit-info-box">
          <h3>American Opportunity Tax Credit (AOTC)</h3>

          {personalInfo.hasChildInCollege ? (
            <div className="credit-eligible">
              <p className="status-message success">
                ✓ You may be eligible for the AOTC
              </p>
              <div className="credit-details">
                <ul>
                  <li><strong>Maximum Credit:</strong> $2,500 per student</li>
                  <li><strong>Requirements:</strong>
                    <ul>
                      <li>Student must be pursuing a degree</li>
                      <li>Enrolled at least half-time for one academic period</li>
                      <li>First four years of higher education</li>
                      <li>No felony drug convictions</li>
                    </ul>
                  </li>
                  <li><strong>Phase-out range (MFJ):</strong> $160,000 - $180,000 MAGI</li>
                </ul>
                <p className="credit-note">
                  The calculator will automatically determine your eligibility and
                  calculate the credit amount based on your income.
                </p>
              </div>
            </div>
          ) : (
            <div className="credit-not-eligible">
              <p className="status-message">
                You indicated you do not have a child in college, so the AOTC
                does not apply.
              </p>
              <p className="credit-note">
                If you made an error, please go back to the Personal Information step
                to update your answer.
              </p>
            </div>
          )}
        </div>

        <div className="info-box">
          <h4>Other Credits (Not Implemented)</h4>
          <p>
            This calculator currently only supports the AOTC. Other credits such as
            Child Tax Credit, Earned Income Credit, etc. are not included in this
            simplified estimator.
          </p>
        </div>

        <div className="button-group">
          <button type="button" onClick={prevStep} className="btn btn-secondary">
            Back
          </button>
          <button type="submit" className="btn btn-primary">
            Calculate Results
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreditsStep;
