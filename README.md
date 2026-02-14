# 🚦 GREEN WAVE HUD
### Cyberpunk Traffic Light Predictor for Cyclists

## ![Project Banner](public/banner-placeholder.png)
## > *Note: Place a screenshot of your dashboard here named `banner-placeholder.png` in the `public` folder.*

---

## ⚡ Overview
**Green Wave HUD** is a high-performance, real-time cycling assistant web application. It uses a predictive algorithm to synchronize with traffic light cycles, telling cyclists exactly when to launch to hit the "Green Wave" — a continuous flow of green lights.

Built with a **Cyberpunk / Sci-Fi aesthetic**, the interface is designed for immediate readability at high speeds, using high-contrast colors, strict monospaced typography, and neon visual cues.

---

## 🚀 Key Features

### 🟢 Real-Time Prediction Engine
-   **Precision Algorithms**: Calculates the exact phase of the traffic light cycle based on user customization.
-   **Launch/Hold Decision**: Instantly advises the cyclist to `LAUNCH`, `HOLD`, or proceed with `CAUTION`.
-   **Countdown Timer**: Millisecond-accurate countdown to the next green phase.

### ⚙️ Engine Room (Customization)
-   **Full Cycle Control**: Adjust descent time, green light duration, and full cycle length.
-   **Sync Protocol**: One-tap synchronization with the traffic light's start time.
-   **Persistence**: Settings are saved locally on the device (LocalStorage) for instant startup on the next ride.

### 🎨 AAA Visual Design
-   **Cyberpunk Aesthetic**: Pure black background (`#000`), Neon Cyan/Red/Green palette.
-   **Responsive HUD**: Optimized for mobile viewports (pockets/handlebars) but fully functional on desktop.
-   **Visual Feedback**: Interactive elements with haptic-style visual responses (glows, scale animations).

---

## 🛠️ Tech Stack

-   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS v4 + CSS Variables
-   **State Management**: Zustand (w/ Persistence Middleware)
-   **Animation**: Framer Motion
-   **Deployment**: Vercel

---

## 📱 Screenshots

##| Cockpit View | Settings Panel | Mobile View |
##|:---:|:---:|:---:|
##| ![Cockpit](public/screen-cockpit.png) | ![Settings](public/screen-settings.png) | ![Mobile](public/screen-mobile.png) |

##> *To update screenshots: Save images to `public/` folder with these names.*

---

## 🏁 Getting Started

### Prerequisites
-   Node.js 18+
-   npm / yarn / pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Fabinxz/green-wave-hud.git

# Navigate to project
cd green-wave-hud

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the HUD.

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

---

<center>
  <sub>Built with ⚡ speed and ☕ caffeine by Fabinxz</sub>
</center>
