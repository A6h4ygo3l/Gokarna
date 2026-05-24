/* ==========================================================================
   JARVIS NEURAL INTERFACE - DIAGNOSTICS & SYSTEM METRICS
   ========================================================================== */

import { appendSystemTerminalMessage, state } from './app.js';

export function initSystemDiagnostics() {
  // Begin Diagnostic Loops
  startMetricSimulators();
  initBatteryStatus();
  fetchEnvironmentData();
}

/* --- SYSTEM DIAGNOSTIC SIMULATIONS --- */
function startMetricSimulators() {
  const cpuBar = document.getElementById('cpu-bar');
  const cpuValue = document.getElementById('cpu-value');
  const ramBar = document.getElementById('ram-bar');
  const ramValue = document.getElementById('ram-value');
  const pingBar = document.getElementById('ping-bar');
  const pingValue = document.getElementById('ping-value');

  let ramPercent = 45; // Start baseline

  setInterval(() => {
    // CPU Fluctuations
    const cpuPercent = Math.floor(Math.random() * 45) + 12; // 12% - 57%
    if (cpuBar && cpuValue) {
      cpuBar.style.width = `${cpuPercent}%`;
      cpuValue.textContent = `${cpuPercent}%`;
      
      // Color coding warnings on cpu
      if (cpuPercent > 50) {
        cpuBar.className = 'metric-bar color-orange';
      } else {
        cpuBar.className = 'metric-bar color-cyan';
      }
    }

    // RAM Drifts
    ramPercent += (Math.random() * 4 - 2); // Drift +-2%
    ramPercent = Math.max(30, Math.min(85, Math.floor(ramPercent)));
    if (ramBar && ramValue) {
      ramBar.style.width = `${ramPercent}%`;
      ramValue.textContent = `${ramPercent}%`;
    }

    // Latency Ping ticks
    const ping = Math.floor(Math.random() * 35) + 12; // 12ms - 47ms
    if (pingBar && pingValue) {
      // 0 - 100ms scale
      const pct = Math.min(100, Math.floor((ping / 100) * 100));
      pingBar.style.width = `${pct}%`;
      pingValue.textContent = `${ping}ms`;
    }
  }, 2000);
}

/* --- BATTERY API CONFIGURATION --- */
function initBatteryStatus() {
  const batteryPctEl = document.getElementById('battery-pct');
  const batteryStatusEl = document.getElementById('battery-status');
  const powerIcon = document.getElementById('power-icon');
  const segments = document.querySelectorAll('.power-bars .power-segment');

  function updateBatteryUI(battery) {
    const level = Math.round(battery.level * 100);
    const charging = battery.charging;

    if (batteryPctEl) batteryPctEl.textContent = `${level}%`;
    if (batteryStatusEl) {
      batteryStatusEl.textContent = charging ? 'CHARGING VIA LINE' : 'DISCHARGING CELL';
    }

    // Update battery icons
    if (powerIcon) {
      if (charging) {
        powerIcon.className = 'fa-solid fa-battery-bolt glow-text-cyan';
      } else if (level > 80) {
        powerIcon.className = 'fa-solid fa-battery-full';
      } else if (level > 50) {
        powerIcon.className = 'fa-solid fa-battery-three-quarters';
      } else if (level > 20) {
        powerIcon.className = 'fa-solid fa-battery-quarter text-orange';
      } else {
        powerIcon.className = 'fa-solid fa-battery-empty text-danger pulse';
      }
    }

    // Fill 5 segments
    const filledCount = Math.ceil(level / 20);
    segments.forEach((seg, index) => {
      if (index < filledCount) {
        seg.className = 'power-segment filled';
        if (level < 20) {
          seg.style.backgroundColor = 'var(--color-danger)';
          seg.style.boxShadow = '0 0 5px var(--color-danger)';
        } else if (level < 50) {
          seg.style.backgroundColor = 'var(--color-orange)';
          seg.style.boxShadow = '0 0 5px var(--color-orange)';
        } else {
          seg.style.backgroundColor = 'var(--color-cyan)';
          seg.style.boxShadow = '0 0 5px var(--color-cyan)';
        }
      } else {
        seg.className = 'power-segment';
        seg.style.backgroundColor = '';
        seg.style.boxShadow = '';
      }
    });
  }

  if (navigator.getBattery) {
    navigator.getBattery().then(battery => {
      updateBatteryUI(battery);
      
      // Hook event listeners for changes
      battery.addEventListener('levelchange', () => updateBatteryUI(battery));
      battery.addEventListener('chargingchange', () => updateBatteryUI(battery));
    });
  } else {
    // Fallback if API not supported
    const mockBattery = { level: 0.85, charging: false };
    updateBatteryUI(mockBattery);
  }
}

