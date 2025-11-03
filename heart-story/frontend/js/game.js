/**
 * Your Heart's Life Story - Game Logic
 * A retro Game Boy style game showing your heart's journey
 */

class HeartStoryGame {
  constructor() {
    // Game states
    this.STATE = {
      MODE_SELECT: 'mode_select',
      BIRTH_ENTRY: 'birth_entry',
      FIRST_BEAT: 'first_beat',
      LIVE_MONITOR: 'live_monitor',
      MILESTONES: 'milestones',
      // Day simulator states
      DAY_SIM_INTRO: 'day_sim_intro',
      DAY_SIM_ROOM: 'day_sim_room',
      DAY_SIM_CHOICE: 'day_sim_choice',
      DAY_SIM_SUMMARY: 'day_sim_summary'
    };

    this.currentState = this.STATE.MODE_SELECT;
    this.gameMode = null; // 'story' or 'day_sim'

    // Date entry fields
    this.dateFields = ['month', 'day', 'year'];
    this.currentFieldIndex = 0;
    this.birthDate = {
      month: 1,
      day: 1,
      year: 2000
    };

    // Heart data
    this.firstBeatDate = null;
    this.currentBeats = 0;
    this.beatsInterval = null;
    this.bpm = 70; // Average resting heart rate

    // Day simulator data
    this.daySimData = {
      currentRoom: 'bedroom',
      currentTime: '7:00 AM',
      currentBPM: 65,
      restingBPM: 65,
      statusEffects: [],
      activeEffects: [], // Track time-based effects
      choices: [],
      character: { x: 4, y: 6 },
      dayEvents: [],
      heartHealthyChoices: 0,
      totalChoices: 0,
      peakBPM: 65
    };

    this.selectedChoiceIndex = 0;
    this.selectedModeIndex = 0;

    // Screen element
    this.screen = document.getElementById('gameScreen');

    // Sound effects (simple beeps)
    this.audioContext = null;
    this.initAudio();
  }

