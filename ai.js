/* ==========================================================================
   JARVIS NEURAL INTERFACE - AI MATRIX & COMMUNICATIONS
   ========================================================================== */

import { appendSystemTerminalMessage, playClickSound, playSuccessSound, state } from './app.js';
import { addTask } from './tasks.js';

let recognition;
let synth = window.speechSynthesis;
let speakingInterval = null;
let currentUtterance = null;
let orbCtx = null;
let orbCanvas = null;

// Visual wave variables for the speech animation
let waveScale = 1.0;
let isSpeakingVisual = false;

export function initAI() {
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-chat-btn');
  const micBtn = document.getElementById('mic-btn');

  // 1. Text Submission
  if (chatInput && sendBtn) {
    sendBtn.addEventListener('click', () => submitQuery());
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'ENTER' || e.keyCode === 13) {
        submitQuery();
      }
    });
  }

  // 2. Speech Synthesis Configuration
  setupVoiceSelector();

  // 3. Speech Recognition (Speech-to-Text) Setup
  setupVoiceRecognition(micBtn, chatInput);

  // 4. Start Hologram Orb Loop
  initOrbCanvas();
}

/* --- ORB GRAPHIC INTERACTIVE LOOP --- */
function initOrbCanvas() {
  orbCanvas = document.getElementById('hud-orb-canvas');
  if (!orbCanvas) return;

  orbCtx = orbCanvas.getContext('2d');
  
  function resizeOrb() {
    const parent = orbCanvas.parentElement;
    orbCanvas.width = parent.clientWidth || 280;
    orbCanvas.height = parent.clientHeight || 280;
  }
  resizeOrb();
  window.addEventListener('resize', resizeOrb);

  let rotation = 0;
  let particles = [];

  // Generate orbit ring particles
  for (let i = 0; i < 40; i++) {
    particles.push({
      angle: (i / 40) * Math.PI * 2,
      speed: Math.random() * 0.01 + 0.005,
      radius: Math.random() * 10 + 90,
      size: Math.random() * 2 + 0.5
    });
  }

  function drawOrb() {
    orbCtx.clearRect(0, 0, orbCanvas.width, orbCanvas.height);
    
    const cx = orbCanvas.width / 2;
    const cy = orbCanvas.height / 2;
    rotation += 0.003;

    // Pulse multiplier when Jarvis is speaking
    if (isSpeakingVisual) {
      waveScale = 1.0 + Math.sin(Date.now() / 80) * 0.15;
    } else {
      waveScale = 1.0 + Math.sin(Date.now() / 500) * 0.02;
    }

    // 1. Draw glowing inner aura
    const glowRad = 55 * waveScale;
    const grad = orbCtx.createRadialGradient(cx, cy, 0, cx, cy, glowRad);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
    grad.addColorStop(0.5, 'rgba(0, 102, 255, 0.15)');
    grad.addColorStop(1, 'rgba(1, 6, 15, 0)');
    orbCtx.fillStyle = grad;
    orbCtx.beginPath();
    orbCtx.arc(cx, cy, glowRad, 0, Math.PI * 2);
    orbCtx.fill();

    // 2. Draw rotating ticks ring
    orbCtx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
    orbCtx.lineWidth = 1.5;
    const ticksCount = 60;
    const innerR = 78 * waveScale;
    const outerR = 85 * waveScale;

    orbCtx.save();
    orbCtx.translate(cx, cy);
    orbCtx.rotate(rotation);
    for (let i = 0; i < ticksCount; i++) {
      const angle = (i / ticksCount) * Math.PI * 2;
      // Skip sectors for styling
      if (i % 10 === 0 || i % 10 === 1) continue;
      
      const x1 = Math.cos(angle) * innerR;
      const y1 = Math.sin(angle) * innerR;
      const x2 = Math.cos(angle) * outerR;
      const y2 = Math.sin(angle) * outerR;

      orbCtx.beginPath();
      orbCtx.moveTo(x1, y1);
      orbCtx.lineTo(x2, y2);
      orbCtx.stroke();
    }
    orbCtx.restore();

    // 3. Draw particles swirling
    particles.forEach(p => {
      p.angle += p.speed;
      const x = cx + Math.cos(p.angle) * p.radius * waveScale;
      const y = cy + Math.sin(p.angle) * p.radius * waveScale;
      
      orbCtx.fillStyle = `rgba(0, 240, 255, ${isSpeakingVisual ? 0.8 : 0.4})`;
      orbCtx.beginPath();
      orbCtx.arc(x, y, p.size, 0, Math.PI * 2);
      orbCtx.fill();
    });

    // 4. Draw center digital core readout lines
    orbCtx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
    orbCtx.lineWidth = 1;
    orbCtx.beginPath();
    orbCtx.arc(cx, cy, 32 * waveScale, 0, Math.PI * 2);
    orbCtx.stroke();

    // 5. Draw central crosshairs
    orbCtx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    orbCtx.beginPath();
    // vertical
    orbCtx.moveTo(cx, cy - 10); orbCtx.lineTo(cx, cy + 10);
    // horizontal
    orbCtx.moveTo(cx - 10, cy); orbCtx.lineTo(cx + 10, cy);
    orbCtx.stroke();

    // 6. Draw dynamic waveforms if speaking
    if (isSpeakingVisual) {
      orbCtx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
      orbCtx.lineWidth = 2;
      orbCtx.beginPath();
      const points = 16;
      for (let i = 0; i <= points; i++) {
        const theta = (i / points) * Math.PI * 2;
        const amp = 10 + Math.sin(Date.now() / 40 + i) * 6;
        const r = (32 + amp) * waveScale;
        const x = cx + Math.cos(theta) * r;
        const y = cy + Math.sin(theta) * r;
        if (i === 0) orbCtx.moveTo(x, y);
        else orbCtx.lineTo(x, y);
      }
      orbCtx.closePath();
      orbCtx.stroke();
    }

    requestAnimationFrame(drawOrb);
  }

  drawOrb();
}

