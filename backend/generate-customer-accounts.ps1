Write-Host "Compiling TypeScript files..."
npx tsc

Write-Host "Running the customer account generation script..."
node generate-customer-accounts.js

Write-Host "Process completed. See customer-accounts-report.txt for details." 