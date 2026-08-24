@echo off
title Star Home Design
echo Starting servers...
echo.

cd /d C:\Users\hi\OneDrive\Desktop\star2\star-home-design\server
start /min "Backend" cmd /c "node index.js"
timeout /t 5 /nobreak >NUL

cd /d C:\Users\hi\OneDrive\Desktop\star2\star-home-design
start /min "Frontend" cmd /c "npx vite --host"
timeout /t 8 /nobreak >NUL

echo.
echo ==========================================
echo   SERVERS RUNNING
echo   Website:  http://localhost:5173
echo   Admin:    http://localhost:5173/admin
echo   Backend:  http://localhost:5000
echo ==========================================
echo.
echo   Close this window = servers stop
echo   KEEP THIS WINDOW OPEN!
echo.
pause
