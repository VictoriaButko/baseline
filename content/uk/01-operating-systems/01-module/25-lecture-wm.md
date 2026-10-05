---
title: "Використання диспетчера вікон"
type: lecture
order: 25
preview: "Window managers, tiling WM, композитори."
---

## Що таке Window Manager?

**Window Manager (WM)** — програма, яка керує вікнами: їх розміром, позицією, рамками, фокусом. Desktop Environment (DE) завжди включає WM, але WM можна використовувати і окремо, без повного DE.

```
┌────────────────────────────────────────────────────────────────┐
│                    WM vs DE                                    │
│                                                                │
│   Desktop Environment = WM + панель + файловий менеджер        │
│                        + налаштування + набір програм          │
│                                                                │
│   GNOME = Mutter + GNOME Shell + Nautilus + Settings + ...     │
│   KDE   = KWin  + Plasma Shell + Dolphin  + System Settings    │
│                                                                │
│   Window Manager alone:                                        │
│   • Тільки керування вікнами                                   │
│   • Мінімальне споживання ресурсів                             │
│   • Потрібна ручна конфігурація                                │
│   • Для power users                                            │
└────────────────────────────────────────────────────────────────┘
```

## Типи Window Managers

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ДВА ПІДХОДИ ДО ВІКОН                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  STACKING (стековий)                 TILING (мозаїчний)             │
│                                                                     │
│  ┌──────────────────────────┐        ┌─────────────┬────────────┐   │
│  │   ┌────────────────┐     │        │             │            │   │
│  │   │ Вікно 2        │     │        │  Вікно 1    │  Вікно 2   │   │
│  │ ┌─┴──────────────┐ │     │        │             │            │   │
│  │ │ Вікно 1        │─┘     │        ├─────────────┴────────────┤   │
│  │ │                │       │        │  Вікно 3                 │   │
│  │ └────────────────┘       │        │                          │   │
│  └──────────────────────────┘        └──────────────────────────┘   │
│                                                                     │
│  • вікна накладаються одне на одне   • вікна не перекриваються      │
│  • розмір і місце — мишею            • місце обирає менеджер        │
│  • звично після Windows і macOS      • керування з клавіатури       │
│                                                                     │
│  Mutter, KWin, xfwm4, Openbox        i3, sway, bspwm, dwm, Hyprland │
└─────────────────────────────────────────────────────────────────────┘
```

Тайлінг — давня ідея, а не мода. Перша версія Windows (1.0, 1985) узагалі не дозволяла вікнам перекриватися: вони розкладалися плитками, а накладання з'явилося лише у Windows 2.0. Сьогодні тайлінг повертається й у масові системи: Windows 11 має Snap Layouts, macOS Sequoia (2024) — розкладання вікон за краями екрана, Ubuntu з 23.10 — розширення Tiling Assistant, а KDE Plasma — редактор плиток за сполученням `Meta+T`.

## Stacking Window Managers

### WM, що входять до DE

| WM | DE | Особливості |
|----|----|----|
| **Mutter** | GNOME | Wayland compositor, animations |
| **KWin** | KDE Plasma | Найбільше ефектів, Wayland/X11 |
| **Xfwm** | XFCE | Легкий, стабільний, X11 |
| **Marco** | MATE | Fork Metacity, простий |
| **Muffin** | Cinnamon | Fork Mutter |

### Standalone Stacking WM

| WM | Особливості | Конфігурація |
|----|-------------|--------------|
| **Openbox** | Легкий, популярний | XML (~/.config/openbox/) |
| **Fluxbox** | Класичний, tabbed windows | Text files |
| **IceWM** | Windows-подібний | Text files |
| **JWM** | Дуже легкий | XML |

```bash
# Встановити Openbox
sudo apt install openbox obconf menumaker

# Конфігурація
ls ~/.config/openbox/
# rc.xml — основна конфігурація
# menu.xml — меню (правий клік)
# autostart — автозапуск

# Генерувати меню
mmaker -f OpenBox3

