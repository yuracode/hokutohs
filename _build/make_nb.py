import json

REPO_PATH = "yuracode/hokutohs/blob/main/lesson.ipynb"

cells = []

def md(src):
    cells.append({"cell_type": "markdown", "metadata": {}, "source": src.strip("\n")})

def code(src, form=False):
    meta = {"cellView": "form"} if form else {}
    cells.append({"cell_type": "code", "metadata": meta, "execution_count": None,
                  "outputs": [], "source": src.strip("\n")})

def answer(src):
    md(f"""
<details>
<summary>🆘 どうしても動かないときは ここをタップ（こたえ）</summary>

```python
{src.strip()}
```
</details>
""")

# ---------------------------------------------------------------- 表紙
md(f"""
[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/{REPO_PATH})

# 🎰 ガチャを作ろう！
### 〜 変数・if・for でつくる、自分だけのミニアプリ 〜

今日のゴールは、**ボタンを押すとガチャが回るアプリ**を自分の手で完成させること！

| Step | やること | 新しく出てくるもの |
|:---:|---|---|
| 1 | 乱数を変数に入れる | 🎲 変数 |
| 2 | 「ノーマル」が出たら表示 | 🔀 if |
| 3 | レア度を4段階にする | 🔀 elif / else |
| 4 | 5回くりかえす | 🔁 for |
| 5 | 結果をためておく | 📦 リスト |
| 6 | ひとまとめにする | 🧰 関数（def / return） |
| 7 | カードにしてアプリ化！ | 🃏 card / gallery / run_app |
| 8 | アレンジタイム | 🎨 自由に改造 |

> 📱 **iPadの人へ**：コードの `'` や `"` が `’` `”` に化けるとエラーになるよ。
> 「設定 → 一般 → キーボード → **スマート句読点をオフ**」にしておこう。

> 💾 **保存したい人は**：上のメニュー「ファイル → ドライブにコピーを保存」をしておくと、自分のGoogleドライブに残るよ。
""")

# ---------------------------------------------------------------- 準備
md("""
## 🔧 準備：まずはこのセルを ▶ で実行！

このセルには、今日使う「便利な道具」が入っているよ。**中身は見なくても大丈夫。** ▶ を押すだけでOK。

- `card(...)` … 文字と色を渡すと、カードにしてくれる
- `gallery(...)` … カードを並べて見せてくれる
- `run_app(...)` … 関数を渡すと、ボタン付きのアプリにしてくれる

⚠️ 「警告：このノートブックは Google が作成したものではありません」と出たら **「このまま実行」** を押そう。

⚠️ 途中でエラー `NameError: name 'random' is not defined` などが出たら、**このセルをもう一度実行**してね。
""")

code("""
#@title 🔧 準備セル（▶ を押すだけ。中身は触らなくてOK）
import random
import ipywidgets as widgets
from IPython.display import display, HTML

def card(text, color='#4A90D9', emoji=''):
    \"\"\"文字と色を渡すだけでカード風のHTML表示にしてくれる関数\"\"\"
    return f'''
    <div style="padding:20px; background:{color}; border-radius:12px;
                color:white; font-size:24px; text-align:center;">
        {emoji} {text}
    </div>'''

def gallery(cards):
    \"\"\"カードのリストを受け取って横に並べて表示する\"\"\"
    return ''.join(cards)

def run_app(func, label='入力'):
    \"\"\"関数を渡すだけでミニGUIにしてくれるヘルパー\"\"\"
    text = widgets.Text(description=label, placeholder='ここに入力')
    button = widgets.Button(description='実行')
    output = widgets.Output()

    def on_click(_):
        output.clear_output()
        with output:
            display(HTML(func(text.value)))

    button.on_click(on_click)
    display(text, button, output)

print('✅ 準備OK！ Step1 に進もう')
""", form=True)

md("""
✅ **こうなったらOK**
```
✅ 準備OK！ Step1 に進もう
```
""")

