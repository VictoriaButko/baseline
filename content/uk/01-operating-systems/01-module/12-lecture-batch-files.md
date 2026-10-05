---
title: "Командні файли та структура команд пакетних файлів"
type: lecture
order: 12
preview: "Batch-файли, змінні, умови, цикли."
---

## Що таке пакетний файл?

**Batch-файл (пакетний файл)** — текстовий файл з командами CMD, які виконуються послідовно. Це найпростіший спосіб автоматизувати повторювані задачі в Windows.

```
┌─────────────────────────────────────────────────────────────────┐
│                    BATCH-ФАЙЛ                                   │
│                                                                 │
│   backup.bat                                                    │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │ @echo off                                                │  │
│   │ echo Starting backup...                                  │  │
│   │ xcopy C:\Data D:\Backup /s /y                            │  │
│   │ echo Backup complete!                                    │  │
│   │ pause                                                    │  │
│   └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│   Запуск:                                                       │
│   • Подвійний клік у File Explorer                              │
│   • cmd.exe → backup.bat                                        │
│   • Планувальник завдань (Task Scheduler)                       │
│   • PowerShell: & .\backup.bat                                  │
│                                                                 │
│   Розширення:                                                   │
│   • .bat — класичне (з DOS)                                     │
│   • .cmd — Windows NT+ (еквівалентні)                           │
│                                                                 │
│   Редактор: Notepad, VS Code, Notepad++                         │
└─────────────────────────────────────────────────────────────────┘
```

### Переваги batch-файлів

| Перевага | Опис |
|----------|------|
| **Простота** | Звичайний текстовий файл, легко редагувати |
| **Без залежностей** | Працює на будь-якому Windows без установки |
| **Сумісність** | Скрипти з 1990-х часто працюють досі |
| **Швидкість створення** | Автоматизація за хвилини |

### Недоліки

| Недолік | Рішення |
|---------|---------|
| Обмежені можливості | Використовуйте PowerShell для складного |
| Текстовий pipeline | PowerShell має об'єкти |
| Складний синтаксис | Документація + практика |

## Структура batch-файлу

### Базовий шаблон

```batch
@echo off
rem ============================================
rem Назва: script_name.bat
rem Опис: Короткий опис призначення
rem Автор: Ваше ім'я
rem Дата: 2024-01-15
rem ============================================

rem Встановлення локального середовища
setlocal enabledelayedexpansion

rem === Змінні ===
set SCRIPT_DIR=%~dp0
set LOG_FILE=%SCRIPT_DIR%log.txt

rem === Основний код ===
echo Script started at %DATE% %TIME%
echo.

rem Ваш код тут...

rem === Завершення ===
echo.
echo Script completed successfully!

rem Очікування перед закриттям вікна
pause

endlocal
exit /b 0
```

### Ключові команди

| Команда | Опис | Приклад |
|---------|------|---------|
| `@echo off` | Вимкнути відображення команд | На початку скрипта |
| `echo` | Вивести текст | `echo Hello World` |
| `echo.` | Порожній рядок | `echo.` |
| `rem` | Коментар | `rem Це коментар` |
| `::` | Коментар (альтернатива) | `:: Це теж коментар` |
| `pause` | Пауза ("Press any key") | `pause` |
| `pause >nul` | Пауза без повідомлення | `pause >nul` |
| `cls` | Очистити екран | `cls` |
| `exit` | Завершити виконання | `exit /b 0` |
| `exit /b N` | Завершити з кодом N | `exit /b 1` |
| `call` | Викликати інший batch | `call other.bat` |
| `goto` | Перейти до мітки | `goto :end` |
| `setlocal` | Локальна область змінних | `setlocal` |
| `endlocal` | Завершити локальну область | `endlocal` |
| `title` | Заголовок вікна | `title My Script` |
| `color` | Колір тексту/фону | `color 0A` (зелений на чорному) |
| `timeout` | Пауза N секунд | `timeout /t 5` |

**Коментарі — лише з початку рядка.** І `rem`, і `::` працюють як коментар тільки тоді, коли з них починається рядок. `::` — це насправді мітка з неможливим ім'ям, яку CMD пропускає. Посеред рядка обидва — звичайні символи: `set NAME=Ivan :: ім'я` запише в змінну весь текст `Ivan :: ім'я`, а `set /a X=5+3 :: сума` завершиться помилкою *Missing operator*. Коментар після команди пишуть через `&`: `set "NAME=Ivan" & rem ім'я`. Усередині блоків у дужках — після `if` чи `for` — використовуйте тільки `rem`: `::` там може зламати розбір блоку.

```batch
@echo off
title Backup Script
color 0A
cls
echo Welcome to the backup utility!
echo.
timeout /t 3 >nul
echo Starting...
```

## Змінні

### Встановлення та використання

```batch
@echo off

rem Встановлення змінної
set NAME=John
set AGE=20
set "MESSAGE=Hello, World!"

rem УВАГА: пробіли мають значення!
rem   set VAR=value    створює VAR зі значенням "value"
rem   set VAR =value   створює змінну з іменем "VAR " (з пробілом у кінці!)
rem   set VAR=value␣   значення теж отримає невидимий пробіл у кінці
rem Лапки навколо всього присвоєння захищають від обох помилок:
set "VAR=value"

rem Використання змінної (з %)
echo Name: %NAME%
echo Age: %AGE%
echo %MESSAGE%

