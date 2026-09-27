---
title: "Використання шифру складної перестановки при розв'язанні задачі захисту інформації (шифр Плейфера, шифр подвійний квадрат Уітстона). Програмна реалізація"
shortTitle: "Шифр Плейфера. Подвійний квадрат"
type: lab
order: 11
labNumber: 4
subject: pmzi
duration: "2 академічні години"
equipment:
  - "ПК з компілятором або інтерпретатором мови програмування за вибором студента"
  - "Середовище розробки (Visual Studio, VS Code або інше)"
preview: "Реалізація шифру Плейфера та подвійного квадрата Уітстона."
---

**Мета:** вивчити принципи поліграмного (біграмного) шифрування; навчитися будувати матрицю за ключовим словом, готувати текст до шифрування й застосовувати правила Плейфера та подвійного квадрата Уітстона; реалізувати обидва шифри мовою C++ і пояснити, які властивості мови вони приховують, а які — ні.

**Обладнання:** ПК з компілятором або інтерпретатором мови програмування за вибором студента; Середовище розробки (Visual Studio, VS Code або інше).

**Тривалість:** 2 академічні години.

## Передумови

| Вимога | Опис |
|--------|------|
| **Знання** | Лекція «Шифр Трисемуса. Шифр Плейфера. Подвійний квадрат» |
| **Навички** | Робота з матрицями символів |
| **Середовище** | ПК з компілятором або інтерпретатором мови програмування за вибором студента |

## Теоретичні відомості

### 1 Поліграмні шифри

Поліграмні шифри шифрують групи літер (біграми, триграми) замість окремих символів. Це ускладнює частотний аналіз.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    МОНОАЛФАВІТНИЙ vs ПОЛІГРАМНИЙ                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  МОНОАЛФАВІТНИЙ (Цезар):                                            │
│  E → H  (кожна E завжди H)                                          │
│  Частотний аналіз: легко знайти E за частотою H                     │
│                                                                     │
│  ПОЛІГРАМНИЙ (Плейфер):                                             │
│  EA → XY, ER → UV, EN → ZW                                          │
│  Літера E дає різний результат залежно від сусідки в біграмі        │
│  Частотний аналіз окремих літер не працює: рахувати треба біграми   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2 Матриця Плейфера

