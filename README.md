[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/pourmirzai/Cheetah-Game/actions)
[![GitHub stars](https://img.shields.io/github/stars/pourmirzai/Cheetah-Game.svg)](https://github.com/pourmirzai/Cheetah-Game/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/pourmirzai/Cheetah-Game.svg)](https://github.com/pourmirzai/Cheetah-Game/network)

# 🎮 Save Cheetah Game
An interactive web game for National Cheetah Day (August 31th, 2025) to raise awareness about the conservation of the Asiatic Cheetah.
## 📖 Complete Documentation
For complete information about the project, please refer to 
**[
Documentation
](
./docs/
)**
:
### 📋 
[
Quick Start Guide
](
./docs/README.md
)
- Prerequisites and installation
- Development environment setup
- Running the game
### 🔌 
[
API Documentation
](
./docs/API.md
)
- Complete API documentation
- Usage code examples
- Security and authentication
### 🧩 
[
Component Documentation
](
./docs/COMPONENTS.md
)
- React components
- Frontend architecture
- UI/UX guidelines
### 🎯 
[
Game Mechanics
](
./docs/GAME_MECHANICS.md
)
- Game mechanics
- Characters and entities
- Scoring system
### 🚀 
[
Development Guide
](
./docs/DEVELOPMENT.md
)
- Development guide
- Testing and code quality
- Debugging and troubleshooting
### 🚀 
[
Deployment Guide
](
./docs/DEPLOYMENT.md
)
- Deployment guide
- Monitoring and maintenance
- Performance optimization
### 🔧 
[
Troubleshooting
](
./docs/TROUBLESHOOTING.md
)
- Troubleshooting guide
- Common problems and solutions
- Debugging tools
## 🎯 Project Overview
### Game Objective
An interactive and viral game to raise awareness about the conservation of the Asiatic Cheetah using engaging and educational game mechanics.
### Game Style
- 
**
Vertical Scroller
**
 similar to River Raid
- 
**
One-finger control
**
 (touch/swipe left-right)
- **Mobile and desktop compatible**
- **Story-driven with conservation messages**

### Game Story
The player takes on the role of a mother cheetah who must raise 4 cubs to independence in 120 seconds (equivalent to 18 months), avoid obstacles, and collect resources (water/food).

## 🚀 Quick Start

```bash
# Clone the project
git clone <repository-url>
cd save-cheetah

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit DATABASE_URL in .env file

# Run the server
npm run dev
```

## 🎮 Access the Game
After starting the server, the game is accessible at:
```
http://localhost:3000
```

## 🏗️ Technical Architecture
- **Frontend:** React 18, TypeScript, Phaser.js, Material Design
- **Backend:** Node.js, Express.js, PostgreSQL
- **Database:** Neon PostgreSQL
- **ORM:** Drizzle ORM
- **Build Tool:** Vite
- **Deployment:** Liara Cloud

## 🔄 Future Improvements

### Localization & Internationalization
- **Persian Game Script:** The current game content and UI text is in Persian. For international audiences, consider adding:
  - English localization
  - Multi-language support
  - RTL (Right-to-Left) layout support for Persian text

### Persian Numbers
- **Number Formatting:** Some numbers in the game may display in Persian format (٠-٩). Consider standardizing to Western Arabic numerals (0-9) for better international compatibility.

### Character Design
- **Higher Quality Assets:** The current game characters (mother cheetah, cubs, obstacles, resources) could be enhanced with:
  - Higher resolution sprites
  - More detailed animations
  - Additional character variations
  - Improved visual effects

### Game Features
- **Language Selection:** Add a language toggle in the main menu
- **Accessibility:** Improve screen reader support and keyboard navigation
- **Performance:** Optimize for lower-end devices
- **Analytics:** Enhanced tracking for user engagement metrics

## 📞 Contact
For questions and suggestions:
- **Email:** [info@sarvinwildlife.com]
- **Site:** [https://sarvinwildlife.com/en]

Developed with ❤️ for the conservation of the Asiatic Cheetah