rem Арифметика (set /a)
set /a RESULT=5+3
set /a RESULT=10/2
rem Залишок від ділення: у batch-файлі знак % подвоюють
set /a RESULT=7%%3
set /a YEAR=2024
set /a NEXT_YEAR=%YEAR%+1
echo %YEAR% + 1 = %NEXT_YEAR%

rem Введення від користувача (set /p)
rem USERNAME — системна змінна, тож для введення беремо інше ім'я
set /p USER_NAME=Enter your name:
echo Hello, %USER_NAME%!

set /p AGE=Enter your age:
set /a BIRTH_YEAR=2024-%AGE%
echo You were born around %BIRTH_YEAR%

pause
```

### Системні змінні

```
┌────────────────────────────────────────────────────────────────┐
│                    СИСТЕМНІ ЗМІННІ                             │
│                                                                │
│   Дата та час:                                                 │
│   %DATE%          → 15.01.2024 (формат залежить від локалі)    │
│   %TIME%          → 14:30:25,50 (формат — за локаллю)          │
│   %RANDOM%        → випадкове число 0-32767                    │
│                                                                │
│   Шляхи:                                                       │
│   %CD%            → поточний каталог                           │
│   %USERPROFILE%   → C:\Users\Username                          │
│   %APPDATA%       → C:\Users\Username\AppData\Roaming          │
│   %LOCALAPPDATA%  → C:\Users\Username\AppData\Local            │
│   %TEMP%          → каталог для тимчасових файлів              │
│   %HOMEPATH%      → \Users\Username                            │
│   %HOMEDRIVE%     → C:                                         │
│                                                                │
│   Система:                                                     │
│   %COMPUTERNAME%  → ім'я комп'ютера                            │
│   %USERNAME%      → ім'я користувача                           │
│   %OS%            → Windows_NT                                 │
│   %PROCESSOR_ARCHITECTURE% → AMD64 або x86                     │
│                                                                │
│   Параметри скрипта:                                           │
│   %0              → ім'я, яким викликано скрипт                │
│   %~f0            → повний шлях до batch-файлу                 │
│   %1, %2, ... %9  → параметри (далі — через shift)             │
│   %*              → всі параметри                              │
│   %ERRORLEVEL%    → код повернення попередньої команди         │
└────────────────────────────────────────────────────────────────┘
```

```batch
@echo off
echo === Системна інформація ===
echo Current directory: %CD%
echo User: %USERNAME% on %COMPUTERNAME%
echo OS: %OS% (%PROCESSOR_ARCHITECTURE%)
echo Date: %DATE%
echo Time: %TIME%
echo Random: %RANDOM%
echo Temp: %TEMP%
echo.

rem Параметри скрипта
echo === Параметри скрипта ===
echo Script: %0
echo Full path: %~f0
echo Directory: %~dp0
echo First argument: %1
echo Second argument: %2
echo All arguments: %*
```

### Модифікатори параметрів

```batch
rem Для параметру %1 або змінної %%a в циклах:

%~1          :: Видалити лапки з параметра
%~f1         :: Повний шлях
%~d1         :: Тільки диск (C:)
%~p1         :: Тільки шлях (\Users\Admin\)
%~n1         :: Тільки ім'я файлу (без розширення)
%~x1         :: Тільки розширення (.txt)
%~s1         :: Короткий шлях (8.3 формат)
%~a1         :: Атрибути файлу
%~t1         :: Дата/час модифікації
%~z1         :: Розмір файлу в байтах

rem Комбінації:
%~dp1        :: Диск + шлях (каталог файлу)
%~nx1        :: Ім'я + розширення
%~dpnx1      :: Повний шлях (те саме що %~f1)
```

```batch
@echo off
echo Analyzing: %1
echo Full path: %~f1
echo Drive: %~d1
echo Path: %~p1
echo Filename: %~n1
echo Extension: %~x1
echo Size: %~z1 bytes
echo Modified: %~t1
pause
```

## Умовні оператори (IF)

### Базовий синтаксис

```batch
@echo off

rem Перевірка рівності (== для рядків)
set VALUE=10
if %VALUE%==10 echo Value is 10

rem З else (дужки ОБОВ'ЯЗКОВІ на тому ж рядку)
if %VALUE%==10 (
    echo Value is ten
) else (
    echo Value is not ten
)

rem Кілька умов
if %VALUE%==10 (
    echo Ten!
) else if %VALUE%==20 (
    echo Twenty!
) else (
    echo Something else
)

rem Без лапок порівняння ламається, щойно змінна порожня:
rem if %EMPTY%==10 перетворюється на "if ==10" — синтаксична помилка.
rem Для рядків завжди беріть обидві частини в лапки:
if "%VALUE%"=="10" echo Value is 10 too

rem Порівняння чисел (GTR, LSS, GEQ, LEQ, EQU, NEQ)
set /a NUM=15
if %NUM% GTR 10 echo Greater than 10
if %NUM% LSS 20 echo Less than 20
if %NUM% GEQ 15 echo Greater or equal to 15
if %NUM% LEQ 15 echo Less or equal to 15
if %NUM% NEQ 0 echo Not equal to zero
if %NUM% EQU 15 echo Equal to 15
```

### Оператори порівняння

| Оператор | Значення | Приклад |
|----------|----------|---------|
| `==` | дорівнює (рядки) | `if "%a%"=="%b%"` |
| `EQU` | дорівнює (числа) | `if %a% EQU %b%` |
| `NEQ` | не дорівнює | `if %a% NEQ 0` |
| `LSS` | менше | `if %a% LSS 10` |
| `LEQ` | менше або дорівнює | `if %a% LEQ 10` |
| `GTR` | більше | `if %a% GTR 5` |
| `GEQ` | більше або дорівнює | `if %a% GEQ 5` |

### Перевірка існування

```batch
@echo off

rem Чи існує файл?
if exist "C:\data\file.txt" (
    echo File exists
    type "C:\data\file.txt"
) else (
    echo File not found
)

rem Чи НЕ існує файл?
if not exist "backup.txt" (
    echo Creating backup...
    copy original.txt backup.txt
)

rem Чи існує каталог? (із \ на кінці)
if exist "C:\data\" (
    echo Directory exists
) else (
    echo Directory not found
    mkdir "C:\data"
)

