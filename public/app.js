/* ==========================================================================
   FRONTEND JS LOGIC: PROJECT OLIVE BRANCH — SINCERITY v2.0
   Apple Corporate Minimalism, Audio Toggle, Progressive Tab Wizard, Color Morphs
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Navigation & Page frames
  const navButtons = document.querySelectorAll('.nav-btn');
  const pageViews = document.querySelectorAll('.page-view');
  
  // Interactive Progress Tracker Nodes (Wizard Timeline)
  const wizardProgress = document.getElementById('wizard-global-progress');
  const stepNodes = {
    home: document.getElementById('step-node-home'),
    incident: document.getElementById('step-node-incident'),
    bribe: document.getElementById('step-node-bribe'),
    verdict: document.getElementById('step-node-verdict')
  };
  
  // Progress flow states
  let unlockedSteps = {
    home: true,
    incident: false,
    bribe: false,
    verdict: false
  };

  // Apple CTAs
  const heroForgiveBtn = document.getElementById('hero-forgive-btn');
  const heroLogsBtn = document.getElementById('hero-logs-btn');
  
  // Connected Pipeline slide-up footer panels
  const panelStep2 = document.getElementById('next-panel-step2');
  const panelStep3 = document.getElementById('next-panel-step3');
  const btnGotoStep3 = document.getElementById('btn-goto-step3');
  const btnGotoStep4 = document.getElementById('btn-goto-step4');
  
  // Audio Control Elements
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const audioIcon = document.getElementById('audio-icon');
  const audioTooltip = document.querySelector('.audio-tooltip');
  const sadViolin = document.getElementById('sad-violin-audio');
  
  // Dynamic Emoji decor container
  const emojiContainer = document.getElementById('emoji-container');
  
  // Live Chat Database feed
  const chatFeed = document.getElementById('terminal-feed');
  
  // Grudge Scanning variables
  const grudgeBar = document.getElementById('grudge-bar');
  const grudgeStatus = document.getElementById('grudge-status');
  const grudgeVal = document.getElementById('grudge-val');
  const btnRescan = document.getElementById('btn-rescan');
  let scanningTriggered = false;
  
  // Treaty page controls (Layer 3)
  const verdictTreatyCard = document.getElementById('verdict-treaty-card');
  const verdictAngerSlider = document.getElementById('verdict-anger-slider');
  const sliderPercentageVal = document.getElementById('slider-percentage-val');
  const sliderEmoji = document.getElementById('slider-emoji');
  const btnYes = document.getElementById('btn-yes');
  const btnNo = document.getElementById('btn-no');
  
  // Integrity meter on page 1
  const integrityBar = document.getElementById('integrity-bar');
  const integrityPercent = document.getElementById('integrity-percent');
  let currentBaseIntegrity = 12; // tracks global progress percentage
  
  // Modals & Notifications
  const victoryModal = document.getElementById('victory-modal');
  const btnModalClose = document.getElementById('btn-modal-close');
  const toastNotify = document.getElementById('toast-notify');
  const toastDescVal = document.getElementById('toast-desc-val');
  const toastEmoji = toastNotify.querySelector('.toast-emoji');

  // Confetti Canvas setup
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  let animationFrameId;
  let particles = [];
  let confettiActive = false;

  // Initialize Lucide icons
  lucide.createIcons();

  // Set default audio levels
  sadViolin.volume = 0.25;

  // ==========================================================================
  // PROGRESSIVE TIMELINE NAVIGATION LOCKS
  // ==========================================================================
  
  function updateWizardVisuals() {
    // Determine active steps completed
    let stepCount = 0;
    if (unlockedSteps.incident) stepCount++;
    if (unlockedSteps.bribe) stepCount++;
    if (unlockedSteps.verdict) stepCount++;
    
    // Set wizard line width
    const percentages = [0, 33, 66, 100];
    wizardProgress.style.width = `${percentages[stepCount]}%`;
    
    // Update individual wizard node classes
    Object.keys(stepNodes).forEach((key, index) => {
      const node = stepNodes[key];
      if (index <= stepCount) {
        node.classList.add('completed');
      } else {
        node.classList.remove('completed');
      }
      
      const activeTab = document.getElementById(`page-${key}`).classList.contains('active');
      if (activeTab) {
        node.classList.add('active');
      } else {
        node.classList.remove('active');
      }
    });

    // Handle standard nav header locks
    navButtons.forEach(btn => {
      const target = btn.getAttribute('data-target');
      if (unlockedSteps[target]) {
        btn.classList.remove('nav-disabled');
      } else {
        btn.classList.add('nav-disabled');
      }
    });

    // Update Home Dashboard Integrity Bar based on wizard progress
    let targetIntegrity = 12;
    if (unlockedSteps.incident) targetIntegrity = 30;
    if (unlockedSteps.bribe) targetIntegrity = 65;
    if (unlockedSteps.verdict) {
      // If verdict is unlocked, integrity tracks the slider value!
      const sliderVal = parseInt(verdictAngerSlider.value);
      targetIntegrity = 65 + Math.floor((sliderVal / 100) * 35);
    }
    
    updateIntegrityDashboard(targetIntegrity);
  }

  function updateIntegrityDashboard(percent) {
    integrityBar.style.width = `${percent}%`;
    integrityPercent.textContent = `${percent}%`;
    
    // Change color of integrity based on percentage
    if (percent < 30) {
      integrityBar.style.backgroundColor = 'var(--coral-accent)';
      integrityPercent.style.color = 'var(--coral-accent)';
    } else if (percent < 68) {
      integrityBar.style.backgroundColor = 'var(--sky-accent)';
      integrityPercent.style.color = 'var(--sky-accent)';
    } else {
      integrityBar.style.backgroundColor = 'var(--mint-accent)';
      integrityPercent.style.color = 'var(--mint-accent)';
    }
  }

  function navigateToTab(target) {
    // Stop navigation if step is locked
    if (!unlockedSteps[target]) {
      showToastNotification("🔒 Lockout: Complete the current diagnosis sequence to unlock this stage!", "🤐");
      return;
    }

    // Update active nav buttons
    navButtons.forEach(b => {
      b.classList.remove('active');
      if (b.getAttribute('data-target') === target) {
        b.classList.add('active');
      }
    });
    
    // Switch View Panels
    pageViews.forEach(page => {
      page.classList.remove('active');
      if (page.id === `page-${target}`) {
        page.classList.add('active');
      }
    });
    
    // Update wizard indicators
    updateWizardVisuals();

    // Telemetry log to MongoDB
    let pageTitle = target.charAt(0).toUpperCase() + target.slice(1);
    if (target === 'home') pageTitle = "Launch HQ (Home)";
    if (target === 'incident') pageTitle = "Patch Notes (System Diagnosis)";
    if (target === 'bribe') pageTitle = "Restitution Plan (Bribe Grid)";
    if (target === 'verdict') pageTitle = "Peace Treaty (The Verdict)";
    
    logInteraction({ page_visited: pageTitle });
    
    // Trigger real-time sync when on HQ
    if (target === 'home') {
      fetchDatabaseLogs();
    }
    
    // Trigger simulated scanning when on Patch Notes
    if (target === 'incident' && !scanningTriggered) {
      triggerGrudgeScanning();
    }
  }

  // Click on top wizard nodes to navigate if unlocked
  Object.keys(stepNodes).forEach(key => {
    stepNodes[key].addEventListener('click', () => navigateToTab(key));
  });

  // Nav buttons clicks
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      navigateToTab(target);
    });
  });

  // Home Screen CTAs
  heroLogsBtn.addEventListener('click', () => {
    unlockedSteps.incident = true;
    navigateToTab('incident');
  });

  heroForgiveBtn.addEventListener('click', () => {
    // Unlock everything instantly for Quick Forgiveness shortcut
    unlockedSteps.incident = true;
    unlockedSteps.bribe = true;
    unlockedSteps.verdict = true;
    navigateToTab('verdict');
    
    // Jump slider to 100% and notify
    verdictAngerSlider.value = 100;
    updateTreatySliderDisplay(100);
  });

  // ==========================================================================
  // SAD VIOLIN ATMOSPHERE — AUTO-PLAY ON FIRST INTERACTION + TOGGLE
  // ==========================================================================
  let audioAutoStarted = false;

  function startAudioPlayback() {
    if (audioAutoStarted) return;
    sadViolin.play().then(() => {
      audioAutoStarted = true;
      audioToggleBtn.classList.add('playing');
      audioTooltip.textContent = "Sad Violin: PLAYING 🎻";
      audioIcon.setAttribute('data-lucide', 'volume-2');
      lucide.createIcons();
    }).catch(err => {
      console.warn("Audio autoplay blocked, will retry on next interaction:", err);
    });
  }

  // Attempt immediate autoplay (works if browser policy allows)
  startAudioPlayback();

  // Fallback: start on first user gesture (click, scroll, or keypress)
  const autoplayEvents = ['click', 'scroll', 'keydown', 'touchstart'];
  function onFirstInteraction() {
    startAudioPlayback();
    if (audioAutoStarted) {
      autoplayEvents.forEach(evt => document.removeEventListener(evt, onFirstInteraction, { capture: true }));
    }
  }
  autoplayEvents.forEach(evt => document.addEventListener(evt, onFirstInteraction, { capture: true, once: false }));

  // Manual toggle button still works to pause/resume
  audioToggleBtn.addEventListener('click', () => {
    if (sadViolin.paused) {
      sadViolin.play().then(() => {
        audioToggleBtn.classList.add('playing');
        audioTooltip.textContent = "Sad Violin: PLAYING 🎻";
        audioIcon.setAttribute('data-lucide', 'volume-2');
        lucide.createIcons();
      }).catch(err => {
        console.error("Audio playback interrupted:", err);
      });
    } else {
      sadViolin.pause();
      audioToggleBtn.classList.remove('playing');
      audioTooltip.textContent = "Sad Violin: OFF";
      audioIcon.setAttribute('data-lucide', 'music-4');
      lucide.createIcons();
      // Prevent auto-restart after manual pause
      autoplayEvents.forEach(evt => document.removeEventListener(evt, onFirstInteraction, { capture: true }));
    }
  });

  // ==========================================================================
  // FLOATING BACKGROUND EMOJI DECORATIONS
  // ==========================================================================
  const floatingEmojis = ['🕊️', '❤️', '💖', '☕', '🤐', '🍔', '✨', '🌸', '🎁', '🧸'];
  
  function createFloatingEmoji() {
    if (!emojiContainer) return;
    const emoji = document.createElement('div');
    emoji.className = 'emoji-float';
    emoji.textContent = floatingEmojis[Math.floor(Math.random() * floatingEmojis.length)];
    
    emoji.style.left = `${Math.random() * 100}vw`;
    emoji.style.animationDuration = `${Math.random() * 8 + 7}s`; // 7s to 15s
    emoji.style.fontSize = `${Math.random() * 1.3 + 1.1}rem`;
    
    emojiContainer.appendChild(emoji);
    
    setTimeout(() => {
      emoji.remove();
    }, 15000);
  }

  // Launch background emoji loops
  setInterval(createFloatingEmoji, 900);
  for (let i = 0; i < 8; i++) {
    setTimeout(createFloatingEmoji, i * 500);
  }

  // ==========================================================================
  // DATABASE SYNC & API INTEGRATION
  // ==========================================================================
  async function logInteraction(payload) {
    try {
      const response = await fetch('/api/log-interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      console.log('[Logged via API]', data);
      
      const homePageActive = document.getElementById('page-home').classList.contains('active');
      if (homePageActive) {
        fetchDatabaseLogs();
      }
    } catch (err) {
      console.error('Failed to post telemetry record:', err);
    }
  }

  async function fetchDatabaseLogs() {
    try {
      const response = await fetch('/api/interactions');
      const data = await response.json();
      
      chatFeed.innerHTML = `
        <div class="chat-bubble bubble-system">Initializing Project Olive Branch deployment engine...</div>
        <div class="chat-bubble bubble-bot">Connecting to local MongoDB log endpoints... 📡</div>
        <div class="chat-bubble bubble-success">Database online! Syncing live interactions folder.</div>
        <div class="chat-bubble bubble-bot">Warning: Sincerity registers currently peaking at 100%.</div>
        <div class="chat-bubble bubble-error">Error: Ego.dll file not found. Bypassing... 💾</div>
        <div class="chat-bubble bubble-system">-- Synchronizing live interactions database --</div>
      `;

      if (data.length === 0) {
        appendChatBubble("Database Feed is fully connected. Waiting to log your actions...", "bubble-bot");
      } else {
        appendChatBubble(`Database feed synchronized! ${data.length} interaction indexes pulled successfully.`, "bubble-success");
        
        data.forEach(item => {
          const time = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          if (item.page_visited) {
            appendChatBubble(`[${time}] Browsed screen interface: ${item.page_visited}`, 'bubble-bot');
          }
          if (item.bribe_selected) {
            appendChatBubble(`[${time}] 🎁 Target authorized bribe selection: "${item.bribe_selected}"!`, 'bubble-success');
          }
          if (item.anger_slider_value !== null && item.anger_slider_value !== undefined) {
            appendChatBubble(`[${time}] Slider anger scale moved: ${item.anger_slider_value}%`, 'bubble-bot');
          }
          if (item.final_forgiveness_status !== null && item.final_forgiveness_status !== undefined) {
            if (item.final_forgiveness_status === true) {
              appendChatBubble(`[${time}] ❤️ CEASEFIRE SIGNED! Forgiveness database flags set to TRUE!`, 'bubble-user');
            } else {
              appendChatBubble(`[${time}] ⚠️ Coordinates coordinates bypass on YES button. target forgiven.`, 'bubble-error');
            }
          }
        });
      }
    } catch (err) {
      console.error('Failed to query online records:', err);
      appendChatBubble('Error: Failed to query online logs from MongoDB nodes.', 'bubble-error');
    }
  }

  function appendChatBubble(text, className) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${className}`;
    bubble.textContent = text;
    chatFeed.appendChild(bubble);
    chatFeed.scrollTop = chatFeed.scrollHeight;
  }

  // ==========================================================================
  // LAYER 2: SYSTEM DIAGNOSIS GRUDGE SCANNERS
  // ==========================================================================
  function triggerGrudgeScanning() {
    scanningTriggered = true;
    let progress = 0;
    
    btnRescan.disabled = true;
    btnRescan.classList.add('spinning');
    panelStep2.style.display = 'none';

    grudgeBar.style.width = '0%';
    grudgeVal.textContent = '0%';
    grudgeStatus.textContent = 'Initializing scan...';
    grudgeStatus.style.color = '';
    
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 8) + 4;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Scan Complete
        grudgeBar.style.width = '100%';
        grudgeVal.textContent = '100%';
        grudgeStatus.textContent = 'Scan completed. Lingering grudges fully flushed! ✨';
        grudgeStatus.style.color = 'var(--mint-accent)';
        
        btnRescan.disabled = false;
        btnRescan.classList.remove('spinning');
        
        // Dynamic Connected Step Action: Unlock Bribe Tab & Slide-up Next Step Panel!
        unlockedSteps.bribe = true;
        updateWizardVisuals();
        
        panelStep2.style.display = 'flex';
        panelStep2.scrollIntoView({ behavior: 'smooth', block: 'end' });
      } else {
        grudgeBar.style.width = `${progress}%`;
        grudgeVal.textContent = `${progress}%`;
        
        if (progress < 30) {
          grudgeStatus.textContent = 'Locating resentment coordinates...';
        } else if (progress < 65) {
          grudgeStatus.textContent = 'Analyzing text message latency caches...';
        } else {
          grudgeStatus.textContent = 'Bypassing pride systems and uploading sincerity...';
        }
      }
    }, 120);
  }

  btnRescan.addEventListener('click', triggerGrudgeScanning);
  
  // Pipeline jump to step 3
  btnGotoStep3.addEventListener('click', () => navigateToTab('bribe'));

  // ==========================================================================
  // LAYER 3: FORGIVENESS GRADIENTS & SLIDER CONTROLS
  // ==========================================================================
  let sliderTimeout;

  function updateTreatySliderDisplay(val) {
    sliderPercentageVal.textContent = `${val}%`;
    
    // 1. Calculate color shift (Interpolating HSL Red to HSL Teal based on value)
    const hue = (val / 100) * 160;
    verdictTreatyCard.style.backgroundColor = `hsl(${hue}, 100%, 97.5%)`;
    verdictTreatyCard.style.borderColor = `hsl(${hue}, 80%, 80%)`;
    
    // 2. Bouncy emoji morphs depending on slider progress
    if (val <= 20) {
      sliderEmoji.textContent = '😡';
    } else if (val <= 40) {
      sliderEmoji.textContent = '😤';
    } else if (val <= 60) {
      sliderEmoji.textContent = '🤨';
    } else if (val <= 85) {
      sliderEmoji.textContent = '🥺';
    } else {
      sliderEmoji.textContent = '😇';
    }

    // 2b. Set dynamic status label
    const sliderLabelCenter = document.getElementById('slider-label-center');
    if (sliderLabelCenter) {
      if (val <= 15) {
        sliderLabelCenter.textContent = "🔥 Anger: Supernova (memes blocked)";
        sliderLabelCenter.style.color = "var(--coral-accent)";
      } else if (val <= 35) {
        sliderLabelCenter.textContent = "😤 Anger: Sullen (dry replies)";
        sliderLabelCenter.style.color = "var(--lavender-accent)";
      } else if (val <= 60) {
        sliderLabelCenter.textContent = "🤨 Anger: Skeptical (explain yourself)";
        sliderLabelCenter.style.color = "var(--sky-accent)";
      } else if (val <= 85) {
        sliderLabelCenter.textContent = "🥺 Anger: Softening (thinking of feast)";
        sliderLabelCenter.style.color = "var(--sunny-accent)";
      } else if (val < 98) {
        sliderLabelCenter.textContent = "😇 Anger: Calm (almost there)";
        sliderLabelCenter.style.color = "var(--mint-accent)";
      } else {
        sliderLabelCenter.textContent = "💖 Ceasefire Authorized!";
        sliderLabelCenter.style.color = "var(--mint-accent)";
      }
    }
    
    // 3. UX Lock state: If slider hits 100% "We Good", remove disabled constraint from Forgiveness button
    if (val >= 98) {
      btnNo.classList.remove('disabled');
      btnNo.disabled = false;
      btnNo.focus();
    } else {
      btnNo.classList.add('disabled');
      btnNo.disabled = true;
    }

    // Refresh Integrity Bar dynamically to reflect slider moves (65% to 100%)
    if (unlockedSteps.verdict) {
      const integrityVal = 65 + Math.floor((val / 100) * 35);
      updateIntegrityDashboard(integrityVal);
    }
  }

  // Debounced slider update logger to limit MongoDB hit rates
  verdictAngerSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    updateTreatySliderDisplay(val);
    
    clearTimeout(sliderTimeout);
    sliderTimeout = setTimeout(() => {
      logInteraction({ anger_slider_value: val });
    }, 250);
  });

  // ==========================================================================
  // THREE-TIER PRICING OFFERS (LAYER 4)
  // ==========================================================================
  const pricingCards = document.querySelectorAll('.pricing-card');

  pricingCards.forEach(card => {
    const btn = card.querySelector('.pricing-btn');
    const bribeName = card.getAttribute('data-bribe');
    
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Remove selection styles from all pricing plans
      pricingCards.forEach(c => c.classList.remove('selected-plan'));
      
      // Highlight selected pricing plan card
      card.classList.add('selected-plan');
      
      btn.textContent = 'COMMITTING DATA...';
      btn.disabled = true;
      btn.style.opacity = '0.7';
      
      setTimeout(() => {
        btn.textContent = 'SELECTION RECORDED! ✅';
        btn.style.background = 'var(--mint-accent)';
        btn.style.color = 'white';
        
        // Log telemetry
        logInteraction({ bribe_selected: bribeName });
        
        // Confetti burst on bribe purchase
        startConfetti();
        setTimeout(stopConfetti, 2500);
        
        let icon = '☕';
        if (bribeName.includes('Feast')) icon = '🍔';
        if (bribeName.includes('Ultimate')) icon = '📜';
        if (bribeName.includes('Mouth')) icon = '🤐';
        
        toastEmoji.textContent = icon;
        showToastNotification(`Apology restitution plan recorded: "${bribeName}"!`, icon);
        
        // Show the interactive sandbox widget
        showBribePlayground(bribeName);
        
        // Dynamic Connected Step Action: Unlock Verdict Tab & Slide-up Next Step Panel!
        unlockedSteps.verdict = true;
        updateWizardVisuals();
        
        panelStep3.style.display = 'flex';
        panelStep3.scrollIntoView({ behavior: 'smooth', block: 'end' });

        setTimeout(() => {
          btn.textContent = 'PLAN RECORDED';
          btn.disabled = true;
          btn.style.opacity = '0.8';
        }, 1500);
      }, 700);
    });
  });

  // Pipeline jump to step 4
  btnGotoStep4.addEventListener('click', () => navigateToTab('verdict'));

  function showToastNotification(desc, icon = '🎁') {
    toastEmoji.textContent = icon;
    toastDescVal.textContent = desc;
    toastNotify.classList.add('active');
    
    setTimeout(() => {
      toastNotify.classList.remove('active');
    }, 3200);
  }

  // ==========================================================================
  // RUNAWAY YES BUTTON PHYSICS (LAYER 3)
  // ==========================================================================
  const fleeingPhrases = [
    "😡 STAY ANGRY!",
    "🏃 You missed!",
    "🙅 Try again!",
    "💨 Too slow!",
    "🚫 Ego Override!",
    "🤨 Nice try!",
    "🤖 Access Denied!",
    "⚠️ Click Block!",
    "🛡️ Shield Active!",
    "🤐 Not today!"
  ];

  function teleportStayAngryButton() {
    const padding = 35;
    const btnWidth = btnYes.offsetWidth;
    const btnHeight = btnYes.offsetHeight;
    
    const maxX = window.innerWidth - btnWidth - padding;
    const maxY = window.innerHeight - btnHeight - padding;
    
    const randomX = Math.max(padding, Math.floor(Math.random() * maxX));
    const randomY = Math.max(padding, Math.floor(Math.random() * maxY));
    
    btnYes.classList.add('teleporting');
    btnYes.style.left = `${randomX}px`;
    btnYes.style.top = `${randomY}px`;

    const randomPhrase = fleeingPhrases[Math.floor(Math.random() * fleeingPhrases.length)];
    btnYes.innerHTML = `<span>😡</span> ${randomPhrase}`;
  }

  // Scan mouse proximity: if pointer gets within 130px, fly away!
  document.addEventListener('mousemove', (e) => {
    if (!document.getElementById('page-verdict').classList.contains('active')) return;
    
    const rect = btnYes.getBoundingClientRect();
    const btnCenterX = rect.left + rect.width / 2;
    const btnCenterY = rect.top + rect.height / 2;
    
    const distance = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);
    
    if (distance < 130) {
      teleportStayAngryButton();
    }
  });

  btnYes.addEventListener('mouseenter', teleportStayAngryButton);

  // If clicked programmatically via Javascript console triggers
  btnYes.addEventListener('click', () => {
    logInteraction({ final_forgiveness_status: false });
    showToastNotification("exploit alert! Console bypass detected... but still forgiven!", "🤐");
    triggerVictory(true);
  });

  // NO Button Click: Fireworks & permanent ceasefire log
  btnNo.addEventListener('click', () => {
    logInteraction({ final_forgiveness_status: true });
    triggerVictory(false);
  });

  // ==========================================================================
  // VICTORY SEQUENCE
  // ==========================================================================
  function triggerVictory(isHacker) {
    startConfetti();
    
    victoryModal.classList.add('active');
    
    if (isHacker) {
      const modalLog = victoryModal.querySelector('.modal-fun-log');
      modalLog.innerHTML = `
        <b>[CRITICAL]</b> YES button coordinates check bypassed.<br>
        <b>[ALERT]</b> Exploitative click triggers verified on client UI.<br>
        <b>[OVERRIDE]</b> User is a hacker, but still forgiven flag saved to MongoDB.<br>
        <b>[ONLINE]</b> Ceasefire signed! Friendship integrity set to 100%. ❤️
      `;
    }

    // Upgrade home dashboard integrity bar to 100% (safe & secure!)
    updateIntegrityDashboard(100);
  }

  btnModalClose.addEventListener('click', () => {
    victoryModal.classList.remove('active');
    stopConfetti();
    
    // Route back to home HQ
    navigateToTab('home');
  });

  // ==========================================================================
  // HIGH-PERFORMANCE CANVAS CONFETTI PARTICLE SYSTEM
  // ==========================================================================
  class ConfettiParticle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * -canvas.height - 20;
      this.size = Math.random() * 8 + 8;
      
      this.vx = Math.random() * 4 - 2;
      this.vy = Math.random() * 5 + 4;
      
      this.gravity = 0.12;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 6 - 3;
      
      const colors = ['#FF5A5A', '#34C759', '#007AFF', '#5856D6', '#FFCC00', '#FF2D55'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    
    update() {
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotationSpeed;
      
      if (this.y > canvas.height) {
        this.y = -20;
        this.x = Math.random() * canvas.width;
        this.vy = Math.random() * 5 + 4;
      }
    }
    
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((((this.rotation * Math.PI) / 180)));
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  function startConfetti() {
    canvas.style.display = 'block';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    particles = [];
    for (let i = 0; i < 120; i++) {
      particles.push(new ConfettiParticle());
    }
    
    confettiActive = true;
    animateConfetti();
  }

  function animateConfetti() {
    if (!confettiActive) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    
    animationFrameId = requestAnimationFrame(animateConfetti);
  }

  function stopConfetti() {
    confettiActive = false;
    cancelAnimationFrame(animationFrameId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.display = 'none';
  }

  window.addEventListener('resize', () => {
    if (confettiActive) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  });

  // ==========================================================================
  // HARDIK BEHAVIOR DEBUG CONSOLE (HOME TAB)
  // ==========================================================================
  const btnExcuse = document.getElementById('btn-generate-excuse');
  const btnDiagnostic = document.getElementById('btn-run-diagnostic');
  const debugEgoSlider = document.getElementById('debug-ego-slider');
  const egoDebugVal = document.getElementById('ego-debug-val');
  const debugTerminal = document.getElementById('debug-terminal-output');
  const debugTerminalLines = document.getElementById('debug-terminal-lines');
  
  const egoMeterFill = document.querySelector('.meter-fill.lavender');
  const egoMeterVal = document.getElementById('ego-val-dashboard');

  const excusesList = [
    "BrainFilter.dll failed to load before MouthSpeechThread initiated speaking.",
    "My social response logic was configured on an outdated 8-bit sarcasm compiler.",
    "I was suffering from acute low-latte latency (caffeine count < 5%).",
    "Emotional Context Scanner threw NullPointerException: Friend's feelings not found.",
    "Consequence Prediction Module was in battery-saver mode.",
    "Ego buffer overflow: Pride cache size exceeded sensible parameters.",
    "Mercury was in retrograde and my brain ran on dial-up internet.",
    "Sarcasm.exe refused to terminate, hogging 100% of brain CPU capacity."
  ];

  function typeInConsole(text, isError = false) {
    debugTerminal.style.display = 'block';
    debugTerminalLines.innerHTML = '';
    let i = 0;
    const prefix = isError ? `<span style="color: #ff3b30;">[ERROR] </span>` : `<span style="color: #6a8759;">[INFO] </span>`;
    debugTerminalLines.innerHTML = prefix;
    
    function type() {
      if (i < text.length) {
        debugTerminalLines.innerHTML += text.charAt(i);
        i++;
        setTimeout(type, 12);
      }
    }
    type();
  }

  if (btnExcuse) {
    btnExcuse.addEventListener('click', () => {
      const randomExcuse = excusesList[Math.floor(Math.random() * excusesList.length)];
      typeInConsole(randomExcuse, true);
      appendChatBubble(`[DEBUG CONSOLE] excuse generated: "${randomExcuse}"`, 'bubble-error');
      logInteraction({ debug_excuse_queried: randomExcuse });
    });
  }

  if (btnDiagnostic) {
    btnDiagnostic.addEventListener('click', () => {
      btnDiagnostic.disabled = true;
      btnDiagnostic.textContent = "RUNNING...";
      typeInConsole("Initializing Brain-Mouth Synchronization Check...");
      
      setTimeout(() => {
        typeInConsole("Diagnostic log: Checking filter integrity... OK.\nChecking context awareness... OK.\nTerminating Sarcasm.exe... Done.");
        setTimeout(() => {
          typeInConsole("SUCCESS: Think-Before-You-Speak patch validated and active!", false);
          appendChatBubble("[DEBUG CONSOLE] Hot-Fix Sync Diagnostic successfully validated 100% thought-to-speech alignment.", "bubble-success");
          btnDiagnostic.disabled = false;
          btnDiagnostic.textContent = "RUN DIAGNOSTIC";
          logInteraction({ debug_diagnostic_ran: "Success" });
        }, 1500);
      }, 1500);
    });
  }

  if (debugEgoSlider) {
    debugEgoSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      egoDebugVal.textContent = `${val}%`;
      
      if (egoMeterFill) {
        egoMeterFill.style.width = `${val}%`;
      }
      if (egoMeterVal) {
        egoMeterVal.textContent = `${val}%`;
      }
      
      if (val > 50) {
        egoDebugVal.style.color = 'var(--coral-accent)';
      } else {
        egoDebugVal.style.color = 'var(--mint-accent)';
      }
    });
  }

  // ==========================================================================
  // COMPENSATION INTERACTIVE WIDGET PLAYGROUND (RESTITUTION TAB)
  // ==========================================================================
  const playgroundPanel = document.getElementById('bribe-playground-panel');
  const playgroundEmoji = document.getElementById('playground-emoji');
  const playgroundTitle = document.getElementById('playground-title');
  const playgroundWidget = document.getElementById('playground-widget-content');

  function showBribePlayground(planName) {
    if (!playgroundPanel) return;
    
    playgroundPanel.style.display = 'block';
    
    // Smooth scroll into playground
    setTimeout(() => {
      playgroundPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    if (planName.includes("Feast")) {
      playgroundEmoji.textContent = "🍔";
      playgroundTitle.textContent = "Plan A: The Feast Wallet Damage Estimator";
      playgroundWidget.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1rem; text-align: left; padding: 0.5rem 0;">
          <p style="font-size: 0.8rem; color: var(--apple-text-body);">
            Drag the slider to adjust your target dinner level. Watch Hardik's financial reserves drain in real-time.
          </p>
          <div>
            <label style="font-size: 0.8rem; font-weight: 700; color: var(--apple-text-dark); display: block; margin-bottom: 0.5rem;">Feast Calorie Intake Target:</label>
            <input type="range" min="500" max="5000" value="1500" class="fun-slider" id="feast-calorie-slider" style="background: var(--apple-gray-200);">
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--apple-text-muted); margin-top: 0.25rem;">
              <span>Peckish (500 cal)</span>
              <span id="calorie-val" style="font-weight: 700; color: var(--sky-accent);">1500 cal</span>
              <span>Black Hole (5000 cal)</span>
            </div>
          </div>
          
          <div style="display: flex; gap: 1.5rem; flex-wrap: wrap;">
            <label style="font-size: 0.8rem; font-weight: 600; color: var(--apple-text-body); display: flex; align-items: center; gap: 0.4rem; cursor: pointer;">
              <input type="checkbox" id="chk-dessert" style="accent-color: var(--sky-accent);"> Add Premium Dessert (+ $15)
            </label>
            <label style="font-size: 0.8rem; font-weight: 600; color: var(--apple-text-body); display: flex; align-items: center; gap: 0.4rem; cursor: pointer;">
              <input type="checkbox" id="chk-drinks" style="accent-color: var(--sky-accent);"> Add Fancy Mocktails (+ $25)
            </label>
          </div>
          
          <div style="background: var(--apple-gray-100); border: 1px solid var(--apple-gray-200); padding: 1rem; border-radius: 8px; margin-top: 0.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <span style="font-size: 0.75rem; color: var(--apple-text-muted); display: block;">ESTIMATED DAMAGE TO HARDIK'S WALLET</span>
              <span id="feast-cost-display" style="font-size: 1.3rem; font-weight: 800; color: var(--apple-text-dark);">$30.00</span>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 0.75rem; color: var(--apple-text-muted); display: block;">WALLET CRITICAL LEVEL</span>
              <span id="wallet-status" style="font-size: 0.8rem; font-weight: 700; color: var(--mint-accent);">SAFE (SURVIVABLE)</span>
            </div>
          </div>
          
          <div style="background: var(--sky-pastel-bg); border: 1px solid rgba(0, 122, 255, 0.15); padding: 0.8rem 1rem; border-radius: 8px; font-size: 0.75rem; color: var(--sky-accent); font-style: italic;" id="feast-wallet-comment">
            "Phew! This fits well within my budget. Ready to treat you!"
          </div>
          
          <button class="pricing-btn popular-btn" id="btn-mock-order" style="margin-top: 0.5rem; padding: 0.65rem;">DISPATCH FEAST OFFER DETAILS</button>
        </div>
      `;
      
      const calSlider = document.getElementById('feast-calorie-slider');
      const calVal = document.getElementById('calorie-val');
      const chkDessert = document.getElementById('chk-dessert');
      const chkDrinks = document.getElementById('chk-drinks');
      const costDisplay = document.getElementById('feast-cost-display');
      const statusDisplay = document.getElementById('wallet-status');
      const commentDisplay = document.getElementById('feast-wallet-comment');
      const btnMockOrder = document.getElementById('btn-mock-order');
      
      function updateFeastCost() {
        const cal = parseInt(calSlider.value);
        calVal.textContent = `${cal} cal`;
        
        let baseCost = 15 + Math.round((cal - 500) / 100); 
        if (chkDessert.checked) baseCost += 15;
        if (chkDrinks.checked) baseCost += 25;
        
        costDisplay.textContent = `$${baseCost.toFixed(2)}`;
        
        if (baseCost < 35) {
          statusDisplay.textContent = "SAFE (SURVIVABLE)";
          statusDisplay.style.color = "var(--mint-accent)";
          commentDisplay.textContent = `"Phew! This fits well within my budget. Ready to treat you!"`;
        } else if (baseCost < 75) {
          statusDisplay.textContent = "CRYING IN SILENCE";
          statusDisplay.style.color = "var(--sunny-accent)";
          commentDisplay.textContent = `"Totally fair. I deserve to pay this penalty fee."`;
        } else {
          statusDisplay.textContent = "CRITICAL BANKRUPTCY";
          statusDisplay.style.color = "var(--coral-accent)";
          commentDisplay.textContent = `"Entering credit card distress... but friendship is completely priceless!"`;
        }
      }
      
      calSlider.addEventListener('input', updateFeastCost);
      chkDessert.addEventListener('change', updateFeastCost);
      chkDrinks.addEventListener('change', updateFeastCost);
      updateFeastCost();
      
      btnMockOrder.addEventListener('click', () => {
        btnMockOrder.textContent = "DISPATCHED! 🚀";
        btnMockOrder.disabled = true;
        setTimeout(() => {
          btnMockOrder.textContent = "DISPATCH FEAST OFFER DETAILS";
          btnMockOrder.disabled = false;
        }, 2000);
        
        const costStr = costDisplay.textContent;
        appendChatBubble(`[FEAST SIMULATOR] Authorized feast order configured at calorie target. Wallet damage: ${costStr}`, 'bubble-success');
        showToastNotification(`Feast details dispatched successfully at ${costStr}!`, "🍔");
        logInteraction({ feast_simulator_cost: costStr, feast_calories: calSlider.value });
      });
      
    } else if (planName.includes("Ultimate")) {
      playgroundEmoji.textContent = "📜";
      playgroundTitle.textContent = "Plan B: Dynamic Apology Certificate Generator";
      playgroundWidget.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1rem; text-align: left; padding: 0.5rem 0;">
          <p style="font-size: 0.8rem; color: var(--apple-text-body);">
            Customize and print your official Notarized Friendship Apology Certificate. Hardik is legally bound by this document.
          </p>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label style="font-size: 0.8rem; font-weight: 700; color: var(--apple-text-dark); display: block; margin-bottom: 0.25rem;">Friend's Name:</label>
              <input type="text" id="cert-friend-name" value="Keshav" style="width: 100%; padding: 0.4rem 0.6rem; border: 1px solid var(--apple-gray-300); border-radius: var(--radius-apple-sm); font-size: 0.85rem; outline: none;">
            </div>
            <div>
              <label style="font-size: 0.8rem; font-weight: 700; color: var(--apple-text-dark); display: block; margin-bottom: 0.25rem;">Select Crime Committed:</label>
              <select id="cert-crime-type" style="width: 100%; padding: 0.4rem 0.6rem; border: 1px solid var(--apple-gray-300); border-radius: var(--radius-apple-sm); font-size: 0.85rem; outline: none; background: white;">
                <option value="Speaking With Zero Brain Latency">Speaking With Zero Brain Latency</option>
                <option value="General Conversational Glitches">General Conversational Glitches</option>
                <option value="Severe Conversational Dorkiness">Severe Conversational Dorkiness</option>
                <option value="Bypassing Mental Filters Entirely">Bypassing Mental Filters Entirely</option>
              </select>
            </div>
          </div>
          
          <button class="pricing-btn" id="btn-build-cert" style="background: var(--apple-text-dark); color: white; border: none; font-weight: 700; padding: 0.6rem;">NOTARIZE & GENERATE CERTIFICATE</button>
          
          <!-- RENDERED CERTIFICATE PLACEHOLDER -->
          <div id="certificate-output" style="display: none; border: 6px double #d4af37; background: #fffdf5; padding: 1.5rem; text-align: center; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-top: 1rem; position: relative;">
            <div style="font-family: serif; font-size: 1.6rem; font-weight: 700; color: #8a6d1c; margin-bottom: 0.5rem;">Friendship Pardon Certificate</div>
            <div style="font-size: 0.7rem; letter-spacing: 2px; text-transform: uppercase; color: var(--apple-text-muted); margin-bottom: 1.25rem;">Project Olive Branch Notary Office</div>
            <div style="font-size: 0.8rem; color: var(--apple-text-body); margin-bottom: 0.5rem;">This document officially certifies that</div>
            <div id="cert-display-friend" style="font-size: 1.25rem; font-weight: 800; color: var(--apple-text-dark); border-bottom: 1px solid #ddd; display: inline-block; min-width: 150px; margin-bottom: 0.5rem; padding-bottom: 2px;">Keshav</div>
            <div style="font-size: 0.8rem; color: var(--apple-text-body); margin-bottom: 0.5rem;">is fully entitled to complete and absolute pardon from all offenses of</div>
            <div id="cert-display-crime" style="font-size: 0.95rem; font-weight: 700; color: var(--coral-accent); font-style: italic; margin-bottom: 1.25rem;">"Speaking With Zero Brain Latency"</div>
            <div style="font-size: 0.75rem; color: var(--apple-text-body); line-height: 1.4; margin-bottom: 1.5rem;">
              committed by <b style="color: var(--apple-text-dark);">Hardik</b>. This agreement is legally binding in the court of Best Friends Forever.
            </div>
            
            <div style="display: flex; justify-content: space-around; font-size: 0.7rem; color: var(--apple-text-muted); margin-top: 1rem;">
              <div style="display: flex; flex-direction: column; align-items: center; border-top: 1px solid #ccc; width: 100px; padding-top: 0.25rem;">
                <span style="font-family: cursive; font-size: 0.8rem; color: #222;">Hardik's Ego</span>
                <span>Offender Signature</span>
              </div>
              <div style="font-size: 1.8rem; position: absolute; right: 2rem; bottom: 2.2rem; transform: rotate(-10deg); opacity: 0.85;" title="Official Seal">🏆</div>
              <div style="display: flex; flex-direction: column; align-items: center; border-top: 1px solid #ccc; width: 100px; padding-top: 0.25rem;">
                <span style="font-family: sans-serif; font-weight: bold; color: #8a6d1c;">APPROVED</span>
                <span>Notary Status</span>
              </div>
            </div>
            
            <button class="pricing-btn" id="btn-print-cert" style="margin-top: 1.25rem; font-size: 0.8rem; padding: 0.4rem 1rem; width: auto; display: inline-flex; align-items: center; gap: 0.35rem;">
              <i data-lucide="printer" style="width: 0.9rem; height: 0.9rem;"></i> Print Certificate
            </button>
          </div>
        </div>
      `;
      
      const certFriend = document.getElementById('cert-friend-name');
      const certCrime = document.getElementById('cert-crime-type');
      const btnBuild = document.getElementById('btn-build-cert');
      const certBox = document.getElementById('certificate-output');
      const displayFriend = document.getElementById('cert-display-friend');
      const displayCrime = document.getElementById('cert-display-crime');
      const btnPrint = document.getElementById('btn-print-cert');
      
      btnBuild.addEventListener('click', () => {
        const nameVal = certFriend.value.trim() || "Keshav";
        const crimeVal = certCrime.value;
        
        displayFriend.textContent = nameVal;
        displayCrime.textContent = `"${crimeVal}"`;
        
        certBox.style.display = 'block';
        lucide.createIcons();
        
        appendChatBubble(`[CERTIFICATE ENGINE] Notarized apology generated for ${nameVal} under charge of "${crimeVal}"`, 'bubble-success');
        showToastNotification("Official Apology Certificate successfully notarized! 📜", "📜");
        logInteraction({ certificate_for: nameVal, certificate_charge: crimeVal });
      });
      
      btnPrint.addEventListener('click', () => {
        window.print();
      });
      
    } else if (planName.includes("Mouth")) {
      playgroundEmoji.textContent = "🤐";
      playgroundTitle.textContent = "Plan C: Remote Mouth Kill-Switch Interrupt";
      playgroundWidget.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1rem; text-align: left; padding: 0.5rem 0;">
          <p style="font-size: 0.8rem; color: var(--apple-text-body);">
            Test out the remote kill-switch. When clicked, Hardik is legally forced into absolute silence for 10 seconds.
          </p>
          
          <div style="display: flex; align-items: center; justify-content: center; min-height: 100px; background: var(--apple-gray-100); border-radius: 8px; border: 1px solid var(--apple-gray-200); position: relative; overflow: hidden;">
            <button id="btn-mouth-mute" style="background: var(--coral-accent); color: white; border: none; font-size: 0.95rem; font-weight: 700; width: 70px; height: 70px; border-radius: 50%; cursor: pointer; box-shadow: 0 4px 15px rgba(255, 90, 90, 0.4); display: flex; align-items: center; justify-content: center; z-index: 2; transition: all 0.2s ease;">
              MUTE
            </button>
            
            <div id="mute-countdown-ui" style="display: none; flex-direction: column; align-items: center; justify-content: center; position: absolute; width: 100%; height: 100%; top: 0; left: 0; background: var(--coral-pastel-bg); color: var(--coral-accent); z-index: 3;">
              <span style="font-size: 2.2rem; font-weight: 800; font-family: var(--font-mono);" id="mute-seconds">10s</span>
              <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Mouth Lock Enabled</span>
            </div>
          </div>
          
          <div style="background: var(--mint-pastel-bg); border: 1px solid rgba(52, 199, 89, 0.15); padding: 0.8rem 1rem; border-radius: 8px; font-size: 0.75rem; color: var(--apple-text-body);" id="mute-explain">
            Status: **Hardik is speaking normally.** (Click button to interrupt)
          </div>
        </div>
      `;
      
      const btnMute = document.getElementById('btn-mouth-mute');
      const muteUI = document.getElementById('mute-countdown-ui');
      const muteSec = document.getElementById('mute-seconds');
      const muteExplain = document.getElementById('mute-explain');
      
      btnMute.addEventListener('click', () => {
        let count = 10;
        muteUI.style.display = 'flex';
        muteSec.textContent = `${count}s`;
        muteExplain.innerHTML = `Status: <b>Hardik is silenced!</b> Mouth thread disabled.`;
        
        if (sadViolin) {
          sadViolin.volume = 0.03;
        }
        
        appendChatBubble("[SYSTEM] INTERRUPT SIGNAL RECEIVED: Muting Hardik's output channels...", "bubble-error");
        showToastNotification("Remote mouth mute signal active! 🤐", "🤐");
        
        const countdownTimer = setInterval(() => {
          count--;
          if (count <= 0) {
            clearInterval(countdownTimer);
            muteUI.style.display = 'none';
            muteExplain.innerHTML = `Status: <b>Hardik is speaking normally.</b> (Click button to interrupt)`;
            
            if (sadViolin) {
              sadViolin.volume = 0.25;
            }
            appendChatBubble("[SYSTEM] Lock timer expired. Mouth channels reset.", "bubble-success");
            showToastNotification("Mouth lock expired. Speaking channels reactivated.", "🎙️");
          } else {
            muteSec.textContent = `${count}s`;
            if (count % 3 === 0) {
              appendChatBubble("🤐 [MUTED BY USER INTERRUPT]", "bubble-system");
            }
          }
        }, 1000);
        
        logInteraction({ mouth_kill_switch_activated: true });
      });
    }
  }

  // ==========================================================================
  // SINCERITY.AI CUSTOMIZER (BETA) ENGINE
  // ==========================================================================
  const btnGenerateAiApology = document.getElementById('btn-generate-ai-apology');
  const aiToneSelect = document.getElementById('ai-tone-select');
  const aiTearsSelect = document.getElementById('ai-tears-select');
  const aiApologyOutput = document.getElementById('ai-apology-output');

  const apologyTemplates = {
    puppy: {
      low: "Bork bork... 🥺 I made a tiny mistake. I spoke before thinking. I promise to sit, stay, and try my best to be a good friend. Here's a virtual paw high-five?",
      medium: "Awoo! 🥺 I am so sorry. My mouth ran in raw unfiltered puppy mode. Look at my puppy eyes... I'm sitting in the corner of shame. Please feed me pizza and say we good!",
      high: "whimper whimper... 😭 My heart is broken! I'm officially crying in the doghouse. I am a certified dork. I will follow you everywhere and never speak without brain approval again!",
      extreme: "Niagara Falls of puppy tears! 😭😭😭😭 Barking in complete despair! I am so sorry, Keshav! I will run 100 laps, give you all the toys, and order you the biggest feast ever! Please pardon this bad boy!"
    },
    shakespeare: {
      low: "Hark! 🎭 Thy servant Hardik did commit a hasty speech. A minor slip of the tongue upon the stage of friendship. Let us mend this rift with a cup of finest espresso.",
      medium: "Alas! 🎭 My tongue did run before my brain did counsel! A tragic folly upon the kingdom. O noble Keshav, superior of this bond, spare thy sword of anger and let us dine!",
      high: "Woe is me! 😭 A plague upon my unfiltered mouth! I weep in the shadow of my terrible deeds. My brain slept whilst my tongue did speak treason. Grant me thy pardon, sweet friend!",
      extreme: "O heavens! 😭😭😭😭 A tempest of regret! The rivers of tears overflow my estate! I admit absolute defeat and crown thy name as the superior ruler of our fellowship. Let the feast be ordered!"
    },
    corporate: {
      low: "SYSTEM ALERT: Hardik-OS experienced a minor mouth-to-brain latency spike. Hotfix v2.0.1 prepared. Recommended action: Close ticket and resume standard chat parameters.",
      medium: "WARNING: Behavioral Core Dump detected. Sincerity registers peaking at 100%. Ego.dll bypassed. Hotfix v2.0.2 deployed successfully. Please review patch notes and approve ceasefire.",
      high: "CRITICAL: BrainFilter.dll failed to load. Mouth Speech Thread ran on raw unfiltered logic. Hardik-OS is currently in safe mode. Friendship restore point ready. Please click restore.",
      extreme: "FATAL ERROR: Niagara Falls of diagnostic tears! 😭😭 system crash! Friendship integrity down to 12%. Emergency hotfix v2.0.4 compiled. Immediate pizza and silence protocols required to prevent database collapse!"
    },
    poetic: {
      low: "🌸 Like a leaf drifting out of season, my words slipped out before my thoughts could guide them. Forgive my fleeting lapse, for thy friendship is the light that guides my dorky soul.",
      medium: "🌸 The stars grow dim when our words miss their mark. I spoke in haste, a shadow in the night. Let my sincerity be the bridge that brings back the warmth of our laughter.",
      high: "🌸 I stand in the rain of my regret, wishing I could rewrite the letters of the air. I spoke without thinking, and the silence that followed was a cold winter. Please forgive this dorky poet.",
      extreme: "🌸 Niagara Falls of tears cannot wash away the sorrow of my unfiltered words! 😭😭 My heart is a bankrupt database without thy smiles. Forgive my tongue, and let us write a new chapter over delicious calories."
    }
  };

  if (btnGenerateAiApology) {
    btnGenerateAiApology.addEventListener('click', () => {
      const tone = aiToneSelect.value;
      const tears = aiTearsSelect.value;
      const apologyText = apologyTemplates[tone][tears];
      
      aiApologyOutput.style.display = 'block';
      aiApologyOutput.innerHTML = '';
      
      let i = 0;
      function typeText() {
        if (i < apologyText.length) {
          aiApologyOutput.innerHTML += apologyText.charAt(i);
          i++;
          setTimeout(typeText, 10);
        }
      }
      typeText();
      
      appendChatBubble(`[SINCERITY AI] Apology compiled in ${tone} tone (${tears} intensity)`, 'bubble-bot');
      showToastNotification("Custom Apology Compiled! 🤖", "🤖");
      logInteraction({ compiled_tone: tone, compiled_intensity: tears });
    });
  }

  // ==========================================================================
  // FRIENDSHIP CAPTCHA VERIFICATION (PATCH NOTES TAB)
  // ==========================================================================
  const btnVerifyCaptcha = document.getElementById('btn-verify-captcha');
  const captchaQuestions = document.getElementById('captcha-questions-container');
  const captchaSuccess = document.getElementById('captcha-success-box');

  if (btnVerifyCaptcha) {
    btnVerifyCaptcha.addEventListener('click', () => {
      const q1 = document.querySelector('input[name="captcha-q1"]:checked');
      const q2 = document.querySelector('input[name="captcha-q2"]:checked');
      
      if (!q1 || !q2) {
        showToastNotification("🔒 Please answer all CAPTCHA questions!", "🤐");
        return;
      }
      
      if (q1.value === 'hardik' && (q2.value === 'both' || q2.value === 'feast' || q2.value === 'shut')) {
        captchaQuestions.style.display = 'none';
        captchaSuccess.style.display = 'block';
        
        appendChatBubble("[SECURITY CAPTCHA] Identity verified. Superior Friend status confirmed.", "bubble-success");
        showToastNotification("CAPTCHA Verified! Superior Friend status unlocked. 🔓", "✅");
        
        startConfetti();
        setTimeout(stopConfetti, 2500);
        
        logInteraction({ captcha_passed: true });
      } else {
        showToastNotification("❌ Incorrect answers! Think again.", "😤");
      }
    });
  }

  // ==========================================================================
  // VIRTUAL APOLOGY ASSISTANT (PUPPY INTERACTION)
  // ==========================================================================
  const btnPetPuppy = document.getElementById('btn-pet-puppy');
  const puppyEmoji = document.getElementById('puppy-emoji');
  const puppySpeech = document.getElementById('puppy-speech');
  const puppyMood = document.getElementById('puppy-mood');
  const puppyWags = document.getElementById('puppy-wags');
  
  let wagsCount = 0;
  const puppyPhrases = [
    "Bork! That's the spot! Forgiveness registers are rising!",
    "Hardik is a major dork, but he makes a great pizza sponsor!",
    "Every pet makes my tail wag faster! Please sign the ceasefire!",
    "My sensors show Hardik is 1000% sorry. Please accept the treaty!",
    "Wag wag! 🐶 If you forgive him, I get a virtual treat!",
    "Puppy analysis complete: Hardik has learned his lesson!"
  ];
  
  const puppyMoods = [
    "Pleading",
    "Happy 🐕",
    "Super Happy 💖",
    "Ecstatic ✨",
    "Flying 🚀",
    "Infinite Love 🌸"
  ];

  if (btnPetPuppy) {
    btnPetPuppy.addEventListener('click', () => {
      wagsCount++;
      puppyWags.textContent = wagsCount;
      
      // Update emoji temporarily
      puppyEmoji.textContent = "🐶";
      puppyEmoji.style.transform = "scale(1.2) rotate(10deg)";
      
      setTimeout(() => {
        puppyEmoji.textContent = "🥺";
        puppyEmoji.style.transform = "";
      }, 500);
      
      // Update mood and speech
      const phraseIndex = Math.min(Math.floor(wagsCount / 3), puppyPhrases.length - 1);
      const moodIndex = Math.min(Math.floor(wagsCount / 2), puppyMoods.length - 1);
      
      puppySpeech.textContent = `"${puppyPhrases[phraseIndex]}"`;
      puppyMood.textContent = puppyMoods[moodIndex];
      
      if (moodIndex >= 3) {
        puppyMood.style.color = "var(--mint-accent)";
      }
      
      appendChatBubble(`[PUPPY] Petted Virtual Sorry Puppy. Tail wags: ${wagsCount}`, 'bubble-success');
      showToastNotification("Puppy petted! Mood boosted. 🐶", "💖");
      
      // Little confetti pop on mood peaks
      if (wagsCount % 5 === 0) {
        startConfetti();
        setTimeout(stopConfetti, 1000);
      }
      
      logInteraction({ puppy_petted: wagsCount });
    });
  }

  // Baseline init of wizard visuals
  updateWizardVisuals();

  // ==========================================================================
  // LIVE "TIME SINCE HARDIK LAST USED HIS BRAIN" COUNTER
  // ==========================================================================
  const brainTimerEl = document.getElementById('brain-timer');
  
  // Set a fake "last brain usage" date — 47 days, 13 hours, 22 minutes ago
  const lastBrainUsage = new Date();
  lastBrainUsage.setDate(lastBrainUsage.getDate() - 47);
  lastBrainUsage.setHours(lastBrainUsage.getHours() - 13);
  lastBrainUsage.setMinutes(lastBrainUsage.getMinutes() - 22);

  function updateBrainTimer() {
    const now = new Date();
    const diff = now - lastBrainUsage;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (brainTimerEl) {
      brainTimerEl.textContent = `${String(days).padStart(2, '0')}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    }
  }

  updateBrainTimer();
  setInterval(updateBrainTimer, 1000);

  // ==========================================================================
  // HARDIK'S EMOTIONAL WEATHER FORECAST
  // ==========================================================================
  const weatherForecasts = [
    { emoji: "😰", condition: "HEAVY GUILT SHOWERS", detail: "Visibility: Low (ego fog). Wind: Strong apologetic gusts from the north.", temp: "98°F", humidity: "87%" },
    { emoji: "🌧️", condition: "TORRENTIAL REGRET RAIN", detail: "Flash floods of apologies expected all day. Seek shelter in forgiveness.", temp: "72°F", humidity: "95%" },
    { emoji: "⛈️", condition: "SHAME THUNDERSTORM", detail: "Lightning strikes of self-awareness. Thunder of cringe memories. Stay indoors.", temp: "105°F", humidity: "100%" },
    { emoji: "🌪️", condition: "PRIDE TORNADO WARNING", detail: "Category 5 ego destruction in progress. All sincerity shelters activated.", temp: "88°F", humidity: "78%" },
    { emoji: "🌤️", condition: "PARTLY SORRY SKIES", detail: "Clearing guilt clouds with a 60% chance of afternoon forgiveness rays.", temp: "75°F", humidity: "45%" },
    { emoji: "☁️", condition: "OVERCAST AWKWARDNESS", detail: "Dense fog of unresolved tension. Do not operate heavy conversations.", temp: "68°F", humidity: "82%" },
    { emoji: "🥶", condition: "COLD SHOULDER FRONT", detail: "Sub-zero emotional temperatures. Frostbite risk on all friendship channels.", temp: "12°F", humidity: "20%" },
    { emoji: "🌈", condition: "INCOMING FORGIVENESS RAINBOW", detail: "A beautiful arc of reconciliation spotted on the horizon! Feast probability: HIGH.", temp: "80°F", humidity: "55%" }
  ];

  const btnRefreshWeather = document.getElementById('btn-refresh-weather');
  const weatherEmojiDisplay = document.getElementById('weather-emoji-display');
  const weatherCondition = document.getElementById('weather-condition');
  const weatherDetail = document.getElementById('weather-detail');
  const weatherTemp = document.getElementById('weather-temp');
  const weatherHumidity = document.getElementById('weather-humidity');

  function refreshWeatherForecast() {
    const forecast = weatherForecasts[Math.floor(Math.random() * weatherForecasts.length)];
    
    if (weatherEmojiDisplay) weatherEmojiDisplay.textContent = forecast.emoji;
    if (weatherCondition) weatherCondition.textContent = forecast.condition;
    if (weatherDetail) weatherDetail.textContent = forecast.detail;
    if (weatherTemp) weatherTemp.textContent = `🌡️ Shame Index: ${forecast.temp}`;
    if (weatherHumidity) weatherHumidity.textContent = `💧 Tear Humidity: ${forecast.humidity}`;
    
    appendChatBubble(`[WEATHER] Forecast updated: ${forecast.condition}`, 'bubble-bot');
    showToastNotification(`Weather: ${forecast.condition}`, forecast.emoji);
    logInteraction({ weather_forecast: forecast.condition });
  }

  if (btnRefreshWeather) {
    btnRefreshWeather.addEventListener('click', () => {
      btnRefreshWeather.textContent = "🔄 SCANNING ATMOSPHERE...";
      btnRefreshWeather.disabled = true;
      
      setTimeout(() => {
        refreshWeatherForecast();
        btnRefreshWeather.textContent = "🔄 REFRESH FORECAST";
        btnRefreshWeather.disabled = false;
      }, 800);
    });
  }

  // Auto-cycle weather every 30 seconds
  setInterval(() => {
    const forecast = weatherForecasts[Math.floor(Math.random() * weatherForecasts.length)];
    if (weatherEmojiDisplay) weatherEmojiDisplay.textContent = forecast.emoji;
    if (weatherCondition) weatherCondition.textContent = forecast.condition;
    if (weatherDetail) weatherDetail.textContent = forecast.detail;
    if (weatherTemp) weatherTemp.textContent = `🌡️ Shame Index: ${forecast.temp}`;
    if (weatherHumidity) weatherHumidity.textContent = `💧 Tear Humidity: ${forecast.humidity}`;
  }, 30000);

  // ==========================================================================
  // EMOTIONAL DAMAGE CALCULATOR
  // ==========================================================================
  const btnCalcDamage = document.getElementById('btn-calc-damage');
  const damageOutput = document.getElementById('damage-calc-output');
  const damageStepsContainer = document.getElementById('damage-calc-steps');
  const damageTotal = document.getElementById('damage-calc-total');
  const damageTotalVal = document.getElementById('damage-total-val');

  const damageCategories = [
    { icon: "💬", text: "Words spoken without brain consultation", baseVal: 847 },
    { icon: "😤", text: "Friend's feelings injured (critical severity)", baseVal: 1243 },
    { icon: "🧠", text: "Brain-to-mouth sync failures logged", baseVal: 456 },
    { icon: "⏱️", text: "Seconds of thinking skipped entirely", baseVal: 9999 },
    { icon: "💔", text: "Micro-trust fractures detected", baseVal: 312 },
    { icon: "🤦", text: "Cringe factor multiplier applied (x2.5)", baseVal: 625 },
    { icon: "📉", text: "Friendship stock market crash index", baseVal: 1567 }
  ];

  if (btnCalcDamage) {
    btnCalcDamage.addEventListener('click', () => {
      btnCalcDamage.disabled = true;
      btnCalcDamage.textContent = "⚡ ANALYZING...";
      
      damageOutput.style.display = 'block';
      damageStepsContainer.innerHTML = '';
      damageTotal.style.display = 'none';
      
      let totalDamage = 0;
      
      damageCategories.forEach((cat, index) => {
        const randomVal = cat.baseVal + Math.floor(Math.random() * 500) - 100;
        totalDamage += randomVal;
        
        setTimeout(() => {
          const stepEl = document.createElement('div');
          stepEl.className = 'damage-calc-step';
          stepEl.style.animationDelay = `${index * 0.1}s`;
          stepEl.innerHTML = `
            <span class="damage-step-icon">${cat.icon}</span>
            <span class="damage-step-text">${cat.text}</span>
            <span class="damage-step-value">+${randomVal.toLocaleString()}</span>
          `;
          damageStepsContainer.appendChild(stepEl);
          
          // Show total after all steps
          if (index === damageCategories.length - 1) {
            setTimeout(() => {
              damageTotal.style.display = 'flex';
              
              // Animate the total value counting up
              let current = 0;
              const target = totalDamage;
              const step = Math.ceil(target / 60);
              const countInterval = setInterval(() => {
                current += step;
                if (current >= target) {
                  current = target;
                  clearInterval(countInterval);
                }
                damageTotalVal.textContent = current.toLocaleString();
              }, 16);
              
              appendChatBubble(`[DAMAGE CALC] Total emotional damage assessed: ${totalDamage.toLocaleString()} units`, 'bubble-error');
              showToastNotification(`Emotional damage: ${totalDamage.toLocaleString()} units! 💥`, "💥");
              
              btnCalcDamage.disabled = false;
              btnCalcDamage.textContent = "⚡ RECALCULATE DAMAGE";
              
              startConfetti();
              setTimeout(stopConfetti, 1500);
              
              logInteraction({ emotional_damage: totalDamage });
            }, 500);
          }
        }, (index + 1) * 350);
      });
    });
  }

  // ==========================================================================
  // APOLOGY PUNISHMENT ROULETTE
  // ==========================================================================
  const btnSpinRoulette = document.getElementById('btn-spin-roulette');
  const rouletteWheel = document.getElementById('roulette-wheel');
  const rouletteResult = document.getElementById('roulette-result');
  const rouletteResultEmoji = document.getElementById('roulette-result-emoji');
  const rouletteResultText = document.getElementById('roulette-result-text');
  const rouletteResultDesc = document.getElementById('roulette-result-desc');

  const roulettePunishments = [
    { emoji: "🍕", name: "Free Pizza", desc: "Hardik must buy you a large pizza within 24 hours. No excuses." },
    { emoji: "🤐", name: "24hr Silence Mode", desc: "Hardik cannot speak for a full 24 hours. Communication by notepad only." },
    { emoji: "📢", name: "Public Apology", desc: "Hardik must post a public apology on social media and tag you." },
    { emoji: "🧹", name: "Do Your Chores", desc: "Hardik does all your chores for an entire weekend. No complaints." },
    { emoji: "💰", name: "Pay $50 Fine", desc: "A $50 penalty fee deposited directly to the Friendship Compensation Fund." },
    { emoji: "🎵", name: "Sing 'Sorry' by Bieber", desc: "Hardik must record himself singing Justin Bieber's 'Sorry' and send it to you." },
    { emoji: "🐕", name: "Walk Your Dog", desc: "Hardik must walk your dog (or imaginary dog) for a week." },
    { emoji: "👑", name: "You're the Boss", desc: "You get to make ALL decisions for 48 hours. Hardik must comply." }
  ];

  if (btnSpinRoulette) {
    btnSpinRoulette.addEventListener('click', () => {
      btnSpinRoulette.disabled = true;
      btnSpinRoulette.textContent = "🎰 SPINNING...";
      rouletteResult.style.display = 'none';
      
      const segments = rouletteWheel.querySelectorAll('.roulette-segment');
      const totalSegments = segments.length;
      const winnerIndex = Math.floor(Math.random() * totalSegments);
      
      // Total animation cycles: 3 full loops + landing on winner
      const totalSteps = totalSegments * 3 + winnerIndex;
      let currentStep = 0;
      
      // Speed curve: starts fast, slows down
      function getDelay(step) {
        const progress = step / totalSteps;
        return 60 + Math.pow(progress, 2) * 300;
      }
      
      function highlightNext() {
        // Clear previous highlights
        segments.forEach(s => s.classList.remove('seg-active', 'seg-winner'));
        
        const activeIndex = currentStep % totalSegments;
        segments[activeIndex].classList.add('seg-active');
        
        currentStep++;
        
        if (currentStep <= totalSteps) {
          setTimeout(highlightNext, getDelay(currentStep));
        } else {
          // WINNER!
          segments[winnerIndex].classList.remove('seg-active');
          segments[winnerIndex].classList.add('seg-winner');
          
          const punishment = roulettePunishments[winnerIndex];
          
          rouletteResult.style.display = 'block';
          rouletteResultEmoji.textContent = punishment.emoji;
          rouletteResultText.textContent = `${punishment.emoji} ${punishment.name}!`;
          rouletteResultDesc.textContent = punishment.desc;
          
          startConfetti();
          setTimeout(stopConfetti, 2000);
          
          appendChatBubble(`[ROULETTE] Punishment selected: "${punishment.name}" — ${punishment.desc}`, 'bubble-error');
          showToastNotification(`Roulette result: ${punishment.name}!`, punishment.emoji);
          
          btnSpinRoulette.disabled = false;
          btnSpinRoulette.textContent = "🎰 SPIN AGAIN";
          
          logInteraction({ roulette_result: punishment.name });
        }
      }
      
      highlightNext();
    });
  }

  // ==========================================================================
  // FRIENDSHIP COMPATIBILITY SCORE GAUGE
  // ==========================================================================
  const btnRunCompat = document.getElementById('btn-run-compat');
  const compatGaugeArc = document.getElementById('compat-gauge-arc');
  const compatScoreText = document.getElementById('compat-score-text');
  const compatVerdict = document.getElementById('compat-verdict');

  const compatVerdicts = [
    { min: 90, text: "🏆 LEGENDARY FRIENDSHIP. Despite Hardik's mouth malfunction, your bond transcends mortal comprehension. This friendship is basically indestructible." },
    { min: 80, text: "💎 DIAMOND-TIER BROS. A few conversational bugs can't break this. Hardik is a dork, but he's YOUR dork. Feast probability: MAXIMUM." },
    { min: 70, text: "🌟 PREMIUM FRIENDSHIP. Strong foundation, minor cracks from unfiltered mouth syndrome. Repairable with one good feast and a solid apology." },
    { min: 0, text: "⚠️ NEEDS REPAIR. Friendship core is intact but Hardik needs to stop talking and start listening. Deploy restitution plan immediately!" }
  ];

  if (btnRunCompat) {
    btnRunCompat.addEventListener('click', () => {
      btnRunCompat.disabled = true;
      btnRunCompat.textContent = "🧮 COMPUTING...";
      compatVerdict.style.display = 'none';
      
      // Reset gauge
      if (compatGaugeArc) compatGaugeArc.style.strokeDashoffset = '326.7';
      if (compatScoreText) compatScoreText.textContent = '...';
      
      // Always land between 85-99 because they're great friends
      const score = 85 + Math.floor(Math.random() * 15);
      const circumference = 326.7;
      const offset = circumference - (score / 100) * circumference;
      
      setTimeout(() => {
        // Animate the gauge fill
        if (compatGaugeArc) {
          compatGaugeArc.style.strokeDashoffset = offset;
          
          if (score >= 90) {
            compatGaugeArc.style.stroke = 'var(--mint-accent)';
          } else {
            compatGaugeArc.style.stroke = 'var(--sky-accent)';
          }
        }
        
        // Animate the counter
        let current = 0;
        const countInterval = setInterval(() => {
          current++;
          if (current >= score) {
            current = score;
            clearInterval(countInterval);
          }
          if (compatScoreText) compatScoreText.textContent = current;
        }, 20);
        
        // Show verdict
        setTimeout(() => {
          const verdict = compatVerdicts.find(v => score >= v.min);
          if (compatVerdict && verdict) {
            compatVerdict.style.display = 'block';
            compatVerdict.textContent = verdict.text;
          }
          
          btnRunCompat.disabled = false;
          btnRunCompat.textContent = "🧮 RUN AGAIN";
          
          appendChatBubble(`[COMPATIBILITY AI] Friendship score computed: ${score}/100`, 'bubble-success');
          showToastNotification(`Compatibility: ${score}/100! 🤝`, "🤝");
          
          if (score >= 90) {
            startConfetti();
            setTimeout(stopConfetti, 1500);
          }
          
          logInteraction({ compatibility_score: score });
        }, 1500);
      }, 800);
    });
  }

});
