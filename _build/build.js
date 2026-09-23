const pptxgen = require("pptxgenjs");
const fs = require("fs");

const OUT_DIR = "/home/cyber/hokutohs";
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.title = "ガチャを作ろう！ 情報Ⅰ 授業動画";

// ---------- デザイン定数 ----------
const F = "BIZ UDPGothic";
const MONO = "BIZ UDGothic";
const NAVY = "1F1D47";
const INK = "22223B";
const MUTED = "6B6B80";
const TINT = "F3F2FA";
const PINK = "E94B6A";
const R = { N: "8E8E8E", R: "3F86D6", SR: "8E5CC8", UR: "F2C200" };
const STEP = {
  1: { c: R.N, t: "FFFFFF", emoji: "🎲", name: "変数" },
  2: { c: R.N, t: "FFFFFF", emoji: "🔀", name: "if" },
  3: { c: R.R, t: "FFFFFF", emoji: "🔀", name: "elif / else" },
  4: { c: R.R, t: "FFFFFF", emoji: "🔁", name: "for" },
  5: { c: R.SR, t: "FFFFFF", emoji: "📦", name: "リスト" },
  6: { c: R.SR, t: "FFFFFF", emoji: "🧰", name: "関数" },
  7: { c: R.UR, t: INK, emoji: "🃏", name: "アプリ化" },
  8: { c: R.UR, t: INK, emoji: "🎨", name: "アレンジ" },
};

const shadow = () => ({ type: "outer", color: "000000", blur: 6, offset: 2, angle: 90, opacity: 0.18 });

// ---------- 部品 ----------
function text(slide, str, opts) {
  slide.addText(str, { fontFace: F, color: INK, isTextBox: true, margin: 0, ...opts });
}

function title(slide, str, x = 0.6) {
  text(slide, str, { x, y: 0.4, w: 12.3 - x, h: 0.8, fontSize: 32, bold: true, valign: "middle" });
}

// レア度カード風のステップバッジ（全体のモチーフ）
function stepBadge(slide, n) {
  const s = STEP[n];
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 0.4, w: 1.55, h: 0.8, rectRadius: 0.12, fill: { color: s.c }, shadow: shadow(),
  });
  text(slide, `${s.emoji} STEP${n}`, {
    x: 0.6, y: 0.4, w: 1.55, h: 0.8, fontSize: 18, bold: true, color: s.t, align: "center", valign: "middle",
  });
}

function pauseBadge(slide) {
  slides[curSlide - 1].pause = true;
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 9.35, y: 0.47, w: 3.4, h: 0.66, rectRadius: 0.33, fill: { color: PINK }, shadow: shadow(),
  });
  text(slide, "⏸ 動画を止めてやってみよう", {
    x: 9.35, y: 0.47, w: 3.4, h: 0.66, fontSize: 16, bold: true, color: "FFFFFF", align: "center", valign: "middle",
  });
}

const shotList = [];
let curSlide = 0;
function shot(slide, id, desc, x, y, w, h) {
  shotList.push({ id, desc, slide: curSlide });
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: 0.12, fill: { color: TINT }, line: { color: R.SR, width: 2, dashType: "dash" },
  });
  text(slide, [
    { text: "📷", options: { fontSize: h > 3 ? 40 : 28, breakLine: true } },
    { text: `スクショ ${id}`, options: { fontSize: 16, bold: true, color: R.SR, breakLine: true } },
    { text: desc, options: { fontSize: 12, color: MUTED } },
  ], { x: x + 0.25, y: y + 0.2, w: w - 0.5, h: h - 0.4, align: "center", valign: "middle", paraSpaceAfter: 4 });
}

// コードブロック：✏️行＝金色、「↓ここ」行＝ピンク、コメント＝水色グレー
function codeBlock(slide, code, x, y, w, h, fontSize = 15) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: 0.12, fill: { color: "1E1E2E" }, shadow: shadow(),
  });
  const lines = code.replace(/^\n|\n$/g, "").split("\n");
  const runs = [];
  lines.forEach((line, i) => {
    const last = i === lines.length - 1;
    const idx = line.indexOf("#");
    const codePart = idx >= 0 ? line.slice(0, idx) : line;
    const cmt = idx >= 0 ? line.slice(idx) : "";
    const blank = line.includes("✏️");
    const added = cmt.includes("↓ここ");
    if (codePart) runs.push({ text: codePart, options: { color: blank ? "FFD54F" : "F2F2F7", bold: blank } });
    if (cmt) runs.push({ text: cmt, options: { color: blank ? "FFD54F" : added ? "FF8FB1" : "8FA8C8", bold: added } });
    if (!codePart && !cmt) runs.push({ text: " ", options: {} });
    if (!last) runs[runs.length - 1].options.breakLine = true;
  });
  slide.addText(runs, {
    x: x + 0.3, y: y + 0.25, w: w - 0.6, h: h - 0.5, fontFace: MONO, fontSize, valign: "top",
    isTextBox: true, margin: 0, lineSpacingMultiple: 1.15,
  });
}

// 「こうなったらOK」出力ボックス
function okBox(slide, out, x, y, w, h, fontSize = 14) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.12, fill: { color: "E8F6EC" } });
  text(slide, [
    { text: "✅ こうなったらOK", options: { bold: true, color: "1E7B3A", fontSize: 15, breakLine: true } },
    { text: out, options: { fontFace: MONO, fontSize, color: INK } },
  ], { x: x + 0.25, y: y + 0.15, w: w - 0.5, h: h - 0.3, valign: "top", paraSpaceAfter: 6 });
}

// 説明用の小カード（アイコン＋見出し＋本文）
function infoCard(slide, x, y, w, h, icon, head, body, color = R.SR) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.12, fill: { color: "FFFFFF" }, shadow: shadow() });
  slide.addShape(pres.shapes.OVAL, { x: x + 0.3, y: y + 0.3, w: 0.8, h: 0.8, fill: { color } });
  text(slide, icon, { x: x + 0.3, y: y + 0.3, w: 0.8, h: 0.8, fontSize: 24, align: "center", valign: "middle" });
  text(slide, head, { x: x + 1.3, y: y + 0.3, w: w - 1.55, h: 0.8, fontSize: 20, bold: true, valign: "middle", fontFace: head.match(/^[\x00-\x7F]+$/) ? MONO : F });
  text(slide, body, { x: x + 0.3, y: y + 1.25, w: w - 0.6, h: h - 1.45, fontSize: 16, color: MUTED, valign: "top" });
}

function rarityCard(slide, x, y, w, h, label, emoji, color, tcolor = "FFFFFF", fs = 20) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.12, fill: { color }, shadow: shadow() });
  text(slide, `${emoji} ${label}`, { x, y, w, h, fontSize: fs, bold: true, color: tcolor, align: "center", valign: "middle" });
}