# ---------------------------------------------------------------- Step1
md("""
---
## 🎲 Step1：変数 ― 乱数を「箱」に入れてみよう

**変数** は、値を入れておく **名前つきの箱** 📦 のこと。

`random.random()` は、**0以上1未満のランダムな小数**を1つ作ってくれる命令。
それを `r` という箱に入れて、`print` で中身を見てみよう。

✏️ `___` のところを書きかえて、▶ で実行！
""")

code("""
# 🎲 Step1：乱数を変数 r に入れる
r = random.random()   # 0以上1未満のランダムな小数が r に入る

print(___)            # ✏️ ___ を r に書きかえよう
""")

md("""
✅ **こうなったらOK**（数字は毎回ちがうよ。何回か ▶ を押してみよう！）
```
0.7318204519380561
```
""")
answer("""
r = random.random()
print(r)
""")

# ---------------------------------------------------------------- Step2
md("""
---
## 🔀 Step2：if ― 「ノーマル」が出たら表示しよう

**if** は「もし〜なら、これをやる」という **分かれ道** 🚦。

```
もし r が 0.6 以下なら → 「ノーマル」と表示
```

`r` は 0〜1 の数なので、**0.6以下になるのはだいたい60%**。つまり「ノーマルが出る確率 60%」になる！

⚠️ `if` の行の最後の **`:`（コロン）** と、次の行の **字下げ（スペース4つ）** を忘れずに。
""")

code("""
# 🔀 Step2：if で分かれ道をつくる
r = random.random()   # Step1と同じ
print(r)              # Step1と同じ

# ↓ここを追加（if文）
if r <= ___:          # ✏️ ___ に 0.6 を入れよう
    print('⚪ ノーマル')
""")

md("""
✅ **こうなったらOK**（何回か実行してみよう）

r が 0.6 以下のとき 👇
```
0.2841739920114773
⚪ ノーマル
```
r が 0.6 より大きいとき 👇（何も出ないのが正解！）
```
0.9120483381027714
```
""")
answer("""
r = random.random()
print(r)

if r <= 0.6:
    print('⚪ ノーマル')
""")

# ---------------------------------------------------------------- Step3
md("""
---
## 🔀 Step3：elif / else ― レア度を4段階にしよう

`if` だけだと「ノーマル」しか出ない…。そこで **elif**（そうじゃなくて、もし〜なら）と **else**（それ以外ぜんぶ）を使う！

```
0          0.6        0.85     0.97  1
|---ノーマル---|---レア---|--SR--|UR|
     60%         25%      12%    3%
```

- `if r <= 0.6` → ⚪ ノーマル
- `elif r <= 0.85` → 🔵 レア
- `elif r <= 0.97` → 🟣 スーパーレア
- `else` → ⭐ ウルトラレア

> 💡 0.6 / 0.85 / 0.97 は **仮の数字**。Step8 で自由に変えられるよ。
""")

code("""
# 🔀 Step3：レア度を4段階にする
r = random.random()
print(r)

if r <= 0.6:
    print('⚪ ノーマル')
# ↓ここから追加（elif と else）
elif r <= 0.85:
    print('🔵 レア')
elif r <= ___:        # ✏️ スーパーレアのしきい値 0.97 を入れよう
    print('🟣 スーパーレア')
___:                  # ✏️ 「それ以外ぜんぶ」は else
    print('⭐ ウルトラレア')
""")

md("""
✅ **こうなったらOK**（ウルトラレアが出るまで連打してみよう！⭐は3%だよ）
```
0.9812276130449172
⭐ ウルトラレア
```
""")
answer("""
r = random.random()
print(r)

if r <= 0.6:
    print('⚪ ノーマル')
elif r <= 0.85:
    print('🔵 レア')
elif r <= 0.97:
    print('🟣 スーパーレア')
else:
    print('⭐ ウルトラレア')
""")

