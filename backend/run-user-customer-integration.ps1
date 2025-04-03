Write-Host "Compiling TypeScript files..."
npx tsc

Write-Host "Running the user-customer integration migration..."
node run-user-customer-integration.js

Write-Host "Migration process completed." 