@echo off
title Stator Predict - Motorcycle Alternator Dyno
echo ========================================================
echo   STATOR PREDICT - Motorcycle Stator Dyno Telemetry
echo ========================================================
echo Launching visual stator winding application in your default browser...
start "" "%~dp0index.html"
echo Application opened successfully.
timeout /t 3 >nul
exit
