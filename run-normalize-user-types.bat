@echo off
SETLOCAL
set SCRIPT_DIR=%~dp0
set NODE_PATH=%SCRIPT_DIR%\icsrt-db
pushd "%NODE_PATH%"

:: Use .env if present
if exist .env (
  echo Using environment from .env
) else (
  echo .env not found; using defaults from script
)

node migrations\normalize-user-types.js
set ERR=%ERRORLEVEL%
popd

if %ERR% NEQ 0 (
  echo Migration failed with exit code %ERR%.
  exit /b %ERR%
) else (
  echo Migration completed successfully.
)
ENDLOCAL