rem Чи визначена змінна?
if defined MYVAR (
    echo MYVAR is defined: %MYVAR%
) else (
    echo MYVAR is not defined
)

rem Чи НЕ визначена?
if not defined JAVA_HOME (
    echo Warning: JAVA_HOME is not set!
)
```

### Перевірка коду помилки

```batch
@echo off

rem Команди повертають код через %ERRORLEVEL%
rem 0 = успіх, інше = помилка

copy file.txt backup.txt
if %ERRORLEVEL% EQU 0 (
    echo Copy successful
) else (
    echo Copy failed with error %ERRORLEVEL%
)

rem Скорочені варіанти:
copy file.txt backup.txt && echo Success || echo Failed

rem if errorlevel N — перевіряє чи >= N
ping -n 1 192.168.1.1 >nul
if errorlevel 1 (
    echo Host unreachable
) else (
    echo Host is up
)

rem Перевірка конкретного коду
if %ERRORLEVEL%==0 echo Success
if %ERRORLEVEL%==1 echo Error 1
if %ERRORLEVEL%==2 echo Error 2
```

### Порівняння рядків

```batch
@echo off
set /p ANSWER=Continue? (Y/N):

rem Регістронезалежне порівняння (/i)
if /i "%ANSWER%"=="Y" (
    echo Continuing...
) else if /i "%ANSWER%"=="N" (
    echo Exiting...
    exit /b
) else (
    echo Invalid input: %ANSWER%
    exit /b 1
)

rem ВАЖЛИВО: лапки захищають від порожнього значення
rem Без лапок, якщо ANSWER порожня: if ==Y — синтаксична помилка
```

## Цикли (FOR)

### Цикл по списку

```batch
@echo off

rem Ітерація по списку значень
for %%a in (apple banana cherry orange) do (
    echo Fruit: %%a
)

rem Ітерація по файлах у каталозі
echo.
echo Text files in current directory:
for %%f in (*.txt) do (
    echo - %%f
)

rem Ітерація по файлах рекурсивно (/r)
echo.
echo All log files:
for /r "C:\Logs" %%f in (*.log) do (
    echo Found: %%f
)

rem Ітерація по каталогах (/d)
echo.
echo Subdirectories:
for /d %%d in (*) do (
    echo [DIR] %%d
)
```

**ВАЖЛИВО:**
- В batch-файлах: `%%a`
- В командному рядку (cmd.exe): `%a`

### Числовий цикл (/L)

```batch
@echo off

rem Синтаксис: for /l %%i in (start,step,end) do ...

rem Від 1 до 10
echo Counting 1 to 10:
for /l %%i in (1,1,10) do (
    echo %%i
)

rem Від 0 до 100 з кроком 10
echo.
echo Counting by 10:
for /l %%i in (0,10,100) do (
    echo %%i%%
)

rem Зворотній відлік
echo.
echo Countdown:
for /l %%i in (5,-1,1) do (
    echo %%i...
    timeout /t 1 >nul
)
echo Liftoff!

rem Цикл з затримкою
for /l %%i in (1,1,5) do (
    echo Iteration %%i of 5
    timeout /t 2 >nul
)
```

### Цикл по вмісту файлу (/F)

```batch
@echo off

rem Читання файлу рядок за рядком
echo Lines in input.txt:
rem Змінна циклу — завжди одна літера: %%L, а не %%line
for /f "delims=" %%L in (input.txt) do (
    echo %%L
)

rem Парсинг CSV (розділювач — кома)
echo.
echo Parsing CSV:
for /f "tokens=1,2,3 delims=," %%a in (data.csv) do (
    echo Name: %%a, Age: %%b, City: %%c
)

rem Пропустити заголовок (skip=1)
for /f "skip=1 tokens=1,2 delims=," %%a in (data.csv) do (
    echo %%a - %%b
)

rem Результат команди (usebackq + backticks).
rem delims= обов'язковий: без нього for /f ріже рядок на пробілах,
rem і файл "my notes.txt" перетвориться на "my"
echo.
echo Text files:
for /f "usebackq delims=" %%i in (`dir /b *.txt`) do (
    echo File: %%i
)

