# Watch Movies GS - Complete UI Documentation

> **Latest Update (March 1, 2026):** Complete UI redesign with modern OTT streaming aesthetics inspired by Netflix, Prime Video, and Apple TV+. Features include glassmorphism effects, purple/pink color scheme, cinematic typography, enhanced light mode implementation, and streamlined interface with AI features removed.

## Major Changes (v5.0)

### Design Enhancements
- **Glassmorphism UI**: Frosted glass effects using `backdrop-filter: blur(32px)` throughout
- **Color Scheme**: Purple (#8b5cf6) and pink (#ec4899) gradient accents on cinematic black backgrounds
- **Typography**: Upgraded to 3.5rem hero title with animated gradient and glow effects
- **Posters**: Enlarged to 360px (recommendations) and 70x105px (search results) for better visibility
- **Scrollbar**: Custom purple-to-pink gradient styling
- **Animations**: Netflix-style hover effects (scale 1.03, translateY -12px, smooth cubic-bezier)

### Light Mode Improvements
- Complete light theme overrides with `!important` flags
- White player container and authentication overlay backgrounds
- Transparent OR divider label (no white box)
- High-contrast badges with white text on dark purple gradient
- Proper text color hierarchy (#212529 headings, #495057 body text)

### Removed Features
- **AI Recommendations Section**: Completely removed for interface simplification
- Genre selection and recommendation grid deprecated

### Technical Updates
- CSS variables reorganized for glassmorphism design system
- Cache busting implemented (currently v=20260301-16)
- Enhanced shadows and border radius for premium feel
- Optimized font rendering with antialiasing

## Table of Contents
1. [Global Theme & Variables](#global-theme--variables)
2. [Light & Dark Mode Support](#light--dark-mode-support)
3. [Container & Layout](#container--layout)
4. [Header Section](#header-section)
5. [Hero Section](#hero-section)
6. [Steps Section](#steps-section)
7. [Player Section](#player-section)
8. [AI Recommendations Section](#ai-recommendations-section) _(Removed)_
9. [Footer Section](#footer-section)
10. [Modal System](#modal-system)
11. [Watch History Modal](#watch-history-modal)
12. [Responsive Design](#responsive-design)
13. [CSS File Structure](#css-file-structure)

---

## Global Theme & Variables

### CSS Variables
The entire UI uses dynamic CSS variables that adapt to light and dark themes with a modern glassmorphism design:

**Dark Theme (Default) - Cinematic OTT Design:**
```css
:root {
  /* Dark Mode - Cinematic Black & Purple */
  --bg-primary: #0a0a0f;           /* Deep cinematic black */
  --bg-secondary: #131318;         /* Secondary dark background */
  --bg-tertiary: #1a1a24;          /* Tertiary background */
  
  /* Glassmorphism */
  --glass-bg: rgba(255, 255, 255, 0.03);     /* Frosted glass background */
  --glass-border: rgba(255, 255, 255, 0.08); /* Glass borders */
  --glass-hover: rgba(255, 255, 255, 0.06);  /* Glass hover state */
  
  /* Purple/Violet Accents */
  --accent-primary: #8b5cf6;       /* Primary purple */
  --accent-light: #a78bfa;         /* Light purple */
  --accent-dark: #7c3aed;          /* Dark purple */
  --accent-glow: rgba(139, 92, 246, 0.4);    /* Purple glow effect */
  
  /* Pink Highlights */
  --accent-pink: #ec4899;          /* Hot pink accent */
  --accent-pink-light: #f472b6;    /* Light pink */
  --accent-pink-glow: rgba(236, 72, 153, 0.3); /* Pink glow */
  
  /* Text Colors */
  --text-primary: #ffffff;         /* Primary white text */
  --text-secondary: #a1a1aa;       /* Secondary gray text */
  --text-tertiary: #71717a;        /* Tertiary gray text */
  
  /* Shadows - Enhanced for Depth */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.6);
  --shadow-glow: 0 0 32px var(--accent-glow);
  --shadow-pink-glow: 0 0 24px var(--accent-pink-glow);
  
  /* Border Radius - Cinematic */
  --radius-sm: 10px;
  --radius-md: 14px;
  --radius-lg: 18px;
  --radius-xl: 24px;
  --radius-full: 9999px;
  
  /* Transitions - Smooth & Natural */
  --transition-fast: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Light Theme:**
```css
body.light-theme {
  /* Light backgrounds with gradients */
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%) !important;
  
  /* Text colors for readability */
  color: #212529 !important;
  
  /* Adapted purple accents */
  --accent-primary: #6a5acd;       /* Medium purple for light mode */
  --accent-pink: #d6336c;          /* Darker pink for contrast */
  
  /* Light mode shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.12);
  --shadow-lg: 0 8px 20px rgba(0, 0, 0, 0.15);
}
```

### Global Reset & Body

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-tertiary) 100%);
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--text-primary);
  min-height: 100vh;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  transition: background 0.3s ease, color 0.3s ease;
}
```

**Purpose:** Establishes a cinematic OTT streaming aesthetic with gradient backgrounds, glassmorphism effects via backdrop-filter, and optimized typography. All components use CSS variables for seamless theme switching between light and dark modes.

---

## Light & Dark Mode Support

### Theme Toggle

The application features a fully functional light/dark mode toggle that persists user preference and respects system settings.

#### HTML Structure
```html
<button id="themeToggleBtn" class="theme-toggle-btn" aria-label="Toggle Theme">
  <i class="fas fa-sun"></i>
</button>
```

#### CSS
```css
.theme-toggle-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
  font-size: 1.1rem;
  cursor: pointer;
  transition: var(--transition);
}

.theme-toggle-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

/* Light mode override */
body.light-theme .theme-toggle-btn {
  border-color: rgba(0, 0, 0, 0.2);
}

body.light-theme .theme-toggle-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
```

#### JavaScript Implementation
```javascript
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = themeToggleBtn.querySelector('i');

// Check saved theme or system preference
const savedTheme = localStorage.getItem('theme');
const systemPrefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;

if (savedTheme === 'light' || (!savedTheme && systemPrefersLight)) {
  document.body.classList.add('light-theme');
  themeIcon.classList.remove('fa-sun');
  themeIcon.classList.add('fa-moon');
}

themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('light-theme');
  
  if (document.body.classList.contains('light-theme')) {
    localStorage.setItem('theme', 'light');
    themeIcon.classList.remove('fa-sun');
    themeIcon.classList.add('fa-moon');
  } else {
    localStorage.setItem('theme', 'dark');
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
  }
});
```

### Theme Features

- **Persistent Preference:** Theme choice is saved to `localStorage` and persists across sessions
- **System Preference Detection:** Automatically detects OS-level theme preference on first visit
- **Smooth Transitions:** All color changes animate smoothly (300ms)
- **Icon Toggle:** Sun icon (☀️) in dark mode, Moon icon (🌙) in light mode
- **Comprehensive Coverage:** 94+ light mode CSS rules covering all components

### Component Adaptations

All UI elements automatically adapt their colors via CSS variables:

- **Backgrounds:** Dark (#1a1a1e) → Light (#f8f9fa)
- **Text:** Light (#f5f5f5) → Dark (#212529)
- **Cards:** Dark gray → White with subtle shadows
- **Borders:** White/transparent → Black/transparent
- **Buttons:** Maintain accent colors with adjusted contrast
- **Modals:** Dark overlays → Light overlays
- **Icons:** Color-adjusted for visibility

**Purpose:** Provides users with comfortable viewing options for different lighting conditions while maintaining brand identity and accessibility standards.

---

## Container & Layout

### HTML Structure
```html
<div class="container">
  <!-- All content goes here -->
</div>
```

### CSS
```css
.container {
  width: 100%;
  max-width: 1000px;          /* Prevents over-stretching on large screens */
  margin: 0 auto;              /* Centers horizontally */
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;           /* Ensures footer stays at bottom */
}
```

**Purpose:** Creates a centered, max-width container that keeps content readable and maintains proper layout hierarchy.

---

## Header Section

### HTML Structure
```html
<header class="site-header">
  <div class="header-content">
    <div class="logo">
      <i class="fas fa-film"></i>
      <h1>Watch Movies <span class="gs-text">GS</span></h1>
    </div>

    <div class="header-right">
      <!-- Theme Toggle -->
      <button id="themeToggleBtn" class="theme-toggle-btn" aria-label="Toggle Theme">
        <i class="fas fa-sun"></i>
      </button>

      <!-- Authentication Section -->
      <div class="auth-section">
        <!-- Guest View -->
        <div id="auth-buttons" class="auth-buttons">
          <button id="loginBtn" class="auth-btn login-btn">
            <i class="fas fa-sign-in-alt"></i> Login
          </button>
          <button id="signupBtn" class="auth-btn signup-btn">
            <i class="fas fa-user-plus"></i> Sign Up
          </button>
        </div>

        <!-- Logged-in View -->
        <div id="user-profile" class="user-profile" style="display: none">
          <div class="user-info">
            <img id="userAvatar" class="user-avatar" src="" alt="User Avatar" />
            <span id="userName" class="user-name"></span>
            <i class="fas fa-chevron-down dropdown-icon"></i>
          </div>
        <div class="user-dropdown">
          <button id="watchHistoryBtn" class="dropdown-item">
            <i class="fas fa-history"></i> Watch History
          </button>
          <button id="editProfileBtn" class="dropdown-item">
            <i class="fas fa-user-edit"></i> Edit Profile
          </button>
          <button id="logoutBtn" class="dropdown-item">
            <i class="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
    </div>
  </div>
</header>
```

### CSS

#### Header Container
```css
.site-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 20px 0;
  margin-bottom: 20px;
  background-color: rgba(26, 26, 30, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: var(--transition);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
```

#### Logo
```css
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo i {
  font-size: 1.5rem;
  color: #e94560;           /* Red film icon */
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);  /* Adapts to theme */
}

.gs-text {
  color: #dd9af6;            /* Purple "GS" text */
}
```

#### Authentication Buttons (Guest)
```css
.auth-buttons {
  display: flex;
  gap: 10px;
}

.auth-btn {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  padding: 8px 16px;
  color: var(--text-color);
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 6px;
}

.auth-btn:hover {
  background-color: rgba(123, 104, 238, 0.2);
  border-color: #7b68ee;
}

.signup-btn {
  background-color: #7b68ee;    /* Purple filled button */
  border-color: #7b68ee;
}

.signup-btn:hover {
  background-color: #6a5acd;
}
```

#### User Profile Dropdown (Logged-in)
```css
.user-profile {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 25px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: var(--transition);
}

.user-info:hover {
  background-color: rgba(123, 104, 238, 0.1);
}

.user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 500;
}

.dropdown-icon {
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.user-profile.active .dropdown-icon {
  transform: rotate(180deg);    /* Rotates when dropdown is open */
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--primary-color);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius);
  padding: 8px 0;
  min-width: 150px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: var(--transition);
  z-index: 1000;
}

.user-profile.active .user-dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  width: 100%;
  background: none;
  border: none;
  color: var(--text-color);
  padding: 10px 16px;
  text-align: left;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 8px;
}

.dropdown-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}
```

**Purpose:** Provides brand identity and user session management. The dropdown menu animates smoothly and provides access to user-specific features.

---

## Hero Section

### HTML Structure
```html
<section class="hero-section">
  <h2 class="hero-title">Stream Your Favorite Movies</h2>
  <p class="hero-subtitle">
    Search by movie name or enter an IMDb ID to start watching instantly
  </p>
</section>
```

### CSS
```css
.hero-section {
  text-align: center;
  margin-bottom: 16px;
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-title {
  font-size: 3.5rem;            /* Large cinematic title */
  font-weight: 800;
  margin-bottom: 20px;
  background: linear-gradient(135deg, var(--text-primary), var(--accent-light), var(--accent-pink-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.04em;
  line-height: 1.1;
  animation: titleGlow 4s ease-in-out infinite;
  text-shadow: 0 0 40px rgba(139, 92, 246, 0.3);
}

@keyframes titleGlow {
  0%, 100% { filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.3)); }
  50% { filter: drop-shadow(0 0 40px rgba(236, 72, 153, 0.4)); }
}

.hero-subtitle {
  font-size: 1.2rem;
  color: var(--text-secondary);
  font-weight: 400;
  line-height: 1.7;
  max-width: 650px;
  margin: 0 auto;
  letter-spacing: 0.01em;
}

/* Light Mode Adjustments */
body.light-theme .hero-title {
  background: linear-gradient(135deg, #6a5acd, #8b5cf6, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: none;           /* Remove glow in light mode */
}
```

**Purpose:** Creates a bold, cinematic welcome with an oversized gradient title (3.5rem) featuring animated glow effects. Adapts gracefully to light mode without overwhelming visual effects.

---

## Steps Section

### HTML Structure
```html
<section class="steps-section">
  <div class="steps-container">
    <div class="step-card">
      <div class="step-number">1</div>
      <div class="step-content">
        <h3>Search by Name</h3>
        <p>Type the movie or series name in the search box below and select from the dropdown</p>
      </div>
    </div>

    <div class="step-card">
      <div class="step-number">2</div>
      <div class="step-content">
        <h3>Or Use IMDb ID</h3>
        <p>Alternatively, enter the IMDb ID directly: <span class="highlight">tt1187043</span></p>
      </div>
    </div>

    <div class="step-card">
      <div class="step-number">3</div>
      <div class="step-content">
        <h3>Click Play</h3>
        <p>Hit the play button to start streaming instantly</p>
      </div>
    </div>
  </div>
</section>
```

### CSS
```css
.steps-section {
  width: 100%;
  margin-bottom: 30px;
}

.steps-container {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.step-card {
  background-color: var(--secondary-color);
  border-radius: var(--border-radius);
  padding: 15px;
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 15px;
  transition: var(--transition);
}

.step-number {
  background-color: var(--accent-color);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content h3 {
  font-size: 1.1rem;
  margin-bottom: 5px;
  color: #dd9af6;
}

.step-content p {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.highlight {
  color: #7b68ee;
  font-weight: 500;
}
```

**Purpose:** Provides clear, visual instructions for using the platform. The numbered circles and pastel cards create an intuitive user flow.

---

## Player Section

### HTML Structure
```html
<section class="player-section">
  <!-- Tabs -->
  <div class="tabs-container">
    <button class="tab-button active" data-tab="all">Movies & Series</button>
    <button class="tab-button" data-tab="movies">Movies</button>
    <button class="tab-button" data-tab="series">Series</button>
  </div>

  <!-- Search & Input Controls -->
  <div class="input-wrapper">
    <div class="search-container">
      <!-- Search Input -->
      <div class="search-input-wrapper">
        <input type="text" id="searchInput" placeholder="Search for movies or series..." autocomplete="off" />
        <i class="fas fa-search search-icon"></i>
        <button id="clearSearchBtn" class="clear-search-btn" style="display: none;">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Search Dropdown -->
      <div id="searchDropdown" class="search-dropdown" style="display: none;">
        <!-- Results populated dynamically -->
      </div>

      <!-- Divider -->
      <div class="input-divider">
        <span>OR</span>
      </div>

      <!-- IMDb Input -->
      <input type="text" id="imdbInput" placeholder="Enter IMDb ID directly (e.g., tt1234567)" />
    </div>

    <!-- Play Button -->
    <button id="playButton">
      <i class="fas fa-play"></i> Play
    </button>
  </div>

  <!-- Player Container -->
  <div class="player-container">
    <div id="IndStreamPlayer" class="responsive-player"></div>
    <div class="loading-indicator">
      <div class="spinner"></div>
      <p>Loading movie, please wait...</p>
    </div>
  </div>
</section>
```

### CSS

#### Player Section Container
```css
.player-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
```

#### Tabs
```css
.tabs-container {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  width: 100%;
  justify-content: center;
}

.tab-button {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  padding: 10px 30px;
  color: var(--text-color);
  font-size: 1rem;
  cursor: pointer;
  transition: var(--transition);
}

.tab-button.active {
  background-color: #7b68ee;
  border-color: #7b68ee;
}

.tab-button:hover {
  background-color: rgba(123, 104, 238, 0.2);
}
```

#### Search Input
```css
.input-wrapper {
  width: 100%;
  max-width: 500px;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}

.search-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
  position: relative;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
}

.search-input-wrapper input {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  padding: 15px 50px 15px 20px;
  width: 100%;
  color: var(--text-color);
  font-size: 1rem;
  transition: var(--transition);
  text-align: left;
}

.search-input-wrapper input:focus {
  outline: none;
  border-color: #7b68ee;
  background-color: rgba(255, 255, 255, 0.08);
}

.search-input-wrapper input::placeholder {
  color: var(--text-secondary);
}

.search-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: 1rem;
  pointer-events: none;
}

.clear-search-btn {
  position: absolute;
  right: 50px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.clear-search-btn:hover {
  color: var(--text-color);
  background-color: rgba(255, 255, 255, 0.1);
}
```

#### Search Dropdown
```css
.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: rgba(26, 26, 30, 0.98);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  margin-top: 8px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(123, 104, 238, 0.1);
  animation: dropdownFadeIn 0.2s ease-out;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-result {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
}

.search-result:last-child {
  border-bottom: none;
}

.search-result:hover,
.search-result.highlighted {
  background-color: rgba(123, 104, 238, 0.15);
  transform: translateX(2px);
}

.result-poster {
  width: 40px;
  height: 60px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.result-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.result-details {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-meta {
  font-size: 0.85rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-year {
  color: #7b68ee;
}

.result-type {
  background-color: rgba(123, 104, 238, 0.2);
  color: #7b68ee;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  text-transform: uppercase;
}

/* Light Mode - High Contrast Badge */
body.light-theme .result-type {
  background: linear-gradient(135deg, #6a5acd, #5a4cbd);
  color: #ffffff !important;
  box-shadow: 0 2px 4px rgba(106, 90, 205, 0.2);
}
```

#### Divider & IMDb Input
```css
.input-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0;
  position: relative;
}

.input-divider::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
}

.input-divider span {
  background-color: var(--primary-color);
  padding: 0 15px;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
}

/* Light Mode - Transparent OR Label */
body.light-theme .input-divider span {
  background-color: transparent;
}

#imdbInput {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  padding: 15px 20px;
  width: 100%;
  color: var(--text-color);
  font-size: 1rem;
  transition: var(--transition);
  text-align: center;
}

#imdbInput:focus {
  outline: none;
  border-color: #7b68ee;
}
```

#### Play Button
```css
#playButton {
  background-color: #7b68ee;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 12px 40px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: auto;
  min-width: 120px;
  box-shadow: 0 4px 10px rgba(123, 104, 238, 0.4);
}

#playButton:hover {
  background-color: #6a5acd;
  transform: translateY(-2px);
}

#playButton:active {
  transform: translateY(0);
}
```

#### Player Container & Loading
```css
.player-container {
  width: 100%;
  max-width: 800px;
  position: relative;
  aspect-ratio: 16 / 9;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-lg);
}

/* Light Mode - White Player Background */
body.light-theme .player-container {
  background: #ffffff !important;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

#IndStreamPlayer {
  width: 100%;
  height: 100%;
  margin-top: 0;
  position: relative;
  z-index: 1;
}

#IndStreamPlayer iframe {
  width: 100% !important;
  height: 100% !important;
  border-radius: var(--border-radius);
}

.loading-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: var(--transition);
}

.loading-indicator.show {
  opacity: 1;
  visibility: visible;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: #7b68ee;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
```

#### Authentication Overlay (Dynamic)

The authentication overlay is dynamically injected by JavaScript when unauthenticated users attempt to play content:

```javascript
// Created in main.min.js (lines 60-95)
const authOverlay = document.createElement('div');
authOverlay.id = 'auth-required-message';
authOverlay.className = 'auth-required-message';
// Appended to .player-container
```

**CSS Styling:**
```css
.auth-required-message {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26, 26, 30, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: var(--radius-lg);
}

/* Light Mode - White Overlay Background */
body.light-theme .auth-required-message {
  background: #ffffff !important;
}

.auth-message-content h3 {
  color: var(--text-primary);
  margin-bottom: 8px;
}

.auth-message-content p {
  color: var(--text-secondary);
}

/* Light Mode - Dark Text for Readability */
body.light-theme .auth-message-content h3 {
  color: #212529 !important;
}

body.light-theme .auth-message-content p {
  color: #495057 !important;
}
```

**Purpose:** The core streaming interface with multi-method search (autocomplete and direct IMDb), tab filtering, and an embedded video player with loading states. The authentication overlay ensures proper visibility in both dark and light modes with appropriate background and text colors.

---

## AI Recommendations Section (REMOVED)

> **Status:** This feature has been completely removed from the application as of March 1, 2026.

---

## ~~AI Recommendations Section~~ (Historical Reference)

### HTML Structure
```html
<section class="recommendations-section">
  <!-- Header -->
  <div class="recommendations-header-main">
    <h2><i class="fas fa-robot"></i> AI-Powered Recommendations</h2>
    <p>Discover movies and series tailored to your taste using our intelligent recommendation system</p>
  </div>

  <!-- Genre Selection -->
  <div class="genre-filters">
    <h3>Select Genres for Personalized Recommendations:</h3>
    <div class="genre-buttons">
      <button class="genre-btn" data-genre="Action">
        <i class="fas fa-fist-raised"></i> Action
      </button>
      <button class="genre-btn" data-genre="Comedy">
        <i class="fas fa-laugh"></i> Comedy
      </button>
      <!-- More genres... -->
    </div>
  </div>

  <!-- Controls -->
  <div class="recommendation-controls">
    <div class="content-type-selector">
      <label>Content Type:</label>
      <select id="recommendationType">
        <option value="all">Movies & Series</option>
        <option value="movies">Movies Only</option>
        <option value="series">Series Only</option>
      </select>
    </div>

    <div class="language-selector">
      <label>Language:</label>
      <select id="recommendationLanguage">
        <option value="all">All Languages</option>
        <option value="english">English</option>
        <option value="hindi">Hindi/Bollywood</option>
      </select>
    </div>

    <button id="getRecommendationsBtn" class="get-recommendations-btn">
      <i class="fas fa-magic"></i> Get AI Recommendations
    </button>

    <button id="clearGenresBtn" class="clear-genres-btn">
      <i class="fas fa-times"></i> Clear All
    </button>
  </div>

  <!-- Results Container -->
  <div id="recommendationsContainer" class="recommendations-container">
    <!-- Placeholder or results grid -->
  </div>
</section>
```

### CSS

#### Section Container
```css
.recommendations-section {
  width: 100%;
  margin-top: 50px;
  padding: 30px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
```

#### Header
```css
.recommendations-header-main {
  text-align: center;
  margin-bottom: 40px;
}

.recommendations-header-main h2 {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.recommendations-header-main h2 i {
  color: #7b68ee;
  font-size: 1.8rem;
}

.recommendations-header-main p {
  font-size: 1.1rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}
```

#### Genre Filters
```css
.genre-filters {
  margin-bottom: 30px;
}

.genre-filters h3 {
  font-size: 1.2rem;
  color: var(--text-color);
  margin-bottom: 20px;
  text-align: center;
}

.genre-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  max-width: 800px;
  margin: 0 auto;
}

.genre-btn {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  padding: 10px 20px;
  color: var(--text-color);
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.genre-btn:hover {
  background-color: rgba(123, 104, 238, 0.2);
  border-color: #7b68ee;
  transform: translateY(-2px);
}

.genre-btn.active {
  background-color: #7b68ee;
  border-color: #7b68ee;
  color: white;
}

.genre-btn i {
  font-size: 0.8rem;
}
```

#### Recommendation Controls
```css
.recommendation-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.content-type-selector,
.language-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.content-type-selector label,
.language-selector label {
  color: var(--text-color);
  font-weight: 500;
  white-space: nowrap;
}

.content-type-selector select,
.language-selector select {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  color: var(--text-color);
  font-size: 0.9rem;
  cursor: pointer;
  min-width: 140px;
}

.content-type-selector select:focus,
.language-selector select:focus {
  outline: none;
  border-color: #7b68ee;
  box-shadow: 0 0 0 2px rgba(123, 104, 238, 0.2);
}

.get-recommendations-btn {
  background: linear-gradient(135deg, #7b68ee, #9370db);
  border: none;
  border-radius: 25px;
  padding: 12px 24px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(123, 104, 238, 0.3);
}

.get-recommendations-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(123, 104, 238, 0.4);
}

.clear-genres-btn {
  background-color: rgba(233, 69, 96, 0.1);
  border: 1px solid rgba(233, 69, 96, 0.3);
  border-radius: 25px;
  padding: 10px 20px;
  color: #e94560;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 8px;
}

.clear-genres-btn:hover {
  background-color: rgba(233, 69, 96, 0.2);
  border-color: #e94560;
}
```

#### Placeholder State
```css
.recommendations-placeholder {
  text-align: center;
  padding: 60px 20px;
  background-color: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.recommendations-placeholder i {
  font-size: 3rem;
  color: #7b68ee;
  margin-bottom: 20px;
}

.recommendations-placeholder h3 {
  font-size: 1.5rem;
  color: var(--text-color);
  margin-bottom: 10px;
}

.recommendations-placeholder p {
  color: var(--text-secondary);
  margin-bottom: 30px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.ai-features {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.ai-feature {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.ai-feature i {
  color: #7b68ee;
  font-size: 1rem;
}
```

#### Recommendations Grid
```css
.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.recommendation-card {
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  overflow: hidden;
  transition: var(--transition);
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
}

.recommendation-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border-color: rgba(123, 104, 238, 0.3);
}

.recommendation-poster {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
}

.recommendation-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition);
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px 8px 0 0;
}

.recommendation-card:hover .recommendation-poster img {
  transform: scale(1.05);
}

.recommendation-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    rgba(0, 0, 0, 0.8) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: var(--transition);
}

.recommendation-card:hover .recommendation-overlay {
  opacity: 1;
}

.play-recommendation-btn {
  background: linear-gradient(135deg, #7b68ee, #9370db);
  border: none;
  border-radius: 25px;
  padding: 12px 20px;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(123, 104, 238, 0.4);
}

.play-recommendation-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(123, 104, 238, 0.6);
}

.recommendation-info {
  padding: 15px;
}

.recommendation-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 8px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recommendation-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.recommendation-year,
.recommendation-type,
.recommendation-rating {
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.recommendation-year {
  background-color: rgba(123, 104, 238, 0.2);
  color: #7b68ee;
}

.recommendation-type {
  background-color: rgba(221, 154, 246, 0.2);
  color: #dd9af6;
}

.recommendation-rating {
  background-color: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.recommendation-genres {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ai-score {
  font-size: 0.8rem;
  color: #7b68ee;
  font-weight: 600;
  background-color: rgba(123, 104, 238, 0.1);
  padding: 4px 8px;
  border-radius: 8px;
  display: inline-block;
  margin-top: 4px;
}
```

#### Loading State
```css
.recommendations-loading {
  text-align: center;
  padding: 60px 20px;
}

.ai-loading-animation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

.ai-loading-animation i {
  font-size: 2.5rem;
  color: #7b68ee;
  animation: pulse 2s infinite;
}

.loading-dots {
  display: flex;
  gap: 4px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background-color: #7b68ee;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}
```

**Purpose (Historical):** Previously provided AI-driven content discovery with genre selection, filtering options, and a responsive grid layout. This entire section was removed in the March 2026 redesign to simplify the user interface and focus on core streaming functionality.

**Removal Details:**
- All AI recommendation HTML removed from [index.html](index.html)
- Genre selection buttons removed
- Recommendation grid and cards removed
- AI-powered features consolidated into future backend implementation
- Related JavaScript functionality deprecated

---

## Footer Section

### HTML Structure
```html
<footer class="site-footer">
  <p>&copy; <span id="currentYear"></span> Watch Movies GS. All rights reserved.</p>
  <p class="disclaimer">This site is for educational purposes only.</p>
</footer>
```

### CSS
```css
.site-footer {
  padding: 20px 0;
  text-align: center;
  margin-top: 40px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.disclaimer {
  margin-top: 5px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}
```

**Purpose:** Simple footer with copyright and disclaimer information.

---

## Modal System

### Common Modal Structure
All modals share a base structure with specific variations:

```html
<div id="modalName" class="modal">
  <div class="modal-content">
    <div class="modal-header">
      <h2><i class="fas fa-icon"></i> Title</h2>
      <span class="close" data-modal="modalName">&times;</span>
    </div>
    <!-- Modal-specific content -->
  </div>
</div>
```

### Base Modal CSS
```css
.modal {
  display: none;
  position: fixed;
  z-index: 2000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
}

.modal.show {
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: var(--primary-color);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius);
  width: 90%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.close {
  color: var(--text-secondary);
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  transition: var(--transition);
}

.close:hover {
  color: var(--text-color);
}
```

### Form Elements
```css
.auth-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: var(--text-color);
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius);
  color: var(--text-color);
  font-size: 1rem;
  transition: var(--transition);
}

.form-group input:focus {
  outline: none;
  border-color: #7b68ee;
  background-color: rgba(255, 255, 255, 0.08);
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper input {
  padding-right: 45px;
}

.password-toggle-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  z-index: 1;
}

.password-toggle-btn:hover {
  color: var(--text-color);
  background-color: rgba(255, 255, 255, 0.1);
}

.auth-submit-btn {
  width: 100%;
  background-color: #7b68ee;
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 12px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.auth-submit-btn:hover {
  background-color: #6a5acd;
}

.auth-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

### OAuth & Dividers
```css
.auth-divider {
  text-align: center;
  margin: 20px 0;
  position: relative;
}

.auth-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
}

.auth-divider span {
  background-color: var(--primary-color);
  padding: 0 16px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.google-btn {
  width: 100%;
  background-color: #fff;
  color: #333;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  padding: 12px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.google-btn:hover {
  background-color: #f5f5f5;
}

.auth-switch {
  text-align: center;
  margin: 16px 0 0 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.auth-switch a {
  color: #7b68ee;
  text-decoration: none;
  font-weight: 500;
}

.auth-switch a:hover {
  text-decoration: underline;
}
```

### Error & Success Messages
```css
.error-message {
  background-color: rgba(233, 69, 96, 0.1);
  border: 1px solid rgba(233, 69, 96, 0.3);
  border-radius: var(--border-radius);
  padding: 12px;
  margin-top: 16px;
  color: #ff6b6b;
  font-size: 0.9rem;
  display: none;
}

.error-message.show {
  display: block;
}

.success-message {
  background-color: rgba(123, 104, 238, 0.1);
  border: 1px solid rgba(123, 104, 238, 0.3);
  border-radius: var(--border-radius);
  padding: 12px;
  margin-top: 16px;
  color: #7b68ee;
  font-size: 0.9rem;
  display: none;
}

.success-message.show {
  display: block;
}
```

### OTP Verification Modal
```css
.otp-verification-content {
  padding: 24px;
}

.otp-info {
  text-align: center;
  margin-bottom: 24px;
}

.otp-email {
  color: #7b68ee;
  font-size: 1.1rem;
  display: block;
  margin: 12px 0;
  word-break: break-all;
}

.otp-instruction {
  font-size: 0.9rem !important;
  color: rgba(255, 255, 255, 0.7) !important;
  margin-top: 16px !important;
}

.otp-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.resend-btn,
.check-verification-btn {
  width: 100%;
  padding: 12px 20px;
  border: none;
  border-radius: var(--border-radius);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.resend-btn {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--text-color);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.resend-btn:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.15);
}

.resend-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.check-verification-btn {
  background: linear-gradient(135deg, #7b68ee, #9f7aea);
  color: white;
}

.check-verification-btn:hover {
  background: linear-gradient(135deg, #6c5ce7, #8b5cf6);
  transform: translateY(-1px);
}

.otp-timer {
  text-align: center;
  margin-top: 16px;
}

.otp-timer p {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

#resendTimer {
  color: #7b68ee;
  font-weight: 500;
}
```

**Purpose:** Provides a consistent modal system for authentication flows, profile editing, and email verification with elegant animations.

---

## Watch History Modal

### HTML Structure
```html
<div id="watchHistoryModal" class="modal">
  <div class="modal-content watch-history-modal">
    <div class="modal-header">
      <h2><i class="fas fa-history"></i> Watch History</h2>
      <span class="close" data-modal="watchHistoryModal">&times;</span>
    </div>
    <div class="watch-history-content">
      <div id="watchHistoryList" class="history-list">
        <!-- History items populated dynamically -->
      </div>
    </div>
    <div class="history-actions">
      <button id="clearHistoryBtn" class="clear-history-btn">
        <i class="fas fa-trash"></i> Clear All History
      </button>
      <button id="closeHistoryBtn" class="cancel-btn">
        <i class="fas fa-times"></i> Close
      </button>
    </div>
  </div>
</div>
```

### CSS

#### Modal Container
```css
.watch-history-modal {
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
}

.watch-history-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 0 20px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
```

#### Empty State
```css
.empty-history {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.empty-history i {
  font-size: 4rem;
  color: #7b68ee;
  margin-bottom: 20px;
}

.empty-history h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: var(--text-color);
}
```

#### History Items
```css
.history-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: var(--border-radius);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: var(--transition);
  cursor: pointer;
}

.history-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
  border-color: rgba(123, 104, 238, 0.3);
  transform: translateY(-2px);
}

.history-poster {
  width: 60px;
  height: 90px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
}

.history-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 8px;
}

.play-overlay i {
  color: white;
  font-size: 1.2rem;
}

.history-item:hover .play-overlay {
  opacity: 1;
}

.history-details {
  flex: 1;
  min-width: 0;
}

.history-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-imdb {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-family: monospace;
}

.history-date {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.history-type {
  display: inline-block;
  padding: 2px 8px;
  background-color: #7b68ee;
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  margin-top: 4px;
  width: fit-content;
}
```

#### Actions
```css
.history-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding: 0 20px 20px;
  justify-content: space-between;
  align-items: center;
}

.clear-history-btn {
  background-color: rgba(233, 69, 96, 0.1);
  color: #ff6b6b;
  border: 1px solid rgba(233, 69, 96, 0.3);
  border-radius: var(--border-radius);
  padding: 10px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 8px;
}

.clear-history-btn:hover {
  background-color: rgba(233, 69, 96, 0.2);
  border-color: rgba(233, 69, 96, 0.5);
}

.clear-history-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--text-color);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius);
  padding: 10px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.cancel-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}
```

**Purpose:** Displays user's viewing history with poster thumbnails, metadata, and quick-play functionality. Fully interactive with hover effects.

---

## Responsive Design

The UI implements comprehensive responsive breakpoints to ensure optimal viewing on all devices:

### Tablet (≤768px)
```css
@media (max-width: 768px) {
  .steps-container {
    flex-direction: column;
  }

  .hero-title {
    font-size: 1.8rem;
  }

  .player-container {
    aspect-ratio: 4 / 3;
  }

  .recommendations-section {
    padding: 20px 0;
    margin-top: 30px;
  }

  .recommendations-header-main h2 {
    font-size: 1.5rem;
    flex-direction: column;
    gap: 8px;
  }

  .genre-buttons {
    gap: 8px;
  }

  .genre-btn {
    padding: 8px 16px;
    font-size: 0.85rem;
  }

  .recommendation-controls {
    flex-direction: column;
    gap: 15px;
  }

  .recommendations-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }

  .recommendation-poster {
    height: 220px;
  }

  .watch-history-modal {
    max-width: 95%;
    margin: 20px;
  }

  .history-item {
    gap: 12px;
    padding: 12px;
  }

  .history-poster {
    width: 50px;
    height: 75px;
  }

  .history-actions {
    flex-direction: column;
    gap: 10px;
  }

  .clear-history-btn,
  .cancel-btn {
    width: 100%;
    justify-content: center;
  }
}
```

### Mobile (≤480px)
```css
@media (max-width: 480px) {
  .site-header {
    padding: 15px 0;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .header-right {
    justify-content: center;
    width: 100%;
  }

  .auth-buttons {
    justify-content: center;
  }

  .auth-btn {
    padding: 6px 12px;
    font-size: 0.8rem;
  }

  .logo i {
    font-size: 1.3rem;
  }

  .logo h1 {
    font-size: 1.3rem;
  }

  .hero-title {
    font-size: 1.5rem;
  }

  .step-card {
    padding: 15px;
  }

  .step-number {
    width: 25px;
    height: 25px;
    font-size: 0.9rem;
  }

  .step-content h3 {
    font-size: 1rem;
  }

  .step-content p {
    font-size: 0.8rem;
  }

  .search-input-wrapper input {
    padding: 12px 45px 12px 15px;
    font-size: 0.9rem;
  }

  .search-icon {
    right: 15px;
    font-size: 0.9rem;
  }

  .result-poster {
    width: 35px;
    height: 50px;
  }

  .result-title {
    font-size: 0.9rem;
  }

  #imdbInput {
    padding: 12px 15px;
    font-size: 0.9rem;
  }

  #playButton {
    padding: 10px 20px;
    font-size: 0.9rem;
  }

  .auth-message-buttons {
    flex-direction: column;
    align-items: center;
    gap: 14px;
    max-width: 280px;
  }

  .auth-message-btn {
    width: 100%;
    max-width: none;
    min-width: auto;
    flex: none;
    justify-content: center;
    height: 56px;
    font-size: 1rem;
    padding: 16px 24px;
    border-radius: 14px;
  }

  .modal-content {
    width: 95%;
    margin: 10px;
  }

  .auth-form {
    padding: 20px;
  }

  .profile-actions {
    flex-direction: column;
    gap: 8px;
  }

  .profile-actions .auth-submit-btn,
  .cancel-btn {
    width: 100%;
  }
}
```

**Purpose:** Ensures the UI is fully responsive across all screen sizes, from large desktops to small mobile devices. Elements stack vertically, fonts scale appropriately, and touch targets remain accessible.

---

## CSS File Structure

### Active Files

**1. normalize.min.css** (2.2KB, 148 lines)
- **Purpose:** CSS reset library (normalize.css v8.0.1, MIT License)
- **Status:** Active - Linked in [index.html](index.html) line 8
- **Function:** Ensures consistent default styling across different browsers
- **Usage:** `<link rel="stylesheet" href="css/normalize.min.css" />`

**2. style.css** (67KB, 3,402 lines)
- **Purpose:** Main application stylesheet with all custom styles
- **Status:** Active - Linked in [index.html](index.html) line 9 with cache version
- **Last Modified:** March 1, 2026, 12:31
- **Features:**
  - Complete glassmorphism design system
  - Dark and light theme variables
  - All component styles
  - Responsive breakpoints
  - Animation keyframes
  - Light mode overrides with `!important` flags
- **Usage:** `<link rel="stylesheet" href="css/style.css?v=20260301-16" />`
- **Cache Busting:** Query parameter versioning (currently v=20260301-16)

### Inactive Files

**3. style.min.css** (48KB, 2,664 lines)
- **Purpose:** Outdated minified version of stylesheet
- **Status:** Inactive - Not linked anywhere in HTML
- **Last Modified:** February 28, 2026, 23:03 (before March 1 redesign)
- **Note:** Contains older CSS variable structure, missing all light-mode fixes, glassmorphism effects, and recent UI updates. Safe to delete or replace with minified version of current style.css.

---

## Summary

This Watch Movies GS UI is built with:

- **Modern OTT Aesthetic:** Inspired by Netflix, Prime Video, and Apple TV+ with cinematic design
- **Glassmorphism Effects:** Frosted glass using `backdrop-filter: blur(32px)` throughout the interface
- **Purple/Pink Color Scheme:** Vibrant gradients (#8b5cf6, #ec4899) on deep black backgrounds
- **Enhanced Typography:** Oversized 3.5rem hero title with animated gradient and glow effects
- **Light & Dark Modes:** Fully functional theme toggle with persistent preferences and system detection
- **Dynamic Color System:** CSS variables enable seamless theme switching across all components
- **Professional Design:** Cinematic dark theme (#0a0a0f) with enhanced light theme (#f8f9fa gradients)
- **Modular Components:** Each section is self-contained and reusable
- **Smooth Animations:** Cubic-bezier transitions and Netflix-style hover effects
- **Full Responsiveness:** Three breakpoints ensure optimal viewing on all devices
- **Accessibility:** Clear visual hierarchy, proper contrast ratios (WCAG AA), and intuitive interactions
- **Modern Design Patterns:** Glassmorphism, gradient backgrounds, enlarged posters, custom scrollbar
- **Theme Persistence:** localStorage saves user preference across sessions
- **Cache Busting:** Query parameter versioning for reliable CSS updates

### Theme-Adaptive Features

All UI elements dynamically adapt between themes:

**Dark Mode (Default) - Cinematic:**
- Background: Linear gradient (#0a0a0f → #131318 → #1a1a24)
- Text: #ffffff (primary), #a1a1aa (secondary)
- Accent: #8b5cf6 (purple), #ec4899 (pink)
- Cards: Glassmorphism with frosted effect
- Shadows: Deep with purple glow effects

**Light Mode:**
- Background: Linear gradient (#f8f9fa → #e9ecef → #dee2e6)
- Text: #212529 (dark headings), #495057 (body text)
- Accent: #6a5acd (medium purple), #d6336c (pink)
- Cards: White (#ffffff) with subtle shadows
- Shadows: Light with reduced opacity
- Player/Auth Overlays: White backgrounds with dark text for readability

All components follow a consistent design language using CSS variables, making theme customization straightforward and maintenance simple.

### Recent Updates (March 1, 2026)

**Major Changes:**
1. ✅ Complete redesign with OTT streaming aesthetics (Netflix/Prime/Apple TV+ inspired)
2. ✅ Glassmorphism effects throughout interface with `backdrop-filter: blur(32px)`
3. ✅ Purple/pink gradient color scheme (#8b5cf6, #ec4899)
4. ✅ Hero title enlarged to 3.5rem with animated gradient glow
5. ✅ Recommendation posters enlarged to 360px height
6. ✅ Search result thumbnails increased to 70x105px
7. ✅ Custom scrollbar with purple-to-pink gradient styling
8. ✅ Netflix-style hover animations (scale 1.03, translateY -12px)
9. ✅ AI recommendations section completely removed for simplicity
10. ✅ Light mode fixes: white player/auth backgrounds, transparent OR label, high-contrast badges
11. ✅ Cache busting mechanism implemented (v=20260301-16)
12. ✅ Enhanced shadows and border radius (10-24px) for premium feel

**Files Modified:**
- [index.html](index.html) - AI features removed, cache version v=20260301-16
- [css/style.css](css/style.css) - 3,402 lines, complete glassmorphism redesign
- [css/style.min.css](css/style.min.css) - Outdated, not in use (safe to delete)

---

**Documentation Version:** 5.0  
**Last Updated:** March 1, 2026  
**CSS Cache Version:** v=20260301-16
