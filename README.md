# PokerTool 🂡

AI-powered poker assistant for ClubGG. Uses a floating overlay button to capture the table, sends the screenshot to GPT-4o Vision for analysis, and displays real-time hand advice.

## Features

- **Floating overlay button** — works on top of ClubGG, draggable to any position
- **Screenshot analysis** — captures the table via MediaProjection API
- **AI-powered** — GPT-4o Vision reads cards, pot, stacks, blinds, position
- **Instant advice** — FOLD / CALL / RAISE recommendation with reasoning
- **Multi-language** — reads ClubGG in Ukrainian, Russian, English, etc.
- **Configurable** — choose play style (Tight / Balanced / Aggressive) and AI model
- **Offline preflop chart** — built-in fallback for basic preflop decisions

## Setup

1. Download the APK from [GitHub Actions](../../actions) → latest build → Artifacts → `PokerTool-debug`
2. Install on your Android device (enable "Install from unknown sources")
3. Open PokerTool and go to **Settings**
4. Enter your **OpenAI API key** (get one at [platform.openai.com/api-keys](https://platform.openai.com/api-keys))
5. Choose your play style and AI model
6. Tap **START** → grant overlay and screen capture permissions
7. Open ClubGG and tap the floating ♠ button when you want analysis

## Requirements

- Android 8.0+ (API 26+), tested on Android 16
- OpenAI API key with GPT-4o access
- Internet connection for AI analysis

## How it works

```
Tap ♠ → Screenshot → GPT-4o Vision → Parse JSON → Show Overlay
 (0.2s)    (0.1s)      (2-4s)         (0.01s)      (instant)
```

1. Hides the floating button momentarily
2. Captures screen via MediaProjection
3. Compresses to JPEG and base64 encodes
4. Sends to OpenAI GPT-4o Vision with poker-specific prompt
5. Parses the JSON response (cards, pot, blinds, stacks, advice)
6. Shows color-coded overlay: action + confidence + reasoning

## Cost

~$0.01–0.03 per analysis (GPT-4o Vision). Playing 100 hands/day ≈ $1–3/day.

## Build

```bash
./gradlew assembleDebug
```

APK output: `app/build/outputs/apk/debug/app-debug.apk`

## Project Structure

```
app/src/main/java/com/pokertool/
├── MainActivity.kt              # Permissions flow, start/stop
├── SettingsActivity.kt          # API key, play style, model
├── service/
│   └── PokerToolService.kt      # Foreground service: overlay + capture + analyze
├── analyzer/
│   ├── VisionAnalyzer.kt        # OpenAI GPT-4o Vision API integration
│   └── PreflopChart.kt          # Offline preflop hand chart
├── model/
│   └── PokerState.kt            # Data classes
└── util/
    └── PrefsManager.kt          # SharedPreferences wrapper
```

## License

MIT
