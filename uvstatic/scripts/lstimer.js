// ALWAYS LOAD THIS ASAP. Make it the first script linked in the head. Originally by voidless7125 on discord

// This bypasses the periodic content scanning
(function() {
  // Store original setInterval function
  const originalSetInterval = window.setInterval;
  
  // Override setInterval to either:
  // 1. Prevent security-related intervals from being created
  // 2. Create non-functional intervals that don't actually run the monitoring code
  window.setInterval = function(callback, delay) {
    // Check if this is a monitoring function
    if (delay === 1000 || delay === 1e3 || delay === 5000 || delay === 5e3) {
      console.log("Monitoring interval blocked");
      // Return a fake interval ID that won't do anything
      return Math.floor(Math.random() * 1000000);
    }
    
    // Allow other intervals to work normally
    return originalSetInterval(callback, delay);
  };
  
  // Clear any existing intervals
  const maxIntervalId = 1000;
  for (let i = 1; i <= maxIntervalId; i++) {
    window.clearInterval(i);
  }
})();
