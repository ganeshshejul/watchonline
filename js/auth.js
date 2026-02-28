// Firebase Authentication Module
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.authStateListeners = [];
    this.init();
  }

  async init() {
    // Wait for Firebase to be initialized
    if (typeof window.firebaseAuth === 'undefined') {
      setTimeout(() => this.init(), 100);
      return;
    }

    // Import Firebase Auth functions
    const {
      signInWithEmailAndPassword,
      createUserWithEmailAndPassword,
      signOut,
      onAuthStateChanged,
      GoogleAuthProvider,
      signInWithPopup,
      updateProfile,
      updateEmail,
      updatePassword,
      reauthenticateWithCredential,
      EmailAuthProvider,
      sendEmailVerification,
      reload,
    } = await import(
      'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'
    );

    this.signInWithEmailAndPassword = signInWithEmailAndPassword;
    this.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
    this.signOut = signOut;
    this.onAuthStateChanged = onAuthStateChanged;
    this.GoogleAuthProvider = GoogleAuthProvider;
    this.signInWithPopup = signInWithPopup;
    this.updateProfile = updateProfile;
    this.updateEmail = updateEmail;
    this.updatePassword = updatePassword;
    this.reauthenticateWithCredential = reauthenticateWithCredential;
    this.EmailAuthProvider = EmailAuthProvider;
    this.sendEmailVerification = sendEmailVerification;
    this.reload = reload;

    // OTP verification state
    this.pendingUser = null;
    this.resendTimer = null;
    this.resendCountdown = 60;

    this.setupAuthStateListener();
    this.setupEventListeners();
  }

  setupAuthStateListener() {
    this.onAuthStateChanged(window.firebaseAuth, user => {
      this.currentUser = user;
      this.updateUI(user);
      this.notifyAuthStateListeners(user);
    });
  }

  setupEventListeners() {
    // Modal controls
    document
      .getElementById('loginBtn')
      .addEventListener('click', () => this.showModal('loginModal'));
    document
      .getElementById('signupBtn')
      .addEventListener('click', () => this.showModal('signupModal'));

    // Close modal buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
      closeBtn.addEventListener('click', e => {
        this.hideModal(e.target.dataset.modal);
      });
    });

    // Modal switching
    document.getElementById('switchToSignup').addEventListener('click', e => {
      e.preventDefault();
      this.hideModal('loginModal');
      this.showModal('signupModal');
    });

    document.getElementById('switchToLogin').addEventListener('click', e => {
      e.preventDefault();
      this.hideModal('signupModal');
      this.showModal('loginModal');
    });

    // Form submissions
    document
      .getElementById('loginForm')
      .addEventListener('submit', e => this.handleLogin(e));
    document
      .getElementById('signupForm')
      .addEventListener('submit', e => this.handleSignup(e));

    // Google authentication
    document
      .getElementById('googleLoginBtn')
      .addEventListener('click', () => this.handleGoogleAuth());
    document
      .getElementById('googleSignupBtn')
      .addEventListener('click', () => this.handleGoogleAuth());

    // User profile dropdown
    document.querySelector('.user-info').addEventListener('click', () => {
      document.querySelector('.user-profile').classList.toggle('active');
    });

    // OTP verification modal events
    document
      .getElementById('resendVerificationBtn')
      .addEventListener('click', () => this.handleResendVerification());
    document
      .getElementById('checkVerificationBtn')
      .addEventListener('click', () => this.handleCheckVerification());

    // Password toggle functionality
    this.setupPasswordToggle();

    // Watch History
    document
      .getElementById('watchHistoryBtn')
      .addEventListener('click', () => this.showWatchHistory());

    // Edit Profile
    document
      .getElementById('editProfileBtn')
      .addEventListener('click', () => this.showEditProfile());

    // Logout
    document
      .getElementById('logoutBtn')
      .addEventListener('click', () => this.handleLogout());

    // Edit Profile form submission
    document
      .getElementById('editProfileForm')
      .addEventListener('submit', e => this.handleEditProfile(e));

    // Cancel edit profile
    document
      .getElementById('cancelEditBtn')
      .addEventListener('click', () => this.hideModal('editProfileModal'));

    // Watch History actions
    document
      .getElementById('clearHistoryBtn')
      .addEventListener('click', () => this.clearWatchHistory());

    document
      .getElementById('closeHistoryBtn')
      .addEventListener('click', () => this.hideModal('watchHistoryModal'));

    // Close modal when clicking outside
    window.addEventListener('click', e => {
      if (e.target.classList.contains('modal')) {
        this.hideModal(e.target.id);
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', e => {
      if (!e.target.closest('.user-profile')) {
        document.querySelector('.user-profile').classList.remove('active');
      }
    });
  }

  showModal(modalId) {
    document.getElementById(modalId).classList.add('show');
    this.clearErrors();
  }

  hideModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
    this.clearErrors();
  }

  clearErrors() {
    document.querySelectorAll('.error-message').forEach(error => {
      error.classList.remove('show');
      error.textContent = '';
    });
    document.querySelectorAll('.success-message').forEach(success => {
      success.classList.remove('show');
      success.textContent = '';
    });
  }

  showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }

  showSuccess(elementId, message) {
    const successElement = document.getElementById(elementId);
    successElement.textContent = message;
    successElement.classList.add('show');
  }

  clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.classList.remove('show');
    errorElement.textContent = '';
  }

  clearSuccess(elementId) {
    const successElement = document.getElementById(elementId);
    successElement.classList.remove('show');
    successElement.textContent = '';
  }

  setupPasswordToggle() {
    // Add event listeners to all password toggle buttons
    document.querySelectorAll('.password-toggle-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = button.getAttribute('data-target');
        const passwordInput = document.getElementById(targetId);
        const icon = button.querySelector('i');

        if (passwordInput.type === 'password') {
          // Show password
          passwordInput.type = 'text';
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash');
          button.setAttribute('aria-label', 'Hide password');
        } else {
          // Hide password
          passwordInput.type = 'password';
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
          button.setAttribute('aria-label', 'Show password');
        }
      });
    });
  }

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
      const userCredential = await this.signInWithEmailAndPassword(
        window.firebaseAuth,
        email,
        password
      );

      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        // Sign out the user and show verification modal
        await this.signOut(window.firebaseAuth);
        this.pendingUser = userCredential.user;
        this.hideModal('loginModal');
        this.showOTPVerificationModal(email);
        this.showError('otpError', 'Please verify your email before logging in.');
        return;
      }

      this.hideModal('loginModal');
    } catch (error) {
      this.showError('loginError', this.getErrorMessage(error.code));
    }
  }

  async handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
      this.showError('signupError', 'Passwords do not match');
      return;
    }

    try {
      // Create user account
      const userCredential = await this.createUserWithEmailAndPassword(
        window.firebaseAuth,
        email,
        password
      );

      // Update profile with display name
      await this.updateProfile(userCredential.user, { displayName: name });

      // Send email verification
      await this.sendEmailVerification(userCredential.user);

      // Store pending user for verification
      this.pendingUser = userCredential.user;

      // Hide signup modal and show OTP verification modal
      this.hideModal('signupModal');
      this.showOTPVerificationModal(email);

    } catch (error) {
      this.showError('signupError', this.getErrorMessage(error.code));
    }
  }

  async handleGoogleAuth() {
    try {
      const provider = new this.GoogleAuthProvider();
      await this.signInWithPopup(window.firebaseAuth, provider);
      this.hideModal('loginModal');
      this.hideModal('signupModal');
    } catch (error) {
      const errorId = document
        .getElementById('loginModal')
        .classList.contains('show')
        ? 'loginError'
        : 'signupError';
      this.showError(errorId, this.getErrorMessage(error.code));
    }
  }

  async handleLogout() {
    try {
      await this.signOut(window.firebaseAuth);
      document.querySelector('.user-profile').classList.remove('active');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // OTP Verification Methods
  showOTPVerificationModal(email) {
    document.getElementById('otpEmailDisplay').textContent = email;
    this.showModal('otpVerificationModal');
    this.startResendTimer();
    this.clearError('otpError');
    this.clearSuccess('otpSuccess');
  }

  async handleResendVerification() {
    if (!this.pendingUser) {
      this.showError('otpError', 'No pending verification found. Please sign up again.');
      return;
    }

    try {
      await this.sendEmailVerification(this.pendingUser);
      this.showSuccess('otpSuccess', 'Verification email sent successfully!');
      this.startResendTimer();
    } catch (error) {
      this.showError('otpError', this.getErrorMessage(error.code));
    }
  }

  async handleCheckVerification() {
    if (!this.pendingUser) {
      this.showError('otpError', 'No pending verification found. Please sign up again.');
      return;
    }

    try {
      // Reload user to get updated emailVerified status
      await this.reload(this.pendingUser);

      if (this.pendingUser.emailVerified) {
        this.showSuccess('otpSuccess', 'Email verified successfully! You can now log in.');
        this.pendingUser = null;
        this.stopResendTimer();

        // Hide OTP modal after a short delay
        setTimeout(() => {
          this.hideModal('otpVerificationModal');
          this.showModal('loginModal');
        }, 2000);
      } else {
        this.showError('otpError', 'Email not verified yet. Please check your email and click the verification link.');
      }
    } catch (error) {
      this.showError('otpError', this.getErrorMessage(error.code));
    }
  }

  startResendTimer() {
    const resendBtn = document.getElementById('resendVerificationBtn');
    const timerElement = document.getElementById('resendTimer');

    this.resendCountdown = 60;
    resendBtn.disabled = true;

    this.resendTimer = setInterval(() => {
      this.resendCountdown--;
      timerElement.textContent = this.resendCountdown;

      if (this.resendCountdown <= 0) {
        this.stopResendTimer();
      }
    }, 1000);
  }

  stopResendTimer() {
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
      this.resendTimer = null;
    }

    const resendBtn = document.getElementById('resendVerificationBtn');
    const timerElement = document.getElementById('resendTimer');

    resendBtn.disabled = false;
    timerElement.textContent = '60';
  }

  showEditProfile() {
    // Close the user dropdown
    document.querySelector('.user-profile').classList.remove('active');

    // Populate the form with current user data
    const user = this.currentUser;
    if (user) {
      document.getElementById('editDisplayName').value = user.displayName || '';
      document.getElementById('editEmail').value = user.email || '';

      // Clear password fields
      document.getElementById('editCurrentPassword').value = '';
      document.getElementById('editNewPassword').value = '';
      document.getElementById('editConfirmPassword').value = '';
    }

    this.showModal('editProfileModal');
  }

  async handleEditProfile(e) {
    e.preventDefault();

    const displayName = document.getElementById('editDisplayName').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const currentPassword = document.getElementById(
      'editCurrentPassword'
    ).value;
    const newPassword = document.getElementById('editNewPassword').value;
    const confirmPassword = document.getElementById(
      'editConfirmPassword'
    ).value;

    // Validation
    if (!displayName) {
      this.showError('editProfileError', 'Display name is required');
      return;
    }

    if (!email) {
      this.showError('editProfileError', 'Email is required');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      this.showError('editProfileError', 'New passwords do not match');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      this.showError(
        'editProfileError',
        'New password must be at least 6 characters'
      );
      return;
    }

    const user = this.currentUser;
    const emailChanged = email !== user.email;
    const passwordChanged = newPassword.length > 0;

    // If email or password is being changed, current password is required
    if ((emailChanged || passwordChanged) && !currentPassword) {
      this.showError(
        'editProfileError',
        'Current password is required to change email or password'
      );
      return;
    }

    try {
      // Re-authenticate if needed
      if (emailChanged || passwordChanged) {
        const credential = this.EmailAuthProvider.credential(
          user.email,
          currentPassword
        );
        await this.reauthenticateWithCredential(user, credential);
      }

      // Update display name
      if (displayName !== user.displayName) {
        await this.updateProfile(user, { displayName });
      }

      // Update email
      if (emailChanged) {
        await this.updateEmail(user, email);
      }

      // Update password
      if (passwordChanged) {
        await this.updatePassword(user, newPassword);
      }

      this.showSuccess('editProfileSuccess', 'Profile updated successfully!');

      // Clear password fields
      document.getElementById('editCurrentPassword').value = '';
      document.getElementById('editNewPassword').value = '';
      document.getElementById('editConfirmPassword').value = '';

      // Close modal after a delay
      setTimeout(() => {
        this.hideModal('editProfileModal');
      }, 2000);
    } catch (error) {
      this.showError('editProfileError', this.getErrorMessage(error.code));
    }
  }

  showWatchHistory() {
    // Close the user dropdown
    document.querySelector('.user-profile').classList.remove('active');

    // Load and display watch history
    this.loadWatchHistory();
    this.showModal('watchHistoryModal');
  }

  async loadWatchHistory() {
    const historyList = document.getElementById('watchHistoryList');
    const history = this.getWatchHistory();

    if (history.length === 0) {
      historyList.innerHTML = `
        <div class="empty-history">
          <i class="fas fa-film"></i>
          <h3>No Watch History Yet</h3>
          <p>Start watching movies and series to see your history here!</p>
        </div>
      `;
      document.getElementById('clearHistoryBtn').disabled = true;
    } else {
      // Show loading state
      historyList.innerHTML = `
        <div class="loading-history">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Loading watch history...</p>
        </div>
      `;

      // Fetch missing movie details and update history
      const updatedHistory = await this.updateHistoryWithDetails(history);

      // Display the updated history
      historyList.innerHTML = updatedHistory
        .map(item => this.createHistoryItem(item))
        .join('');
      document.getElementById('clearHistoryBtn').disabled = false;
    }
  }

  async updateHistoryWithDetails(history) {
    const userId = this.currentUser.uid;
    const storageKey = `watchHistory_${userId}`;
    let updated = false;

    const updatedHistory = await Promise.all(
      history.map(async item => {
        // If title is missing or is 'Unknown Title', try to fetch details
        if (!item.title || item.title === 'Unknown Title') {
          try {
            const movieData = await this.fetchMovieDetails(item.imdbId);
            updated = true;
            return {
              ...item,
              title: movieData.title,
              poster: movieData.poster,
              year: movieData.year,
              genre: movieData.genre,
            };
          } catch (error) {
            console.log(`Could not fetch details for ${item.imdbId}:`, error);
            return {
              ...item,
              title: item.title || 'Unknown Title',
            };
          }
        }
        return item;
      })
    );

    // Save updated history if any changes were made
    if (updated) {
      localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
    }

    return updatedHistory;
  }

  createHistoryItem(item) {
    const date = new Date(item.watchedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const title = item.title || 'Unknown Title';
    const year = item.year ? ` (${item.year})` : '';
    const displayTitle = `${title}${year}`;

    return `
      <div class="history-item" onclick="window.authManager.replayMovie('${item.imdbId}', '${item.type}')" title="Click to watch again">
        <div class="history-poster">
          ${
            item.poster
              ? `<img src="${item.poster}" alt="${title}" onerror="this.parentElement.innerHTML='<i class=\\"fas fa-film\\"></i>'">`
              : '<i class="fas fa-film"></i>'
          }
          <div class="play-overlay">
            <i class="fas fa-play"></i>
          </div>
        </div>
        <div class="history-details">
          <div class="history-title">${displayTitle}</div>
          <div class="history-meta">
            <div class="history-imdb">IMDb: ${item.imdbId}</div>
            ${item.genre ? `<div class="history-genre">${item.genre}</div>` : ''}
            <div class="history-date">Watched: ${date}</div>
            <span class="history-type">${this.getTypeDisplayName(item.type)}</span>
          </div>
        </div>
      </div>
    `;
  }

  getTypeDisplayName(type) {
    switch (type) {
      case 'all':
        return 'Movie/Series';
      case 'movies':
        return 'Movie';
      case 'series':
        return 'Series';
      case 'movie':
        return 'Movie';
      default:
        return type;
    }
  }

  async addToWatchHistory(imdbId, type, title = null, poster = null, year = null) {
    console.log('addToWatchHistory called with:', { imdbId, type, title, poster, year });

    if (!this.currentUser) {
      console.log('No current user, cannot add to watch history');
      return;
    }

    const userId = this.currentUser.uid;
    const storageKey = `watchHistory_${userId}`;
    let history = JSON.parse(localStorage.getItem(storageKey) || '[]');

    console.log('Current history length:', history.length);

    // Remove existing entry if it exists
    history = history.filter(item => item.imdbId !== imdbId);

    // If title and poster are not provided or are null, fetch from OMDb API
    if (!title || !poster || title === null || poster === null) {
      console.log('Fetching movie details for:', imdbId, 'Current data:', { title, poster, year });
      try {
        const movieData = await this.fetchMovieDetails(imdbId);
        title = title || movieData.title;
        poster = poster || movieData.poster;
        year = year || movieData.year;
        console.log('Fetched movie data:', movieData);
        console.log('Final data after fetch:', { title, poster, year });
      } catch (error) {
        console.log('Could not fetch movie details:', error);
        title = title || 'Unknown Title';
        poster = poster || null;
        year = year || 'Unknown';
      }
    } else {
      console.log('Using provided movie data:', { title, poster, year });
    }

    const newEntry = {
      imdbId,
      type,
      title,
      poster,
      year: year || 'Unknown',
      watchedAt: new Date().toISOString(),
    };

    console.log('Adding new entry:', newEntry);

    // Add new entry at the beginning
    history.unshift(newEntry);

    // Keep only last 50 items
    history = history.slice(0, 50);

    localStorage.setItem(storageKey, JSON.stringify(history));
    console.log('Watch history saved. New length:', history.length);
  }

  async fetchMovieDetails(imdbId) {
    // Using OMDb API (free tier allows 1000 requests per day)
    const apiKey = '8265bd1c'; // Free API key for demo purposes
    const response = await fetch(
      `https://www.omdbapi.com/?i=${imdbId}&apikey=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch movie details');
    }

    const data = await response.json();

    if (data.Response === 'False') {
      throw new Error(data.Error || 'Movie not found');
    }

    return {
      title: data.Title,
      poster: data.Poster !== 'N/A' ? data.Poster : null,
      year: data.Year,
      type: data.Type?.toLowerCase() === 'series' ? 'series' : 'movie',
      genre: data.Genre,
      plot: data.Plot,
    };
  }

  getWatchHistory() {
    if (!this.currentUser) return [];

    const userId = this.currentUser.uid;
    const storageKey = `watchHistory_${userId}`;
    return JSON.parse(localStorage.getItem(storageKey) || '[]');
  }

  clearWatchHistory() {
    if (!this.currentUser) return;

    if (
      confirm(
        'Are you sure you want to clear all watch history? This action cannot be undone.'
      )
    ) {
      const userId = this.currentUser.uid;
      const storageKey = `watchHistory_${userId}`;
      localStorage.removeItem(storageKey);
      this.loadWatchHistory();
    }
  }

  async replayMovie(imdbId, type) {
    console.log('🎬 Replaying movie from watch history:', { imdbId, type });

    // Close the watch history modal
    this.hideModal('watchHistoryModal');

    // Set the correct tab FIRST (this will clear the input fields)
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(btn => btn.classList.remove('active'));

    let targetTab = 'all';
    if (type === 'movie') targetTab = 'movies';
    if (type === 'series') targetTab = 'series';

    const targetButton = document.querySelector(`[data-tab="${targetTab}"]`);
    if (targetButton) {
      targetButton.classList.add('active');
      // Trigger the tab change event (this clears input fields)
      targetButton.click();
    }

    // Wait a moment for the tab change to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Get movie details from watch history item
    const historyItem = this.getWatchHistory().find(item => item.imdbId === imdbId);
    const movieTitle = historyItem ? historyItem.title : null;

    console.log('🎬 Found history item:', historyItem);

    // NOW set the search field and trigger search (if we have the title)
    const searchInput = document.getElementById('searchInput');
    if (movieTitle && movieTitle !== 'Unknown Title' && searchInput) {
      console.log('🔍 Setting search input and triggering search for:', movieTitle);
      searchInput.value = movieTitle;

      // Show clear button
      const clearBtn = document.getElementById('clearSearchBtn');
      if (clearBtn) {
        clearBtn.style.display = 'flex';
      }

      // Trigger search functionality if available
      if (window.movieSearch) {
        console.log('🔍 Triggering movie search...');
        // Simulate user input to trigger search
        const inputEvent = new Event('input', { bubbles: true });
        searchInput.dispatchEvent(inputEvent);

        // Wait for search to complete and try to auto-select matching result
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Try to auto-select the matching result from search dropdown
        this.autoSelectSearchResult(imdbId, movieTitle);
      }
    }

    // Set the IMDb ID in the input field
    const imdbInput = document.getElementById('imdbInput');
    console.log('🔍 IMDB Input element:', imdbInput);

    if (!imdbInput) {
      console.error('❌ IMDB Input element not found!');
      alert('Error: IMDB input field not found. Please refresh the page.');
      return;
    }

    imdbInput.value = imdbId;
    console.log('✅ IMDB ID set to:', imdbInput.value);

    // Ensure movie data is stored from history item
    if (historyItem && (!window.selectedMovieData || window.selectedMovieData.imdbID !== imdbId)) {
      console.log('💾 Storing movie data from history item...');
      window.selectedMovieData = {
        title: historyItem.title,
        poster: historyItem.poster,
        year: historyItem.year,
        type: historyItem.type || (type === 'series' ? 'series' : 'movie'),
        imdbID: imdbId
      };
      console.log('✅ Movie data stored:', window.selectedMovieData);
    }

    // Scroll to the player section
    document.querySelector('.player-section').scrollIntoView({
      behavior: 'smooth',
    });

    // Show loading feedback
    const playButton = document.getElementById('playButton');
    const originalText = playButton.innerHTML;
    playButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Starting Playback...';
    playButton.disabled = true;

    try {
      // Wait a moment for the DOM to update and auto-fetch to complete
      await new Promise(resolve => setTimeout(resolve, 300));

      // Fetch movie details if not already available
      if (!window.selectedMovieData || window.selectedMovieData.imdbID !== imdbId) {
        console.log('🔍 Fetching movie details for replay...');

        try {
          const movieData = await this.fetchMovieDetails(imdbId);
          if (movieData) {
            window.selectedMovieData = {
              title: movieData.title,
              poster: movieData.poster,
              year: movieData.year,
              type: type === 'series' ? 'series' : 'movie', // Use the type from watch history
              imdbID: imdbId
            };

            // Update search input with movie title
            document.getElementById('searchInput').value = `${movieData.title} (${movieData.year})`;
            console.log('✅ Movie data fetched and stored for replay');
          }
        } catch (error) {
          console.warn('⚠️ Could not fetch movie details for replay:', error);
        }
      }

      // Restore button state
      playButton.innerHTML = originalText;
      playButton.disabled = false;

      // Automatically trigger the play button
      console.log('🎯 Triggering automatic playback...');

      // Add a small delay to ensure everything is ready
      setTimeout(() => {
        playButton.click();
        console.log('✅ Play button clicked automatically');
      }, 100);

    } catch (error) {
      console.error('❌ Error during replay setup:', error);

      // Restore button state on error
      playButton.innerHTML = originalText;
      playButton.disabled = false;

      // Show error message
      alert('Error starting playback. Please try clicking the play button manually.');
    }
  }

  updateUI(user) {
    const authButtons = document.getElementById('auth-buttons');
    const userProfile = document.getElementById('user-profile');

    if (user) {
      // User is logged in
      authButtons.style.display = 'none';
      userProfile.style.display = 'block';

      // Update user info
      const userName = document.getElementById('userName');
      const userAvatar = document.getElementById('userAvatar');

      userName.textContent = user.displayName || user.email.split('@')[0];
      userAvatar.src =
        user.photoURL ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=7b68ee&color=fff`;
    } else {
      // User is not logged in
      authButtons.style.display = 'flex';
      userProfile.style.display = 'none';
    }
  }

  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/too-many-requests':
        'Too many failed attempts. Please try again later.',
      'auth/popup-closed-by-user': 'Sign-in was cancelled.',
      'auth/cancelled-popup-request': 'Sign-in was cancelled.',
      'auth/popup-blocked': 'Pop-up was blocked by the browser.',
      'auth/requires-recent-login':
        'This operation requires recent authentication. Please log out and log back in.',
      'auth/invalid-credential': 'The current password is incorrect.',
      'auth/credential-already-in-use':
        'This email is already associated with another account.',
      'auth/operation-not-allowed': 'This operation is not allowed.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/email-not-verified': 'Please verify your email before logging in.',
      'auth/too-many-requests': 'Too many verification emails sent. Please wait before requesting another.',
    };

    return errorMessages[errorCode] || 'An error occurred. Please try again.';
  }

  // Public methods for other modules
  onAuthStateChange(callback) {
    this.authStateListeners.push(callback);
    // Call immediately with current state
    if (this.currentUser !== null) {
      callback(this.currentUser);
    }
  }

  notifyAuthStateListeners(user) {
    this.authStateListeners.forEach(callback => callback(user));
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  // Test method to add sample data to watch history
  async addTestWatchHistory() {
    if (!this.currentUser) {
      console.log('User not logged in');
      return;
    }

    console.log('Adding test watch history...');

    // Add some test movies
    await this.addToWatchHistory('tt0111161', 'movie'); // The Shawshank Redemption
    await this.addToWatchHistory('tt0068646', 'movie'); // The Godfather
    await this.addToWatchHistory('tt0468569', 'movie'); // The Dark Knight

    console.log('Test watch history added!');
  }

  // Test method to test replay functionality
  testReplay() {
    console.log('🧪 Testing replay functionality...');
    this.replayMovie('tt0111161', 'movie');
  }

  // Test method to verify IMDB input setting
  testImdbInput() {
    console.log('🧪 Testing IMDB input setting...');
    const imdbInput = document.getElementById('imdbInput');
    console.log('Input element:', imdbInput);
    imdbInput.value = 'tt0111161';
    console.log('Value set to:', imdbInput.value);
  }

  // Helper method to auto-select matching search result
  autoSelectSearchResult(targetImdbId, movieTitle) {
    console.log('🎯 Trying to auto-select search result for:', targetImdbId, movieTitle);

    // Check if search dropdown is visible and has results
    const dropdown = document.getElementById('searchDropdown');
    if (!dropdown || dropdown.style.display === 'none') {
      console.log('⚠️ Search dropdown not visible');
      return;
    }

    // Look for search results
    const searchResults = dropdown.querySelectorAll('.search-result');
    if (searchResults.length === 0) {
      console.log('⚠️ No search results found');
      return;
    }

    // Try to find a result that matches the IMDB ID
    let matchingResult = null;
    searchResults.forEach((resultElement, index) => {
      const imdbId = resultElement.dataset.imdbId;
      if (imdbId === targetImdbId) {
        matchingResult = { element: resultElement, index };
        console.log('✅ Found exact IMDB ID match at index:', index);
      }
    });

    // If no exact IMDB match, try to find by title similarity
    if (!matchingResult && window.movieSearch && window.movieSearch.currentResults) {
      const results = window.movieSearch.currentResults;
      const matchIndex = results.findIndex(result =>
        result.imdbID === targetImdbId ||
        (result.Title && movieTitle && result.Title.toLowerCase().includes(movieTitle.toLowerCase()))
      );

      if (matchIndex >= 0 && searchResults[matchIndex]) {
        matchingResult = { element: searchResults[matchIndex], index: matchIndex };
        console.log('✅ Found title similarity match at index:', matchIndex);
      }
    }

    // Auto-select the matching result
    if (matchingResult && window.movieSearch) {
      console.log('🎯 Auto-selecting search result...');
      const movieData = window.movieSearch.currentResults[matchingResult.index];
      if (movieData) {
        window.movieSearch.selectResult(movieData);
        console.log('✅ Auto-selected movie:', movieData.Title);
      }
    } else {
      console.log('⚠️ No matching search result found for auto-selection');
    }
  }
}

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.authManager = new AuthManager();
});

// Global test functions for browser console
window.testReplay = function(imdbId = 'tt0111161', type = 'movie') {
  console.log('🧪 Testing replay functionality from console...');
  if (window.authManager) {
    window.authManager.replayMovie(imdbId, type);
  } else {
    console.error('AuthManager not available');
  }
};

window.testImdbInput = function() {
  console.log('🧪 Testing IMDB input from console...');
  const imdbInput = document.getElementById('imdbInput');
  console.log('Input element:', imdbInput);
  if (imdbInput) {
    imdbInput.value = 'tt0111161';
    console.log('Value set to:', imdbInput.value);
  } else {
    console.error('IMDB input not found');
  }
};

window.testSearchIntegration = function(movieTitle = 'The Shawshank Redemption') {
  console.log('🧪 Testing search integration from console...');
  const searchInput = document.getElementById('searchInput');
  if (searchInput && window.movieSearch) {
    searchInput.value = movieTitle;
    const inputEvent = new Event('input', { bubbles: true });
    searchInput.dispatchEvent(inputEvent);
    console.log('✅ Search triggered for:', movieTitle);
  } else {
    console.error('Search input or movieSearch not available');
  }
};
