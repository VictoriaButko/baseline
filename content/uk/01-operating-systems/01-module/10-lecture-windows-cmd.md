---
title: "Командний режим роботи в ОС Windows"
type: lecture
order: 10
preview: "cmd.exe, PowerShell, базові команди."
---

## Навіщо командний рядок, коли є GUI?

Багато адміністративних задач неможливо або незручно виконувати через графічний інтерфейс:

| Задача | GUI | CLI |
|--------|-----|-----|
| Перейменувати 1000 файлів за шаблоном | Годинами вручну | 1 команда |
| Щоденний бекап о 3:00 ночі | Складно | Планувальник + скрипт |
| Керування сервером без GUI | Неможливо | SSH/RDP + команди |
| Повторити дію 100 разів | Вручну | Цикл у скрипті |
| Задокументувати процедуру | Скріншоти | Текстовий файл |

Windows має два основних інтерпретатори командного рядка: **CMD** (класичний) та **PowerShell** (сучасний).

## CMD vs PowerShell

```
┌───────────────────────────────────────────────────────────────────┐
│                         CMD vs POWERSHELL                         │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│   CMD (cmd.exe)                    PowerShell                     │
│   ═══════════════                  ══════════════════             │
│                                                                   │
│   • Предок — COMMAND.COM з         • З 2006 року                  │
│     MS-DOS (1981); cmd.exe —       • powershell.exe — Windows     │
│     з OS/2 (1987) і NT (1993)        PowerShell 5.1 (входить в ОС)│
│   • Текстові команди               • pwsh.exe — PowerShell 7,     │
│   • Обмежені можливості              кросплатформний (з версії 6) │
│   • Batch-файли (.bat, .cmd)       • Повний доступ до .NET        │
│   • Сумісність зі старими          • Скрипти (.ps1)               │
│     скриптами                                                     │
│                                                                   │
│   ┌─────────────────────┐          ┌──────────────────────┐       │
│   │ C:\> dir            │          │ PS C:\> Get-ChildItem│       │
│   │ C:\> copy file.txt  │          │ PS C:\> Copy-Item    │       │
│   │ C:\> del *.tmp      │          │ PS C:\> Remove-Item  │       │
│   └─────────────────────┘          └──────────────────────┘       │
│                                                                   │
│   Pipeline:                        Pipeline:                      │
│   • Передає ТЕКСТ                  • Передає ОБ'ЄКТИ              │
│   • Парсити вручну                 • Властивості/методи           │
│                                                                   │
│   Висновок:                                                       │
│   CMD — для простих задач та legacy скриптів                      │
│   PowerShell — для всього іншого (основний інструмент)            │
└───────────────────────────────────────────────────────────────────┘
```

## Запуск командного рядка

```
┌────────────────────────────────────────────────────────────────┐
│                    СПОСОБИ ЗАПУСКУ                             │
│                                                                │
│   CMD:                                                         │
│   • Win+R → cmd → Enter                                        │
│   • Пошук → "cmd" або "Command Prompt"                         │
│   • Win+X → Terminal (або Terminal Admin)                      │
│   • File Explorer → адресна строка → cmd                       │
│                                                                │
│   PowerShell:                                                  │
│   • Win+R → powershell → Enter                                 │
│   • Win+R → pwsh → Enter (PowerShell 7)                        │
│   • Пошук → "PowerShell" або "pwsh"                            │
│   • Win+X → Terminal                                           │
│                                                                │
│   Windows Terminal (рекомендовано):                            │
│   • Об'єднує CMD, PowerShell, WSL в одному вікні               │
│   • Вкладки, split-панелі, теми                                │
│   • Налаштування через JSON або GUI                            │
│   • Ctrl+Shift+1/2/3 — різні профілі                           │
│                                                                │
│   Запуск з правами адміністратора:                             │
│   • Ctrl+Shift+Enter замість Enter                             │
│   • Правий клік → "Run as administrator"                       │
│   • Win+X → Terminal (Admin)                                   │
└────────────────────────────────────────────────────────────────┘
```

### Windows Terminal

**Windows Terminal** — сучасний термінальний емулятор від Microsoft. Рекомендований спосіб роботи з CLI.

```
┌────────────────────────────────────────────────────────────────┐
│                    WINDOWS TERMINAL                            │
│                                                                │
│   ┌───────────────────────────────────────────────────────┐    │
│   │ PowerShell │ CMD │ Ubuntu │ + │                  ─ □ ×│    │
│   ├───────────────────────────────────────────────────────┤    │
│   │ PS C:\Users\Student>                                  │    │
│   │                                                       │    │
│   │                                                       │    │
│   │                                                       │    │
│   └───────────────────────────────────────────────────────┘    │
│                                                                │
│   Гарячі клавіші:                                              │
│   • Ctrl+Shift+T — нова вкладка (default profile)              │
│   • Ctrl+Shift+1/2/3 — вкладка з профілем 1/2/3                │
│   • Ctrl+Shift+D — дублювати вкладку                           │
│   • Alt+Shift+D — дублювати панель поруч                       │
│   • Alt+Shift++ — поділити вертикально                         │
│   • Alt+Shift+- — поділити горизонтально                       │
│   • Ctrl+Shift+W — закрити панель                              │
│   • Ctrl+Tab — наступна вкладка                                │
│   • Ctrl+Shift+P — command palette                             │
│   • Ctrl+, — налаштування                                      │
└────────────────────────────────────────────────────────────────┘
```