rem Альтернатива без usebackq (одинарні лапки)
for /f "delims=" %%i in ('dir /b *.txt') do (
    echo File: %%i
)
```

### Опції FOR /F

| Опція | Опис | Приклад |
|-------|------|---------|
| `delims=,` | Розділювач | `delims=,;` (кома або крапка з комою) |
| `tokens=1,2,3` | Які поля брати | `tokens=1-3` (1, 2, 3) |
| `skip=N` | Пропустити перші N рядків | `skip=1` (заголовок) |
| `eol=;` | Символ коментаря | `eol=#` |
| `usebackq` | Backticks для команд | З командами |

```batch
rem Приклад: парсинг ipconfig
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    echo IP Address: %%a
)
```

## Мітки та переходи

```batch
@echo off

:menu
cls
echo ================================
echo         MAIN MENU
echo ================================
echo 1. Show system info
echo 2. List files
echo 3. Create backup
echo 4. Exit
echo ================================
rem Скинути змінну: якщо користувач просто натисне Enter,
rem set /p залишить у CHOICE попереднє значення
set "CHOICE="
set /p CHOICE=Enter choice (1-4):

if "%CHOICE%"=="1" goto sysinfo
if "%CHOICE%"=="2" goto listfiles
if "%CHOICE%"=="3" goto backup
if "%CHOICE%"=="4" goto end
echo Invalid choice!
timeout /t 2 >nul
goto menu

:sysinfo
echo.
echo === System Information ===
systeminfo | findstr /c:"OS Name" /c:"OS Version"
echo.
pause
goto menu

:listfiles
echo.
echo === Files in current directory ===
dir /b
echo.
pause
goto menu

:backup
echo.
echo === Creating backup ===
if not exist backup mkdir backup
xcopy /s /y *.txt backup\
echo Done!
pause
goto menu

:end
echo Goodbye!
exit /b 0
```

Для меню з одного символу в Windows є зручніша команда `choice`: `choice /c 1234 /m "Your choice"` приймає лише дозволені клавіші, не потребує Enter і повертає номер вибору в `%ERRORLEVEL%`.

## Функції (підпрограми)

```batch
@echo off
setlocal enabledelayedexpansion

rem === Виклик функцій ===
call :greet John
call :greet Alice
call :greet "Bob Smith"

rem Функція з поверненням значення
call :add 5 3
echo 5 + 3 = %RESULT%

call :multiply 4 7
echo 4 * 7 = %RESULT%

rem Функція з перевіркою
call :file_exists "C:\Windows\notepad.exe"
if %RESULT%==1 (
    echo Notepad exists
) else (
    echo Notepad not found
)

goto :eof

rem ===================================
rem         ФУНКЦІЇ
rem ===================================

:greet
rem Параметр %~1 — видаляє лапки
echo Hello, %~1!
exit /b

:add
set /a RESULT=%~1+%~2
exit /b

:multiply
set /a RESULT=%~1*%~2
exit /b

:file_exists
if exist "%~1" (
    set RESULT=1
) else (
    set RESULT=0
)
exit /b
```

## Практичні приклади

### 1. Бекап з датою та логуванням

```batch
@echo off
setlocal

rem === Налаштування ===
set SOURCE=C:\Projects
set DEST=D:\Backups
set LOG_DIR=%DEST%\logs

rem === Створення імені з датою ===
rem %DATE% і %TIME% залежать від локалі: 18.09.2026 на українській
rem Windows, 09/18/2026 на англійській, а до 10:00 година в %TIME%
rem ще й починається з пробілу. Надійніше попросити дату в PowerShell
rem у потрібному форматі:
for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd_HH-mm"') do (
    set "TIMESTAMP=%%i"
)
set BACKUP_DIR=%DEST%\backup_%TIMESTAMP%
set LOG_FILE=%LOG_DIR%\backup_%TIMESTAMP%.log

rem === Підготовка ===
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

echo ========================================
echo Backup started at %DATE% %TIME%
echo Source: %SOURCE%
echo Destination: %BACKUP_DIR%
echo ========================================

rem === Копіювання ===
echo Creating backup...
robocopy "%SOURCE%" "%BACKUP_DIR%" /e /z /log:"%LOG_FILE%" /tee

rem === Перевірка результату ===
rem Код robocopy — набір прапорців: 1 — файли скопійовано, 2 — у приймачі
rem є зайві файли, 4 — є розбіжності. Усе це не помилки. Помилка
rem починається з 8 (не вдалося скопіювати) і 16 (фатальна помилка).
if %ERRORLEVEL% LSS 8 (
    echo.
    echo ========================================
    echo Backup completed successfully!
    echo Log: %LOG_FILE%
    echo ========================================
) else (
    echo.
    echo ========================================
    echo Backup failed with errors! Check log.
    echo ========================================
)

pause
endlocal
```

### 2. Очищення тимчасових файлів

```batch
@echo off
setlocal

echo ========================================
echo     Temporary Files Cleaner
echo ========================================
echo.

rem === Очищення TEMP ===
echo Cleaning TEMP folder...
if exist "%TEMP%" (
    for %%f in ("%TEMP%\*") do (
        del /q "%%f" 2>nul
    )
    for /d %%d in ("%TEMP%\*") do (
        rd /s /q "%%d" 2>nul
    )
)

rem === Очищення кешу браузерів ===
echo Cleaning browser caches...

rem Chrome
if exist "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Cache" (
    rd /s /q "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Cache" 2>nul
)

rem Edge
if exist "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Cache" (
    rd /s /q "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Cache" 2>nul
)

echo.
echo ========================================
echo Cleanup complete!
echo ========================================
pause
endlocal
```

