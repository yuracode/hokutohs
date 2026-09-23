# CLAUDE.md — 高校「情報Ⅰ」連携授業 教材生成指示書

## このプロジェクトの前提

- 対象：高校1年生（情報Ⅰ、教科書第3章。順次・分岐・反復の用語自体は既習の可能性あり、ただし今回の授業内で改めて「使える」状態にする）
- 実施：10月5日、**50分1コマ**、同一内容を10クラス展開
- 環境：Google Colaboratory（GitHub上のノートブックを開いて使う。生徒はGoogleアカウント確認済み）
- 生徒端末：iPad
- 教材形式：動画教材＋Colabノートブック（動画は10クラス共通で使い回すナレーション想定）

## 授業の位置づけ（すでに完成している前提コード）

以下は前段の授業ですでに用意済みの共通部品。**変更しない。そのまま使う。**

```python
import random
import ipywidgets as widgets
from IPython.display import display, HTML

def card(text, color='#4A90D9', emoji=''):
    """文字と色を渡すだけでカード風のHTML表示にしてくれる関数"""
    return f'''
    <div style="padding:20px; background:{color}; border-radius:12px;
                color:white; font-size:24px; text-align:center;">
        {emoji} {text}
    </div>'''

def gallery(cards):
    """カードのリストを受け取って横に並べて表示する"""
    return ''.join(cards)

def run_app(func, label='入力'):
    """関数を渡すだけでミニGUIにしてくれるヘルパー"""
    text = widgets.Text(description=label, placeholder='ここに入力')
    button = widgets.Button(description='実行')
    output = widgets.Output()

    def on_click(_):
        output.clear_output()
        with output:
            display(HTML(func(text.value)))

    button.on_click(on_click)
    display(text, button, output)
```

生徒はこれらの中身を見る必要はなく、「便利な道具」として使うだけでよい。**HTMLタグやウィジェットのコールバックは生徒コードに一切出さない。**

## 今回のゴール

生徒自身の手で、以下の`gacha()`関数を完成させ、`run_app(gacha, label='ガチャの回数:')`で動かす。

```python
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
```

ここに至るまでを、**変数→if→for→組み合わせ**の順にスモールステップで構築する。

## 設計方針（厳守）

1. 1ステップにつき新出要素は1つまで。前ステップのコードに1〜2行足すだけで次に進める形にする。
2. 各ステップは単体で実行確認できる（生徒が「できた」と実感できる状態を毎回作る）。
3. HTMLタグ・ウィジェットのコールバックなど内部実装は生徒に見せない／触らせない。
4. 50分1コマに厳密に収まる分量にする（導入・各ステップ・アレンジ・まとめの時間配分を明記すること）。
5. 生徒向けの説明・コメントは平易な日本語。堅苦しい敬語は避ける。絵文字は要所で使ってよい（画面が賑やかになる方向を歓迎）。
6. 変数名・関数名は英語（Pythonの慣習通り）でよいが、説明文・コメントは日本語。

## スモールステップ構成（たたき台。最終的な分割・分数調整はClaude Codeに一任）

- Step1（変数）：`r = random.random()`で値を1つ変数に入れて`print`するだけ。「乱数が変数に入る」を体感する。
- Step2（if）：Step1の`r`を使って`if r <= 0.6: print('ノーマル')`のような1分岐だけ書く。
- Step3（if/elif/else）：分岐を4段階（ノーマル/レア/スーパーレア/ウルトラレア）に増やす。
- Step4（for）：Step3の中身を`for i in range(5):`で5回繰り返すだけ（まだリストに貯めない、printだけ）。
- Step5（変数の応用＝リスト）：`results = []`を用意し、`results.append(...)`で貯めていく。最後に`print(results)`で中身を確認。
- Step6（関数化＋card連携）：ここまでの中身を`def gacha(count):`としてまとめ、`print`していた部分を`card(...)`に差し替え、`return gallery(results)`で締める。
- Step7（run_appに接続）：`run_app(gacha, label='ガチャの回数:')`を実行し、完成を確認。
- Step8（アレンジタイム）：確率のしきい値やレア度の名前・色・絵文字を自分で書き換えて遊ぶ。

## 成果物として出力してほしいもの

1. `lesson.ipynb`
   - GitHubに置いてColabで開ける形式（`Open in Colab`バッジ付き）
   - 冒頭に「触らなくていいセル」として共通部品（`card`/`gallery`/`run_app`）を配置
   - Step1〜8を、Markdownセル（一言説明・図や絵文字OK）→コードセル（一部空欄/TODOコメントで穴埋め式）→期待される実行結果イメージ、の順で構成
   - Step間の差分が生徒に一目でわかるようにコメントで明示（例：`# ↓ここを追加`）

2. `video_script.md`
   - 各Stepに対応するナレーション原稿（10クラス共通で使い回す想定なので、口調・言い回しを統一）
   - 各Stepの想定所要時間を併記

3. `timing.md`
   - 50分のタイムテーブル（導入・Step1〜8・アレンジ・まとめの内訳、バッファ込み）

## 確認事項（作業開始前にClaude Codeが判断に迷う場合はここに書き出してから着手）

- Step数が多すぎて50分に収まらない場合、どのStepを統合してよいか（例：Step1+2、Step4+5、など)の判断はClaude Codeに一任してよいが、統合した場合は`timing.md`にその旨明記すること
- しきい値（0.6 / 0.85 / 0.97）やレア度の名前・色は仮値。差し替え可能な設計であることをコメントで示すこと