## Базові команди CMD

### Навігація файловою системою

```
┌─────────────────────────────────────────────────────────────────┐
│                    НАВІГАЦІЯ В CMD                              │
│                                                                 │
│   C:\Users\Student> cd Desktop                                  │
│   C:\Users\Student\Desktop> cd ..                               │
│   C:\Users\Student> cd \                                        │
│   C:\> cd "Program Files"                                       │
│   C:\Program Files> D:                  ← Зміна диска           │
│   D:\> cd /d C:\Users                   ← Зміна диска і каталогу│
│   C:\Users>                                                     │
└─────────────────────────────────────────────────────────────────┘
```

| Команда | Опис | Приклад |
|---------|------|---------|
| `cd` | Змінити каталог | `cd Desktop` |
| `cd ..` | Перейти на рівень вище | `cd ..` |
| `cd \` | Перейти до кореня диску | `cd \` |
| `cd /d D:\` | Змінити диск і каталог | `cd /d D:\Data` |
| `D:` | Змінити диск (без cd) | `D:` |
| `dir` | Показати вміст каталогу | `dir /a` |
| `tree` | Показати дерево каталогів | `tree /f` |
| `pushd` | Зберегти поточний каталог | `pushd D:\temp` |
| `popd` | Повернутися до збереженого | `popd` |

У списках нижче пояснення стоять після `::` — лише для вас, вводити їх не треба. Коментарем `::` є тільки на початку рядка; посеред рядка це звичайні символи, і `dir /a :: приховані` передасть команді dir зайві аргументи. Щоб додати коментар після команди, пишуть `& rem`: `dir /a & rem приховані`.

```cmd
:: Практичні приклади dir
dir                     :: Вміст поточного каталогу
dir /a                  :: + приховані та системні файли
dir /a:h                :: Тільки приховані
dir /a:d                :: Тільки каталоги
dir /s                  :: Рекурсивно (всі підкаталоги)
dir /s *.txt            :: Пошук файлів рекурсивно
dir /o:n                :: Сортувати за іменем
dir /o:d                :: Сортувати за датою
dir /o:-s               :: Сортувати за розміром (спадання)
dir /o:e                :: Сортувати за розширенням
dir /b                  :: Тільки імена (bare format)
dir /w                  :: Широкий формат

:: Дерево каталогів
tree                    :: Тільки каталоги
tree /f                 :: + файли
tree /a                 :: ASCII-символи (для терміналів)
```

### Робота з файлами та каталогами

| Команда | Опис | Приклад |
|---------|------|---------|
| `copy` | Копіювати файл | `copy file.txt backup.txt` |
| `xcopy` | Копіювати з підкаталогами | `xcopy /s source dest` |
| `robocopy` | Надійне копіювання | `robocopy src dst /mir` |
| `move` | Перемістити/перейменувати | `move old.txt new.txt` |
| `del` | Видалити файл | `del *.tmp` |
| `erase` | Синонім del | `erase file.txt` |
| `rd` / `rmdir` | Видалити каталог | `rd /s /q folder` |
| `md` / `mkdir` | Створити каталог | `md newfolder` |
| `ren` | Перейменувати | `ren old.txt new.txt` |
| `attrib` | Атрибути файлу | `attrib +h file.txt` |

```cmd
:: Копіювання
copy file.txt D:\backup\            :: Копіювати на інший диск
copy *.jpg photos\                  :: Копіювати всі jpg
copy file1.txt+file2.txt combined.txt  :: Об'єднати файли
copy /y file.txt backup.txt         :: Без підтвердження перезапису

:: xcopy (потужніший copy)
xcopy /s source\ dest\              :: Копіювати з підкаталогами
xcopy /e source\ dest\              :: + порожні каталоги
xcopy /h source\ dest\              :: + приховані файли
xcopy /y source\ dest\              :: Без підтвердження

:: robocopy (рекомендований для backup)
robocopy C:\source D:\dest          :: Базове копіювання
robocopy src dst /mir               :: Mirror (sync)
robocopy src dst /mov               :: Перемістити (не копіювати)
robocopy src dst /e                 :: + порожні каталоги
robocopy src dst /z                 :: Restartable mode
robocopy src dst /mt:8              :: Багатопоточність (8 потоків)
robocopy src dst /log:copy.log      :: Логування

:: Видалення
del file.txt                        :: Видалити файл
del /q *.tmp                        :: Без підтвердження
del /s *.tmp                        :: Рекурсивно
del /f file.txt                     :: Force (read-only файли)
del /a:h *.txt                      :: Приховані файли