Каталог `C:\Windows\Prefetch` у такі скрипти свідомо не включено, хоча в інтернеті його часто радять чистити «для прискорення». Файли `.pf` — це записи про те, які частини програм читаються під час запуску; Windows використовує їх, щоб наперед підвантажувати потрібне з диска. Видаливши їх, ви змусите систему заново все це вивчати — і найближчі кілька запусків програм стануть **повільнішими**, а не швидшими.

### 3. Моніторинг сервера

```batch
@echo off
setlocal

set SERVER=192.168.1.1
set LOG_FILE=ping_log_%DATE:~6,4%%DATE:~3,2%%DATE:~0,2%.txt
set INTERVAL=60

echo Monitoring %SERVER%... (Ctrl+C to stop)
echo Started: %DATE% %TIME% >> %LOG_FILE%
echo.

:loop
ping -n 1 %SERVER% | find "TTL=" >nul
if %ERRORLEVEL% EQU 0 (
    set STATUS=[OK]
    set MESSAGE=is UP
) else (
    set STATUS=[FAIL]
    set MESSAGE=is DOWN
)

echo %DATE% %TIME% - %STATUS% %SERVER% %MESSAGE%
echo %DATE% %TIME% - %STATUS% %SERVER% %MESSAGE% >> %LOG_FILE%

timeout /t %INTERVAL% /nobreak >nul
goto loop
```

Чому перевіряється рядок `TTL=`, а не просто код повернення `ping`? Бо на відповідь маршрутизатора «Destination host unreachable» ping теж повертає 0 — формально відповідь є. А `TTL=` є лише у справжній відповіді від самого хоста.

### 4. Меню з підтвердженням

```batch
@echo off
setlocal enabledelayedexpansion

:menu
cls
echo ========================================
echo       FILE OPERATIONS MENU
echo ========================================
echo.
echo  [1] List files in current directory
echo  [2] Create new folder
echo  [3] Delete all .tmp files
echo  [4] Show disk space
echo  [5] Exit
echo.
echo ========================================
set "CHOICE="
set /p CHOICE=Enter your choice (1-5):

if "%CHOICE%"=="1" call :list_files
if "%CHOICE%"=="2" call :create_folder
if "%CHOICE%"=="3" call :delete_tmp
if "%CHOICE%"=="4" call :disk_space
if "%CHOICE%"=="5" goto end

goto menu

:list_files
echo.
echo === Files in current directory ===
dir /b /o:n
echo.
pause
goto :eof

:create_folder
set /p FOLDERNAME=Enter folder name:
if "!FOLDERNAME!"=="" (
    echo Error: Name cannot be empty
) else (
    mkdir "!FOLDERNAME!" 2>nul && echo Folder created! || echo Failed to create folder
)
pause
goto :eof

:delete_tmp
set /p CONFIRM=Delete all .tmp files? (Y/N):
if /i "!CONFIRM!"=="Y" (
    del /s /q *.tmp 2>nul
    echo Done!
) else (
    echo Cancelled.
)
pause
goto :eof

:disk_space
echo.
echo === Disk Space ===
powershell -NoProfile -Command "Get-CimInstance Win32_LogicalDisk | Format-Table DeviceID, Size, FreeSpace"
echo.
pause
goto :eof

:end
echo Goodbye!
endlocal
exit /b 0
```

## Delayed Expansion

Стандартне розкриття змінних (`%VAR%`) відбувається при **парсингу** рядка, а не при **виконанні**. Це проблема в циклах та блоках `if`.

```batch
@echo off
setlocal enabledelayedexpansion

rem === Проблема без delayed expansion ===
set COUNT=0
for %%f in (*.txt) do (
    rem %COUNT% розкривається ДО виконання циклу!
    set /a COUNT=%COUNT%+1
    echo %COUNT%: %%f
)
rem Виведе 0, 0, 0... (неправильно)

rem === Рішення з !VAR! ===
set COUNT=0
for %%f in (*.txt) do (
    set /a COUNT=!COUNT!+1
    echo !COUNT!: %%f
)
rem Виведе 1, 2, 3... (правильно)

echo.
echo Total: !COUNT! files

endlocal
```

**Правило**: Використовуйте `!VAR!` замість `%VAR%` всередині циклів та блоків `if/else`, якщо змінна змінюється в тому ж блоці.

## Обробка помилок

```batch
@echo off
setlocal

rem === Перевірка аргументів ===
if "%~1"=="" (
    echo Usage: %~nx0 ^<filename^>
    echo.
    echo Example: %~nx0 document.txt
    exit /b 1
)

rem === Перевірка існування файлу ===
if not exist "%~1" (
    echo Error: File "%~1" not found
    exit /b 2
)

rem === Виконання з перевіркою ===
echo Processing %~1...
copy "%~1" "%~n1_backup%~x1"

if %ERRORLEVEL% NEQ 0 (
    echo Error: Copy failed with code %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)

echo.
echo Success! Backup created: %~n1_backup%~x1
exit /b 0
```

## 🏢 Real World: Як це використовують у великих компаніях

