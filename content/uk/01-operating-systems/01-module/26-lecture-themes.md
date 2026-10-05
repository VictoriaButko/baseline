---
title: "Теми робочого стола. Шрифти. Друк"
type: lecture
order: 26
preview: "Теми GTK і Qt, значки й курсори, як Linux обирає й малює шрифти, fontconfig, система друку CUPS і друк без драйверів."
---

## Hook / Захоплюючий вступ

Ви відкриваєте на Linux документ, створений у Word, — і верстка «поїхала»: рядки переносяться не там, таблиця не влазить на сторінку. А на сайті замість кількох символів — порожні прямокутники □. Обидві проблеми мають ту саму причину: у системі немає потрібного шрифту, і вона підставила інший. Знати, **як саме Linux обирає шрифт**, — практична навичка: вона відрізняє «налаштую за п'ять хвилин» від «перевстановлю систему».

**Запитання до аудиторії**: чому сайт може показувати емодзі кольоровими, хоча шрифт тексту їх не містить? Хто «здогадується», де взяти відсутній символ?

## Теми оформлення

Програми для Linux будують інтерфейс на одній із двох бібліотек (toolkit) — **GTK** (GNOME, Xfce, Cinnamon, MATE, GIMP) або **Qt** (KDE Plasma, LXQt, VLC, Telegram). Кожна має власний механізм тем, тому «тема робочого столу» насправді складається з кількох незалежних частин.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    З ЧОГО СКЛАДАЄТЬСЯ ОФОРМЛЕННЯ                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐     │
│  │ Тема GTK         │ │ Стиль Qt         │ │ Тема оболонки    │     │
│  │ програми GTK3    │ │ програми Qt      │ │ панель, огляд    │     │
│  │ Adwaita, Arc     │ │ Breeze, Kvantum  │ │ лише GNOME Shell │     │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘     │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐     │
│  │ Значки           │ │ Курсори          │ │ Звуки            │     │
│  │ Adwaita, Papirus │ │ Adwaita, Bibata  │ │ freedesktop      │     │
│  │ + запасна hicolor│ │ Breeze           │ │                  │     │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘     │
│                                                                     │
│  Кожна частина змінюється окремо і лежить у своєму каталозі:        │
│  themes/, icons/ (там же курсори), sounds/ — у /usr/share для       │
│  всіх і в ~/.local/share для себе.                                  │
└─────────────────────────────────────────────────────────────────────┘
```

### GTK: теми й libadwaita

**GTK** (спершу — GIMP Toolkit, 1997) пройшов версії 2, 3 і 4. Тема GTK3 — це набір файлів CSS, що описують вигляд кнопок, полів і меню:

```bash
ls /usr/share/themes/               # системні теми
ls ~/.local/share/themes/ ~/.themes/ 2>/dev/null   # теми користувача

# Будова теми
# Arc-Dark/
# ├── gtk-3.0/gtk.css      вигляд програм GTK3
# ├── gtk-4.0/gtk.css      частково — для GTK4
# └── index.theme          назва й опис

sudo apt install arc-theme                                  # тема з пакета
gsettings set org.gnome.desktop.interface gtk-theme 'Arc-Dark'
```

Важлива зміна останніх років: програми GNOME на **GTK4 + libadwaita** (Files, Settings, Text Editor, Calendar) теми GTK **не підтримують** — лише світлий і темний варіант та акцентний колір. У 2021 році розробники незалежних програм GNOME опублікували відкритий лист із проханням до дистрибутивів не перефарбовувати їхні програми: сторонні теми ламали інтерфейси, а скарги отримували автори програм. Тому тема Arc змінить вигляд Firefox і GIMP, але не Files.

### Qt: стилі для KDE і не лише

```bash
# У KDE Plasma: System Settings → Colors & Themes (глобальна тема, кольори, стиль)

# Щоб програми Qt у GNOME чи Xfce виглядали охайно:
sudo apt install qt6ct              # налаштування стилю для Qt6 (qt5ct — для Qt5)
echo 'export QT_QPA_PLATFORMTHEME=qt6ct' >> ~/.profile