# ---------------------------------------------------------------- Step4
md("""
---
## 🔁 Step4：for ― 5回くりかえそう

1回ずつ ▶ を押すのは大変…。**for** を使うと、同じことを **くりかえし** やってくれる！

```python
for i in range(5):
    （ここに書いたことが 5回 くりかえされる）
```

Step3 のコードは **もう字下げしてあるよ**。いちばん上の1行だけ書けばOK！
""")

code("""
# 🔁 Step4：5回くりかえす
# ↓ここを追加（for文）
___ i in range(5):       # ✏️ ___ に for を入れよう
    r = random.random()      # ← Step3の中身を字下げしただけ（print(r) は消したよ）
    if r <= 0.6:
        print('⚪ ノーマル')
    elif r <= 0.85:
        print('🔵 レア')
    elif r <= 0.97:
        print('🟣 スーパーレア')
    else:
        print('⭐ ウルトラレア')
""")

md("""
✅ **こうなったらOK**（5行出てくる！中身は毎回ちがう）
```
⚪ ノーマル
⚪ ノーマル
🔵 レア
⚪ ノーマル
🟣 スーパーレア
```
💡 `range(5)` の 5 を 10 にすると…？ 試してみよう！
""")
answer("""
for i in range(5):
    r = random.random()
    if r <= 0.6:
        print('⚪ ノーマル')
    elif r <= 0.85:
        print('🔵 レア')
    elif r <= 0.97:
        print('🟣 スーパーレア')
    else:
        print('⭐ ウルトラレア')
""")

# ---------------------------------------------------------------- Step5
md("""
---
## 📦 Step5：リスト ― 結果をためておこう

`print` だと表示してそれっきり。あとでまとめて使えるように、結果を **リスト** にためていこう。

- `results = []` … **からっぽのリスト**（箱がつながった列車 🚃）を用意
- `results.append(〜)` … リストの **最後に1つ追加**

`print('〜')` だったところは、ぜんぶ `results.append('〜')` に変えておいたよ。
""")

code("""
# 📦 Step5：結果をリストにためる
results = ___            # ✏️ ↓ここを追加：からっぽのリスト [] を入れよう
for i in range(5):
    r = random.random()
    if r <= 0.6:
        results.append('⚪ ノーマル')     # ← print を results.append に変えた
    elif r <= 0.85:
        results.append('🔵 レア')
    elif r <= 0.97:
        results.append('🟣 スーパーレア')
    else:
        results.append('⭐ ウルトラレア')

print(___)               # ✏️ ↓ここを追加：results の中身を見よう（字下げしないでね）
""")

md("""
✅ **こうなったらOK**（`[ ]` の中に5個ならんでいる）
```
['⚪ ノーマル', '🔵 レア', '⚪ ノーマル', '⚪ ノーマル', '🔵 レア']
```
⚠️ 同じ行が5回出てきた人は、`print(results)` が字下げされているよ。行の先頭のスペースを消そう。
""")
answer("""
results = []
for i in range(5):
    r = random.random()
    if r <= 0.6:
        results.append('⚪ ノーマル')
    elif r <= 0.85:
        results.append('🔵 レア')
    elif r <= 0.97:
        results.append('🟣 スーパーレア')
    else:
        results.append('⭐ ウルトラレア')

print(results)
""")

# ---------------------------------------------------------------- Step6
md("""
---
## 🧰 Step6：関数 ― ひとまとめにして名前をつけよう

ここまでのコードを **`gacha`** という名前の **関数** にまとめるよ。関数は「材料を入れると、結果が出てくる機械」🏭。

```
回数（count）→ 🏭 gacha → 結果のリスト
```

- `def gacha(count):` … 「gacha という機械を作るよ。材料は count」
- `return results` … 「できあがった results を外に返すよ」
- `range(int(count))` … 5回固定だったのを **count回** に変えた（`int()` は「数字にしてね」の意味）

中身はもう字下げしてあるよ。`___` を2か所うめよう！
""")

