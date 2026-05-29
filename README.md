# libre•

> Stop smoking, start living.

Libre is a quit-smoking companion app that turns every smoke-free minute into a concrete victory — tracking time, money saved, health recovery, and personal cravings journal.

---

## Screenshots

| Welcome | Home | Health | Achievements |
|---|---|---|---|
| ![Welcome](./docs/screenshots/welcome.png) | ![Home](./docs/screenshots/home.png) | ![Health](./docs/screenshots/health.png) | ![Achievements](./docs/screenshots/achievements.png) |

---

## Stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) SDK 56 + [Expo Router](https://expo.github.io/router) v3 |
| Language | TypeScript |
| UI | React Native + [react-native-svg](https://github.com/software-mansion/react-native-svg) |
| Animations | React Native Animated + [Reanimated](https://docs.swmansion.com/react-native-reanimated/) v4 |
| State | [Zustand](https://zustand-demo.pmnd.rs/) + AsyncStorage (persisted) |
| i18n | [i18next](https://www.i18next.com/) + react-i18next (PT 🇧🇷 / EN 🇺🇸) |
| Notifications | expo-notifications |
| Build & Deploy | [EAS Build](https://docs.expo.dev/build/introduction/) + EAS Submit |

---

## Features

- **⏱ Real-time counter** — tracks time smoke-free down to the minute, with hours display in the first 24h
- **💰 Money saved** — calculates savings based on personal cigarette cost and daily usage
- **🫁 Health milestones** — 19 science-backed recovery stages from 20 minutes to 20 years (ACS · NHS · ASH)
- **🏆 Achievements** — 37 unlockable badges across time, savings, cigarettes avoided and journal resistance
- **📓 Cravings journal** — log every craving with trigger, location, mood and whether you resisted
- **📊 Stats** — cigarettes avoided, money saved, avoidance rate, relapse tracking
- **🆘 SOS button** — instant craving support always accessible from the home screen
- **🌍 Bilingual** — Portuguese and English with automatic device detection and manual toggle
- **🌙 Dark theme** — fully dark UI optimized for OLED screens