function arrow(slide, x, y, w, color = MUTED) {
  slide.addShape(pres.shapes.RIGHT_ARROW, { x, y, w, h: 0.45, fill: { color } });
}

// ---------- スライド定義 ----------
const slides = []; // {section, notes, pause, build}
function S(section, notes, build, pause = false) { slides.push({ section, notes, build, pause }); }

// 1 タイトル
S("導入", `みんな、こんにちは！ 今日の情報Ⅰは、Pythonで「ガチャ」を作るよ。ボタンを押すと、ノーマル、レア、スーパーレア、ウルトラレアのカードがランダムに出てくる、あのガチャだよ。使うのは、変数・if・for の3つ。どれも教科書の第3章に出てきたものだけど、今日は「知ってる」から「使える」にレベルアップしよう！`,
(s) => {
  s.background = { color: NAVY };
  text(s, "情報Ⅰ 第3章 プログラミング", { x: 0.8, y: 1.5, w: 7, h: 0.5, fontSize: 18, color: "CFCBF5" });
  text(s, "🎰 ガチャを作ろう！", { x: 0.8, y: 2.1, w: 7.2, h: 1.3, fontSize: 54, bold: true, color: "FFFFFF" });
  text(s, "変数・if・for でつくる\n自分だけのミニアプリ", { x: 0.8, y: 3.6, w: 7, h: 1.2, fontSize: 24, color: "FFFFFF" });
  text(s, "Google Colaboratory ／ Python", { x: 0.8, y: 5.6, w: 7, h: 0.4, fontSize: 14, color: "CFCBF5" });
  const cards = [["ノーマル", "⚪", "9E9E9E", "FFFFFF"], ["レア", "🔵", "4A90D9", "FFFFFF"], ["スーパーレア", "🟣", "9966CC", "FFFFFF"], ["ウルトラレア", "⭐", "FFD700", INK]];
  cards.forEach(([l, e, c, t], i) => rarityCard(s, 8.3 + (i % 2) * 0.35, 1.3 + i * 1.2, 4.0, 0.95, l, e, c, t, 22));
});

// 2 ゴール
S("導入", `まずは完成形を見てみよう。これが今日のゴール。入力欄に回数を入れて「実行」を押すと、色つきのカードがずらっと並ぶ。これを、この1時間で、自分の手で作りきるよ。最後には、名前や色、出る確率も自分好みに改造できるようになる。`,
(s) => {
  title(s, "🏆 今日のゴール");
  text(s, [
    { text: "ボタンを押すと\nガチャが回るアプリを\n自分の手で完成させる！", options: { fontSize: 28, bold: true, color: INK, breakLine: true } },
    { text: " ", options: { fontSize: 12, breakLine: true } },
    { text: "回数を入れて「実行」を押すと、色つきのカードがならぶ", options: { fontSize: 16, color: MUTED, breakLine: true } },
    { text: "最後は名前・色・確率を自分好みに改造できる", options: { fontSize: 16, color: MUTED } },
  ], { x: 0.6, y: 1.6, w: 5.4, h: 4.5, valign: "top", paraSpaceAfter: 8 });
  shot(s, "SS-01", "完成したアプリ（10連ガチャでカードがならんだ画面）", 6.4, 1.5, 6.3, 4.73);
});

// 3 流れ
S("導入", `今日は8つのステップで進むよ。変数、if、elif と else、for、リスト、関数、そしてカードにしてアプリ化、最後にアレンジタイム。1つのステップで新しく覚えることは1つだけ。前のステップのコードに1行か2行足していくだけだから、安心してね。ステップが進むほど、カードの色もノーマルからウルトラレアにレベルアップしていくよ。`,
(s) => {
  title(s, "🗺️ 今日の流れ ― 8ステップ");
  const w = 2.85, h = 2.0, gx = 0.3;
  for (let n = 1; n <= 8; n++) {
    const col = (n - 1) % 4, row = Math.floor((n - 1) / 4);
    const x = 0.6 + col * (w + gx), y = 1.55 + row * (h + 0.35);
    const st = STEP[n];
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.12, fill: { color: st.c }, shadow: shadow() });
    text(s, [
      { text: `STEP${n}`, options: { fontSize: 14, bold: true, breakLine: true } },
      { text: st.emoji, options: { fontSize: 30, breakLine: true } },
      { text: st.name, options: { fontSize: 22, bold: true } },
    ], { x, y: y + 0.1, w, h: h - 0.2, align: "center", valign: "middle", color: st.t, paraSpaceAfter: 2 });
  }
  text(s, "⚪ ノーマル → 🔵 レア → 🟣 スーパーレア → ⭐ ウルトラレア　進むほどレア度アップ！", {
    x: 0.6, y: 6.35, w: 12.1, h: 0.5, fontSize: 16, color: MUTED, align: "center",
  });
});

// 4 動画の使い方
S("導入", `この動画の使い方を説明するね。画面の右上にピンクの「動画を止めてやってみよう」マークが出たら、動画を止めて、自分のノートブックでコードを書こう。書けたら、セルの左の再生ボタンで実行。動画の「こうなったらOK」と同じになれば成功だよ。どうしても動かないときは、ノートブックの「こたえ」をタップすれば答えが見られる。答えをコピーして先に進んでも大丈夫。遅れても、必ず追いつけるようになってるからね。`,
(s) => {
  title(s, "🎬 この動画の使い方");
  const items = [
    ["⏸", "止める", "ピンクのマークが\n出たら一時停止", PINK],
    ["✏️", "書く", "ノートブックの\n___ をうめる", R.R],
    ["▶", "実行", "セル左の ▶ を\nタップ", R.SR],
    ["✅", "確認", "「こうなったらOK」\nと同じなら成功！", "2E9E55"],
  ];
  items.forEach(([ic, h, b, c], i) => {
    const x = 0.6 + i * 3.15;
    s.addShape(pres.shapes.OVAL, { x: x + 0.75, y: 1.55, w: 1.2, h: 1.2, fill: { color: c } });
    text(s, ic, { x: x + 0.75, y: 1.55, w: 1.2, h: 1.2, fontSize: 36, align: "center", valign: "middle", color: "FFFFFF" });
    text(s, h, { x, y: 2.9, w: 2.7, h: 0.5, fontSize: 22, bold: true, align: "center" });
    text(s, b, { x, y: 3.4, w: 2.7, h: 0.9, fontSize: 15, color: MUTED, align: "center" });
    if (i < 3) arrow(s, x + 2.6, 1.93, 0.5, "C9C6E0");
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 4.6, w: 7.2, h: 2.2, rectRadius: 0.12, fill: { color: TINT } });
  text(s, [
    { text: "🆘 どうしても動かないときは", options: { bold: true, fontSize: 20, breakLine: true } },
    { text: "各ステップの下にある「こたえ」をタップ → 答えが開くよ", options: { fontSize: 16, color: MUTED, breakLine: true } },
    { text: "答えをコピーして次に進んでもOK。遅れても必ず追いつける！", options: { fontSize: 16, color: MUTED } },
  ], { x: 0.9, y: 4.8, w: 6.7, h: 1.8, valign: "middle", paraSpaceAfter: 6 });
  shot(s, "SS-18", "「こたえ」を開いたところ", 8.1, 4.6, 2.93, 2.2);
});