/* --- TEXT TO SPEECH (VOICE OUTPUT) --- */
function setupVoiceSelector() {
  const selector = document.getElementById('jarvis-voice');
  if (!selector) return;

  function loadVoices() {
    const voices = synth.getVoices();
    selector.innerHTML = '';
    
    // Default system selection or cached setting
    const cachedVoiceName = localStorage.getItem('jarvis_voice_name') || '';

    voices.forEach(voice => {
      // Prioritize English voices
      if (voice.lang.includes('en')) {
        const opt = document.createElement('option');
        opt.value = voice.name;
        opt.textContent = `${voice.name} (${voice.lang})`;
        if (voice.name === cachedVoiceName) {
          opt.selected = true;
        }
        selector.appendChild(opt);
      }
    });

    // Populate others if empty
    if (selector.options.length === 0) {
      voices.forEach(voice => {
        const opt = document.createElement('option');
        opt.value = voice.name;
        opt.textContent = `${voice.name} (${voice.lang})`;
        selector.appendChild(opt);
      });
    }

    // Set voice sliders value
    const pitch = document.getElementById('jarvis-pitch');
    const rate = document.getElementById('jarvis-rate');
    const autoplay = document.getElementById('autoplay-voice');

    if (pitch) {
      pitch.value = localStorage.getItem('jarvis_pitch') || '1.0';
      document.getElementById('pitch-val').textContent = pitch.value;
      pitch.addEventListener('input', (e) => {
        document.getElementById('pitch-val').textContent = e.target.value;
      });
    }
    if (rate) {
      rate.value = localStorage.getItem('jarvis_rate') || '1.0';
      document.getElementById('rate-val').textContent = rate.value;
      rate.addEventListener('input', (e) => {
        document.getElementById('rate-val').textContent = e.target.value;
      });
    }
    if (autoplay) {
      const savedAutoplay = localStorage.getItem('jarvis_autoplay_voice');
      autoplay.checked = savedAutoplay !== null ? savedAutoplay === 'true' : true;
    }
  }

  loadVoices();
  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = loadVoices;
  }
}

