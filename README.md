# Legacy League of Legends Client - Profile Viewer

![Project Preview](/public/images/league_logo.png)

A high-fidelity, interactive fan recreation of the **2016 Legacy League of Legends Client**. Built with modern web technologies, this project emulates the "classic" look and feel of the original client while integrating real-time data from the Riot Games API.

## Features

- **Authentic Login Experience**: Full video background, sound effects (unlocked on interaction), and authentic parchment-style UI.
- **Real-Time Profile Lookup**: Connects to the Riot Games API to fetch live Summoner data, levels, and profile icons.
- **Match History Viewer**: Deep integration to display recent match performance and champion statistics.
- **Classic Home Screen**: Interactive news feed, video spotlights (YouTube integration), and a dynamic Ranked Match viewer.
- **Legacy Tabs**: High-fidelity recreations of the Runes, Masteries, and Summoner Spells interfaces.
- **Customization**: Toggleable music and animations directly from the login interface.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Library**: React.js
- **Styling**: Vanilla CSS Modules
- **API**: Riot Games Developer API

## Getting Started

### Prerequisites
- Node.js 18.x or later
- A Riot Games Developer API Key (available at [Riot Developer Portal](https://developer.riotgames.com/))

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/fmniy/legacy-lol-client.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up Environment Variables:
   Create a `.env.local` file and add your API key:
   ```env
   RIOT_API_KEY=your_api_key_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Legal Disclaimer

**LEGAL JIBBER JABBER:** This project is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc. League of Legends © Riot Games, Inc.

This is a non-commercial, fan-made project created for educational and artistic purposes. No revenue is generated from this project, and it is intended as a tribute to the history of the League of Legends community.

---