// 5 iPad設定
S("準備", `作業を始める前に、iPadの設定を1つだけ変えておこう。「設定」アプリを開いて、「一般」、「キーボード」と進んで、「スマート句読点」をオフにする。これがオンのままだと、プログラムで使うクォーテーション記号が、形のちがう記号に勝手に変わって、エラーの原因になるんだ。画面と同じようにオフになっていればOK。`,
(s) => {
  title(s, "📱 iPadの準備：スマート句読点をオフ");
  pauseBadge(s);
  const steps = ["「設定」アプリを開く", "「一般」→「キーボード」", "「スマート句読点」をオフ"];
  steps.forEach((t, i) => {
    const y = 1.7 + i * 1.05;
    s.addShape(pres.shapes.OVAL, { x: 0.6, y, w: 0.7, h: 0.7, fill: { color: R.SR } });
    text(s, `${i + 1}`, { x: 0.6, y, w: 0.7, h: 0.7, fontSize: 22, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
    text(s, t, { x: 1.5, y, w: 4.6, h: 0.7, fontSize: 20, bold: true, valign: "middle" });
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 5.0, w: 5.5, h: 1.6, rectRadius: 0.12, fill: { color: "FDECEF" } });
  text(s, [
    { text: "なぜ？", options: { bold: true, fontSize: 16, color: PINK, breakLine: true } },
    { text: "オンだと ' が ’ に変わって\nエラーになっちゃう", options: { fontSize: 16, color: INK } },
  ], { x: 0.85, y: 5.15, w: 5.0, h: 1.3, valign: "middle", paraSpaceAfter: 4 });
  shot(s, "SS-02", "iPadの設定画面（スマート句読点がオフになっている状態）", 6.6, 1.5, 6.1, 4.58);
}, true);

// 6 Colabを開く
S("準備", `では、Google Colaboratory、略してColabを開こう。先生から配られたリンクをタップして、「Open in Colab」と書かれたボタンをタップ。Googleアカウントでログインしていれば、ノートブックが開くよ。自分の作品を残したい人は、メニューの「ファイル」から「ドライブにコピーを保存」をしておこう。`,
(s) => {
  title(s, "🚀 Colabでノートブックを開こう");
  pauseBadge(s);
  shot(s, "SS-03", "配布リンク先の「Open in Colab」ボタン", 0.6, 1.5, 5.6, 4.2);
  arrow(s, 6.4, 3.35, 0.55, R.SR);
  shot(s, "SS-04", "Colabでノートブックが開いた画面", 7.1, 1.5, 5.6, 4.2);
  text(s, "💾 作品を残したい人は「ファイル」→「ドライブにコピーを保存」", { x: 0.6, y: 6.1, w: 12.1, h: 0.5, fontSize: 16, color: MUTED, align: "center" });
}, true);

// 7 準備セル
S("準備", `最初に、「準備セル」を実行するよ。セルの左にある再生ボタンをタップしてね。「このノートブックはGoogleが作成したものではありません」という警告が出たら、「このまま実行」をタップ。「準備OK！」と表示されたら成功だよ。このセルには、今日使う便利な道具が入っている。中身は見なくて大丈夫。`,
(s) => {
  title(s, "🔧 準備セルを ▶ で実行");
  pauseBadge(s);
  const labels = [["SS-05", "準備セルの ▶ ボタンの位置"], ["SS-06", "警告ダイアログ（「このまま実行」の位置）"], ["SS-07", "「✅ 準備OK！」と出た画面"]];
  const caps = ["① ▶ をタップ", "② 「このまま実行」", "③ 準備OK！ と出れば成功"];
  labels.forEach(([id, d], i) => {
    const x = 0.6 + i * 4.15;
    text(s, caps[i], { x, y: 1.5, w: 3.8, h: 0.5, fontSize: 20, bold: true });
    shot(s, id, d, x, 2.1, 3.8, 2.85);
  });
  text(s, "中身は見なくてOK。今日使う「便利な道具」が入っているよ", { x: 0.6, y: 5.4, w: 12.1, h: 0.5, fontSize: 16, color: MUTED, align: "center" });
}, true);

// 8 困ったとき
S("準備", `コードを書き始める前に、よくあるエラーを紹介しておくね。アンダーバーが定義されていない、と出たら空欄のうめ忘れ。random が定義されていない、と出たら準備セルをもう一度実行。SyntaxError はコロンやクォーテーションを確認。IndentationError は字下げのズレ。エラーは赤い文字で出るけど、こわくないよ。いちばん下の行を読めば、原因のヒントが書いてあるんだ。`,
(s) => {
  title(s, "🆘 エラーが出たら");
  const rows = [
    ["NameError: name '___'", "空欄のうめ忘れ"],
    ["NameError: name 'random'", "準備セルをもう一度 ▶"],
    ["SyntaxError", ": （コロン）や ' を確認"],
    ["IndentationError", "字下げ（行頭のスペース）のズレ"],
  ];
  const tbl = [[
    { text: "エラーのいちばん下の行", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
    { text: "こうしよう", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
  ]].concat(rows.map(([a, b], i) => [
    { text: a, options: { fontFace: MONO, fill: { color: i % 2 ? "FFFFFF" : TINT } } },
    { text: b, options: { fill: { color: i % 2 ? "FFFFFF" : TINT } } },
  ]));
  s.addTable(tbl, { x: 0.6, y: 1.6, w: 7.4, colW: [3.9, 3.5], fontFace: F, fontSize: 15, color: INK, rowH: 0.75, valign: "middle", border: { type: "none" }, margin: 0.12 });
  shot(s, "SS-17", "エラー表示の例（空欄のまま実行したとき）", 8.4, 1.6, 4.3, 3.23);
  text(s, "赤い文字はこわくない！ いちばん下の行にヒントがあるよ", { x: 0.6, y: 5.7, w: 12.1, h: 0.5, fontSize: 16, color: MUTED });
});

// ---------- STEP1 ----------
S("STEP1", `ステップ1は「変数」。変数は、値を入れておく名前つきの箱のこと。random.random() は、0以上1未満のランダムな小数を1つ作ってくれる命令。これを r という名前の箱に入れる。イコールは「等しい」じゃなくて、「右のものを左の箱に入れる」という意味だったね。`,
(s) => {
  stepBadge(s, 1); title(s, "変数 ― 乱数を「箱」に入れよう", 2.45);
  text(s, "random.random()", { x: 0.6, y: 2.2, w: 3.6, h: 0.7, fontFace: MONO, fontSize: 22, bold: true, color: R.R });
  text(s, "0以上1未満の\nランダムな小数をつくる", { x: 0.6, y: 2.95, w: 3.6, h: 1.0, fontSize: 16, color: MUTED });
  arrow(s, 4.4, 2.75, 1.0, R.N);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.7, y: 1.9, w: 2.4, h: 2.0, rectRadius: 0.12, fill: { color: "FFFFFF" }, line: { color: R.N, width: 3 }, shadow: shadow() });
  text(s, "0.73…", { x: 5.7, y: 2.2, w: 2.4, h: 1.0, fontFace: MONO, fontSize: 30, bold: true, align: "center", valign: "middle" });
  text(s, "📦 箱の名前： r", { x: 5.4, y: 4.05, w: 3.0, h: 0.5, fontSize: 18, bold: true, align: "center" });
  codeBlock(s, "r = random.random()\nprint(r)", 8.9, 2.0, 3.8, 1.3, 18);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 5.1, w: 12.1, h: 1.4, rectRadius: 0.12, fill: { color: TINT } });
  text(s, [
    { text: "=  は「等しい」じゃない！", options: { bold: true, fontSize: 20, breakLine: true } },
    { text: "右の値を、左の箱に入れる という意味", options: { fontSize: 16, color: MUTED } },
  ], { x: 0.9, y: 5.2, w: 11.5, h: 1.2, valign: "middle", paraSpaceAfter: 4 });
});

