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
      DAY_SIM_SUMMARY: 'day_sim_summary',
      // Educational pages (part of life story)
      HUMAN_HR_COMPARE: 'human_hr_compare',
      CONDITIONS_INTRO: 'conditions_intro',
      CONDITION_1: 'condition_1',
      CONDITION_2: 'condition_2',
      CONDITION_3: 'condition_3',
      ANIMAL_INTRO: 'animal_intro',
      ANIMAL_FINAL: 'animal_final',
    };

    this.currentState = this.STATE.MODE_SELECT;
    this.gameMode = null; // 'story' or 'day_sim'

    // Date entry fields
    this.dateFields = ['month', 'day', 'year'];
    this.currentFieldIndex = 0;
    this.birthDate = {
      month: 1,
      day: 1,
      year: 2000,
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
      peakBPM: 65,
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
      // console.log('Web Audio API not supported');
    }
  }

  /**
   * Play a beep sound
   */
  playBeep(frequency = 440, duration = 0.1) {
    if (!this.audioContext) {
      return;
    }

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
      switch (e.key) {
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

    switch (this.currentState) {
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
      case this.STATE.DAY_SIM_SUMMARY:
        this.scrollSummary(-50);
        break;
      case this.STATE.HUMAN_HR_COMPARE:
      case this.STATE.CONDITIONS_INTRO:
      case this.STATE.CONDITION_1:
      case this.STATE.CONDITION_2:
      case this.STATE.CONDITION_3:
      case this.STATE.ANIMAL_INTRO:
      case this.STATE.ANIMAL_FINAL:
        this.scrollEducationalPage(-50);
        break;
    }
  }

  handleDown() {
    this.playBeep(600, 0.05);

    switch (this.currentState) {
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
      case this.STATE.DAY_SIM_SUMMARY:
        this.scrollSummary(50);
        break;
      case this.STATE.HUMAN_HR_COMPARE:
      case this.STATE.CONDITIONS_INTRO:
      case this.STATE.CONDITION_1:
      case this.STATE.CONDITION_2:
      case this.STATE.CONDITION_3:
      case this.STATE.ANIMAL_INTRO:
      case this.STATE.ANIMAL_FINAL:
        this.scrollEducationalPage(50);
        break;
    }
  }

  handleLeft() {
    this.playBeep(500, 0.05);

    switch (this.currentState) {
      case this.STATE.BIRTH_ENTRY:
        this.currentFieldIndex = Math.max(0, this.currentFieldIndex - 1);
        this.updateDateEntryDisplay();
        break;
    }
  }

  handleRight() {
    this.playBeep(500, 0.05);

    switch (this.currentState) {
      case this.STATE.BIRTH_ENTRY:
        this.currentFieldIndex = Math.min(2, this.currentFieldIndex + 1);
        this.updateDateEntryDisplay();
        break;
    }
  }

  handleA() {
    this.playBeep(800, 0.1);

    switch (this.currentState) {
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
        this.showHumanHRComparison();
        break;
      case this.STATE.HUMAN_HR_COMPARE:
        this.showConditionsIntro();
        break;
      case this.STATE.CONDITIONS_INTRO:
        this.showCondition1();
        break;
      case this.STATE.CONDITION_1:
        this.showCondition2();
        break;
      case this.STATE.CONDITION_2:
        this.showCondition3();
        break;
      case this.STATE.CONDITION_3:
        this.showAnimalIntro();
        break;
      case this.STATE.ANIMAL_INTRO:
        this.showAnimalFinal();
        break;
      case this.STATE.ANIMAL_FINAL:
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
    switch (this.currentState) {
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
      case this.STATE.HUMAN_HR_COMPARE:
        this.showMilestonesScreen();
        break;
      case this.STATE.CONDITIONS_INTRO:
        this.showHumanHRComparison();
        break;
      case this.STATE.CONDITION_1:
        this.showConditionsIntro();
        break;
      case this.STATE.CONDITION_2:
        this.showCondition1();
        break;
      case this.STATE.CONDITION_3:
        this.showCondition2();
        break;
      case this.STATE.ANIMAL_INTRO:
        this.showCondition3();
        break;
      case this.STATE.ANIMAL_FINAL:
        this.showAnimalIntro();
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

    switch (field) {
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

    switch (field) {
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
   * Convert birthDate object {month, day, year} to Date object
   */
  getBirthDateAsDate() {
    if (!this.birthDate) {
      return null;
    }
    // birthDate is stored as {month, day, year}
    return new Date(this.birthDate.year, this.birthDate.month - 1, this.birthDate.day);
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
   * Calculate total heartbeats from first beat to now (age-based)
   */
  calculateTotalBeats(firstBeatDate) {
    const now = new Date();
    const birthDate = this.getBirthDateAsDate(); // Convert {month,day,year} to Date object

    if (!birthDate) {
      console.error('BirthDate not set');
      return 0;
    }

    // Age stages with appropriate BPM
    const stages = [
      { minAge: -0.73, maxAge: 0, avgBPM: 140, label: 'FETAL' }, // Fetal period (conception to birth)
      { minAge: 0, maxAge: 1, avgBPM: 120, label: 'INFANT' }, // 0-1 years
      { minAge: 1, maxAge: 5, avgBPM: 100, label: 'TODDLER' }, // 1-5 years
      { minAge: 5, maxAge: 12, avgBPM: 85, label: 'CHILD' }, // 5-12 years
      { minAge: 12, maxAge: 18, avgBPM: 75, label: 'TEEN' }, // 12-18 years
      { minAge: 18, maxAge: 65, avgBPM: 70, label: 'ADULT' }, // 18-65 years
      { minAge: 65, maxAge: 120, avgBPM: 72, label: 'SENIOR' }, // 65+ years
    ];

    let totalBeats = 0;
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysPerYear = 365.25;

    // Calculate beats for each life stage
    for (const stage of stages) {
      // Calculate age boundaries in milliseconds from birth
      const stageStartMs = birthDate.getTime() + stage.minAge * daysPerYear * msPerDay;
      const stageEndMs = birthDate.getTime() + stage.maxAge * daysPerYear * msPerDay;

      // Find overlap between this stage and the person's actual lifetime
      const actualStartMs = Math.max(firstBeatDate.getTime(), stageStartMs);
      const actualEndMs = Math.min(now.getTime(), stageEndMs);

      // If there's overlap, calculate beats for this period
      if (actualStartMs < actualEndMs) {
        const daysInPeriod = (actualEndMs - actualStartMs) / msPerDay;
        const beatsPerDay = stage.avgBPM * 60 * 24; // BPM * 60 min * 24 hours
        totalBeats += daysInPeriod * beatsPerDay;
      }
    }

    return Math.floor(totalBeats);
  }

  /**
   * Calculate max heart rate using age-based formula
   */
  calculateMaxHR(birthDate) {
    const now = new Date();
    const ageInYears = Math.floor((now - birthDate) / (1000 * 60 * 60 * 24 * 365.25));
    return 220 - ageInYears;
  }

  /**
   * Calculate exercise intensity zone based on current BPM and max HR
   */
  getExerciseIntensity(currentBPM, maxHR) {
    const percentMax = (currentBPM / maxHR) * 100;

    if (percentMax < 50) {
      return { zone: 'VERY LIGHT', range: '<50%', description: 'Warm-up intensity' };
    } else if (percentMax < 60) {
      return { zone: 'LIGHT', range: '50-60%', description: 'Easy pace, fat burning' };
    } else if (percentMax < 70) {
      return { zone: 'MODERATE', range: '60-70%', description: 'Aerobic training zone' };
    } else if (percentMax < 80) {
      return { zone: 'VIGOROUS', range: '70-80%', description: 'Cardio fitness zone' };
    } else if (percentMax < 90) {
      return { zone: 'HARD', range: '80-90%', description: 'Anaerobic threshold' };
    } else {
      return { zone: 'MAXIMUM', range: '90-100%', description: 'Peak performance' };
    }
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
      billionth,
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

    if (!monthField) {
      return;
    }

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
          <p class="pixel-text-xs" style="margin-top: 8px;">SIZE: SESAME SEED</p>
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
   * Show human heart rate comparison screen
   */
  showHumanHRComparison() {
    this.currentState = this.STATE.HUMAN_HR_COMPARE;

    const individuals = [
      {
        name: 'HEALTHY ATHLETE',
        bpm: '~50 BPM',
        emoji: '💪',
        explanation: 'Regular training strengthens heart efficiency',
      },
      {
        name: 'AVERAGE ADULT',
        bpm: '~70 BPM',
        emoji: '❤️',
        explanation: 'Normal resting heart rate for most people',
      },
      {
        name: 'HIGH-STRUNG/ANXIOUS',
        bpm: '~85 BPM',
        emoji: '😰',
        explanation: 'Stress hormones increase heart rate',
      },
      {
        name: 'HEART FAILURE',
        bpm: '~100+ BPM',
        emoji: '🚨',
        explanation: 'Weakened heart works harder to pump blood',
      },
    ];

    const individualsHTML = individuals
      .map(
        (person) => `
      <div style="
        background: rgba(155, 188, 15, 0.2);
        border: 2px solid var(--gb-light);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 12px;
        text-align: center;
      ">
        <div style="font-size: 24px; margin-bottom: 8px;">${person.emoji}</div>
        <p class="pixel-text" style="font-weight: bold; margin-bottom: 4px;">${person.name}</p>
        <p class="pixel-text" style="color: #e60012; margin-bottom: 8px;">${person.bpm}</p>
        <p class="pixel-text-xs" style="color: var(--gb-light); margin: 0; line-height: 1.4;">
          ${person.explanation}
        </p>
      </div>
    `
      )
      .join('');

    this.screen.innerHTML = `
      <div class="educational-page screen-fade-in" style="
        display: flex;
        flex-direction: column;
        gap: 15px;
        width: 100%;
        max-height: 100%;
        overflow-y: auto;
      ">
        <p class="pixel-text-lg" style="text-align: center;">HUMAN HEART RATES</p>

        <div class="pokemon-textbox" style="margin-bottom: 10px;">
          <p class="pixel-text-xs">RESTING HEART RATE VARIES</p>
          <p class="pixel-text-xs">BY FITNESS & HEALTH STATUS</p>
        </div>

        ${individualsHTML}

        <div class="pokemon-textbox" style="margin-top: auto;">
          <p class="pixel-text-xs">▲▼ SCROLL  A TO NEXT  B TO BACK</p>
        </div>
      </div>
    `;
  }

  /**
   * Show common heart conditions intro page
   */
  showConditionsIntro() {
    this.currentState = this.STATE.CONDITIONS_INTRO;

    this.screen.innerHTML = `
      <div class="educational-page screen-fade-in" style="
        display: flex;
        flex-direction: column;
        gap: 15px;
        width: 100%;
        max-height: 100%;
        overflow-y: auto;
      ">
        <p class="pixel-text-lg" style="text-align: center;">💔 HEART CONDITIONS</p>

        <div class="pokemon-textbox" style="margin-bottom: 10px;">
          <p class="pixel-text-sm">Heart disease is the</p>
          <p class="pixel-text-sm">#1 cause of death globally</p>
        </div>

        <div style="background: rgba(155, 188, 15, 0.3); border: 2px solid var(--gb-light); border-radius: 8px; padding: 12px; margin-bottom: 12px;">
          <p class="pixel-text-sm" style="line-height: 1.6; text-align: left;">
            <strong>📊 KEY STATISTICS:</strong><br><br>
            • 1 in 4 deaths in the US from heart disease<br><br>
            • Affects 18+ million Americans<br><br>
            • Many conditions are preventable with healthy lifestyle choices
          </p>
        </div>

        <div class="pokemon-textbox">
          <p class="pixel-text-sm">LET'S EXPLORE 3</p>
          <p class="pixel-text-sm">COMMON CONDITIONS...</p>
        </div>

        <div class="pokemon-textbox" style="margin-top: auto;">
          <p class="pixel-text-xs">A TO CONTINUE  B TO GO BACK</p>
          <p class="pixel-text-xs">▲▼ SCROLL</p>
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
    } else if (this.selectedModeIndex === 1) {
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
    // Calculate max HR (assume age 30 for standalone day simulator, or use actual age if available)
    const birthDateObj = this.getBirthDateAsDate();
    const age = birthDateObj
      ? Math.floor((new Date() - birthDateObj) / (1000 * 60 * 60 * 24 * 365.25))
      : 30; // Default to 30 years old if no birthdate
    const maxHR = 220 - age;

    // Reset day simulator data
    this.daySimData = {
      currentRoom: 'kitchen',
      currentTime: '7:30 AM',
      currentBPM: 65,
      restingBPM: 65,
      maxHR: maxHR,
      age: age,
      statusEffects: [],
      activeEffects: [],
      choices: [],
      character: { x: 4, y: 6 },
      dayEvents: [],
      heartHealthyChoices: 0,
      totalChoices: 0,
      peakBPM: 65,
    };

    this.showBreakfastChoice();
  }

  /**
   * Calculate the difference in hours between two time strings
   * Handles AM/PM conversion and properly processes times like "7:30 AM" or "3:00 PM"
   *
   * @param {string} startTime - Start time in format "H:MM AM/PM" (e.g., "7:30 AM")
   * @param {string} endTime - End time in format "H:MM AM/PM" (e.g., "3:00 PM")
   * @returns {number} Number of hours between startTime and endTime (can be decimal)
   *
   * @example
   * calculateHoursDiff('7:30 AM', '8:00 AM') // returns 0.5
   * calculateHoursDiff('10:00 AM', '3:00 PM') // returns 5
   */
  calculateHoursDiff(startTime, endTime) {
    const timeToMinutes = (time) => {
      const [timePart, period] = time.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);

      if (period === 'PM' && hours !== 12) {
        hours += 12;
      }
      if (period === 'AM' && hours === 12) {
        hours = 0;
      }

      return hours * 60 + (minutes || 0);
    };

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    return (endMinutes - startMinutes) / 60;
  }

  /**
   * Calculate current heart rate (BPM) based on resting rate and active effects with time-based decay
   *
   * This function implements realistic bioavailability:
   * - Immediate effects (exercise): Full effect for 1 hour, then expire
   * - Linear effects (caffeine, stress): Decay proportionally over duration (e.g., caffeine's 3-5 hour half-life)
   * - Effects that exceed their duration are automatically filtered out
   *
   * @param {string} currentTime - Current time in format "H:MM AM/PM" (e.g., "3:00 PM")
   * @returns {number} Calculated BPM (clamped between 50-200), rounded to nearest integer
   *
   * @example
   * // Coffee consumed at 7:30 AM (+20 BPM, 4-hour linear decay)
   * // At 9:30 AM (2 hours later), effect is 50% decayed = +10 BPM
   * calculateCurrentBPM('9:30 AM') // returns 75 (65 resting + 10 remaining caffeine effect)
   */
  calculateCurrentBPM(currentTime) {
    let bpm = this.daySimData.restingBPM;

    this.daySimData.activeEffects.forEach((effect) => {
      const hoursPassed = this.calculateHoursDiff(effect.startTime, currentTime);

      // If effect has expired, skip it
      if (hoursPassed >= effect.duration) {
        return;
      }

      // Immediate effects (exercise) don't add to resting state
      if (effect.decayType === 'immediate' && hoursPassed >= 1) {
        return;
      }

      // Calculate remaining effect based on decay type
      let remainingEffect = effect.bpmChange;

      if (effect.decayType === 'linear' && effect.duration > 0) {
        // Linear decay: effect decreases proportionally over time
        const remainingPercent = 1 - hoursPassed / effect.duration;
        remainingEffect = effect.bpmChange * Math.max(0, remainingPercent);
      } else if (effect.decayType === 'exponential' && effect.duration > 0) {
        // Exponential decay: models first-order kinetics (e.g., caffeine half-life)
        // Using half-life formula: N(t) = N0 * e^(-kt) where k = ln(2) / half-life
        const halfLife = effect.duration; // Duration represents half-life for exponential
        const decayConstant = Math.log(2) / halfLife;
        remainingEffect = effect.bpmChange * Math.exp(-decayConstant * hoursPassed);
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
   * Show breakfast choice
   */
  showBreakfastChoice() {
    this.daySimData.currentTime = '7:30 AM';
    this.selectedChoiceIndex = 0;

    this.showChoiceScreen(
      'kitchen',
      '7:30 AM',
      'CHOOSE BREAKFAST',
      [
        {
          text: 'COFFEE',
          bpmChange: 20,
          status: '☕CAFFEINATED',
          fact: 'Caffeine peaks in 1 hour, half-life 4 hours. Decays exponentially! Moderate use (1-2 cups daily) is safe for most people!',
          duration: 4,
          decayType: 'exponential',
          choiceType: 'neutral',
          icon: '💛',
        },
        {
          text: 'WATER',
          bpmChange: 0,
          status: '💧HYDRATED',
          fact: 'EXCELLENT! Staying hydrated supports healthy heart function and is the best morning choice!',
          duration: 0,
          decayType: 'immediate',
          choiceType: 'healthy',
          icon: '💚',
        },
        {
          text: 'ENERGY DRINK',
          bpmChange: 35,
          status: '⚡WIRED',
          fact: 'High caffeine (80-300mg) + sugar spikes HR. Half-life ~5hrs. Limit to avoid heart palpitations!',
          duration: 5,
          decayType: 'exponential',
          choiceType: 'unhealthy',
          icon: '⚠️',
        },
      ],
      () => this.showCommuteChoice()
    );
  }

  /**
   * Show commute choice
   */
  showCommuteChoice() {
    this.daySimData.currentTime = '8:00 AM';
    this.selectedChoiceIndex = 0;

    this.showChoiceScreen(
      'outside',
      '8:00 AM',
      'HOW TO GET TO WORK?',
      [
        {
          text: 'BIKE',
          bpmChange: 60,
          status: '🚴EXERCISING',
          fact: 'HEART HEALTHY! Cardio raises HR to 120-140 BPM temporarily but STRENGTHENS your heart long-term! Regular cycling reduces heart disease risk.',
          duration: 1,
          decayType: 'immediate',
          choiceType: 'healthy',
          icon: '💚',
        },
        {
          text: 'CAR',
          bpmChange: 5,
          status: '🚗COMMUTING',
          fact: 'Commute stress slightly elevates HR. Try calming music or podcasts to reduce stress during your drive.',
          duration: 2,
          decayType: 'linear',
          choiceType: 'neutral',
          icon: '💛',
        },
        {
          text: 'WALK',
          bpmChange: 40,
          status: '🚶WALKING',
          fact: 'EXCELLENT CHOICE! Walking improves cardiovascular fitness. Regular walkers have 30% lower heart disease risk!',
          duration: 1,
          decayType: 'immediate',
          choiceType: 'healthy',
          icon: '💚',
        },
      ],
      () => this.showOfficeStressChoice()
    );
  }

  /**
   * Show office stress choice
   */
  showOfficeStressChoice() {
    this.daySimData.currentTime = '10:00 AM';
    this.selectedChoiceIndex = 0;

    this.showChoiceScreen(
      'office',
      '10:00 AM',
      'BOSS IS ANGRY!',
      [
        {
          text: 'PANIC',
          bpmChange: 35,
          status: '😰STRESSED',
          fact: 'HARMFUL! Chronic stress keeps HR elevated 30-40 BPM, straining your cardiovascular system over time. Practice stress management!',
          duration: 3,
          decayType: 'linear',
          choiceType: 'unhealthy',
          icon: '❌',
        },
        {
          text: 'BREATHE',
          bpmChange: -5,
          status: '🧘CALM',
          fact: 'BEST CHOICE! Deep breathing activates the vagus nerve, naturally lowering HR and blood pressure. Excellent stress management!',
          duration: 2,
          decayType: 'linear',
          choiceType: 'healthy',
          icon: '💚',
        },
        {
          text: 'ARGUE',
          bpmChange: 50,
          status: '😠ANGRY',
          fact: 'BAD FOR HEART! Anger spikes HR by 40-50 BPM and raises blood pressure. Chronic anger is linked to heart attacks!',
          duration: 2,
          decayType: 'linear',
          choiceType: 'unhealthy',
          icon: '❌',
        },
      ],
      () => this.showLunchChoice()
    );
  }

  /**
   * Show lunch choice
   */
  showLunchChoice() {
    this.daySimData.currentTime = '12:00 PM';
    this.selectedChoiceIndex = 0;

    this.showChoiceScreen(
      'office',
      '12:00 PM',
      'LUNCH BREAK',
      [
        {
          text: 'HEAVY MEAL',
          bpmChange: 10,
          status: '🍔DIGESTING',
          fact: 'Normal response - large meals increase blood flow to digestive system, slightly raising HR 5-10 BPM. Eat mindfully!',
          duration: 2,
          decayType: 'linear',
          choiceType: 'neutral',
          icon: '💛',
        },
        {
          text: 'LIGHT SNACK',
          bpmChange: 0,
          status: '',
          fact: 'SMART CHOICE! Balanced meals maintain stable blood sugar and steady heart rate throughout the day.',
          duration: 0,
          decayType: 'immediate',
          choiceType: 'healthy',
          icon: '💚',
        },
        {
          text: 'SKIP LUNCH',
          bpmChange: 5,
          status: '😓HUNGRY',
          fact: 'Skipping meals drops blood sugar, then stress hormones spike to compensate. Eat regular balanced meals!',
          duration: 3,
          decayType: 'linear',
          choiceType: 'unhealthy',
          icon: '⚠️',
        },
      ],
      () => this.showAfternoonSlumpChoice()
    );
  }

  /**
   * Show afternoon activity
   */
  showAfternoonSlumpChoice() {
    this.daySimData.currentTime = '3:00 PM';
    this.selectedChoiceIndex = 0;

    this.showChoiceScreen(
      'office',
      '3:00 PM',
      'AFTERNOON SLUMP',
      [
        {
          text: 'MORE COFFEE',
          bpmChange: 20,
          status: '☕BUZZING',
          fact: 'Second coffee = ~300mg caffeine total. Effects compound! Over 400mg/day may cause palpitations and anxiety!',
          duration: 4,
          decayType: 'exponential',
          choiceType: 'unhealthy',
          icon: '⚠️',
        },
        {
          text: 'QUICK WALK',
          bpmChange: 30,
          status: '🚶ENERGIZED',
          fact: 'PERFECT! Movement combats afternoon slump. Even 5-10 min boosts energy and heart health!',
          duration: 1,
          decayType: 'immediate',
          choiceType: 'healthy',
          icon: '💚',
        },
        {
          text: 'POWER NAP',
          bpmChange: -10,
          status: '😴RESTED',
          fact: 'GOOD CHOICE! 20-30 min naps lower HR temporarily and improve afternoon performance without disrupting night sleep.',
          duration: 1,
          decayType: 'linear',
          choiceType: 'healthy',
          icon: '💚',
        },
      ],
      () => this.showExerciseChoice()
    );
  }

  /**
   * Show gym choice
   */
  showExerciseChoice() {
    this.daySimData.currentTime = '6:00 PM';
    this.selectedChoiceIndex = 0;

    this.showChoiceScreen(
      'gym',
      '6:00 PM',
      'AFTER WORK EXERCISE?',
      [
        {
          text: 'INTENSE WORKOUT',
          bpmChange: 90,
          status: '💪TRAINING',
          fact: 'OUTSTANDING! Target HR zone: 70-85% max (150-180 BPM). Regular cardio LOWERS resting HR by 5-10 BPM! THE BEST thing for heart health!',
          duration: 1,
          decayType: 'immediate',
          choiceType: 'healthy',
          icon: '💚',
          permanent: -1,
        },
        {
          text: 'YOGA',
          bpmChange: 15,
          status: '🧘STRETCHING',
          fact: 'EXCELLENT! Yoga combines light cardio with stress reduction. Lowers resting HR over time and improves heart rate variability.',
          duration: 1,
          decayType: 'immediate',
          choiceType: 'healthy',
          icon: '💚',
        },
        {
          text: 'GO HOME',
          bpmChange: 0,
          status: '',
          fact: 'Neutral choice. Aim for 150 min/week moderate exercise for optimal heart health and disease prevention.',
          duration: 0,
          decayType: 'immediate',
          choiceType: 'neutral',
          icon: '💛',
        },
      ],
      () => this.showEveningChoice()
    );
  }

  /**
   * Show evening wind down
   */
  showEveningChoice() {
    this.daySimData.currentTime = '8:00 PM';
    this.selectedChoiceIndex = 0;

    this.showChoiceScreen(
      'home',
      '8:00 PM',
      'EVENING ROUTINE',
      [
        {
          text: 'WATCH THRILLER',
          bpmChange: 15,
          status: '📺EXCITED',
          fact: 'Harmless fun! Entertainment temporarily raises HR. Normal response to excitement and suspense.',
          duration: 2,
          decayType: 'linear',
          choiceType: 'neutral',
          icon: '💛',
        },
        {
          text: 'READ BOOK',
          bpmChange: -5,
          status: '📖RELAXED',
          fact: 'RELAXING choice! Quiet activities help lower HR before bed, promoting better sleep quality.',
          duration: 2,
          decayType: 'linear',
          choiceType: 'healthy',
          icon: '💚',
        },
        {
          text: 'MEDITATE',
          bpmChange: -10,
          status: '🧘PEACEFUL',
          fact: 'BEST FOR HEART! Regular meditation LOWERS resting HR and blood pressure long-term. Excellent evening routine!',
          duration: 2,
          decayType: 'linear',
          choiceType: 'healthy',
          icon: '💚',
        },
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

    const statusHTML =
      this.daySimData.statusEffects.length > 0
        ? `<div class="status-effects">${this.daySimData.statusEffects.map((s) => `<span class="status-effect">${s}</span>`).join('')}</div>`
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
            ${choices
              .map(
                (choice, idx) => `
              <button class="choice-option ${idx === 0 ? 'selected' : ''}" data-index="${idx}">
                ${choice.text}
              </button>
            `
              )
              .join('')}
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

    // Recalculate current BPM accounting for decay/expiration before applying new effect
    const oldBPM = this.calculateCurrentBPM(this.daySimData.currentTime);
    this.daySimData.currentBPM = oldBPM;

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
        choiceType: choice.choiceType,
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
      choiceType: choice.choiceType,
    });

    // Show effect
    this.showChoiceResult(choice, oldBPM);
  }

  /**
   * Show choice result with medical fact
   */
  showChoiceResult(choice, oldBPM) {
    const changeText =
      choice.bpmChange > 0
        ? `+${choice.bpmChange}`
        : choice.bpmChange === 0
          ? '±0'
          : choice.bpmChange;
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
      context =
        '<p class="pixel-text-xs" style="margin-top: 8px;">HR will return to resting within 1 hour</p>';
    } else if (choice.duration > 0) {
      context = `<p class="pixel-text-xs" style="margin-top: 8px;">Effect lasts ~${choice.duration} hour${choice.duration > 1 ? 's' : ''}</p>`;
    }

    // Add max HR zone info for exercise choices
    let exerciseZoneInfo = '';
    if (choice.decayType === 'immediate' && choice.bpmChange > 30) {
      // Exercise choices
      const maxHR = this.daySimData.maxHR;
      const intensity = this.getExerciseIntensity(Math.round(newBPM), maxHR);
      const percentMax = Math.round((newBPM / maxHR) * 100);
      exerciseZoneInfo = `<p class="pixel-text-xs" style="margin-top: 8px;">Zone: ${intensity.zone} (${percentMax}% of max ${maxHR})</p>`;
    }

    // Build fact text with optional zone info
    let factText = choice.fact;
    if (exerciseZoneInfo) {
      factText += `\n\nMAX HR: ${this.daySimData.maxHR} BPM (age ${this.daySimData.age})`;
    }

    this.screen.innerHTML = `
      <div class="screen-fade-in" style="display: flex; flex-direction: column; gap: 15px; width: 100%;">
        <p class="pixel-text-md">CHOICE: ${choice.text}</p>

        <div style="text-align: center;">
          <p class="pixel-text-md" style="color: ${indicatorColor};">
            ${indicatorText}
          </p>
          <p class="pixel-text-xl" style="margin-top: 8px; white-space: nowrap; color: ${choice.choiceType === 'healthy' ? 'var(--gb-lightest)' : choice.choiceType === 'unhealthy' ? 'var(--gb-dark)' : 'var(--gb-light)'};">
            ${changeText} BPM ${choice.decayType === 'immediate' && choice.bpmChange > 0 ? '(DURING)' : ''}
          </p>
          <p class="pixel-text-sm" style="margin-top: 10px;">
            ${oldBPM} → ${Math.round(newBPM)} BPM
          </p>
          ${context}
          ${exerciseZoneInfo}
        </div>

        <div class="pokemon-textbox">
          <p>${factText}</p>
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
    const peakWasExercise = this.daySimData.dayEvents.some(
      (e) =>
        e.choiceType === 'healthy' &&
        (e.choice.includes('BIKE') || e.choice.includes('WALK') || e.choice.includes('WORKOUT'))
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

        <div style="background: rgba(155, 188, 15, 0.3); border: 2px solid var(--gb-light); border-radius: 8px; padding: 12px; margin: 12px 0;">
          <p class="pixel-text-sm" style="font-weight: bold; margin-bottom: 8px; text-align: left;">💪 LONG-TERM BENEFITS:</p>
          <p class="pixel-text-xs" style="line-height: 1.6; text-align: left; margin-bottom: 6px;">
            Assuming average resting HR of 70 BPM:
          </p>
          <p class="pixel-text-xs" style="line-height: 1.6; text-align: left;">
            • <strong>Consistent cardio (30 days)</strong> can reduce resting HR by 5-8 BPM<br><br>
            • <strong>Regular exercise (3-6 months)</strong> may lower HR by 10-15 BPM<br><br>
            • <strong>Trained athletes</strong> often have resting rates of 40-60 BPM - up to 30% lower than average!
          </p>
        </div>

        <div class="health-tips">
          <p style="font-weight: bold; margin-bottom: 6px;">HEALTH TIPS:</p>
          ${tips.map((tip) => `<p>• ${tip}</p>`).join('')}
        </div>

        <div class="pokemon-textbox">
          <p>A TO REPLAY</p>
          <p>B TO MAIN MENU</p>
        </div>
      </div>
    `;
  }

  /**
   * Calculate total beats in a day based on actual BPM throughout simulated hours
   */
  calculateDayBeats() {
    // Time periods we simulate: 7:30 AM to 8:00 PM = 12.5 hours
    // Remaining 11.5 hours assumed at resting BPM (sleep + early morning)

    const timePoints = [
      '7:30 AM',
      '8:00 AM',
      '9:00 AM',
      '10:00 AM',
      '11:00 AM',
      '12:00 PM',
      '1:00 PM',
      '2:00 PM',
      '3:00 PM',
      '4:00 PM',
      '5:00 PM',
      '6:00 PM',
      '7:00 PM',
      '8:00 PM',
    ];

    let totalBeats = 0;

    // Calculate beats for each simulated hour
    for (let i = 0; i < timePoints.length - 1; i++) {
      const currentTime = timePoints[i];
      const nextTime = timePoints[i + 1];
      const hoursInPeriod = this.calculateHoursDiff(currentTime, nextTime);
      const bpmAtThisTime = this.calculateCurrentBPM(currentTime);

      // Beats in this period = BPM * minutes in period
      const minutesInPeriod = hoursInPeriod * 60;
      totalBeats += bpmAtThisTime * minutesInPeriod;
    }

    // Add sleep/rest period (11.5 hours at resting BPM, typically lower ~55 BPM during sleep)
    const sleepHours = 11.5;
    const sleepBPM = Math.max(50, this.daySimData.restingBPM - 10); // Sleep HR is ~10 BPM lower
    totalBeats += sleepBPM * sleepHours * 60;

    return Math.round(totalBeats);
  }

  /**
   * Calculate grade based on heart-healthy choices
   */
  calculateGrade() {
    const healthyPercent =
      (this.daySimData.heartHealthyChoices / this.daySimData.totalChoices) * 100;

    if (healthyPercent >= 75) {
      return 'A';
    }
    if (healthyPercent >= 60) {
      return 'B';
    }
    if (healthyPercent >= 45) {
      return 'C';
    }
    if (healthyPercent >= 30) {
      return 'D';
    }
    return 'F';
  }

  /**
   * Get health tips based on choices
   */
  getHealthTips() {
    const tips = [];
    const events = this.daySimData.dayEvents;

    // Check for exercise
    const exercised = events.some(
      (e) =>
        e.choiceType === 'healthy' &&
        (e.choice.includes('BIKE') ||
          e.choice.includes('WALK') ||
          e.choice.includes('WORKOUT') ||
          e.choice.includes('YOGA'))
    );

    if (exercised) {
      tips.push(
        'Great job exercising! Regular activity strengthens your heart and lowers resting HR over time.'
      );
    } else {
      tips.push('Aim for 150 min/week moderate exercise for optimal heart health.');
    }

    // Check for stress management
    const managedStress = events.some((e) => e.choice === 'BREATHE' || e.choice === 'MEDITATE');
    const hadStress = events.some((e) => e.choice === 'PANIC' || e.choice === 'ARGUE');

    if (hadStress && !managedStress) {
      tips.push('Try stress management techniques - chronic stress damages heart health.');
    } else if (managedStress) {
      tips.push(
        'Excellent stress management! Deep breathing and meditation are powerful for heart health.'
      );
    }

    // Check caffeine
    const caffeine = events.filter((e) => e.choice.includes('COFFEE')).length;
    if (caffeine >= 2) {
      tips.push('Limit caffeine to 1-2 cups daily. Too much can cause heart palpitations.');
    }

    // Overall assessment
    const healthyPercent =
      (this.daySimData.heartHealthyChoices / this.daySimData.totalChoices) * 100;
    if (healthyPercent >= 75) {
      tips.push('Outstanding! Your choices promote cardiovascular health and reduce disease risk!');
    } else if (healthyPercent >= 50) {
      tips.push('Good choices overall! Keep prioritizing heart-healthy decisions.');
    }

    return tips.slice(0, 3); // Return max 3 tips
  }

  /**
   * Scroll the summary screen
   */
  scrollSummary(amount) {
    const summaryContainer = document.querySelector('.summary-screen');
    if (summaryContainer) {
      summaryContainer.scrollBy({
        top: amount,
        behavior: 'smooth',
      });
    }
  }

  /**
   * Scroll educational pages (conditions and animal final)
   */
  scrollEducationalPage(amount) {
    const container = document.querySelector('.educational-page');
    if (container) {
      container.scrollBy({
        top: amount,
        behavior: 'smooth',
      });
    }
  }

  /**
   * Show Condition 1: Atrial Fibrillation
   */
  showCondition1() {
    this.currentState = this.STATE.CONDITION_1;
    this.screen.innerHTML = `
      <div class="educational-page screen-fade-in" style="
        display: flex;
        flex-direction: column;
        gap: 15px;
        width: 100%;
        max-height: 100%;
        overflow-y: auto;
      ">
        <p class="pixel-text-lg" style="text-align: center;">⚡ ATRIAL FIBRILLATION</p>

        <div style="background: rgba(155, 188, 15, 0.3); border: 2px solid var(--gb-light); border-radius: 8px; padding: 12px;">
          <p class="pixel-text-sm" style="line-height: 1.6;">
            <strong>WHAT:</strong> Heart's upper chambers beat chaotically, out of sync.<br><br>
            <strong>SYMPTOMS:</strong> Pounding heart, fluttering chest, dizziness, fatigue. Some have no symptoms.<br><br>
            <strong>WHY IT MATTERS:</strong> 5x stroke risk from blood clots forming in heart.<br><br>
            <strong>TREATMENT:</strong> Medications, blood thinners, lifestyle changes, or procedures to reset rhythm.
          </p>
        </div>

        <div class="pokemon-textbox" style="margin-top: auto;">
          <p class="pixel-text-xs">A TO CONTINUE  B TO GO BACK</p>
          <p class="pixel-text-xs">▲▼ SCROLL</p>
        </div>
      </div>
    `;
  }

  /**
   * Show Condition 2: High Blood Pressure
   */
  showCondition2() {
    this.currentState = this.STATE.CONDITION_2;

    this.screen.innerHTML = `
      <div class="educational-page screen-fade-in" style="
        display: flex;
        flex-direction: column;
        gap: 15px;
        width: 100%;
        max-height: 100%;
        overflow-y: auto;
      ">
        <p class="pixel-text-lg" style="text-align: center;">💔 HIGH BLOOD PRESSURE</p>

        <div style="background: rgba(155, 188, 15, 0.3); border: 2px solid var(--gb-light); border-radius: 8px; padding: 12px;">
          <p class="pixel-text-sm" style="line-height: 1.6;">
            <strong>WHAT:</strong> Force of blood against artery walls too high. Damages blood vessels over time.<br><br>
            <strong>SYMPTOMS:</strong> Often NO symptoms! Called "silent killer." Normal is &lt;120/80.<br><br>
            <strong>WHY IT MATTERS:</strong> Causes heart attack, stroke, kidney damage, heart failure.<br><br>
            <strong>TREATMENT:</strong> Reduce salt, exercise regularly, healthy weight, manage stress, medications.
          </p>
        </div>

        <div class="pokemon-textbox" style="margin-top: auto;">
          <p class="pixel-text-xs">A TO CONTINUE  B TO GO BACK</p>
          <p class="pixel-text-xs">▲▼ SCROLL</p>
        </div>
      </div>
    `;
  }

  /**
   * Show Condition 3: Coronary Artery Disease
   */
  showCondition3() {
    this.currentState = this.STATE.CONDITION_3;

    this.screen.innerHTML = `
      <div class="educational-page screen-fade-in" style="
        display: flex;
        flex-direction: column;
        gap: 15px;
        width: 100%;
        max-height: 100%;
        overflow-y: auto;
      ">
        <p class="pixel-text-lg" style="text-align: center;">🫀 CORONARY ARTERY DISEASE</p>

        <div style="background: rgba(155, 188, 15, 0.3); border: 2px solid var(--gb-light); border-radius: 8px; padding: 12px;">
          <p class="pixel-text-sm" style="line-height: 1.6;">
            <strong>WHAT:</strong> Plaque buildup in heart's arteries blocks blood flow. Like clogged pipes.<br><br>
            <strong>SYMPTOMS:</strong> Chest pain/pressure, shortness of breath, fatigue. Heart attack warning: crushing chest pain - CALL 911!<br><br>
            <strong>WHY IT MATTERS:</strong> #1 cause of death. Risk factors: high cholesterol, smoking, diabetes, sedentary life.<br><br>
            <strong>TREATMENT:</strong> Healthy diet, exercise, quit smoking, statins, angioplasty, or bypass surgery.
          </p>
        </div>

        <div class="pokemon-textbox" style="margin-top: auto;">
          <p class="pixel-text-xs">A TO CONTINUE  B TO GO BACK</p>
          <p class="pixel-text-xs">▲▼ SCROLL</p>
        </div>
      </div>
    `;
  }

  /**
   * Show animal heart rate introduction/transition page
   */
  showAnimalIntro() {
    this.currentState = this.STATE.ANIMAL_INTRO;

    this.screen.innerHTML = `
      <div class="educational-page screen-fade-in" style="
        display: flex;
        flex-direction: column;
        gap: 15px;
        width: 100%;
        max-height: 100%;
        overflow-y: auto;
      ">
        <p class="pixel-text-lg" style="text-align: center;">🔬 HEART RATE & BODY SIZE</p>

        <div class="pokemon-textbox" style="margin-bottom: 10px;">
          <p class="pixel-text-sm">Heart rate is closely tied to</p>
          <p class="pixel-text-sm">body size and metabolism</p>
        </div>

        <div style="background: rgba(155, 188, 15, 0.3); border: 2px solid var(--gb-light); border-radius: 8px; padding: 12px; margin-bottom: 12px;">
          <p class="pixel-text-sm" style="line-height: 1.6; text-align: left;">
            <strong>THE RELATIONSHIP:</strong><br><br>
            Smaller animals have FASTER hearts because they lose heat more quickly and need higher metabolic rates to maintain body temperature.<br><br>
            Larger animals are more energy-efficient with SLOWER hearts. An elephant's heart beats just 30 times per minute!<br><br>
            This pattern holds true across the entire animal kingdom.
          </p>
        </div>

        <div class="pokemon-textbox">
          <p class="pixel-text-sm">LET'S COMPARE HEARTS ACROSS</p>
          <p class="pixel-text-sm">THE ANIMAL KINGDOM...</p>
        </div>

        <div class="pokemon-textbox" style="margin-top: auto;">
          <p class="pixel-text-xs">A TO CONTINUE  B TO GO BACK</p>
          <p class="pixel-text-xs">▲▼ SCROLL</p>
        </div>
      </div>
    `;
  }

  /**
   * Show animal comparisons final page
   */
  showAnimalFinal() {
    this.currentState = this.STATE.ANIMAL_FINAL;

    const animals = [
      { name: 'BLUE WHALE', bpm: 8, emoji: '🐋' },
      { name: 'ELEPHANT', bpm: 30, emoji: '🐘' },
      { name: 'HORSE', bpm: 40, emoji: '🐴' },
      { name: 'HUMAN (ADULT)', bpm: 70, emoji: '❤️' },
      { name: 'DOG', bpm: 100, emoji: '🐕' },
      { name: 'CAT', bpm: 150, emoji: '🐱' },
      { name: 'RABBIT', bpm: 200, emoji: '🐰' },
      { name: 'HAMSTER', bpm: 450, emoji: '🐹' },
      { name: 'HUMMINGBIRD', bpm: 1200, emoji: '🐦' },
    ];

    const animalListHTML = animals
      .map(
        (animal) => `
      <div style="
        background: rgba(155, 188, 15, 0.2);
        border: 2px solid var(--gb-light);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 12px;
        text-align: center;
      ">
        <div style="font-size: 24px; margin-bottom: 8px;">${animal.emoji}</div>
        <p class="pixel-text" style="font-weight: bold; margin-bottom: 4px;">${animal.name}</p>
        <p class="pixel-text" style="color: #e60012; margin: 0;">${animal.bpm} BPM</p>
      </div>
    `
      )
      .join('');

    this.screen.innerHTML = `
      <div class="educational-page screen-fade-in" style="
        display: flex;
        flex-direction: column;
        gap: 15px;
        width: 100%;
        max-height: 100%;
        overflow-y: auto;
      ">
        <p class="pixel-text-lg" style="text-align: center;">🐾 ANIMAL HEART RATES</p>

        <div class="pokemon-textbox" style="margin-bottom: 10px;">
          <p class="pixel-text-xs">BODY SIZE & METABOLISM</p>
          <p class="pixel-text-xs">Larger = Slower HR</p>
        </div>

        ${animalListHTML}

        <div class="pokemon-textbox" style="margin-top: auto;">
          <p class="pixel-text-xs">A TO FINISH  B TO GO BACK</p>
          <p class="pixel-text-xs">▲▼ SCROLL</p>
        </div>
      </div>
    `;
  }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const game = new HeartStoryGame();
  game.init();
});