```
┌───────────────────────────────────────────────────────────────────────┐
│                   BATCH SCRIPTING У ENTERPRISE                        │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  АВТОМАТИЗАЦІЯ РОБОЧИХ СТАНЦІЙ                                        │
│  ├── Onboarding: налаштування нових ПК                                │
│  ├── Login scripts: маппінг дисків, змінні                            │
│  └── Logoff: очищення, відключення ресурсів                           │
│                                                                       │
│  BACKUP & DISASTER RECOVERY                                           │
│  ├── Щоденні бекапи: robocopy у Task Scheduler                        │
│  ├── Архівація: Batch + 7-Zip для ротації                             │
│  └── Синхронізація з хмарою: rclone/azcopy                            │
│                                                                       │
│  BUILD & DEPLOYMENT                                                   │
│  ├── Legacy CI/CD: build.bat для C++/Delphi                           │
│  ├── Deployment: копіювання, перезапуск служб                         │
│  └── Pre/Post hooks: частина pipeline                                 │
│                                                                       │
│  МОНІТОРИНГ ТА ОБСЛУГОВУВАННЯ                                         │
│  ├── Health checks: служби, дисковий простір                          │
│  ├── Cleanup: TEMP, кеші, старі логи                                  │
│  └── Restart: планові перезавантаження                                │
│                                                                       │
│  ІНТЕГРАЦІЯ З LEGACY СИСТЕМАМИ                                        │
│  ├── Виробництво: комунікація зі старими системами                    │
│  ├── Банки: обробка транзакційних файлів                              │
│  └── Держустанови: scripts з 1990-х років                             │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## 💼 Career Spotlight

```
┌───────────────────────────────────────────────────────────────────────┐
│                       КАР'ЄРНІ МОЖЛИВОСТІ                             │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  WINDOWS SYSTEM ADMINISTRATOR                                         │
│  ├── Зарплата: $50K-$90K (USA) | €45K-€80K (EU)                       │
│  ├── Навички: Batch, PowerShell, Group Policy, Tasks                  │
│  └── Де потрібно: компанії з Windows інфраструктурою                  │
│                                                                       │
│  IT SUPPORT ENGINEER (Level 2/3)                                      │
│  ├── Зарплата: $40K-$70K (USA) | €35K-€60K (EU)                       │
│  ├── Навички: Scripting для автоматизації                             │
│  └── Шлях: Support → SysAdmin → DevOps                                │
│                                                                       │
│  BUILD/RELEASE ENGINEER                                               │
│  ├── Зарплата: $60K-$100K (USA) | €50K-€90K (EU)                      │
│  ├── Навички: Batch/PowerShell, build automation, CI/CD               │
│  └── Роботодавці: Software companies, game studios                    │
│                                                                       │
│  AUTOMATION ENGINEER                                                  │
│  ├── Зарплата: $70K-$120K (USA) | €55K-€100K (EU)                     │
│  ├── Навички: Batch, PowerShell, Python                               │
│  └── Сектори: Banking, Manufacturing, Logistics                       │
│                                                                       │
│  LEGACY SYSTEMS SPECIALIST                                            │
│  ├── Зарплата: $80K-$130K (USA) | €60K-€110K (EU)                     │
│  ├── Навички: Batch, COBOL, mainframe integration                     │
│  └── Попит: банки, страхові компанії                                  │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## 🔗 Корисні ресурси

### Онлайн-практика

| Ресурс | Опис | Посилання |
|--------|------|-----------|
| SS64 Batch Guide | Найповніший довідник batch команд | ss64.com/nt |
| DosTips Forum | Форум експертів batch scripting | dostips.com |
| Rob van der Woude | Колекція batch скриптів та прикладів | robvanderwoude.com |
| Stack Overflow [batch-file] | Питання та відповіді | stackoverflow.com |
| Windows Command Line Blog | Офіційний блог Microsoft | devblogs.microsoft.com/commandline |

## 📋 Cheat Sheet