# GUI конфігуратор
obconf
```

## Tiling Window Managers

Tiling WM автоматично розміщує вікна так, щоб вони не перекривалися і займали весь екран. Ідеально для роботи з терміналами та кодом.

```
┌─────────────────────────────────────────────────────────────────────┐
│                   РОЗКЛАДКИ ТАЙЛІНГОВИХ МЕНЕДЖЕРІВ                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ДИНАМІЧНИЙ ТАЙЛІНГ: розкладку обирає менеджер                      │
│                                                                     │
│  master-stack (dwm, xmonad)       поділ навпіл (bspwm, Hyprland)    │
│  ┌──────────────┬───────┐         ┌──────────────┬───────┐          │
│  │              │   2   │         │              │   2   │          │
│  │   головне    ├───────┤         │      1       ├───┬───┤          │
│  │   вікно 1    │   3   │         │              │ 3 │ 4 │          │
│  │              ├───────┤         │              │   │   │          │
│  │              │   4   │         │              │   │   │          │
│  └──────────────┴───────┘         └──────────────┴───┴───┘          │
│  нове вікно стає головним          кожне нове ділить навпіл         │
│                                    останню вільну ділянку           │
│                                                                     │
│  РУЧНИЙ ТАЙЛІНГ: розкладку будуєте ви (i3, sway)                    │
│                                                                     │
│  поділ по горизонталі   вкладки (tabbed)       стос (stacking)      │
│  ┌──────┬──────┬──────┐  ┌──────┬──────┬──────┐  ┌──────────────┐   │
│  │      │      │      │  │ Код  │ Web  │ Term │  │ Код          │   │
│  │  1   │  2   │  3   │  ├──────┴──────┴──────┤  │ Web          │   │
│  │      │      │      │  │ видно одне вікно   │  │ Term         │   │
│  └──────┴──────┴──────┘  └────────────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

Головна відмінність між тайлінговими менеджерами — **хто вирішує, куди стане нове вікно**. У **динамічних** (dwm, xmonad, bspwm, Hyprland) це робить алгоритм розкладки: ви лише відкриваєте вікна. У **ручних** (i3, sway) вікна зберігаються у дереві контейнерів, і ви самі кажете, в якому напрямку ділити наступний контейнер (`split h` чи `split v`) або перетворити його на вкладки. Ручний підхід складніший на старті, зате розкладка не «стрибає» від кожного нового вікна.

### Популярні Tiling WM

| WM | Display Server | Мова конфігурації | Особливості |
|----|----------------|-------------------|-------------|
| **i3** | X11 | Text (~/.config/i3/config) | Найпопулярніший, документація |
| **Sway** | Wayland | Text (i3-сумісний) | i3 для Wayland |
| **bspwm** | X11 | Shell scripts | Binary space partitioning |
| **dwm** | X11 | C (налаштування = перекомпіляція) | Філософія suckless: близько 2000 рядків коду |
| **Hyprland** | Wayland | Text | Анімації, blur, modern |
| **Awesome** | X11 | Lua | Widgets, extensible |
| **xmonad** | X11 | Haskell | Для Haskell-програмістів |
| **qtile** | X11/Wayland | Python | Для Python-програмістів |

### i3 Window Manager

**i3** — найпопулярніший тайлінговий менеджер для X11. Його створив 2009 року Michael Stapelberg, розробник Debian, як переосмислення менеджера wmii. Налаштування — один текстовий файл, документація — одна з найкращих серед менеджерів вікон. Під час першого запуску `i3-config-wizard` пропонує створити конфігурацію й обрати модифікатор `$mod`: клавішу Super (`Mod4`) або Alt (`Mod1`).

```bash
# Встановити i3
sudo apt install i3 i3status i3lock dmenu

# Fedora
sudo dnf install i3 i3status i3lock dmenu

# Arch
sudo pacman -S i3-wm i3status i3lock dmenu

# Перший запуск створить конфіг
# ~/.config/i3/config
```

**Приклад власної конфігурації i3.** Стандартний конфіг, який створює майстер, використовує для фокусу клавіші `j k l ;` (на одну правіше, ніж у vim) і `$mod+h` / `$mod+v` для поділу. Нижче — поширений варіант із vim-клавішами `h j k l`; тоді поділ переносять на інші клавіші. Зверніть увагу: коментар у конфігурації i3 — лише окремим рядком. Текст після команди в тому самому рядку i3 сприйме як частину команди і повідомить про помилку.