S("STEP1", `ノートブックのステップ1のセルを見てね。print の中の、アンダーバー3つのところを r に書きかえて、実行しよう。0.73…みたいな小数が出てきたら成功！ 何回か実行してみて。毎回ちがう数が出てくるよね。これが乱数。ガチャの「運」の正体は、この数なんだ。`,
(s) => {
  stepBadge(s, 1); title(s, "やってみよう", 2.45); pauseBadge(s);
  codeBlock(s, `# 🎲 Step1：乱数を変数 r に入れる
r = random.random()   # 0〜1のランダムな小数

print(___)            # ✏️ ___ を r に`, 0.6, 1.5, 6.9, 2.1, 17);
  okBox(s, "0.7318204519380561\n（毎回ちがう数になる）", 0.6, 3.9, 6.9, 1.5);
  text(s, "💡 何回か ▶ を押してみよう。これがガチャの「運」の正体！", { x: 0.6, y: 5.7, w: 6.9, h: 0.8, fontSize: 16, color: MUTED });
  shot(s, "SS-08", "Step1 を実行した直後（小数が出ている）", 7.9, 1.5, 4.8, 3.6);
});

// ---------- STEP2 ----------
S("STEP2", `ステップ2は「if」。if は「もし〜なら、これをやる」という分かれ道。今回は、「もし r が 0.6 以下なら、ノーマルと表示する」。r は0から1までの数だから、0.6以下になるのは、だいたい60パーセント。つまり、これで「ノーマルが60パーセントで出る」しくみができるんだ。`,
(s) => {
  stepBadge(s, 2); title(s, "if ― 「もし〜なら」の分かれ道", 2.45);
  s.addShape(pres.shapes.DIAMOND, { x: 1.0, y: 2.0, w: 3.4, h: 2.2, fill: { color: R.N }, shadow: shadow() });
  text(s, "r <= 0.6 ?", { x: 1.0, y: 2.0, w: 3.4, h: 2.2, fontFace: MONO, fontSize: 22, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
  arrow(s, 4.6, 2.35, 1.2, "2E9E55");
  text(s, "はい", { x: 4.6, y: 1.85, w: 1.2, h: 0.4, fontSize: 15, bold: true, color: "2E9E55", align: "center" });
  rarityCard(s, 6.0, 2.05, 2.8, 1.0, "ノーマル", "⚪", "9E9E9E");
  arrow(s, 4.6, 3.55, 1.2, "C9C6E0");
  text(s, "いいえ", { x: 4.6, y: 4.05, w: 1.2, h: 0.4, fontSize: 15, bold: true, color: MUTED, align: "center" });
  text(s, "（何もしない）", { x: 6.0, y: 3.4, w: 2.8, h: 0.8, fontSize: 18, color: MUTED, align: "center", valign: "middle" });
  codeBlock(s, "if r <= 0.6:\n    print('⚪ ノーマル')", 9.2, 2.2, 3.5, 1.3, 17);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 5.0, w: 12.1, h: 1.5, rectRadius: 0.12, fill: { color: TINT } });
  text(s, [
    { text: "r が 0.6 以下になるのは約 60%", options: { bold: true, fontSize: 20, breakLine: true } },
    { text: "→ これで「ノーマルが60%で出る」しくみになる！", options: { fontSize: 16, color: MUTED } },
  ], { x: 0.9, y: 5.1, w: 11.5, h: 1.3, valign: "middle", paraSpaceAfter: 4 });
});

S("STEP2", `Step1のコードの下に、if文を追加するよ。アンダーバーのところに 0.6 を入れて実行。r が0.6以下のときは「ノーマル」と出る。0.6より大きいときは何も出ないけど、それで正解だよ。if の行の最後のコロンと、次の行の先頭の字下げを忘れないでね。Colabは、コロンのあとで改行すると、自動で字下げしてくれるよ。`,
(s) => {
  stepBadge(s, 2); title(s, "やってみよう", 2.45); pauseBadge(s);
  codeBlock(s, `r = random.random()   # Step1と同じ
print(r)              # Step1と同じ

# ↓ここを追加（if文）
if r <= ___:          # ✏️ 0.6 を入れる
    print('⚪ ノーマル')`, 0.6, 1.5, 6.9, 2.75, 17);
  okBox(s, "0.2841739920114773\n⚪ ノーマル\n（0.6より大きいときは何も出ない＝正解）", 0.6, 4.5, 6.9, 1.9);
  shot(s, "SS-09", "Step2 を実行（「ノーマル」が出たとき）", 7.9, 1.5, 4.8, 3.6);
  text(s, "⚠️ 行末の :（コロン）と\n次の行の字下げを忘れずに", { x: 7.9, y: 5.3, w: 4.8, h: 1.0, fontSize: 16, color: PINK, bold: true });
});