:: Увага: del і rd видаляють остаточно — повз Кошик. Відновити
:: так видалені файли штатними засобами Windows неможливо.

:: Каталоги
md "New Folder"                     :: Створити каталог
md a\b\c                            :: Створити вкладені
rd folder                           :: Видалити порожній каталог
rd /s folder                        :: З вмістом (з підтвердженням)
rd /s /q folder                     :: Без підтвердження

:: Атрибути
attrib file.txt                     :: Показати атрибути
attrib +h file.txt                  :: Зробити прихованим
attrib -h file.txt                  :: Зняти прихований
attrib +r file.txt                  :: Read-only
attrib +s file.txt                  :: System
```

### Перегляд та редагування файлів

```cmd
:: Показати вміст файлу
type file.txt

:: Посторінковий перегляд
more file.txt
type file.txt | more

:: Пошук тексту у файлі
find "error" logfile.txt
find /i "error" logfile.txt         :: Case-insensitive
find /c "error" logfile.txt         :: Тільки кількість

:: Розширений пошук (регулярні вирази)
findstr "error" *.log
findstr /i "error" *.log            :: Case-insensitive
findstr /r "error.*warning" *.log   :: Regex
findstr /s "pattern" *.txt          :: Рекурсивно
findstr /n "pattern" file.txt       :: З номерами рядків

:: Редагування
notepad file.txt                    :: Блокнот
notepad++ file.txt                  :: Notepad++ (якщо встановлено)
code file.txt                       :: VS Code (якщо встановлено)

:: Створення файлу
echo Hello > file.txt               :: Створити/перезаписати
echo World >> file.txt              :: Дописати в кінець
copy con file.txt                   :: Введення з клавіатури (Ctrl+Z для збереження)
type nul > empty.txt                :: Створити порожній файл
```

### Інформація про систему

```cmd
:: Системна інформація
systeminfo                          :: Повна інформація
systeminfo | findstr /c:"OS"        :: Тільки OS
hostname                            :: Ім'я комп'ютера
whoami                              :: Поточний користувач
whoami /groups                      :: Групи користувача
ver                                 :: Версія Windows
winver                              :: GUI версії

:: Мережа
ipconfig                            :: IP-адреси (коротко)
ipconfig /all                       :: Детально
ipconfig /release                   :: Звільнити DHCP
ipconfig /renew                     :: Оновити DHCP
ipconfig /flushdns                  :: Очистити DNS кеш

ping google.com                     :: Перевірка з'єднання
ping -t google.com                  :: Безперервний ping (Ctrl+C для зупинки)
ping -n 10 google.com               :: 10 пакетів

tracert google.com                  :: Маршрут до хоста
pathping google.com                 :: Детальний tracert

netstat -an                         :: Активні з'єднання
netstat -b                          :: + програми (потрібен адмін)
netstat -o                          :: + PID

nslookup google.com                 :: DNS-запит
nslookup -type=mx gmail.com         :: MX записи

:: Процеси
tasklist                            :: Список процесів
tasklist /v                         :: Детально
tasklist | findstr "chrome"         :: Знайти процес
tasklist /svc                       :: Служби в процесах

taskkill /im notepad.exe            :: Завершити за іменем
taskkill /pid 1234                  :: Завершити за PID
taskkill /f /im app.exe             :: Force kill

:: Служби
sc query                            :: Список служб
sc query wuauserv                   :: Статус конкретної служби
net start                           :: Запущені служби
net start "Service Name"            :: Запустити службу
net stop "Service Name"             :: Зупинити службу
```

## Базові команди PowerShell

### Концепція Cmdlet

PowerShell використовує команди у форматі **Verb-Noun** (Дієслово-Іменник):

```
┌────────────────────────────────────────────────────────────────┐
│                    СТРУКТУРА CMDLET                            │
│                                                                │
│   Get-Process                                                  │
│   ├── Get      ← Дієслово (що робити)                          │
│   └── Process  ← Іменник (з чим)                               │
│                                                                │
│   Типові дієслова:                                             │
│   ────────────────                                             │
│   • Get     — отримати інформацію                              │
│   • Set     — змінити значення                                 │
│   • New     — створити новий об'єкт                            │
│   • Remove  — видалити                                         │
│   • Start   — запустити                                        │
│   • Stop    — зупинити                                         │
│   • Copy    — копіювати                                        │
│   • Move    — перемістити                                      │
│   • Test    — перевірити                                       │
│   • Invoke  — виконати                                         │
│   • Export  — експортувати                                     │
│   • Import  — імпортувати                                      │
│                                                                │
│   Приклади:                                                    │
│   Get-Service      Set-Location      New-Item                  │
│   Get-Process      Set-Content       Remove-Item               │
│   Get-ChildItem    Set-Variable      Start-Process             │
└────────────────────────────────────────────────────────────────┘
```

### Еквіваленти CMD → PowerShell

| CMD | PowerShell | Аліаси |
|-----|------------|--------|
| `dir` | `Get-ChildItem` | `ls`, `dir`, `gci` |
| `cd` | `Set-Location` | `cd`, `sl`, `chdir` |
| `copy` | `Copy-Item` | `cp`, `copy`, `cpi` |
| `move` | `Move-Item` | `mv`, `move`, `mi` |
| `del` | `Remove-Item` | `rm`, `del`, `ri` |
| `md` | `New-Item -Type Directory` | `mkdir` |
| `type` | `Get-Content` | `cat`, `gc`, `type` |
| `cls` | `Clear-Host` | `clear`, `cls` |
| `echo` | `Write-Output` | `echo`, `write` |

### Навігація та перегляд

```powershell
# Навігація
Get-Location                        # Поточний каталог (pwd)
Set-Location C:\Users               # Змінити каталог (cd)
Set-Location ..                     # На рівень вище
Push-Location D:\temp               # Зберегти поточний, перейти
Pop-Location                        # Повернутися

