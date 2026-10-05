---
title: "Робочий стіл користувача"
type: lecture
order: 20
preview: "Елементи робочого столу, налаштування GNOME і KDE, розширення, автозапуск, асоціації файлів і те, де все це зберігається."
---

## Hook / Захоплюючий вступ

Виконайте в GNOME одну команду:

```bash
gsettings list-recursively | wc -l
```

Кілька тисяч рядків — стільки налаштувань має звичайний робочий стіл, і в панелі «Налаштування» ви бачите хіба що десяту частину. Тепер друга команда, у другому терміналі:

```bash
dconf watch /
```

Змініть у налаштуваннях тему зі світлої на темну — і в терміналі з'явиться рядок `/org/gnome/desktop/interface/color-scheme 'prefer-dark'`. Кожна галочка в графічному інтерфейсі — це запис у звичайну базу даних у вашому домашньому каталозі. Той, хто це розуміє, може налаштувати сто комп'ютерів одним скриптом, перенести своє середовище на новий ноутбук за хвилину й полагодити «зламаний» робочий стіл, не перевстановлюючи систему.

**Запитання до аудиторії**: де, на вашу думку, Windows зберігає налаштування робочого столу? А де їх може зберігати Linux, якщо в ньому «все є файлом»?

## Елементи робочого столу

Робочий стіл — це кілька програм, які спільно малюють звичне оточення. Назви в середовищах різні, але елементи ті самі.

```
┌─────────────────────────────────────────────────────────────────────┐
│                       АНАТОМІЯ РОБОЧОГО СТОЛУ                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Огляд   Firefox          Чт 10:30         Мережа Звук Батарея │  │
│  ├───────────────────────────────────────────────── верхня панель┤  │
│  │                                                               │  │
│  │   ┌──────────────────┐        ┌───────────────────────┐       │  │
│  │   │ Значки           │        │ Вікно програми        │       │  │
│  │   │ Домівка          │        │                       │       │  │
│  │   │ Документи        │        │                       │       │  │
│  │   │ Смітник          │        │                       │       │  │
│  │   └──────────────────┘        └───────────────────────┘       │  │
│  │                                                               │  │
│  │                  робоча область і шпалери                     │  │
│  ├──────────────────────────────────────────────────────── док ──┤  │
│  │ [Файли] [Firefox] [Термінал] [Налаштування]    [Усі програми] │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  За кожним елементом — процес або файл у вашій домівці: панель      │
│  і док малює gnome-shell чи plasmashell, значки програм — це        │
│  .desktop-файли, шпалери — ключ у базі налаштувань dconf.           │
└─────────────────────────────────────────────────────────────────────┘
```

| Компонент | Призначення | GNOME | KDE Plasma |
|-----------|-------------|-------|------------|
| **Панель** | Меню, годинник, індикатори | Верхня панель, не налаштовується без розширень | Будь-яка кількість панелей з будь-якого боку |
| **Док / панель задач** | Улюблені й запущені програми | Dash в огляді; Ubuntu Dock праворуч чи знизу | Task Manager на панелі |
| **Системний трей** | Мережа, звук, батарея, фонові програми | Швидкі налаштування; значки програм — розширенням AppIndicator | Віджет System Tray |
| **Значки на робочому столі** | Файли й ярлики | Розширення (в Ubuntu ввімкнено) | Вбудовано (Folder View) |
| **Меню програм** | Запуск програм | Огляд і сітка програм (`Super+A`) | Application Launcher |
| **Сповіщення** | Повідомлення програм | Банер і список у календарі | Спливні вікна й історія |

Гарячі клавіші, віртуальні робочі столи, масштабування й доступність розглянемо окремо в лекції «Основні властивості робочих столів Linux», а теми, значки й шрифти — у лекції про теми оформлення.

## Налаштування GNOME

### Settings і Tweaks

**Settings** (`gnome-control-center`) — основна панель налаштувань. Кожен розділ можна відкрити одразу з терміналу:

```bash
gnome-control-center                # усі налаштування
gnome-control-center display        # монітори, масштаб
gnome-control-center keyboard       # розкладки, гарячі клавіші
gnome-control-center background     # шпалери й тема
```