// ---------- STEP3 ----------
S("STEP3", `ステップ3は、レア度を4段階にする。使うのは elif と else。elif は「そうじゃなくて、もし〜なら」、else は「それ以外ぜんぶ」。0から1までの数直線を、0.6、0.85、0.97 で区切ると、ノーマル60パーセント、レア25パーセント、スーパーレア12パーセント、ウルトラレア3パーセントになる。ここの数字は仮の値だから、あとで自由に変えられるよ。`,
(s) => {
  stepBadge(s, 3); title(s, "elif / else ― レア度を4段階に", 2.45);
  const segs = [["ノーマル", 0.6, "9E9E9E", "FFFFFF", "60%"], ["レア", 0.25, "4A90D9", "FFFFFF", "25%"], ["SR", 0.12, "9966CC", "FFFFFF", "12%"], ["UR", 0.03, "FFD700", INK, "3%"]];
  const X0 = 0.6, W = 12.1;
  let acc = 0;
  segs.forEach(([l, p, c, t, pct]) => {
    const x = X0 + acc * W, w = p * W;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.9, w, h: 1.1, fill: { color: c }, line: { color: "FFFFFF", width: 2 } });
    if (p >= 0.1) text(s, `${l}\n${pct}`, { x, y: 1.9, w, h: 1.1, fontSize: 18, bold: true, color: t, align: "center", valign: "middle" });
    acc += p;
  });
  text(s, "UR 3%", { x: X0 + W - 1.2, y: 1.4, w: 1.2, h: 0.4, fontSize: 14, bold: true, align: "right" });
  [[0, "0"], [0.6, "0.6"], [0.85, "0.85"], [0.97, "0.97"], [1, "1"]].forEach(([v, l]) => {
    const align = v === 0 ? "left" : v === 0.97 ? "right" : v === 1 ? "right" : "center";
    const x = v === 0 ? X0 : v === 1 ? X0 + W - 1 : v === 0.97 ? X0 + v * W - 1.1 : X0 + v * W - 0.5;
    text(s, l, { x, y: 3.05, w: 1, h: 0.4, fontFace: MONO, fontSize: 15, bold: true, align });
  });
  const rows = [["if r <= 0.6", "⚪ ノーマル"], ["elif r <= 0.85", "🔵 レア"], ["elif r <= 0.97", "🟣 スーパーレア"], ["else", "⭐ ウルトラレア"]];
  rows.forEach(([c, l], i) => {
    const y = 3.8 + i * 0.6;
    text(s, c, { x: 0.6, y, w: 3.2, h: 0.5, fontFace: MONO, fontSize: 18, bold: true, color: R.R, valign: "middle" });
    text(s, `→ ${l}`, { x: 3.9, y, w: 3.2, h: 0.5, fontSize: 18, valign: "middle" });
  });
  infoCard(s, 7.6, 3.75, 5.1, 2.6, "💡", "数字は仮の値", "0.6 / 0.85 / 0.97 は\nStep8 で自由に変えられるよ", R.R);
});

S("STEP3", `空欄は2か所。1つめはスーパーレアの境目、0.97。2つめは「それ以外ぜんぶ」だから else。else のあとにもコロンを忘れずに。実行して、何が出たかチェックしよう。ウルトラレアは3パーセントだから、なかなか出ないよ。出るまで連打してみよう！`,
(s) => {
  stepBadge(s, 3); title(s, "やってみよう", 2.45); pauseBadge(s);
  codeBlock(s, `r = random.random()
print(r)

if r <= 0.6:
    print('⚪ ノーマル')
# ↓ここから追加（elif と else）
elif r <= 0.85:
    print('🔵 レア')
elif r <= ___:        # ✏️ 0.97
    print('🟣 スーパーレア')
___:                  # ✏️ else
    print('⭐ ウルトラレア')`, 0.6, 1.5, 6.9, 4.55, 16);
  okBox(s, "0.9812276130449172\n⭐ ウルトラレア", 7.9, 5.1, 4.8, 1.35, 13);
  shot(s, "SS-10", "Step3 を実行（ウルトラレアが出た瞬間がベスト）", 7.9, 1.5, 4.8, 3.4);
  text(s, "⭐ は 3%。出るまで連打！", { x: 0.6, y: 6.25, w: 6.9, h: 0.45, fontSize: 16, color: MUTED });
});

// ---------- STEP4 ----------
S("STEP4", `ステップ4は「for」。いちいち実行ボタンを押すのは大変だよね。for を使うと、同じことをくりかえしてくれる。for i in range(5) と書くと、その下の字下げされた部分が5回くりかえされるよ。`,
(s) => {
  stepBadge(s, 4); title(s, "for ― 同じことをくりかえす", 2.45);
  codeBlock(s, "for i in range(5):\n    （ここが 5回 くりかえされる）", 0.6, 1.7, 6.2, 1.4, 18);
  s.addShape(pres.shapes.BLOCK_ARC, { x: 7.6, y: 1.5, w: 2.2, h: 2.2, fill: { color: R.R }, angleRange: [30, 330], arcThicknessRatio: 0.28 });
  text(s, "🔁", { x: 7.6, y: 1.5, w: 2.2, h: 2.2, fontSize: 40, align: "center", valign: "middle" });
  text(s, "5回", { x: 10.1, y: 2.1, w: 2.6, h: 1.0, fontSize: 40, bold: true, color: R.R, valign: "middle" });
  for (let i = 0; i < 5; i++) {
    const x = 0.6 + i * 2.48;
    rarityCard(s, x, 4.2, 2.2, 0.9, ["ノーマル", "ノーマル", "レア", "ノーマル", "SR"][i], ["⚪", "⚪", "🔵", "⚪", "🟣"][i], ["9E9E9E", "9E9E9E", "4A90D9", "9E9E9E", "9966CC"][i], "FFFFFF", 17);
    text(s, `${i + 1}回目`, { x, y: 5.2, w: 2.2, h: 0.4, fontSize: 14, color: MUTED, align: "center" });
  }
  text(s, "字下げ（行頭のスペース4つ）した部分が、くりかえしの中身になる", { x: 0.6, y: 6.0, w: 12.1, h: 0.5, fontSize: 16, color: MUTED });
});

S("STEP4", `ノートブックでは、Step3の中身がもう字下げしてあるよ。いちばん上の行の空欄に for と書くだけでOK。実行すると、5行出てくるはず。range の中の 5 を 10 に変えると…10連ガチャになるね。`,
(s) => {
  stepBadge(s, 4); title(s, "やってみよう", 2.45); pauseBadge(s);
  codeBlock(s, `# ↓ここを追加（for文）
___ i in range(5):       # ✏️ for
    r = random.random()  # ← 字下げ済み
    if r <= 0.6:
        print('⚪ ノーマル')
    elif r <= 0.85:
        print('🔵 レア')
    elif r <= 0.97:
        print('🟣 スーパーレア')
    else:
        print('⭐ ウルトラレア')`, 0.6, 1.5, 6.9, 4.3, 16);
  okBox(s, "⚪ ノーマル\n⚪ ノーマル\n🔵 レア\n⚪ ノーマル\n🟣 スーパーレア", 7.9, 1.5, 4.8, 2.3, 12);
  shot(s, "SS-11", "Step4 を実行（5行出ている）", 8.4, 3.95, 3.8, 2.85);
  text(s, "中身はもう字下げしてあるよ。1行目だけ書けばOK！\n💡 5 を 10 に変えると…？", { x: 0.6, y: 5.95, w: 6.9, h: 0.85, fontSize: 16, color: MUTED });
});