# Перегляд каталогу
Get-ChildItem                       # Вміст каталогу (ls)
Get-ChildItem -Hidden               # + приховані
Get-ChildItem -Force                # Всі файли (приховані, системні)
Get-ChildItem -Recurse              # Рекурсивно
Get-ChildItem -Recurse -Filter *.txt    # Фільтр
Get-ChildItem -Directory            # Тільки каталоги
Get-ChildItem -File                 # Тільки файли
Get-ChildItem | Sort-Object Length -Descending  # Сортування

# Alias (скорочення)
ls                                  # = Get-ChildItem
cd ..                               # = Set-Location ..
pwd                                 # = Get-Location
```

### Робота з файлами

```powershell
# Створення
New-Item -Path "file.txt" -ItemType File
New-Item -Path "folder" -ItemType Directory
New-Item -Path "a\b\c" -ItemType Directory -Force   # Вкладені каталоги
"Hello World" | Out-File file.txt
Set-Content file.txt "New content"
Add-Content file.txt "Appended line"

# Читання
Get-Content file.txt
Get-Content file.txt -Head 10       # Перші 10 рядків
Get-Content file.txt -Tail 5        # Останні 5 рядків
Get-Content file.txt -Wait          # Follow (як tail -f)
Get-Content file.txt | Measure-Object -Line   # Кількість рядків

# Пошук у файлах (grep-аналог)
Select-String "error" *.log
Select-String -Pattern "error" -Path *.log -CaseSensitive
Select-String -Pattern "error|warning" -Path *.log   # Regex

# Копіювання/переміщення
Copy-Item file.txt backup.txt
Copy-Item folder -Recurse newfolder
Copy-Item *.txt D:\backup\
Move-Item old.txt new.txt

# Видалення
Remove-Item file.txt
Remove-Item folder -Recurse -Force  # Каталог з вмістом
Remove-Item *.tmp                   # За шаблоном
```

### Pipeline — потужність PowerShell

```
┌────────────────────────────────────────────────────────────────┐
│                    PIPELINE (КОНВЕЄР)                          │
│                                                                │
│   CMD pipeline передає ТЕКСТ:                                  │
│   ─────────────────────────────                                │
│   dir | find "txt"                                             │
│   "file.txt" — просто рядок символів                           │
│   Парсити вручну, легко помилитися                             │
│                                                                │
│   PowerShell pipeline передає ОБ'ЄКТИ:                         │
│   ────────────────────────────────────                         │
│   Get-ChildItem | Where-Object {$_.Length -gt 1MB}             │
│                                                                │
│   Кожен елемент — об'єкт з властивостями:                      │
│   • Name         — ім'я файлу                                  │
│   • Length       — розмір у байтах                             │
│   • LastWriteTime — дата модифікації                           │
│   • FullName     — повний шлях                                 │
│   • Extension    — розширення                                  │
│                                                                │
│   Це дозволяє:                                                 │
│   • Фільтрувати за будь-якою властивістю                       │
│   • Сортувати                                                  │
│   • Групувати                                                  │
│   • Обчислювати                                                │
│   • Форматувати вивід                                          │
└────────────────────────────────────────────────────────────────┘
```

```powershell
# Приклади pipeline
# Топ-5 процесів за CPU
Get-Process | Sort-Object CPU -Descending | Select-Object -First 5

# Файли більше 10 МБ
Get-ChildItem -Recurse | Where-Object {$_.Length -gt 10MB} |
    Select-Object FullName, @{N='MB';E={[math]::Round($_.Length/1MB,2)}}

# Кількість запущених служб
Get-Service | Where-Object Status -eq "Running" | Measure-Object

# Останні помилки з журналу System (Level 2 = Error).
# Старий Get-EventLog є лише у Windows PowerShell 5.1, у PowerShell 7 його немає
Get-WinEvent -FilterHashtable @{ LogName = 'System'; Level = 2 } -MaxEvents 100 |
    Group-Object ProviderName |
    Sort-Object Count -Descending

# Експорт у CSV
Get-Process | Select-Object Name, CPU, WorkingSet |
    Export-Csv processes.csv -NoTypeInformation

