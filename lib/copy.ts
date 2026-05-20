/** アプリ全体のトーン: 実用（献立・検索）と愛着（思い出の蓄積）の両立 */

export const COPY = {
  philosophy:
    "レシピを探すだけのアプリではなく、食卓の思い出が少しずつ積み重なる、うちの台所の記録帳です。",

  home: {
    welcomeTitle: "うちの食卓の記録",
    welcomeBody:
      "今日作った一皿も、家族が残したレシピも、あとから振り返れる宝物になります。便利さと、なつかしさの両方を大切に。",
    searchLabel: "うちのレシピを探す",
    searchPlaceholder: "料理名・材料・思い出のメモで検索",
    categoryLabel: "今日の献立から選ぶ",
    staleTitle: "久しぶりの味",
    staleHint: "1ヶ月以上作っていない料理。思い出をたどって、また食卓に戻しませんか。",
    calendarTitle: "食卓のカレンダー",
    calendarHint: "いつ・誰が・何を作ったか。家族の時間がここに残ります。",
    eventsTitle: "もうすぐのしるし",
    eventsHint: "誕生日や記念日など、これから迎える家族の日。",
    newTitle: "家族から届いた新しい味",
    newHint: "ほかの家族が追加したレシピ。うちのレシピ帳がまたひとつふくらみます。",
    requestsTitle: "作ってほしい、という声",
    requestsHint: "「これ食べたい」は、家族へのやさしいリクエスト。",
    listTitle: "うちのレシピ棚",
    listHint: "いつでも使える実用の棚。思い出も一緒に並んでいます。",
  },

  recipe: {
    memoryNoteLabel: "思い出メモ",
    memoryNoteHint: "誰の味だったか、食卓のエピソードなど",
    memoryNotePlaceholder: "例: おじいちゃんがよく作ってくれた味。子どもの頃の夕食の香り。",
    cookButton: "今日の思い出に残す",
    cookDone: "今日の食卓に、ひとつ思い出が増えました。",
    lastCooked: (date: string) => `前回つくったのは ${date}`,
    neverCooked: "まだ食卓の記録がありません。作ったら残してみましょう。",
    cookCount: (n: number) => `これまでに ${n} 回、食卓に並びました`,
    photoLabel: "写真",
    photoHint: "完成した料理や、思い出の食卓の一枚を残せます。",
  },

  family: {
    subtitle: (name: string) => `${name} の、共有の思い出帳`,
    noFamily: "家族をつくると、レシピも思い出もみんなで育っていきます。",
    noAccountNote:
      "メールやパスワードは不要です。名前だけ入れれば、同じレシピ帳を見られます。",
    inviteWelcome:
      "このレシピ帳は家族で共有されています。名前を入れて参加してください。",
    inviteLinkHint: "このリンクを送るだけで参加できます（コードの入力は不要です）。",
    codeHint: "コードを入力すると /join/コード の参加ページ（リンクと同じ画面）へ進みます。",
    dataSafeNote:
      "レシピの本体は Supabase（クラウド）に保存されています。アプリの URL が変わっても消えません。",
    backupHint:
      "参加リンクをメモ帳や LINE に保存しておくと、スマホを替えても同じレシピ帳に戻れます。",
    exportHint: "念のため、レシピを JSON ファイルとしてダウンロードできます。",
  },

  links: {
    title: "お気に入りリンク",
    hint: "ほかのサイトのURLを家族で共有しておけます。レシピ参考サイトや、思い出の記事など。",
    addTitle: "リンクを追加",
    listTitle: "保存したリンク",
    empty: "まだリンクがありません。気になるページを保存してみましょう。",
  },
} as const;
