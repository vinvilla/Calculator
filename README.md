# VINV Tax Estimator

A professional, web-based income tax calculator that helps you estimate your federal and state tax liability for 2024.

## Features

- **Comprehensive Tax Calculation**
  - Federal income tax based on 2024 tax brackets
  - State income tax estimation
  - FICA taxes (Social Security & Medicare)
  - Progressive tax bracket breakdown

- **Multiple Filing Statuses**
  - Single
  - Married Filing Jointly
  - Married Filing Separately
  - Head of Household

- **Deductions & Credits**
  - Standard or itemized deductions
  - 401(k) retirement contributions
  - Child tax credits
  - Adjustable state tax rates

- **Professional UI**
  - Clean, modern design
  - Responsive layout for mobile and desktop
  - Real-time calculations
  - Detailed tax bracket breakdown

## Deployment Instructions

### Option 1: Using Python HTTP Server (Recommended)

1. **Navigate to the project directory:**
   ```bash
   cd /home/user/Calculator
   ```

2. **Start the web server:**
   ```bash
   python3 -m http.server 8000
   ```

3. **Open your web browser and visit:**
   ```
   http://localhost:8000
   ```

4. **To stop the server:**
   Press `Ctrl + C` in the terminal

### Option 2: Using Node.js HTTP Server

1. **Install http-server globally (if not installed):**
   ```bash
   npm install -g http-server
   ```

2. **Navigate to the project directory:**
   ```bash
   cd /home/user/Calculator
   ```

3. **Start the server:**
   ```bash
   http-server -p 8000
   ```

4. **Open your browser at:**
   ```
   http://localhost:8000
   ```

### Option 3: Direct File Opening

1. **Navigate to the project directory in your file explorer**

2. **Double-click on `index.html`**
   - The application will open in your default web browser
   - All features work without a server since it's a static web app

### Option 4: Using Live Server (VS Code)

1. **Install the Live Server extension in VS Code**

2. **Right-click on `index.html`**

3. **Select "Open with Live Server"**

4. **The app will open automatically in your browser**

## How to Use the Tax Estimator

### Step 1: Enter Personal Information
- Select your filing status (Single, Married Filing Jointly, etc.)

### Step 2: Enter Income Details
- **Annual Gross Income:** Your total salary/wages before taxes
- **Additional Income:** Dividends, interest, capital gains, etc.

### Step 3: Configure Deductions
- Choose between Standard or Itemized deductions
- Enter 401(k) contributions
- If using itemized deductions, enter the total amount

### Step 4: Additional Information
- **Number of Dependents:** For child tax credit calculation ($2,000 per dependent)
- **State Tax Rate:** Enter your state's income tax rate (default is 5%)

### Step 5: Calculate
- Click the **"Calculate Tax"** button
- View your comprehensive tax breakdown

## Sample Test Cases

### Test Case 1: Single Filer with $75,000 Income
```
Filing Status: Single
Annual Income: $75,000
Additional Income: $0
Deduction Type: Standard
401(k): $5,000
Dependents: 0
State Rate: 5%
```

**Expected Results:**
- Gross Income: $75,000
- AGI: $70,000
- Federal Tax: ~$8,200
- Total Tax: ~$14,000

### Test Case 2: Married Filing Jointly with $150,000 Income
```
Filing Status: Married Filing Jointly
Annual Income: $150,000
Additional Income: $10,000
Deduction Type: Standard
401(k): $12,000
Dependents: 2
State Rate: 6%
```

**Expected Results:**
- Gross Income: $160,000
- AGI: $148,000
- Child Tax Credit: $4,000
- Total Tax: ~$25,000

### Test Case 3: High Income Single Filer
```
Filing Status: Single
Annual Income: $250,000
Additional Income: $50,000
Deduction Type: Itemized ($25,000)
401(k): $23,000
Dependents: 0
State Rate: 7%
```

## Tax Calculations Explained

### Federal Income Tax
The calculator uses 2024 progressive tax brackets:
- Income is taxed at increasing rates as it moves through brackets
- Only the income within each bracket is taxed at that bracket's rate

### FICA Taxes
- **Social Security:** 6.2% up to $168,600 (2024 wage base)
- **Medicare:** 1.45% on all income
- **Additional Medicare:** 0.9% on income over $200,000

### State Tax
- Simple percentage calculation based on gross income
- Adjustable to match your state's rate

### Adjusted Gross Income (AGI)
- Gross Income - 401(k) Contributions = AGI

### Taxable Income
- AGI - Deductions = Taxable Income

## Project Structure

```
Calculator/
├── index.html      # Main HTML structure
├── styles.css      # Professional styling
├── index.js        # Tax calculation logic
└── README.md       # This file
```

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

Works on all modern browsers with JavaScript enabled.

## Technology Stack

- **HTML5** - Structure
- **CSS3** - Styling with modern features
- **Vanilla JavaScript** - No dependencies required
- **Responsive Design** - Mobile-friendly

## Tax Year

This calculator uses **2024 tax brackets and deductions**.

## Disclaimer

This tax estimator is for **educational purposes only**. The calculations provided are estimates and may not reflect your actual tax liability. For accurate tax advice and filing, please consult:
- A certified tax professional (CPA)
- IRS official resources at www.irs.gov
- Tax preparation software

## Support

For issues or questions about this calculator, please refer to the source code comments or contact the development team.

## License

Copyright 2024 VINV Tax Estimator. All rights reserved.

---

**Last Updated:** January 2024
**Version:** 1.0.0
**Maintained by:** VINV Development Team
