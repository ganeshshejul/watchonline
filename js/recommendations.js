/**
 * AI-Powered Movie and Series Recommendation System
 * Provides intelligent suggestions based on genres, user preferences, and viewing history
 */

class AIRecommendationEngine {
  constructor() {
    // Multiple movie APIs for diverse content
    this.movieAPIs = {
      primary: 'https://imdb.iamidiotareyoutoo.com/search',
      sampleMovies: 'https://api.sampleapis.com/movies',
      jsonMovies: 'https://my-json-server.typicode.com/horizon-code-academy/fake-movies-api/movies'
    };

    // Current API for rotation
    this.currentAPI = this.movieAPIs.primary;
    this.freeMovieAPI = this.movieAPIs.primary;
    this.apiIndex = 0;

    // OMDb keys for metadata enrichment (accurate genre/year/rating/poster)
    this.omdbKeys = [
      window.ENV?.OMDB_API_KEY,
      window.ENV?.VITE_OMDB_API_KEY,
      'thewdb',
      'trilogy',
      '564727fa',
    ].filter(Boolean);

    this.genres = [
      'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime',
      'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror',
      'Music', 'Mystery', 'Romance', 'Sci-Fi', 'Sport', 'Thriller', 'War', 'Western'
    ];
    
    this.popularMovies = [
      'tt0111161', 'tt0068646', 'tt0071562', 'tt0468569', 'tt0050083',
      'tt0108052', 'tt0167260', 'tt0110912', 'tt0060196', 'tt0137523',
      'tt0120737', 'tt0109830', 'tt1375666', 'tt0080684', 'tt0167261',
      'tt0073486', 'tt0099685', 'tt0133093', 'tt0047478', 'tt0114369'
    ];
    
    this.popularSeries = [
      'tt0903747', 'tt0944947', 'tt1475582', 'tt2356777', 'tt0141842',
      'tt0306414', 'tt1520211', 'tt0386676', 'tt2467372', 'tt0460649',
      'tt1439629', 'tt0773262', 'tt1856010', 'tt0417299', 'tt0804503'
    ];
    
    this.userPreferences = this.loadUserPreferences();
    this.isLoading = false;
  }

  /**
   * Rotate to next API for load balancing and diversity
   */
  rotateAPI() {
    const apiKeys = Object.keys(this.movieAPIs);
    this.apiIndex = (this.apiIndex + 1) % apiKeys.length;
    this.currentAPI = this.movieAPIs[apiKeys[this.apiIndex]];
    console.log(`🔄 Rotated to API: ${apiKeys[this.apiIndex]}`);
  }

  /**
   * Get current API with automatic rotation
   */
  getCurrentAPI() {
    // Rotate API every few calls for diversity
    if (Math.random() < 0.3) {
      this.rotateAPI();
    }
    return this.currentAPI;
  }

  /**
   * Load user preferences from localStorage
   */
  loadUserPreferences() {
    const currentUser = window.authManager?.currentUser;
    if (!currentUser) return { genres: {}, watchedGenres: {}, totalWatched: 0 };
    
    const key = `userPreferences_${currentUser.uid}`;
    const saved = localStorage.getItem(key);
    
    if (saved) {
      return JSON.parse(saved);
    }
    
    return { genres: {}, watchedGenres: {}, totalWatched: 0 };
  }

  /**
   * Save user preferences to localStorage
   */
  saveUserPreferences() {
    const currentUser = window.authManager?.currentUser;
    if (!currentUser) return;
    
    const key = `userPreferences_${currentUser.uid}`;
    localStorage.setItem(key, JSON.stringify(this.userPreferences));
  }

  /**
   * Update user preferences based on watch history
   */
  updateUserPreferences() {
    const watchHistory = window.authManager?.getWatchHistory() || [];
    const preferences = { genres: {}, watchedGenres: {}, totalWatched: watchHistory.length };
    
    watchHistory.forEach(item => {
      if (item.genre) {
        const genres = item.genre.split(',').map(g => g.trim());
        genres.forEach(genre => {
          const normalizedGenre = this.normalizeGenre(genre);
          preferences.watchedGenres[normalizedGenre] = (preferences.watchedGenres[normalizedGenre] || 0) + 1;
          preferences.genres[normalizedGenre] = Math.min(10, (preferences.genres[normalizedGenre] || 0) + 1);
        });
      }
    });
    
    this.userPreferences = preferences;
    this.saveUserPreferences();
  }

  normalizeGenre(genre) {
    if (!genre) return '';
    const text = genre.toLowerCase().trim();
    const map = {
      'science fiction': 'Sci-Fi',
      'sci-fi': 'Sci-Fi',
      'scifi': 'Sci-Fi',
      'tv movie': 'Drama'
    };

    if (map[text]) return map[text];
    return genre
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .replace('Sci Fi', 'Sci-Fi');
  }

  extractNumericYear(yearValue) {
    if (!yearValue) return null;
    const match = String(yearValue).match(/\d{4}/);
    return match ? parseInt(match[0], 10) : null;
  }

  getItemGenres(item) {
    if (!item?.Genre) return [];
    return item.Genre.split(',')
      .map(genre => this.normalizeGenre(genre))
      .filter(Boolean);
  }

  getGenreOverlapScore(item, selectedGenres = []) {
    if (!selectedGenres.length) return 0;

    const selected = selectedGenres.map(genre => this.normalizeGenre(genre).toLowerCase());
    const itemGenres = this.getItemGenres(item).map(genre => genre.toLowerCase());
    if (!itemGenres.length) return 0;

    const matches = itemGenres.filter(genre => selected.includes(genre));
    return matches.length / selected.length;
  }

  filterBySelectedGenresStrict(items, selectedGenres = []) {
    if (!selectedGenres.length) return items;
    const strictMatches = items.filter(item => this.getGenreOverlapScore(item, selectedGenres) > 0);
    return strictMatches.length > 0 ? strictMatches : items;
  }

  applyLatestContentBlend(sortedItems, limit) {
    if (!sortedItems.length) return [];

    const currentYear = new Date().getFullYear();
    const latestPool = sortedItems.filter(item => {
      const year = this.extractNumericYear(item.Year);
      return year && year >= currentYear - 2;
    });

    const latestQuota = Math.min(Math.ceil(limit * 0.35), latestPool.length);
    const latestSet = latestPool.slice(0, latestQuota);

    const latestIds = new Set(latestSet.map(item => item.imdbID || `${item.Title}-${item.Year}`));
    const rest = sortedItems.filter(item => !latestIds.has(item.imdbID || `${item.Title}-${item.Year}`));

    return [...latestSet, ...rest].slice(0, limit);
  }