```bash
# ~/.config/i3/config

# Модифікатор (Mod4 = Super/Win key, Mod1 = Alt)
set $mod Mod4

# Термінал
set $terminal alacritty
bindsym $mod+Return exec $terminal

# Закрити вікно
bindsym $mod+Shift+q kill

# Application launcher (dmenu)
bindsym $mod+d exec dmenu_run

# Навігація фокусу (vim-like)
bindsym $mod+h focus left
bindsym $mod+j focus down
bindsym $mod+k focus up
bindsym $mod+l focus right

# Або стрілками
bindsym $mod+Left focus left
bindsym $mod+Down focus down
bindsym $mod+Up focus up
bindsym $mod+Right focus right

# Переміщення вікон
bindsym $mod+Shift+h move left
bindsym $mod+Shift+j move down
bindsym $mod+Shift+k move up
bindsym $mod+Shift+l move right

# Поділ: наступне вікно стане під поточним (v) або поруч (b)
bindsym $mod+v split v
bindsym $mod+b split h

# Fullscreen
bindsym $mod+f fullscreen toggle

# Layout modes
bindsym $mod+s layout stacking
bindsym $mod+w layout tabbed
bindsym $mod+e layout toggle split

# Toggle floating
bindsym $mod+Shift+space floating toggle
bindsym $mod+space focus mode_toggle

# Workspaces
set $ws1 "1"
set $ws2 "2"
set $ws3 "3"
set $ws4 "4"

bindsym $mod+1 workspace $ws1
bindsym $mod+2 workspace $ws2
bindsym $mod+3 workspace $ws3
bindsym $mod+4 workspace $ws4

bindsym $mod+Shift+1 move container to workspace $ws1
bindsym $mod+Shift+2 move container to workspace $ws2

# Resize mode
mode "resize" {
    bindsym h resize shrink width 10 px
    bindsym j resize grow height 10 px
    bindsym k resize shrink height 10 px
    bindsym l resize grow width 10 px
    bindsym Escape mode "default"
}
bindsym $mod+r mode "resize"

# Reload config
bindsym $mod+Shift+c reload

# Restart i3
bindsym $mod+Shift+r restart

# Exit i3
bindsym $mod+Shift+e exec "i3-nagbar -t warning -m 'Exit i3?' -b 'Yes' 'i3-msg exit'"

# Status bar
bar {
    status_command i3status
    position top
}
```

### i3 основні команди

Сполучення нижче відповідають наведеному прикладу конфігурації; у стандартному конфігу фокус перемикають `$mod+j/k/l/;`, а поділ задають `$mod+h` і `$mod+v`.

| Комбінація | Дія |
|------------|-----|
| `$mod+Return` | Відкрити термінал |
| `$mod+d` | Application launcher (dmenu) |
| `$mod+Shift+q` | Закрити вікно |
| `$mod+h/j/k/l` | Фокус ліво/вниз/вгору/право |
| `$mod+Shift+h/j/k/l` | Перемістити вікно |
| `$mod+v` | Split вертикально |
| `$mod+b` | Split горизонтально |
| `$mod+f` | Fullscreen |
| `$mod+1-9` | Перейти до workspace |
| `$mod+Shift+1-9` | Перемістити вікно до workspace |
| `$mod+Shift+c` | Перезавантажити конфіг |
| `$mod+Shift+r` | Перезапустити i3 |

### Sway (Wayland)

**Sway** — це i3-сумісний compositor для Wayland. Якщо знаєте i3, легко перейти на Sway.

```bash
# Встановити (swaybar входить до пакета sway)
sudo apt install sway swayidle swaylock

# Конфігурація (майже ідентична i3)
mkdir -p ~/.config/sway
cp /etc/sway/config ~/.config/sway/config

# Запустити (з TTY)
sway

# Відмінності від i3:
# - Wayland замість X11
# - output замість xrandr
# - input замість xinput
# - Деякі X11 програми потребують XWayland
```