code("""
# 🧰 Step6：関数にまとめる
# ↓ここを追加：gacha という関数を作る
def gacha(count):
    results = []
    for i in range(int(count)):     # ← 5 を int(count) に変えた
        r = random.random()
        if r <= 0.6:
            results.append('⚪ ノーマル')
        elif r <= 0.85:
            results.append('🔵 レア')
        elif r <= 0.97:
            results.append('🟣 スーパーレア')
        else:
            results.append('⭐ ウルトラレア')
    return ___                     # ✏️ ↓ここを追加：results を返そう

# ↓ここを追加：作った関数を使ってみる
print(gacha(___))                  # ✏️ 何連ガチャにする？ 数字を入れよう（例：10）
""")

md("""
✅ **こうなったらOK**（入れた数だけならぶ）
```
['⚪ ノーマル', '⚪ ノーマル', '🔵 レア', '⚪ ノーマル', '🟣 スーパーレア', '⚪ ノーマル', '🔵 レア', '⚪ ノーマル', '⚪ ノーマル', '⚪ ノーマル']
```
""")
answer("""
def gacha(count):
    results = []
    for i in range(int(count)):
        r = random.random()
        if r <= 0.6:
            results.append('⚪ ノーマル')
        elif r <= 0.85:
            results.append('🔵 レア')
        elif r <= 0.97:
            results.append('🟣 スーパーレア')
        else:
            results.append('⭐ ウルトラレア')
    return results

print(gacha(10))
""")

# ---------------------------------------------------------------- Step7
md("""
---
## 🃏 Step7：カードにしてアプリ化！ 🎉

いよいよ完成！ 最初に準備した **便利な道具** を使うよ。

- 文字だったところ → `card('名前', color='色', emoji='絵文字')` に変身（ここは変えておいたよ）
- `return results` → `return gallery(results)` でカードを並べて返す
- 最後に `run_app(gacha, ...)` で **ボタン付きアプリ** にする！

✏️ `___` を2か所うめて ▶。出てきた入力欄に回数を入れて **「実行」** を押そう！
""")

code("""
# 🃏 Step7：カードにしてアプリ化！
def gacha(count):
    results = []
    for i in range(int(count)):
        r = random.random()
        # ★ 0.6 / 0.85 / 0.97（しきい値）、名前・色・絵文字は仮の値。Step8で自由に変えてOK
        if r <= 0.6:
            results.append(card('ノーマル', color='#9E9E9E', emoji='⚪'))   # ← 文字を card(...) に変えた
        elif r <= 0.85:
            results.append(card('レア', color='#4A90D9', emoji='🔵'))
        elif r <= 0.97:
            results.append(card('スーパーレア', color='#9966CC', emoji='🟣'))
        else:
            results.append(card('ウルトラレア', color='#FFD700', emoji='⭐'))
    return ___(results)            # ✏️ ↓ここを変更：gallery でカードを並べて返そう

# ↓ここを追加：アプリとして起動！
run_app(___, label='ガチャの回数:')   # ✏️ 作った関数 gacha を渡そう（( ) はつけない！）
""")

md("""
✅ **こうなったらOK**

1. 「ガチャの回数:」の入力欄と「実行」ボタンが出てくる
2. 入力欄に `10` と入れて「実行」を押す
3. 色つきのカードが10枚ならぶ 🎉（もう一度押すと引き直し！）

⚠️ `run_app(gacha(), ...)` のように `()` をつけるとエラーになるよ。`gacha` だけでOK。
""")
answer("""
def gacha(count):
    results = []
    for i in range(int(count)):
        r = random.random()
        if r <= 0.6:
            results.append(card('ノーマル', color='#9E9E9E', emoji='⚪'))
        elif r <= 0.85:
            results.append(card('レア', color='#4A90D9', emoji='🔵'))
        elif r <= 0.97:
            results.append(card('スーパーレア', color='#9966CC', emoji='🟣'))
        else:
            results.append(card('ウルトラレア', color='#FFD700', emoji='⭐'))
    return gallery(results)

run_app(gacha, label='ガチャの回数:')
""")