  async fetchOMDbDetails(imdbId) {
    if (!imdbId || !this.omdbKeys.length) return null;

    for (const key of this.omdbKeys) {
      try {
        const response = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${key}`);
        if (!response.ok) continue;
        const data = await response.json();

        if (data.Response === 'True') {
          return {
            Title: data.Title || null,
            Year: data.Year || null,
            imdbID: data.imdbID || imdbId,
            Type: data.Type || null,
            Poster: data.Poster && data.Poster !== 'N/A' ? data.Poster : null,
            Genre: data.Genre || null,
            Language: data.Language || null,
            Country: data.Country || null,
            imdbRating: data.imdbRating && data.imdbRating !== 'N/A' ? data.imdbRating : null,
            Plot: data.Plot && data.Plot !== 'N/A' ? data.Plot : null,
            Director: data.Director && data.Director !== 'N/A' ? data.Director : null,
            Actors: data.Actors && data.Actors !== 'N/A' ? data.Actors : null,
            Runtime: data.Runtime && data.Runtime !== 'N/A' ? data.Runtime : null,
          };
        }
      } catch (error) {
        console.warn(`⚠️ OMDb enrichment failed for key ${key}:`, error.message);
      }
    }

    return null;
  }

  async enrichRecommendationsWithOMDb(items) {
    const maxEnrichment = Math.min(items.length, 30);
    const enriched = [];

    for (let index = 0; index < maxEnrichment; index++) {
      const item = items[index];
      const omdbData = await this.fetchOMDbDetails(item.imdbID);

      if (omdbData) {
        enriched.push({
          ...item,
          ...Object.fromEntries(
            Object.entries(omdbData).filter(([, value]) => value !== null && value !== undefined)
          ),
        });
      } else {
        enriched.push(item);
      }
    }

    if (items.length > maxEnrichment) {
      enriched.push(...items.slice(maxEnrichment));
    }

    return enriched;
  }

  /**
   * Calculate AI-powered recommendation score for a movie/series
   */
  calculateAIScore(item, userGenres, selectedGenres = []) {
    let score = 0;

    // 1) Selected genre relevance (highest weight)
    const overlap = this.getGenreOverlapScore(item, selectedGenres);
    score += overlap * 45;

    // 2) User preference match
    const itemGenres = this.getItemGenres(item);
    let preferenceScore = 0;
    itemGenres.forEach(genre => {
      if (userGenres[genre]) {
        preferenceScore += Math.min(5, userGenres[genre]);
      }
    });
    score += Math.min(25, preferenceScore * 1.2);

    // 3) Freshness / recency
    const currentYear = new Date().getFullYear();
    const year = this.extractNumericYear(item.Year);
    if (year) {
      const yearDiff = currentYear - year;
      if (yearDiff <= 1) score += 20;
      else if (yearDiff <= 3) score += 15;
      else if (yearDiff <= 5) score += 10;
      else if (yearDiff <= 10) score += 5;
      else if (yearDiff > 25) score -= 5;
    }

    // 4) IMDb rating quality
    if (item.imdbRating && !isNaN(item.imdbRating)) {
      const rating = parseFloat(item.imdbRating);
      score += Math.max(0, Math.min(10, (rating - 5.5) * 2.2));
    }

    // Penalty when user selected genres but item has no overlap
    if (selectedGenres.length > 0 && overlap === 0) {
      score -= 30;
    }

    return Math.max(0, Number(score.toFixed(2)));
  }

  /**
   * Get AI-powered recommendations based on selected genres and language
   */
  async getRecommendations(selectedGenres = [], type = 'all', limit = 12, language = 'all') {
    if (this.isLoading) {
      console.log('⏳ Already loading recommendations...');
      return [];
    }

    this.isLoading = true;
    this.showLoadingState();

    try {
      console.log('🤖 AI Recommendation Engine: Generating recommendations...');
      console.log('📊 Selected genres:', selectedGenres);
      console.log('🎯 Content type:', type);
      console.log('🌐 Language:', language);
      console.log('🔢 Limit:', limit);

      // Update user preferences from watch history
      this.updateUserPreferences();
      console.log('👤 User preferences:', this.userPreferences);

      let recommendations = [];

      // Primary automated engine: OMDb keyword + year retrieval (latest + accurate metadata)
      const automatedRecommendations = await this.getAdvancedOMDbRecommendations(
        selectedGenres,
        type,
        limit,
        language
      );
      recommendations = [...automatedRecommendations];

      // Get recommendations from multiple sources based on language preference
      const sources = this.getRecommendationSources(selectedGenres, type, limit, language);

      // Add random discovery source for more diversity
      sources.push({
        name: 'Random Discovery',
        fn: () => this.getRandomDiscoveryRecommendations(type, Math.ceil(limit * 0.1))
      });

      for (const source of sources) {
        if (recommendations.length >= limit * 3) break;
        try {
          console.log(`🔄 Getting ${source.name} recommendations...`);
          const items = await source.fn();
          console.log(`✅ ${source.name} returned ${items.length} items`);
          recommendations = [...recommendations, ...items];
        } catch (error) {
          console.warn(`❌ ${source.name} recommendation source failed:`, error);
        }
      }

      console.log(`📋 Total recommendations before processing: ${recommendations.length}`);

      if (recommendations.length === 0) {
        console.warn('⚠️ No recommendations found from any source, using fallback');
        // Use fallback recommendations
        recommendations = await this.getFallbackRecommendations(type, limit, selectedGenres, language);
      }

      // Remove duplicates and apply AI scoring
      const uniqueRecommendations = this.removeDuplicates(recommendations);
      console.log(`🔄 Unique recommendations: ${uniqueRecommendations.length}`);

      // Enrich metadata for accuracy (real genre/year/rating/poster)
      const enrichedRecommendations = await this.enrichRecommendationsWithOMDb(uniqueRecommendations);

      // Strict selected-genre filtering for better relevance
      const filteredRecommendations = this.filterBySelectedGenresStrict(
        enrichedRecommendations,
        selectedGenres
      );

      const scoredRecommendations = filteredRecommendations.map(item => ({
        ...item,
        aiScore: this.calculateAIScore(item, this.userPreferences.genres, selectedGenres)
      }));

      // Sort by AI score and limit results
      const sortedRecommendations = scoredRecommendations
        .sort((a, b) => b.aiScore - a.aiScore);

      const finalRecommendations = this.applyLatestContentBlend(sortedRecommendations, limit);

      console.log(`🎯 Final recommendations: ${finalRecommendations.length}`);
      console.log('📊 Top recommendations:', finalRecommendations.slice(0, 3).map(r => ({ title: r.Title, score: r.aiScore })));

      return finalRecommendations;

    } catch (error) {
      console.error('❌ AI Recommendation Engine error:', error);
      return [];
    } finally {
      this.isLoading = false;
      this.hideLoadingState();
    }
  }

  mapTypeForOMDb(type) {
    if (type === 'movies') return 'movie';
    if (type === 'series') return 'series';
    return '';
  }

  getAutomatedQueryTerms(selectedGenres = [], language = 'all') {
    const genreTermMap = {
      Action: ['action', 'adventure', 'mission'],
      Adventure: ['adventure', 'quest', 'expedition'],
      Animation: ['animation', 'animated', 'pixar'],
      Biography: ['biography', 'biopic', 'true story'],
      Comedy: ['comedy', 'funny', 'humor'],
      Crime: ['crime', 'detective', 'mafia'],
      Documentary: ['documentary', 'docu', 'real story'],
      Drama: ['drama', 'emotional', 'family'],
      Family: ['family', 'kids', 'children'],
      Fantasy: ['fantasy', 'magic', 'mythology'],
      History: ['history', 'period', 'historical'],
      Horror: ['horror', 'scary', 'haunted'],
      Music: ['music', 'musical', 'band'],
      Mystery: ['mystery', 'investigation', 'suspense'],
      Romance: ['romance', 'love', 'relationship'],
      'Sci-Fi': ['sci-fi', 'science fiction', 'future'],
      Sport: ['sports', 'athlete', 'tournament'],
      Thriller: ['thriller', 'psychological thriller', 'suspense'],
      War: ['war', 'military', 'battle'],
      Western: ['western', 'cowboy', 'frontier'],
    };

    let terms = [];
    if (selectedGenres.length > 0) {
      selectedGenres.forEach(genre => {
        const normalized = this.normalizeGenre(genre);
        terms.push(...(genreTermMap[normalized] || [normalized.toLowerCase()]));
      });
    } else {
      terms = ['popular', 'trending', 'top rated', 'new release'];
    }

    if (language === 'hindi') {
      terms.push('bollywood', 'hindi movie', 'indian cinema');
    } else if (language === 'english') {
      terms.push('hollywood', 'english movie');
    }

    return [...new Set(terms)].slice(0, 12);
  }

  isLanguageMatch(item, language = 'all') {
    if (language === 'all') return true;

    const itemLanguage = String(item.Language || '').toLowerCase();
    if (language === 'hindi') {
      return itemLanguage.includes('hindi') || this.isLikelyHindiContent(item);
    }

    if (language === 'english') {
      return itemLanguage.includes('english') && !this.isLikelyHindiContent(item);
    }

    return true;
  }

  async searchOMDbByTerm(term, type, year, pageLimit = 1) {
    const omdbType = this.mapTypeForOMDb(type);

    for (const key of this.omdbKeys) {
      try {
        const collected = [];
        for (let page = 1; page <= pageLimit; page++) {
          const params = new URLSearchParams({
            s: term,
            apikey: key,
            page: String(page),
          });

          if (omdbType) params.set('type', omdbType);
          if (year) params.set('y', String(year));

          const url = `https://www.omdbapi.com/?${params.toString()}`;
          const response = await fetch(url);
          if (!response.ok) break;

          const data = await response.json();
          if (data.Response !== 'True' || !Array.isArray(data.Search)) break;

          collected.push(...data.Search);
          if (data.Search.length < 10) break;
        }

        if (collected.length > 0) return collected;
      } catch (error) {
        console.warn(`⚠️ OMDb search failed for term "${term}" with key ${key}:`, error.message);
      }
    }