Матриця 5×5 заповнюється ключовим словом, потім рештою літер (I/J об'єднуються):

```
Ключ: MONARCHY

Матриця:
┌───┬───┬───┬───┬───┐
│ M │ O │ N │ A │ R │
├───┼───┼───┼───┼───┤
│ C │ H │ Y │ B │ D │
├───┼───┼───┼───┼───┤
│ E │ F │ G │ I │ K │
├───┼───┼───┼───┼───┤
│ L │ P │ Q │ S │ T │
├───┼───┼───┼───┼───┤
│ U │ V │ W │ X │ Z │
└───┴───┴───┴───┴───┘

Примітка: I та J вважаються однією літерою
```

### 3 Правила шифрування біграм

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ПРАВИЛА ШИФРУВАННЯ ПЛЕЙФЕРА                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. ОДИН РЯДОК: зсув вправо (з циклічним переносом)                 │
│     ┌───┬───┬───┬───┬───┐                                           │
│     │ M │[O]│ N │[A]│ R │   OA → NR (O→N, A→R)                      │
│     └───┴───┴───┴───┴───┘   остання літера рядка переходить у першу │
│                                                                     │
│  2. ОДИН СТОВПЕЦЬ: зсув вниз (з циклічним переносом)                │
│     ┌───┐                                                           │
│     │[M]│                                                           │
│     │ C │      ME → CL (зсув вниз)                                  │
│     │[E]│                                                           │
│     │ L │                                                           │
│     │ U │                                                           │
│     └───┘                                                           │
│                                                                     │
│  3. ПРЯМОКУТНИК: протилежні кути                                    │
│     ┌───┬───┬───┬───┬───┐                                           │
│     │ M │ O │ N │ A │ R │                                           │
│     │ C │[H]│ Y │[B]│ D │   HI → BF (H→B, I→F)                      │
│     │ E │[F]│ G │[I]│ K │                                           │
│     └───┴───┴───┴───┴───┘                                           │
│                                                                     │
│  ПІДГОТОВКА ТЕКСТУ:                                                 │
│  - Замінити J на I                                                  │
│  - Вставити X між однаковими літерами: LL → LX L                    │
│  - Якщо непарна кількість, додати X в кінці                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4 Подвійний квадрат Уітстона

Використовує дві різні матриці 5×5, розташовані одна над одною (вертикальний варіант, як у лекції): тоді літери біграми й шифротексту справді лежать у кутах одного прямокутника.

```
Квадрат 1 — верхній (ключ EXAMPLE)
┌───┬───┬───┬───┬───┐
│ E │ X │ A │ M │ P │
│ L │ B │ C │ D │ F │
│ G │ H │ I │ K │ N │
│ O │ Q │ R │ S │ T │
│ U │ V │ W │ Y │ Z │
└───┴───┴───┴───┴───┘
Квадрат 2 — нижній (ключ KEYWORD)
┌───┬───┬───┬───┬───┐
│ K │ E │ Y │ W │ O │
│ R │ D │ A │ B │ C │
│ F │ G │ H │ I │ L │
│ M │ N │ P │ Q │ S │
│ T │ U │ V │ X │ Z │
└───┴───┴───┴───┴───┘
```

Існує й горизонтальний варіант (квадрати поруч), але в ньому правило інше: перша літера шифротексту береться з рядка першої літери в **другому** квадраті. Змішувати два варіанти в одній програмі не можна — розшифрування не зійдеться.
**Правило шифрування:**

- Перша літера біграми шукається в квадраті 1, друга — у квадраті 2
- Перша літера шифротексту: квадрат 1, рядок першої літери, стовпець другої
- Друга літера шифротексту: квадрат 2, рядок другої літери, стовпець першої

```
Приклад: AT
A у квадраті 1: рядок 0, стовпець 2
T у квадраті 2: рядок 4, стовпець 0

Шифрування:
- З квадрата 1: рядок A (0), стовпець T (0) → E
- З квадрата 2: рядок T (4), стовпець A (2) → V

AT → EV
```

Якщо обидві літери опиняються в однаковому стовпці своїх квадратів, біграма лишається
незмінною (`HE → HE`). Так поводиться приблизно кожна п'ята пара — це відома слабкість шифру.

### 5 Стійкість біграмних шифрів

Таблиця 1 — Порівняння шифрів лабораторної роботи

| Властивість | Плейфер | Подвійний квадрат |
|-------------|---------|-------------------|
| Ключ | одне ключове слово | два ключові слова |
| Обробка однакових літер у парі | вставка X | не потрібна |
| Біграма може пройти незміненою | ні | так, коли стовпці збігаються (≈ 1/5 пар) |
| Симетрія AB → XY, BA → YX | є | немає |
| Що бачить криптоаналітик | частоти біграм мови | частоти біграм мови й фрагменти відкритого тексту |

Обидва шифри приховують частоти окремих літер, але не частоти біграм: для цього достатньо кількох сотень літер шифротексту. Тому вони придатні лише для навчання й як ілюстрація ідеї блочного шифру з дуже малим блоком.

## Приклад виконання

### Крок 1. Побудова матриці Плейфера

```cpp
#include <iostream>
#include <string>
#include <vector>
#include <cctype>

using Matrix = std::vector<std::string>;  // 5 рядків по 5 літер

// Матриця 5x5: спершу літери ключа без повторів, далі решта абетки без J
Matrix createMatrix(const std::string& keyword) {
    const std::string alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ";  // без J
    bool used[26] = { false };
    std::string chars;

    for (char c : keyword) {
        char up = static_cast<char>(std::toupper(static_cast<unsigned char>(c)));
        if (up == 'J') up = 'I';
        if (up >= 'A' && up <= 'Z' && !used[up - 'A']) {
            used[up - 'A'] = true;
            chars += up;
        }
    }

    for (char c : alphabet) {
        if (!used[c - 'A']) {
            used[c - 'A'] = true;
            chars += c;
        }
    }

    Matrix matrix(5);
    for (int row = 0; row < 5; ++row) {
        matrix[row] = chars.substr(row * 5, 5);
    }
    return matrix;
}

// Позиція літери в матриці; повертає false, якщо літери немає
bool findPosition(const Matrix& matrix, char c, int& row, int& col) {
    char up = static_cast<char>(std::toupper(static_cast<unsigned char>(c)));
    if (up == 'J') up = 'I';

    for (row = 0; row < 5; ++row) {
        for (col = 0; col < 5; ++col) {
            if (matrix[row][col] == up) {
                return true;
            }
        }
    }
    return false;
}

void printMatrix(const Matrix& matrix, const std::string& title) {
    if (!title.empty()) {
        std::cout << title << "\n";
    }
    for (const std::string& row : matrix) {
        for (char c : row) {
            std::cout << c << ' ';
        }
        std::cout << "\n";
    }
}

int main() {
    std::string keyword = "MONARCHY";
    Matrix matrix = createMatrix(keyword);
    printMatrix(matrix, "Матриця для ключа " + keyword + ":");
    return 0;
}
```

Результат роботи програми:

```
Матриця для ключа MONARCHY:
M O N A R
C H Y B D
E F G I K
L P Q S T
U V W X Z
```

### Крок 2. Шифрування Плейфера

```cpp
#include <iostream>
#include <string>
#include <vector>
#include <cctype>

using Matrix = std::vector<std::string>;

Matrix createMatrix(const std::string& keyword);                  // з кроку 1
bool findPosition(const Matrix& m, char c, int& row, int& col);   // з кроку 1

// Підготовка тексту: лише літери, J→I, розділення однакових літер біграми
std::string prepareText(const std::string& plaintext) {
    std::string clean;
    for (char c : plaintext) {
        if (std::isalpha(static_cast<unsigned char>(c))) {
            char up = static_cast<char>(std::toupper(static_cast<unsigned char>(c)));
            clean += (up == 'J') ? 'I' : up;
        }
    }

    std::string result;
    for (size_t i = 0; i < clean.size(); ++i) {
        result += clean[i];
        // однакові літери в біграмі розділяємо літерою X
        if (result.size() % 2 == 1 && i + 1 < clean.size() &&
            clean[i] == clean[i + 1]) {
            result += 'X';
        }
    }

    if (result.size() % 2 == 1) {
        result += 'X';
    }
    return result;
}

// shift = +1 для зашифрування, -1 (тобто +4 за модулем 5) для розшифрування
std::string processBigram(const Matrix& matrix, char a, char b, int shift) {
    int rowA, colA, rowB, colB;
    findPosition(matrix, a, rowA, colA);
    findPosition(matrix, b, rowB, colB);

    std::string result;
    if (rowA == rowB) {                       // один рядок: беремо сусідів праворуч
        result += matrix[rowA][(colA + shift + 5) % 5];
        result += matrix[rowB][(colB + shift + 5) % 5];
    } else if (colA == colB) {                // один стовпець: сусіди знизу
        result += matrix[(rowA + shift + 5) % 5][colA];
        result += matrix[(rowB + shift + 5) % 5][colB];
    } else {                                  // прямокутник: протилежні кути
        result += matrix[rowA][colB];
        result += matrix[rowB][colA];
    }
    return result;
}

std::string playfairEncrypt(const std::string& plaintext,
                            const std::string& keyword) {
    Matrix matrix = createMatrix(keyword);
    std::string text = prepareText(plaintext);
    std::string ciphertext;

    for (size_t i = 0; i + 1 < text.size(); i += 2) {
        ciphertext += processBigram(matrix, text[i], text[i + 1], +1);
    }
    return ciphertext;
}

std::string playfairDecrypt(const std::string& ciphertext,
                            const std::string& keyword) {
    Matrix matrix = createMatrix(keyword);
    std::string plaintext;

    for (size_t i = 0; i + 1 < ciphertext.size(); i += 2) {
        plaintext += processBigram(matrix, ciphertext[i], ciphertext[i + 1], -1);
    }
    return plaintext;
}

int main() {
    std::string keyword = "MONARCHY";
    std::string plaintext = "HELLO WORLD";

    std::cout << "=== Шифр Плейфера ===\n";
    std::cout << "Ключ:            " << keyword << "\n";
    std::cout << "Відкритий текст: " << plaintext << "\n";
    std::cout << "Підготовлений:   " << prepareText(plaintext) << "\n";

    std::string ciphertext = playfairEncrypt(plaintext, keyword);
    std::cout << "Шифротекст:      " << ciphertext << "\n";
    std::cout << "Розшифровано:    " << playfairDecrypt(ciphertext, keyword) << "\n";

    return 0;
}
```

Результат роботи програми:

```
=== Шифр Плейфера ===
Ключ:            MONARCHY
Відкритий текст: HELLO WORLD
Підготовлений:   HELXLOWORLDX
Шифротекст:      CFSUPMVNMTBZ
Розшифровано:    HELXLOWORLDX
```

Першу біграму легко перевірити за матрицею: H стоїть у рядку 2, стовпці 2,
E — у рядку 3, стовпці 1. Літери в різних рядках і стовпцях, тому кожна
замінюється літерою свого рядка в стовпці іншої: H дає C, E дає F.

### Крок 3. Подвійний квадрат Уітстона

```cpp
#include <iostream>
#include <string>
#include <vector>

using Matrix = std::vector<std::string>;

Matrix createMatrix(const std::string& keyword);                  // з кроку 1
bool findPosition(const Matrix& m, char c, int& row, int& col);   // з кроку 1
void printMatrix(const Matrix& m, const std::string& title);      // з кроку 1
std::string prepareText(const std::string& plaintext);            // з кроку 2

// Подвійний квадрат: перша літера біграми шукається в першому квадраті,
// друга — у другому; результат беруть із протилежних кутів прямокутника
std::string twoSquareProcess(const std::string& text,
                             const std::string& keyword1,
                             const std::string& keyword2) {
    Matrix first = createMatrix(keyword1);
    Matrix second = createMatrix(keyword2);
    std::string result;

    for (size_t i = 0; i + 1 < text.size(); i += 2) {
        int row1, col1, row2, col2;
        findPosition(first, text[i], row1, col1);
        findPosition(second, text[i + 1], row2, col2);

        result += first[row1][col2];
        result += second[row2][col1];
    }
    return result;
}

std::string twoSquareEncrypt(const std::string& plaintext,
                             const std::string& keyword1,
                             const std::string& keyword2) {
    return twoSquareProcess(prepareText(plaintext), keyword1, keyword2);
}

// Операція симетрична: повторне застосування повертає відкритий текст
std::string twoSquareDecrypt(const std::string& ciphertext,
                             const std::string& keyword1,
                             const std::string& keyword2) {
    return twoSquareProcess(ciphertext, keyword1, keyword2);
}

int main() {
    std::string keyword1 = "EXAMPLE";
    std::string keyword2 = "KEYWORD";
    std::string plaintext = "HELLO WORLD";

    std::cout << "=== Подвійний квадрат Уітстона ===\n";
    std::cout << "Ключ 1:          " << keyword1 << "\n";
    std::cout << "Ключ 2:          " << keyword2 << "\n";
    std::cout << "Відкритий текст: " << plaintext << "\n\n";

    printMatrix(createMatrix(keyword1), "Квадрат 1:");
    std::cout << "\n";
    printMatrix(createMatrix(keyword2), "Квадрат 2:");

    std::string ciphertext = twoSquareEncrypt(plaintext, keyword1, keyword2);
    std::cout << "\nШифротекст:      " << ciphertext << "\n";
    std::cout << "Розшифровано:    "
              << twoSquareDecrypt(ciphertext, keyword1, keyword2) << "\n";

    return 0;
}
```
Результат роботи програми:

```
=== Подвійний квадрат Уітстона ===
Ключ 1:          EXAMPLE
Ключ 2:          KEYWORD
Відкритий текст: HELLO WORLD

Квадрат 1:
E X A M P
L B C D F
G H I K N
O Q R S T
U V W Y Z

Квадрат 2:
K E Y W O
R D A B C
F G H I L
M N P Q S
T U V X Z

Шифротекст:      HEDTFKZYTHDX
Розшифровано:    HELXLOWORLDX
```
## Порядок виконання роботи

1. Отримати в викладача номер індивідуального варіанта.

2. Реалізувати функцію побудови матриці 5×5 за ключовим словом.

3. Реалізувати підготовку тексту (видалення пробілів, обробка повторів).

4. Реалізувати шифрування та дешифрування однієї біграми.

5. Реалізувати повний шифр Плейфера.

6. Реалізувати подвійний квадрат Уітстона.

7. Виконати шифрування тексту з варіанта.

8. Оформити звіт та зробити висновок.

## Вимоги до звіту

Звіт оформлюється на бланку встановленого зразка і має містити:

- тему, мету та обладнання;
- код програми з коментарями;
- візуалізацію матриць шифрування;
- приклади всіх трьох правил (рядок, стовпець, прямокутник);
- результати шифрування та дешифрування;
- висновок про переваги поліграмних шифрів.

## Варіанти індивідуальних завдань

| №   | Ключ Плейфера | Ключ 1 (двокв.) | Ключ 2 (двокв.) | Текст      |
|-----|---------------|-----------------|-----------------|------------|
| 1   | MONARCHY      | EXAMPLE         | KEYWORD         | ATTACK     |
| 2   | PLAYFAIR      | CIPHER          | SECURE          | DEFEND     |
| 3   | CIPHER        | ENCODE          | DECODE          | MISSION    |
| 4   | SECURITY      | PROTECT         | SHIELD          | TARGET     |
| 5   | CRYPTO        | HIDDEN          | COVERT          | SECRET     |
| 6   | ENCODE        | STEALTH         | MASKED          | AGENT      |
| 7   | DECODE        | PUZZLE          | ENIGMA          | RENDEZVOUS |
| 8   | PROTECT       | MYSTERY         | RIDDLE          | CONTACT    |
| 9   | DEFEND        | SHADOW          | PHANTOM         | REPORT     |
| 10  | SHIELD        | GHOST           | SPIRIT          | RETREAT    |
| 11  | GUARD         | SILENT          | WHISPER         | ADVANCE    |
| 12  | SECURE        | NIGHT           | DAWN            | CONFIRM    |
| 13  | PRIVATE       | EAGLE           | FALCON          | EXECUTE    |
| 14  | HIDDEN        | TIGER           | LION            | PREPARE    |
| 15  | COVERT        | STORM           | THUNDER         | COMPLETE   |
| 16  | STEALTH       | OCEAN           | RIVER           | ABORT      |
| 17  | MASKED        | FOREST          | MOUNTAIN        | PROCEED    |
| 18  | CONCEALED     | WINTER          | SUMMER          | STANDBY    |
| 19  | OBSCURED      | ALPHA           | OMEGA           | COMMENCE   |
| 20  | CRYPTIC       | BRAVO           | DELTA           | FINALIZE   |

## Контрольні запитання

Запитання згруповано за рівнями навчальних досягнень. Для позитивної оцінки студент має відповісти на запитання середнього рівня, оцінка «добре» потребує відповідей достатнього рівня, оцінка «відмінно» — високого.

### Середній рівень (репродуктивний)

1. Що таке поліграмний шифр?
2. Які правила шифрування біграм застосовує шифр Плейфера?
3. Як формується таблиця 5×5 для шифру Плейфера?
4. Чому літери I та J об'єднують в одну клітинку?
5. Як обробляються повторювані літери в біграмі, наприклад LL?
6. Як дешифрувати біграму, літери якої розташовані в одному рядку?
7. Скільки можливих ключів має шифр Плейфера?
8. Що таке подвійний квадрат Уітстона?

### Достатній рівень (конструктивно-варіативний)

1. Які переваги поліграмних шифрів над моноалфавітними з погляду частотного аналізу?
2. Чому подвійний квадрат вважається стійкішим за одинарний шифр Плейфера?
3. Як зміниться алгоритм, якщо використати таблицю 6×6 для української абетки?
4. Запишіть порядок дій для розшифрування біграми, літери якої утворюють прямокутник.
5. Чому текст непарної довжини доповнюють і як обрати символ-заповнювач?
6. Як частотний аналіз біграм застосовують до шифру Плейфера?
7. Чому шифр Плейфера не приховує довжину повідомлення?
8. Як перевірити, що реалізація шифрує й дешифрує симетрично?

### Високий рівень (творчий)

1. Поясніть, чому перехід від однієї літери до біграми принципово ускладнює частотний аналіз, і оцініть, скільки тексту потрібно криптоаналітику.
2. Запропонуйте модифікацію шифру Плейфера, яка усуває його головну слабкість. Обґрунтуйте, ціною чого досягається виграш.
3. Порівняйте шифр Плейфера й подвійний квадрат за трьома критеріями: розмір ключа, складність реалізації, стійкість.
4. Сформулюйте, чому історичні поліграмні шифри не застосовують сьогодні, попри їхню відносну складність.

## Критерії оцінювання

Робота оцінюється за загальними критеріями курсу — див. [Критерії оцінювання лабораторних робіт](#/02-software-security-methods/grading).