**Sway** почав 2015 року Drew DeVault, версія 1.0 вийшла 2019-го. Разом із ним з'явилася бібліотека **wlroots** — «конструктор» Wayland-композиторів, на якому тепер побудовано десятки інших: Hyprland, labwc, river, Wayfire. Власницький драйвер NVIDIA sway офіційно не підтримує: з ним запускають `sway --unsupported-gpu`.

## Compositor

**Compositor** — програма, що об'єднує вікна в фінальне зображення. Додає візуальні ефекти: тіні, прозорість, анімації, blur.

```
┌────────────────────────────────────────────────────────────────┐
│                    COMPOSITOR                                  │
│                                                                │
│   X11 Standalone Compositors:      Wayland:                    │
│   ─────────────────────────        ────────                    │
│   • Picom (fork Compton)           • Compositor = частина WM   │
│   • Compton (deprecated)           • Mutter, KWin, Sway        │
│                                    • Wlroots-based             │
│                                                                │
│   Ефекти:                                                      │
│   • Тіні вікон                                                 │
│   • Прозорість (inactive windows)                              │
│   • Blur (розмиття фону)                                       │
│   • Fade in/out анімації                                       │
│   • Rounded corners                                            │
│   • VSync (no tearing)                                         │
└────────────────────────────────────────────────────────────────┘
```

### Picom конфігурація

```bash
# Встановити picom
sudo apt install picom

# Базова конфігурація
mkdir -p ~/.config/picom
```

```bash
# ~/.config/picom/picom.conf

# Тіні
shadow = true;
shadow-radius = 12;
shadow-offset-x = -7;
shadow-offset-y = -7;
shadow-opacity = 0.6;

# Виключити тіні для деяких вікон
shadow-exclude = [
    "name = 'Notification'",
    "class_g = 'dmenu'",
    "class_g = 'Dunst'"
];

# Fade (анімація появи/зникнення)
fading = true;
fade-in-step = 0.03;
fade-out-step = 0.03;
fade-delta = 5;

# Прозорість
inactive-opacity = 0.9;
active-opacity = 1.0;
frame-opacity = 0.9;

# Blur
blur-background = true;
blur-method = "dual_kawase";
blur-strength = 5;

# Rounded corners
corner-radius = 10;

# VSync
vsync = true;

# Backend
backend = "glx";  # або "xrender"
```

```bash
# Запустити picom
picom --config ~/.config/picom/picom.conf &

# Або без конфіг файлу
picom --shadow --fading --inactive-opacity=0.9 &

# Додати в автозапуск i3
# exec --no-startup-id picom --config ~/.config/picom/picom.conf
```

## Status Bar

Status bar — панель з інформацією про систему (час, батарея, CPU, мережа) та workspaces.

```
┌─────────────────────────────────────────────────────────────────────┐
│                             ПАНЕЛІ СТАНУ                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 1  2  3  4                    CPU 5%  Звук 40%  Бат 85%  14:30│  │
│  └───────────────────────────────────────────────────────────────┘  │
│    └ робочі столи ┘                 └──── відомості про систему ──┘ │
│                                                                     │
│  Популярні панелі:                                                  │
│  • i3bar + i3status — вбудовані в i3, прості                        │
│  • Polybar (X11) — гнучка, з модулями на будь-який смак             │
│  • Waybar (Wayland) — для sway і Hyprland, стилі на CSS             │
│  • Eww — віджети з власною мовою розмітки                           │
│  • Conky — системний монітор на робочому столі                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Polybar

```bash
# Встановити
sudo apt install polybar

# Конфігурація
mkdir -p ~/.config/polybar
cp /etc/polybar/config.ini ~/.config/polybar/

# Запустити
polybar example &

# Launch script для i3
cat > ~/.config/polybar/launch.sh << 'EOF'
#!/bin/bash
killall -q polybar
while pgrep -u $UID -x polybar >/dev/null; do sleep 1; done
polybar example &
EOF
chmod +x ~/.config/polybar/launch.sh
```

### Waybar (для Sway/Wayland)

```bash
# Встановити
sudo apt install waybar

# Конфігурація
mkdir -p ~/.config/waybar
# ~/.config/waybar/config — JSON
# ~/.config/waybar/style.css — CSS стилі