  /**
   * Initialize Web Audio API for sound effects
   */
  initAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('Web Audio API not supported');
    }
  }

  /**
   * Play a beep sound
   */
  playBeep(frequency = 440, duration = 0.1) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'square'; // 8-bit style sound

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  /**
   * Initialize the game
   */
  init() {
    this.setupControls();
    this.showModeSelection();
  }

  /**
   * Setup button and keyboard controls
   */
  setupControls() {
    // D-pad buttons
    document.getElementById('btnUp').addEventListener('click', () => this.handleUp());
    document.getElementById('btnDown').addEventListener('click', () => this.handleDown());
    document.getElementById('btnLeft').addEventListener('click', () => this.handleLeft());
    document.getElementById('btnRight').addEventListener('click', () => this.handleRight());

    // Action buttons
    document.getElementById('btnA').addEventListener('click', () => this.handleA());
    document.getElementById('btnB').addEventListener('click', () => this.handleB());

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowUp':
          e.preventDefault();
          this.handleUp();
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.handleDown();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.handleLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.handleRight();
          break;
        case 'Enter':
        case 'z':
        case 'Z':
          e.preventDefault();
          this.handleA();
          break;
        case 'Escape':
        case 'x':
        case 'X':
          e.preventDefault();
          this.handleB();
          break;
      }
    });
  }

  /**
   * Handle directional and action inputs based on current state
   */
  handleUp() {
    this.playBeep(600, 0.05);

    switch(this.currentState) {
      case this.STATE.MODE_SELECT:
        this.selectedModeIndex = Math.max(0, this.selectedModeIndex - 1);
        this.updateModeSelection();
        break;
      case this.STATE.BIRTH_ENTRY:
        this.incrementCurrentField();
        break;
      case this.STATE.DAY_SIM_CHOICE:
        this.selectedChoiceIndex = Math.max(0, this.selectedChoiceIndex - 1);
        this.updateChoiceSelection();
        break;
      case this.STATE.DAY_SIM_ROOM:
        this.moveCharacter(0, -1);
        break;
      case this.STATE.DAY_SIM_SUMMARY:
        this.scrollSummary(-50);
        break;
    }
  }

  handleDown() {
    this.playBeep(600, 0.05);

    switch(this.currentState) {
      case this.STATE.MODE_SELECT:
        this.selectedModeIndex = Math.min(1, this.selectedModeIndex + 1);
        this.updateModeSelection();
        break;
      case this.STATE.BIRTH_ENTRY:
        this.decrementCurrentField();
        break;
      case this.STATE.DAY_SIM_CHOICE:
        const maxIndex = document.querySelectorAll('.choice-option').length - 1;
        this.selectedChoiceIndex = Math.min(maxIndex, this.selectedChoiceIndex + 1);
        this.updateChoiceSelection();
        break;
      case this.STATE.DAY_SIM_ROOM:
        this.moveCharacter(0, 1);
        break;
      case this.STATE.DAY_SIM_SUMMARY:
        this.scrollSummary(50);
        break;
    }
  }

  handleLeft() {
    this.playBeep(500, 0.05);

    switch(this.currentState) {
      case this.STATE.BIRTH_ENTRY:
        this.currentFieldIndex = Math.max(0, this.currentFieldIndex - 1);
        this.updateDateEntryDisplay();
        break;
      case this.STATE.DAY_SIM_ROOM:
        this.moveCharacter(-1, 0);
        break;
    }
  }

  handleRight() {
    this.playBeep(500, 0.05);

    switch(this.currentState) {
      case this.STATE.BIRTH_ENTRY:
        this.currentFieldIndex = Math.min(2, this.currentFieldIndex + 1);
        this.updateDateEntryDisplay();
        break;
      case this.STATE.DAY_SIM_ROOM:
        this.moveCharacter(1, 0);
        break;
    }
  }

  handleA() {
    this.playBeep(800, 0.1);

    switch(this.currentState) {
      case this.STATE.MODE_SELECT:
        this.confirmModeSelection();
        break;
      case this.STATE.BIRTH_ENTRY:
        this.confirmBirthDate();
        break;
      case this.STATE.FIRST_BEAT:
        this.showLiveMonitorScreen();
        break;
      case this.STATE.LIVE_MONITOR:
        this.showMilestonesScreen();
        break;
      case this.STATE.MILESTONES:
        this.showModeSelection();
        break;
      case this.STATE.DAY_SIM_INTRO:
        this.startDaySimulator();
        break;
      case this.STATE.DAY_SIM_CHOICE:
        this.confirmChoice();
        break;
      case this.STATE.DAY_SIM_SUMMARY:
        this.resetDaySimulator();
        break;
    }
  }

  handleB() {
    this.playBeep(400, 0.1);

    // B button goes back to previous screen
    switch(this.currentState) {
      case this.STATE.MODE_SELECT:
        // At main menu, do nothing
        break;
      case this.STATE.FIRST_BEAT:
        this.showBirthEntryScreen();
        break;
      case this.STATE.LIVE_MONITOR:
        this.showFirstBeatScreen();
        break;
      case this.STATE.MILESTONES:
        this.showLiveMonitorScreen();
        break;
      case this.STATE.BIRTH_ENTRY:
      case this.STATE.DAY_SIM_INTRO:
        this.showModeSelection();
        break;
      case this.STATE.DAY_SIM_ROOM:
      case this.STATE.DAY_SIM_CHOICE:
        // Cancel/go back (context dependent)
        break;
      case this.STATE.DAY_SIM_SUMMARY:
        this.showModeSelection();
        break;
    }
  }

  /**
   * Increment current date field
   */
  incrementCurrentField() {
    const field = this.dateFields[this.currentFieldIndex];

    switch(field) {
      case 'month':
        this.birthDate.month = this.birthDate.month >= 12 ? 1 : this.birthDate.month + 1;
        break;
      case 'day':
        const maxDay = this.getDaysInMonth(this.birthDate.month, this.birthDate.year);
        this.birthDate.day = this.birthDate.day >= maxDay ? 1 : this.birthDate.day + 1;
        break;
      case 'year':
        const currentYear = new Date().getFullYear();
        this.birthDate.year = this.birthDate.year >= currentYear ? 1920 : this.birthDate.year + 1;
        break;
    }

    this.updateDateEntryDisplay();
  }

  /**
   * Decrement current date field
   */
  decrementCurrentField() {
    const field = this.dateFields[this.currentFieldIndex];

    switch(field) {
      case 'month':
        this.birthDate.month = this.birthDate.month <= 1 ? 12 : this.birthDate.month - 1;
        break;
      case 'day':
        const maxDay = this.getDaysInMonth(this.birthDate.month, this.birthDate.year);
        this.birthDate.day = this.birthDate.day <= 1 ? maxDay : this.birthDate.day - 1;
        break;
      case 'year':
        const currentYear = new Date().getFullYear();
        this.birthDate.year = this.birthDate.year <= 1920 ? currentYear : this.birthDate.year - 1;
        break;
    }

    this.updateDateEntryDisplay();
  }

  /**
   * Get number of days in a month
   */
  getDaysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
  }

  /**
   * Calculate conception date (birth - 38 weeks = 266 days)
   */
  calculateConceptionDate(birthDate) {
    const birth = new Date(birthDate);
    const conception = new Date(birth);
    conception.setDate(birth.getDate() - 266);
    return conception;
  }

  /**
   * Calculate first heartbeat date (conception + 22 days)
   */
  calculateFirstBeatDate(birthDate) {
    const conception = this.calculateConceptionDate(birthDate);
    const firstBeat = new Date(conception);
    firstBeat.setDate(conception.getDate() + 22);
    return firstBeat;
  }

  /**
   * Calculate total heartbeats from first beat to now
   */
  calculateTotalBeats(firstBeatDate) {
    const now = new Date();
    const daysSinceFirstBeat = Math.floor((now - firstBeatDate) / (1000 * 60 * 60 * 24));

    // Average heart beats per day varies by age
    // Baby/child: ~120 bpm, Teen: ~90 bpm, Adult: ~70 bpm
    // Simplified: use 100,000 beats per day average
    return daysSinceFirstBeat * 100000;
  }

  /**
   * Calculate milestone dates
   */
  calculateMilestones(firstBeatDate) {
    // 1 million beats at ~100,000/day = 10 days
    const millionth = new Date(firstBeatDate);
    millionth.setDate(firstBeatDate.getDate() + 10);

    // 1 billion beats at ~100,000/day = 10,000 days ≈ 27.4 years
    const billionth = new Date(firstBeatDate);
    billionth.setDate(firstBeatDate.getDate() + 10000);

    return {
      millionth,
      billionth
    };
  }

  /**
   * Format date for display
   */
  formatDate(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  /**
   * SCREEN 1: Birth Date Entry
   */
  showBirthEntryScreen() {
    this.currentState = this.STATE.BIRTH_ENTRY;

    this.screen.innerHTML = `
      <div class="date-entry-container screen-fade-in">
        <p class="pixel-text-lg">ENTER BIRTHDATE</p>

        <div class="date-input-row">
          <div class="date-field ${this.currentFieldIndex === 0 ? 'focused' : ''}" id="monthField">
            ${String(this.birthDate.month).padStart(2, '0')}
          </div>
          <span class="date-separator">/</span>
          <div class="date-field ${this.currentFieldIndex === 1 ? 'focused' : ''}" id="dayField">
            ${String(this.birthDate.day).padStart(2, '0')}
          </div>
          <span class="date-separator">/</span>
          <div class="date-field ${this.currentFieldIndex === 2 ? 'focused' : ''}" id="yearField">
            ${this.birthDate.year}
          </div>
        </div>

        <div class="pokemon-textbox">
          <p>◄► SELECT FIELD</p>
          <p>▲▼ CHANGE VALUE</p>
          <p>A TO CONFIRM</p>
        </div>
      </div>
    `;
  }

  /**
   * Update date entry display
   */
  updateDateEntryDisplay() {
    const monthField = document.getElementById('monthField');
    const dayField = document.getElementById('dayField');
    const yearField = document.getElementById('yearField');

    if (!monthField) return;

    monthField.textContent = String(this.birthDate.month).padStart(2, '0');
    monthField.className = `date-field ${this.currentFieldIndex === 0 ? 'focused' : ''}`;

    dayField.textContent = String(this.birthDate.day).padStart(2, '0');
    dayField.className = `date-field ${this.currentFieldIndex === 1 ? 'focused' : ''}`;

    yearField.textContent = this.birthDate.year;
    yearField.className = `date-field ${this.currentFieldIndex === 2 ? 'focused' : ''}`;
  }

  /**
   * Confirm birth date and move to next screen
   */
  confirmBirthDate() {
    // Validate date
    const date = new Date(this.birthDate.year, this.birthDate.month - 1, this.birthDate.day);
    const now = new Date();

    if (date > now) {
      this.playBeep(200, 0.2); // Error sound
      return;
    }

    // Calculate first beat date
    this.firstBeatDate = this.calculateFirstBeatDate(date);

    // Move to first beat screen
    this.showFirstBeatScreen();
  }

  /**
   * SCREEN 2: First Heartbeat
   */
  showFirstBeatScreen() {
    this.currentState = this.STATE.FIRST_BEAT;

    const conceptionDate = this.calculateConceptionDate(
      new Date(this.birthDate.year, this.birthDate.month - 1, this.birthDate.day)
    );

    this.screen.innerHTML = `
      <div class="screen-fade-in" style="display: flex; flex-direction: column; align-items: center; gap: 20px; width: 100%;">
        <p class="pixel-text-lg">YOUR FIRST BEAT</p>

        <div class="pixel-heart"></div>

        <div style="text-align: center;">
          <p class="pixel-text-md">${this.formatDate(this.firstBeatDate)}</p>
          <p class="pixel-text-sm" style="margin-top: 8px;">CONCEPTION + 22 DAYS</p>
          <p class="pixel-text-xs" style="margin-top: 8px;">SIZE: POPPY SEED</p>
        </div>

        <div class="pokemon-textbox">
          <p>YOUR TINY HEART STARTED</p>
          <p>BEATING ${Math.floor((new Date() - this.firstBeatDate) / (1000 * 60 * 60 * 24 * 365))} YEARS AGO...</p>
          <p style="margin-top: 8px;">A TO CONTINUE  B TO BACK</p>
        </div>
      </div>
    `;
  }

  /**
   * SCREEN 3: Live ECG Monitor
   */
  showLiveMonitorScreen() {
    this.currentState = this.STATE.LIVE_MONITOR;

    // Calculate current total beats
    this.currentBeats = this.calculateTotalBeats(this.firstBeatDate);

    this.screen.innerHTML = `
      <div class="screen-fade-in" style="display: flex; flex-direction: column; gap: 15px; width: 100%; height: 100%;">
        <p class="pixel-text-md">LIVE MONITOR</p>

        <div class="ecg-container">
          <svg class="ecg-wave" viewBox="0 0 400 60" preserveAspectRatio="none">
            <polyline class="ecg-line"
              points="0,30 20,30 25,30 28,10 30,50 32,30 37,30 60,30 65,30 68,10 70,50 72,30 77,30 100,30 105,30 108,10 110,50 112,30 117,30 140,30 145,30 148,10 150,50 152,30 157,30 180,30 185,30 188,10 190,50 192,30 197,30 220,30 225,30 228,10 230,50 232,30 237,30 260,30 265,30 268,10 270,50 272,30 277,30 300,30 305,30 308,10 310,50 312,30 317,30 340,30 345,30 348,10 350,50 352,30 357,30 380,30 385,30 388,10 390,50 392,30 397,30 400,30" />
          </svg>
        </div>

        <div class="beat-counter">
          <p class="pixel-text-sm">TOTAL HEARTBEATS</p>
          <p class="counter-value" id="beatCounter">${this.currentBeats.toLocaleString()}</p>
          <p class="pixel-text-xs">CURRENT BPM: ${this.bpm}</p>
        </div>

        <div class="pokemon-textbox">
          <p>YOUR HEART BEATS</p>
          <p>~${this.bpm} TIMES PER MINUTE</p>
          <p style="margin-top: 8px;">A FOR MILESTONES</p>
        </div>
      </div>
    `;

    // Start real-time counter
    this.startBeatCounter();
  }

  /**
   * Start incrementing beat counter in real-time
   */
  startBeatCounter() {
    // Clear any existing interval
    if (this.beatsInterval) {
      clearInterval(this.beatsInterval);
    }

    // Update counter every second (bpm/60 beats per second)
    this.beatsInterval = setInterval(() => {
      const counter = document.getElementById('beatCounter');
      if (counter) {
        this.currentBeats += Math.floor(this.bpm / 60);
        counter.textContent = this.currentBeats.toLocaleString();
      } else {
        clearInterval(this.beatsInterval);
      }
    }, 1000);
  }

  /**
   * SCREEN 4: Milestones
   */
  showMilestonesScreen() {
    this.currentState = this.STATE.MILESTONES;

    // Clear beat counter interval
    if (this.beatsInterval) {
      clearInterval(this.beatsInterval);
    }

    const milestones = this.calculateMilestones(this.firstBeatDate);
    const now = new Date();

    // Determine which milestones have passed
    const passedMillion = now >= milestones.millionth;
    const passedBillion = now >= milestones.billionth;

    this.screen.innerHTML = `
      <div class="screen-fade-in" style="display: flex; flex-direction: column; gap: 12px; width: 100%; overflow-y: auto;">
        <p class="pixel-text-lg">MILESTONES</p>

        <div class="milestone-list">
          <div class="milestone-item">
            <p class="milestone-title">1 MILLIONTH BEAT</p>
            <p class="milestone-date">${this.formatDate(milestones.millionth)}</p>
            <p class="pixel-text-xs" style="margin-top: 4px;">${passedMillion ? '✓ COMPLETED' : 'UPCOMING'}</p>
          </div>

          <div class="milestone-item">
            <p class="milestone-title">1 BILLIONTH BEAT</p>
            <p class="milestone-date">${this.formatDate(milestones.billionth)}</p>
            <p class="pixel-text-xs" style="margin-top: 4px;">${passedBillion ? '✓ COMPLETED' : 'UPCOMING'}</p>
          </div>

          <div class="milestone-item">
            <p class="milestone-title">CURRENT TOTAL</p>
            <p class="milestone-date">${this.currentBeats.toLocaleString()} BEATS</p>
            <p class="pixel-text-xs" style="margin-top: 4px;">AND COUNTING...</p>
          </div>
        </div>

        <div class="pokemon-textbox">
          <p>YOUR HEART HAS BEEN</p>
          <p>WORKING TIRELESSLY</p>
          <p>SINCE ${this.formatDate(this.firstBeatDate)}</p>
          <p style="margin-top: 8px;">B TO GO BACK</p>
        </div>
      </div>
    `;
  }

  /**
   * ===========================================
   * MODE SELECTION AND DAY SIMULATOR METHODS
   * ===========================================
   */

  /**
   * Show mode selection screen
   */
  showModeSelection() {
    this.currentState = this.STATE.MODE_SELECT;
    this.selectedModeIndex = 0;

    this.screen.innerHTML = `
      <div class="mode-selection screen-fade-in">
        <p class="pixel-text-lg" style="margin-bottom: 20px;">SELECT MODE</p>

        <button class="mode-button ${this.selectedModeIndex === 0 ? 'selected' : ''}" data-mode="0">
          HEART'S LIFE STORY
        </button>

        <button class="mode-button ${this.selectedModeIndex === 1 ? 'selected' : ''}" data-mode="1">
          A DAY IN THE LIFE
        </button>

        <div class="pokemon-textbox" style="margin-top: 20px;">
          <p>▲▼ SELECT MODE</p>
          <p>A TO CONFIRM</p>
        </div>
      </div>
    `;
  }

  /**
   * Update mode selection visual
   */
  updateModeSelection() {
    const buttons = document.querySelectorAll('.mode-button');
    buttons.forEach((btn, idx) => {
      if (idx === this.selectedModeIndex) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    });
  }

  /**
   * Confirm mode selection
   */
  confirmModeSelection() {
    if (this.selectedModeIndex === 0) {
      this.gameMode = 'story';
      this.showBirthEntryScreen();
    } else {
      this.gameMode = 'day_sim';
      this.showDaySimIntro();
    }
  }

  /**
   * Show day simulator introduction
   */
  showDaySimIntro() {
    this.currentState = this.STATE.DAY_SIM_INTRO;

    this.screen.innerHTML = `
      <div class="screen-fade-in" style="display: flex; flex-direction: column; gap: 15px; width: 100%;">
        <p class="pixel-text-lg">A DAY IN THE LIFE</p>

        <div class="pixel-heart"></div>

        <div class="pokemon-textbox">
          <p>EXPERIENCE HOW YOUR</p>
          <p>HEART RATE CHANGES</p>
          <p>THROUGHOUT THE DAY!</p>
          <p style="margin-top: 8px;">MAKE CHOICES THAT</p>
          <p>AFFECT YOUR BPM</p>
          <p style="margin-top: 8px;">A TO START  B TO BACK</p>
        </div>
      </div>
    `;
  }

  /**
   * Start day simulator - reset data and show first scene
   */
  startDaySimulator() {
    // Reset day simulator data
    this.daySimData = {
      currentRoom: 'kitchen',
      currentTime: '7:30 AM',
      currentBPM: 65,
      restingBPM: 65,
      statusEffects: [],
      activeEffects: [],
      choices: [],
      character: { x: 4, y: 6 },
      dayEvents: [],
      heartHealthyChoices: 0,
      totalChoices: 0,
      peakBPM: 65
    };

    this.showKitchenBreakfast();
  }

  /**
   * Calculate hours difference between two times
   */
  calculateHoursDiff(startTime, endTime) {
    const timeToMinutes = (time) => {
      const [timePart, period] = time.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);

      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      return hours * 60 + (minutes || 0);
    };

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    return (endMinutes - startMinutes) / 60;
  }

  /**
   * Calculate current BPM based on resting rate and active effects
   */
  calculateCurrentBPM(currentTime) {
    let bpm = this.daySimData.restingBPM;

    this.daySimData.activeEffects.forEach(effect => {
      const hoursPassed = this.calculateHoursDiff(effect.startTime, currentTime);

      // If effect has expired, skip it
      if (hoursPassed >= effect.duration) {
        return;
      }

      // Immediate effects (exercise) don't add to resting state
      if (effect.decayType === 'immediate' && hoursPassed >= 1) {
        return;
      }

      // Calculate remaining effect with linear decay
      let remainingEffect = effect.bpmChange;
      if (effect.decayType === 'linear' && effect.duration > 0) {
        const remainingPercent = 1 - (hoursPassed / effect.duration);
        remainingEffect = effect.bpmChange * Math.max(0, remainingPercent);
      }

      bpm += remainingEffect;
    });

    return Math.round(Math.max(50, Math.min(200, bpm)));
  }

  /**
   * Reset day simulator (for replay)
   */
  resetDaySimulator() {
    this.showModeSelection();
  }

  /**
   * Show kitchen breakfast choice
   */
  showKitchenBreakfast() {
    this.daySimData.currentTime = '7:30 AM';
    this.selectedChoiceIndex = 0;

    // Calculate current BPM based on active effects
    this.daySimData.currentBPM = this.calculateCurrentBPM('7:30 AM');

    this.showChoiceScreen(
      'kitchen',
      '7:30 AM',
      'CHOOSE BREAKFAST',
      [
        { text: 'COFFEE', bpmChange: 20, status: '☕CAFFEINATED', fact: 'Caffeine peaks in 1 hour, lasts 3-5 hours. Moderate use (1-2 cups daily) is safe for most people!', duration: 4, decayType: 'linear', choiceType: 'neutral', icon: '💛' },
        { text: 'WATER', bpmChange: 0, status: '💧HYDRATED', fact: 'EXCELLENT! Staying hydrated supports healthy heart function and is the best morning choice!', duration: 0, decayType: 'immediate', choiceType: 'healthy', icon: '💚' },
        { text: 'ENERGY DRINK', bpmChange: 35, status: '⚡WIRED', fact: 'High caffeine (80-300mg) + sugar spikes HR. Limit to avoid heart palpitations!', duration: 5, decayType: 'linear', choiceType: 'unhealthy', icon: '⚠️' }
      ],
      () => this.showCommute()
    );
  }

  /**
   * Show commute choice
   */
  showCommute() {
    this.daySimData.currentTime = '8:00 AM';
    this.selectedChoiceIndex = 0;

    // Calculate current BPM based on active effects
    this.daySimData.currentBPM = this.calculateCurrentBPM('8:00 AM');

    this.showChoiceScreen(
      'outside',
      '8:00 AM',
      'HOW TO GET TO WORK?',
      [
        { text: 'BIKE', bpmChange: 60, status: '🚴EXERCISING', fact: 'HEART HEALTHY! Cardio raises HR to 120-140 BPM temporarily but STRENGTHENS your heart long-term! Regular cycling reduces heart disease risk.', duration: 1, decayType: 'immediate', choiceType: 'healthy', icon: '💚' },
        { text: 'CAR', bpmChange: 5, status: '🚗COMMUTING', fact: 'Commute stress slightly elevates HR. Try calming music or podcasts to reduce stress during your drive.', duration: 2, decayType: 'linear', choiceType: 'neutral', icon: '💛' },
        { text: 'WALK', bpmChange: 40, status: '🚶WALKING', fact: 'EXCELLENT CHOICE! Walking improves cardiovascular fitness. Regular walkers have 30% lower heart disease risk!', duration: 1, decayType: 'immediate', choiceType: 'healthy', icon: '💚' }
      ],
      () => this.showOffice()
    );
  }

  /**
   * Show office stress choice
   */
  showOffice() {
    this.daySimData.currentTime = '10:00 AM';
    this.selectedChoiceIndex = 0;

    // Calculate current BPM based on active effects
    this.daySimData.currentBPM = this.calculateCurrentBPM('10:00 AM');

    this.showChoiceScreen(
      'office',
      '10:00 AM',
      'BOSS IS ANGRY!',
      [
        { text: 'PANIC', bpmChange: 35, status: '😰STRESSED', fact: 'HARMFUL! Chronic stress keeps HR elevated 30-40 BPM, straining your cardiovascular system over time. Practice stress management!', duration: 3, decayType: 'linear', choiceType: 'unhealthy', icon: '❌' },
        { text: 'BREATHE', bpmChange: -5, status: '🧘CALM', fact: 'BEST CHOICE! Deep breathing activates the vagus nerve, naturally lowering HR and blood pressure. Excellent stress management!', duration: 2, decayType: 'linear', choiceType: 'healthy', icon: '💚' },
        { text: 'ARGUE', bpmChange: 50, status: '😠ANGRY', fact: 'BAD FOR HEART! Anger spikes HR by 40-50 BPM and raises blood pressure. Chronic anger is linked to heart attacks!', duration: 2, decayType: 'linear', choiceType: 'unhealthy', icon: '❌' }
      ],
      () => this.showLunch()
    );
  }

  /**
   * Show lunch choice
   */
  showLunch() {
    this.daySimData.currentTime = '12:00 PM';
    this.selectedChoiceIndex = 0;

    // Calculate current BPM based on active effects
    this.daySimData.currentBPM = this.calculateCurrentBPM('12:00 PM');

    this.showChoiceScreen(
      'office',
      '12:00 PM',
      'LUNCH BREAK',
      [
        { text: 'HEAVY MEAL', bpmChange: 10, status: '🍔DIGESTING', fact: 'Normal response - large meals increase blood flow to digestive system, slightly raising HR 5-10 BPM. Eat mindfully!', duration: 2, decayType: 'linear', choiceType: 'neutral', icon: '💛' },
        { text: 'LIGHT SNACK', bpmChange: 0, status: null, fact: 'SMART CHOICE! Balanced meals maintain stable blood sugar and steady heart rate throughout the day.', duration: 0, decayType: 'immediate', choiceType: 'healthy', icon: '💚' },
        { text: 'SKIP LUNCH', bpmChange: 5, status: '😓HUNGRY', fact: 'Skipping meals drops blood sugar, then stress hormones spike to compensate. Eat regular balanced meals!', duration: 3, decayType: 'linear', choiceType: 'unhealthy', icon: '⚠️' }
      ],
      () => this.showAfternoon()
    );
  }

  /**
   * Show afternoon activity
   */
  showAfternoon() {
    this.daySimData.currentTime = '3:00 PM';
    this.selectedChoiceIndex = 0;

    // Calculate current BPM based on active effects
    this.daySimData.currentBPM = this.calculateCurrentBPM('3:00 PM');

    this.showChoiceScreen(
      'office',
      '3:00 PM',
      'AFTERNOON SLUMP',
      [
        { text: 'MORE COFFEE', bpmChange: 20, status: '☕BUZZING', fact: 'Second coffee = ~300mg caffeine total. Over 400mg/day may cause palpitations and anxiety!', duration: 4, decayType: 'linear', choiceType: 'unhealthy', icon: '⚠️' },
        { text: 'QUICK WALK', bpmChange: 30, status: '🚶ENERGIZED', fact: 'PERFECT! Movement combats afternoon slump. Even 5-10 min boosts energy and heart health!', duration: 1, decayType: 'immediate', choiceType: 'healthy', icon: '💚' },
        { text: 'POWER NAP', bpmChange: -10, status: '😴RESTED', fact: 'GOOD CHOICE! 20-30 min naps lower HR temporarily and improve afternoon performance without disrupting night sleep.', duration: 1, decayType: 'linear', choiceType: 'healthy', icon: '💚' }
      ],
      () => this.showGym()
    );
  }

  /**
   * Show gym choice
   */
  showGym() {
    this.daySimData.currentTime = '6:00 PM';
    this.selectedChoiceIndex = 0;

    // Calculate current BPM based on active effects
    this.daySimData.currentBPM = this.calculateCurrentBPM('6:00 PM');

    this.showChoiceScreen(
      'gym',
      '6:00 PM',
      'AFTER WORK EXERCISE?',
      [
        { text: 'INTENSE WORKOUT', bpmChange: 90, status: '💪TRAINING', fact: 'OUTSTANDING! Target HR zone: 70-85% max (150-180 BPM). Regular cardio LOWERS resting HR by 5-10 BPM! THE BEST thing for heart health!', duration: 1, decayType: 'immediate', choiceType: 'healthy', icon: '💚', permanent: -1 },
        { text: 'YOGA', bpmChange: 15, status: '🧘STRETCHING', fact: 'EXCELLENT! Yoga combines light cardio with stress reduction. Lowers resting HR over time and improves heart rate variability.', duration: 1, decayType: 'immediate', choiceType: 'healthy', icon: '💚' },
        { text: 'GO HOME', bpmChange: 0, status: null, fact: 'Neutral choice. Aim for 150 min/week moderate exercise for optimal heart health and disease prevention.', duration: 0, decayType: 'immediate', choiceType: 'neutral', icon: '💛' }
      ],
      () => this.showEvening()
    );
  }

  /**
   * Show evening wind down
   */
  showEvening() {
    this.daySimData.currentTime = '8:00 PM';
    this.selectedChoiceIndex = 0;

    // Calculate current BPM based on active effects
    this.daySimData.currentBPM = this.calculateCurrentBPM('8:00 PM');

    this.showChoiceScreen(
      'home',
      '8:00 PM',
      'EVENING ROUTINE',
      [
        { text: 'WATCH THRILLER', bpmChange: 15, status: '📺EXCITED', fact: 'Harmless fun! Entertainment temporarily raises HR. Normal response to excitement and suspense.', duration: 2, decayType: 'linear', choiceType: 'neutral', icon: '💛' },
        { text: 'READ BOOK', bpmChange: -5, status: '📖RELAXED', fact: 'RELAXING choice! Quiet activities help lower HR before bed, promoting better sleep quality.', duration: 2, decayType: 'linear', choiceType: 'healthy', icon: '💚' },
        { text: 'MEDITATE', bpmChange: -10, status: '🧘PEACEFUL', fact: 'BEST FOR HEART! Regular meditation LOWERS resting HR and blood pressure long-term. Excellent evening routine!', duration: 2, decayType: 'linear', choiceType: 'healthy', icon: '💚' }
      ],
      () => this.showDaySummary()
    );
  }

  /**
   * Show choice screen with Pokemon-style menu
   */
  showChoiceScreen(room, time, title, choices, onComplete) {
    this.currentState = this.STATE.DAY_SIM_CHOICE;
    this.currentChoices = choices;
    this.onChoiceComplete = onComplete;

    const statusHTML = this.daySimData.statusEffects.length > 0
      ? `<div class="status-effects">${this.daySimData.statusEffects.map(s => `<span class="status-effect">${s}</span>`).join('')}</div>`
      : '';

    this.screen.innerHTML = `
      <div class="room-view screen-fade-in">
        <div class="status-bar">
          <div class="status-bar-content">
            <span class="heart-icon">♥</span>
            <div class="bpm-bar-container">
              <div class="bpm-bar-fill" style="width: ${Math.min(100, (this.daySimData.currentBPM / 180) * 100)}%"></div>
            </div>
            <span class="bpm-value">${Math.round(this.daySimData.currentBPM)} BPM</span>
          </div>
          ${statusHTML}
        </div>

        <div class="time-display">${time}</div>

        <div class="choice-menu">
          <p class="choice-title">${title}</p>
          <div class="choice-options">
            ${choices.map((choice, idx) => `
              <button class="choice-option ${idx === 0 ? 'selected' : ''}" data-index="${idx}">
                ${choice.text}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="pokemon-textbox" style="margin-top: 8px;">
          <p>▲▼ CHOOSE OPTION</p>
          <p>A TO CONFIRM</p>
        </div>
      </div>
    `;
  }

  /**
   * Update choice selection visual
   */
  updateChoiceSelection() {
    const options = document.querySelectorAll('.choice-option');
    options.forEach((opt, idx) => {
      if (idx === this.selectedChoiceIndex) {
        opt.classList.add('selected');
      } else {
        opt.classList.remove('selected');
      }
    });
  }

  /**
   * Confirm choice and apply effects
   */
  confirmChoice() {
    const choice = this.currentChoices[this.selectedChoiceIndex];
    const oldBPM = this.daySimData.currentBPM;

    // Track total choices
    this.daySimData.totalChoices++;

    // Track heart-healthy choices
    if (choice.choiceType === 'healthy') {
      this.daySimData.heartHealthyChoices++;
    }

    // Apply permanent changes (e.g., intense workout lowers resting HR)
    if (choice.permanent) {
      this.daySimData.restingBPM += choice.permanent;
      this.daySimData.restingBPM = Math.max(50, Math.min(100, this.daySimData.restingBPM));
    }

    // Add effect to active effects if it has duration
    if (choice.duration > 0 || choice.decayType === 'immediate') {
      this.daySimData.activeEffects.push({
        name: choice.text,
        bpmChange: choice.bpmChange,
        startTime: this.daySimData.currentTime,
        duration: choice.duration,
        decayType: choice.decayType,
        choiceType: choice.choiceType
      });
    }

    // Calculate new current BPM including this effect
    const tempBPM = oldBPM + choice.bpmChange;
    this.daySimData.currentBPM = Math.max(50, Math.min(200, tempBPM));

    // Track peak BPM
    if (this.daySimData.currentBPM > this.daySimData.peakBPM) {
      this.daySimData.peakBPM = this.daySimData.currentBPM;
    }

    // Update status effects display
    if (choice.status && !this.daySimData.statusEffects.includes(choice.status)) {
      // Replace status effects
      this.daySimData.statusEffects = [choice.status];
    } else if (!choice.status) {
      // Clear status if none
      this.daySimData.statusEffects = [];
    }

    // Record the choice
    this.daySimData.dayEvents.push({
      time: this.daySimData.currentTime,
      choice: choice.text,
      bpmChange: choice.bpmChange,
      fact: choice.fact,
      choiceType: choice.choiceType
    });

    // Show effect
    this.showChoiceResult(choice, oldBPM);
  }

  /**
   * Show choice result with medical fact
   */
  showChoiceResult(choice, oldBPM) {
    const changeText = choice.bpmChange > 0 ? `+${choice.bpmChange}` : (choice.bpmChange === 0 ? '±0' : choice.bpmChange);
    const newBPM = this.daySimData.currentBPM;

    // Determine indicator text based on choice type
    let indicatorText = '';
    let indicatorColor = 'var(--gb-light)';

    if (choice.choiceType === 'healthy') {
      indicatorText = `${choice.icon} HEART HEALTHY!`;
      indicatorColor = 'var(--gb-lightest)';
    } else if (choice.choiceType === 'unhealthy') {
      indicatorText = `${choice.icon} CAUTION!`;
      indicatorColor = 'var(--gb-dark)';
    } else {
      indicatorText = `${choice.icon} NORMAL ACTIVITY`;
      indicatorColor = 'var(--gb-light)';
    }

    // Show context for exercise vs stress
    let context = '';
    if (choice.decayType === 'immediate' && choice.bpmChange > 0) {
      context = '<p class="pixel-text-xs" style="margin-top: 8px;">HR will return to resting within 1 hour</p>';
    } else if (choice.duration > 0) {
      context = `<p class="pixel-text-xs" style="margin-top: 8px;">Effect lasts ~${choice.duration} hour${choice.duration > 1 ? 's' : ''}</p>`;
    }

    this.screen.innerHTML = `
      <div class="screen-fade-in" style="display: flex; flex-direction: column; gap: 15px; width: 100%;">
        <p class="pixel-text-md">CHOICE: ${choice.text}</p>

        <div style="text-align: center;">
          <p class="pixel-text-md" style="color: ${indicatorColor};">
            ${indicatorText}
          </p>
          <p class="pixel-text-lg" style="margin-top: 8px; color: ${choice.choiceType === 'healthy' ? 'var(--gb-lightest)' : (choice.choiceType === 'unhealthy' ? 'var(--gb-dark)' : 'var(--gb-light)')};">
            ${changeText} BPM ${choice.decayType === 'immediate' && choice.bpmChange > 0 ? '(DURING)' : ''}
          </p>
          <p class="pixel-text-sm" style="margin-top: 4px;">
            ${oldBPM} → ${Math.round(newBPM)} BPM
          </p>
          ${context}
        </div>

        <div class="pokemon-textbox">
          <p>${choice.fact}</p>
          <p style="margin-top: 8px;">A TO CONTINUE</p>
        </div>
      </div>
    `;

    // Override A button to continue to next scene
    const originalHandleA = this.handleA.bind(this);
    this.handleA = () => {
      this.playBeep(800, 0.1);
      this.handleA = originalHandleA; // Restore original
      if (this.onChoiceComplete) {
        this.onChoiceComplete();
      }
    };
  }

  /**
   * Show day summary screen
   */
  showDaySummary() {
    this.currentState = this.STATE.DAY_SIM_SUMMARY;

    // Calculate final BPM at end of day (should be back to resting)
    const finalBPM = this.calculateCurrentBPM('10:00 PM');

    // Calculate grade based on healthy choices
    const grade = this.calculateGrade();
    const totalBeats = this.calculateDayBeats();
    const tips = this.getHealthTips();

    const startingResting = 65; // Starting resting BPM
    const endingResting = this.daySimData.restingBPM;
    const healthyChoices = this.daySimData.heartHealthyChoices;
    const totalChoices = this.daySimData.totalChoices;
    const peakBPM = this.daySimData.peakBPM;

    // Check if peak was from exercise (good) or stress (bad)
    const peakWasExercise = this.daySimData.dayEvents.some(e =>
      e.choiceType === 'healthy' && (e.choice.includes('BIKE') || e.choice.includes('WALK') || e.choice.includes('WORKOUT'))
    );

    this.screen.innerHTML = `
      <div class="summary-screen screen-fade-in">
        <p class="pixel-text-lg">DAY COMPLETE!</p>

        <div class="grade-display">
          <p class="pixel-text-sm">HEART HEALTH GRADE</p>
          <p class="grade-letter">${grade}</p>
          <p class="pixel-text-xs" style="margin-top: 4px;">${healthyChoices}/${totalChoices} HEALTHY CHOICES</p>
        </div>

        <div class="summary-stats">
          <div class="summary-stat">
            <p>RESTING HEART RATE</p>
            <p style="margin-top: 4px;">${startingResting} → ${endingResting} BPM</p>
            ${endingResting < startingResting ? '<p class="pixel-text-xs" style="margin-top: 2px;">💚 IMPROVED!</p>' : ''}
          </div>
          <div class="summary-stat">
            <p>PEAK BPM</p>
            <p style="margin-top: 4px;">${peakBPM} BPM</p>
            ${peakWasExercise ? '<p class="pixel-text-xs" style="margin-top: 2px;">💚 DURING EXERCISE (GOOD!)</p>' : '<p class="pixel-text-xs" style="margin-top: 2px;">⚠️ FROM STRESS</p>'}
          </div>
          <div class="summary-stat">
            <p>TOTAL BEATS TODAY</p>
            <p style="margin-top: 4px;">${totalBeats.toLocaleString()}</p>
          </div>
        </div>

        <div class="health-tips">
          <p style="font-weight: bold; margin-bottom: 6px;">HEALTH TIPS:</p>
          ${tips.map(tip => `<p>• ${tip}</p>`).join('')}
        </div>

        <div class="pokemon-textbox">
          <p>A TO REPLAY</p>
          <p>B TO MAIN MENU</p>
        </div>
      </div>
    `;
  }

  /**
   * Calculate total beats in a day
   */
  calculateDayBeats() {
    // Average 100,000 beats per day (rough estimate)
    return 100000;
  }

  /**
   * Calculate grade based on heart-healthy choices
   */
  calculateGrade() {
    const healthyPercent = (this.daySimData.heartHealthyChoices / this.daySimData.totalChoices) * 100;

    if (healthyPercent >= 75) return 'A';
    if (healthyPercent >= 60) return 'B';
    if (healthyPercent >= 45) return 'C';
    if (healthyPercent >= 30) return 'D';
    return 'F';
  }

  /**
   * Get health tips based on choices
   */
  getHealthTips() {
    const tips = [];
    const events = this.daySimData.dayEvents;

    // Check for exercise
    const exercised = events.some(e => e.choiceType === 'healthy' &&
      (e.choice.includes('BIKE') || e.choice.includes('WALK') || e.choice.includes('WORKOUT') || e.choice.includes('YOGA')));

    if (exercised) {
      tips.push('Great job exercising! Regular activity strengthens your heart and lowers resting HR over time.');
    } else {
      tips.push('Aim for 150 min/week moderate exercise for optimal heart health.');
    }

    // Check for stress management
    const managedStress = events.some(e => e.choice === 'BREATHE' || e.choice === 'MEDITATE');
    const hadStress = events.some(e => e.choice === 'PANIC' || e.choice === 'ARGUE');

    if (hadStress && !managedStress) {
      tips.push('Try stress management techniques - chronic stress damages heart health.');
    } else if (managedStress) {
      tips.push('Excellent stress management! Deep breathing and meditation are powerful for heart health.');
    }

    // Check caffeine
    const caffeine = events.filter(e => e.choice.includes('COFFEE')).length;
    if (caffeine >= 2) {
      tips.push('Limit caffeine to 1-2 cups daily. Too much can cause heart palpitations.');
    }

    // Overall assessment
    const healthyPercent = (this.daySimData.heartHealthyChoices / this.daySimData.totalChoices) * 100;
    if (healthyPercent >= 75) {
      tips.push('Outstanding! Your choices promote cardiovascular health and reduce disease risk!');
    } else if (healthyPercent >= 50) {
      tips.push('Good choices overall! Keep prioritizing heart-healthy decisions.');
    }

    return tips.slice(0, 3); // Return max 3 tips
  }

  /**
   * Move character (placeholder for future room exploration)
   */
  moveCharacter(dx, dy) {
    // This would be used if we add free movement in rooms
    // For now, just play a beep
    this.playBeep(500, 0.05);
  }

  /**
   * Scroll the summary screen
   */
  scrollSummary(amount) {
    const summaryContainer = document.querySelector('.summary-screen');
    if (summaryContainer) {
      summaryContainer.scrollBy({
        top: amount,
        behavior: 'smooth'
      });
    }
  }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const game = new HeartStoryGame();
  game.init();
});