// ---------- STEP5 ----------
S("STEP5", `ステップ5は「リスト」。print は表示したらそれっきり。あとでまとめて使うために、結果をためておこう。results イコール 空の角かっこ で、からっぽのリストを用意。results.append で、リストの最後に1つずつ追加していく。箱がつながった列車に、1両ずつ荷物を積んでいくイメージだよ。`,
(s) => {
  stepBadge(s, 5); title(s, "リスト ― 結果をためておこう", 2.45);
  infoCard(s, 0.6, 1.6, 5.9, 1.9, "📦", "results = []", "からっぽのリストを用意する", R.SR);
  infoCard(s, 6.8, 1.6, 5.9, 1.9, "➕", "results.append(〜)", "リストのいちばん後ろに1つ追加", R.SR);
  const cars = [["ノーマル", "⚪", "9E9E9E"], ["レア", "🔵", "4A90D9"], ["ノーマル", "⚪", "9E9E9E"]];
  cars.forEach(([l, e, c], i) => rarityCard(s, 0.6 + i * 2.7, 4.2, 2.4, 1.0, l, e, c, "FFFFFF", 18));
  arrow(s, 8.8, 4.47, 0.8, R.SR);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 9.8, y: 4.2, w: 2.9, h: 1.0, rectRadius: 0.12, fill: { color: "FFFFFF" }, line: { color: R.SR, width: 2, dashType: "dash" } });
  text(s, "append で追加", { x: 9.8, y: 4.2, w: 2.9, h: 1.0, fontSize: 17, bold: true, color: R.SR, align: "center", valign: "middle" });
  text(s, "🚃 箱がつながった列車に、1両ずつ積んでいくイメージ", { x: 0.6, y: 5.6, w: 12.1, h: 0.5, fontSize: 16, color: MUTED });
});

S("STEP5", `print だったところは、もう results.append に変えてあるよ。空欄は2つ。いちばん上は、からっぽのリストだから、角かっこを開いて閉じる。いちばん下は results。最後の print は字下げしないのがポイント。字下げすると、for の中に入って5回表示されちゃうよ。角かっこの中に5個ならんでいたら成功！`,
(s) => {
  stepBadge(s, 5); title(s, "やってみよう", 2.45); pauseBadge(s);
  codeBlock(s, `results = ___            # ✏️ ↓ここを追加 []
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

print(___)               # ✏️ ↓ここを追加 results`, 0.6, 1.5, 7.3, 4.75, 15);
  okBox(s, "['⚪ ノーマル', '🔵 レア',\n '⚪ ノーマル', '⚪ ノーマル',\n '🔵 レア']", 8.2, 1.5, 4.5, 1.9, 13);
  shot(s, "SS-12", "Step5 を実行（[ ] の中に5個）", 8.2, 3.6, 4.5, 2.65);
  text(s, "⚠️ 最後の print は字下げしない！", { x: 0.6, y: 6.4, w: 7.3, h: 0.45, fontSize: 16, bold: true, color: PINK });
});

// ---------- STEP6 ----------
S("STEP6", `ステップ6は「関数」。ここまでのコードを、gacha という名前でひとまとめにするよ。関数は、材料を入れると結果が出てくる機械みたいなもの。def gacha(count) で、「gacha という機械を作る。材料は count」。return results で、「できあがったリストを外に返す」。range の中は count に変えて、何回回すかを外から決められるようにする。int は「数字として扱ってね」という意味だよ。`,
(s) => {
  stepBadge(s, 6); title(s, "関数 ― ひとまとめにして名前をつける", 2.45);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 1.9, w: 2.4, h: 1.4, rectRadius: 0.12, fill: { color: TINT } });
  text(s, "10\n（回数 count）", { x: 0.6, y: 1.9, w: 2.4, h: 1.4, fontSize: 18, bold: true, align: "center", valign: "middle" });
  arrow(s, 3.2, 2.37, 0.9, R.SR);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 4.3, y: 1.6, w: 4.0, h: 2.0, rectRadius: 0.12, fill: { color: R.SR }, shadow: shadow() });
  text(s, "🏭 gacha", { x: 4.3, y: 1.6, w: 4.0, h: 2.0, fontSize: 32, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
  arrow(s, 8.5, 2.37, 0.9, R.SR);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 9.6, y: 1.9, w: 3.1, h: 1.4, rectRadius: 0.12, fill: { color: TINT } });
  text(s, "結果のリスト\n（results）", { x: 9.6, y: 1.9, w: 3.1, h: 1.4, fontSize: 18, bold: true, align: "center", valign: "middle" });
  const items = [["def gacha(count):", "gacha という機械をつくる。材料は count"], ["return results", "できあがった results を外に返す"], ["range(int(count))", "5回固定 → count 回に。int() は「数字にしてね」"]];
  items.forEach(([c, d], i) => {
    const y = 4.1 + i * 0.8;
    text(s, c, { x: 0.6, y, w: 4.6, h: 0.6, fontFace: MONO, fontSize: 19, bold: true, color: R.SR, valign: "middle" });
    text(s, d, { x: 5.3, y, w: 7.4, h: 0.6, fontSize: 17, valign: "middle" });
  });
});

S("STEP6", `中身はもう字下げしてあるから、空欄を2つうめよう。return のあとには results。いちばん下の gacha のかっこの中には、好きな回数を入れてね。10 なら10連ガチャ。実行して、入れた数だけリストに並んでいたら成功！`,
(s) => {
  stepBadge(s, 6); title(s, "やってみよう", 2.45); pauseBadge(s);
  codeBlock(s, `# ↓ここを追加：gacha という関数を作る
def gacha(count):
    results = []
    for i in range(int(count)):  # ← 5 を変えた
        r = random.random()
        if r <= 0.6:
            results.append('⚪ ノーマル')
        # …（レア・SR・UR はStep5と同じ）…
    return ___                  # ✏️ results

# ↓ここを追加：使ってみる
print(gacha(___))               # ✏️ 回数（例：10）`, 0.6, 1.5, 7.5, 4.55, 15);
  okBox(s, "['⚪ ノーマル', '⚪ ノーマル',\n '🔵 レア', …（10個）]", 8.4, 1.5, 4.3, 1.6, 13);
  shot(s, "SS-13", "Step6 を実行（入れた数だけならぶ）", 8.4, 3.3, 4.3, 2.75);
  text(s, "中身はもう字下げしてあるよ。___ を2つうめよう", { x: 0.6, y: 6.25, w: 7.5, h: 0.45, fontSize: 16, color: MUTED });
});

