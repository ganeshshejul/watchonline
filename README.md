# Watch Movie/Series Online
🎬 **Watch Movies/Series Online for FREE!** 🍿

✨ Discover a treasure trove of movies/series right at your fingertips, all without spending a dime! Whether you're into action-packed blockbusters, heartwarming romances, or edge-of-your-seat thrillers, we've got it all. Stream your favorite films in HD quality from the comfort of your home. No subscriptions, no hidden fees—just pure entertainment! 🎉

🚀 **Key Features:**
- 📺 **Wide Collection:** From classics to the latest releases, there's something for everyone!
- 🔍 **Easy Access:** Quickly find your desired movie with our user-friendly interface.
- 💻 **Accessible Anywhere:** Watch on your laptop, tablet, or phone—anytime, anywhere.
- 📈 **Trending Now:** Stay updated with the most popular movies and watch the popular movies online.

So, grab your snacks, sit back, and enjoy unlimited movie streaming for free! 🎥🍕

---

## 📋 Table of Contents
- [Setup & Installation](#-setup--installation)
- [Configuration](#-configuration)
- [Tech Stack](#-tech-stack)
- [Development](#-development)
- [Deployment](#-deployment)
- [Website Demo](#-website-demo)
- [Usage Guide](#steps-to-watch-the-moviesseries)

---

## 🚀 Setup & Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **Firebase Account** (for authentication)
- **TMDB API Key** (for movie search - optional)

### Quick Start

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/watchonline.git
   cd watchonline
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   The app will open at `http://localhost:3000`

5. **Build for Production**
   ```bash
   npm run build
   ```

---

## ⚙️ Configuration

### Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add Project" and follow the setup wizard
   - Enable **Authentication** → **Email/Password** and **Google** sign-in methods
   - Enable **Firestore Database** for watch history storage

2. **Get Firebase Credentials**
   - Go to Project Settings → General
   - Scroll to "Your apps" section
   - Click the web icon `</>`
   - Copy the configuration values to your `.env` file

3. **Firestore Database Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/watchHistory/{historyId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

4. **Authentication Settings**
   - Enable Email/Password authentication
   - Enable Google authentication (add your domain to authorized domains)
   - Configure email verification settings

### TMDB API (Movie Search)

1. **Get API Key**
   - Sign up at [The Movie Database](https://www.themoviedb.org/)
   - Go to Settings → API
   - Copy your API Key (v3 auth)

2. **Update Search Configuration**
   The search functionality in `js/search.js` uses TMDB API for movie lookups. Keys are embedded in the code for demo purposes.

### OMDb API (Movie Details)

The app uses OMDb API for fetching movie details. API keys are included in `js/main.min.js` for demo purposes. For production:

1. Get your own API key from [OMDb API](http://www.omdbapi.com/apikey.aspx)
2. Update the `omdbKeys` array in `js/main.min.js` (line ~283)

---

## 🛠️ Tech Stack

### Frontend
- **HTML5/CSS3** - Modern, responsive UI
- **Vanilla JavaScript** - No framework dependencies
- **Firebase SDK** - Authentication & Database
- **Vite** - Build tool & dev server

### APIs & Services
- **VidSrc** - Primary video streaming provider
- **VinoStream** - Alternative streaming source
- **TMDB API** - Movie/series search & metadata
- **OMDb API** - Additional movie information
- **Firebase Auth** - User authentication
- **Firestore** - User data & watch history

### Development Tools
- **Vite** - Fast dev server with HMR
- **ESLint** - Code quality
- **Prettier** - Code formatting
- **Git** - Version control

### Libraries & Frameworks
```json
{
  "firebase": "^10.7.1",
  "vite": "^5.0.0"
}
```

---

## 💻 Development

### Project Structure
```
watchonline/
├── index.html              # Main HTML file
├── package.json            # Dependencies & scripts
├── vite.config.js          # Vite configuration
├── .env                    # Environment variables (not committed)
├── .env.example            # Template for .env
├── css/
│   ├── style.css          # Main styles
│   └── style.min.css      # Minified styles
├── js/
│   ├── auth.min.js        # Authentication logic
│   ├── config.js          # Firebase configuration
│   ├── env-loader.js      # Environment loader (fallback)
│   ├── vite-env.js        # Vite environment loader
│   ├── main.min.js        # Main application logic
│   ├── search.js          # Search functionality
│   ├── recommendations.js # AI recommendation system
│   └── *.js               # Other modules (sync features, etc.)
└── img/                   # Images and assets
```

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Serve production build on port 8080
npm run serve
```

### Key Features Implementation

1. **Authentication System** (`js/auth.min.js`)
   - Email/Password login & signup
   - Google OAuth integration
   - Email verification with OTP
   - User profile management
   - Watch history tracking

2. **Search System** (`js/search.js`)
   - Real-time TMDB API search
   - Autocomplete dropdown
   - Keyboard navigation
   - TMDB to IMDb ID conversion
   - Movie poster display

3. **AI Recommendations** (`js/recommendations.js`)
   - Genre-based filtering
   - Personalized suggestions
   - Multiple content APIs
   - Quality-based scoring
   - Viewing history analysis

4. **Video Player** (`js/main.min.js`)
   - Multi-source streaming (VidSrc, VinoStream)
   - Tab switching (All/Movies/Series)
   - Auto-fetch movie details
   - Watch history integration
   - Authentication-gated playback

### Environment Variables

All environment variables must be prefixed with `VITE_` to be accessible in the client-side code:

```env
# Required - Firebase Authentication
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Important:** Restart the Vite dev server after changing `.env` file!

---

## 🚢 Deployment

### Netlify (Recommended)

1. **Connect Repository**
   - Go to [Netlify](https://www.netlify.com/)
   - Click "New site from Git"
   - Select your repository

2. **Configure Build Settings**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **Add Environment Variables**
   - Go to Site Settings → Build & deploy → Environment
   - Add all `VITE_*` variables from your `.env` file

4. **Deploy**
   - Click "Deploy site"
   - Your site will be live at `https://your-site.netlify.app`

### Vercel

1. **Import Project**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Configure**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Add environment variables in Vercel dashboard

### GitHub Pages

1. **Build the Project**
   ```bash
   npm run build
   ```

2. **Deploy**
   ```bash
   cd dist
   git init
   git add -A
   git commit -m 'deploy'
   git push -f https://github.com/yourusername/watchonline.git main:gh-pages
   ```

3. **Configure GitHub Pages**
   - Go to repository Settings → Pages
   - Select `gh-pages` branch
   - Your site will be at `https://yourusername.github.io/watchonline`

### Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize Firebase Hosting**
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Set public directory to `dist`
   - Configure as single-page app: Yes

3. **Build & Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

### Custom Domain Setup

For Netlify/Vercel:
1. Add your custom domain in dashboard
2. Update DNS records:
   ```
   Type: A Record
   Name: @
   Value: [Provider IP]
   
   Type: CNAME
   Name: www
   Value: your-site.netlify.app
   ```

---

## 🔐 Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use Firestore security rules** - Protect user data
3. **Enable Firebase App Check** - Prevent API abuse
4. **Rotate API keys regularly** - Especially for public repos
5. **Use HTTPS only** - Netlify/Vercel provide free SSL

---

## 🐛 Troubleshooting

### Firebase Not Loading
- Ensure `.env` file has correct `VITE_` prefixed variables
- Restart Vite dev server after `.env` changes
- Check browser console for API key errors

### Search Not Working
- Check TMDB API key validity
- Verify CORS settings
- Check network tab for API responses

### Video Player Not Loading
- Ensure user is authenticated
- Check if VidSrc/VinoStream services are accessible
- Try alternative tabs (Movies/Series)

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run dev
```

---

## 📝 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [TMDB API Docs](https://developers.themoviedb.org/3)
- [Netlify Docs](https://docs.netlify.com/)
- [See detailed setup guide](SETUP.md)

---

# 🌐 Website Demo:
  https://watchmoviegs.netlify.app <br>
  https://ganeshshejul.github.io/watchonline

# Steps To Watch The Movies/Series

**Step 1:** First Search The Movie Name In Format "Movie/Series Name IMDB".

<img width="1280" alt="Screenshot 2024-08-26 at 6 41 13 PM" src="https://github.com/user-attachments/assets/2b717fb8-1474-47b7-98e1-ddca3d609251"><br>


**Step 2:** Open The IMDB Link Of Searched Movie/Series.


<img width="1280" alt="Screenshot 2024-08-26 at 6 41 27 PM" src="https://github.com/user-attachments/assets/e36a7038-bf9b-4596-8759-1a8a7f82d8dc"><br>


**Step 3:** Copy the IMDB ID(For Eg "tt1187043") From The URL.


<img width="1280" alt="Screenshot 2024-08-26 at 6 41 43 PM" src="https://github.com/user-attachments/assets/39a467c4-afb1-43f3-adfe-fc6e20b5986d"><br>


**Step 4:** Go To The Website Demo Link.


<img width="1280" alt="Screenshot 2025-04-26 at 11 27 26 PM" src="https://github.com/user-attachments/assets/43635c70-b673-4cd4-9979-e70ef5094690" /><br>


**Step 5:** Paste The IMDB ID(For Eg "tt1187043") In The Box.


<img width="1280" alt="Screenshot 2025-04-26 at 11 28 11 PM" src="https://github.com/user-attachments/assets/72f7c8db-2ac3-40b6-80ab-7ba550bb2bf6" /><br>



**Step 6:** And Click On Play Button And Wait For 10-15 Seconds And You Will See The Movie Player.


<img width="1280" alt="Screenshot 2025-04-26 at 11 28 49 PM" src="https://github.com/user-attachments/assets/1a516bb0-78cf-4c83-adda-404268f266bb" /><br>


**Now You Can Enjoy The Movie/Series By Clicking On Play Button And Enlarge It To Full Screen.**






