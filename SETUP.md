# Setup and Build Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd watchonline
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Firebase credentials:
   ```env
   FIREBASE_API_KEY=your_actual_api_key
   FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   The app will open at `http://localhost:3000`

---

## 📦 Available Commands

### Development
```bash
npm run dev
```
- Starts Vite development server
- Hot Module Replacement (HMR) enabled
- Opens browser automatically
- Runs on port 3000

### Build for Production
```bash
npm run build
```
- Creates optimized production build in `dist/` folder
- Minifies JavaScript and CSS
- Tree-shakes unused code
- Removes console.log statements
- Generates source maps (if enabled)

### Preview Production Build
```bash
npm run preview
```
- Serves the production build locally
- Test the built app before deployment
- Runs on port 4173 by default

### Serve Production Build
```bash
npm run serve
```
- Alternative preview command
- Runs on port 8080

---

## 🛠️ Build Configuration

### Vite Configuration (`vite.config.js`)

The project uses Vite for:
- **Fast dev server** with instant HMR
- **Optimized builds** with Rollup
- **Environment variable injection**
- **Code splitting** for Firebase modules
- **Asset optimization** (images, CSS, JS)

Key features:
- ✅ Automatic environment variable loading
- ✅ Console removal in production
- ✅ Manual code splitting for Firebase
- ✅ Organized output structure (css/, img/, js/)
- ✅ Terser minification

### Environment Variables

Environment variables are loaded automatically:
- Development: from `.env` file (not committed)
- Production: injected at build time

The `env-loader.js` provides compatibility for both Vite and non-Vite environments.

---

## 📁 Project Structure

```
watchonline/
├── index.html              # Entry point
├── package.json            # Dependencies & scripts
├── vite.config.js          # Vite configuration
├── .env                    # Environment variables (not committed)
├── .env.example            # Template for .env
├── css/
│   ├── normalize.min.css
│   ├── style.css
│   └── style.min.css
├── js/
│   ├── auth.js            # Authentication logic
│   ├── config.js          # Firebase config
│   ├── env-loader.js      # Environment loader
│   ├── main.js            # Main application
│   ├── recommendations.js
│   ├── room.js
│   ├── search.js
│   └── *.js               # Other modules
└── img/                   # Images and assets
```

---

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify
1. Build the project: `npm run build`
2. Deploy the `dist/` folder
3. Add environment variables in Netlify dashboard
4. Set build command: `npm run build`
5. Set publish directory: `dist`

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Add environment variables in Vercel dashboard
4. Build command: `npm run build`
5. Output directory: `dist`

### Deploy to GitHub Pages
1. Build: `npm run build`
2. Push `dist/` folder to `gh-pages` branch
3. Or use GitHub Actions for automatic deployment

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

---

## 🔧 Troubleshooting

### Environment Variables Not Loading
- Ensure `.env` file exists (copy from `.env.example`)
- Check that variables start with `FIREBASE_` (not `VITE_FIREBASE_`)
- Restart dev server after changing `.env`

### Build Fails
- Clear node_modules: `rm -rf node_modules package-lock.json && npm install`
- Check Node version: `node --version` (should be v18+)
- Check for syntax errors in JS files

### Port Already in Use
- Stop other dev servers
- Or change port in `vite.config.js`:
  ```js
  server: {
    port: 3001, // Change to any available port
  }
  ```

### Firebase Not Working
- Verify Firebase credentials in `.env`
- Check Firebase console for project settings
- Ensure Firebase Auth is enabled in console

---

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Deploy to Netlify](https://docs.netlify.com/)
- [Deploy to Vercel](https://vercel.com/docs)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npm run build` and `npm run preview`
5. Submit a pull request

---

## 📝 Notes

- The `.env` file is gitignored and should never be committed
- Production builds remove all console logs
- Firebase modules are code-split for optimal loading
- Development server supports HMR for instant updates