// ---------- STEP7 ----------
S("STEP7", `いよいよステップ7、アプリ化だよ！ 準備セルに入っていた道具を使う。card は、名前と色と絵文字を渡すと、カードにしてくれる。gallery は、カードを並べてくれる。run_app は、関数を渡すと、入力欄とボタンがついたアプリにしてくれる。文字だったところが、色つきのカードに変身するよ。`,
(s) => {
  stepBadge(s, 7); title(s, "カードにしてアプリ化！", 2.45);
  const tools = [["🃏", "card(…)", "名前・色・絵文字を渡すと\nカードにしてくれる"], ["🖼️", "gallery(…)", "カードのリストを\nならべてくれる"], ["📱", "run_app(…)", "関数を渡すと入力欄と\nボタンつきアプリに！"]];
  tools.forEach(([ic, h, b], i) => infoCard(s, 0.6 + i * 4.1, 1.6, 3.8, 2.4, ic, h, b, "D4A800"));
  text(s, "'⚪ ノーマル'", { x: 0.6, y: 4.6, w: 3.4, h: 1.0, fontFace: MONO, fontSize: 22, bold: true, valign: "middle", align: "center" });
  arrow(s, 4.2, 4.87, 1.0, "D4A800");
  text(s, "card(…)", { x: 4.0, y: 5.4, w: 1.4, h: 0.4, fontFace: MONO, fontSize: 13, color: MUTED, align: "center" });
  rarityCard(s, 5.5, 4.6, 3.3, 1.0, "ノーマル", "⚪", "9E9E9E", "FFFFFF", 22);
  text(s, "文字が\nカードに変身！", { x: 9.2, y: 4.6, w: 3.5, h: 1.0, fontSize: 20, bold: true, valign: "middle" });
});

S("STEP7", `ノートブックでは、文字を card に変えるところまでやってあるよ。空欄は2つ。return のところは gallery。いちばん下の run_app の最初には、作った関数の名前 gacha を入れる。ここで注意！ gacha のうしろにかっこはつけないよ。関数そのものを run_app に渡すからなんだ。`,
(s) => {
  stepBadge(s, 7); title(s, "やってみよう", 2.45); pauseBadge(s);
  codeBlock(s, `def gacha(count):
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
    return ___(results)          # ✏️ gallery

# ↓ここを追加：アプリとして起動！
run_app(___, label='ガチャの回数:')   # ✏️ gacha`, 0.6, 1.5, 9.0, 5.3, 15);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 9.9, y: 1.5, w: 2.8, h: 2.6, rectRadius: 0.12, fill: { color: "FDECEF" } });
  text(s, [
    { text: "⚠️ 注意", options: { bold: true, fontSize: 18, color: PINK, breakLine: true } },
    { text: "run_app(gacha, …)", options: { fontFace: MONO, fontSize: 13, bold: true, breakLine: true } },
    { text: "gacha のうしろに ( ) はつけない！", options: { fontSize: 15 } },
  ], { x: 10.1, y: 1.65, w: 2.4, h: 2.3, valign: "top", paraSpaceAfter: 8 });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 9.9, y: 4.4, w: 2.8, h: 2.4, rectRadius: 0.12, fill: { color: TINT } });
  text(s, "card への\n書きかえは\nもうやってあるよ\n\n___ を2つ\nうめよう", { x: 10.1, y: 4.55, w: 2.4, h: 2.1, fontSize: 15, valign: "middle" });
});

S("STEP7", `実行すると、「ガチャの回数」の入力欄と「実行」ボタンが出てくる。入力欄に 10 と入れて、「実行」をタップ！ 色つきのカードがずらっと並んだら…完成！ おめでとう！ もう一度「実行」を押すと、引き直しができるよ。`,
(s) => {
  stepBadge(s, 7); title(s, "🎉 完成！ ガチャを回そう", 2.45); pauseBadge(s);
  shot(s, "SS-14", "入力欄と「実行」ボタンが出た画面（10 を入力済み）", 0.6, 1.5, 4.8, 3.6);
  arrow(s, 5.6, 3.1, 0.7, "D4A800");
  shot(s, "SS-15", "カードがならんだ画面（完成！）", 6.5, 1.5, 6.2, 4.65);
  text(s, [
    { text: "① 回数を入れる　② 「実行」をタップ", options: { fontSize: 18, bold: true, breakLine: true } },
    { text: "もう一度押すと引き直し！", options: { fontSize: 16, color: MUTED } },
  ], { x: 0.6, y: 5.35, w: 5.6, h: 1.0, valign: "top", paraSpaceAfter: 4 });
});

// ---------- STEP8 ----------
S("STEP8", `ステップ8はアレンジタイム！ ノートブックの星マークのところを自由に書きかえよう。しきい値の数字を変えると、出やすさが変わる。名前を「おにぎり」や「伝説の勇者」にしてもいいし、色や絵文字を変えてもいい。色は、画面の色見本のコードを使ってね。ひとつだけルール。しきい値は小さい順に並べること。順番がバラバラだと、出ないレア度ができちゃうよ。`,
(s) => {
  stepBadge(s, 8); title(s, "アレンジタイム！", 2.45); pauseBadge(s);
  const rows = [["★ しきい値", "0.6 → 0.3", "ノーマルが出にくくなる"], ["★ 名前", "'ノーマル' → 'おにぎり'", "好きな名前に"], ["★ 色", "'#9E9E9E' → '#E53935'", "右の色見本から"], ["★ 絵文字", "'⚪' → '🍙'", "好きな絵文字に"]];
  rows.forEach(([a, b, c], i) => {
    const y = 1.6 + i * 1.0;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y, w: 7.0, h: 0.85, rectRadius: 0.1, fill: { color: i % 2 ? "FFFFFF" : TINT } });
    text(s, a, { x: 0.8, y, w: 1.7, h: 0.85, fontSize: 17, bold: true, color: "B08A00", valign: "middle" });
    text(s, b, { x: 2.5, y, w: 3.0, h: 0.85, fontFace: MONO, fontSize: 14, valign: "middle" });
    text(s, c, { x: 5.6, y, w: 1.9, h: 0.85, fontSize: 14, color: MUTED, valign: "middle" });
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 5.75, w: 7.0, h: 1.05, rectRadius: 0.1, fill: { color: "FDECEF" } });
  text(s, "⚠️ しきい値は小さい順に（例：0.5 → 0.8 → 0.95）", { x: 0.8, y: 5.75, w: 6.6, h: 1.05, fontSize: 16, bold: true, color: PINK, valign: "middle" });
  text(s, "🎨 色見本", { x: 8.0, y: 1.6, w: 4.7, h: 0.5, fontSize: 18, bold: true });
  const pal = [["赤", "E53935"], ["オレンジ", "FB8C00"], ["黄", "FDD835"], ["緑", "43A047"], ["青", "1E88E5"], ["むらさき", "8E24AA"], ["ピンク", "EC407A"], ["黒", "212121"]];
  pal.forEach(([n, c], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 8.0 + col * 2.4, y = 2.25 + row * 1.12;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 2.2, h: 0.95, rectRadius: 0.1, fill: { color: c } });
    text(s, `${n}\n#${c}`, { x, y, w: 2.2, h: 0.95, fontSize: 13, bold: true, color: c === "FDD835" ? INK : "FFFFFF", align: "center", valign: "middle", fontFace: MONO });
  });
});

