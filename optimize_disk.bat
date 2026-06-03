@echo off
:: Ensure running as administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ========================================================
    echo  ADMINISTRATOR PERMISSION REQUIRED
    echo  Please RIGHT-CLICK this file and select "Run as administrator"
    echo ========================================================
    echo.
    pause
    exit /b 1
)

echo [1/3] Disabling Hibernation to immediately reclaim 6.78 GB...
powercfg /h off

echo [2/3] Moving main Pagefile to D: and shrinking C: Pagefile to 1-2 GB...
powershell -NoProfile -Command "Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management' -Name 'AutomaticManagedPagefile' -Value 0 -Type DWord; Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management' -Name 'PagingFiles' -Value @('C:\pagefile.sys 1024 2048', 'D:\pagefile.sys 0 0') -Type MultiString"

echo [3/3] Done!
echo.
echo ========================================================
echo  SUCCESS!
echo  1. Hibernation file (6.78 GB) has been deleted right now.
echo  2. Virtual Memory has been configured:
echo     - D: drive set to System Managed (handles main memory).
echo     - C: drive set to small 1-2 GB (saves ~18 GB on C:).
echo.
echo  Please restart your computer when convenient to let 
echo  Windows apply the new pagefile sizes on C: and D:.
echo ========================================================
echo.
pause
