// Movie Search Functionality
class MovieSearch {
  constructor() {
    this.searchTimeout = null;
    this.currentResults = [];
    this.isSearching = false;
    this.imdbIdCache = new Map(); // Cache for TMDB to IMDb ID mappings
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearchBtn');
    const dropdown = document.getElementById('searchDropdown');

    // Search input events
    searchInput.addEventListener('input', (e) => this.handleSearchInput(e));
    searchInput.addEventListener('focus', () => this.showDropdownIfResults());
    searchInput.addEventListener('blur', () => this.hideDropdownDelayed());
    searchInput.addEventListener('keydown', (e) => this.handleKeyNavigation(e));

    // Clear button
    clearBtn.addEventListener('click', () => this.clearSearch());

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-input-wrapper') && !e.target.closest('.search-dropdown')) {
        this.hideDropdown();
      }
    });

    // Prevent dropdown from closing when clicking inside it
    dropdown.addEventListener('mousedown', (e) => e.preventDefault());
  }

  handleKeyNavigation(e) {
    const dropdown = document.getElementById('searchDropdown');
    const results = dropdown.querySelectorAll('.search-result');

    if (results.length === 0) return;

    let currentIndex = Array.from(results).findIndex(item => item.classList.contains('highlighted'));

    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        currentIndex = currentIndex < results.length - 1 ? currentIndex + 1 : 0;
        this.highlightResult(results, currentIndex);
        break;
      case 'ArrowUp':
        e.preventDefault();
        currentIndex = currentIndex > 0 ? currentIndex - 1 : results.length - 1;
        this.highlightResult(results, currentIndex);
        break;
      case 'Enter':
        e.preventDefault();
        if (currentIndex >= 0 && results[currentIndex]) {
          const imdbId = results[currentIndex].dataset.imdbId;
          const movie = this.currentResults.find(m => m.imdbID === imdbId);
          if (movie) this.selectResult(movie);
        }
        break;
      case 'Escape':
        this.hideDropdown();
        break;
    }
  }

  highlightResult(results, index) {
    results.forEach((result, i) => {
      result.classList.toggle('highlighted', i === index);
    });
  }

  handleSearchInput(e) {
    const query = e.target.value.trim();
    const clearBtn = document.getElementById('clearSearchBtn');

    // Show/hide clear button
    clearBtn.style.display = query ? 'flex' : 'none';

    // Clear previous timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    if (query.length < 2) {
      this.hideDropdown();
      return;
    }

    // Fast debounce search with shorter delays
    let delay = 200;
    if (query.length <= 2) {
      delay = 300; // Shorter delay for very short queries
    } else if (query.length <= 4) {
      delay = 150; // Fast delay for short queries
    } else {
      delay = 100; // Very fast for longer queries
    }

    this.searchTimeout = setTimeout(() => {
      this.searchMovies(query);
    }, delay);
  }

  async searchMovies(query) {
    if (this.isSearching) return;

    this.isSearching = true;
    this.showLoadingState();

    console.log('🔍 Fast search for:', query);

    try {
      // Use Promise.allSettled for parallel execution with timeout
      const searchPromises = [
        this.searchOMDbFast(query),
        this.searchTMDBFast(query)
      ];

      // Add TVMaze only for longer queries to avoid too many calls
      if (query.length >= 4) {
        searchPromises.push(this.searchTVMazeFast(query));
      }

      // Set a timeout for all searches
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Search timeout')), 3000)
      );

      const results = await Promise.race([
        Promise.allSettled(searchPromises),
        timeoutPromise
      ]);

      let allResults = [];

      // Process results from all APIs
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.length > 0) {
          const apiName = ['OMDb', 'TMDB', 'TVMaze'][index];
          console.log(`✅ ${apiName} results:`, result.value.length);
          allResults = [...allResults, ...result.value];
        }
      });

      // Quick deduplication and sorting
      const uniqueResults = this.fastRemoveDuplicates(allResults);

      if (uniqueResults.length > 0) {
        // Sort by relevance and limit results
        const sortedResults = uniqueResults
          .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
          .slice(0, 8);

        this.currentResults = sortedResults;
        this.displayResults(this.currentResults);
        console.log(`📊 Fast results: ${sortedResults.length}`);
      } else {
        this.showNoResults(query);
      }
    } catch (error) {
      console.error('Search error:', error);
      this.showErrorState();
    } finally {
      this.isSearching = false;
    }
  }

  async searchOMDb(query) {
    const omdbKeys = ['8265bd1c', 'b9a9e5c6', 'a1b2c3d4'];
    let allResults = [];

    // Try multiple search strategies for better coverage
    const searchQueries = this.generateSearchQueries(query);

    for (const apiKey of omdbKeys) {
      try {
        // Search with multiple query variations
        for (const searchQuery of searchQueries) {
          try {
            const url = `https://www.omdbapi.com/?s=${encodeURIComponent(searchQuery)}&apikey=${apiKey}&page=1`;
            const response = await fetch(url);

            if (response.ok) {
              const data = await response.json();
              if (data.Response === 'True' && data.Search) {
                const results = data.Search.map(item => ({
                  Title: item.Title,
                  Year: item.Year,
                  imdbID: item.imdbID,
                  Type: item.Type,
                  Poster: item.Poster !== 'N/A' ? item.Poster : null,
                  relevance: this.calculateRelevance(item.Title, query)
                }));
                allResults = [...allResults, ...results];
              }
            }
          } catch (queryError) {
            console.warn(`OMDb query "${searchQuery}" failed:`, queryError);
            continue;
          }
        }

        if (allResults.length > 0) {
          // Remove duplicates and sort by relevance
          const uniqueResults = this.removeDuplicatesByImdbId(allResults);
          return uniqueResults.sort((a, b) => b.relevance - a.relevance);
        }
      } catch (error) {
        console.warn(`OMDb key ${apiKey} failed:`, error);
        continue;
      }
    }
    return [];
  }

  // Fast search methods with minimal API calls
  async searchOMDbFast(query) {
    const omdbKeys = ['8265bd1c', 'b9a9e5c6'];

    for (const apiKey of omdbKeys) {
      try {
        const url = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${apiKey}&page=1`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          if (data.Response === 'True' && data.Search) {
            return data.Search.map(item => ({
              Title: item.Title,
              Year: item.Year,
              imdbID: item.imdbID,
              Type: item.Type,
              Poster: item.Poster !== 'N/A' ? item.Poster : null,
              relevance: this.fastCalculateRelevance(item.Title, query)
            }));
          }
        }
      } catch (error) {
        console.warn(`OMDb fast search failed:`, error);
        continue;
      }
    }
    return [];
  }

  async searchTMDBFast(query) {
    const tmdbKey = '3fd2be6f0c70a2a598f084ddfb75487c';

    try {
      // Search both movies and TV in parallel
      const [movieResponse, tvResponse] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(query)}&page=1`),
        fetch(`https://api.themoviedb.org/3/search/tv?api_key=${tmdbKey}&query=${encodeURIComponent(query)}&page=1`)
      ]);

      let results = [];

      // Process movie results and get IMDb IDs
      if (movieResponse.ok) {
        const movieData = await movieResponse.json();
        if (movieData.results) {
          const moviePromises = movieData.results.slice(0, 5).map(async (item) => {
            const imdbId = await this.getTMDBImdbId(item.id, 'movie', tmdbKey);
            return {
              Title: item.title,
              Year: item.release_date ? item.release_date.substring(0, 4) : 'Unknown',
              imdbID: imdbId || `tmdb${item.id}`,
              Type: 'movie',
              Poster: item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : null,
              relevance: this.fastCalculateRelevance(item.title, query)
            };
          });

          const movieResults = await Promise.all(moviePromises);
          results = [...results, ...movieResults];
        }
      }

      // Process TV results and get IMDb IDs
      if (tvResponse.ok) {
        const tvData = await tvResponse.json();
        if (tvData.results) {
          const tvPromises = tvData.results.slice(0, 5).map(async (item) => {
            const imdbId = await this.getTMDBImdbId(item.id, 'tv', tmdbKey);
            return {
              Title: item.name,
              Year: item.first_air_date ? item.first_air_date.substring(0, 4) : 'Unknown',
              imdbID: imdbId || `tmdb${item.id}`,
              Type: 'series',
              Poster: item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : null,
              relevance: this.fastCalculateRelevance(item.name, query)
            };
          });

          const tvResults = await Promise.all(tvPromises);
          results = [...results, ...tvResults];
        }
      }

      return results;
    } catch (error) {
      console.warn('TMDB fast search failed:', error);
      return [];
    }
  }

  async getTMDBImdbId(tmdbId, type, apiKey) {
    const cacheKey = `${type}-${tmdbId}`;

    // Check cache first
    if (this.imdbIdCache.has(cacheKey)) {
      return this.imdbIdCache.get(cacheKey);
    }

    try {
      const response = await fetch(`https://api.themoviedb.org/3/${type}/${tmdbId}/external_ids?api_key=${apiKey}`);

      if (response.ok) {
        const data = await response.json();
        const imdbId = data.imdb_id || null;

        // Cache the result (even if null)
        this.imdbIdCache.set(cacheKey, imdbId);

        if (imdbId) {
          console.log(`✅ Found IMDb ID for TMDB ${tmdbId}: ${imdbId}`);
        }

        return imdbId;
      }
    } catch (error) {
      console.warn(`Failed to get IMDb ID for TMDB ${tmdbId}:`, error);
    }

    // Cache null result to avoid repeated failed requests
    this.imdbIdCache.set(cacheKey, null);
    return null;
  }

  async searchTVMazeFast(query) {
    try {
      const response = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          return data.slice(0, 10).map(item => ({
            Title: item.show.name,
            Year: item.show.premiered ? item.show.premiered.substring(0, 4) : 'Unknown',
            imdbID: item.show.externals?.imdb || `tvmaze${item.show.id}`,
            Type: 'series',
            Poster: item.show.image?.medium || null,
            relevance: this.fastCalculateRelevance(item.show.name, query)
          }));
        }
      }
    } catch (error) {
      console.warn('TVMaze fast search failed:', error);
    }
    return [];
  }

  fastCalculateRelevance(title, query) {
    const titleLower = title.toLowerCase();
    const queryLower = query.toLowerCase();

    // Quick relevance calculation for speed
    if (titleLower === queryLower) return 100;
    if (titleLower.startsWith(queryLower)) return 90;
    if (titleLower.includes(queryLower)) return 70;

    // Check word-level matching
    const titleWords = titleLower.split(/\s+/);
    const queryWords = queryLower.split(/\s+/);

    let matches = 0;
    for (const qWord of queryWords) {
      for (const tWord of titleWords) {
        if (tWord.startsWith(qWord) || tWord.includes(qWord)) {
          matches++;
          break;
        }
      }
    }

    return (matches / queryWords.length) * 60;
  }

  fastRemoveDuplicates(results) {
    const seen = new Set();
    return results.filter(result => {
      const key = `${result.Title.toLowerCase()}-${result.Year}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  generateSearchQueries(query) {
    // Simplified for speed - only use original query and main words
    const queries = [query];
    const words = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);

    // Add only the most important variations
    if (words.length > 1) {
      queries.push(...words.slice(0, 2)); // Only first 2 words
    }

    return [...new Set(queries)].slice(0, 3); // Limit to 3 queries max
  }

  generatePartialWordQueries(word) {
    const partials = [];

    // For words 3+ characters, try common word patterns
    if (word.length >= 3) {
      // Add the word as-is for exact partial matching
      partials.push(word);

      // For longer words, add truncated versions
      if (word.length >= 4) {
        partials.push(word.substring(0, word.length - 1)); // Remove last char
      }

      if (word.length >= 5) {
        partials.push(word.substring(0, word.length - 2)); // Remove last 2 chars
      }

      // Add common word endings/variations
      const commonEndings = ['s', 'ed', 'ing', 'er', 'est', 'ly', 'tion', 'man', 'men'];
      const baseWord = word.replace(/(?:s|ed|ing|er|est|ly|tion)$/, '');

      if (baseWord !== word && baseWord.length >= 3) {
        partials.push(baseWord);

        // Try adding different endings to base word
        for (const ending of commonEndings) {
          if (baseWord + ending !== word) {
            partials.push(baseWord + ending);
          }
        }
      }
    }

    return partials.slice(0, 3); // Limit partial variations
  }

  calculateRelevance(title, query) {
    const titleLower = title.toLowerCase();
    const queryLower = query.toLowerCase();

    // Exact match gets highest score
    if (titleLower === queryLower) return 100;

    // Title starts with query gets high score
    if (titleLower.startsWith(queryLower)) return 95;

    const titleWords = titleLower.split(/\s+/);
    const queryWords = queryLower.split(/\s+/);

    // Check for exact word matches first
    let exactWordMatches = 0;
    let partialWordMatches = 0;
    let wordStartMatches = 0;
    let substringMatches = 0;

    for (const qWord of queryWords) {
      let foundExact = false;
      let foundStart = false;
      let foundPartial = false;

      for (const tWord of titleWords) {
        // Exact word match
        if (tWord === qWord) {
          exactWordMatches++;
          foundExact = true;
          break;
        }
        // Word starts with query word
        else if (tWord.startsWith(qWord)) {
          wordStartMatches++;
          foundStart = true;
        }
        // Query word starts with title word (reverse partial)
        else if (qWord.startsWith(tWord) && tWord.length >= 3) {
          partialWordMatches++;
          foundPartial = true;
        }
        // Title word contains query word
        else if (tWord.includes(qWord) && qWord.length >= 3) {
          substringMatches++;
          foundPartial = true;
        }
        // Query word contains title word (for partial searches)
        else if (qWord.includes(tWord) && tWord.length >= 3) {
          partialWordMatches++;
          foundPartial = true;
        }
      }

      // Also check if query appears anywhere in title for partial matching
      if (!foundExact && !foundStart && !foundPartial && titleLower.includes(qWord)) {
        substringMatches++;
      }
    }

    // Calculate score based on match quality
    const totalQueryWords = queryWords.length;

    // All words exact match
    if (exactWordMatches === totalQueryWords) return 90;

    // Most words exact match
    if (exactWordMatches > totalQueryWords * 0.7) return 85;

    // All words start match
    if (wordStartMatches === totalQueryWords) return 80;

    // Mix of exact and start matches
    if (exactWordMatches + wordStartMatches === totalQueryWords) return 75;

    // Most words have start matches
    if (wordStartMatches > totalQueryWords * 0.7) return 70;

    // All words found as partials/substrings
    if (partialWordMatches + substringMatches + exactWordMatches + wordStartMatches >= totalQueryWords) return 65;

    // Contains query as complete substring
    if (titleLower.includes(queryLower)) return 60;

    // Partial matches scoring
    const totalMatches = exactWordMatches + wordStartMatches + partialWordMatches + substringMatches;
    const matchRatio = totalMatches / totalQueryWords;

    if (matchRatio >= 0.8) return 55;
    if (matchRatio >= 0.6) return 50;
    if (matchRatio >= 0.4) return 45;
    if (matchRatio >= 0.2) return 40;

    // Very loose matching for partial words
    let looseMatches = 0;
    for (const qWord of queryWords) {
      if (qWord.length >= 3) {
        for (const tWord of titleWords) {
          // Check if either word contains the other (for very partial matches)
          if ((tWord.includes(qWord.substring(0, Math.min(qWord.length, 4))) && qWord.length >= 3) ||
              (qWord.includes(tWord.substring(0, Math.min(tWord.length, 4))) && tWord.length >= 3)) {
            looseMatches++;
            break;
          }
        }
      }
    }

    return Math.max(10, (looseMatches / totalQueryWords) * 35);
  }

  removeDuplicatesByImdbId(results) {
    const seen = new Map();
    return results.filter(result => {
      if (seen.has(result.imdbID)) {
        // Keep the one with higher relevance
        if (result.relevance > seen.get(result.imdbID).relevance) {
          seen.set(result.imdbID, result);
          return true;
        }
        return false;
      }
      seen.set(result.imdbID, result);
      return true;
    });
  }

  async searchTMDB(query) {
    // TMDB API keys (register at https://www.themoviedb.org/settings/api)
    const tmdbKeys = [
      '3fd2be6f0c70a2a598f084ddfb75487c', // Primary TMDB key
      '1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p', // Backup TMDB key
      '9f8e7d6c5b4a3928374650192837465'   // Fallback TMDB key
    ];

    let allResults = [];
    const searchQueries = this.generateSearchQueries(query);

    for (const apiKey of tmdbKeys) {
      try {
        // Search with multiple query variations
        for (const searchQuery of searchQueries) {
          try {
            // Search both movies and TV shows
            const movieUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(searchQuery)}&include_adult=false&language=en-US&page=1`;
            const tvUrl = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodeURIComponent(searchQuery)}&include_adult=false&language=en-US&page=1`;

            const [movieResponse, tvResponse] = await Promise.all([
              fetch(movieUrl),
              fetch(tvUrl)
            ]);

            if (movieResponse.ok) {
              const movieData = await movieResponse.json();
              if (movieData.results) {
                const movieResults = movieData.results.map(item => ({
                  Title: item.title,
                  Year: item.release_date ? item.release_date.substring(0, 4) : 'Unknown',
                  imdbID: `tmdb${item.id}`,
                  Type: 'movie',
                  Poster: item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : null,
                  relevance: this.calculateRelevance(item.title, query)
                }));
                allResults = [...allResults, ...movieResults];
              }
            }

            if (tvResponse.ok) {
              const tvData = await tvResponse.json();
              if (tvData.results) {
                const tvResults = tvData.results.map(item => ({
                  Title: item.name,
                  Year: item.first_air_date ? item.first_air_date.substring(0, 4) : 'Unknown',
                  imdbID: `tmdb${item.id}`,
                  Type: 'series',
                  Poster: item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : null,
                  relevance: this.calculateRelevance(item.name, query)
                }));
                allResults = [...allResults, ...tvResults];
              }
            }
          } catch (queryError) {
            console.warn(`TMDB query "${searchQuery}" failed:`, queryError);
            continue;
          }
        }

        if (allResults.length > 0) {
          // Remove duplicates and sort by relevance
          const uniqueResults = this.removeDuplicatesByTitle(allResults);
          return uniqueResults.sort((a, b) => b.relevance - a.relevance);
        }
      } catch (error) {
        console.warn(`TMDB key ${apiKey} failed:`, error);
        continue;
      }
    }
    return [];
  }

  removeDuplicatesByTitle(results) {
    const seen = new Map();
    return results.filter(result => {
      const key = `${result.Title.toLowerCase()}-${result.Year}`;
      if (seen.has(key)) {
        // Keep the one with higher relevance
        if (result.relevance > seen.get(key).relevance) {
          seen.set(key, result);
          return true;
        }
        return false;
      }
      seen.set(key, result);
      return true;
    });
  }

  async searchTVMaze(query) {
    try {
      const searchQueries = this.generateSearchQueries(query);
      let allResults = [];

      for (const searchQuery of searchQueries) {
        try {
          const url = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(searchQuery)}`;
          const response = await fetch(url);

          if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
              const results = data.map(item => ({
                Title: item.show.name,
                Year: item.show.premiered ? item.show.premiered.substring(0, 4) : 'Unknown',
                imdbID: item.show.externals?.imdb || `tvmaze${item.show.id}`,
                Type: 'series',
                Poster: item.show.image?.medium || null,
                relevance: this.calculateRelevance(item.show.name, query)
              }));
              allResults = [...allResults, ...results];
            }
          }
        } catch (queryError) {
          console.warn(`TVMaze query "${searchQuery}" failed:`, queryError);
          continue;
        }
      }

      if (allResults.length > 0) {
        const uniqueResults = this.removeDuplicatesByTitle(allResults);
        return uniqueResults.sort((a, b) => b.relevance - a.relevance);
      }
    } catch (error) {
      console.warn('TVMaze API failed:', error);
    }
    return [];
  }

  removeDuplicates(results) {
    const seen = new Map();
    return results.filter(result => {
      const key = `${result.Title.toLowerCase()}-${result.Year}`;
      if (seen.has(key)) {
        // Keep the one with higher relevance if available
        if (result.relevance && (!seen.get(key).relevance || result.relevance > seen.get(key).relevance)) {
          seen.set(key, result);
          return true;
        }
        return false;
      }
      seen.set(key, result);
      return true;
    });
  }



  showLoadingState() {
    const dropdown = document.getElementById('searchDropdown');
    dropdown.innerHTML = `
      <div class="dropdown-loading">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Searching...</span>
      </div>
    `;
    dropdown.style.display = 'block';
  }

  displayResults(results) {
    const dropdown = document.getElementById('searchDropdown');

    if (results.length === 0) {
      this.showNoResults();
      return;
    }

    const resultsHTML = results.map(movie => this.createResultItem(movie)).join('');
    dropdown.innerHTML = resultsHTML;
    dropdown.style.display = 'block';

    // Add click listeners to results
    dropdown.querySelectorAll('.search-result').forEach((item, index) => {
      item.addEventListener('click', () => this.selectResult(results[index]));

      // Add mouse enter/leave for highlighting
      item.addEventListener('mouseenter', () => {
        // Remove highlight from all items
        dropdown.querySelectorAll('.search-result').forEach(r => r.classList.remove('highlighted'));
        // Highlight current item
        item.classList.add('highlighted');
      });
    });
  }

  createResultItem(movie) {
    const year = movie.Year || 'Unknown';
    const type = this.getTypeDisplayName(movie.Type);
    const poster = movie.Poster !== 'N/A' ? movie.Poster : null;

    return `
      <div class="search-result" data-imdb-id="${movie.imdbID}">
        <div class="result-poster">
          ${poster ?
            `<img src="${poster}" alt="${movie.Title}" onerror="this.parentElement.innerHTML='<i class=\\"fas fa-film\\"></i>'">` :
            '<i class="fas fa-film"></i>'
          }
        </div>
        <div class="result-details">
          <div class="result-title">${movie.Title}</div>
          <div class="result-meta">
            <span class="result-year">${year}</span>
            <span class="result-type">${type}</span>
          </div>
        </div>
      </div>
    `;
  }

  getTypeDisplayName(type) {
    switch(type?.toLowerCase()) {
      case 'movie': return 'Movie';
      case 'series': return 'Series';
      case 'episode': return 'Episode';
      default: return 'Unknown';
    }
  }

  selectResult(movie) {
    const searchInput = document.getElementById('searchInput');
    const imdbInput = document.getElementById('imdbInput');

    // Fill the search input with selected title
    searchInput.value = movie.Title;

    // Fill the IMDb input with the ID
    imdbInput.value = movie.imdbID;

    // Store the selected movie data for watch history
    window.selectedMovieData = {
      title: movie.Title,
      poster: movie.Poster,
      year: movie.Year,
      type: movie.Type,
      imdbID: movie.imdbID
    };

    // Hide dropdown
    this.hideDropdown();

    // Hide clear button since we're not showing the search term anymore
    document.getElementById('clearSearchBtn').style.display = 'none';

    // Focus on play button for better UX
    setTimeout(() => {
      document.getElementById('playButton').focus();
    }, 100);

    console.log('Selected movie:', movie.Title, movie.imdbID);
    console.log('Stored movie data for watch history:', window.selectedMovieData);
  }

  showNoResults(query = '') {
    const dropdown = document.getElementById('searchDropdown');
    dropdown.innerHTML = `
      <div class="dropdown-no-results">
        <i class="fas fa-search"></i>
        <div class="no-results-text">
          <div class="no-results-title">No results found</div>
          <div class="no-results-subtitle">${query ? `Try searching for "${query}" with different keywords` : 'Try a different search term'}</div>
        </div>
      </div>
    `;
    dropdown.style.display = 'block';
  }

  showErrorState() {
    const dropdown = document.getElementById('searchDropdown');
    dropdown.innerHTML = `
      <div class="no-results">
        <i class="fas fa-exclamation-triangle"></i>
        <div>Search temporarily unavailable</div>
        <div style="font-size: 0.8rem; margin-top: 5px;">Please try again later</div>
      </div>
    `;
    dropdown.style.display = 'block';
  }

  clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearchBtn');

    searchInput.value = '';
    clearBtn.style.display = 'none';
    this.hideDropdown();
    searchInput.focus();
  }

  showDropdownIfResults() {
    if (this.currentResults.length > 0) {
      document.getElementById('searchDropdown').style.display = 'block';
    }
  }

  hideDropdownDelayed() {
    // Delay hiding to allow clicking on results
    setTimeout(() => {
      this.hideDropdown();
    }, 150);
  }

  hideDropdown() {
    document.getElementById('searchDropdown').style.display = 'none';
  }
}

// Initialize search functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.movieSearch = new MovieSearch();
});