# Конвертація в JSON
Get-Process | Select-Object Name, CPU | ConvertTo-Json
```

### Системна інформація

```powershell
# Комп'ютер
Get-ComputerInfo
Get-ComputerInfo | Select-Object WindowsProductName, OsVersion
$env:COMPUTERNAME
$env:USERNAME

# Процеси
Get-Process
Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 10
Get-Process -Name "chrome"
Stop-Process -Name "notepad" -Force
Start-Process notepad.exe
Start-Process "https://google.com"   # Відкрити URL

# Служби
Get-Service
Get-Service | Where-Object Status -eq "Running"
Get-Service -Name "Spooler"
Start-Service -Name "Spooler"
Stop-Service -Name "Spooler"
Restart-Service -Name "Spooler"

# Мережа
Get-NetIPAddress
Get-NetAdapter
Get-NetTCPConnection | Where-Object State -eq "Established"
Test-Connection google.com
Test-NetConnection google.com -Port 443
Resolve-DnsName google.com
```

### Довідка

```powershell
# Отримати довідку
Get-Help Get-Process
Get-Help Get-Process -Full
Get-Help Get-Process -Examples
Get-Help Get-Process -Online          # Відкрити в браузері
Get-Help *process*                    # Пошук команд

# Оновити довідку (потрібні права адміна)
Update-Help

# Список всіх команд
Get-Command
Get-Command -Verb Get
Get-Command -Noun Process
Get-Command *file*

# Властивості об'єкта
Get-Process | Get-Member
Get-Service | Get-Member -MemberType Property
```

## Змінні середовища

```
┌────────────────────────────────────────────────────────────────┐
│                    ЗМІННІ СЕРЕДОВИЩА                           │
│                                                                │
│   Системні (для всіх):             Користувача:                │
│   • PATH                           • USERPROFILE               │
│   • COMPUTERNAME                   • APPDATA                   │
│   • OS                             • LOCALAPPDATA              │
│   • SYSTEMROOT                     • TEMP / TMP                │
│   • WINDIR                         • HOMEPATH                  │
│                                                                │
│   PATH — список каталогів для пошуку програм:                  │
│   C:\Windows\System32;C:\Windows;C:\Python310;...              │
│   Повний PATH = системний PATH + PATH користувача              │
│                                                                │
│   Коли ви вводите "python", Windows шукає python.exe           │
│   в кожному каталозі з PATH по порядку                         │
└────────────────────────────────────────────────────────────────┘
```

```cmd
:: CMD
echo %PATH%
echo %USERPROFILE%
echo %TEMP%

set                                 :: Всі змінні
set PATH                            :: Змінні, що починаються з PATH

set MYVAR=Hello                     :: Встановити (тимчасово)
echo %MYVAR%

:: Додати до PATH тимчасово
set PATH=%PATH%;C:\MyProgram

:: Постійно — через GUI:
:: System Properties → Environment Variables
:: або команда setx (постійно):
setx MYVAR "Hello"                  :: Для користувача
setx MYVAR "Hello" /m               :: Системна (потрібен адмін)
```

Одна пастка, на яку натрапляють майже всі: **не додавайте до PATH командою `setx PATH "%PATH%;C:\MyProgram"`**. `%PATH%` у поточному вікні — це вже *злиті* системний і користувацький PATH, тож усе разом запишеться в користувацький, а `setx` ще й обріже значення до 1024 символів. Каталоги, що не влізли, мовчки зникнуть. Змінювати PATH назавжди безпечно через «Змінні середовища» у властивостях системи.

```powershell
# PowerShell
$env:PATH
$env:USERPROFILE
$env:TEMP

$env:MYVAR = "Hello"                # Встановити (тимчасово)
$env:MYVAR

# Всі змінні
Get-ChildItem env:
Get-ChildItem env: | Where-Object Name -like "PATH*"

# Додати до PATH
$env:PATH += ";C:\MyProgram"

# Постійно
[Environment]::SetEnvironmentVariable("MYVAR", "Hello", "User")
[Environment]::SetEnvironmentVariable("MYVAR", "Hello", "Machine")  # Системна
```

## Практичне завдання

```cmd
:: CMD
:: 1. Дізнатися версію Windows
ver
:: на українській Windows поля називаються «Назва ОС» і «Версія ОС»
systeminfo | findstr /c:"OS Name" /c:"OS Version"

:: 2. Показати мережеву конфігурацію
ipconfig /all

:: 3. Знайти всі .txt файли в Documents
dir %USERPROFILE%\Documents\*.txt /s

:: 4. Створити структуру каталогів
md project\src project\docs project\tests

:: 5. Ping з логуванням
ping -n 5 google.com > ping_log.txt
```

```powershell
# PowerShell
# 1. Топ-5 процесів за пам'яттю
Get-Process | Sort-Object WorkingSet -Descending |
    Select-Object -First 5 Name, @{N='MB';E={[math]::Round($_.WorkingSet/1MB)}}

# 2. Запущені служби
Get-Service | Where-Object Status -eq Running | Measure-Object