```
┌───────────────────────────────────────────────────────────────────────┐
│                BATCH SCRIPTING - QUICK REFERENCE                      │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  БАЗОВА СТРУКТУРА                                                     │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │ @echo off                   :: Вимкнути відображення команд    │   │
│  │ setlocal enabledelayedexpansion  :: Локальні змінні + !var!    │   │
│  │ rem Ваш код тут...                                             │   │
│  │ endlocal                                                       │   │
│  │ exit /b 0                   :: Завершити з кодом 0             │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ЗМІННІ                                                               │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │ set VAR=value              :: Присвоєння                       │   │
│  │ set /a NUM=5+3             :: Арифметика                       │   │
│  │ set /p INPUT=Prompt:       :: Введення користувача             │   │
│  │ echo %VAR%                 :: Використання                     │   │
│  │ echo !VAR!                 :: Delayed expansion (у циклах)     │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  УМОВИ (IF)                                                           │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │ if "%VAR%"=="value" (...)           :: Рядкове порівняння      │   │
│  │ if %NUM% GTR 10 (...)               :: Більше (числове)        │   │
│  │ if %NUM% LSS 10 (...)               :: Менше                   │   │
│  │ if exist "file.txt" (...)           :: Файл існує              │   │
│  │ if defined VAR (...)                :: Змінна визначена        │   │
│  │ if /i "%A%"=="%B%" (...)            :: Case-insensitive        │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ЦИКЛИ (FOR)                                                          │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │ for %%a in (A B C) do echo %%a       :: Список значень         │   │
│  │ for %%f in (*.txt) do echo %%f       :: Файли за шаблоном      │   │
│  │ for /l %%i in (1,1,10) do echo %%i   :: Числовий (1 до 10)     │   │
│  │ for /r %%f in (*.log) do echo %%f    :: Рекурсивно             │   │
│  │ for /f %%a in (file.txt) do echo %%a :: Рядки з файлу          │   │
│  │ for /f "tokens=1,2 delims=," %%a in (data.csv) do ...          │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  МОДИФІКАТОРИ ПАРАМЕТРІВ                                              │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │ %~f1  → Повний шлях      %~d1  → Диск (C:)                     │   │
│  │ %~p1  → Шлях             %~n1  → Ім'я файлу                    │   │
│  │ %~x1  → Розширення       %~z1  → Розмір                        │   │
│  │ %~dp0 → Каталог скрипта                                        │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  КОРИСНІ КОМАНДИ                                                      │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │ call :function arg1 arg2  :: Виклик функції                    │   │
│  │ goto :label               :: Перехід до мітки                  │   │
│  │ pause                     :: Пауза                             │   │
│  │ timeout /t 5              :: Затримка 5 сек                    │   │
│  │ exit /b %ERRORLEVEL%      :: Вихід з кодом помилки             │   │
│  │ cmd && echo OK || echo FAIL :: Умовне виконання                │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## 🎯 Міні-проект (30 хв)

### Завдання: Створення Daily Backup Automation Tool

Створіть повноцінний batch-скрипт для автоматизації щоденного резервного копіювання з логуванням та email-сповіщеннями (симуляція).

**Кроки:**

1. Створіть директорію для проекту:
```cmd
md %USERPROFILE%\BackupTool
cd %USERPROFILE%\BackupTool
```

2. Створіть основний файл `daily-backup.bat`:
```batch
@echo off
setlocal enabledelayedexpansion

rem ============================================
rem  DAILY BACKUP TOOL
rem  Автоматичне резервне копіювання
rem ============================================

title Daily Backup Tool v1.0
color 0A

rem === КОНФІГУРАЦІЯ ===
set SOURCE_DIR=%USERPROFILE%\Documents
set BACKUP_ROOT=%USERPROFILE%\Backups
set LOG_DIR=%BACKUP_ROOT%\logs

rem === Створення timestamp незалежно від локалі ===
for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd_HHmm"') do (
    set "TIMESTAMP=%%i"
)
set BACKUP_DIR=%BACKUP_ROOT%\backup_%TIMESTAMP%
set LOG_FILE=%LOG_DIR%\backup_%TIMESTAMP%.log

rem === Підготовка ===
if not exist "%BACKUP_ROOT%" mkdir "%BACKUP_ROOT%"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

echo ========================================
echo    DAILY BACKUP TOOL
echo    %DATE% %TIME%
echo ========================================
echo.
echo Source: %SOURCE_DIR%
echo Destination: %BACKUP_DIR%
echo Log: %LOG_FILE%
echo.
```

3. Додайте функцію логування та копіювання:
```batch
rem === Функція логування ===
call :log "Backup started"
call :log "Source: %SOURCE_DIR%"
call :log "Destination: %BACKUP_DIR%"

rem === Перевірка джерела ===
if not exist "%SOURCE_DIR%" (
    call :log "ERROR: Source directory not found!"
    color 0C
    echo ERROR: Source directory not found!
    goto :error_exit
)

rem === Виконання бекапу ===
echo Starting backup...
call :log "Copying files..."

robocopy "%SOURCE_DIR%" "%BACKUP_DIR%" /e /r:3 /w:5 /np /log+:"%LOG_FILE%" /tee

set ROBOCOPY_EXIT=%ERRORLEVEL%
```

4. Додайте аналіз результатів:
```batch
rem === Аналіз результату robocopy ===
rem Коди 0-7 = успіх (різні комбінації прапорців), 8 і вище = помилки
if %ROBOCOPY_EXIT% LSS 8 (
    call :log "Backup completed successfully"
    color 0A
    echo.
    echo ========================================
    echo    BACKUP COMPLETED SUCCESSFULLY
    echo ========================================

    rem Підрахунок файлів
    set /a FILE_COUNT=0
    for /r "%BACKUP_DIR%" %%f in (*) do set /a FILE_COUNT+=1

    call :log "Files backed up: !FILE_COUNT!"
    echo Files backed up: !FILE_COUNT!

    rem Розмір бекапу (рядок підсумку dir англійською; на українській
    rem Windows замість "File(s)" шукайте "Файлів")
    for /f "tokens=3" %%a in ('dir "%BACKUP_DIR%" /s ^| findstr "File(s)"') do (
        set BACKUP_SIZE=%%a
    )
    call :log "Backup size: !BACKUP_SIZE! bytes"
    echo Backup size: !BACKUP_SIZE! bytes

) else (
    call :log "ERROR: Backup failed with code %ROBOCOPY_EXIT%"
    color 0C
    echo.
    echo ========================================
    echo    BACKUP FAILED - Check log file
    echo ========================================
)
```

5. Додайте функції та завершення:
```batch
rem === Очищення старих бекапів (старше 7 днів) ===
echo.
echo Cleaning old backups (older than 7 days)...
rem /m "backup_*" — лише каталоги копій, щоб випадково не зачепити logs
forfiles /p "%BACKUP_ROOT%" /m "backup_*" /d -7 /c "cmd /c if @isdir==TRUE rd /s /q @path" 2>nul
call :log "Old backups cleaned"