# Автозапуск в Sway
# exec waybar
```

## Коли використовувати Tiling WM?

```
┌─────────────────────────────────────────────────────────────────┐
│                    TILING WM: ЗА І ПРОТИ                        │
│                                                                 │
│   Ідеально для:                    Не найкращий вибір для:      │
│   ────────────                     ─────────────────────        │
│   ✅ Розробників                   ❌ Графічних дизайнерів      │
│   ✅ Сисадмінів                    ❌ Відеоредакторів           │
│   ✅ DevOps/SRE                    ❌ Новачків в Linux          │
│   ✅ Data Scientists               ❌ GIMP, Inkscape users      │
│   ✅ Keyboard-first users          ❌ Тих, хто любить мишку     │
│   ✅ Multiple monitors             ❌ Gaming (деякі ігри)       │
│   ✅ Мінімалістів                                               │
│                                                                 │
│   Переваги:                        Недоліки:                    │
│   ──────────                       ──────────                   │
│   • Ефективне використання         • Крива навчання             │
│     простору екрану                • Ручна конфігурація         │
│   • Швидкість (клавіатура)         • Не для всіх програм        │
│   • Низьке споживання RAM          • Потрібен час на setup      │
│   • Консистентність                                             │
│   • Reproducible config                                         │
└─────────────────────────────────────────────────────────────────┘
```

## Практика: встановлення i3

```bash
# 1. Встановити i3 та залежності
sudo apt install i3 i3status i3lock dmenu picom feh dunst

# feh — для шпалер
# dunst — для нотифікацій
# picom — compositor

# 2. При логіні обрати i3 у Display Manager

# 3. Перший запуск — натиснути Enter для генерації конфігу

# 4. Базові команди:
# $mod+Enter — термінал
# $mod+d — dmenu (запуск програм)
# $mod+Shift+q — закрити вікно
# $mod+Shift+e — вийти з i3

# 5. Налаштувати шпалери
feh --bg-scale ~/Pictures/wallpaper.jpg
# Додати в config: exec --no-startup-id feh --bg-scale ~/Pictures/wallpaper.jpg

# 6. Увімкнути compositor
# Додати в config: exec --no-startup-id picom

# 7. Перечитати конфіг
# $mod+Shift+c (або $mod+Shift+r — перезапустити i3 зі збереженням вікон)
```

Тимчасово спробувати i3 можна й без виходу з поточного сеансу — у вкладеному X-сервері Xephyr:

```bash
sudo apt install xserver-xephyr
Xephyr -br -ac -noreset -screen 1280x800 :2 &
DISPLAY=:2 i3 &
DISPLAY=:2 xterm &           # програми відкриваються у вікні Xephyr
```

## 🏢 Real World: Як це використовують у великих компаніях

```
┌─────────────────────────────────────────────────────────────────────┐
│                      МЕНЕДЖЕРИ ВІКОН У ПРАКТИЦІ                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  SYSTEM76 (Pop!_OS)                                                 │
│  ├── Pop Shell — автоматичний тайлінг поверх GNOME з 2020 року      │
│  └── COSMIC (2025) — власне середовище на Rust, де тайлінг          │
│      вбудовано й вмикається однією кнопкою                          │
│                                                                     │
│  CANONICAL, KDE, MICROSOFT, APPLE                                   │
│  ├── Ubuntu 23.10+: Tiling Assistant у стандартній поставці         │
│  ├── KDE Plasma 5.27+: редактор плиток KWin (Meta+T)                │
│  ├── Windows 11: Snap Layouts                                       │
│  └── macOS Sequoia: розкладання вікон за краями екрана              │
│      Ідея тайлінгу з нішевих менеджерів прийшла в масові ОС         │
│                                                                     │
│  WLROOTS                                                            │
│  └── Бібліотека, створена для sway, стала основою Hyprland,         │
│      labwc, river, Wayfire і композиторів для вбудованих систем     │
│                                                                     │
│  VALVE                                                              │
│  └── gamescope — мікрокомпозитор Wayland для ігрового режиму        │
│      Steam Deck: одна гра на весь екран, масштабування FSR          │
│                                                                     │
│  КІОСКИ ТА ВБУДОВАНІ ПРИСТРОЇ                                       │
│  └── Cage — композитор, що показує рівно одну програму на весь      │
│      екран: інформаційні табло, термінали самообслуговування        │
│                                                                     │
│  DOTFILES                                                           │
│  └── Конфігурація i3 чи sway — текстовий файл у Git: те саме        │
│      середовище за хвилину на будь-якому комп'ютері                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 💼 Career Spotlight