# 3. Файли більше 100 МБ в профілі
Get-ChildItem $env:USERPROFILE -Recurse -ErrorAction SilentlyContinue |
    Where-Object {$_.Length -gt 100MB} |
    Select-Object FullName, @{N='MB';E={[math]::Round($_.Length/1MB)}}

# 4. Історія команд
Get-History

# 5. Версія PowerShell
$PSVersionTable
```

## 🏢 Real World: Як це використовують у великих компаніях

```
┌───────────────────────────────────────────────────────────────────────┐
│                  CMD/POWERSHELL У ENTERPRISE                          │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  АВТОМАТИЗАЦІЯ IT OPERATIONS                                          │
│  ├── Microsoft (Azure): PowerShell DSC для серверів                   │
│  ├── Банки: Scheduled tasks для бекапів                               │
│  └── Телеком: PowerShell моніторинг 24/7                              │
│                                                                       │
│  DEVOPS & CI/CD                                                       │
│  ├── Azure DevOps: PowerShell tasks для deployment                    │
│  ├── GitHub Actions: pwsh на Windows runners                          │
│  └── Jenkins: Batch/PowerShell для build agents                       │
│                                                                       │
│  SECURITY & COMPLIANCE                                                │
│  ├── SOC Teams: PowerShell для forensics                              │
│  ├── Compliance: Scripts для звітності                                │
│  └── AV компанії: аналіз malware поведінки                            │
│                                                                       │
│  SYSTEM ADMINISTRATION                                                │
│  ├── Active Directory: PowerShell AD module                           │
│  ├── Exchange/M365: bulk операції з mailboxes                         │
│  └── Hyper-V/VMware: VM provisioning                                  │
│                                                                       │
│  LEGACY SYSTEMS                                                       │
│  ├── Виробництво: Batch з 1990-х                                      │
│  └── Логістика: CMD для старих систем                                 │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## 💼 Career Spotlight

```
┌───────────────────────────────────────────────────────────────────────┐
│                       КАР'ЄРНІ МОЖЛИВОСТІ                             │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  POWERSHELL DEVELOPER / AUTOMATION ENGINEER                           │
│  ├── Зарплата: $70K-$130K (USA) | €55K-€100K (EU)                     │
│  ├── Навички: PowerShell advanced, DSC, Azure Automation              │
│  └── Сертифікації: AZ-040, PowerShell certifications                  │
│                                                                       │
│  WINDOWS SYSTEM ADMINISTRATOR                                         │
│  ├── Зарплата: $50K-$90K (USA) | €45K-€80K (EU)                       │
│  ├── Навички: CMD, PowerShell, batch scripting, AD                    │
│  └── Сертифікації: AZ-800, AZ-801                                     │
│                                                                       │
│  DEVOPS ENGINEER (Windows)                                            │
│  ├── Зарплата: $80K-$150K (USA) | €60K-€110K (EU)                     │
│  ├── Навички: PowerShell, Azure DevOps, CI/CD, IaC                    │
│  └── Сертифікації: AZ-400, GitHub certifications                      │
│                                                                       │
│  SECURITY ANALYST / INCIDENT RESPONDER                                │
│  ├── Зарплата: $75K-$140K (USA) | €55K-€100K (EU)                     │
│  ├── Навички: PowerShell forensics, threat hunting, SIEM              │
│  └── Сертифікації: SC-200, SANS GIAC                                  │
│                                                                       │
│  CLOUD ENGINEER (Azure)                                               │
│  ├── Зарплата: $90K-$160K (USA) | €60K-€110K (EU)                     │
│  ├── Навички: Azure PowerShell, Az CLI, ARM templates                 │
│  └── Сертифікації: AZ-104, AZ-305                                     │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## 🔗 Корисні ресурси

### Онлайн-практика

| Ресурс | Опис | Посилання |
|--------|------|-----------|
| PSKoans | Інтерактивне навчання PowerShell через тести | github.com/vexx32/PSKoans |
| Under The Wire | CTF-style PowerShell challenges | underthewire.tech |
| PowerShell.org | Спільнота та форум | powershell.org |
| Microsoft Learn | Офіційні PowerShell модулі | learn.microsoft.com/powershell |
| SS64 | Довідник CMD та PowerShell команд | ss64.com |

## 📋 Cheat Sheet

```
┌───────────────────────────────────────────────────────────────────────┐
│                CMD / POWERSHELL - QUICK REFERENCE                     │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  НАВІГАЦІЯ                                                            │
│  ┌───────────────────────────┬─────────────────────────────────────┐  │
│  │  CMD                      │  PowerShell                         │  │
│  ├───────────────────────────┼─────────────────────────────────────┤  │
│  │  cd folder                │  Set-Location folder (cd)           │  │
│  │  cd /d D:\path            │  cd D:\path                         │  │
│  │  dir                      │  Get-ChildItem (ls, dir)            │  │
│  │  dir /s *.txt             │  ls -Recurse -Filter *.txt          │  │
│  └───────────────────────────┴─────────────────────────────────────┘  │
│                                                                       │
│  ФАЙЛОВІ ОПЕРАЦІЇ                                                     │
│  ┌───────────────────────────┬─────────────────────────────────────┐  │
│  │  CMD                      │  PowerShell                         │  │
│  ├───────────────────────────┼─────────────────────────────────────┤  │
│  │  copy src dst             │  Copy-Item src dst (cp)             │  │
│  │  move src dst             │  Move-Item src dst (mv)             │  │
│  │  del file                 │  Remove-Item file (rm)              │  │
│  │  md folder                │  New-Item -Type Directory           │  │
│  │  type file                │  Get-Content file (cat)             │  │
│  │  echo text > file         │  "text" | Out-File file             │  │
│  └───────────────────────────┴─────────────────────────────────────┘  │
│                                                                       │
│  СИСТЕМНА ІНФОРМАЦІЯ                                                  │
│  ┌───────────────────────────┬─────────────────────────────────────┐  │
│  │  CMD                      │  PowerShell                         │  │
│  ├───────────────────────────┼─────────────────────────────────────┤  │
│  │  systeminfo               │  Get-ComputerInfo                   │  │
│  │  ipconfig /all            │  Get-NetIPAddress                   │  │
│  │  tasklist                 │  Get-Process                        │  │
│  │  taskkill /im name        │  Stop-Process -Name name            │  │
│  │  net start                │  Get-Service                        │  │
│  └───────────────────────────┴─────────────────────────────────────┘  │
│                                                                       │
│  POWERSHELL PIPELINE ПРИКЛАДИ                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │ Get-Process | Sort CPU -Desc | Select -First 5                 │   │
│  │ Get-ChildItem -Recurse | Where {$_.Length -gt 10MB}            │   │
│  │ Get-Service | Where Status -eq Running | Measure               │   │
│  │ Get-Content log.txt | Select-String "error"                    │   │
│  │ Get-Process | Export-Csv proc.csv -NoTypeInformation           │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## 🎯 Міні-проект (30 хв)