| Розділ | Що налаштовує |
|--------|---------------|
| **Network, Wi-Fi, Bluetooth** | Підключення (фактично — інтерфейс до служби NetworkManager) |
| **Appearance** | Світла чи темна тема, акцентний колір, шпалери |
| **Notifications** | Які програми можуть показувати сповіщення |
| **Multitasking** | Гарячий кут, кількість робочих столів |
| **Apps** | Дозволи програм, програми за замовчуванням |
| **Displays** | Роздільність, масштаб, нічне світло |
| **Keyboard** | Розкладки, перемикання мов, гарячі клавіші |
| **Power** | Енергозбереження, дії кнопки живлення |
| **Users** | Облікові записи, автоматичний вхід |

**GNOME Tweaks** (`sudo apt install gnome-tweaks`) відкриває те, чого немає в Settings: кнопки згортання й розгортання у заголовках вікон, шрифти й згладжування, поведінку миші, теми для GTK3-програм. Нічого «прихованого» Tweaks не робить — він змінює ті самі ключі dconf, до яких можна дістатися й з командного рядка.

### gsettings і dconf: налаштування як база даних

Налаштування GNOME лежать у базі **dconf** — одному двійковому файлі `~/.config/dconf/user`. Щоб програми не записували туди що завгодно, кожен ключ описано **схемою** (`/usr/share/glib-2.0/schemas/*.gschema.xml`): тип, значення за замовчуванням, опис. Інструментів два:

- **gsettings** — працює через схеми, перевіряє тип значення. Для щоденної роботи й скриптів.
- **dconf** — працює з базою напряму, без перевірок: вивантажити все, стежити за змінами, завантажити з файлу.

```bash
gsettings list-keys org.gnome.desktop.interface          # ключі схеми
gsettings describe org.gnome.desktop.interface color-scheme
gsettings range org.gnome.desktop.interface color-scheme # допустимі значення
gsettings get org.gnome.desktop.interface color-scheme
gsettings set org.gnome.desktop.interface color-scheme 'prefer-dark'
gsettings reset org.gnome.desktop.interface color-scheme # повернути стандартне

# Корисні приклади
gsettings set org.gnome.desktop.interface clock-show-seconds true
gsettings set org.gnome.desktop.interface show-battery-percentage true
gsettings set org.gnome.desktop.wm.preferences button-layout 'appmenu:minimize,maximize,close'
gsettings set org.gnome.mutter center-new-windows true

dconf dump /org/gnome/desktop/interface/     # усі змінені ключі розділу у форматі INI
```

Зверніть увагу на різницю між `color-scheme` і `gtk-theme`. Сучасні програми на GTK4 і libadwaita (Files, Settings, Text Editor) мають лише світлий і темний варіант і слухаються `color-scheme`; ключ `gtk-theme` впливає тільки на старіші програми GTK3. Тому «встановив тему, а половина вікон не змінилась» — це не помилка, а два покоління бібліотеки.

Адміністратор може задати значення за замовчуванням для всіх користувачів і **заблокувати** ключі — так налаштовують комп'ютерні класи й корпоративні ПК:

```bash
# /etc/dconf/profile/user            — які бази читати
user-db:user
system-db:local

# /etc/dconf/db/local.d/00-screensaver — значення для всіх
[org/gnome/desktop/session]
idle-delay=uint32 300

# /etc/dconf/db/local.d/locks/screensaver — заборонити змінювати
/org/gnome/desktop/session/idle-delay
```

Після зміни цих файлів виконують `sudo dconf update`. У KDE аналогічний механізм називається **Kiosk**: рядок налаштування з позначкою `[$i]` стає незмінним.

### Розширення GNOME

**Розширення** (extensions) — програми мовою JavaScript, які GNOME Shell завантажує у власний процес і які можуть змінити будь-що в інтерфейсі.

| Розширення | Що дає |
|------------|--------|
| **Dash to Dock / Dash to Panel** | Постійний док або панель задач як у Windows |
| **AppIndicator Support** | Значки фонових програм у треї (Telegram, Dropbox) |
| **Clipboard Indicator** | Історія буфера обміну |
| **GSConnect** | Реалізація KDE Connect для GNOME: сповіщення й файли з телефона |
| **Caffeine** | Тимчасово не вимикати екран і не засинати |
| **Vitals** | Температура, частота процесора, вентилятори на панелі |
| **Blur my Shell** | Розмиття фону панелі та огляду |

