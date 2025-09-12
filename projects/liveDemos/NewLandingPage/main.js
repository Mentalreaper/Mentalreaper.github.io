/**
 * Browser Performance Monitor
 * Monitors RAM usage and estimates CPU usage within browser constraints
 * Note: Browser security restrictions limit access to system resources
 */

class BrowserPerformanceMonitor {
  constructor() {
    this.isMemoryAPIAvailable = this.checkMemoryAPI();
    this.cpuEstimationRunning = false;
    this.lastCPUCheck = null;
  }

  /**
   * Check if the browser supports the memory API
   */
  checkMemoryAPI() {
    return typeof performance !== 'undefined' && 
           performance.memory && 
           typeof performance.memory.usedJSHeapSize !== 'undefined';
  }

  /**
   * Get RAM usage information
   * Note: Only works in Chrome/Chromium-based browsers with proper flags
   * @returns {Object|null} Memory usage data or null if not available
   */
  getRAMUsage() {
    if (!this.isMemoryAPIAvailable) {
      console.warn('Memory API not available in this browser');
      return null;
    }

    const memory = performance.memory;
    
    return {
      // All values are in bytes
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      
      // Formatted values
      usedJSHeapSizeMB: (memory.usedJSHeapSize / 1048576).toFixed(2),
      totalJSHeapSizeMB: (memory.totalJSHeapSize / 1048576).toFixed(2),
      jsHeapSizeLimitMB: (memory.jsHeapSizeLimit / 1048576).toFixed(2),
      
      // Usage percentage
      usagePercentage: ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2)
    };
  }

  /**
   * Estimate CPU usage by measuring computation time
   * This is an approximation, not actual CPU usage
   * @param {number} duration - How long to measure (in milliseconds)
   * @returns {Promise<number>} Estimated CPU load percentage
   */
  async estimateCPUUsage(duration = 1000) {
    if (this.cpuEstimationRunning) {
      console.warn('CPU estimation already running');
      return null;
    }

    this.cpuEstimationRunning = true;
    
    const iterations = 1000000;
    const samples = [];
    const sampleCount = Math.floor(duration / 100); // Sample every 100ms
    
    // Baseline: measure how long iterations take on idle
    const baselineStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      Math.sqrt(i);
    }
    const baselineTime = performance.now() - baselineStart;
    
    // Take multiple samples over the duration
    for (let s = 0; s < sampleCount; s++) {
      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        Math.sqrt(i);
      }
      const elapsed = performance.now() - start;
      
      // Calculate load as ratio of current time to baseline
      const load = Math.min(100, (elapsed / baselineTime - 1) * 100);
      samples.push(Math.max(0, load));
      
      // Wait before next sample
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.cpuEstimationRunning = false;
    
    // Return average of samples
    const avgLoad = samples.reduce((a, b) => a + b, 0) / samples.length;
    return parseFloat(avgLoad.toFixed(2));
  }

  /**
   * Alternative CPU measurement using requestAnimationFrame
   * Measures how well the browser maintains 60 FPS
   * @param {number} duration - How long to measure (in milliseconds)
   * @returns {Promise<Object>} Frame rate statistics
   */
  measureFrameRate(duration = 3000) {
    return new Promise((resolve) => {
      const frames = [];
      let startTime = null;
      let frameCount = 0;
      
      const measureFrame = (timestamp) => {
        if (!startTime) {
          startTime = timestamp;
        }
        
        frameCount++;
        frames.push(timestamp);
        
        if (timestamp - startTime < duration) {
          requestAnimationFrame(measureFrame);
        } else {
          // Calculate statistics
          const elapsed = timestamp - startTime;
          const avgFPS = (frameCount / elapsed) * 1000;
          
          // Calculate frame time variations
          const frameTimes = [];
          for (let i = 1; i < frames.length; i++) {
            frameTimes.push(frames[i] - frames[i - 1]);
          }
          
          const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
          const maxFrameTime = Math.max(...frameTimes);
          const minFrameTime = Math.min(...frameTimes);
          
          // Estimate CPU load based on frame drops
          // If maintaining 60 FPS perfectly, load is low
          // As FPS drops, estimated load increases
          const targetFPS = 60;
          const estimatedLoad = Math.min(100, Math.max(0, 
            ((targetFPS - avgFPS) / targetFPS) * 100
          ));
          
          resolve({
            averageFPS: avgFPS.toFixed(2),
            frameCount: frameCount,
            duration: elapsed.toFixed(2),
            avgFrameTime: avgFrameTime.toFixed(2),
            maxFrameTime: maxFrameTime.toFixed(2),
            minFrameTime: minFrameTime.toFixed(2),
            estimatedCPULoad: estimatedLoad.toFixed(2)
          });
        }
      };
      
      requestAnimationFrame(measureFrame);
    });
  }

  /**
   * Get all available performance metrics
   * @returns {Promise<Object>} Combined performance data
   */
  async getAllMetrics() {
    const metrics = {
      timestamp: new Date().toISOString(),
      memory: this.getRAMUsage(),
      navigation: this.getNavigationTiming(),
      resources: this.getResourceCount()
    };

    // Add frame rate measurement
    console.log('Measuring frame rate (3 seconds)...');
    metrics.frameRate = await this.measureFrameRate();
    
    return metrics;
  }

  /**
   * Get navigation timing information
   * @returns {Object} Page load performance data
   */
  getNavigationTiming() {
    if (!performance.timing) {
      return null;
    }

    const timing = performance.timing;
    const navigation = {
      // Page load times
      domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
      loadComplete: timing.loadEventEnd - timing.loadEventStart,
      domInteractive: timing.domInteractive - timing.domLoading,
      
      // Network times
      fetchTime: timing.responseEnd - timing.fetchStart,
      dnsTime: timing.domainLookupEnd - timing.domainLookupStart,
      tcpTime: timing.connectEnd - timing.connectStart,
      
      // Total time
      totalLoadTime: timing.loadEventEnd - timing.navigationStart
    };

    return navigation;
  }

  /**
   * Get count of loaded resources
   * @returns {Object} Resource statistics
   */
  getResourceCount() {
    if (!performance.getEntriesByType) {
      return null;
    }

    const resources = performance.getEntriesByType('resource');
    const byType = {};
    
    resources.forEach(resource => {
      const type = resource.initiatorType || 'other';
      byType[type] = (byType[type] || 0) + 1;
    });

    return {
      total: resources.length,
      byType: byType
    };
  }

  /**
   * Start continuous monitoring
   * @param {number} interval - Update interval in milliseconds
   * @param {Function} callback - Function to call with metrics
   * @returns {Function} Stop monitoring function
   */
  startMonitoring(interval = 5000, callback) {
    const monitor = async () => {
      const metrics = {
        timestamp: new Date().toISOString(),
        memory: this.getRAMUsage()
      };
      
      // Only estimate CPU occasionally as it takes time
      if (!this.lastCPUCheck || Date.now() - this.lastCPUCheck > 10000) {
        metrics.estimatedCPU = await this.estimateCPUUsage(500);
        this.lastCPUCheck = Date.now();
      }
      
      callback(metrics);
    };

    // Initial call
    monitor();
    
    // Set up interval
    const intervalId = setInterval(monitor, interval);
    
    // Return stop function
    return () => clearInterval(intervalId);
  }
}