```
┌─────────────────────────────────────────────────────────────────────┐
│                         КАР'ЄРНІ МОЖЛИВОСТІ                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  GRAPHICS / COMPOSITOR ENGINEER                                     │
│  Композитори Wayland, wlroots, KWin, Mutter, драйвери дисплея       │
│  Зарплата: $120K-$200K (USA) | €60K-€110K (EU)                      │
│  Компанії: Valve, Collabora, Igalia, Red Hat, KDE e.V., System76    │
│                                                                     │
│  EMBEDDED LINUX ENGINEER                                            │
│  Інтерфейси кіосків, автомобілів, терміналів на Wayland             │
│  Зарплата: $90K-$160K (USA) | €50K-€90K (EU)                        │
│  Компанії: Bosch, Continental, Garmin, Toradex                      │
│                                                                     │
│  DEVOPS / SRE ENGINEER                                              │
│  Десятки терміналів, журналів і дашбордів водночас — тут            │
│  клавіатурна робота з вікнами щодня економить час                   │
│  Зарплата: $100K-$180K (USA) | €55K-€100K (EU)                      │
│  Компанії: продуктові й хмарні компанії, фінтех                     │
│                                                                     │
│  Спільне для всіх: dotfiles у Git — публічне портфоліо того,        │
│  як ви організовуєте своє робоче середовище                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔗 Корисні ресурси

### Онлайн-практика

| Ресурс | Опис | Посилання |
|--------|------|-----------|
| **i3wm.org** | Офіційна документація i3 | i3wm.org/docs |
| **Sway Wiki** | Документація Sway | github.com/swaywm/sway/wiki |
| **r/unixporn** | Натхнення для customization | reddit.com/r/unixporn |
| **Arch Wiki - Window Managers** | Порівняння всіх WM | wiki.archlinux.org/title/Window_manager |

## 📋 Cheat Sheet

```
┌────────────────────────────────────────────────────────────────┐
│                 WINDOW MANAGERS CHEAT SHEET                    │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   i3 SHORTCUTS (приклад конфігу з лекції, $mod = Super):       │
│   $mod+Enter       Відкрити термінал                           │
│   $mod+d           dmenu (app launcher)                        │
│   $mod+Shift+q     Закрити вікно                               │
│   $mod+h/j/k/l     Фокус ліво/вниз/вгору/право                 │
│   $mod+Shift+h/j/k/l  Перемістити вікно                        │
│   $mod+v           Split вертикально                           │
│   $mod+b           Split горизонтально                         │
│   $mod+f           Fullscreen toggle                           │
│   $mod+1-9         Перейти до workspace                        │
│   $mod+Shift+1-9   Перемістити вікно до workspace              │
│   $mod+Shift+c     Reload config                               │
│   $mod+Shift+r     Restart i3                                  │
│   $mod+Shift+e     Exit i3                                     │
│                                                                │
│   LAYOUTS:                                                     │
│   $mod+s           Stacking layout                             │
│   $mod+w           Tabbed layout                               │
│   $mod+e           Toggle split layout                         │
│   $mod+Shift+space Toggle floating                             │
│                                                                │
│   RESIZE MODE:                                                 │
│   $mod+r           Enter resize mode                           │
│   h/j/k/l          Resize в режимі resize                      │
│   Escape           Exit resize mode                            │
│                                                                │
│   CONFIG FILES:                                                │
│   ~/.config/i3/config        i3 конфігурація                   │
│   ~/.config/sway/config      Sway конфігурація                 │
│   ~/.config/picom/picom.conf Compositor                        │
│   ~/.config/polybar/         Status bar                        │
│                                                                │
│   USEFUL COMMANDS:                                             │
│   i3-msg reload              Reload config                     │
│   i3-msg restart             Restart in place                  │
│   i3-msg "workspace 1"       Script workspace switch           │
└────────────────────────────────────────────────────────────────┘
```

## 🎯 Міні-проект (30 хв)

### Завдання: Спробуйте tiling WM без встановлення (або з мінімальним налаштуванням)

Познайомтеся з концепцією tiling window manager, використовуючи вбудовані можливості вашого DE або легке налаштування. Якщо ви готові — встановіть i3!

**Варіант A: Tiling в GNOME (без встановлення)**

1. Використовуйте вбудований tiling:
```bash
# GNOME має базовий tiling:
# Super + Left  = вікно займає ліву половину
# Super + Right = вікно займає праву половину
# Super + Up    = максимізувати