```bash
sudo apt install gnome-shell-extension-manager   # графічний менеджер розширень
gnome-extensions list --enabled                  # увімкнені
gnome-extensions info ім'я@автор                 # версія, стан, шлях
gnome-extensions disable ім'я@автор
ls ~/.local/share/gnome-shell/extensions/        # встановлені користувачем
ls /usr/share/gnome-shell/extensions/            # встановлені з пакетів
```

Ідентифікатор розширення має вигляд `ім'я@автор`, наприклад `dash-to-dock@micxgx.gmail.com`. Оскільки розширення працює всередині gnome-shell, помилка в ньому може «покласти» всю оболонку, а кожен новий випуск GNOME здатен зламати розширення, бо внутрішній API не стабільний. У GNOME 45 розширення взагалі переписали на модулі ES, і старі перестали завантажуватися. Звідси практичне правило: якщо після оновлення робочий стіл поводиться дивно, першим ділом вимкніть розширення (`gnome-extensions disable` або `gsettings set org.gnome.shell disable-user-extensions true`).

## Налаштування KDE Plasma

### System Settings

**System Settings** (`systemsettings`) у KDE об'єднує те, що в GNOME розкидано між Settings, Tweaks і розширеннями: вигляд, поведінку вікон, ефекти, панелі, гарячі клавіші, екран входу. Окремі розділи відкриваються командою `kcmshell6`:

```bash
systemsettings                        # у Plasma 5 — systemsettings5
kcmshell6 --list | head               # доступні модулі налаштувань
kcmshell6 kcm_kwin_virtualdesktops    # один модуль окремим вікном
```

### Де KDE зберігає налаштування

На відміну від GNOME, KDE тримає налаштування у звичайних текстових INI-файлах у `~/.config`: `kdeglobals` (кольори, шрифти), `kwinrc` (менеджер вікон), `plasma-org.kde.plasma.desktop-appletsrc` (панелі й віджети). Їх можна відкрити в редакторі, порівняти `diff` і зберегти в Git.

```bash
ls ~/.config/*rc | head
kreadconfig6 --file kdeglobals --group General --key ColorScheme
kwriteconfig6 --file kwinrc --group Windows --key FocusPolicy FocusFollowsMouse
busctl --user call org.kde.KWin /KWin org.kde.KWin reconfigure   # перечитати
```

Останній рядок показує, як спілкуються частини середовища: `kwriteconfig6` лише змінює файл, а щоб KWin підхопив зміну без перезапуску, йому надсилають повідомлення через D-Bus.

### Віджети Plasma

**Віджети** (плазмоїди) — невеликі програми на панелі чи робочому столі: годинник, монітор системи, нотатки, погода, керування плеєром, KDE Connect, вміст теки на робочому столі (Folder View). Додають їх з контекстного меню: правий клік → «Додати віджети» (Add Widgets) або режим редагування. Нові віджети й теми завантажуються з KDE Store прямо з налаштувань кнопкою «Get New».

## Автозапуск і .desktop-файли

### Будова .desktop-файлу

Кожен значок у меню програм — це текстовий **.desktop-файл** за специфікацією freedesktop.org. Системні лежать у `/usr/share/applications/`, власні — у `~/.local/share/applications/`, snap- і flatpak-програми — у `/var/lib/snapd/desktop/applications/` та `/var/lib/flatpak/exports/share/applications/`.

```ini
[Desktop Entry]
Type=Application
Name=Резервна копія
Name[en]=Backup
Comment=Скопіювати документи на флешку
Exec=/home/student/scripts/backup.sh %F
Icon=drive-harddisk
Terminal=true
Categories=Utility;
```

| Ключ | Значення |
|------|----------|
| `Exec` | Команда запуску; `%F` — список файлів, які перетягнули на значок, `%U` — список URL |
| `Name[uk]`, `Name[en]` | Назва різними мовами — середовище покаже ту, що відповідає мові системи |
| `Terminal=true` | Запустити у вікні терміналу (для консольних скриптів) |
| `Categories` | Розділ меню |
| `MimeType` | Які типи файлів програма вміє відкривати |
| `Hidden=true` | Файл «вимкнено»: так можна перекрити системний файл власним |