    return [];
  }

  async getAdvancedOMDbRecommendations(selectedGenres = [], type = 'all', limit = 12, language = 'all') {
    console.log('🧠 Running advanced automated recommendation retrieval...');

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 7 }, (_, index) => currentYear - index);
    const terms = this.getAutomatedQueryTerms(selectedGenres, language);
    const targetPoolSize = Math.max(limit * 4, 36);

    const rawCandidates = [];

    for (const year of years) {
      if (rawCandidates.length >= targetPoolSize) break;

      for (const term of terms) {
        if (rawCandidates.length >= targetPoolSize) break;

        const searchResults = await this.searchOMDbByTerm(term, type, year, 1);
        if (searchResults.length === 0) continue;

        const mapped = searchResults.map(result => ({
          Title: result.Title,
          Year: result.Year,
          imdbID: result.imdbID,
          Type: result.Type,
          Poster: result.Poster !== 'N/A' ? result.Poster : null,
          Genre: '',
          imdbRating: null,
        }));

        rawCandidates.push(...mapped);
      }
    }

    const unique = this.removeDuplicates(rawCandidates);
    const enriched = await this.enrichRecommendationsWithOMDb(unique);

    const languageFiltered = enriched.filter(item => this.isLanguageMatch(item, language));
    const genreFiltered = this.filterBySelectedGenresStrict(languageFiltered, selectedGenres);

    const sorted = genreFiltered
      .sort((a, b) => {
        const yearA = this.extractNumericYear(a.Year) || 0;
        const yearB = this.extractNumericYear(b.Year) || 0;
        if (yearB !== yearA) return yearB - yearA;

        const ratingA = parseFloat(a.imdbRating || '0') || 0;
        const ratingB = parseFloat(b.imdbRating || '0') || 0;
        return ratingB - ratingA;
      })
      .slice(0, targetPoolSize);

    console.log('🧠 Advanced automated candidates:', sorted.length);
    return sorted;
  }

  /**
   * Get recommendation sources based on language preference
   */
  getRecommendationSources(selectedGenres, type, limit, language) {
    console.log(`🌐 Setting up sources for language: ${language}`);

    if (language === 'hindi') {
      // Hindi/Bollywood only
      return [
        {
          name: 'Latest Releases',
          fn: () => this.getLatestRecommendations(type, Math.ceil(limit * 0.2), language)
        },
        {
          name: 'Hindi/Bollywood API',
          fn: () => this.getHindiRecommendations(selectedGenres, type, Math.ceil(limit * 0.8))
        },
        {
          name: 'Hindi Fallback',
          fn: () => this.getFallbackRecommendations(type, Math.ceil(limit * 0.2), selectedGenres, language)
        }
      ];
    } else if (language === 'english') {
      // English only
      return [
        {
          name: 'Latest Releases',
          fn: () => this.getLatestRecommendations(type, Math.ceil(limit * 0.25), language)
        },
        {
          name: 'Genre-based API (English)',
          fn: () => this.getEnglishRecommendations(selectedGenres, type, Math.ceil(limit * 0.6))
        },
        {
          name: 'Popular API (English)',
          fn: () => this.getEnglishPopularRecommendations(type, Math.ceil(limit * 0.3))
        },
        {
          name: 'English Fallback',
          fn: () => this.getFallbackRecommendations(type, Math.ceil(limit * 0.1), selectedGenres, language)
        }
      ];
    } else {
      // All languages (mixed)
      return [
        {
          name: 'Latest Releases',
          fn: () => this.getLatestRecommendations(type, Math.ceil(limit * 0.25), language)
        },
        {
          name: 'Genre-based API',
          fn: () => this.getAPIRecommendationsByGenre(selectedGenres, type, Math.ceil(limit * 0.2))
        },
        {
          name: 'Popular API',
          fn: () => this.getAPIPopularRecommendations(type, Math.ceil(limit * 0.15))
        },
        {
          name: 'Sample Movies API',
          fn: () => this.getSampleMoviesRecommendations(selectedGenres, type, Math.ceil(limit * 0.25))
        },
        {
          name: 'Hindi/Bollywood API',
          fn: () => this.getHindiRecommendations(selectedGenres, type, Math.ceil(limit * 0.2))
        },
        {
          name: 'Mixed Fallback',
          fn: () => this.getFallbackRecommendations(type, Math.ceil(limit * 0.2), selectedGenres, language)
        }
      ];
    }
  }

  async getLatestRecommendations(type, limit, language = 'all') {
    const currentYear = new Date().getFullYear();
    const yearTerms = Array.from({ length: 6 }, (_, index) => String(currentYear - index));
    const recommendations = [];

    for (const term of yearTerms) {
      try {
        const url = `${this.getCurrentAPI()}?q=${encodeURIComponent(term)}`;
        const response = await fetch(url);
        if (!response.ok) continue;

        const data = await response.json();
        if (!data.ok || !Array.isArray(data.description)) continue;

        for (const rawMovie of data.description.slice(0, Math.ceil(limit / 2))) {
          const movie = this.formatAPIMovie(rawMovie);
          if (!movie || !this.matchesContentType(movie, type)) continue;

          if (language === 'hindi' && !this.isLikelyHindiContent(movie)) continue;
          if (language === 'english' && this.isLikelyHindiContent(movie)) continue;

          const year = this.extractNumericYear(movie.Year);
          if (year && year >= currentYear - 3) {
            recommendations.push(movie);
          }
        }

        await new Promise(resolve => setTimeout(resolve, 150));
      } catch (error) {
        console.warn(`❌ Latest recommendation fetch failed for ${term}:`, error);
      }
    }

    return this.removeDuplicates(recommendations).slice(0, limit);
  }

  /**
   * Get popular movies/series recommendations
   */
  async getPopularRecommendations(type, limit) {
    console.log('🎬 Getting popular recommendations:', { type, limit });

    const items = type === 'series' ? this.popularSeries :
                  type === 'movies' ? this.popularMovies :
                  [...this.popularMovies, ...this.popularSeries];

    const shuffled = items.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, limit);

    console.log('📋 Selected IMDb IDs:', selected);

    const recommendations = [];
    for (const imdbId of selected) {
      try {
        console.log(`🔍 Fetching details for ${imdbId}...`);
        const details = await this.fetchMovieDetails(imdbId);
        if (details) {
          console.log(`✅ Got details for ${details.Title}`);
          recommendations.push(details);
        } else {
          console.warn(`❌ No details returned for ${imdbId}`);
        }
      } catch (error) {
        console.warn(`❌ Failed to fetch details for ${imdbId}:`, error);
      }

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`📊 Popular recommendations found: ${recommendations.length}`);
    return recommendations;
  }

  /**
   * Get genre-based recommendations
   */
  async getGenreBasedRecommendations(selectedGenres, type, limit) {
    console.log('🎭 Getting genre-based recommendations:', { selectedGenres, type, limit });

    if (selectedGenres.length === 0) {
      console.log('📝 No genres selected, using popular genres');
      // Use some popular genres if none selected
      selectedGenres = ['Action', 'Comedy', 'Drama'];
    }

    const recommendations = [];
    const searchPromises = selectedGenres.slice(0, 3).map(genre =>
      this.searchByGenre(genre, type, Math.ceil(limit / Math.min(selectedGenres.length, 3)))
    );

    const results = await Promise.allSettled(searchPromises);
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`✅ Genre ${selectedGenres[index]} returned ${result.value.length} items`);
        recommendations.push(...result.value);
      } else {
        console.warn(`❌ Genre ${selectedGenres[index]} failed:`, result.reason);
      }
    });

    console.log(`🎭 Genre-based recommendations total: ${recommendations.length}`);
    return recommendations;
  }

  /**
   * Get personalized recommendations based on user history
   */
  async getPersonalizedRecommendations(type, limit) {
    const topGenres = Object.entries(this.userPreferences.watchedGenres)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([genre]) => genre);
    
    if (topGenres.length === 0) return [];
    
    return this.getGenreBasedRecommendations(topGenres, type, limit);
  }

  /**
   * Search for movies/series by genre
   */
  async searchByGenre(genre, type, limit) {
    // This is a simplified implementation
    // In a real scenario, you'd use more sophisticated API calls
    const searchTerms = this.getGenreSearchTerms(genre);
    const results = [];
    
    for (const term of searchTerms.slice(0, 2)) {
      try {
        const searchResults = await this.searchOMDb(term, type);
        results.push(...searchResults.slice(0, Math.ceil(limit / 2)));
      } catch (error) {
        console.warn(`Genre search failed for ${term}:`, error);
      }
    }
    
    return results;
  }

  /**
   * Get diverse search terms for a specific genre (including Hindi/Bollywood content)
   */
  getGenreSearchTerms(genre) {
    const genreTerms = {
      'Action': [
        // Diverse English terms
        'action', 'adventure', 'superhero', 'thriller', 'spy', 'martial arts', 'war', 'military',
        'heist', 'chase', 'explosion', 'fight', 'combat', 'mission', 'agent', 'assassin',
        // Popular franchises
        'fast furious', 'mission impossible', 'john wick', 'james bond', 'terminator',
        'die hard', 'mad max', 'expendables', 'transporter', 'bourne',
        // Hindi/Bollywood terms
        'bollywood action', 'hindi action', 'salman khan', 'akshay kumar', 'tiger shroff',
        'war', 'bhaag milkha bhaag', 'dangal', 'uri', 'border', 'lakshya'
      ],
      'Comedy': [
        // Diverse English terms
        'comedy', 'funny', 'humor', 'romantic comedy', 'parody', 'satire', 'slapstick',
        'buddy comedy', 'dark comedy', 'mockumentary', 'stand up', 'sketch',
        // Popular comedies
        'hangover', 'superbad', 'anchorman', 'dumb dumber', 'ace ventura',
        'meet parents', 'wedding crashers', 'step brothers', 'tropic thunder',
        // Hindi/Bollywood terms
        'bollywood comedy', 'hindi comedy', 'rajpal yadav', 'paresh rawal',
        'hera pheri', 'golmaal', 'housefull', 'welcome', 'munna bhai', 'andaz apna apna'
      ],
      'Drama': [
        // Diverse English terms
        'drama', 'emotional', 'family', 'biography', 'historical', 'period',
        'coming of age', 'social', 'political', 'courtroom', 'medical', 'sports drama',
        // Award winners
        'oscar winner', 'academy award', 'golden globe', 'cannes', 'sundance',
        'based true story', 'biographical', 'inspiring', 'heartwarming',
        // Hindi/Bollywood terms
        'bollywood drama', 'hindi drama', 'amitabh bachchan', 'shah rukh khan',
        'taare zameen par', 'pink', 'court', 'masaan', 'newton', 'article 15'
      ],
      'Horror': [
        // Diverse English terms
        'horror', 'scary', 'thriller', 'supernatural', 'ghost', 'zombie', 'vampire',
        'demon', 'haunted', 'possession', 'slasher', 'psychological horror',
        // Popular horror
        'conjuring', 'insidious', 'paranormal activity', 'saw', 'scream',
        'friday 13th', 'nightmare elm street', 'halloween', 'exorcist',
        // Hindi/Bollywood terms
        'bollywood horror', 'hindi horror', 'bhoot', 'raaz', 'stree',
        'tumhari sulu', 'pari', 'raat', 'veerana', 'purani haveli'
      ],
      'Sci-Fi': [
        // Diverse English terms
        'science fiction', 'sci-fi', 'space', 'future', 'alien', 'robot', 'cyberpunk',
        'dystopian', 'time travel', 'parallel universe', 'artificial intelligence',
        // Popular sci-fi
        'star wars', 'star trek', 'blade runner', 'matrix', 'alien', 'predator',
        'terminator', 'back future', 'interstellar', 'inception', 'avatar',
        // Hindi/Bollywood terms
        'bollywood sci-fi', 'hindi sci-fi', 'krrish', 'robot', 'ra.one',
        'mr. india', 'love story 2050', 'brahmastra'
      ],
      'Romance': [
        // Diverse English terms
        'romance', 'love', 'romantic', 'relationship', 'wedding', 'marriage',
        'love story', 'romantic comedy', 'date', 'valentine', 'passion',
        // Popular romance
        'titanic', 'notebook', 'dirty dancing', 'ghost', 'pretty woman',
        'sleepless seattle', 'when harry met sally', 'love actually',
        // Hindi/Bollywood terms
        'bollywood romance', 'hindi romance', 'shah rukh khan', 'aditya chopra',
        'dilwale dulhania le jayenge', 'kuch kuch hota hai', 'jab we met',
        'zindagi na milegi dobara', 'yeh jawaani hai deewani', 'kabir singh'
      ],
      'Thriller': [
        // Diverse English terms
        'thriller', 'suspense', 'mystery', 'crime', 'detective', 'investigation',
        'psychological thriller', 'conspiracy', 'espionage', 'kidnapping', 'murder',
        // Popular thrillers
        'gone girl', 'shutter island', 'zodiac', 'seven', 'silence lambs',
        'usual suspects', 'memento', 'prestige', 'sixth sense',
        // Hindi/Bollywood terms
        'bollywood thriller', 'hindi thriller', 'kahaani', 'andhadhun',
        'drishyam', 'talaash', 'badlapur', 'ugly', 'raman raghav'
      ],
      'Fantasy': [
        // Diverse English terms
        'fantasy', 'magic', 'adventure', 'supernatural', 'wizard', 'dragon',
        'medieval', 'mythology', 'fairy tale', 'epic fantasy', 'sword sorcery',
        // Popular fantasy
        'lord rings', 'harry potter', 'game thrones', 'chronicles narnia',
        'hobbit', 'pirates caribbean', 'princess bride', 'willow',
        // Hindi/Bollywood terms
        'bollywood fantasy', 'hindi fantasy', 'baahubali', 'krrish',
        'brahmastra', 'hanuman', 'bal ganesh', 'hatim'
      ],
      'Crime': [
        // Diverse English terms
        'crime', 'detective', 'police', 'mystery', 'mafia', 'gangster', 'heist',
        'noir', 'investigation', 'serial killer', 'drug', 'corruption',
        // Popular crime
        'godfather', 'goodfellas', 'scarface', 'casino', 'departed',
        'heat', 'reservoir dogs', 'pulp fiction', 'training day',
        // Hindi/Bollywood terms
        'bollywood crime', 'hindi crime', 'gangs of wasseypur', 'sacred games',
        'mirzapur', 'scam 1992', 'arya', 'satya', 'company'
      ],
      'Animation': [
        // Diverse English terms
        'animation', 'animated', 'cartoon', 'family', 'pixar', 'disney',
        'dreamworks', 'studio ghibli', 'anime', 'stop motion', '3d animation',
        // Popular animated
        'toy story', 'finding nemo', 'shrek', 'frozen', 'moana', 'coco',
        'incredibles', 'monsters inc', 'up', 'wall-e', 'spirited away',
        // Hindi/Bollywood terms
        'bollywood animation', 'hindi animation', 'chhota bheem',
        'hanuman', 'bal ganesh', 'krishna', 'ghatothkach'
      ]
    };

    return genreTerms[genre] || [genre.toLowerCase()];
  }

  /**
   * Get API recommendations by genre using the free movie API
   */
  async getAPIRecommendationsByGenre(selectedGenres, type, limit) {
    console.log('🎭 Getting API genre-based recommendations:', { selectedGenres, type, limit });

    if (selectedGenres.length === 0) {
      console.log('📝 No genres selected, using popular genres');
      selectedGenres = ['Action', 'Comedy', 'Drama'];
    }

    const recommendations = [];

    // Search for each genre with randomized terms
    for (const genre of selectedGenres.slice(0, 3)) {
      try {
        const searchTerms = this.getGenreSearchTerms(genre);

        // Randomize search terms to get different results each time
        const shuffledTerms = searchTerms.sort(() => 0.5 - Math.random());
        const selectedTermsForGenre = shuffledTerms.slice(0, 4); // Use more terms for diversity

        for (const term of selectedTermsForGenre) {
          try {
            console.log(`🔍 Searching API for: ${term}`);
            const apiURL = this.getCurrentAPI();
            const url = `${apiURL}?q=${encodeURIComponent(term)}`;

            const response = await fetch(url);
            if (response.ok) {
              const data = await response.json();

              if (data.ok && data.description && Array.isArray(data.description)) {
                const movies = data.description.slice(0, Math.ceil(limit / selectedGenres.length / 2));

                for (const movie of movies) {
                  const formattedMovie = this.formatAPIMovie(movie);
                  if (formattedMovie && this.matchesContentType(formattedMovie, type)) {
                    recommendations.push(formattedMovie);
                  }
                }

                console.log(`✅ Found ${movies.length} movies for term "${term}"`);
              }
            }

            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));

          } catch (error) {
            console.warn(`❌ Failed to search for term "${term}":`, error);
          }
        }
      } catch (error) {
        console.warn(`❌ Failed to process genre "${genre}":`, error);
      }
    }

    console.log(`🎭 API genre-based recommendations total: ${recommendations.length}`);
    return recommendations;
  }

  /**
   * Get popular API recommendations (including Hindi/Bollywood content)
   */
  async getAPIPopularRecommendations(type, limit) {
    console.log('🎬 Getting API popular recommendations:', { type, limit });

    const popularSearchTerms = [
      // Diverse English/Hollywood content
      'Marvel', 'Batman', 'Star Wars', 'Harry Potter', 'Lord of the Rings',
      'Fast and Furious', 'Mission Impossible', 'John Wick', 'Avengers',
      'Transformers', 'Jurassic Park', 'Indiana Jones', 'Pirates Caribbean',
      'X-Men', 'Spider-Man', 'Iron Man', 'Captain America', 'Thor',
      'Deadpool', 'Wonder Woman', 'Justice League', 'Guardians Galaxy',

      // Popular TV Series
      'Breaking Bad', 'Game of Thrones', 'Stranger Things', 'The Office',
      'Friends', 'The Crown', 'House of Cards', 'Narcos', 'Money Heist',
      'Sherlock', 'Westworld', 'Lost', 'Prison Break', 'Walking Dead',
      'Better Call Saul', 'Ozark', 'Peaky Blinders', 'Vikings', 'Mandalorian',

      // Classic Movies
      'Godfather', 'Shawshank Redemption', 'Pulp Fiction', 'Forrest Gump',
      'Titanic', 'Matrix', 'Inception', 'Interstellar', 'Dark Knight',
      'Goodfellas', 'Scarface', 'Casablanca', 'Citizen Kane', 'Vertigo',

      // Recent Popular Movies
      'Top Gun Maverick', 'Avatar Way of Water', 'Black Panther', 'Dune',
      'No Time to Die', 'Spider-Man No Way Home', 'Eternals', 'Venom',
      'Joker', 'Once Upon Time Hollywood', 'Parasite', 'Green Book',

      // Hindi/Bollywood Actors (Diverse)
      'Shah Rukh Khan', 'Salman Khan', 'Aamir Khan', 'Amitabh Bachchan',
      'Akshay Kumar', 'Hrithik Roshan', 'Ranveer Singh', 'Ranbir Kapoor',
      'Deepika Padukone', 'Priyanka Chopra', 'Kareena Kapoor', 'Alia Bhatt',
      'Katrina Kaif', 'Anushka Sharma', 'Sonam Kapoor', 'Vidya Balan',
      'Rajkummar Rao', 'Ayushmann Khurrana', 'Vicky Kaushal', 'Kartik Aaryan',

      // Popular Hindi Movies (Diverse)
      'Dangal', 'Baahubali', 'KGF', 'RRR', 'Pushpa', '3 Idiots',
      'Dilwale Dulhania Le Jayenge', 'Sholay', 'Lagaan', 'Zindagi Na Milegi Dobara',
      'Queen', 'Pink', 'Andhadhun', 'Article 15', 'Uri', 'War',
      'Gully Boy', 'Padmaavat', 'Bajrangi Bhaijaan', 'Sultan', 'Tiger Zinda Hai',
      'Sanju', 'Raazi', 'Stree', 'Badhaai Ho', 'Dream Girl',

      // Popular Hindi Series (Diverse)
      'Sacred Games', 'Mirzapur', 'Scam 1992', 'The Family Man', 'Arya',
      'Delhi Crime', 'Mumbai Diaries', 'Rocket Boys', 'Aspirants', 'Kota Factory',
      'Special Ops', 'Hostages', 'Criminal Justice', 'Made in Heaven', 'Four More Shots',

      // International Cinema
      'Parasite', 'Oldboy', 'Spirited Away', 'Seven Samurai', 'City of God',
      'Amélie', 'Life is Beautiful', 'Cinema Paradiso', 'Bicycle Thieves',

      // Animated Content
      'Toy Story', 'Finding Nemo', 'Shrek', 'Frozen', 'Moana', 'Coco',
      'Incredibles', 'Monsters Inc', 'Up', 'Wall-E', 'Inside Out',

      // Documentary/Reality
      'Planet Earth', 'Blue Planet', 'Our Planet', 'Free Solo', 'Won\'t You Be My Neighbor',
      'Making a Murderer', 'Tiger King', 'The Last Dance', 'Chef\'s Table'
    ];

    const recommendations = [];

    // Randomize search terms to get different results each time
    const shuffledTerms = popularSearchTerms.sort(() => 0.5 - Math.random());
    const selectedTerms = shuffledTerms.slice(0, 8); // Use more terms for diversity

    for (const term of selectedTerms) {
      try {
        console.log(`🔍 Searching API for popular: ${term}`);
        const url = `${this.currentAPI}?q=${encodeURIComponent(term)}`;

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();

          if (data.ok && data.description && Array.isArray(data.description)) {
            const movies = data.description.slice(0, Math.ceil(limit / 5));

            for (const movie of movies) {
              const formattedMovie = this.formatAPIMovie(movie);
              if (formattedMovie && this.matchesContentType(formattedMovie, type)) {
                recommendations.push(formattedMovie);
              }
            }

            console.log(`✅ Found ${movies.length} popular movies for "${term}"`);
          }
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.warn(`❌ Failed to search for popular term "${term}":`, error);
      }
    }

    console.log(`🎬 API popular recommendations total: ${recommendations.length}`);
    return recommendations;
  }

  /**
   * Get recommendations from Sample Movies API
   */
  async getSampleMoviesRecommendations(selectedGenres, type, limit) {
    console.log('🎬 Getting Sample Movies API recommendations:', { selectedGenres, type, limit });

    const sampleAPICategories = [
      'animation', 'comedy', 'drama', 'horror', 'family'
    ];

    const recommendations = [];

    // Map selected genres to available categories
    const availableCategories = [];
    selectedGenres.forEach(genre => {
      const genreLower = genre.toLowerCase();
      if (genreLower.includes('comedy')) availableCategories.push('comedy');
      if (genreLower.includes('drama')) availableCategories.push('drama');
      if (genreLower.includes('horror')) availableCategories.push('horror');
      if (genreLower.includes('animation')) availableCategories.push('animation');
      if (genreLower.includes('family')) availableCategories.push('family');
    });

    // If no matching categories, use random ones
    if (availableCategories.length === 0) {
      availableCategories.push(...sampleAPICategories.slice(0, 2));
    }

    // Remove duplicates
    const uniqueCategories = [...new Set(availableCategories)];

    for (const category of uniqueCategories.slice(0, 3)) {
      try {
        console.log(`🔍 Fetching from Sample API category: ${category}`);
        const url = `${this.movieAPIs.sampleMovies}/${category}`;

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();

          if (Array.isArray(data)) {
            // Shuffle and limit results
            const shuffled = data.sort(() => 0.5 - Math.random());
            const limited = shuffled.slice(0, Math.ceil(limit / uniqueCategories.length));

            for (const movie of limited) {
              const formattedMovie = this.formatSampleAPIMovie(movie);
              if (formattedMovie && this.matchesContentType(formattedMovie, type)) {
                recommendations.push(formattedMovie);
              }
            }

            console.log(`✅ Found ${limited.length} movies from ${category} category`);
          }
        }

        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.warn(`❌ Failed to fetch from Sample API category "${category}":`, error);
      }
    }

    console.log(`🎬 Sample Movies API recommendations total: ${recommendations.length}`);
    return recommendations;
  }

  /**
   * Format Sample API movie data to our standard format
   */
  formatSampleAPIMovie(sampleMovie) {
    try {
      const title = sampleMovie.title || 'Unknown Title';
      const year = this.extractYearFromTitle(title) || 'Unknown';
      const imdbID = sampleMovie.imdbId || '';

      return {
        Title: title,
        Year: year,
        imdbID: imdbID,
        Type: 'movie', // Sample API mostly has movies
        Poster: sampleMovie.posterURL || this.getPosterURL(null, title, year, imdbID),
        Genre: this.guessGenreFromTitle(title),
        imdbRating: this.generateRandomRating(),
        Actors: 'Unknown',
        Plot: `${title} - A great movie from our curated collection`,
        Director: 'Unknown',
        Runtime: 'Unknown'
      };
    } catch (error) {
      console.warn('❌ Error formatting Sample API movie:', error);
      return null;
    }
  }

  /**
   * Extract year from movie title (e.g., "Movie Title (2020)" -> "2020")
   */
  extractYearFromTitle(title) {
    const yearMatch = title.match(/\((\d{4})\)/);
    return yearMatch ? yearMatch[1] : null;
  }

  /**
   * Get Hindi/Bollywood specific recommendations
   */
  async getHindiRecommendations(selectedGenres, type, limit) {
    console.log('🇮🇳 Getting Hindi/Bollywood recommendations:', { selectedGenres, type, limit });

    const hindiSearchTerms = [
      // Popular Bollywood actors
      'Shah Rukh Khan', 'Salman Khan', 'Aamir Khan', 'Amitabh Bachchan',
      'Akshay Kumar', 'Hrithik Roshan', 'Ranveer Singh', 'Ranbir Kapoor',
      'Deepika Padukone', 'Priyanka Chopra', 'Kareena Kapoor', 'Alia Bhatt',

      // Popular Hindi movies by genre
      ...(selectedGenres.includes('Action') ? ['Dangal', 'Baahubali', 'KGF', 'War', 'Uri'] : []),
      ...(selectedGenres.includes('Comedy') ? ['3 Idiots', 'Hera Pheri', 'Golmaal', 'Housefull'] : []),
      ...(selectedGenres.includes('Romance') ? ['Dilwale Dulhania Le Jayenge', 'Jab We Met', 'Yeh Jawaani Hai Deewani'] : []),
      ...(selectedGenres.includes('Drama') ? ['Taare Zameen Par', 'Pink', 'Queen', 'Article 15'] : []),
      ...(selectedGenres.includes('Thriller') ? ['Andhadhun', 'Kahaani', 'Drishyam', 'Talaash'] : []),

      // Popular Hindi series
      'Sacred Games', 'Mirzapur', 'Scam 1992', 'The Family Man', 'Arya',
      'Delhi Crime', 'Mumbai Diaries', 'Rocket Boys',

      // General Bollywood terms
      'Bollywood', 'Hindi movie', 'Hindi film', 'Indian cinema'
    ];

    const recommendations = [];

    // Search for Hindi content
    for (const term of hindiSearchTerms.slice(0, 8)) {
      try {
        console.log(`🔍 Searching API for Hindi content: ${term}`);
        const url = `${this.currentAPI}?q=${encodeURIComponent(term)}`;

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();

          if (data.ok && data.description && Array.isArray(data.description)) {
            const movies = data.description.slice(0, Math.ceil(limit / 8));

            for (const movie of movies) {
              const formattedMovie = this.formatAPIMovie(movie);
              if (formattedMovie && this.matchesContentType(formattedMovie, type) &&
                  this.isLikelyHindiContent(formattedMovie)) {
                recommendations.push(formattedMovie);
              }
            }

            console.log(`✅ Found ${movies.length} Hindi movies for "${term}"`);
          }
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (error) {
        console.warn(`❌ Failed to search for Hindi term "${term}":`, error);
      }
    }

    console.log(`🇮🇳 Hindi/Bollywood recommendations total: ${recommendations.length}`);
    return recommendations;
  }

  /**
   * Get random discovery recommendations for variety
   */
  async getRandomDiscoveryRecommendations(type, limit) {
    console.log('🎲 Getting random discovery recommendations:', { type, limit });

    const randomSearchTerms = [
      // Random years for discovery
      '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015',
      '2010', '2005', '2000', '1995', '1990', '1985', '1980',

      // Random genres
      'adventure', 'mystery', 'western', 'musical', 'sport', 'biography',
      'history', 'war', 'family', 'short', 'news', 'reality',

      // Random countries/languages
      'french', 'german', 'japanese', 'korean', 'spanish', 'italian',
      'chinese', 'russian', 'brazilian', 'mexican', 'canadian',

      // Random awards/festivals
      'oscar', 'golden globe', 'cannes', 'sundance', 'venice', 'berlin',
      'bafta', 'critics choice', 'screen actors guild',

      // Random descriptors
      'independent', 'cult', 'classic', 'remake', 'sequel', 'prequel',
      'based on', 'true story', 'novel', 'comic', 'video game'
    ];

    const recommendations = [];

    // Randomize and select terms
    const shuffledTerms = randomSearchTerms.sort(() => 0.5 - Math.random());
    const selectedTerms = shuffledTerms.slice(0, 3);

    for (const term of selectedTerms) {
      try {
        console.log(`🔍 Random discovery search for: ${term}`);
        const url = `${this.currentAPI}?q=${encodeURIComponent(term)}`;

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();

          if (data.ok && data.description && Array.isArray(data.description)) {
            const movies = data.description.slice(0, Math.ceil(limit / 3));

            for (const movie of movies) {
              const formattedMovie = this.formatAPIMovie(movie);
              if (formattedMovie && this.matchesContentType(formattedMovie, type)) {
                recommendations.push(formattedMovie);
              }
            }

            console.log(`✅ Found ${movies.length} random discovery items for "${term}"`);
          }
        }

        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (error) {
        console.warn(`❌ Failed random discovery search for "${term}":`, error);
      }
    }

    console.log(`🎲 Random discovery recommendations total: ${recommendations.length}`);
    return recommendations;
  }

  /**
   * Check if content is likely Hindi/Bollywood
   */
  isLikelyHindiContent(movie) {
    const title = movie.Title.toLowerCase();
    const actors = (movie.Actors || '').toLowerCase();

    // Check for Hindi movie indicators
    const hindiIndicators = [
      // Common Hindi actors
      'shah rukh', 'salman khan', 'aamir khan', 'amitabh bachchan',
      'akshay kumar', 'hrithik roshan', 'ranveer singh', 'ranbir kapoor',
      'deepika padukone', 'priyanka chopra', 'kareena kapoor', 'alia bhatt',
      'katrina kaif', 'anushka sharma', 'sonam kapoor', 'vidya balan',

      // Hindi movie titles/words
      'bollywood', 'hindi', 'mumbai', 'delhi', 'india', 'indian',
      'baahubali', 'dangal', 'lagaan', 'sholay', 'dilwale',
      'zindagi', 'kuch kuch', 'kabhi', 'hum', 'tum', 'hai', 'ka', 'ki',

      // Production houses
      'yash raj', 'dharma', 'balaji', 'eros', 'reliance'
    ];

    return hindiIndicators.some(indicator =>
      title.includes(indicator) || actors.includes(indicator)
    );
  }

  /**
   * Format API movie data to our standard format
   */
  formatAPIMovie(apiMovie) {
    try {
      const title = apiMovie['#TITLE'] || 'Unknown Title';
      const year = apiMovie['#YEAR'] || 'Unknown';
      const imdbID = apiMovie['#IMDB_ID'] || '';

      return {
        Title: title,
        Year: year,
        imdbID: imdbID,
        Type: this.guessContentType(title, year),
        Poster: this.getPosterURL(apiMovie['#IMG_POSTER'], title, year, imdbID),
        Genre: this.guessGenreFromTitle(title),
        imdbRating: this.generateRandomRating(),
        Actors: apiMovie['#ACTORS'] || 'Unknown',
        Plot: `${title} (${year})`,
        Director: 'Unknown',
        Runtime: 'Unknown'
      };
    } catch (error) {
      console.warn('❌ Error formatting API movie:', error);
      return null;
    }
  }

  /**
   * Get poster URL with fallback options
   */
  getPosterURL(apiPoster, title, year, imdbID) {
    // If API provides a valid poster URL, use it
    if (apiPoster && apiPoster !== 'N/A' && apiPoster.startsWith('http')) {
      return apiPoster;
    }

    // Try to construct IMDb poster URL if we have IMDb ID
    if (imdbID && imdbID.startsWith('tt')) {
      return `https://m.media-amazon.com/images/M/MV5B${this.generatePosterHash()}_V1_SX300.jpg`;
    }

    // Use genre-based placeholder based on title
    return this.getGenrePlaceholder(title, year);
  }

  /**
   * Generate a realistic poster hash for IMDb URLs
   */
  generatePosterHash() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 26; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Get genre-based placeholder poster
   */
  getGenrePlaceholder(title, year) {
    const titleLower = title.toLowerCase();
    const isHindi = this.isLikelyHindiContent({ Title: title, Actors: '' });

    // Determine genre from title
    let genre = 'drama';
    if (titleLower.includes('action') || titleLower.includes('war') || titleLower.includes('fight')) {
      genre = 'action';
    } else if (titleLower.includes('comedy') || titleLower.includes('funny')) {
      genre = 'comedy';
    } else if (titleLower.includes('horror') || titleLower.includes('scary')) {
      genre = 'horror';
    } else if (titleLower.includes('romance') || titleLower.includes('love')) {
      genre = 'romance';
    } else if (titleLower.includes('sci-fi') || titleLower.includes('space')) {
      genre = 'scifi';
    }

    // Color scheme based on genre and language
    const colorSchemes = {
      action: isHindi ? '#FF6B35' : '#E74C3C',
      comedy: isHindi ? '#F39C12' : '#F1C40F',
      horror: isHindi ? '#8E44AD' : '#9B59B6',
      romance: isHindi ? '#E91E63' : '#E74C3C',
      scifi: isHindi ? '#3498DB' : '#2980B9',
      drama: isHindi ? '#27AE60' : '#16A085'
    };

    const bgColor = colorSchemes[genre] || colorSchemes.drama;
    const textColor = 'FFFFFF';
    const flag = isHindi ? '🇮🇳' : '🎬';

    // Create a placeholder URL with movie info
    const encodedTitle = encodeURIComponent(title.substring(0, 20));
    const encodedYear = encodeURIComponent(year);

    return `https://via.placeholder.com/300x450/${bgColor.substring(1)}/${textColor}?text=${flag}+${encodedTitle}+(${encodedYear})`;
  }

  /**
   * Guess content type from title and year
   */
  guessContentType(title, year) {
    const seriesKeywords = ['series', 'season', 'episode', 'tv', 'show'];
    const titleLower = title.toLowerCase();

    if (seriesKeywords.some(keyword => titleLower.includes(keyword))) {
      return 'series';
    }

    // If year range (e.g., "2008-2013"), it's likely a series
    if (typeof year === 'string' && year.includes('–')) {
      return 'series';
    }

    return 'movie';
  }

  /**
   * Guess genre from title (including Hindi movie recognition)
   */
  guessGenreFromTitle(title) {
    const titleLower = title.toLowerCase();

    // Action movies (English & Hindi)
    if (titleLower.includes('spider') || titleLower.includes('batman') || titleLower.includes('superman') ||
        titleLower.includes('war') || titleLower.includes('battle') || titleLower.includes('fight') ||
        titleLower.includes('dangal') || titleLower.includes('baahubali') || titleLower.includes('kgf') ||
        titleLower.includes('pushpa') || titleLower.includes('rrr') || titleLower.includes('uri') ||
        titleLower.includes('tiger') || titleLower.includes('bhaag milkha')) {
      return 'Action, Adventure';
    }

    // Horror movies (English & Hindi)
    if (titleLower.includes('horror') || titleLower.includes('scary') || titleLower.includes('bhoot') ||
        titleLower.includes('raaz') || titleLower.includes('stree') || titleLower.includes('pari')) {
      return 'Horror';
    }

    // Comedy movies (English & Hindi)
    if (titleLower.includes('comedy') || titleLower.includes('funny') || titleLower.includes('hera pheri') ||
        titleLower.includes('golmaal') || titleLower.includes('housefull') || titleLower.includes('welcome') ||
        titleLower.includes('munna bhai') || titleLower.includes('3 idiots')) {
      return 'Comedy';
    }

    // Romance movies (English & Hindi)
    if (titleLower.includes('romance') || titleLower.includes('love') || titleLower.includes('dilwale') ||
        titleLower.includes('kuch kuch hota hai') || titleLower.includes('jab we met') ||
        titleLower.includes('zindagi na milegi') || titleLower.includes('yeh jawaani hai deewani')) {
      return 'Romance';
    }

    // Thriller/Crime (English & Hindi)
    if (titleLower.includes('thriller') || titleLower.includes('crime') || titleLower.includes('kahaani') ||
        titleLower.includes('andhadhun') || titleLower.includes('drishyam') || titleLower.includes('talaash') ||
        titleLower.includes('gangs of wasseypur') || titleLower.includes('sacred games') ||
        titleLower.includes('mirzapur') || titleLower.includes('scam')) {
      return 'Thriller, Crime';
    }

    // Sci-Fi/Fantasy (English & Hindi)
    if (titleLower.includes('sci-fi') || titleLower.includes('science') || titleLower.includes('krrish') ||
        titleLower.includes('robot') || titleLower.includes('ra.one') || titleLower.includes('mr. india') ||
        titleLower.includes('brahmastra')) {
      return 'Sci-Fi, Fantasy';
    }

    // Drama (English & Hindi)
    if (titleLower.includes('taare zameen par') || titleLower.includes('pink') || titleLower.includes('court') ||
        titleLower.includes('masaan') || titleLower.includes('queen') || titleLower.includes('article 15') ||
        titleLower.includes('lagaan') || titleLower.includes('sholay')) {
      return 'Drama';
    }

    return 'Drama'; // Default genre
  }

  /**
   * Generate a random realistic IMDb rating
   */
  generateRandomRating() {
    return (Math.random() * 3 + 6).toFixed(1); // Random rating between 6.0 and 9.0
  }

  /**
   * Check if movie matches content type filter
   */
  matchesContentType(movie, type) {
    if (type === 'all') return true;
    if (type === 'movies') return movie.Type === 'movie';
    if (type === 'series') return movie.Type === 'series';
    return true;
  }

  /**
   * Get English-specific recommendations by genre
   */
  async getEnglishRecommendations(selectedGenres, type, limit) {
    console.log('🇺🇸 Getting English recommendations:', { selectedGenres, type, limit });

    if (selectedGenres.length === 0) {
      selectedGenres = ['Action', 'Comedy', 'Drama'];
    }

    const recommendations = [];

    // Search for each genre with English-only terms
    for (const genre of selectedGenres.slice(0, 3)) {
      try {
        const englishTerms = this.getEnglishGenreTerms(genre);

        for (const term of englishTerms.slice(0, 2)) {
          try {
            console.log(`🔍 Searching API for English content: ${term}`);
            const url = `${this.freeMovieAPI}?q=${encodeURIComponent(term)}`;

            const response = await fetch(url);
            if (response.ok) {
              const data = await response.json();

              if (data.ok && data.description && Array.isArray(data.description)) {
                const movies = data.description.slice(0, Math.ceil(limit / selectedGenres.length / 2));

                for (const movie of movies) {
                  const formattedMovie = this.formatAPIMovie(movie);
                  if (formattedMovie && this.matchesContentType(formattedMovie, type) &&
                      !this.isLikelyHindiContent(formattedMovie)) {
                    recommendations.push(formattedMovie);
                  }
                }

                console.log(`✅ Found ${movies.length} English movies for term "${term}"`);
              }
            }

            await new Promise(resolve => setTimeout(resolve, 200));

          } catch (error) {
            console.warn(`❌ Failed to search for English term "${term}":`, error);
          }
        }
      } catch (error) {
        console.warn(`❌ Failed to process English genre "${genre}":`, error);
      }
    }

    console.log(`🇺🇸 English recommendations total: ${recommendations.length}`);
    return recommendations;
  }

  /**
   * Get English-only popular recommendations
   */
  async getEnglishPopularRecommendations(type, limit) {
    console.log('🎬 Getting English popular recommendations:', { type, limit });

    const englishSearchTerms = [
      'Marvel', 'Batman', 'Star Wars', 'Harry Potter', 'Lord of the Rings',
      'Fast and Furious', 'Mission Impossible', 'John Wick', 'Avengers',
      'Breaking Bad', 'Game of Thrones', 'Stranger Things', 'The Office',
      'Friends', 'The Crown', 'The Mandalorian', 'Wednesday'
    ];

    const recommendations = [];

    for (const term of englishSearchTerms.slice(0, 6)) {
      try {
        console.log(`🔍 Searching API for English popular: ${term}`);
        const url = `${this.freeMovieAPI}?q=${encodeURIComponent(term)}`;

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();

          if (data.ok && data.description && Array.isArray(data.description)) {
            const movies = data.description.slice(0, Math.ceil(limit / 6));

            for (const movie of movies) {
              const formattedMovie = this.formatAPIMovie(movie);
              if (formattedMovie && this.matchesContentType(formattedMovie, type) &&
                  !this.isLikelyHindiContent(formattedMovie)) {
                recommendations.push(formattedMovie);
              }
            }

            console.log(`✅ Found ${movies.length} English popular movies for "${term}"`);
          }
        }

        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.warn(`❌ Failed to search for English popular term "${term}":`, error);
      }
    }

    console.log(`🎬 English popular recommendations total: ${recommendations.length}`);
    return recommendations;
  }

  /**
   * Get English-only genre search terms
   */
  getEnglishGenreTerms(genre) {
    const englishGenreTerms = {
      'Action': ['action', 'adventure', 'superhero', 'thriller'],
      'Comedy': ['comedy', 'funny', 'humor', 'romantic comedy'],
      'Drama': ['drama', 'emotional', 'family', 'biography'],
      'Horror': ['horror', 'scary', 'thriller', 'supernatural'],
      'Sci-Fi': ['science fiction', 'sci-fi', 'space', 'future'],
      'Romance': ['romance', 'love', 'romantic', 'relationship'],
      'Thriller': ['thriller', 'suspense', 'mystery', 'crime'],
      'Fantasy': ['fantasy', 'magic', 'adventure', 'supernatural'],
      'Crime': ['crime', 'detective', 'police', 'mystery'],
      'Animation': ['animation', 'animated', 'cartoon', 'family']
    };

    return englishGenreTerms[genre] || [genre.toLowerCase()];
  }

  /**
   * Get fallback recommendations when API fails
   */
  async getFallbackRecommendations(type, limit, selectedGenres = [], language = 'all') {
    console.log('🆘 Using fallback recommendations', { type, limit, selectedGenres });

    // Create some basic recommendations with hardcoded data
    const fallbackData = [
      // Movies
      {
        Title: "The Shawshank Redemption",
        Year: "1994",
        imdbID: "tt0111161",
        Type: "movie",
        Poster: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg",
        Genre: "Drama",
        imdbRating: "9.3"
      },
      {
        Title: "The Dark Knight",
        Year: "2008",
        imdbID: "tt0468569",
        Type: "movie",
        Poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",
        Genre: "Action, Crime, Drama",
        imdbRating: "9.0"
      },
      {
        Title: "Inception",
        Year: "2010",
        imdbID: "tt1375666",
        Type: "movie",
        Poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
        Genre: "Action, Sci-Fi, Thriller",
        imdbRating: "8.8"
      },
      {
        Title: "Pulp Fiction",
        Year: "1994",
        imdbID: "tt0110912",
        Type: "movie",
        Poster: "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
        Genre: "Crime, Drama",
        imdbRating: "8.9"
      },
      {
        Title: "Forrest Gump",
        Year: "1994",
        imdbID: "tt0109830",
        Type: "movie",
        Poster: "https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
        Genre: "Drama, Romance",
        imdbRating: "8.8"
      },
      {
        Title: "The Matrix",
        Year: "1999",
        imdbID: "tt0133093",
        Type: "movie",
        Poster: "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
        Genre: "Action, Sci-Fi",
        imdbRating: "8.7"
      },
      {
        Title: "Goodfellas",
        Year: "1990",
        imdbID: "tt0099685",
        Type: "movie",
        Poster: "https://m.media-amazon.com/images/M/MV5BY2NkZjEzMDgtN2RjYy00YzM1LWI4ZmQtMjA4YTQyYTBmMjNmXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
        Genre: "Biography, Crime, Drama",
        imdbRating: "8.7"
      },
      {
        Title: "Interstellar",
        Year: "2014",
        imdbID: "tt0816692",
        Type: "movie",
        Poster: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",
        Genre: "Adventure, Drama, Sci-Fi",
        imdbRating: "8.6"
      },
      // Series
      {
        Title: "Breaking Bad",
        Year: "2008–2013",
        imdbID: "tt0903747",
        Type: "series",
        Poster: "https://m.media-amazon.com/images/M/MV5BYmQ4YWMxYjUtNjZmYi00MDQ1LWFjMjMtNjA5ZDdiYjdiODU5XkEyXkFqcGdeQXVyMTMzNDExODE5._V1_SX300.jpg",
        Genre: "Crime, Drama, Thriller",
        imdbRating: "9.5"
      },
      {
        Title: "Game of Thrones",
        Year: "2011–2019",
        imdbID: "tt0944947",
        Type: "series",
        Poster: "https://m.media-amazon.com/images/M/MV5BYTRiNDQwYzAtMzVlZS00NTI5LWJjYjUtMzkwNTUzMWMxZTllXkEyXkFqcGdeQXVyNDIzMzcwNjc@._V1_SX300.jpg",
        Genre: "Action, Adventure, Drama",
        imdbRating: "9.2"
      },
      {
        Title: "Stranger Things",
        Year: "2016–",
        imdbID: "tt4574334",
        Type: "series",
        Poster: "https://m.media-amazon.com/images/M/MV5BN2ZmYjg1YmItNWQ4OC00YWM0LWE0ZDktYThjOTZiZjhhN2Q2XkEyXkFqcGdeQXVyNjgxNTQ3Mjk@._V1_SX300.jpg",
        Genre: "Drama, Fantasy, Horror",
        imdbRating: "8.7"
      },
      {
        Title: "The Office",
        Year: "2005–2013",
        imdbID: "tt0386676",
        Type: "series",
        Poster: "https://m.media-amazon.com/images/M/MV5BMDNkOTE4NDQtMTNmYi00MWE0LWE4ZTktYTc0NzhhNWIzNzJiXkEyXkFqcGdeQXVyMzQ2MDI5NjU@._V1_SX300.jpg",
        Genre: "Comedy",
        imdbRating: "9.0"
      },
      {
        Title: "Friends",
        Year: "1994–2004",
        imdbID: "tt0108778",
        Type: "series",
        Poster: "https://m.media-amazon.com/images/M/MV5BNDVkYjU0MzctMWRmZi00NTkxLTgwZWEtOWVhYjZlYjllYmU4XkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_SX300.jpg",
        Genre: "Comedy, Romance",
        imdbRating: "8.9"
      },
      {
        Title: "The Crown",
        Year: "2016–2023",
        imdbID: "tt4786824",
        Type: "series",
        Poster: "https://m.media-amazon.com/images/M/MV5BZmY0MzBlNjctYjc4Ny00ODBmLTg4NWMtNjAwZjk5YWUwYWZlXkEyXkFqcGdeQXVyMDM2NDM2MQ@@._V1_SX300.jpg",
        Genre: "Biography, Drama, History",
        imdbRating: "8.6"
      },
      {
        Title: "The Mandalorian",
        Year: "2019–",
        imdbID: "tt8111088",
        Type: "series",
        Poster: "https://m.media-amazon.com/images/M/MV5BN2M5YWFjN2YtYzU2YS00NzBlLTgwZWUtYWQzNWFhNDkyYjg3XkEyXkFqcGdeQXVyMDM2NDM2MQ@@._V1_SX300.jpg",
        Genre: "Action, Adventure, Fantasy",
        imdbRating: "8.7"
      },
      {
        Title: "Wednesday",
        Year: "2022–",
        imdbID: "tt13443470",
        Type: "series",
        Poster: "https://m.media-amazon.com/images/M/MV5BM2ZmMjEyZmYtOGM4YS00YTNhLWE3ZDMtNzQxM2RhNjBlODIyXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_SX300.jpg",
        Genre: "Comedy, Crime, Family",
        imdbRating: "8.1"
      },
      // Hindi/Bollywood Movies
      {
        Title: "Dangal",
        Year: "2016",
        imdbID: "tt5074352",
        Type: "movie",
        Poster: "https://m.media-amazon.com/images/M/MV5BMTQ4MzQzMzM2Nl5BMl5BanBnXkFtZTgwMTQ1NzU3MDI@._V1_SX300.jpg",
        Genre: "Action, Biography, Drama",
        imdbRating: "8.4"
      },
      {
        Title: "3 Idiots",
        Year: "2009",
        imdbID: "tt1187043",
        Type: "movie",
        Poster: "https://m.media-amazon.com/images/M/MV5BNTkyOGVjMGEtNmQzZi00NzFlLTlhOWQtODYyMDc2ZGJmYzFhXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
        Genre: "Comedy, Drama",
        imdbRating: "8.4"
      },
      {
        Title: "Lagaan",
        Year: "2001",
        imdbID: "tt0169102",
        Type: "movie",
        Poster: "https://m.media-amazon.com/images/M/MV5BNDEyYWJhNjAtZTVhNy00ZTEyLWJmMGYtZmUyODM1NzEyNzNhXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
        Genre: "Adventure, Drama, Musical",
        imdbRating: "8.1"
      },
      {
        Title: "Zindagi Na Milegi Dobara",
        Year: "2011",
        imdbID: "tt1562872",
        Type: "movie",
        Poster: "https://m.media-amazon.com/images/M/MV5BMjEyOTYyMjI5NV5BMl5BanBnXkFtZTcwNTMxMzM5NQ@@._V1_SX300.jpg",
        Genre: "Adventure, Comedy, Drama",
        imdbRating: "8.2"
      },
      {
        Title: "Queen",
        Year: "2013",
        imdbID: "tt3322420",
        Type: "movie",
        Poster: "https://m.media-amazon.com/images/M/MV5BMTMxOTMwNDI4MF5BMl5BanBnXkFtZTgwNzQ1NDA0MTE@._V1_SX300.jpg",
        Genre: "Adventure, Comedy, Drama",
        imdbRating: "8.2"
      },
      // Hindi/Bollywood Series
      {
        Title: "Sacred Games",
        Year: "2018–2019",
        imdbID: "tt6077448",
        Type: "series",
        Poster: "https://m.media-amazon.com/images/M/MV5BMzRjZWVmMzItNTdmYS00OWEzLTgyOGUtNThiNTU2ZThlYjY0XkEyXkFqcGdeQXVyOTAzMTc2MjA@._V1_SX300.jpg",
        Genre: "Action, Crime, Drama",
        imdbRating: "8.6"
      },
      {
        Title: "Scam 1992: The Harshad Mehta Story",
        Year: "2020",
        imdbID: "tt11126994",
        Type: "series",
        Poster: "https://m.media-amazon.com/images/M/MV5BNjM5MDI1MjMtZmNkZC00NGE2LWE4NzQtMWQ4ZmNhNzNlZjc2XkEyXkFqcGdeQXVyMTAyMTE1MDA5._V1_SX300.jpg",
        Genre: "Biography, Crime, Drama",
        imdbRating: "9.5"
      },
      {
        Title: "The Family Man",
        Year: "2019–",
        imdbID: "tt9544034",
        Type: "series",
        Poster: "https://m.media-amazon.com/images/M/MV5BYTlmOTJkNzQtMjgyNS00MGQ0LWIyNGMtZTRlNGJkNWQ2ZWQ4XkEyXkFqcGdeQXVyMTEyNzgwMDUw._V1_SX300.jpg",
        Genre: "Action, Drama, Thriller",
        imdbRating: "8.7"
      },
      {
        Title: "Mirzapur",
        Year: "2018–",
        imdbID: "tt6473300",
        Type: "series",
        Poster: "https://m.media-amazon.com/images/M/MV5BMzZiNjQyM2YtYWY3OS00YTk4LWI4NTMtOWNiMWZhMGQ5YmY4XkEyXkFqcGdeQXVyOTAzMTc2MjA@._V1_SX300.jpg",
        Genre: "Action, Crime, Drama",
        imdbRating: "8.4"
      }
    ];

    // Filter by type if specified
    let filtered = fallbackData;
    if (type === 'movies') {
      filtered = fallbackData.filter(item => item.Type === 'movie');
    } else if (type === 'series') {
      filtered = fallbackData.filter(item => item.Type === 'series');
    }

    // Filter by language if specified
    if (language === 'hindi') {
      const hindiMovies = ['Dangal', '3 Idiots', 'Lagaan', 'Zindagi Na Milegi Dobara', 'Queen', 'Sacred Games', 'Scam 1992: The Harshad Mehta Story', 'The Family Man', 'Mirzapur'];
      filtered = filtered.filter(item => hindiMovies.includes(item.Title));
      console.log(`🇮🇳 Filtered for Hindi content: ${filtered.length} items`);
    } else if (language === 'english') {
      const hindiMovies = ['Dangal', '3 Idiots', 'Lagaan', 'Zindagi Na Milegi Dobara', 'Queen', 'Sacred Games', 'Scam 1992: The Harshad Mehta Story', 'The Family Man', 'Mirzapur'];
      filtered = filtered.filter(item => !hindiMovies.includes(item.Title));
      console.log(`🇺🇸 Filtered for English content: ${filtered.length} items`);
    }

    // Filter by selected genres if any
    if (selectedGenres && selectedGenres.length > 0) {
      const genreFiltered = filtered.filter(item => {
        const itemGenres = item.Genre.toLowerCase();
        return selectedGenres.some(genre =>
          itemGenres.includes(genre.toLowerCase())
        );
      });

      // If we found genre matches, use them; otherwise use all filtered items
      if (genreFiltered.length > 0) {
        filtered = genreFiltered;
        console.log(`🎭 Filtered by genres ${selectedGenres.join(', ')}: ${filtered.length} items`);
      }
    }

    // Shuffle and limit
    const shuffled = filtered.sort(() => 0.5 - Math.random());
    const result = shuffled.slice(0, limit);

    console.log(`🆘 Fallback recommendations returning: ${result.length} items`);
    return result;
  }



  /**
   * Fetch detailed movie information using the free API
   */
  async fetchMovieDetails(imdbId) {
    try {
      console.log(`🔍 Fetching details for IMDb ID: ${imdbId}`);
      const url = `${this.freeMovieAPI}?tt=${imdbId}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();

        if (data.ok && data.short) {
          const movieData = data.short;
          return {
            Title: movieData.name || 'Unknown Title',
            Year: movieData.datePublished ? new Date(movieData.datePublished).getFullYear() : 'Unknown',
            imdbID: imdbId,
            Type: this.guessContentType(movieData.name, movieData.datePublished),
            Poster: movieData.image || null,
            Genre: movieData.genre ? (Array.isArray(movieData.genre) ? movieData.genre.join(', ') : movieData.genre) : 'Unknown',
            Plot: movieData.description || `${movieData.name} - No description available`,
            imdbRating: movieData.aggregateRating?.ratingValue || this.generateRandomRating(),
            Director: movieData.director?.name || 'Unknown',
            Actors: movieData.actor ? (Array.isArray(movieData.actor) ? movieData.actor.map(a => a.name).join(', ') : movieData.actor.name) : 'Unknown',
            Runtime: movieData.duration || 'Unknown'
          };
        }
      }
    } catch (error) {
      console.warn(`❌ Failed to fetch details for ${imdbId}:`, error);
    }

    // Return null if API fails, will trigger fallback
    return null;
  }

  /**
   * Remove duplicate recommendations
   */
  removeDuplicates(recommendations) {
    const seen = new Set();
    return recommendations.filter(item => {
      const key = item.imdbID || `${item.Title}-${item.Year}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Show loading state in UI
   */
  showLoadingState() {
    const container = document.getElementById('recommendationsContainer');
    if (container) {
      container.innerHTML = `
        <div class="recommendations-loading">
          <div class="ai-loading-animation">
            <i class="fas fa-robot"></i>
            <div class="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <h3>AI is analyzing your preferences...</h3>
          <p>Generating personalized recommendations</p>
        </div>
      `;
    }
  }

  /**
   * Hide loading state in UI
   */
  hideLoadingState() {
    // Loading state will be replaced by recommendations display
  }

  /**
   * Display recommendations in the UI
   */
  displayRecommendations(recommendations, selectedGenres = []) {
    const container = document.getElementById('recommendationsContainer');
    if (!container) return;

    if (recommendations.length === 0) {
      container.innerHTML = `
        <div class="no-recommendations">
          <i class="fas fa-search"></i>
          <h3>No recommendations found</h3>
          <p>Try selecting different genres or check back later for new suggestions.</p>
        </div>
      `;
      return;
    }

    const genreText = selectedGenres.length > 0 ?
      ` for ${selectedGenres.join(', ')}` : '';

    container.innerHTML = `
      <div class="recommendations-header">
        <h3><i class="fas fa-magic"></i> AI Recommendations${genreText}</h3>
        <p>Personalized suggestions based on your preferences and viewing history</p>
      </div>
      <div class="recommendations-grid">
        ${recommendations.map(item => this.createRecommendationCard(item)).join('')}
      </div>
    `;

    // Add click handlers for recommendation cards
    this.addRecommendationHandlers();

    // Preload and validate poster images
    this.validatePosterImages();
  }

  /**
   * Validate and fix poster images that fail to load
   */
  validatePosterImages() {
    const images = document.querySelectorAll('.recommendation-poster img');

    images.forEach((img, index) => {
      // Add loading class
      img.classList.add('loading');

      // Set up load and error handlers
      img.onload = () => {
        img.classList.remove('loading');
        console.log(`✅ Poster loaded successfully: ${img.alt}`);
      };

      img.onerror = () => {
        img.classList.remove('loading');
        console.warn(`❌ Poster failed to load: ${img.alt}`);

        // Get the movie title and year from the card
        const card = img.closest('.recommendation-card');
        const title = card.querySelector('.recommendation-title').textContent;
        const year = card.querySelector('.recommendation-year').textContent;

        // Set fallback poster
        const fallbackPoster = this.getGenrePlaceholder(title, year);
        img.src = fallbackPoster;
        img.onerror = null; // Prevent infinite loop
      };

      // Add a timeout to catch slow-loading images
      setTimeout(() => {
        if (img.classList.contains('loading')) {
          img.classList.remove('loading');
          console.warn(`⏰ Poster loading timeout: ${img.alt}`);
        }
      }, 5000);
    });
  }

  /**
   * Create HTML for a recommendation card
   */
  createRecommendationCard(item) {
    const poster = item.Poster || this.getGenrePlaceholder(item.Title, item.Year);
    const rating = item.imdbRating ? `⭐ ${item.imdbRating}` : '';
    const aiScore = item.aiScore ? `🤖 ${item.aiScore.toFixed(1)}` : '';
    const genres = item.Genre ? item.Genre.split(',').slice(0, 2).join(', ') : '';
    const fallbackPoster = this.getGenrePlaceholder(item.Title, item.Year);

    return `
      <div class="recommendation-card" data-imdb-id="${item.imdbID}" data-type="${item.Type}">
        <div class="recommendation-poster">
          <img src="${poster}"
               alt="${item.Title}"
               loading="lazy"
               onerror="this.src='${fallbackPoster}'; this.onerror=null;">
          <div class="recommendation-overlay">
            <button class="play-recommendation-btn">
              <i class="fas fa-play"></i>
              <span>Watch Now</span>
            </button>
          </div>
        </div>
        <div class="recommendation-info">
          <h4 class="recommendation-title">${item.Title}</h4>
          <div class="recommendation-meta">
            <span class="recommendation-year">${item.Year}</span>
            <span class="recommendation-type">${item.Type === 'series' ? 'Series' : 'Movie'}</span>
            ${rating ? `<span class="recommendation-rating">${rating}</span>` : ''}
          </div>
          ${genres ? `<div class="recommendation-genres">${genres}</div>` : ''}
          ${aiScore ? `<div class="ai-score" title="AI Recommendation Score">${aiScore}</div>` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Add event handlers for recommendation cards
   */
  addRecommendationHandlers() {
    const cards = document.querySelectorAll('.recommendation-card');
    cards.forEach(card => {
      const playBtn = card.querySelector('.play-recommendation-btn');
      if (playBtn) {
        playBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const imdbId = card.dataset.imdbId;
          const type = card.dataset.type;
          this.playRecommendation(imdbId, type);
        });
      }
    });
  }

  /**
   * Play a recommended movie/series
   */
  async playRecommendation(imdbId, type) {
    console.log('🎬 Playing recommendation:', { imdbId, type });

    // Set the appropriate tab
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(btn => btn.classList.remove('active'));

    let targetTab = 'all';
    if (type === 'movie') targetTab = 'movies';
    if (type === 'series') targetTab = 'series';

    const targetButton = document.querySelector(`[data-tab="${targetTab}"]`);
    if (targetButton) {
      targetButton.classList.add('active');
    }

    // Set the IMDb input
    const imdbInput = document.getElementById('imdbInput');
    if (imdbInput) {
      imdbInput.value = imdbId;
    }

    // Clear search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.value = '';
    }

    // Trigger play button click
    const playButton = document.getElementById('playButton');
    if (playButton) {
      playButton.click();
    }

    // Scroll to player
    const playerSection = document.querySelector('.player-section');
    if (playerSection) {
      playerSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

// Initialize the AI Recommendation Engine
window.aiRecommendationEngine = new AIRecommendationEngine();

// Add a simple test function for debugging
window.testRecommendations = async function() {
  console.log('🧪 Testing recommendation system...');
  try {
    const recommendations = await window.aiRecommendationEngine.getRecommendations(['Action'], 'all', 5);
    console.log('🎯 Test recommendations:', recommendations);
    return recommendations;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return [];
  }
};
