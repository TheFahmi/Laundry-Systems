# PowerShell script to run the UUID migration

# Navigate to the backend directory (adjust if needed)
# $backendDir = Join-Path $PSScriptRoot "backend"
# Set-Location -Path $backendDir
Set-Location -Path (Get-Location)

# Install the UUID package if needed
npm install uuid @types/uuid --save

# Compile TypeScript to JavaScript
npm run build

# Run the migration script
node run-uuid-migration.js

Write-Host "Migration process completed. Check the logs above for details." -ForegroundColor Green 