```bash
desktop-file-validate ~/.local/share/applications/backup.desktop   # перевірити синтаксис
gtk-launch backup                      # запустити за іменем файлу без .desktop
```

### Автозапуск після входу

Файл, покладений у `~/.config/autostart/`, запускається після входу в будь-якому середовищі, що дотримується стандарту XDG: GNOME, KDE, Xfce, Cinnamon. Системний автозапуск для всіх — у `/etc/xdg/autostart/`. Щоб вимкнути системний автозапуск лише для себе, досить створити в `~/.config/autostart/` файл з тим самим іменем і рядком `Hidden=true`: файл користувача має пріоритет.

```bash
ls /etc/xdg/autostart/                  # що запускається для всіх
mkdir -p ~/.config/autostart
cp /usr/share/applications/org.gnome.Calendar.desktop ~/.config/autostart/
```

### Служби користувача systemd

Для фонових програм, які мають перезапускатися після збою й писати журнал, надійніший спосіб — **служба користувача** systemd. Вона працює від вашого імені, без sudo, а її файл лежить у `~/.config/systemd/user/`.

```ini
# ~/.config/systemd/user/sync-notes.service
[Unit]
Description=Синхронізація нотаток
PartOf=graphical-session.target
After=graphical-session.target

[Service]
ExecStart=%h/scripts/sync-notes.sh
Restart=on-failure
RestartSec=5

[Install]
WantedBy=graphical-session.target
```

```bash
systemctl --user daemon-reload                     # перечитати файли служб
systemctl --user enable --now sync-notes.service   # увімкнути й запустити
systemctl --user status sync-notes.service
journalctl --user -u sync-notes.service -f         # журнал наживо
```

`%h` systemd замінить на шлях до домашнього каталогу, тому файл не прив'язаний до імені користувача. `WantedBy=graphical-session.target` разом із `PartOf` означає «запускати разом із графічним сеансом і зупиняти, коли він завершиться». Служба без графіки (скажімо, синхронізація файлів) може натомість мати `WantedBy=default.target`, і тоді вона стартує з першим входом будь-якого типу, навіть через SSH.

## Файли, типи й смітник

### Чим відкрити файл: MIME-типи

Коли ви двічі клацаєте файл, середовище визначає його **MIME-тип** (за вмістом і розширенням) і шукає програму, що заявила цей тип у полі `MimeType` свого .desktop-файлу. Ваш вибір «Завжди відкривати в…» записується у `~/.config/mimeapps.list`.

```bash
xdg-mime query filetype звіт.pdf                     # application/pdf
xdg-mime query default application/pdf               # org.gnome.Evince.desktop
xdg-mime default org.gnome.Evince.desktop application/pdf
xdg-open звіт.pdf                                     # відкрити так, як відкрило б середовище
cat ~/.config/mimeapps.list
```

`xdg-open` — те, що варто використовувати у скриптах замість назви конкретної програми: він працює в будь-якому середовищі й поважає вибір користувача.

### Смітник

Команда `rm` видаляє файл назавжди — смітника для неї не існує. Смітник робочого столу — це просто каталог `~/.local/share/Trash/` зі специфікацією freedesktop.org: у `files/` лежить сам файл, у `info/` — текстовий файл `.trashinfo` з початковим шляхом і часом видалення. Тому відновлення працює однаково в Nautilus, Dolphin і Thunar.

```bash
gio trash чернетка.txt                  # у смітник, а не назавжди
gio list trash://                       # що в смітнику
cat ~/.local/share/Trash/info/чернетка.txt.trashinfo
gio trash --empty                       # очистити
```

### Каталоги користувача

Назви «Документи», «Завантаження», «Музика» залежать від мови системи й записані у `~/.config/user-dirs.dirs`. Скрипт, у якому жорстко прописано `~/Downloads`, зламається в українській локалі — правильно питати систему:

```bash
cat ~/.config/user-dirs.dirs
xdg-user-dir DOWNLOAD        # /home/student/Завантаження
xdg-user-dir DESKTOP
```

## Де живе ваш робочий стіл

Усе, про що йшлося вище, зводиться до кількох каталогів, описаних специфікацією **XDG Base Directory**. Раніше кожна програма клала свій прихований файл просто в домашній каталог (`~/.bashrc`, `~/.vimrc`, `~/.mozilla`), і частина так робить досі. Сучасні програми дотримуються стандарту, а змінні `XDG_CONFIG_HOME`, `XDG_DATA_HOME`, `XDG_CACHE_HOME` дозволяють перенести ці каталоги.

