# NTH Lottery 🎰

A stunning 3D lottery/raffle application built with React, TypeScript, and Three.js. Features beautiful animations, internationalization support, and a fully customizable interface.

![NTH Lottery](https://img.shields.io/badge/version-0.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19.2.3-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)
![Three.js](https://img.shields.io/badge/Three.js-0.172.0-black.svg)

## ✨ Features

- **🎨 3D Visualization**: Interactive 3D card animations powered by Three.js
- **🌐 Internationalization**: Full support for English and Vietnamese
- **🎯 Prize Management**: Configure multiple prizes with custom settings
- **👥 Personnel Management**: Import/export participant data via Excel
- **🎵 Custom Audio**: Upload and manage background music
- **🖼️ Custom Images**: Upload and manage background images
- **🎊 Confetti Effects**: Celebration animations for winners
- **⚙️ Highly Customizable**: Theme, colors, card sizes, and more
- **📱 Responsive Design**: Works on desktop and mobile devices
- **💾 Local Storage**: All data persists in browser storage

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ or Bun
- Modern web browser with WebGL support

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd nth-lottery

# Install dependencies
npm install
# or
bun install
```

### Development

```bash
# Start development server
npm run dev
# or
bun dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
# Build for production
npm run build
# or
bun build

# Preview production build
npm run preview
# or
bun preview
```

## 📖 Usage

### 1. Configure Participants

Navigate to **Config > Person List** to manage participants:

- **Import Excel**: Download the template, fill in participant data, and upload
- **Manual Entry**: Add participants one by one
- **Export**: Export current participant list to Excel

### 2. Configure Prizes

Navigate to **Config > Prize Config** to set up prizes:

- Add prize name and number of winners
- Upload prize images
- Configure single draw count
- Enable "All members participate" if needed

### 3. Customize Appearance

Navigate to **Config > Global Config** to customize:

- **Title**: Set the main title
- **Theme**: Choose from predefined themes
- **Colors**: Customize card, text, and pattern colors
- **Card Size**: Adjust card dimensions
- **Background**: Select or upload background images

### 4. Run the Lottery

1. Click **"Enter the draw"** or press `Space` to start
2. Click **"Start"** or press `Space` to begin the lottery
3. Click **"Draw the lucky one"** or press `Space` to stop and reveal winners
4. Click **"Continue"** to draw more winners or **"Cancel"** to exit

### Keyboard Shortcuts

- `Space`: Progress through lottery stages
- `Escape`: Exit lottery (when winners are displayed)

## 🛠️ Tech Stack

### Core

- **React 19.2.3**: UI framework
- **TypeScript 5.9.3**: Type safety
- **Vite 7.3.0**: Build tool and dev server

### 3D Graphics

- **Three.js 0.172.0**: 3D rendering
- **@tweenjs/tween.js**: Smooth animations
- **three-css3d**: CSS3D rendering

### UI & Styling

- **TailwindCSS 3.4.17**: Utility-first CSS
- **DaisyUI 4.12.23**: UI components
- **Lucide React**: Icons
- **Canvas Confetti**: Celebration effects

### State Management & Data

- **Zustand 5.0.9**: State management
- **LocalForage 1.10.0**: IndexedDB/localStorage wrapper
- **Immer 11.1.0**: Immutable state updates

### Internationalization

- **i18next 25.7.3**: i18n framework
- **react-i18next 16.5.0**: React bindings

### Utilities

- **React Router DOM 7.11.0**: Routing
- **React Toastify 11.0.5**: Toast notifications
- **XLSX 0.18.5**: Excel import/export
- **Zod 3.24.1**: Schema validation
- **Day.js 1.11.19**: Date manipulation

## 📁 Project Structure

```
nth-lottery/
├── public/              # Static assets
│   ├── images/         # Background images
│   ├── music/          # Background music
│   └── assets/         # Other assets
├── src/
│   ├── components/     # Reusable components
│   ├── i18n/          # Internationalization files
│   │   ├── en/        # English translations
│   │   └── vi/        # Vietnamese translations
│   ├── pages/         # Page components
│   │   ├── home/      # Main lottery page
│   │   └── config/    # Configuration pages
│   ├── store/         # Zustand stores
│   ├── types/         # TypeScript types
│   ├── utils/         # Utility functions
│   └── routes.tsx     # Route configuration
├── index.html
├── package.json
└── vite.config.ts
```

## 🎮 How It Works

### 3D Animation System

The application uses Three.js with CSS3DRenderer to create interactive 3D card animations:

1. **Initialization**: Cards are randomly positioned in 3D space
2. **Table View**: Cards arrange into a grid layout
3. **Sphere View**: Cards transform into a rotating sphere during lottery
4. **Winner Display**: Selected cards animate to the front with enlarged size

### State Management

The application uses Zustand for state management with three main stores:

- **Global Store**: Theme, appearance, and global settings
- **Person Store**: Participant data and winner tracking
- **Prize Store**: Prize configuration and lottery progress

### Data Persistence

All configuration and participant data is stored locally using LocalForage, which provides:

- Automatic fallback from IndexedDB → WebSQL → localStorage
- Asynchronous API
- Better performance for large datasets

## 🌍 Internationalization

The application supports multiple languages:

- **English** (en)
- **Vietnamese** (vi)

To add a new language:

1. Create a new folder in `src/i18n/`
2. Add `translation.json` with all required keys
3. Update `src/i18n/config.ts` to include the new language

## 🎨 Customization

### Themes

Predefined themes are available in the global configuration. Each theme includes:

- Card colors
- Text colors
- Pattern colors
- Background images

### Custom Patterns

Create custom card patterns by configuring pattern settings in the global config.

## 📝 Excel Template Format

When importing participants, use the following columns:

| UID | Name | Department | Identity |
| --- | ---- | ---------- | -------- |
| 001 | John | Sales      | Employee |
| 002 | Jane | Marketing  | Manager  |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and not licensed for public use.

## 🙏 Acknowledgments

- Three.js community for excellent 3D rendering capabilities
- React team for the amazing framework
- All contributors and users of this application

## 📞 Support

For issues or questions, please open an issue in the repository.

---

**Made with ❤️ by NTH**
