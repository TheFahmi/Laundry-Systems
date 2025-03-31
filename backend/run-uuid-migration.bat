@echo off
echo Running UUID migration...

REM Install required dependencies
call npm install uuid @types/uuid pg --save

REM Run the direct migration script
node direct-uuid-migration.js

echo Migration process completed. Check the logs above for details.
pause 