goto :end

rem ========================================
rem ФУНКЦІЇ
rem ========================================

:log
echo [%DATE% %TIME%] %~1 >> "%LOG_FILE%"
goto :eof

:error_exit
call :log "Backup terminated with errors"
pause
endlocal
exit /b 1

:end
call :log "Backup process finished"
echo.
echo Log file: %LOG_FILE%
echo.
pause
endlocal
exit /b 0
```

6. Збережіть файл та протестуйте:
```cmd
rem Збережіть весь код у файл daily-backup.bat
rem Запустіть для тестування:
daily-backup.bat
```

7. (Опціонально) Додайте до планувальника завдань:
```cmd
rem Створити щоденне завдання о 22:00
schtasks /create /tn "Daily Backup" /tr "%USERPROFILE%\BackupTool\daily-backup.bat" /sc daily /st 22:00
```

Перед цим приберіть зі скрипта обидва `pause`: у запуску за розкладом натиснути клавішу нікому, і завдання «висітиме» вічно, заважаючи наступним запускам.

**Очікуваний результат:**
Batch-скрипт `daily-backup.bat`, який:
- Створює резервну копію Documents з timestamp
- Веде детальний лог операцій
- Очищує старі бекапи (>7 днів)
- Показує статистику (кількість файлів, розмір)

**Бонус (для допитливих):**
- Додайте стиснення бекапів через 7-Zip (`7z a backup.zip folder`)
- Додайте відправку email при помилках (PowerShell з batch)
- Створіть конфігураційний файл `config.ini` для налаштувань

## Тест для самоперевірки

Десять запитань, у кожному одна правильна відповідь. Якщо тема винесена вашій групі на самостійне опрацювання, цей самий тест публікується в Google Classroom — 10 балів, по одному за кожне запитання.

**1.** З якого рядка прийнято починати batch-файл?

- rem start
- setlocal
- exit /b 0
- @echo off

**2.** Чим `!VAR!` відрізняється від `%VAR%`?

- `%VAR%` застосовують у PowerShell, а `!VAR!` у CMD
- різниці немає, це синоніми
- `!VAR!` працює лише зі змінними середовища
- значення `!VAR!` обчислюється під час виконання, тому воно потрібне всередині циклів

**3.** Яка команда вмикає відкладене розгортання змінних?

- echo on
- set /a delayedexpansion=1
- setlocal enabledelayedexpansion
- call :delayed

**4.** Як виконати арифметичну дію в batch-файлі?

- calc NUM=5+3
- echo 5+3
- set NUM=5+3
- set /a NUM=5+3

**5.** Що робить конструкція `for /l %%i in (1,1,10) do ...`?

- виконує цикл із лічильником від 1 до 10 з кроком 1
- перебирає файли поточного каталогу
- рекурсивно обходить підкаталоги
- читає рядки з файлу

**6.** Яка форма циклу читає рядки з файлу?

- for /l
- for /f
- for /r
- for /d

**7.** Що містить змінна `%ERRORLEVEL%`?

- шлях до журналу помилок
- код завершення останньої виконаної команди
- текст останнього повідомлення про помилку
- кількість помилок за весь сеанс

**8.** Що означає модифікатор `%~dp0`?

- каталог, у якому лежить сам скрипт
- диск, на якому запущено систему
- розмір першого параметра
- ім'я скрипта без розширення

**9.** Навіщо потрібні `setlocal` і `endlocal`?

- щоб зміни змінних не виходили за межі скрипта
- щоб перевірити права адміністратора
- щоб дозволити виклик функцій
- щоб вимкнути виведення команд на екран

**10.** Що зробить рядок `команда && echo OK || echo FAIL`?

- виконає команду двічі
- виведе OK, якщо команда завершилася успішно, і FAIL, якщо ні
- перенаправить помилки у файл
- виведе обидва повідомлення послідовно

## Підсумок

| Конструкція | Синтаксис |
|-------------|-----------|
| **Змінна** | `set VAR=value`, `%VAR%` |
| **Введення** | `set /p VAR=Prompt: ` |
| **Арифметика** | `set /a RESULT=5+3` |
| **Умова** | `if "%VAR%"=="value" (...)` |
| **Існування файлу** | `if exist "file" (...)` |
| **Визначена змінна** | `if defined VAR (...)` |
| **Цикл по списку** | `for %%a in (...) do (...)` |
| **Числовий цикл** | `for /l %%i in (start,step,end) do` |
| **Цикл по файлах** | `for /r %%f in (*.txt) do` |
| **Цикл по вмісту** | `for /f %%a in (file.txt) do` |
| **Мітка** | `:label` |
| **Перехід** | `goto :label` |
| **Функція** | `call :function args` |
| **Коментар** | `rem text` або `:: text` — лише з початку рядка; у блоках `( )` — тільки `rem` |

**Поради для надійних скриптів:**
1. Завжди починайте з `@echo off`
2. Використовуйте `setlocal` для ізоляції змінних
3. Лапки навколо шляхів: `"%USERPROFILE%\file.txt"`
4. Перевіряйте `%ERRORLEVEL%` після критичних операцій
5. Додавайте `pause` для інтерактивних скриптів
6. Використовуйте `enabledelayedexpansion` для циклів
7. Для складної логіки — розгляньте PowerShell

На наступній лекції розглянемо операційну систему Linux.
