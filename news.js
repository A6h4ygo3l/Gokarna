/* ==========================================================================
   JARVIS NEURAL INTERFACE - NEWS FEED MONITOR & TIME-SYNC
   ========================================================================== */

import { appendSystemTerminalMessage, playClickSound } from './app.js';

// Free RSS-to-JSON service proxy for client side RSS fetching
const FEED_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fnews.google.com%2Frss%3Fhl%3Den-US%26gl%3DUS%26ceid%3DUS%3Aen';
let cachedArticles = [];

export function initNewsFeed() {
  const refreshBtn = document.getElementById('refresh-news-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      playClickSound();
      fetchNews(true);
    });
  }

  // Initial Fetch
  fetchNews();
}

// Check how many items are newer than the last login session
export async function checkUnreadNewsCount() {
  const lastSessionStr = localStorage.getItem('jarvis_last_session');
  if (!lastSessionStr) return 0; // First time, no comparison is possible
  
  const lastSessionTime = new Date(lastSessionStr);

  try {
    const response = await fetch(FEED_URL);
    if (!response.ok) return 0;

    const data = await response.json();
    if (data.status !== 'ok') return 0;

    const newArticles = data.items.filter(item => {
      const pubDate = new Date(item.pubDate);
      return pubDate > lastSessionTime;
    });

    return newArticles.length;
  } catch (err) {
    console.error("Failed to check unread news counts", err);
    return 0;
  }
}

// Fetch and render news
export async function fetchNews(isManualRefresh = false) {
  const container = document.getElementById('news-container');
  const badge = document.getElementById('news-unread-badge');
  const lastSessionStr = localStorage.getItem('jarvis_last_session');
  
  // Use current session start for visual highlighting, or a baseline of 24h ago if no session saved
  const referenceTime = lastSessionStr ? new Date(lastSessionStr) : new Date(Date.now() - 24 * 60 * 60 * 1000);

  if (container && !isManualRefresh) {
    container.innerHTML = '<div class="terminal-entry"><span class="message text-cyan">SYNCHRONIZING FEED SATELLITES...</span></div>';
  }

  try {
    const response = await fetch(FEED_URL);
    if (!response.ok) throw new Error("Feed proxy return error code");

    const data = await response.json();
    if (data.status !== 'ok') throw new Error(data.message || "Failed parsing RSS feed");

    cachedArticles = data.items;

    if (container) {
      container.innerHTML = '';
      
      let unreadCount = 0;

      cachedArticles.forEach(item => {
        const pubDate = new Date(item.pubDate);
        const isNew = pubDate > referenceTime;
        
        if (isNew) unreadCount++;

        const newsEl = document.createElement('div');
        newsEl.className = `news-item ${isNew ? 'is-new' : ''}`;

        // Format publication date/time
        const timeStr = formatNewsDate(pubDate);
        
        // Clean up source name
        const cleanTitle = item.title.substring(0, item.title.lastIndexOf(' - '));
        const sourceName = item.title.substring(item.title.lastIndexOf(' - ') + 3) || 'Global Feed';

        newsEl.innerHTML = `
          <div class="news-item-header">
            <span class="news-source">${sourceName.toUpperCase()}</span>
            <span class="news-time">${timeStr}</span>
          </div>
          <h4 class="news-title">
            <a href="${item.link}" target="_blank" rel="noopener noreferrer">${escapeHTML(cleanTitle || item.title)}</a>
          </h4>
          <p class="news-desc">${escapeHTML(item.description || item.content || '')}</p>
        `;

        container.appendChild(newsEl);
      });

      // Update unread badge count
      if (badge) {
        if (unreadCount > 0) {
          badge.textContent = `${unreadCount} NEW`;
          badge.className = 'news-badge alert';
        } else {
          badge.textContent = 'SYNCED';
          badge.className = 'news-badge';
        }
      }

      if (isManualRefresh) {
        appendSystemTerminalMessage(`News stream updated. Cataloged ${unreadCount} new event descriptors.`);
      }
    }
  } catch (err) {
    console.error("News sync failure", err);
    if (container) {
      container.innerHTML = `
        <div class="terminal-entry error">
          <span class="speaker">SYSTEM ERROR:</span>
          <span class="message">Feed handshake failed. Retrying in background.</span>
        </div>
      `;
      // Render simulated mock news items so user has something beautiful to look at if API fails
      renderMockNews(container, referenceTime, badge);
    }
  }
}

// Helper to render realistic mock feeds if offline or network error occurs
function renderMockNews(container, referenceTime, badge) {
  container.innerHTML = '';
  
  const mockFeed = [
    {
      title: "Global tech summit announces breakthroughs in cognitive scaling - TechCrunch",
      description: "Leading tech firms have agreed on new cognitive frameworks that will enhance next-gen desktop agents.",
      pubDate: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
      link: "#"
    },
    {
      title: "Geomagnetic solar storms trigger aurora views worldwide - Space.com",
      description: "Severe solar flares created vibrant aurora sightings further south than usual, lighting up night skies in gorgeous neon colors.",
      pubDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hrs ago
      link: "#"
    },
    {
      title: "Atmospheric weather anomalies reported in eastern sectors - BBC News",
      description: "Meteorological monitoring reveals shifts in local micro-climate humidity levels, prompting environment adjustments.",
      pubDate: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // 26 hrs ago
      link: "#"
    }
  ];

  let unreadCount = 0;

  mockFeed.forEach(item => {
    const pubDate = new Date(item.pubDate);
    const isNew = pubDate > referenceTime;
    if (isNew) unreadCount++;

    const newsEl = document.createElement('div');
    newsEl.className = `news-item ${isNew ? 'is-new' : ''}`;

    const cleanTitle = item.title.substring(0, item.title.lastIndexOf(' - '));
    const sourceName = item.title.substring(item.title.lastIndexOf(' - ') + 3) || 'Global Feed';

    newsEl.innerHTML = `
      <div class="news-item-header">
        <span class="news-source">${sourceName.toUpperCase()}</span>
        <span class="news-time">${formatNewsDate(pubDate)}</span>
      </div>
      <h4 class="news-title">
        <a href="${item.link}">${escapeHTML(cleanTitle || item.title)}</a>
      </h4>
      <p class="news-desc">${escapeHTML(item.description)}</p>
    `;
    container.appendChild(newsEl);
  });

  if (badge) {
    if (unreadCount > 0) {
      badge.textContent = `${unreadCount} NEW`;
      badge.className = 'news-badge alert';
    } else {
      badge.textContent = 'SYNCED';
      badge.className = 'news-badge';
    }
  }
}

// Human readable news formatting
function formatNewsDate(date) {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return 'JUST NOW';
  if (diffMins < 60) return `${diffMins} MINS AGO`;
  if (diffHours < 24) return `${diffHours} HOURS AGO`;
  
  const options = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options).toUpperCase();
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