S("STEP8", `たとえばこんな感じ。自分だけのガチャができたら、となりの人と見せ合いっこしよう。早く終わった人は、elif をもう1つ増やして、5段階のガチャにチャレンジしてみてね。`,
(s) => {
  stepBadge(s, 8); title(s, "こんなガチャもできる！", 2.45);
  shot(s, "SS-16", "アレンジ例（名前・色・絵文字を変えたガチャの実行画面）", 0.6, 1.5, 6.4, 4.8);
  infoCard(s, 7.4, 1.5, 5.3, 2.2, "🙌", "見せ合いっこ", "できたら、となりの人と\nガチャを回し合おう", "D4A800");
  infoCard(s, 7.4, 4.0, 5.3, 2.3, "🚀", "チャレンジ", "elif をもう1つ増やして\n5段階ガチャにしてみよう", "D4A800");
});

// ---------- まとめ ----------
S("まとめ", `今日のまとめ。乱数を入れた r は変数。レア度を分けたのは、if、elif、else の分岐。回数ぶん回したのは for の反復。結果をためたのがリスト、ぜんぶをまとめたのが関数。プログラムは、上から順に進む「順次」、「分岐」、「反復」の組み合わせでできている。今日のガチャには、その3つがぜんぶ入っていたんだ。最後にふりかえり。「ウルトラレアの確率を1パーセントにするには、どこをどう変える？」 ノートブックのいちばん下に、自分の言葉で書いてみよう。おつかれさま！`,
(s) => {
  s.background = { color: NAVY };
  text(s, "🏁 まとめ", { x: 0.6, y: 0.4, w: 12, h: 0.8, fontSize: 32, bold: true, color: "FFFFFF" });
  const three = [["⬇️", "順次", "上から順に実行"], ["🔀", "分岐", "if / elif / else\nでレア度を分けた"], ["🔁", "反復", "for で\n回数ぶん回した"]];
  three.forEach(([ic, h, b], i) => {
    const x = 0.6 + i * 4.1;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.5, w: 3.8, h: 2.3, rectRadius: 0.12, fill: { color: "2E2B63" } });
    text(s, `${ic} ${h}`, { x: x + 0.3, y: 1.7, w: 3.2, h: 0.7, fontSize: 26, bold: true, color: "FFD700" });
    text(s, b, { x: x + 0.3, y: 2.5, w: 3.2, h: 1.1, fontSize: 17, color: "FFFFFF" });
  });
  text(s, "🎲 変数　📦 リスト　🧰 関数　も使いこなせた！", { x: 0.6, y: 4.1, w: 12.1, h: 0.5, fontSize: 20, color: "CFCBF5" });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 5.0, w: 12.1, h: 1.6, rectRadius: 0.12, fill: { color: "FFFFFF" } });
  text(s, [
    { text: "✍️ ふりかえり", options: { bold: true, fontSize: 18, color: R.SR, breakLine: true } },
    { text: "ウルトラレアの確率を 1% にするには、どこをどう変える？", options: { fontSize: 22, bold: true } },
  ], { x: 0.9, y: 5.1, w: 11.5, h: 1.4, valign: "middle", paraSpaceAfter: 6 });
});

// ---------- 出力 ----------
slides.forEach((d, i) => {
  curSlide = i + 1;
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  d.build(s);
  s.addNotes(d.notes);
});

// video_script.md を同じデータから生成（口調・内容をスライドと完全一致させる）
const sec = (t) => Math.round(t.replace(/\s/g, "").length / 5) + 3; // 約300字/分＋間
const workMin = { STEP1: 1.5, STEP2: 2, STEP3: 3, STEP4: 2, STEP5: 2.5, STEP6: 3, STEP7: 3, STEP8: 4 };
let md = `# 🎬 授業動画 ナレーション原稿「ガチャを作ろう！」

- 対象：高校1年 情報Ⅰ（第3章）／10クラス共通
- 対応ファイル：\`lesson_video.pptx\`（各スライドのノートにこの原稿と同じ文を入れてあります）、\`lesson.ipynb\`
- 口調：生徒に話しかける常体（「〜だよ」「〜しよう」）で統一。
- 動画尺の目安：約300字/分で計算。⏸ のスライドでは生徒が一時停止して作業する（作業時間は動画尺に含まない）。
- 録画のしかた：PowerPoint「スライドショー → 録画」でノートを見ながら読み上げ → 「ファイル → エクスポート → ビデオの作成」。

`;
let current = "", total = 0;
slides.forEach((d, i) => {
  if (d.section !== current) {
    current = d.section;
    const w = workMin[current];
    md += `\n---\n\n## ${current}${w ? `（生徒の作業時間の目安：${w}分）` : ""}\n\n`;
  }
  const t = sec(d.notes); total += t;
  md += `### スライド${i + 1}${d.pause ? "　⏸ 一時停止ポイント" : ""}　（動画 約${t}秒）\n\n${d.notes}\n\n`;
});
md += `\n---\n\n## 動画の合計尺（目安）\n\n約${Math.round(total / 60)}分${total % 60}秒（ナレーションのみ。⏸ での作業時間は含まない）\n\n`;
md += `## 📷 スクショ撮影リスト\n\n撮影はiPad（生徒と同じ環境）推奨。スライド上の破線の枠は 4:3（iPad横向き）の比率。\n\n| ID | 撮るもの | スライド |\n|---|---|---|\n`;
shotList.slice().sort((a, b) => a.id.localeCompare(b.id)).forEach((sh) => {
  md += `| ${sh.id} | ${sh.desc} | ${sh.slide} |\n`;
});
fs.writeFileSync(`${OUT_DIR}/video_script.md`, md);

pres.writeFile({ fileName: `${OUT_DIR}/lesson_video.pptx` }).then(() => {
  console.log("done", slides.length, "slides,", total, "sec");
});