// Example usage and utility functions
const performanceMonitor = new BrowserPerformanceMonitor();

/**
 * Simple function to get current RAM usage
 */
function getRAMUsage() {
  return performanceMonitor.getRAMUsage();
}

/**
 * Simple function to estimate CPU usage
 */
async function getCPUUsage() {
  return await performanceMonitor.estimateCPUUsage();
}

/**
 * Demo function to show all capabilities
 */
async function demo() {
  console.log('=== Browser Performance Monitor Demo ===\n');
  
  // Check RAM usage
  console.log('RAM Usage:');
  const ram = getRAMUsage();
  if (ram) {
    console.log(`  Used: ${ram.usedJSHeapSizeMB} MB`);
    console.log(`  Total: ${ram.totalJSHeapSizeMB} MB`);
    console.log(`  Limit: ${ram.jsHeapSizeLimitMB} MB`);
    console.log(`  Usage: ${ram.usagePercentage}%`);
  } else {
    console.log('  Not available (Chrome/Edge only)');
  }
  
  console.log('\nEstimating CPU usage...');
  const cpu = await getCPUUsage();
  console.log(`  Estimated Load: ${cpu}%`);
  
  console.log('\nMeasuring frame rate...');
  const frameStats = await performanceMonitor.measureFrameRate(2000);
  console.log(`  Average FPS: ${frameStats.averageFPS}`);
  console.log(`  Estimated CPU Load: ${frameStats.estimatedCPULoad}%`);
  
  console.log('\n=== Starting continuous monitoring (5 second intervals) ===');
  const stopMonitoring = performanceMonitor.startMonitoring(5000, (metrics) => {
    console.log(`\n[${new Date(metrics.timestamp).toLocaleTimeString()}]`);
    if (metrics.memory) {
      console.log(`  RAM: ${metrics.memory.usedJSHeapSizeMB} MB (${metrics.memory.usagePercentage}%)`);
    }
    if (metrics.estimatedCPU !== undefined) {
      console.log(`  CPU: ~${metrics.estimatedCPU}%`);
    }
  });
  
  // Stop after 20 seconds
  setTimeout(() => {
    stopMonitoring();
    console.log('\n=== Monitoring stopped ===');
  }, 20000);
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BrowserPerformanceMonitor,
    getRAMUsage,
    getCPUUsage
  };
}