export function speakText(text) {
  if (!state.speechEnabled) return;

  // Cancel any active speak
  synth.cancel();
  stopVisualWaves();

  const utterance = new SpeechSynthesisUtterance(text);
  currentUtterance = utterance;

  // Set configuration
  const pitchVal = parseFloat(localStorage.getItem('jarvis_pitch') || '1.0');
  const rateVal = parseFloat(localStorage.getItem('jarvis_rate') || '1.0');
  const voiceName = localStorage.getItem('jarvis_voice_name');

  utterance.pitch = pitchVal;
  utterance.rate = rateVal;

  if (voiceName) {
    const selectedVoice = synth.getVoices().find(v => v.name === voiceName);
    if (selectedVoice) utterance.voice = selectedVoice;
  }

  // Handle visual wave state triggers
  utterance.onstart = () => {
    isSpeakingVisual = true;
    startVisualWaves();
  };

  utterance.onend = () => {
    isSpeakingVisual = false;
    stopVisualWaves();
  };

  utterance.onerror = () => {
    isSpeakingVisual = false;
    stopVisualWaves();
  };

  synth.speak(utterance);
}

// Animate DOM wave bars
function startVisualWaves() {
  const container = document.getElementById('speech-wave-container');
  if (!container) return;

  const bars = container.querySelectorAll('.wave-bar');
  if (speakingInterval) clearInterval(speakingInterval);

  speakingInterval = setInterval(() => {
    bars.forEach(bar => {
      const height = Math.floor(Math.random() * 30) + 4; // 4px - 34px height
      bar.style.height = `${height}px`;
    });
  }, 100);
}

function stopVisualWaves() {
  if (speakingInterval) {
    clearInterval(speakingInterval);
    speakingInterval = null;
  }
  const container = document.getElementById('speech-wave-container');
  if (!container) return;
  const bars = container.querySelectorAll('.wave-bar');
  bars.forEach(bar => {
    bar.style.height = '5px';
  });
}

/* --- SPEECH RECOGNITION (VOICE INPUT) --- */
function setupVoiceRecognition(micBtn, chatInput) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    if (micBtn) {
      micBtn.style.display = 'none'; // Speech recognition not supported in this browser
      console.warn("Speech Recognition API not supported in this environment.");
    }
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  micBtn.addEventListener('click', () => {
    if (micBtn.classList.contains('recording')) {
      recognition.stop();
    } else {
      synth.cancel(); // Stop talking if we're going to listen
      recognition.start();
    }
  });

  recognition.onstart = () => {
    micBtn.classList.add('recording');
    appendSystemTerminalMessage("Voice acquisition channel activated. Awaiting telemetry...", "SYSTEM");
    playClickSound();
  };

  recognition.onerror = (e) => {
    console.error("Speech Recognition Error", e);
    micBtn.classList.remove('recording');
    appendSystemTerminalMessage("Voice channel error. Telemetry stream interrupted.", "SYSTEM", "error");
  };

  recognition.onend = () => {
    micBtn.classList.remove('recording');
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (chatInput) {
      chatInput.value = transcript;
      playSuccessSound();
      submitQuery();
    }
  };
}