```
┌─────────────────────────────────────────────────────────────────────┐
│                       ДЕ ЖИВЕ ВАШ РОБОЧИЙ СТІЛ                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ~/                                  ваш домашній каталог           │
│  ├── .config/        XDG_CONFIG_HOME  налаштування програм          │
│  │   ├── autostart/                    автозапуск після входу       │
│  │   ├── dconf/user                    база налаштувань GNOME       │
│  │   ├── kdeglobals, kwinrc…           налаштування KDE (INI)       │
│  │   ├── mimeapps.list                 чим відкривати файли         │
│  │   ├── systemd/user/                 служби користувача           │
│  │   └── user-dirs.dirs                де «Завантаження», «Музика»  │
│  ├── .local/                                                        │
│  │   ├── share/      XDG_DATA_HOME    дані програм                  │
│  │   │   ├── applications/             власні .desktop-файли        │
│  │   │   ├── gnome-shell/extensions/   розширення GNOME             │
│  │   │   ├── icons/, themes/, fonts/   значки, теми, шрифти         │
│  │   │   └── Trash/                    смітник                      │
│  │   └── state/      XDG_STATE_HOME   історія, журнали програм      │
│  ├── .cache/         XDG_CACHE_HOME   кеш: можна видалити без втрат │
│  └── Документи/, Завантаження/…       каталоги з user-dirs.dirs     │
│                                                                     │
│  Скопіюйте ~/.config і ~/.local/share на новий комп'ютер — і        │
│  отримаєте свій робочий стіл з усіма налаштуваннями.                │
└─────────────────────────────────────────────────────────────────────┘
```

```bash
du -sh ~/.cache ~/.config ~/.local/share 2>/dev/null   # хто скільки займає
ls -a ~ | grep '^\.' | head -20                       # «старі» приховані файли
```

`~/.cache` часто займає гігабайти й може бути видалений повністю: програми відтворять кеш. `~/.config` видаляти не можна — це і є ваші налаштування. Якщо ж робочий стіл «зламався», типовий прийом — перейменувати каталог налаштувань однієї програми (`mv ~/.config/dconf ~/.config/dconf.bak`), увійти знову й подивитися, чи повернулося все до стандартного стану.

## 🏢 Real World: Desktop Linux в організаціях

```
┌─────────────────────────────────────────────────────────────────────┐
│                     LINUX DESKTOP В ОРГАНІЗАЦІЯХ                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ЖАНДАРМЕРІЯ ФРАНЦІЇ                                                │
│  ├── GendBuntu — власна збірка Ubuntu з 2008 року                   │
│  ├── Понад 100 000 робочих станцій переведено на Linux              │
│  └── Єдиний образ і централізовані налаштування середовища          │
│                                                                     │
│  МЮНХЕН (LiMux) — повчальна історія                                 │
│  ├── 2004–2013: близько 15 000 ПК міської ради на Linux             │
│  ├── 2017: рада проголосувала за повернення до Windows              │
│  └── Урок: технічно міграція вдалася, а впала на сумісності         │
│      документів і політиці — не лише на самій ОС                    │
│                                                                     │
│  ЗЕМЛЯ ШЛЕЗВІГ-ГОЛЬШТЕЙН (Німеччина)                                │
│  └── З 2024 року переводить близько 30 000 робочих місць            │
│      на Linux і LibreOffice заради цифрового суверенітету           │
│                                                                     │
│  VALVE STEAM DECK                                                   │
│  └── Мільйони користувачів мають повноцінний KDE Plasma             │
│      у «режимі робочого столу» портативної консолі                  │
│                                                                     │
│  CERN, УНІВЕРСИТЕТИ, КОМП'ЮТЕРНІ КЛАСИ                              │
│  ├── Робочі станції на AlmaLinux, RHEL, Ubuntu                      │
│  └── Заблоковані ключі dconf: студент не змінить проксі             │
│      чи екран блокування, але вибере собі шпалери                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 💼 Career Spotlight

```
┌─────────────────────────────────────────────────────────────────────┐
│                         КАР'ЄРНІ МОЖЛИВОСТІ                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  LINUX DESKTOP ADMINISTRATOR                                        │
│  Готує образи робочих станцій, політики dconf і KDE Kiosk,          │
│  автозапуск корпоративних програм, підтримку користувачів           │
│  Зарплата: $50K-$90K (USA) | €35K-€65K (EU)                         │
│  Компанії: держсектор, освіта, банки, VFX-студії                    │
│                                                                     │
│  ENDPOINT / ENTERPRISE DESKTOP ENGINEER                             │
│  Керує тисячами ПК: Ansible, Foreman, Landscape, образи             │
│  Зарплата: $80K-$130K (USA) | €50K-€85K (EU)                        │
│  Компанії: Red Hat, Canonical, SUSE, інтегратори                    │
│                                                                     │
│  LINUX SUPPORT SPECIALIST                                           │
│  Перша лінія підтримки: «не працює принтер», «зник док»             │
│  Зарплата: $40K-$70K (USA) | €28K-€45K (EU)                         │
│  Компанії: служби підтримки, аутсорсинг ІТ                          │
│                                                                     │
│  DESKTOP DEVELOPER (GNOME, KDE)                                     │
│  Розширення, аплети, самі середовища: JavaScript, C, C++, Qt        │
│  Зарплата: $80K-$150K (USA) | €50K-€90K (EU)                        │
│  Компанії: Red Hat, Canonical, KDE e.V., System76                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔗 Корисні ресурси