sudo apt install qt-style-kvantum   # Kvantum — рушій тем Qt з темами під GTK-стилі
```

У зворотному напрямку KDE робить усе сама: у System Settings є розділ «Стиль програм GNOME/GTK», який застосовує Breeze до програм GTK. Тож найохайніший результат — теми, що мають і GTK-, і Qt-варіант: Breeze (з KDE), Adwaita (з портом adwaita-qt) або Materia (GTK + Kvantum).

### Значки й курсори

Теми значків описує специфікація freedesktop.org: кожна тема — каталог у `icons/` з файлом `index.theme`, де рядок `Inherits=` задає, у якій темі шукати відсутні значки. Останньою в ланцюжку завжди стоїть **hicolor** — туди програми кладуть власні значки. Саме тому нова тема не «губить» значок щойно встановленої програми.

```bash
ls /usr/share/icons/                             # теми значків і курсорів
grep Inherits /usr/share/icons/Papirus/index.theme

sudo apt install papirus-icon-theme
gsettings set org.gnome.desktop.interface icon-theme 'Papirus-Dark'

# Курсори — теж тема значків, але з підкаталогом cursors/
ls -d /usr/share/icons/*/cursors
gsettings set org.gnome.desktop.interface cursor-theme 'Adwaita'
gsettings set org.gnome.desktop.interface cursor-size 32
```

### Темний режим

```bash
gsettings set org.gnome.desktop.interface color-scheme 'prefer-dark'   # 'default' — світлий
GTK_THEME=Adwaita:dark gimp          # темний варіант для однієї програми GTK3
```

Ключ `color-scheme` — це не тема, а побажання, яке через портал `org.freedesktop.appearance` отримують усі програми: GTK4, Qt, Firefox і Chromium (для сайтів із CSS `prefers-color-scheme`). Темний режим помітно економить заряд на OLED-екранах, де чорний піксель не світиться; для звичайних РК-екранів це радше питання смаку й освітлення в кімнаті, ніж здоров'я очей.

## Шрифти

### Як Linux обирає й малює шрифт

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ВІД ЛІТЕРИ ДО ПІКСЕЛІВ                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Програма просить: «шрифт sans-serif, 11 пт, текст: Привіт 👋»      │
│        │                                                            │
│        ▼                                                            │
│  fontconfig   підбирає файл шрифту: sans-serif → Noto Sans;         │
│        │      для символу 👋 якого в Noto Sans немає, — запасний    │
│        │      шрифт Noto Color Emoji                                │
│        ▼                                                            │
│  HarfBuzz     формує текст (shaping): з літер складає гліфи,        │
│        │      лігатури -> і => в шрифтах для коду, арабське письмо  │
│        ▼                                                            │
│  FreeType     растеризує гліфи в пікселі: згладжування, хінтинг     │
│        │                                                            │
│        ▼                                                            │
│  toolkit (GTK, Qt) малює готові пікселі у вікні                     │
│                                                                     │
│  Якщо жоден шрифт не має потрібного символу, на екрані —            │
│  порожній прямокутник «тофу» □. Проєкт Google Noto названо          │
│  саме так: «No more tofu».                                          │
└─────────────────────────────────────────────────────────────────────┘
```

**fontconfig** — бібліотека, до якої звертаються всі програми з питанням «яким файлом намалювати цей текст». Програма просить не конкретний файл, а опис: родину (`sans-serif`, `monospace` чи назву), розмір, насиченість, мову. fontconfig порівнює опис з усіма шрифтами в кеші й повертає найкращий збіг, а для відсутніх символів — запасні шрифти.

```bash
fc-list : family | sort -u | head        # родини встановлених шрифтів
fc-list :lang=uk family | sort -u        # лише ті, що мають українську абетку
fc-match sans-serif                      # що система розуміє під sans-serif
fc-match "Arial"                         # що підставиться замість Arial
fc-match -s monospace | head -5          # увесь ланцюжок запасних шрифтів
```

Спробуйте `fc-match Arial`: якщо в системі є шрифти Liberation, fontconfig підставить `Liberation Sans` — шрифт із тими самими метриками (шириною кожної літери), що й Arial. Тому документ Word зберігає верстку. Якщо підставився інший шрифт, рядки мають іншу довжину, і верстка «їде» — це і є розгадка вступної загадки.

### Розташування та встановлення

| Каталог | Для кого |
|---------|----------|
| `/usr/share/fonts/` | шрифти з пакетів, для всіх |
| `/usr/local/share/fonts/` | встановлені адміністратором вручну, для всіх |
| `~/.local/share/fonts/` | для одного користувача (старий шлях — `~/.fonts/`) |

```bash
mkdir -p ~/.local/share/fonts
cp ~/Завантаження/Inter/*.ttf ~/.local/share/fonts/
fc-cache -f                           # оновити кеш
fc-list | grep -i inter               # перевірити

# З пакетів
sudo apt install fonts-noto-core fonts-noto-color-emoji   # Noto й кольорові емодзі
sudo apt install fonts-jetbrains-mono fonts-firacode fonts-cascadia-code
sudo apt install fonts-liberation                         # заміна Arial, Times, Courier
sudo apt install ttf-mscorefonts-installer   # шрифти Microsoft: завантажує їх із мережі
```

Таблиця 1 — Популярні шрифти

| Шрифт | Тип | Примітка |
|-------|-----|----------|
| **Noto Sans / Serif** | інтерфейс, документи | Google; усі мови й системи письма Unicode |
| **Inter** | інтерфейс | Спроєктований для екранів; основа Adwaita Sans у GNOME 48 |
| **Ubuntu Sans** | інтерфейс | Системний шрифт Ubuntu з 24.04 |
| **Liberation Sans / Serif / Mono** | документи | Метрично сумісні з Arial, Times New Roman, Courier New |
| **JetBrains Mono** | код | Лігатури, висока «x» для читабельності |
| **Fira Code** | код | Лігатури для операторів `->`, `!=`, `>=` |
| **Cascadia Code** | код | Microsoft, шрифт Windows Terminal |

Формати: **TrueType** (.ttf) і **OpenType** (.otf) — для системи; **WOFF2** — стиснений варіант для вебсторінок. Змінні шрифти (variable fonts) зберігають у одному файлі всі насиченості — від тонкого до жирного.

### Згладжування і хінтинг

```bash
S=org.gnome.desktop.interface
gsettings set $S font-name 'Noto Sans 11'
gsettings set $S monospace-font-name 'JetBrains Mono 11'
gsettings set $S font-antialiasing 'grayscale'   # none, grayscale, rgba (субпіксельне)
gsettings set $S font-hinting 'slight'           # none, slight, medium, full
```

- **Згладжування** (antialiasing) — напівпрозорі пікселі на краях літер. Субпіксельне (`rgba`) використовує окремі червоний, зелений і синій субпікселі РК-екрана й дає трохи чіткіший текст на моніторах зі звичайною щільністю, але дає кольорові облямівки на OLED-екранах і повернутих моніторах. Нові версії GTK4 його взагалі не використовують.
- **Хінтинг** (hinting) — підганяння контурів літер під сітку пікселів. На екранах високої щільності він майже не потрібен; `slight` — розумний компроміс.

### Власні правила fontconfig

Правила fontconfig записують у XML-файл `~/.config/fontconfig/fonts.conf`. Рядок `<?xml …?>` має стояти **першим** у файлі — навіть коментар перед ним зробить файл непридатним, і fontconfig мовчки його проігнорує з попередженням у терміналі.

```xml
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">
<!-- ~/.config/fontconfig/fonts.conf -->
<fontconfig>
  <!-- Яким шрифтам віддавати перевагу для кожної родини -->
  <alias>
    <family>sans-serif</family>
    <prefer>
      <family>Inter</family>
      <family>Noto Sans</family>
    </prefer>
  </alias>
  <alias>
    <family>monospace</family>
    <prefer>
      <family>JetBrains Mono</family>
      <family>Noto Sans Mono</family>
    </prefer>
  </alias>
</fontconfig>
```

```bash
fc-cache -f
fc-match sans-serif            # Inter, якщо встановлено; інакше — Noto Sans
FC_DEBUG=1024 fc-match sans-serif 2>&1 | head   # які файли конфігурації прочитано
```

## Друк (CUPS)

**CUPS** (спершу Common Unix Printing System) — система друку Linux, macOS і більшості Unix. Її 1997 року створив Michael Sweet; 2007 року проєкт купила Apple, а нині його розвивають Sweet і спільнота **OpenPrinting** під егідою Linux Foundation.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ЯК ПРАЦЮЄ ДРУК У LINUX                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Застосунок (Firefox, LibreOffice)                                  │
│        │  завдання друку у форматі PDF по протоколу IPP             │
│        ▼                                                            │
│  cupsd — сервер друку           черга: /var/spool/cups/             │
│        │                        налаштування: /etc/cups/            │
│        ▼                                                            │
│  фільтри (cups-filters)         PDF → мова принтера: PCL,           │
│        │                        PostScript, растр PWG/URF           │
│        ▼                                                            │
│  бекенд (спосіб доставки)       usb://, ipp://, socket:// (9100)    │
│        │                                                            │
│        ▼                                                            │
│  принтер                                                            │
│                                                                     │
│  Вебінтерфейс: http://localhost:631   Журнал: /var/log/cups/        │
│                                                                     │
│  Друк без драйверів: сучасний мережевий принтер сам повідомляє      │
│  по IPP, що вміє (IPP Everywhere, AirPrint), і CUPS створює         │
│  чергу без жодного драйвера виробника.                              │
└─────────────────────────────────────────────────────────────────────┘
```

Друк у Linux — ще один приклад поділу на незалежні ланки: програма не знає мови принтера, вона лише віддає PDF; фільтри перетворюють його; бекенд доставляє байти по USB чи мережі. Тому одна програма друкує на будь-якому принтері, а новий спосіб підключення — це просто новий бекенд.

### Налаштування

```bash
sudo apt install cups                  # зазвичай уже встановлено на робочих станціях
systemctl status cups
sudo usermod -aG lpadmin $USER         # право адмініструвати принтери (після повторного входу)
xdg-open http://localhost:631          # вебінтерфейс: Administration → Add Printer

lpinfo -v                              # які пристрої бачить CUPS (USB, мережа)
driverless                             # мережеві принтери, яким не потрібен драйвер

# Черга для мережевого принтера без драйвера (IPP Everywhere)
sudo lpadmin -p Office -E -v ipp://192.168.1.100/ipp/print -m everywhere
sudo lpadmin -d Office                 # принтер за замовчуванням
```

Для старих принтерів, що не вміють IPP Everywhere, потрібні драйвери: Gutenprint (`printer-driver-gutenprint`) для багатьох струменевих, HPLIP (`hplip`) для HP, пакети виробника для Brother, Canon, Epson. Віртуальний принтер **CUPS-PDF** (`printer-driver-cups-pdf`) «друкує» у файли PDF у `~/PDF/`.

### Командний рядок

```bash
lpstat -p -d                           # принтери та принтер за замовчуванням
lp document.pdf                        # друк на типовий принтер
lp -d Office -n 2 document.pdf         # дві копії на Office
lp -o landscape -o sides=two-sided-long-edge document.pdf
lp -o page-ranges=1-3 document.pdf     # лише сторінки 1–3
lpstat -o                              # черга завдань (або lpq)
cancel Office-42                       # скасувати завдання
cancel -a Office                       # усі завдання принтера
sudo cupsdisable Office                # зупинити чергу; cupsenable — відновити
```

### Діагностика

```bash
sudo tail -f /var/log/cups/error_log   # журнал помилок
sudo cupsctl --debug-logging           # докладний журнал; --no-debug-logging — вимкнути
lpstat -t                              # повний стан: служба, черги, завдання
echo "Пробний друк" | lp -d Office     # найпростіше пробне завдання
```

Сервер друку — мережева служба, і до неї варто ставитися відповідально. У вересні 2024 року в службі автопошуку принтерів `cups-browsed` знайшли ланцюжок вразливостей: зловмисник із мережі міг «підкинути» фальшивий принтер, який виконував команду під час друку. Якщо автопошук мережевих принтерів не потрібен, службу вимикають: `sudo systemctl disable --now cups-browsed`.

## Практичне завдання

```bash
# 1. Поточне оформлення
S=org.gnome.desktop.interface
for k in color-scheme gtk-theme icon-theme cursor-theme font-name monospace-font-name; do
    echo "$k = $(gsettings get $S $k)"
done

# 2. Скільки шрифтів і скільки з українською абеткою
fc-list : family | sort -u | wc -l
fc-list :lang=uk family | sort -u | wc -l

# 3. Що підставиться замість Arial, Times New Roman і Courier New
for f in Arial "Times New Roman" "Courier New"; do fc-match "$f"; done

# 4. Ланцюжок запасних шрифтів для емодзі
fc-match -s "emoji" | head -3

# 5. Стан системи друку
lpstat -t

# 6. Віртуальний PDF-принтер і пробний друк
sudo apt install printer-driver-cups-pdf
lpstat -p                              # з'явилася черга PDF
echo "Привіт з CUPS" | lp -d PDF && sleep 3 && ls ~/PDF/
```

## 🏢 Real World: Як це використовують у великих компаніях

```
┌─────────────────────────────────────────────────────────────────────┐
│                 ОФОРМЛЕННЯ, ШРИФТИ Й ДРУК У ПРАКТИЦІ                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  CUPS І OPENPRINTING                                                │
│  ├── 1997: CUPS створює Michael Sweet (Easy Software Products)      │
│  ├── 2007: Apple купує CUPS — він досі друкує в кожному Mac         │
│  └── З 2020-х розвиток ведуть Sweet і спільнота OpenPrinting        │
│      під егідою Linux Foundation                                    │
│                                                                     │
│  ВЕРЕСЕНЬ 2024: ВРАЗЛИВОСТІ CUPS-BROWSED                            │
│  ├── Служба автопошуку принтерів слухала UDP-порт 631 з мережі      │
│  ├── Ланцюжок помилок дозволяв віддалено додати «принтер», що       │
│  │   виконає команду під час друку                                  │
│  └── Висновок адміністратора: вимикати непотрібні мережеві          │
│      служби — sudo systemctl disable --now cups-browsed             │
│                                                                     │
│  GOOGLE NOTO                                                        │
│  └── Шрифти для понад тисячі мов і всіх систем письма Unicode,      │
│      безкоштовно під ліцензією SIL Open Font License                │
│                                                                     │
│  LIBERATION (Red Hat, 2007)                                         │
│  └── Шрифти з тими самими метриками, що Arial, Times New Roman      │
│      і Courier New: документ Word у LibreOffice не «їде»            │
│                                                                     │
│  СИСТЕМНІ ШРИФТИ ДИСТРИБУТИВІВ                                      │
│  ├── Ubuntu (2010) і Ubuntu Sans (24.04) від студії Dalton Maag     │
│  └── GNOME 48 (2025): Adwaita Sans і Adwaita Mono замість Cantarell │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 💼 Career Spotlight

```
┌─────────────────────────────────────────────────────────────────────┐
│                         КАР'ЄРНІ МОЖЛИВОСТІ                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PRINT / ENDPOINT ADMINISTRATOR                                     │
│  Сервери друку CUPS, мережеві принтери, образи робочих станцій      │
│  Зарплата: $50K-$85K (USA) | €35K-€60K (EU)                         │
│  Компанії: університети, лікарні, держсектор, ритейл (POS)          │
│                                                                     │
│  TYPE / FONT ENGINEER                                               │
│  Розробка шрифтів, підтримка мов і систем письма, OpenType          │
│  Зарплата: $80K-$150K (USA) | €45K-€85K (EU)                        │
│  Компанії: Google Fonts, Adobe, Monotype, незалежні студії          │
│                                                                     │
│  UI / DESIGN SYSTEMS DEVELOPER                                      │
│  Теми й компоненти інтерфейсу: GTK CSS, libadwaita, Qt QML          │
│  Зарплата: $80K-$140K (USA) | €45K-€85K (EU)                        │
│  Компанії: Canonical, Red Hat, System76, KDAB                       │
│                                                                     │
│  Українська кирилиця — окремий фах: шрифт без ґ, є, і, ї            │
│  непридатний для українських інтерфейсів і документів               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔗 Корисні ресурси

### Онлайн-практика

| Ресурс | Опис | Посилання |
|--------|------|-----------|
| **OpenPrinting** | Документація CUPS, база принтерів, друк без драйверів | openprinting.github.io |
| **ArchWiki: Font configuration** | fontconfig, згладжування, запасні шрифти | wiki.archlinux.org/title/Font_configuration |
| **Google Fonts** | Безкоштовні шрифти з фільтром за мовою (Cyrillic Extended) | fonts.google.com |
| **Nerd Fonts** | Шрифти для коду зі значками для терміналу | nerdfonts.com |
| **GNOME Look / KDE Store** | Теми, значки, курсори | gnome-look.org, store.kde.org |
| **Font Manager** | Графічний менеджер шрифтів для GNOME | `sudo apt install font-manager` |

## 📋 Cheat Sheet

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ШПАРГАЛКА: ТЕМИ, ШРИФТИ, ДРУК                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ОФОРМЛЕННЯ (GNOME):                                                │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ color-scheme 'prefer-dark'     → темний режим (GTK4 теж)      │  │
│  │ gtk-theme 'Назва'              → тема програм GTK3            │  │
│  │ icon-theme / cursor-theme      → значки / курсор              │  │
│  │ схема: org.gnome.desktop.interface                            │  │
│  │ теми:    ~/.local/share/themes/  /usr/share/themes/           │  │
│  │ значки:  ~/.local/share/icons/   /usr/share/icons/            │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ШРИФТИ:                                                            │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ ~/.local/share/fonts/          → шрифти для себе              │  │
│  │ fc-cache -f                    → оновити кеш                  │  │
│  │ fc-list : family               → родини шрифтів               │  │
│  │ fc-list :lang=uk family        → шрифти з українською         │  │
│  │ fc-match monospace             → що підставиться              │  │
│  │ ~/.config/fontconfig/fonts.conf→ власні правила               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ДРУК (CUPS):                                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ lpstat -p -d                   → принтери й типовий           │  │
│  │ lp -d ПРИНТЕР -n 2 файл.pdf    → друк двох копій              │  │
│  │ lpstat -o / lpq                → черга завдань                │  │
│  │ cancel ID                      → скасувати завдання           │  │
│  │ lpadmin -p P -E -v URI -m everywhere → черга без драйвера     │  │
│  │ http://localhost:631           → вебінтерфейс                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 🎯 Міні-проект (30 хв)

### Завдання: Середовище для роботи з кодом і документами

Налаштуйте шрифти так, щоб код читався легко, українські тексти відображалися без «тофу», а документи з Word не втрачали верстку. Результат оформіть скриптом, який можна запустити на іншому комп'ютері.

**Кроки:**

1. Перевірте стан «до» і збережіть його:
```bash
mkdir -p ~/dotfiles/fonts
{
    echo "sans-serif: $(fc-match sans-serif)"
    echo "monospace:  $(fc-match monospace)"
    echo "Arial:      $(fc-match Arial)"
    echo "українська: $(fc-list :lang=uk family | sort -u | wc -l) родин"
} | tee ~/dotfiles/fonts/before.txt
```

2. Створіть скрипт `~/dotfiles/fonts/setup.sh`:
```bash
#!/usr/bin/env bash
# setup.sh — шрифти для коду й документів
set -e

sudo apt install -y fonts-jetbrains-mono fonts-liberation fonts-noto-core \
    fonts-noto-color-emoji

mkdir -p ~/.config/fontconfig
cat > ~/.config/fontconfig/fonts.conf << 'XML'
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">
<fontconfig>
  <alias>
    <family>monospace</family>
    <prefer><family>JetBrains Mono</family></prefer>
  </alias>
</fontconfig>
XML
fc-cache -f

S=org.gnome.desktop.interface
gsettings set $S monospace-font-name 'JetBrains Mono 11'
gsettings set $S color-scheme 'prefer-dark'

echo "monospace → $(fc-match monospace)"
```

3. Запустіть скрипт і перевірте стан «після»:
```bash
chmod +x ~/dotfiles/fonts/setup.sh
~/dotfiles/fonts/setup.sh
fc-match monospace                   # JetBrainsMono-Regular.ttf: "JetBrains Mono" "Regular"
fc-match Arial                       # LiberationSans-Regular.ttf: "Liberation Sans" …
```

4. Перевірте українську й емодзі. Відкрийте термінал і виведіть рядок, у якому є всі «проблемні» літери, лігатури й емодзі:
```bash
echo "ґанок, їжак, єнот, ІНІЦІАЛИ → != >= 👋"
```
Якщо в терміналі з'явилися прямокутники, з'ясуйте, якого шрифту бракує: `fc-list ":charset=0491"` покаже шрифти, що мають літеру ґ (код U+0491).

5. Налаштуйте редактор коду на новий шрифт і лігатури. Для VS Code у `settings.json`:
```json
"editor.fontFamily": "'JetBrains Mono', monospace",
"editor.fontLigatures": true
```

**Очікуваний результат:**

- Файли `before.txt`, `setup.sh` і `~/.config/fontconfig/fonts.conf`.
- `fc-match monospace` повертає JetBrains Mono, `fc-match Arial` — Liberation Sans.
- Українські літери, стрілки й емодзі в терміналі відображаються без прямокутників.

**Бонус (для допитливих):**

- Налаштуйте віртуальний принтер CUPS-PDF і «надрукуйте» з LibreOffice документ із шрифтом Arial. Перевірте командою `pdffonts ~/PDF/*.pdf`, який шрифт насправді потрапив у PDF.
- Додайте в `fonts.conf` правило, що замінює шрифт Comic Sans MS на Noto Sans, і перевірте `fc-match "Comic Sans MS"`.
- Порівняйте текст зі згладжуванням `grayscale` і `rgba` на своєму моніторі через збільшений знімок екрана.

## Тест для самоперевірки

Десять запитань, у кожному одна правильна відповідь. Якщо тема винесена вашій групі на самостійне опрацювання, цей самий тест публікується в Google Classroom — 10 балів, по одному за кожне запитання.

**1.** Чим відрізняються теми GTK і Qt?

- різниці немає, це синоніми
- GTK оформлює програми на GTK (GNOME), Qt — програми на Qt (KDE)
- GTK працює лише у Wayland, Qt — лише в X11
- GTK відповідає за іконки, Qt — за вікна

**2.** Куди складають користувацькі теми GTK?

- ~/.local/share/fonts/
- /usr/share/icons/
- ~/.config/fontconfig/
- ~/.local/share/themes/ (або старий ~/.themes/)

**3.** Куди встановлюють шрифти для одного користувача?

- ~/.local/share/fonts/
- ~/.icons/
- /usr/share/themes/
- ~/.config/autostart/

**4.** Яка команда оновить кеш шрифтів після встановлення нових?

- fc-match
- gsettings set fonts
- fc-cache -fv
- fc-list

**5.** Що покаже команда `fc-list`?

- перелік тем оформлення
- перелік принтерів
- перелік доступних у системі шрифтів
- перелік завдань друку

**6.** Що таке CUPS?

- служба сканування документів
- система друку, що керує принтерами й чергами завдань
- набір тем оформлення
- менеджер шрифтів

**7.** За якою адресою відкривається вебінтерфейс CUPS?

- http://localhost:80
- http://localhost:8080
- http://localhost:9100
- http://localhost:631

**8.** Яка команда покаже перелік принтерів і принтер за замовчуванням?

- lpq
- lp -d
- lpstat -p -d
- cancel

**9.** Яка команда скасує завдання друку?

- cancel номер-завдання
- cupsdisable
- lpq -clear
- lp -c

**10.** Як увімкнути темну тему GNOME з командного рядка?

- gsettings set org.gnome.desktop.interface color-scheme 'prefer-dark'
- gnome-tweaks --dark
- gsettings set org.gnome.desktop.background dark true
- fc-cache --dark

## Підсумок

| Термін | Визначення |
|--------|------------|
| **Toolkit** | Бібліотека елементів інтерфейсу: GTK або Qt; кожна має свої теми |
| **Тема GTK** | Набір CSS-файлів у `themes/`, що змінює вигляд програм GTK3 |
| **libadwaita** | Бібліотека програм GNOME на GTK4: лише світлий, темний режим і акцентний колір |
| **Тема значків** | Каталог у `icons/` з `index.theme`; відсутні значки беруться з батьківської теми й hicolor |
| **color-scheme** | Системне побажання світлого чи темного режиму для всіх програм |
| **fontconfig** | Бібліотека, що обирає файл шрифту за описом і підставляє запасні шрифти |
| **Метрична сумісність** | Однакова ширина літер у різних шрифтах: Liberation Sans замість Arial |
| **Згладжування й хінтинг** | Напівпрозорі краї літер і підганяння контуру під сітку пікселів |
| **CUPS** | Система друку: сервер cupsd, черги, фільтри, бекенди |
| **IPP Everywhere** | Протокол друку без драйверів: принтер сам описує свої можливості |

| Команда | Призначення |
|---------|-------------|
| `gsettings set org.gnome.desktop.interface color-scheme 'prefer-dark'` | Темний режим |
| `fc-cache -f` | Оновити кеш шрифтів |
| `fc-list :lang=uk family` | Шрифти з українською абеткою |
| `fc-match шрифт` | Що підставиться замість шрифту |
| `lpstat -p -d` | Принтери й принтер за замовчуванням |
| `lp -d принтер файл` | Друк |
| `cancel ID` | Скасувати завдання |

На наступній лекції — консольний режим Linux і файловий менеджер.