/* --- ENVIRONMENT WEATHER & GPS --- */
function fetchEnvironmentData() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateWeather(latitude, longitude);
      },
      (error) => {
        appendSystemTerminalMessage("GPS position locked out. Applying default reference: London, UK.", "SYSTEM", "error");
        // Default to London weather
        updateWeather(51.5074, -0.1278, "London, UK");
      }
    );
  } else {
    updateWeather(51.5074, -0.1278, "London, UK");
  }
}

export async function updateWeather(lat, lon, locationName = '') {
  const tempEl = document.getElementById('weather-temp');
  const descEl = document.getElementById('weather-desc');
  const locEl = document.getElementById('weather-loc');
  const humEl = document.getElementById('weather-humidity');

  try {
    // 1. Fetch Weather via free Open-Meteo (no API key needed)
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&relative_humidity_2m=true`);
    if (!response.ok) throw new Error("Weather database handshake failed");
    
    const data = await response.json();
    const temp = Math.round(data.current_weather.temperature);
    const code = data.current_weather.weathercode;
    
    // Parse weather code to human description
    const weatherDesc = parseWeatherCode(code);
    
    // Open-Meteo outputs humidity in relative_humidity_2m for forecasting, we query it if current weather has it or approximate
    const humidity = data.current_weather.humidity || (data.hourly && data.hourly.relative_humidity_2m ? data.hourly.relative_humidity_2m[0] : 62);

    if (tempEl) tempEl.textContent = `${temp}°C`;
    if (descEl) descEl.textContent = weatherDesc;
    if (humEl) humEl.textContent = `${humidity}%`;

    // 2. Fetch City Name (Reverse Geocode via OSM Nominatim)
    if (!locationName) {
      const geoResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`, {
        headers: { 'Accept-Language': 'en' }
      });
      if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        const city = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.county || 'Unknown Sector';
        const country = geoData.address.country || '';
        locationName = country ? `${city}, ${country}` : city;
      } else {
        // Approximate location via Timezone
        locationName = Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop().replace('_', ' ') || "Local Sector";
      }
    }
    
    if (locEl) locEl.textContent = locationName.toUpperCase();
    state.currentWeatherLoc = locationName;
    
    appendSystemTerminalMessage(`Weather diagnostics synchronized for sector: ${locationName.toUpperCase()}.`);
  } catch (err) {
    console.error(err);
    if (tempEl) tempEl.textContent = '19°C';
    if (descEl) descEl.textContent = 'STEADY CLIMATE';
    if (locEl) locEl.textContent = 'LOCAL SECTOR';
    if (humEl) humEl.textContent = '55%';
  }
}

// Convert Open-Meteo WMO weather codes to human description
function parseWeatherCode(code) {
  const codes = {
    0: "CLEAR SKY",
    1: "MAINLY CLEAR",
    2: "PARTLY CLOUDY",
    3: "OVERCAST",
    45: "FOGGY CONDITIONS",
    48: "DEPOSITING RIME FOG",
    51: "LIGHT DRIZZLE",
    53: "MODERATE DRIZZLE",
    55: "DENSE DRIZZLE",
    61: "SLIGHT RAIN",
    63: "MODERATE RAIN",
    65: "HEAVY RAIN",
    71: "SLIGHT SNOWFALL",
    73: "MODERATE SNOWFALL",
    75: "HEAVY SNOWFALL",
    77: "SNOW GRAINS",
    80: "SLIGHT SHOWERS",
    81: "MODERATE SHOWERS",
    82: "VIOLENT SHOWERS",
    85: "SLIGHT SNOW SHOWERS",
    86: "HEAVY SNOW SHOWERS",
    95: "THUNDERSTORM",
    96: "T-STORM WITH HAIL",
    99: "HEAVY T-STORM HAIL"
  };
  return codes[code] || "STABLE METRICS";
}