### Онлайн-практика

| Ресурс | Опис | Посилання |
|--------|------|-----------|
| **GNOME Help** | Офіційна довідка користувача GNOME | help.gnome.org |
| **GNOME System Administration Guide** | Політики dconf, блокування ключів, налаштування для організацій | help.gnome.org/admin |
| **KDE UserBase** | Посібники користувача KDE, зокрема Kiosk | userbase.kde.org |
| **XDG Base Directory Specification** | Стандарт каталогів ~/.config, ~/.local/share, ~/.cache | specifications.freedesktop.org |
| **ArchWiki: XDG Base Directory** | Які програми дотримуються стандарту, а які ні | wiki.archlinux.org/title/XDG_Base_Directory |
| **dotfiles.github.io** | Збірка прикладів і інструментів для керування dotfiles | dotfiles.github.io |

## 📋 Cheat Sheet

```
┌─────────────────────────────────────────────────────────────────────┐
│                   ШПАРГАЛКА: РОБОЧИЙ СТІЛ ЯК ФАЙЛИ                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  НАЛАШТУВАННЯ GNOME (dconf):                                        │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ gsettings get|set|reset СХЕМА КЛЮЧ  → один ключ               │  │
│  │ gsettings list-keys СХЕМА           → ключі схеми             │  │
│  │ dconf watch /                       → бачити зміни наживо     │  │
│  │ dconf dump /org/gnome/ > f.ini      → зберегти                │  │
│  │ dconf load /org/gnome/ < f.ini      → відновити               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  НАЛАШТУВАННЯ KDE (INI-файли в ~/.config):                          │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ kreadconfig6  --file kdeglobals --group G --key K             │  │
│  │ kwriteconfig6 --file kwinrc --group G --key K ЗНАЧЕННЯ        │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ПРОГРАМИ Й АВТОЗАПУСК:                                             │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ ~/.local/share/applications/*.desktop → власні ярлики         │  │
│  │ ~/.config/autostart/*.desktop         → запуск після входу    │  │
│  │ desktop-file-validate f.desktop       → перевірка синтаксису  │  │
│  │ systemctl --user enable --now S       → служба користувача    │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ФАЙЛИ Й ТИПИ:                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ xdg-open ФАЙЛ                     → відкрити програмою типу   │  │
│  │ xdg-mime query filetype ФАЙЛ      → MIME-тип файлу            │  │
│  │ xdg-mime query default ТИП        → програма за замовчуванням │  │
│  │ gio trash ФАЙЛ                    → у смітник (rm — назавжди) │  │
│  │ xdg-user-dir DOWNLOAD             → шлях до «Завантажень»     │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 🎯 Міні-проект (30 хв)

### Завдання: Робочий стіл як код

Опишіть свій робочий стіл скриптом, збережіть налаштування у файл і переконайтеся, що зможете відновити їх на будь-якому комп'ютері. Так адміністратори готують однакові робочі місця, а розробники тримають свої «dotfiles» у Git.

**Кроки:**

1. Зробіть резервну копію поточних налаштувань — на випадок, якщо щось піде не так:
```bash
mkdir -p ~/dotfiles/gnome
dconf dump / > ~/dotfiles/gnome/dconf-original.ini
```

2. Знайдіть потрібні ключі самі. Запустіть `dconf watch /` і в іншому вікні змініть у Settings три-чотири параметри, які вам подобаються. Запишіть шляхи й значення, що з'явилися в терміналі.

3. Напишіть скрипт налаштування `~/dotfiles/gnome/setup.sh`, куди додайте знайдені ключі:
```bash
#!/usr/bin/env bash
# setup.sh — мій робочий стіл GNOME одним запуском
set -e

