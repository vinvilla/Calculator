# Tax Estimator 2025

A lightweight, local-only tax estimator web application for calculating federal and California state taxes for the 2025 tax year.

## Overview

This React-based tax calculator provides directional estimates of your 2025 tax liability. It supports Married Filing Jointly status and includes calculations for:

- **Federal Tax**: Using 2025 federal tax brackets
- **California State Tax**: Using 2025 California tax brackets
- **Multiple Income Sources**: W-2 wages, interest, dividends, capital gains, self-employment
- **Deductions**: Standard vs. itemized deduction comparison
- **Tax Credits**: American Opportunity Tax Credit (AOTC) with income-based phase-out

## Features

### Multi-Step Wizard Interface

1. **Personal Information**: Filing status, dependents, college student status
2. **Income**: W-2 wages, investment income, self-employment income
3. **Withholding**: Federal and state tax withholding
4. **Deductions**: Mortgage interest, property taxes, charitable contributions, etc.
5. **Credits**: AOTC eligibility and calculation
6. **Results**: Comprehensive tax breakdown with expandable sections

### Tax Calculations

- **2025 Federal Tax Brackets** (Married Filing Jointly)
- **2025 California Tax Brackets** (Married Filing Jointly)
- **Standard Deduction**: $30,000 (Federal), $11,306 (California)
- **SALT Deduction Cap**: $10,000 for federal (no cap for CA)
- **Medical Expense Threshold**: 7.5% of AGI
- **Self-Employment Tax**: 15.3% with 50% deduction
- **AOTC Phase-out**: $160,000 - $180,000 MAGI for MFJ

### Results Display

The results page shows:
- **Federal and California refund/amount owed** (prominently displayed)
- **Expandable sections** for detailed breakdowns:
  - Income breakdown with AGI calculation
  - Deduction comparison (standard vs. itemized)
  - Tax credits applied
  - Complete federal tax calculation
  - Complete California tax calculation
  - Effective tax rates

## Installation

### Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Setup Instructions

1. **Clone or navigate to the repository**:
   ```bash
   cd Calculator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:5173
   ```

## Usage

1. Start at the Personal Information step and enter your details
2. Progress through each step, entering your income and deduction information
3. The app saves your data as you go, so you can navigate back and forth
4. On the Results page, click the expandable sections to see detailed calculations
5. Use the "Start Over" button to begin a new calculation

## Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Project Structure

```
Calculator/
├── src/
│   ├── components/          # React components for each wizard step
│   │   ├── PersonalInfo.jsx
│   │   ├── IncomeStep.jsx
│   │   ├── WithholdingStep.jsx
│   │   ├── DeductionsStep.jsx
│   │   ├── CreditsStep.jsx
│   │   └── ResultsStep.jsx
│   ├── utils/               # Tax calculation logic
│   │   └── taxCalculations.js
│   ├── styles/              # CSS styling
│   │   └── App.css
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
└── package.json             # Dependencies and scripts
```

## Tax Calculation Details

### Federal Tax

1. Calculate total income from all sources
2. Subtract self-employment tax deduction (50% of SE tax)
3. Arrive at Adjusted Gross Income (AGI)
4. Apply standard or itemized deduction (whichever is larger)
5. Calculate taxable income
6. Apply progressive tax brackets
7. Subtract tax credits (AOTC if eligible)
8. Compare to withholding to determine refund/amount owed

### California Tax

1. Start with federal AGI
2. Apply CA standard or itemized deduction (no SALT cap for CA)
3. Calculate CA taxable income
4. Apply CA progressive tax brackets
5. Compare to CA withholding to determine refund/amount owed

### Self-Employment

For self-employment income:
- Calculates self-employment tax (15.3% on net SE income)
- Allows 50% deduction of SE tax from gross income
- Net SE income = SE income - SE expenses

### AOTC Calculation

The American Opportunity Tax Credit:
- Maximum credit: $2,500 per eligible student
- Phase-out range for MFJ: $160,000 - $180,000 MAGI
- Only available if you indicated having a child in college
- Simplified calculation (not exact IRS formula)

## Important Notes

### Limitations

- **Current Support**: Married Filing Jointly and California only
- **Simplified Calculations**: Not all tax rules and edge cases are implemented
- **No State Credits**: California state tax credits not included
- **Estimated Brackets**: 2025 tax brackets are estimates
- **AOTC Only**: Other credits (Child Tax Credit, EITC, etc.) not included

### Accuracy Disclaimer

**This calculator provides directional estimates only.** Tax calculations are simplified and may not reflect all tax rules, deductions, credits, or special circumstances. Results should not be used for actual tax filing. Always consult with a qualified tax professional for accurate tax advice.

## Technical Details

- **Framework**: React 19+ with functional components and hooks
- **Build Tool**: Vite for fast development and optimized builds
- **State Management**: React useState (no external state management)
- **Styling**: Pure CSS with CSS modules approach
- **Local Only**: No backend, no database, all calculations run in browser

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Contributing

This is a personal tax estimator tool. Feel free to fork and modify for your own use.

## License

ISC

---

**Built with React and Vite** | **2025 Tax Year Estimates** | **For Educational Purposes Only**