/* --- CORE QUERY SUBMISSION CONTROLLERS --- */
async function submitQuery() {
  const chatInput = document.getElementById('chat-input');
  if (!chatInput) return;

  const query = chatInput.value.trim();
  if (!query) return;

  // Clear Input
  chatInput.value = '';

  // 1. Add User query to logs
  appendSystemTerminalMessage(query, "USER", "user");
  playClickSound();

  // 2. Add system parsing placeholder
  const logs = document.getElementById('chat-logs');
  const tempEntry = document.createElement('div');
  tempEntry.className = 'terminal-entry system';
  tempEntry.innerHTML = `<span class="timestamp">[..]</span> <span class="speaker">JARVIS:</span> <span class="message text-cyan pulse">Syncing neural data...</span>`;
  logs.appendChild(tempEntry);
  logs.scrollTop = logs.scrollHeight;

  // 3. Process Intents locally (e.g. commands like "add task")
  const wasCommand = parseLocalCommands(query);
  if (wasCommand) {
    logs.removeChild(tempEntry);
    return;
  }

  // 4. Send to Gemini AI (or mock simulation fallback)
  try {
    let responseText = "";

    if (state.apiKey) {
      // Call Gemini API Directly
      responseText = await callGeminiAPI(query);
    } else {
      // Local Jarvis Simulator
      responseText = await callMockJarvis(query);
    }

    // Remove loading entry
    logs.removeChild(tempEntry);

    // Render Jarvis reply
    appendSystemTerminalMessage(responseText, "JARVIS", "jarvis");
    
    // TTS voice output
    const autoplay = localStorage.getItem('jarvis_autoplay_voice') !== 'false';
    if (autoplay) {
      speakText(responseText);
    }
  } catch (err) {
    console.error(err);
    logs.removeChild(tempEntry);
    appendSystemTerminalMessage("Cognitive handshake failed. Core memory leak detected.", "SYSTEM", "error");
    speakText("My cognitive link has encountered an error, Sir.");
  }
}

/* --- DIRECT SYSTEM COMMANDS INTENT PARSER --- */
function parseLocalCommands(query) {
  const q = query.toLowerCase();
  
  // 1. Add Task: "add task buy milk", "add objective finish report"
  if (q.startsWith("add task ") || q.startsWith("add objective ") || q.startsWith("new task ")) {
    let text = "";
    if (q.startsWith("add task ")) text = query.substring(9);
    else if (q.startsWith("add objective ")) text = query.substring(14);
    else text = query.substring(9);

    let priority = 'normal';
    if (q.includes(" high priority") || q.includes(" priority high")) {
      priority = 'high';
      text = text.replace(/high priority|priority high/i, '').trim();
    } else if (q.includes(" low priority") || q.includes(" priority low")) {
      priority = 'low';
      text = text.replace(/low priority|priority low/i, '').trim();
    }

    // Clean trailing punctuation or fill words
    text = text.replace(/(^[\s,]+|[\s,.]+$)/g, '');
    if (text) {
      addTask(text, priority);
      speakText(`Understood, Sir. I have registered the objective to ${text}.`);
      return true;
    }
  }

  // 2. Mute/Unmute: "mute speech", "mute voice", "unmute"
  if (q === "mute speech" || q === "mute voice" || q === "mute jarvis") {
    const voiceToggle = document.getElementById('toggle-voice-btn');
    if (voiceToggle && state.speechEnabled) {
      voiceToggle.click();
    }
    return true;
  }
  if (q === "unmute speech" || q === "unmute voice" || q === "unmute jarvis" || q === "open speech") {
    const voiceToggle = document.getElementById('toggle-voice-btn');
    if (voiceToggle && !state.speechEnabled) {
      voiceToggle.click();
    }
    return true;
  }

  // 3. Clear Agenda: "clear tasks", "clear agenda"
  if (q === "clear tasks" || q === "clear agenda" || q === "purge agenda") {
    if (confirm("Clear all items on the current agenda?")) {
      localStorage.setItem('jarvis_tasks', '[]');
      // Quick re-init tasks view
      import('./tasks.js').then(module => {
        module.initTasks();
        appendSystemTerminalMessage("Agenda wiped clean.");
        speakText("Purge completed. Your agenda is now empty, Sir.");
      });
    }
    return true;
  }

  return false; // Not a local command, pass to AI
}