# В Ubuntu 23.10+ розширення Tiling Assistant вже встановлено:
# перетягніть вікно до краю — і оберіть, що стане поруч
# В інших дистрибутивах: extensions.gnome.org → Tiling Assistant
```

2. Практикуйте keyboard workflow:
```
Тренуйте ці комбінації 10 хвилин:
- Super+Left, Super+Right (tile вікна)
- Alt+Tab (швидке переключення)
- Super+PageUp/PageDown (робочі столи; Super+1…4 — якщо ви налаштували їх у лекції 22)
- Super+Q (закрити вікно)
```

**Варіант B: Встановіть i3 (повноцінний досвід)**

1. Встановіть i3:
```bash
sudo apt install i3 i3status dmenu feh picom
```

2. Logout та виберіть i3 в Display Manager (GDM/SDDM)

3. Перший запуск — натисніть Enter для генерації конфігу

4. Базові команди (за замовчуванням $mod = Super):
```
$mod + Enter     = Термінал
$mod + d         = dmenu (запуск програм)
$mod + Shift + q = Закрити вікно
$mod + 1-9       = Переключити workspace
$mod + Shift + e = Вийти з i3
```

5. Створіть свій мінімальний конфіг:
```bash
nano ~/.config/i3/config
```

Додайте в кінець файлу:
```bash
# Мої налаштування
# Шпалери
exec --no-startup-id feh --bg-scale ~/Pictures/wallpaper.jpg

# Compositor (тіні, прозорість)
exec --no-startup-id picom

# Мої програми: F-клавіші не зайняті стандартним конфігом
# ($mod+e там уже перемикає розкладку)
bindsym $mod+F1 exec firefox
bindsym $mod+F2 exec nautilus
bindsym $mod+F3 exec code

# Відступи між вікнами (вбудовані в i3 з версії 4.22)
gaps inner 10
gaps outer 5
```

6. Перечитайте конфіг: `$mod + Shift + c`. Якщо в ньому помилка, i3 покаже жовту смугу з описом — виправте рядок і перечитайте знову. Перевірити файл без застосування можна командою `i3 -C`.

**Варіант C: Створіть скрипт-порівняння WM**

```bash
nano ~/scripts/compare-wm.sh
```

```bash
#!/bin/bash
# Window Manager Comparison Script

section() { printf '\n== %s\n' "$1"; }

section "Поточний сеанс"
echo "Середовище: ${XDG_CURRENT_DESKTOP:-невідомо}"
echo "Тип сеансу: ${XDG_SESSION_TYPE:-невідомо}"
pgrep -l -x 'gnome-shell|kwin_wayland|kwin_x11|i3|sway|Hyprland|xfwm4|openbox' \
    || echo "менеджер вікон не розпізнано"

