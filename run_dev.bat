@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo [SchStudy] Gelistirme sunucusu baslatiliyor (http://localhost:3000)...
npm.cmd run dev
pause