# ---------------------------------------------------------------- Step8
md("""
---
## 🎨 Step8：アレンジタイム！ 自分だけのガチャにしよう

★ マークのところを自由に書きかえて、▶ → 「実行」で試してみよう。

| 変えるところ | 例 |
|---|---|
| ★ しきい値（出やすさ） | `0.6` → `0.3` にするとノーマルが出にくくなる |
| ★ 名前 | `'ノーマル'` → `'おにぎり'`、`'ウルトラレア'` → `'伝説の勇者'` |
| ★ 色 | 下の色見本から選んでコピー |
| ★ 絵文字 | `'⚪'` → `'🍙'`、`'⭐'` → `'👑'` |

🎨 **色見本**（`'#...'` の中身を入れかえてね）

| 色 | コード | 色 | コード |
|---|---|---|---|
| 🟥 赤 | `#E53935` | 🟩 緑 | `#43A047` |
| 🟧 オレンジ | `#FB8C00` | 🟦 青 | `#1E88E5` |
| 🟨 黄 | `#FDD835` | 🟪 むらさき | `#8E24AA` |
| 🩷 ピンク | `#EC407A` | ⬛ 黒 | `#212121` |

⚠️ しきい値は **小さい順** に並べてね（例：0.5 → 0.8 → 0.95）。順番がバラバラだと出ないレア度ができちゃう。

🚀 **早く終わった人へチャレンジ**：`elif` をもう1つ増やして、**5段階ガチャ** にしてみよう！
""")

code("""
# 🎨 Step8：アレンジタイム！（★ のところを自由に変えよう）
def gacha(count):
    results = []
    for i in range(int(count)):
        r = random.random()
        if r <= 0.6:              # ★ しきい値
            results.append(card('ノーマル', color='#9E9E9E', emoji='⚪'))       # ★ 名前・色・絵文字
        elif r <= 0.85:           # ★ しきい値
            results.append(card('レア', color='#4A90D9', emoji='🔵'))           # ★
        elif r <= 0.97:           # ★ しきい値
            results.append(card('スーパーレア', color='#9966CC', emoji='🟣'))   # ★
        else:
            results.append(card('ウルトラレア', color='#FFD700', emoji='⭐'))   # ★
    return gallery(results)

run_app(gacha, label='ガチャの回数:')   # ★ label の文字も変えられるよ
""")

md("""
✅ **こうなったらOK**：自分で変えた名前・色・絵文字のカードが出てくる！ 友だちのガチャと見せ合いっこしよう 🙌
""")

# ---------------------------------------------------------------- まとめ
md("""
---
## 🏁 まとめ：今日つかったもの

| 使ったもの | ガチャのどこで？ |
|---|---|
| 🎲 **変数** | `r = random.random()` … 乱数を箱に入れた |
| 🔀 **if / elif / else**（分岐） | r の大きさでレア度を分けた |
| 🔁 **for**（反復） | 回数ぶんガチャを回した |
| 📦 **リスト** | 結果を `results` にためた |
| 🧰 **関数** | ぜんぶを `gacha` にまとめて、アプリに渡した |

プログラムは **順次（上から順に）・分岐・反復** の組み合わせでできている。今日のガチャにはその3つがぜんぶ入っていたよ！

✍️ **ふりかえり**：「ウルトラレアの確率を 1% にするには、どこをどう変える？」 自分の言葉で書いてみよう。
""")

code("""
# ✍️ ふりかえり：ウルトラレアの確率を 1% にするには、どこをどう変える？
# 「#」のあとに、自分の言葉で書いてみよう（▶ は押さなくてOK）
#
""")

nb = {
    "nbformat": 4, "nbformat_minor": 0,
    "metadata": {
        "colab": {"provenance": [], "toc_visible": True},
        "kernelspec": {"name": "python3", "display_name": "Python 3"},
        "language_info": {"name": "python"},
    },
    "cells": cells,
}
with open("/home/cyber/hokutohs/lesson.ipynb", "w", encoding="utf-8") as f:
    json.dump(nb, f, ensure_ascii=False, indent=1)
print(len(cells), "cells")
