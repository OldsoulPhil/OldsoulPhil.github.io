// Client-side Website Tracker using localStorage
(function() {
  const STORAGE_KEY = 'site_tracker_stats';
  const VISITOR_KEY = 'site_visitor_id';
  const SESSION_KEY = 'site_session_id';
  
  // Generate unique IDs
  function generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }
  
  // Get or create visitor ID (persists across sessions)
  function getVisitorId() {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = generateId();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  }
  
  // Get or create session ID (resets on new browser session)
  function getSessionId() {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = generateId();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  }
  
  // Initialize or get tracking stats
  function getStats() {
    let stats = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
      totalVisits: 0,
      totalVisitors: 1,
      uniqueDates: [],
      clickedLinks: {},
      sessionHistory: [],
      createdAt: new Date().toISOString()
    };
    return stats;
  }
  
  // Save stats to localStorage
  function saveStats(stats) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }
  
  // Track page visit
  function trackVisit() {
    const stats = getStats();
    const today = new Date().toISOString().split('T')[0];
    const visitorId = getVisitorId();
    const sessionId = getSessionId();
    
    stats.totalVisits++;
    
    // Track unique dates visited
    if (!stats.uniqueDates.includes(today)) {
      stats.uniqueDates.push(today);
    }
    
    // Track session history
    const currentSession = {
      visitorId: visitorId,
      sessionId: sessionId,
      visitedAt: new Date().toISOString(),
      page: window.location.pathname || window.location.href,
      referrer: document.referrer || 'direct'
    };
    
    stats.sessionHistory.push(currentSession);
    // Keep only last 100 sessions to avoid localStorage bloat
    if (stats.sessionHistory.length > 100) {
      stats.sessionHistory.shift();
    }
    
    saveStats(stats);
    console.log('📊 Visit tracked:', currentSession);
  }
  
  // Track link clicks
  function trackLinkClick(event) {
    const target = event.target.closest('a');
    if (!target || !target.href) return;
    
    // Don't track internal navigation as link clicks
    if (target.href.startsWith(window.location.origin)) return;
    
    const stats = getStats();
    const linkUrl = target.href;
    const linkText = target.textContent.trim() || target.getAttribute('aria-label') || 'Unknown';
    
    if (!stats.clickedLinks[linkUrl]) {
      stats.clickedLinks[linkUrl] = {
        count: 0,
        text: linkText,
        firstClicked: new Date().toISOString(),
        lastClicked: new Date().toISOString()
      };
    }
    
    stats.clickedLinks[linkUrl].count++;
    stats.clickedLinks[linkUrl].lastClicked = new Date().toISOString();
    
    saveStats(stats);
    console.log('🔗 Link click tracked:', linkUrl, '(' + stats.clickedLinks[linkUrl].count + ' clicks)');
  }
  
  // Display tracking stats in console
  window.viewTrackerStats = function() {
    const stats = getStats();
    console.log('%c📈 WEBSITE TRACKER STATS', 'font-size: 16px; font-weight: bold; color: #9333ea;');
    console.log('%cVisitor ID: ' + getVisitorId(), 'color: #06b6d4;');
    console.log('%cTotal Visits: ' + stats.totalVisits, 'color: #10b981;');
    console.log('%cUnique Days: ' + stats.uniqueDates.length, 'color: #f59e0b;');
    console.log('%cPages Visited: ' + stats.sessionHistory.length, 'color: #8b5cf6;');
    console.log('%c\nCLICKED EXTERNAL LINKS:', 'font-size: 14px; font-weight: bold; color: #ef4444;');
    
    if (Object.keys(stats.clickedLinks).length === 0) {
      console.log('No external links clicked yet');
    } else {
      Object.entries(stats.clickedLinks).forEach(([url, data]) => {
        console.log(`  🔗 "${data.text}"\n     URL: ${url}\n     Clicks: ${data.count}`);
      });
    }
    
    console.log('%c\nRECENT VISITS (Last 10):', 'font-size: 14px; font-weight: bold; color: #06b6d4;');
    stats.sessionHistory.slice(-10).forEach((session, i) => {
      console.log(`  ${i + 1}. ${new Date(session.visitedAt).toLocaleString()} - ${session.page}`);
    });
  };
  
  // Export stats as JSON
  window.exportTrackerStats = function() {
    const stats = getStats();
    const dataStr = JSON.stringify(stats, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tracker_stats_' + new Date().toISOString().split('T')[0] + '.json';
    link.click();
    console.log('✅ Stats exported to JSON file');
  };
  
  // Initialize tracking
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      trackVisit();
      document.addEventListener('click', trackLinkClick);
    });
  } else {
    trackVisit();
    document.addEventListener('click', trackLinkClick);
  }
  
  console.log('%c✅ Tracker initialized', 'color: #10b981; font-weight: bold;');
  console.log('%cRun viewTrackerStats() to see your tracking data', 'color: #06b6d4;');
  console.log('%cRun exportTrackerStats() to download as JSON', 'color: #06b6d4;');
})();