# Вигляд
gsettings set org.gnome.desktop.interface color-scheme 'prefer-dark'
gsettings set org.gnome.desktop.interface clock-show-weekday true
gsettings set org.gnome.desktop.interface show-battery-percentage true

# Вікна
gsettings set org.gnome.desktop.wm.preferences button-layout 'appmenu:minimize,maximize,close'
gsettings set org.gnome.mutter center-new-windows true

# Робочі столи: чотири фіксовані
gsettings set org.gnome.mutter dynamic-workspaces false
gsettings set org.gnome.desktop.wm.preferences num-workspaces 4

# Скрипт збереження налаштувань
cat > ~/dotfiles/gnome/save.sh << 'EOF'
#!/bin/sh
dconf dump /org/gnome/ > "$HOME/dotfiles/gnome/gnome.ini"
notify-send "Налаштування збережено" "$HOME/dotfiles/gnome/gnome.ini"
EOF
chmod +x ~/dotfiles/gnome/save.sh

# Ярлик для нього в меню програм. EOF без лапок: $HOME підставиться
# одразу, бо в полі Exec змінні не розкриваються
mkdir -p ~/.local/share/applications
cat > ~/.local/share/applications/dotfiles-save.desktop << EOF
[Desktop Entry]
Type=Application
Name=Зберегти налаштування
Exec=$HOME/dotfiles/gnome/save.sh
Icon=document-save
Categories=Utility;
EOF
desktop-file-validate ~/.local/share/applications/dotfiles-save.desktop

echo "Готово. Поточна схема: $(gsettings get org.gnome.desktop.interface color-scheme)"
```

4. Запустіть скрипт і перевірте результат:
```bash
chmod +x ~/dotfiles/gnome/setup.sh
~/dotfiles/gnome/setup.sh
```
Відкрийте огляд (`Super`), наберіть «Зберегти налаштування» — у меню з'явилася ваша програма. Запустіть її й переконайтеся, що файл `~/dotfiles/gnome/gnome.ini` створено.

5. Перевірте відновлення. Скиньте один з ключів і поверніть його з файлу:
```bash
gsettings reset org.gnome.mutter center-new-windows
dconf load /org/gnome/ < ~/dotfiles/gnome/gnome.ini
gsettings get org.gnome.mutter center-new-windows     # true
```

6. Порівняйте початковий і поточний стан — це і є перелік ваших змін:
```bash
dconf dump / > /tmp/now.ini
diff ~/dotfiles/gnome/dconf-original.ini /tmp/now.ini
```

**Очікуваний результат:**

- Каталог `~/dotfiles/gnome/` зі скриптом `setup.sh`, резервною копією і файлом `gnome.ini`.
- Власний значок у меню програм, створений .desktop-файлом.
- Уміння знайти ключ будь-якого налаштування через `dconf watch` і відновити налаштування з файлу.

**Бонус (для допитливих):**

- Зробіть `~/dotfiles` репозиторієм Git і додайте `setup.sh` та `gnome.ini`.
- Додайте до скрипта увімкнення розширень: `gnome-extensions enable ім'я@автор`.
- Налаштуйте в KDE одну й ту саму річ двома способами — через System Settings і через `kwriteconfig6` — і знайдіть змінений рядок у `~/.config`.
- Створіть службу користувача systemd, яка щовечора зберігає `dconf dump`, разом із таймером `.timer`.

## Тест для самоперевірки

