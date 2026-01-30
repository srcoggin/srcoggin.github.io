# The Expert Football - TypeScript/Next.js

A fantasy football analytics platform built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Home Page**: Landing page with news, updates, and system status
- **Fantasy Football Hub**: Main analytics dashboard with three tabs:
  - **Fantasy Home**: Season overview with top player stats
  - **Fantasy Radar**: Boom/Bust analysis to identify high-ceiling and high-floor players
  - **Deep Dive Tool**: Detailed player analysis with charts, matchup efficiency, and box scores

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **State Management**: React Context (Theme)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
website-ts/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Home page
│   │   ├── fantasy-football/  # Fantasy Football page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── tabs/              # Tab content components
│   │   │   ├── FantasyHome.tsx
│   │   │   ├── FantasyRadar.tsx
│   │   │   └── DeepDive.tsx
│   │   ├── DataTable.tsx
│   │   ├── PlayerChart.tsx
│   │   ├── Sidebar.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── ...
│   ├── contexts/              # React contexts
│   │   └── ThemeContext.tsx
│   ├── types/                 # TypeScript types
│   │   └── index.ts
│   └── utils/                 # Utility functions
│       ├── dataLoader.ts
│       └── calculations.ts
├── public/
│   ├── json_data/             # NFL stats data (2019-2025)
│   ├── headshots/             # Player headshot images
│   └── Logo.png               # Site logo
├── tailwind.config.ts
├── package.json
└── tsconfig.json
```

## Data Files

- `stats_YYYY.json`: Weekly player statistics for each NFL season
- `player_profiles_2025.json`: AI-generated player profiles for 2025 season
- Headshots: Player images named as `First_Last_POS.png`

## Features Parity with Streamlit Version

This TypeScript version replicates the original Streamlit Python application with:

- ✅ Dark/Light theme toggle
- ✅ Multi-season support (2019-2025)
- ✅ Position filtering
- ✅ Player search with sorting options
- ✅ Boom/Bust analysis with gradient-colored tables
- ✅ Player profiles with headshots
- ✅ Interactive scatter charts
- ✅ Matchup efficiency tables with defense rankings
- ✅ Smart box score tables with conditional cell highlighting
- ✅ Responsive layout
