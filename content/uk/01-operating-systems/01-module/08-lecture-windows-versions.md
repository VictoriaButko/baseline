---
title: "Порівняльний аналіз версій ОС Windows"
type: lecture
order: 8
preview: "Windows 10, 11, Server. Редакції та їх відмінності."
---

## Чому так багато версій Windows?

Microsoft випускає різні редакції Windows для різних категорій користувачів:
- **Домашні** — базові функції для звичайного використання
- **Професійні** — розширені функції для бізнесу
- **Корпоративні** — централізоване керування великими організаціями
- **Серверні** — обслуговування мережі, хостинг сервісів

Кожна редакція = той самий код, але з різними **увімкненими/вимкненими функціями**.

## Редакції Windows 10/11

```
┌────────────────────────────────────────────────────────────────┐
│                    РЕДАКЦІЇ WINDOWS 10/11                      │
│                                                                │
│                     ┌──────────────────┐                       │
│                     │   Enterprise     │  Корпорації           │
│                     │   Education      │  (Volume License)     │
│                     └────────┬─────────┘                       │
│                              │ + LTSC                          │
│                              │ + Credential Guard              │
│                              │ + керування через Intune/GPO    │
│                     ┌────────▼─────────┐                       │
│                     │   Pro for        │  Малий/середній       │
│                     │   Workstations   │  бізнес               │
│                     └────────┬─────────┘                       │
│                              │ + ReFS                          │
│                              │ + Persistent Memory             │
│                     ┌────────▼─────────┐                       │
│                     │      Pro         │  Просунуті            │
│                     │                  │  користувачі          │
│                     └────────┬─────────┘                       │
│                              │ + BitLocker                     │
│                              │ + Remote Desktop (host)         │
│                              │ + Group Policy                  │
│                              │ + Hyper-V                       │
│                              │ + Domain Join                   │
│                     ┌────────▼─────────┐                       │
│                     │      Home        │  Домашні              │
│                     │                  │  користувачі          │
│                     └──────────────────┘                       │
│                     Базові функції                             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Порівняння Home vs Pro

| Функція | Home | Pro |
|---------|------|-----|
| **Максимум RAM** | 128 ГБ | 2 ТБ |
| **BitLocker** | ❌ | ✅ |
| **Remote Desktop (host)** | ❌ | ✅ |
| **Hyper-V** | ❌ | ✅ |
| **Group Policy** | ❌ | ✅ |
| **Domain Join** | ❌ | ✅ |
| **Windows Sandbox** | ❌ | ✅ |
| **Assigned Access (Kiosk)** | ❌ | ✅ |
| **Ціна** | ~$140 | ~$200 |

### Порівняння Pro vs Enterprise

| Функція | Pro | Enterprise |
|---------|-----|------------|
| **Credential Guard** | ❌ | ✅ |
| **LTSC (Long-Term)** | ❌ | ✅ |
| **Керування оновленнями й політиками в масштабі** | Базове | Повне |
| **Ліцензування** | Retail/OEM | Volume |

Колись у цій таблиці стояли DirectAccess і Windows To Go (запуск Windows з флешки). Microsoft від обох відмовилася — Windows To Go прибрали 2020 року, DirectAccess замінили на Always On VPN. Редакції не лише додають функції, а й втрачають їх, тож будь-яке порівняння варто звіряти з актуальною документацією.

## Windows 10 vs Windows 11

```
┌────────────────────────────────────────────────────────────────┐
│                    WINDOWS 10 vs WINDOWS 11                    │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   WINDOWS 10 (2015)                WINDOWS 11 (2021)           │
│                                                                │
│   ┌───────────────────────┐        ┌───────────────────────┐   │
│   │                       │        │                       │   │
│   │                       │        │                       │   │
│   │                       │        │                       │   │
│   │ [≡] Start   ▓▓▓▓▓▓▓▓▓ │        │      [⊞] ○ ▢ ▢        │   │
│   └───────────────────────┘        └───────────────────────┘   │
│     кнопка «Пуск» зліва              панель задач по центру    │
│                                                                │
│   • Live Tiles                     • Widgets                   │
│   • Квадратні кути                 • Заокруглені кути          │
│   • Підтримку завершено 2025       • Підтримка — щорічними     │
│                                      версіями (24/36 міс.)     │
│                                                                │
│   Системні вимоги:                 Системні вимоги:            │
│   • 1 ГГц CPU (є 32-бітна)         • 1 ГГц, 64-bit, 2 ядра,    │
│                                      зі списку підтримуваних   │
│                                      (Intel 8-го покоління+,   │
│                                      AMD Zen 2+)               │
│   • 1–2 ГБ RAM                     • 4 ГБ RAM                  │
│   • 32 ГБ диска (з версії 1903)    • 64 ГБ диска               │
│   • DirectX 9                      • DirectX 12, WDDM 2.0      │
│   • TPM не обов'язковий            • TPM 2.0 ОБОВ'ЯЗКОВИЙ      │
│   • UEFI не обов'язковий           • UEFI + Secure Boot        │
└────────────────────────────────────────────────────────────────┘
```

Найчастіше старий комп'ютер «не проходить» у Windows 11 не через пам'ять чи диск, а через процесор: Microsoft підтримує лише процесори, у яких є потрібні засоби безпеки (зокрема для віртуалізаційного захисту ядра). Перевірити свій ПК найпростіше офіційною програмою PC Health Check.

### Нові функції Windows 11

| Функція | Опис |
|---------|------|
| **Snap Layouts** | Швидке розташування вікон (Win+Z) |
| **Desktops** | Покращені віртуальні робочі столи |
| **Microsoft Teams** | Окремий застосунок; вбудовану кнопку Chat прибрано у версії 23H2 |
| **Android Apps** | WSA — підтримку припинено 5 березня 2025 року |
| **DirectStorage** | Швидке завантаження ігор з NVMe |
| **Auto HDR** | Автоматичне покращення графіки |
| **WSL 2 з GUI** | Linux-додатки з графікою |

### Перевірка сумісності з Windows 11

```powershell
# Перевірити TPM
Get-Tpm