Десять запитань, у кожному одна правильна відповідь. Якщо тема винесена вашій групі на самостійне опрацювання, цей самий тест публікується в Google Classroom — 10 балів, по одному за кожне запитання.

**1.** Чим GNOME Tweaks відрізняється від GNOME Settings?

- Tweaks — це та сама панель з іншою назвою
- Tweaks керує лише мережею
- Tweaks працює тільки в KDE
- Tweaks відкриває приховані налаштування, яких немає в основній панелі

**2.** Яка утиліта дає змогу змінювати налаштування GNOME з командного рядка?

- systemctl
- gnome-tweaks
- gsettings
- kwriteconfig6

**3.** Яка команда змінить тему GTK?

- systemctl --user restart gtk
- gsettings set org.gnome.desktop.interface gtk-theme "Назва"
- gsettings get org.gnome.desktop.interface gtk-theme
- gnome-extensions enable gtk-theme

**4.** Де зберігаються встановлені користувачем розширення GNOME?

- ~/.config/autostart/
- /usr/share/xsessions/
- ~/.local/share/gnome-shell/extensions/
- ~/.themes/

**5.** У якому каталозі лежать файли автозапуску програм користувача?

- ~/.local/share/icons/
- ~/.themes/
- /etc/systemd/system/
- ~/.config/autostart/

**6.** Який формат мають файли автозапуску?

- .sh
- .desktop
- .service
- .conf

**7.** Чим автозапуск через systemd-службу користувача кращий за файл .desktop?

- .desktop працює лише в KDE
- службою можна керувати: перезапускати, дивитися журнал, задавати залежності
- вона не потребує прав користувача
- вона запускається швидше

**8.** Куди складають користувацькі теми оформлення GTK?

- ~/.local/share/themes/ (або старий ~/.themes/)
- ~/.config/autostart/
- /usr/share/themes/backup/
- ~/.local/share/gnome-shell/extensions/

**9.** Що таке Plasma Widgets?

- набір гарячих клавіш
- теми оформлення вікон
- невеликі аплети, які додають на панель або робочий стіл у KDE
- розширення для браузера

**10.** Чим KDE Plasma відрізняється від GNOME за підходом до налаштування?

- у GNOME більше вбудованих налаштувань, ніж у KDE
- обидва середовища налаштовуються лише через файли конфігурації
- KDE взагалі не дозволяє змінювати панель
- у KDE кастомізація вбудована в системні налаштування, у GNOME її дають розширення

## Підсумок

| Термін | Визначення |
|--------|------------|
| **dconf** | Двійкова база налаштувань GNOME у `~/.config/dconf/user` |
| **gsettings** | Інструмент читання й запису налаштувань GNOME через схеми з перевіркою типів |
| **Схема GSettings** | Опис ключів: тип, значення за замовчуванням, допустимі значення |
| **GNOME Tweaks** | Графічний інтерфейс до ключів dconf, яких немає в Settings |
| **Розширення GNOME** | Код на JavaScript, що працює всередині GNOME Shell і змінює інтерфейс |
| **Віджет Plasma** | Невелика програма на панелі чи робочому столі KDE |
| **kwriteconfig6** | Утиліта зміни INI-файлів налаштувань KDE з командного рядка |
| **.desktop-файл** | Опис програми для меню й автозапуску за стандартом freedesktop.org |
| **Служба користувача systemd** | Фонова програма, запущена від імені користувача: `systemctl --user` |
| **MIME-тип** | Тип вмісту файлу (`application/pdf`), за яким обирається програма |
| **XDG Base Directory** | Стандарт каталогів `~/.config`, `~/.local/share`, `~/.cache`, `~/.local/state` |
| **Dotfiles** | Файли налаштувань у домашньому каталозі, які зберігають і переносять між машинами |

| Каталог | Призначення |
|---------|-------------|
| `~/.config/autostart/` | Автозапуск після входу |
| `~/.config/systemd/user/` | Служби користувача |
| `~/.local/share/applications/` | Власні ярлики програм |
| `~/.local/share/gnome-shell/extensions/` | Розширення GNOME |
| `~/.local/share/themes/` (раніше `~/.themes/`) | Теми GTK |
| `~/.local/share/icons/` | Значки й курсори |
| `~/.local/share/Trash/` | Смітник |

На наступній лекції — файлова система Linux: ієрархія каталогів, inode, посилання й монтування.
