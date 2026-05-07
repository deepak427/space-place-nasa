# NASA Space Place: The Cartoonish Cosmos 🚀

A fun-first, interactive learning platform for upper-elementary-aged kids (8-12) to explore space and Earth science through games, activities, and engaging short-form content. Designed to feel like a playful Saturday morning cartoon with a focus on discovery and enjoyment.

## 🎯 Project Mission

Enable children to master space and Earth science in a cartoonish, playful digital environment that prioritizes fun over formality. The platform combines cosmic games, hands-on labs, engaging videos, and easy-to-read articles—all wrapped in a warm, tactile design.

## ✨ Core Features

- **Cosmic Games**: Interactive learning challenges that teach space concepts through play
- **Hands-on Lab**: DIY activity guides for hands-on experimentation
- **Quick Bites**: Engaging short-form videos for bite-sized learning
- **Knowledge Capsules**: Easy-to-read articles with cartoon illustrations
- **Playful Navigation**: Cute, squishy UI with wobbly buttons and smooth interactions
- **Topic Exploration**: Browse planets, moons, Earth science, and more

## 🎨 Design Philosophy

**The North Star**: A monochromatic, warm environment that feels like hand-drawn cartoons on textured paper.

### Visual Identity
- **Color Palette**: Warm Amber Softness (monochromatic `oklch(75% 0.12 50)`)
- **Texture**: Paper-like grain effect across all surfaces for tactility
- **Shapes**: Wobbly, hand-drawn perimeters with irregular border-radius and slight rotations
- **Typography**: Large, friendly fonts (Fredoka for display, Comic Neue for body)
- **Interactions**: Snappy, spring-loaded animations with satisfying feedback

### Design Rules
1. **The Hand-Drawn Rule**: Nothing is perfectly rigid—everything has a playful wobble
2. **The Softness Rule**: Use warm monochromatic tones; avoid harsh blues and neon colors
3. **The Snappy Rule**: Fast interactions with spring-loaded overshoot for delight
4. **The Typesetting Rule**: Large font sizes (22px+) with balanced line heights for readability

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or your preferred package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/deepak427/space-place-nasa.git
cd space-place-nasa
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the local dev URL (typically `http://localhost:5173`)

## 📦 Build for Production

```bash
npm run build
```

This generates an optimized production build in the `dist/` directory.

## 🔍 Project Structure

```
├── src/
│   ├── components/
│   │   ├── LaunchPage.jsx          # Main landing page
│   │   ├── TopicMenuPage.jsx       # Topic selection
│   │   ├── MenuListingPage.jsx     # Content listings
│   │   ├── MoonPage.jsx            # Moon information
│   │   ├── MoonPhasesPage.jsx      # Moon phases details
│   │   ├── MoonDistancePage.jsx    # Moon distance info
│   │   ├── EarthPage.jsx           # Earth science content
│   │   ├── NeptunePage.jsx         # Neptune information
│   │   ├── ArtChallenge.jsx        # Creative activities
│   │   ├── CosmicCard.jsx          # Reusable card component
│   │   ├── FeaturedSection.jsx     # Featured content area
│   │   ├── Header.jsx              # Navigation header
│   │   ├── BottomNav.jsx           # Bottom navigation
│   │   ├── NavCategories.jsx       # Category navigation
│   │   ├── Footer.jsx              # Footer section
│   │   └── Onboarding.jsx          # First-time user experience
│   ├── App.jsx                     # Main app component
│   └── index.css                   # Global styles and design tokens
├── package.json
└── vite.config.js
```

## 🛠️ Tech Stack

- **React** (v18.3.1) - UI library
- **React Router** (v7.14.2) - Client-side routing
- **Vite** (v5.4.2) - Fast build tool and dev server
- **Sharp** (v0.34.5) - Image optimization
- **CSS** - Styling with design tokens and animations

## 👥 Target Audience

- **Primary**: Kids ages 8-12 interested in space and Earth science
- **Voice**: Cartoonish, playful, cute, and approachable
- **Anti-Vibe**: No "serious" science vibes, no harsh UI, no information overload

## 📋 Design Tokens (index.css)

Key CSS variables for maintaining design consistency:

- `--paper-bg`: Deep Burnt Sienna background
- `--amber-soft`: Primary warm brand color
- `--radius-wobbly`: Hand-drawn shape simulation
- `--ease-pop`: Spring-loaded motion curve
- `--shadow-pop`: Solid 8px offset shadow
- `--noise-grain`: Paper texture opacity (12%)

## 🎮 Features at a Glance

### Current Pages & Components
- **Launch Page**: Welcoming entry point with featured content
- **Topic Menu**: Browse space topics (Moon, Planets, Earth, etc.)
- **Menu Listing**: Display content for selected topics
- **Topic-Specific Pages**: Detailed information for Moon, Neptune, Earth, and more
- **Art Challenge**: Creative activities to engage students
- **Responsive Navigation**: Header, bottom nav, and category navigation for easy browsing

## 📱 Responsive Design

The platform is designed to work seamlessly across devices:
- Mobile-first approach
- Tablet-friendly layouts
- Desktop-enhanced experience

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes with clear, descriptive commits
3. Push your branch and open a pull request
4. Ensure all components follow the design guidelines

## 📄 License

This project is maintained by NASA's Space Place initiative.

## 🌟 Future Enhancements

Potential features for expansion:
- User accounts and progress tracking
- Leaderboards and achievement badges
- More interactive games and simulations
- Video content library expansion
- Multilingual support
- Offline mode for learning on the go

## 🙋 Support

For questions, feedback, or suggestions, please open an issue on the repository or contact the project maintainers.

---

**Happy Exploring! 🌌** Let's make space science fun for kids everywhere.