# Версія TPM (перше число має бути 2.0)
(Get-CimInstance -Namespace "root\cimv2\security\microsofttpm" -ClassName Win32_Tpm).SpecVersion

# Перевірити Secure Boot
Confirm-SecureBootUEFI

# Детальна інформація про систему
Get-ComputerInfo | Select-Object BiosFirmwareType, CsProcessors, OsTotalVisibleMemorySize
```

## Windows Server

```
┌────────────────────────────────────────────────────────────────┐
│                    WINDOWS SERVER РЕДАКЦІЇ                     │
│                                                                │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │              Datacenter                                 │  │
│   │  • Unlimited VMs                                        │  │
│   │  • Storage Spaces Direct                                │  │
│   │  • Software Defined Networking                          │  │
│   │  • Shielded VMs                                         │  │
│   │  Для великих датацентрів та хмар                        │  │
│   └────────────────────────┬────────────────────────────────┘  │
│                            │                                   │
│   ┌────────────────────────▼────────────────────────────────┐  │
│   │              Standard                                   │  │
│   │  • 2 VMs на ліцензію                                    │  │
│   │  • Hyper-V, Failover Clustering                         │  │
│   │  • Storage Replica                                      │  │
│   │  Для більшості організацій                              │  │
│   └────────────────────────┬────────────────────────────────┘  │
│                            │                                   │
│   ┌────────────────────────▼────────────────────────────────┐  │
│   │              Essentials                                 │  │
│   │  • До 25 користувачів, 50 пристроїв                     │  │
│   │  • Простіше ліцензування                                │  │
│   │  Для малого бізнесу                                     │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                │
│   Особливі версії:                                             │
│   • Azure Edition — оптимізований для Azure                    │
│   • Core — без GUI (менше ресурсів, безпечніше)                │
│   • Nano Server — мінімальний для контейнерів                  │
└────────────────────────────────────────────────────────────────┘
```

### Windows Server vs Desktop

| Характеристика | Desktop (Win 11) | Server 2022 |
|----------------|------------------|-------------|
| **Основне призначення** | Робоча станція | Обслуговування мережі |
| **GUI** | Завжди | Опціонально (Core) |
| **Максимум RAM** | 2 ТБ (Pro) | 48 ТБ (Datacenter) |
| **Максимум CPU** | 2 сокети | 64 сокети |
| **Hyper-V** | Workstation | Production |
| **Active Directory** | Client | Domain Controller |
| **IIS** | Обмежений | Повний |
| **Ліцензування** | Per device | Per core |

### Server Core vs GUI

```
┌────────────────────────────────────────────────────────────────┐
│         SERVER CORE               SERVER WITH GUI              │
│                                                                │
│   ┌─────────────────────┐        ┌─────────────────────┐       │
│   │                     │        │ ┌─────────────────┐ │       │
│   │   C:\> _            │        │ │ Server Manager  │ │       │
│   │                     │        │ │                 │ │       │
│   │   PowerShell/CMD    │        │ │  ┌───┐ ┌───┐   │  │       │
│   │   тільки            │        │ │  │ 1 │ │ 2 │   │  │       │
│   │                     │        │ │  └───┘ └───┘   │  │       │
│   │                     │        │ └─────────────────┘ │       │
│   └─────────────────────┘        └─────────────────────┘       │
│                                                                │
│   • Менше диску (~6 ГБ)          • Більше диску (~12 ГБ)       │
│   • Менше оновлень               • Більше оновлень             │
│   • Менша поверхня атаки         • Зручніше для новачків       │
│   • Керування: PowerShell,       • Локальний GUI               │
│     Windows Admin Center,                                      │
│     Remote Server Tools                                        │
│                                                                │
│   Рекомендовано для             Для навчання та                │
│   production                    невеликих середовищ            │
└────────────────────────────────────────────────────────────────┘
```

```powershell
# Перевірити, чи це Server Core
(Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion").InstallationType
# Server Core   або   Server
```

Вибір між Core і повною версією з графічною оболонкою (Desktop Experience) робиться **один раз — під час встановлення**. У Windows Server 2012 між ними ще можна було перемикатися командою `Install-WindowsFeature Server-Gui-Shell`, але починаючи з Server 2016 це неможливо: щоб змінити варіант, сервер доведеться перевстановити. На Core можна лише доставити окремі графічні інструменти пакетом Features on Demand — наприклад, консоль MMC і Провідник.

## Windows версії: хронологія підтримки

```
┌─────────────────────────────────────────────────────────────────┐
│                    ЖИТТЄВИЙ ЦИКЛ WINDOWS                        │
│                                                                 │
│   2015      2020      2025      2030      2035                  │
│     │         │         │         │         │                   │
│     ├─────────┴─────────┴─────────┴─────────┴─────────          │
│     │                                                           │
│  Win 7  ████████░░░░░░░░░  Кінець: 2020                         │
│     │                                                           │
│  Win 8.1 ████████████░░░░  Кінець: 2023                         │
│     │                                                           │
│  Win 10  ████████████████████████░  Кінець: 2025                │
│     │                                                           │
│  Win 11  ░░░░░████████████████████████████████████████          │
│     │         Кожна щорічна версія: 24 міс. (Home/Pro),         │
│     │         36 міс. (Enterprise/Education)                    │
│     │                                                           │
│  Server ████████████████████████████████████                    │
│  2019        10 років (5 mainstream + 5 extended)               │
│     │                                                           │
│  Server ░░░░░░░░████████████████████████████████████████        │
│  2022                                                           │
│     │                                                           │
│  Server       ░░░░░░████████████████████████████████████████    │
│  2025         (листопад 2024)                                   │
│                                                                 │
│  ████ = Активна підтримка                                       │
│  ░░░░ = Розширена підтримка (тільки безпека)                    │
└─────────────────────────────────────────────────────────────────┘
```

Підтримку Windows 10 завершено 14 жовтня 2025 року: безкоштовних оновлень,
зокрема безпекових, система більше не отримує. Для організацій Microsoft
продає програму ESU (Extended Security Updates) з продовженням до жовтня
2028 року, і саме на неї лишилися ті, хто не може перейти на Windows 11
через вимогу TPM 2.0 чи непідтримуваний процесор. Домашнім користувачам
Microsoft запропонувала річне продовження — до жовтня 2026 року. Тому
станом на сьогодні Windows 10 у навчальному класі — припустима, але вже
несупроводжувана система.

### Канали оновлень Windows

| Канал | Опис | Для кого |
|-------|------|----------|
| **General Availability** | Нова версія Windows 11 раз на рік (восени); виправлення безпеки — щомісяця | Більшість |
| **Windows Insider (Canary, Dev)** | Найновіші функції, нестабільно | Розробники |
| **Windows Insider (Beta, Release Preview)** | Майже стабільно | Ентузіасти |
| **LTSC** | Лише оновлення безпеки 5 років (IoT LTSC — 10), без нових функцій | Критична інфраструктура |

Щомісячні оновлення безпеки Microsoft випускає за розкладом — у другий вівторок місяця, так званий **Patch Tuesday**. Передбачуваність тут важливіша за швидкість: адміністратори великих мереж заздалегідь планують тестування й перезавантаження.

## Встановлення Windows: режими

```
┌────────────────────────────────────────────────────────────────┐
│                      РЕЖИМИ ВСТАНОВЛЕННЯ                       │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐      │
│   │ Clean Install │  │   Upgrade     │  │   Reset       │      │
│   │               │  │               │  │               │      │
│   │  Новий диск   │  │  Win10→Win11  │  │  Скинути до   │      │
│   │  або форматув.│  │  Зберігає     │  │  заводських   │      │
│   │               │  │  програми     │  │  налаштувань  │      │
│   │  Boot from    │  │               │  │               │      │
│   │  USB/DVD      │  │  Settings →   │  │  Settings →   │      │
│   │               │  │  Update       │  │  Recovery     │      │
│   └───────────────┘  └───────────────┘  └───────────────┘      │
│                                                                │
│   ┌───────────────┐  ┌───────────────┐                         │
│   │  Image-based  │  │   WDS/MDT     │                         │
│   │  (WIM/FFU)    │  │               │                         │
│   │               │  │  Масове       │                         │
│   │  DISM         │  │  розгортання  │                         │
│   │  для техніків │  │  по мережі    │                         │
│   └───────────────┘  └───────────────┘                         │
│                                                                │
│   Корпоративні інструменти:                                    │
│   • Windows Deployment Services (WDS)                          │
│   • Microsoft Deployment Toolkit (MDT)                         │
│   • Microsoft Configuration Manager (колишній SCCM)            │
│   • Windows Autopilot (хмарне розгортання)                     │
└────────────────────────────────────────────────────────────────┘
```

## Практичне порівняння

**Перевірка поточної системи:**

```powershell
# Повна інформація про ОС
Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion, OsHardwareAbstractionLayer

# Редакція Windows
(Get-CimInstance Win32_OperatingSystem).Caption

# Версія та білд
[System.Environment]::OSVersion.Version

# Ліцензія
Get-CimInstance -ClassName SoftwareLicensingProduct | Where-Object {$_.PartialProductKey} | Select-Object Name, LicenseStatus

# Функції Windows
Get-WindowsOptionalFeature -Online | Where-Object {$_.State -eq "Enabled"} | Select-Object FeatureName

# Чи це Server?
(Get-CimInstance Win32_OperatingSystem).ProductType
# 1 = Workstation, 2 = Domain Controller, 3 = Server
```

## Яку версію обрати?

```
┌────────────────────────────────────────────────────────────────┐
│                    ВИБІР РЕДАКЦІЇ WINDOWS                      │
│                                                                │
│   Домашнє використання                                         │
│   └──→ Windows 11 Home                                         │
│        • Найдешевша                                            │
│        • Достатньо для ігор, інтернету, офісу                  │
│                                                                │
│   Фрілансер / Розробник                                        │
│   └──→ Windows 11 Pro                                          │
│        • Hyper-V для віртуалок                                 │
│        • BitLocker для шифрування                              │
│        • Remote Desktop                                        │
│                                                                │
│   Малий бізнес (< 25 ПК)                                       │
│   └──→ Windows 11 Pro + Server Essentials                      │
│        • Централізоване керування                              │
│        • Спільний файловий сервер                              │
│                                                                │
│   Середній/Великий бізнес                                      │
│   └──→ Windows 11 Enterprise + Server Standard/Datacenter      │
│        • Active Directory                                      │
│        • Group Policy                                          │
│        • Volume licensing                                      │
│                                                                │
│   Датацентр / Хмара                                            │
│   └──→ Windows Server Datacenter / Azure Edition               │
│        • Unlimited VMs                                         │
│        • Software Defined everything                           │
│        • Shielded VMs                                          │
└────────────────────────────────────────────────────────────────┘
```

## Практичне завдання

Дослідіть вашу Windows-систему:

```powershell
# 1. Яка редакція встановлена?
Get-CimInstance Win32_OperatingSystem | Select-Object Caption, Version, BuildNumber

# 2. Чи підтримується Windows 11?
# (перевірка TPM, Secure Boot, CPU)
Get-Tpm
Confirm-SecureBootUEFI
Get-CimInstance Win32_Processor | Select-Object Name, NumberOfCores

# 3. Перелік встановлених ролей/функцій (Server)
Get-WindowsFeature | Where-Object {$_.Installed}

# 4. Історія оновлень
Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 10

# 5. Версія (щорічне оновлення: 23H2, 24H2...)
(Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion").DisplayVersion
```

## 🏢 Real World: Як це використовують у великих компаніях

```
┌───────────────────────────────────────────────────────────────────────┐
│               ВИБІР ВЕРСІЙ WINDOWS У ENTERPRISE                       │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  КОРПОРАЦІЇ (Enterprise Agreement)                                    │
│  ├── Офісні робочі місця:                                             │
│  │   └── Windows 11 Enterprise + Microsoft 365                        │
│  ├── Спеціалізовані термінали (каси, торгові місця):                  │
│  │   └── Windows 11 Enterprise LTSC — без нових функцій роками        │
│  └── Переваги: Volume Licensing, централізоване керування             │
│                                                                       │
│  СТАРТАПИ ТА МАЛИЙ БІЗНЕС                                             │
│  ├── SaaS-компанії:                                                   │
│  │   └── Windows 11 Pro + Microsoft 365 Business                      │
│  ├── Переваги Pro над Home:                                           │
│  │   ├── BitLocker для захисту ноутбуків                              │
│  │   ├── Remote Desktop для віддаленої роботи                         │
│  │   └── Hyper-V для розробки та тестування                           │
│  └── Вартість: ~$200 за ліцензію (одноразово)                         │
│                                                                       │
│  ДАТАЦЕНТРИ ТА ХМАРИ                                                  │
│  ├── Azure: Windows Server Datacenter Azure Edition                   │
│  ├── On-premise: Windows Server Datacenter (unlimited VMs)            │
│  └── Ліцензування: Per-core (мінімум 16 cores)                        │
│                                                                       │
│  КРИТИЧНА ІНФРАСТРУКТУРА                                              │
│  ├── Банкомати: Windows 10 IoT Enterprise LTSC                        │
│  ├── Промислові системи: Windows Server IoT                           │
│  └── Чому LTSC: стабільність, без feature updates                     │
│                                                                       │
│  ОСВІТА                                                               │
│  ├── Університети: Windows 11 Education (= Enterprise)                │
│  └── Azure Lab Services для віртуальних лабораторій                   │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## 💼 Career Spotlight

```
┌───────────────────────────────────────────────────────────────────────┐
│                       КАР'ЄРНІ МОЖЛИВОСТІ                             │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  MICROSOFT 365 ADMINISTRATOR                                          │
│  ├── Зарплата: $60K-$100K (USA) | €50K-€90K (EU)                      │
│  ├── Навички: Windows deployment, Intune, Autopilot                   │
│  └── Сертифікації: MS-102, MD-102                                     │
│                                                                       │
│  WINDOWS DEPLOYMENT SPECIALIST                                        │
│  ├── Зарплата: $55K-$85K (USA) | €45K-€75K (EU)                       │
│  ├── Навички: MDT, SCCM/MECM, WDS, Windows Imaging                    │
│  └── Сертифікації: MD-102, AZ-140                                     │
│                                                                       │
│  ENDPOINT MANAGER / INTUNE SPECIALIST                                 │
│  ├── Зарплата: $70K-$120K (USA) | €60K-€100K (EU)                     │
│  ├── Навички: Intune, Autopilot, Windows Update for Business          │
│  └── Сертифікації: MD-102, SC-300                                     │
│                                                                       │
│  WINDOWS SERVER ADMINISTRATOR                                         │
│  ├── Зарплата: $60K-$110K (USA) | €50K-€95K (EU)                      │
│  ├── Навички: Server Core, Hyper-V, Failover Clustering               │
│  └── Сертифікації: AZ-800, AZ-801                                     │
│                                                                       │
│  LICENSING SPECIALIST                                                 │
│  ├── Зарплата: $50K-$90K (USA) | €45K-€80K (EU)                       │
│  ├── Навички: Microsoft licensing, SAM, compliance                    │
│  └── Сертифікації: Microsoft Licensing Professional                   │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## 🔗 Корисні ресурси

### Онлайн-практика

| Ресурс | Опис | Посилання |
|--------|------|-----------|
| Microsoft Evaluation Center | Безкоштовні trial версії Windows Server | microsoft.com/evalcenter |
| Microsoft Learn | Модулі з Windows 11 та Server | learn.microsoft.com |
| Azure Free Account | Безкоштовні Windows VMs на 12 місяців | azure.microsoft.com/free |
| Windows Insider Program | Тестування нових версій | insider.windows.com |

## 📋 Cheat Sheet

```
┌───────────────────────────────────────────────────────────────────────┐
│                WINDOWS VERSIONS - QUICK REFERENCE                     │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  DESKTOP EDITIONS (Win 10/11)                                         │
│  ┌─────────────────┬─────────────────────────────────────────────┐    │
│  │ Home            │ Базові функції, 128 GB RAM, без BitLocker   │    │
│  │ Pro             │ + BitLocker, Hyper-V, RDP, Domain Join      │    │
│  │ Pro Workstation │ + ReFS, Persistent Memory                   │    │
│  │ Enterprise      │ + LTSC, Credential Guard, централізація     │    │
│  │ Education       │ = Enterprise, академічна ліцензія           │    │
│  └─────────────────┴─────────────────────────────────────────────┘    │
│                                                                       │
│  SERVER EDITIONS                                                      │
│  ┌─────────────────┬─────────────────────────────────────────────┐    │
│  │ Essentials      │ До 25 users, 50 devices, спрощена ліцензія  │    │
│  │ Standard        │ 2 VMs per license, Hyper-V, Clustering      │    │
│  │ Datacenter      │ Unlimited VMs, Shielded VMs, SDN            │    │
│  │ Azure Edition   │ Оптимізовано для Azure, Hot Patching        │    │
│  └─────────────────┴─────────────────────────────────────────────┘    │
│                                                                       │
│  WINDOWS 11 ВИМОГИ                                                    │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │ • CPU: 64-bit, 2+ cores, 1 GHz   • TPM: 2.0 ОБОВ'ЯЗКОВО        │   │
│  │ • RAM: 4 GB мінімум              • UEFI + Secure Boot          │   │
│  │ • Диск: 64 GB мінімум            • DirectX 12 + WDDM 2.0       │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ПЕРЕВІРКА ВЕРСІЇ (PowerShell)                                        │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │ (Get-CimInstance Win32_OperatingSystem).Caption # Назва        │   │
│  │ [Environment]::OSVersion.Version               # Версія        │   │
│  │ Get-ComputerInfo | Select Windows*             # Детально      │   │
│  │ Get-Tpm                                        # Статус TPM    │   │
│  │ Confirm-SecureBootUEFI                         # Secure Boot   │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## 🎯 Міні-проект (30 хв)

### Завдання: Windows Upgrade Advisor

Створіть власний інструмент для перевірки сумісності системи з Windows 11 та рекомендацій щодо апгрейду.

**Кроки:**

1. Створіть директорію для проекту:
```powershell
New-Item -Path "$env:USERPROFILE\UpgradeAdvisor" -ItemType Directory -Force
Set-Location "$env:USERPROFILE\UpgradeAdvisor"
```

2. Перевірте базові вимоги Windows 11:
```powershell
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    WINDOWS 11 UPGRADE ADVISOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$Results = @{
    CheckDate = Get-Date
    PassedChecks = 0
    FailedChecks = 0
}

# Перевірка RAM (мінімум 4 GB)
$RAM_GB = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)
if ($RAM_GB -ge 4) {
    Write-Host "[PASS] RAM: $RAM_GB GB (потрібно: 4 GB)" -ForegroundColor Green
    $Results.PassedChecks++
} else {
    Write-Host "[FAIL] RAM: $RAM_GB GB (потрібно: 4 GB)" -ForegroundColor Red
    $Results.FailedChecks++
}
```

3. Перевірте TPM та Secure Boot (Get-Tpm і Confirm-SecureBootUEFI потребують PowerShell від імені адміністратора):
```powershell
# Перевірка TPM: модуль має бути і готовим, і саме версії 2.0
$tpm = Get-Tpm -ErrorAction SilentlyContinue
$tpmVersion = (Get-CimInstance -Namespace "root\cimv2\security\microsofttpm" `
    -ClassName Win32_Tpm -ErrorAction SilentlyContinue).SpecVersion
if ($tpm.TpmPresent -and $tpm.TpmReady -and $tpmVersion -like "2.0*") {
    Write-Host "[PASS] TPM 2.0: Присутній та готовий" -ForegroundColor Green
    $Results.PassedChecks++
} else {
    Write-Host "[FAIL] TPM 2.0: Відсутній або не готовий" -ForegroundColor Red
    $Results.FailedChecks++
}

# Перевірка Secure Boot
try {
    $SecureBoot = Confirm-SecureBootUEFI
    if ($SecureBoot) {
        Write-Host "[PASS] Secure Boot: Увімкнено" -ForegroundColor Green
        $Results.PassedChecks++
    } else {
        Write-Host "[WARN] Secure Boot: Вимкнено" -ForegroundColor Yellow
        $Results.FailedChecks++
    }
} catch {
    Write-Host "[FAIL] Secure Boot: Не підтримується (Legacy BIOS?)" -ForegroundColor Red
    $Results.FailedChecks++
}
```

4. Перевірте CPU та диск:
```powershell
# Перевірка CPU (мінімум 2 ядра, 1 GHz)
$CPU = Get-CimInstance Win32_Processor
$Cores = $CPU.NumberOfCores
if ($Cores -ge 2) {
    Write-Host "[PASS] CPU: $($CPU.Name) ($Cores cores)" -ForegroundColor Green
    $Results.PassedChecks++
} else {
    Write-Host "[FAIL] CPU: $Cores cores (потрібно: 2+)" -ForegroundColor Red
    $Results.FailedChecks++
}

# Перевірка диску (мінімум 64 GB)
$SystemDrive = Get-Volume -DriveLetter C
$Disk_GB = [math]::Round($SystemDrive.Size / 1GB, 2)
if ($Disk_GB -ge 64) {
    Write-Host "[PASS] Диск C: $Disk_GB GB (потрібно: 64 GB)" -ForegroundColor Green
    $Results.PassedChecks++
} else {
    Write-Host "[FAIL] Диск C: $Disk_GB GB (потрібно: 64 GB)" -ForegroundColor Red
    $Results.FailedChecks++
}
```

5. Виведіть підсумок та рекомендації:
```powershell
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "           ПІДСУМОК" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Пройдено перевірок: $($Results.PassedChecks)" -ForegroundColor Green
Write-Host "Провалено перевірок: $($Results.FailedChecks)" -ForegroundColor Red
Write-Host ""

if ($Results.FailedChecks -eq 0) {
    Write-Host "ВИСНОВОК: Ваша система ГОТОВА до Windows 11!" -ForegroundColor Green
    Write-Host "Рекомендована редакція: Windows 11 Pro" -ForegroundColor Cyan
} else {
    Write-Host "ВИСНОВОК: Потрібні оновлення перед апгрейдом" -ForegroundColor Yellow
    Write-Host "Рекомендації:" -ForegroundColor Cyan
    Write-Host "- Перевірте налаштування BIOS (TPM, Secure Boot)" -ForegroundColor White
    Write-Host "- Можливо, потрібне оновлення обладнання" -ForegroundColor White
}
```

6. Збережіть результати у файл:
```powershell
$ReportFile = "UpgradeReport_$(Get-Date -Format 'yyyyMMdd').txt"
@"
WINDOWS 11 UPGRADE ADVISOR REPORT
Generated: $(Get-Date)

RAM: $RAM_GB GB
CPU: $($CPU.Name) ($Cores cores)
Disk: $Disk_GB GB
TPM: $(if($tpm.TpmPresent){'Present'}else{'Missing'})
Secure Boot: $(if($SecureBoot){'Enabled'}else{'Disabled'})

Passed: $($Results.PassedChecks)
Failed: $($Results.FailedChecks)

Ready for Windows 11: $(if($Results.FailedChecks -eq 0){'YES'}else{'NO'})
"@ | Out-File $ReportFile

Write-Host ""
Write-Host "Звіт збережено: $ReportFile" -ForegroundColor Cyan
```

**Очікуваний результат:**
Скрипт, який перевіряє сумісність з Windows 11 та генерує файл звіту з рекомендаціями.

**Бонус (для допитливих):**
- Додайте перевірку сумісності CPU за списком підтримуваних процесорів — саме на цьому пункті «падає» більшість старих ПК; порівняйте свій результат із PC Health Check
- Створіть GUI-версію з Windows Forms
- Додайте порівняння редакцій (Home vs Pro vs Enterprise)

## Тест для самоперевірки

Десять запитань, у кожному одна правильна відповідь. Якщо тема винесена вашій групі на самостійне опрацювання, цей самий тест публікується в Google Classroom — 10 балів, по одному за кожне запитання.

**1.** Якої функції немає у Windows Home порівняно з Pro?

- шифрування диска BitLocker
- підключення до Wi-Fi
- Захисник Windows
- оновлення через Windows Update

**2.** Для чого призначена редакція Enterprise LTSC?

- для пристроїв на кшталт банкоматів і медичного обладнання, де оновлення функцій небажані
- для домашніх ігрових комп'ютерів
- для роботи виключно у хмарі Azure
- для навчальних класів із безкоштовною ліцензією

**3.** Скільки віртуальних машин дозволяє одна ліцензія Windows Server Standard?

- одну
- дві
- двадцять п'ять
- необмежену кількість

**4.** Чим Windows Server Datacenter відрізняється від Standard?

- наявністю графічного інтерфейсу
- відсутністю ролі Hyper-V
- необмеженою кількістю віртуальних машин і захищеними ВМ
- підтримкою лише 25 користувачів

**5.** Яка вимога Windows 11 стала новою порівняно з Windows 10?

- обов'язковий модуль TPM 2.0
- постійне підключення до інтернету під час роботи
- наявність дисковода DVD
- підтримка DirectX 9

**6.** Навіщо Microsoft вимагає TPM 2.0?

- він потрібен для роботи DirectX 12
- апаратний модуль зберігає ключі шифрування й забезпечує довірене завантаження
- він пришвидшує роботу процесора
- без нього неможливо підключити зовнішній монітор

**7.** Що таке Windows Server Core?

- безкоштовна редакція для малого бізнесу
- режим відновлення після збою
- варіант установлення без графічної оболонки, керований з командного рядка
- ядро Windows, що постачається окремо

**8.** Яка головна перевага Server Core?

- нижча вартість ліцензії
- підтримка більшої кількості відеокарт
- менша поверхня атаки й менше оновлень, що потребують перезавантаження
- зручніше локальне адміністрування мишею

**9.** Для скількох користувачів призначена редакція Server Essentials?

- до 100 користувачів
- до 50 користувачів
- кількість не обмежена
- до 25 користувачів

**10.** Який підхід до вибору редакції радить лекція?

- на серверах завжди ставити версію з графічним інтерфейсом
- обирати мінімально достатню редакцію під наявні задачі
- на робочих станціях обов'язково використовувати Enterprise
- завжди брати найстаршу редакцію про запас

## Підсумок

| Редакція | Для кого | Ключові функції |
|----------|----------|-----------------|
| **Home** | Домашні користувачі | Базові функції |
| **Pro** | Малий бізнес, розробники | BitLocker, Hyper-V, RDP |
| **Enterprise** | Корпорації | LTSC, Credential Guard, керування в масштабі |
| **Education** | Навчальні заклади | = Enterprise, інша ліцензія |
| **Server Essentials** | Малий бізнес | До 25 користувачів |
| **Server Standard** | Середній бізнес | 2 VM на ліцензію |
| **Server Datacenter** | Великі організації | Unlimited VMs |

**Ключовий висновок:** Обирайте мінімально достатню редакцію. Якщо не потрібен BitLocker чи Hyper-V — Home цілком достатньо. Для серверів починайте з Server Core — це безпечніше та легше підтримувати.

На наступній лекції розглянемо роботу з командним рядком Windows (CMD).