section "Сеанси, доступні на екрані входу"
for f in /usr/share/xsessions/*.desktop /usr/share/wayland-sessions/*.desktop; do
    [ -f "$f" ] || continue
    type=$(basename "$(dirname "$f")")
    echo "  $(grep -m1 '^Name=' "$f" | cut -d= -f2)  ($type)"
done

section "Пам'ять процесів графічного середовища, МБ"
ps -eo rss=,comm= --sort=-rss \
    | grep -E 'gnome-shell|kwin|plasmashell|i3|sway|Hyprland|xfwm4|Xorg|Xwayland' \
    | awk '{ printf "  %-16s %6.0f\n", $2, $1 / 1024 }'

section "Порада"
case "$XDG_CURRENT_DESKTOP" in
    *GNOME*) echo "  Спробуйте Tiling Assistant: перетягніть вікно до краю екрана" ;;
    *KDE*)   echo "  Натисніть Meta+T — редактор плиток KWin" ;;
    *)       echo "  Спробуйте i3 у Xephyr, не виходячи з поточного сеансу" ;;
esac
```

**Очікуваний результат:**
- Розуміння концепції tiling WM
- Практичний досвід keyboard-driven workflow
- (Опціонально) Працюючий i3 з базовим конфігом

**Бонус (для допитливих):**
- Встановіть Polybar замість i3bar для красивого статус-бару
- Налаштуйте кольорову схему i3 (у конфігу `client.focused`, `client.unfocused`)
- Спробуйте rofi замість dmenu: `sudo apt install rofi`, потім `bindsym $mod+d exec rofi -show drun`
- Створіть workspace rules: конкретні програми на конкретних workspaces

## Тест для самоперевірки

Десять запитань, у кожному одна правильна відповідь. Якщо тема винесена вашій групі на самостійне опрацювання, цей самий тест публікується в Google Classroom — 10 балів, по одному за кожне запитання.

**1.** За що відповідає диспетчер вікон?

- за запуск служб системи
- за розміщення, розміри, рамки та фокус вікон
- за малювання зображення на екрані замість відеодрайвера
- за монтування файлових систем

**2.** Чим мозаїчний (tiling) диспетчер відрізняється від стосового (stacking)?

- він не підтримує кількох робочих столів
- він розкладає вікна без перекриття, автоматично заповнюючи екран
- він працює тільки в текстовому режимі
- він дозволяє вікнам вільно накладатися одне на одне

**3.** Який диспетчер вікон використовує GNOME?

- i3
- KWin
- Openbox
- Mutter

**4.** Що таке Sway?

- панель стану для X11
- композитор для Xorg
- програма запуску застосунків
- мозаїчний диспетчер для Wayland, сумісний за налаштуваннями з i3

**5.** Яке сполучення клавіш в i3 відкриває термінал?

- $mod+Enter
- $mod+d
- $mod+Shift+q
- $mod+f

**6.** Що робить `$mod+Shift+q` в i3?

- перемикає повноекранний режим
- перезавантажує конфігурацію
- завершує сеанс i3
- закриває активне вікно

**7.** Де лежить файл налаштувань i3?

- /etc/i3/default
- ~/.config/polybar/config
- ~/.config/i3/config
- ~/.config/picom/picom.conf

**8.** Навіщо в X11 потрібен окремий композитор на кшталт Picom?

- він замінює диспетчер вікон
- сам X11 не вміє малювати тіні, прозорість і плавні переходи
- без нього не працює клавіатура
- він потрібен для друку документів

**9.** Чим відрізняється композитор у Wayland?

- він запускається лише на вимогу користувача
- він працює окремим процесом, як і в X11
- він вбудований у сам диспетчер вікон
- у Wayland композитора немає

**10.** Що показує панель стану на зразок Polybar або Waybar?

- робочі столи, час, заряд батареї, навантаження системи
- вміст поточного каталогу
- перелік установлених програм
- журнал системних подій

## Підсумок

| Тип | WM | Для кого |
|-----|----|----|
| Stacking (DE) | Mutter, KWin | Всі користувачі |
| Stacking standalone | Openbox, Fluxbox | Легкі системи |
| Tiling X11 | i3, bspwm, dwm | Power users, розробники |
| Tiling Wayland | Sway, Hyprland | Сучасні системи |

| Компонент | X11 | Wayland |
|-----------|-----|---------|
| Compositor | Picom, Compton | Вбудований в WM |
| Status bar | Polybar, Lemonbar | Waybar |
| Launcher | dmenu, rofi | wofi, fuzzel |
| WM | i3, bspwm | Sway, Hyprland |

| i3 Shortcut | Дія |
|-------------|-----|
| `$mod+Return` | Термінал |
| `$mod+d` | App launcher |
| `$mod+Shift+q` | Закрити вікно |
| `$mod+h/j/k/l` | Навігація |
| `$mod+1-9` | Workspace |
| `$mod+f` | Fullscreen |
| `$mod+Shift+r` | Restart i3 |

На наступній лекції — теми робочого стола, шрифти й друк.

На наступній лекції — теми, шрифти та друк.