### Завдання: Створення System Health Dashboard

Створіть скрипт, який збирає ключові метрики системи та виводить їх у вигляді наочного "дашборду" прямо в терміналі.

**Кроки:**

1. Створіть директорію для проекту:
```powershell
New-Item -Path "$env:USERPROFILE\HealthDashboard" -ItemType Directory -Force
Set-Location "$env:USERPROFILE\HealthDashboard"
```

2. Створіть функцію для візуалізації прогрес-бару:
```powershell
function Show-ProgressBar {
    param([int]$Percent, [int]$Width = 30)
    $filled = [math]::Round($Width * $Percent / 100)
    $empty = $Width - $filled
    $bar = "[" + ("=" * $filled) + (" " * $empty) + "]"
    return "$bar $Percent%"
}
```

3. Зберіть метрики системи:
```powershell
Clear-Host
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    SYSTEM HEALTH DASHBOARD" -ForegroundColor Cyan
Write-Host "    $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# CPU Usage
$CPU = (Get-CimInstance Win32_Processor).LoadPercentage
Write-Host "CPU Usage:    " -NoNewline
if ($CPU -lt 50) { $color = "Green" }
elseif ($CPU -lt 80) { $color = "Yellow" }
else { $color = "Red" }
Write-Host (Show-ProgressBar $CPU) -ForegroundColor $color

# RAM Usage
$OS = Get-CimInstance Win32_OperatingSystem
$TotalRAM = $OS.TotalVisibleMemorySize
$FreeRAM = $OS.FreePhysicalMemory
$UsedRAM = [math]::Round((($TotalRAM - $FreeRAM) / $TotalRAM) * 100)
Write-Host "RAM Usage:    " -NoNewline
if ($UsedRAM -lt 60) { $color = "Green" }
elseif ($UsedRAM -lt 85) { $color = "Yellow" }
else { $color = "Red" }
Write-Host (Show-ProgressBar $UsedRAM) -ForegroundColor $color
```

4. Додайте інформацію про диски:
```powershell
# Disk Usage
Write-Host ""
Write-Host "DISK USAGE:" -ForegroundColor White
Get-Volume | Where-Object { $_.DriveLetter -and $_.Size -gt 0 } | ForEach-Object {
    $UsedPercent = [math]::Round((($_.Size - $_.SizeRemaining) / $_.Size) * 100)
    Write-Host "  Drive $($_.DriveLetter): " -NoNewline
    if ($UsedPercent -lt 70) { $color = "Green" }
    elseif ($UsedPercent -lt 90) { $color = "Yellow" }
    else { $color = "Red" }
    Write-Host (Show-ProgressBar $UsedPercent 20) -ForegroundColor $color
}
```

5. Додайте топ процесів:
```powershell
Write-Host ""
Write-Host "TOP 5 PROCESSES BY RAM:" -ForegroundColor White
Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 5 | ForEach-Object {
    $RAM_MB = [math]::Round($_.WorkingSet / 1MB)
    Write-Host ("  {0,-25} {1,8} MB" -f $_.Name, $RAM_MB)
}
```