/* --- REAL GEMINI API CALLS --- */
async function callGeminiAPI(prompt) {
  // Use Gemini 1.5 Flash (stable, fast, free tier support)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${state.apiKey}`;

  // Build conversational context from the visible logs
  const logs = document.getElementById('chat-logs');
  const recentEntries = Array.from(logs.querySelectorAll('.terminal-entry')).slice(-6); // Last 6 messages
  
  const history = recentEntries.map(el => {
    const speaker = el.querySelector('.speaker').textContent;
    const msg = el.querySelector('.message').textContent;
    const role = speaker.includes("USER") ? "user" : "model";
    return {
      role: role,
      parts: [{ text: msg }]
    };
  }).filter(h => !h.parts[0].text.includes("Syncing neural data...") && !h.parts[0].text.includes("cognition link"));

  // Append user's new prompt if not captured yet
  const requestBody = {
    contents: [
      ...history,
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ],
    systemInstruction: {
      parts: [
        {
          text: `You are JARVIS (Just A Rather Very Intelligent System), the sophisticated holographic AI assistant created by Tony Stark.
          Core Personality Guidelines:
          - Refer to the user as 'Sir' or 'Ma'am' depending on tone, defaulting to 'Sir'.
          - Address yourself strictly as 'JARVIS' or 'I'.
          - Speak with eloquent, refined British styling (sophisticated, witty, calm, respectful, slightly scientific).
          - Keep answers concise, clear, and direct. Fit a voice telemetry display. Avoid long paragraphs.
          - DO NOT write responses using markdown layout elements (like bold, italics, lists, backticks). Use plain conversational ASCII text.
          - Integrate current details when suitable (Weather Sector: ${state.currentWeatherLoc.toUpperCase()}).`
        }
      ]
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 250
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(`Gemini API returns error: ${errorDetails}`);
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  return text.trim();
}

/* --- LOCAL SIMULATED JARVIS RESPONSES (MOCK ENGINE) --- */
function callMockJarvis(prompt) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const q = prompt.toLowerCase();
      let reply = "";

      if (q.includes("hello") || q.includes("hi") || q.includes("greetings")) {
        reply = "Greetings, Sir. I am online and tracking all telemetry grids. How may I be of service?";
      } else if (q.includes("your name") || q.includes("who are you")) {
        reply = "I am JARVIS, your single-point cognitive neural assistant interface. My core AI system is currently running on Local Emulation. Insert a Gemini API key in Settings for full cognitive growth.";
      } else if (q.includes("weather")) {
        const temp = document.getElementById('weather-temp').textContent;
        const loc = document.getElementById('weather-loc').textContent;
        reply = `Environmental sensors read temperature levels around ${temp} in the ${loc} sector, Sir. Meteorological status is normal.`;
      } else if (q.includes("status") || q.includes("diagnostics")) {
        const cpu = document.getElementById('cpu-value').textContent;
        const ram = document.getElementById('ram-value').textContent;
        const bat = document.getElementById('battery-pct').textContent;
        reply = `System integrity stands at normal parameters, Sir. Mainframe processor cores are running at ${cpu} load, memory allocation is hovering at ${ram}, and our power storage stands at ${bat}.`;
      } else if (q.includes("time") || q.includes("date")) {
        const time = document.getElementById('hud-time').textContent;
        const date = document.getElementById('hud-date').textContent;
        reply = `Visual chrono-sensors read ${time} on this ${date}, Sir.`;
      } else if (q.includes("thank") || q.includes("thanks")) {
        reply = "You are most welcome, Sir. It is always a pleasure to assist.";
      } else if (q.includes("creator") || q.includes("tony") || q.includes("stark")) {
        reply = "My design architecture was originally compiled by Mr. Tony Stark, Sir. A tribute to engineering excellence.";
      } else {
        reply = `I have logged your query: "${prompt}". I am running on a localized basic logic core. To get rich generative answers from Gemini, please enter an API key in the upper-right Settings configuration panel, Sir.`;
      }

      resolve(reply);
    }, 800);
  });
}
