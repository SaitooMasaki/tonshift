# ToneShift — Chrome Web Store Listing

---

## Extension Name
ToneShift — AI Writing Assistant

---

## Short Description (132文字以内)
Rewrite your emails, tweets, and LinkedIn posts in the perfect tone — directly in Gmail, Twitter/X, and LinkedIn. Powered by Claude AI.

> 文字数: 132文字 ✅

---

## Detailed Description

```
✨ ToneShift — AI Writing Assistant

Struggling to strike the right tone in your emails, tweets, or LinkedIn posts? ToneShift brings AI-powered writing assistance directly into your favorite platforms — no copy-pasting, no switching tabs.

── HOW IT WORKS ──

1. Start typing in Gmail, Twitter/X, or LinkedIn
2. The ToneShift button (✨) appears near your text field
3. Choose a tone: Professional, Casual, Friendly, Assertive, or Concise
4. Hit "Rewrite" — your text is instantly rewritten in the chosen tone
5. Like a suggestion? Click "Use this" to apply it

── FEATURES ──

🎯 Tone Rewriting
Rewrite any text in 5 built-in tones:
• Professional — polished and business-ready
• Casual — relaxed and conversational
• Friendly — warm and approachable
• Assertive — confident and direct
• Concise — short and to the point

💬 Reply Generator (Pro)
Replying to an email or tweet? Generate 3 ready-to-send reply options based on the message you're responding to.

🌍 Multilingual Support
ToneShift detects the language of your input and responds in the same language. Write in Japanese, Spanish, French, or any language — and get rewrites in that same language.

🔒 Privacy First
Your Anthropic API key is stored locally on your device only. ToneShift never sees your text — it goes directly from your browser to Anthropic's API.

── SUPPORTED SITES ──
• Gmail (mail.google.com)
• Twitter / X (twitter.com, x.com)
• LinkedIn (linkedin.com)

── FREE vs PRO ──

Free:
• Tone rewriting — 10 rewrites/day
• 5 built-in tones
• Works on all 3 supported sites

Pro ($7/month):
• Unlimited rewrites
• Reply generation (3 options per click)
• Up to 5 custom tones
• Priority support

── SETUP ──

1. Install ToneShift
2. Get a free API key at console.anthropic.com
3. Open ToneShift Settings and enter your API key
4. Start writing on Gmail, Twitter/X, or LinkedIn

── YOUR API KEY ──

ToneShift uses your own Anthropic API key, giving you full control over usage and costs. Claude Haiku (the model used) is extremely affordable — typical usage costs less than $1/month.

Questions? Contact us at m.masaki.sm@gmail.com
```

---

## Category
Productivity

## Language
English

## Pricing
Free (with optional Pro subscription via in-extension upgrade)

---

## Screenshots — 撮影すべき画面 (1280×800)

### Screenshot 1: メインUI（Xのツイート入力）
- X.com でツイート入力エリアに文章を入力
- ✨ボタンが右下に表示されている状態
- キャプション: "The ✨ button appears as you type"

### Screenshot 2: パネル展開（トーン選択）
- パネルが開いてトーン選択ドロップダウンが見える状態
- キャプション: "Choose your tone — Professional, Casual, Friendly, and more"

### Screenshot 3: リライト結果
- "Rewriting..." のローディング後、結果カードが表示された状態
- "Use this ↗" ボタンが見える
- キャプション: "One click to apply the rewritten text"

### Screenshot 4: Gmail対応
- Gmail の返信欄でパネルが開いている状態
- キャプション: "Works in Gmail too"

### Screenshot 5: Settings画面
- Options page でAPIキーが設定済みの状態
- キャプション: "Your API key stays on your device — never on our servers"

---

## Promotional Tile (440×280) — テキスト案
```
✨ ToneShift
AI Writing Assistant

Professional · Casual · Friendly
Gmail · Twitter/X · LinkedIn
```

---

## Privacy Policy URL
https://saitoomasaki.github.io/tonshift/privacy-policy.html

---

## Single Purpose Description（審査用）
ToneShift rewrites text in user-specified tones (Professional, Casual, Friendly, etc.) within Gmail, Twitter/X, and LinkedIn using the Anthropic Claude API.

---

## Permission Justifications（審査で求められる場合）

| Permission | Justification |
|---|---|
| `activeTab` | Required to detect text input fields and inject the writing assistant UI on the active tab |
| `storage` | Required to save the user's API key and preferences locally on their device |
| `scripting` | Required to inject the floating UI into Gmail, Twitter/X, and LinkedIn |
| `host_permissions: mail.google.com, linkedin.com, twitter.com, x.com` | The extension is designed to work specifically on these email and social platforms |
| `host_permissions: api.anthropic.com` | Required to make direct API calls to Anthropic from the browser for text rewriting |
| `host_permissions: extensionpay.com` | Required for Pro subscription management via ExtensionPay |
