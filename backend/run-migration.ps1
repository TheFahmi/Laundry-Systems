# PowerShell script to run the UUID migration

Write-Host "Running UUID migration..." -ForegroundColor Cyan

# Install required dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install uuid @types/uuid pg --save

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install dependencies. Error code: $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

# Run the direct migration script
Write-Host "Starting migration process..." -ForegroundColor Yellow
node direct-uuid-migration.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "Migration failed with error code: $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
} else {
    Write-Host "Migration completed successfully!" -ForegroundColor Green
}

Write-Host "Migration process completed. Check the logs above for details." -ForegroundColor Cyan
pause 