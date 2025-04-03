Write-Host "Compiling TypeScript files..."
npx tsc

Write-Host "Running the phone-based customer account generation script..."
node generate-phone-based-accounts.js

Write-Host "Process completed. See phone-based-accounts-report.txt for details." 