6. Додайте статус мережі:
```powershell
Write-Host ""
Write-Host "NETWORK STATUS:" -ForegroundColor White
$Hosts = @("google.com", "microsoft.com")
foreach ($h in $Hosts) {
    $result = Test-Connection $h -Count 1 -Quiet -ErrorAction SilentlyContinue
    if ($result) {
        Write-Host "  $h : " -NoNewline
        Write-Host "ONLINE" -ForegroundColor Green
    } else {
        Write-Host "  $h : " -NoNewline
        Write-Host "OFFLINE" -ForegroundColor Red
    }
}
```

7. Збережіть дашборд у файл:
```powershell
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

# Збереження в лог
$LogFile = "health_$(Get-Date -Format 'yyyyMMdd_HHmm').log"
@"
System Health Report - $(Get-Date)
CPU: $CPU%
RAM: $UsedRAM%
Network: OK
"@ | Out-File $LogFile

Write-Host "Log saved: $LogFile" -ForegroundColor Gray
```

**Очікуваний результат:**
Скрипт, який виводить красивий дашборд зі станом CPU, RAM, дисків, топ процесів та статусом мережі.

**Бонус (для допитливих):**
- Додайте автоматичне оновлення кожні 5 секунд (`while($true) {...; Start-Sleep 5}`)
- Збережіть історію метрик для побудови графіків
- Додайте алерти, коли метрики перевищують порогові значення

## Тест для самоперевірки

Десять запитань, у кожному одна правильна відповідь. Якщо тема винесена вашій групі на самостійне опрацювання, цей самий тест публікується в Google Classroom — 10 балів, по одному за кожне запитання.

**1.** Чим принципово відрізняється конвеєр PowerShell від конвеєра CMD?

- PowerShell передає текст, а CMD — об'єкти
- у PowerShell конвеєр працює лише з файлами
- у CMD конвеєра немає взагалі
- PowerShell передає об'єкти, а CMD — простий текст

**2.** Якої структури дотримуються імена командлетів PowerShell?

- лише скорочення з трьох літер
- Іменник-Дієслово, наприклад Process-Get
- Дієслово-Іменник, наприклад Get-Process
- імена збігаються з іменами команд CMD

**3.** Який командлет PowerShell відповідає команді `dir` у CMD?

- Get-ChildItem
- Get-Item
- Get-Content
- Get-Location

**4.** Який командлет відповідає команді `type`?

- Set-Content
- Get-Content
- Get-ChildItem
- Out-File

**5.** Як завершити процес за іменем у PowerShell?

- Exit-Process ім'я
- Remove-Process ім'я
- End-Process ім'я
- Stop-Process -Name ім'я

**6.** Яка команда CMD покаже повну інформацію про мережеві налаштування?

- ipconfig /all
- systeminfo
- net start
- tasklist

**7.** Що зробить команда `Get-ChildItem -Recurse | Where {$_.Length -gt 10MB}`?

- знайде файли більші за 10 МБ у поточному каталозі та підкаталогах
- покаже лише каталоги, більші за 10 МБ
- видалить файли більші за 10 МБ
- обмежить розмір файлів до 10 МБ

**8.** У якому році з'явився PowerShell і в якому — CMD?

- обидва у 1995
- CMD у 2006, PowerShell у 1987
- CMD у 1987, PowerShell у 2016
- CMD у 1987, PowerShell у 2006

**9.** Яке розширення мають скрипти PowerShell?

- .bat
- .ps1
- .sh
- .cmd

**10.** Навіщо потрібні змінні середовища на кшталт PATH?

- вони зберігають історію введених команд
- вони визначають мову інтерфейсу системи
- вони зберігають налаштування оточення, зокрема перелік каталогів для пошуку програм
- вони задають права доступу до файлів

## Підсумок

| Аспект | CMD | PowerShell |
|--------|-----|------------|
| **Рік створення** | 1987 | 2006 |
| **Тип даних** | Текст | Об'єкти |
| **Скрипти** | .bat, .cmd | .ps1 |
| **Автодоповнення** | Обмежене | Tab, Ctrl+Space |
| **Кросплатформність** | Ні | Так (PowerShell 7+) |
| **Рекомендація** | Legacy скрипти | Основний інструмент |

| Дія | CMD | PowerShell |
|-----|-----|------------|
| Список файлів | `dir` | `Get-ChildItem` / `ls` |
| Змінити каталог | `cd` | `Set-Location` / `cd` |
| Копіювати | `copy` | `Copy-Item` / `cp` |
| Видалити | `del` | `Remove-Item` / `rm` |
| Вміст файлу | `type` | `Get-Content` / `cat` |
| Пошук у файлі | `find` / `findstr` | `Select-String` |
| Процеси | `tasklist` | `Get-Process` |
| Мережа | `ipconfig` | `Get-NetIPAddress` |

На наступній лекції розглянемо створення пакетних файлів (batch scripts) для автоматизації.
