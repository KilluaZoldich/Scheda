// FitTracker Pro - Apple-inspired fitness tracking PWA
class FitTracker {
    constructor() {
        this.currentSection = 'home';
        this.currentDay = 'day1';
        this.timer = {
            duration: 0,
            remaining: 0,
            isRunning: false,
            interval: null
        };
        
        // Workout data structure
        this.workoutData = {
            "day1": {
                "name": "Upper Body - Forza/Ipertrofia",
                "focus": "Esercizi multiarticolari pesanti",
                "exercises": [
                    {"name": "Panca Piana con Bilanciere", "sets": 4, "reps": "6-8", "rest": 120, "rpe": "8-9", "notes": "Movimento controllato nella discesa (eccentrica)"},
                    {"name": "Rematore con Bilanciere", "sets": 4, "reps": "6-8", "rest": 120, "rpe": "8-9", "notes": "Mantenere schiena dritta, focus contrazione dorsale"},
                    {"name": "Lento Avanti con Bilanciere", "sets": 3, "reps": "8-10", "rest": 90, "rpe": "8", "notes": "Seduto o in piedi, evitare inarcare schiena"},
                    {"name": "Trazioni/Lat Machine", "sets": 3, "reps": "Max/8-12", "rest": 90, "rpe": "9-10", "notes": "Trazioni al max, lat machine carico adeguato"},
                    {"name": "Dip/Panca Stretta", "sets": 3, "reps": "8-12", "rest": 60, "rpe": "9", "notes": "Focus tricipite, scendi 90° gomito"},
                    {"name": "Curl Bilanciere EZ", "sets": 3, "reps": "8-12", "rest": 60, "rpe": "9", "notes": "Evita cheating con la schiena"}
                ]
            },
            "day2": {
                "name": "Lower Body - Forza/Ipertrofia", 
                "focus": "Forza e massa gambe",
                "exercises": [
                    {"name": "Squat con Bilanciere", "sets": 4, "reps": "6-8", "rest": 120, "rpe": "8-9", "notes": "Scendi sotto parallelo, curve fisiologiche"},
                    {"name": "Stacchi Rumeni", "sets": 4, "reps": "8-10", "rest": 120, "rpe": "8", "notes": "Focus femorali/glutei, schiena compatta"},
                    {"name": "Leg Press 45°", "sets": 3, "reps": "10-12", "rest": 90, "rpe": "9", "notes": "Controlla negativa, non estendere tutto"},
                    {"name": "Affondi con Manubri", "sets": 3, "reps": "10 per gamba", "rest": 90, "rpe": "9", "notes": "Passi lunghi=glutei, corti=quadricipiti"},
                    {"name": "Calf Raise in piedi", "sets": 4, "reps": "12-15", "rest": 60, "rpe": "9-10", "notes": "Contrazione picco 1-2 secondi"},
                    {"name": "Plank", "sets": 3, "reps": "Max secondi", "rest": 60, "rpe": "10", "notes": "Contrai addome e glutei"}
                ]
            },
            "day4": {
                "name": "Upper Body - Ipertrofia/Metabolica",
                "focus": "Volume e tempo sotto tensione",
                "exercises": [
                    {"name": "Panca Inclinata Manubri", "sets": 4, "reps": "10-12", "rest": 90, "rpe": "9", "notes": "Maggior allungamento pettorale"},
                    {"name": "Pulley Basso presa stretta", "sets": 4, "reps": "10-12", "rest": 90, "rpe": "9", "notes": "Contrazione al picco movimento"},
                    {"name": "Spinte Manubri Seduto", "sets": 3, "reps": "12-15", "rest": 75, "rpe": "10", "notes": "Movimento fluido senza pause"},
                    {"name": "Alzate Laterali", "sets": 3, "reps": "12-15", "rest": 60, "rpe": "10", "notes": "No slancio, forma > carico"},
                    {"name": "French Press EZ", "sets": 3, "reps": "12-15", "rest": 60, "rpe": "9-10", "notes": "Gomiti stretti per tricipite"},
                    {"name": "Curl a Martello", "sets": 3, "reps": "12-15", "rest": 60, "rpe": "9-10", "notes": "Lavora brachiale e avambraccio"}
                ]
            },
            "day5": {
                "name": "Lower Body - Ipertrofia/Metabolica",
                "focus": "Stress metabolico e pompaggio", 
                "exercises": [
                    {"name": "Front Squat/Goblet", "sets": 4, "reps": "10-12", "rest": 90, "rpe": "9", "notes": "Focus maggiore quadricipiti"},
                    {"name": "Leg Curl sdraiato", "sets": 4, "reps": "12-15", "rest": 75, "rpe": "10", "notes": "Controlla movimento, brucia femorali"},
                    {"name": "Leg Extension", "sets": 3, "reps": "15-20", "rest": 60, "rpe": "10", "notes": "Spremi quadricipiti 1 secondo in cima"},
                    {"name": "Hip Thrust", "sets": 4, "reps": "10-12", "rest": 90, "rpe": "9-10", "notes": "Fondamentale per costruzione glutei"},
                    {"name": "Calf Raise seduto", "sets": 4, "reps": "15-20", "rest": 60, "rpe": "10", "notes": "Colpisce soleo, diverso da in piedi"},
                    {"name": "Crunch ai Cavi", "sets": 3, "reps": "15-20", "rest": 60, "rpe": "10", "notes": "Tensione costante addome"}
                ]
            }
        };

        this.init();
    }

    init() {
        this.updateCurrentDate();
        this.setupEventListeners();
        this.loadUserData();
        this.updateHomeStats();
        this.renderWorkout();
        this.renderProgress();
        this.setupTimer();
    }

    updateCurrentDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        document.getElementById('currentDate').textContent = 
            now.toLocaleDateString('it-IT', options);
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-item').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.switchSection(section);
            });
        });

        // Day selector
        document.getElementById('daySelector').addEventListener('change', (e) => {
            this.currentDay = e.target.value;
            this.renderWorkout();
        });

        // Timer controls
        document.getElementById('timerPlayPause').addEventListener('click', () => {
            this.toggleTimer();
        });

        document.getElementById('timerReset').addEventListener('click', () => {
            this.resetTimer();
        });

        // Timer presets
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const time = parseInt(e.currentTarget.dataset.time);
                this.setTimer(time);
            });
        });

        // Custom timer
        document.getElementById('setCustomTimer').addEventListener('click', () => {
            const minutes = parseInt(document.getElementById('customMinutes').value) || 0;
            const seconds = parseInt(document.getElementById('customSeconds').value) || 0;
            const totalSeconds = (minutes * 60) + seconds;
            if (totalSeconds > 0) {
                this.setTimer(totalSeconds);
            }
        });

        // Start workout button
        window.startWorkout = () => {
            this.switchSection('workout');
        };
    }

    switchSection(sectionName) {
        // Update active section
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}-section`).classList.add('active');

        // Update active tab
        document.querySelectorAll('.tab-item').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        this.currentSection = sectionName;
    }

    renderWorkout() {
        const workout = this.workoutData[this.currentDay];
        if (!workout) return;

        // Update workout header
        document.getElementById('workoutTitle').textContent = workout.name;
        document.getElementById('workoutFocus').textContent = workout.focus;

        // Update day selector
        document.getElementById('daySelector').value = this.currentDay;

        // Render exercises
        const exercisesList = document.getElementById('exercisesList');
        exercisesList.innerHTML = '';

        workout.exercises.forEach((exercise, index) => {
            const exerciseCard = this.createExerciseCard(exercise, index);
            exercisesList.appendChild(exerciseCard);
        });

        // Update home preview
        this.updateWorkoutPreview();
    }

    createExerciseCard(exercise, index) {
        const card = document.createElement('div');
        card.className = 'exercise-card';
        
        card.innerHTML = `
            <div class="exercise-header">
                <h3 class="exercise-name">${exercise.name}</h3>
                <div class="exercise-rpe">RPE ${exercise.rpe}</div>
            </div>
            
            <div class="exercise-details">
                <div class="detail-item">
                    <div class="detail-label">Serie</div>
                    <div class="detail-value">${exercise.sets}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Ripetizioni</div>
                    <div class="detail-value">${exercise.reps}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Riposo</div>
                    <div class="detail-value">${this.formatTime(exercise.rest)}</div>
                </div>
            </div>
            
            <div class="exercise-notes">${exercise.notes}</div>
            
            <div class="exercise-controls">
                <input type="number" class="weight-input" placeholder="Peso (kg)" 
                       id="weight-${this.currentDay}-${index}" min="0" step="0.5">
                <button class="timer-btn" onclick="fitTracker.startRestTimer(${exercise.rest})">
                    Timer
                </button>
            </div>
        `;

        // Load saved weight
        const savedWeight = this.getUserData(`weight-${this.currentDay}-${index}`);
        if (savedWeight) {
            card.querySelector('.weight-input').value = savedWeight;
        }

        // Save weight on input
        card.querySelector('.weight-input').addEventListener('input', (e) => {
            this.saveUserData(`weight-${this.currentDay}-${index}`, e.target.value);
        });

        return card;
    }

    startRestTimer(seconds) {
        this.switchSection('timer');
        this.setTimer(seconds);
        setTimeout(() => this.toggleTimer(), 100);
    }

    setupTimer() {
        this.updateTimerDisplay();
    }

    setTimer(seconds) {
        this.timer.duration = seconds;
        this.timer.remaining = seconds;
        this.timer.isRunning = false;
        this.updateTimerDisplay();
        this.updateTimerCircle();
    }

    toggleTimer() {
        if (this.timer.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        if (this.timer.remaining <= 0) return;
        
        this.timer.isRunning = true;
        document.getElementById('timerPlayPause').innerHTML = '<span class="timer-icon">⏸</span>';
        
        this.timer.interval = setInterval(() => {
            this.timer.remaining--;
            this.updateTimerDisplay();
            this.updateTimerCircle();
            
            if (this.timer.remaining <= 0) {
                this.completeTimer();
            }
        }, 1000);
    }

    pauseTimer() {
        this.timer.isRunning = false;
        clearInterval(this.timer.interval);
        document.getElementById('timerPlayPause').innerHTML = '<span class="timer-icon">⏵</span>';
    }

    resetTimer() {
        this.pauseTimer();
        this.timer.remaining = this.timer.duration;
        this.updateTimerDisplay();
        this.updateTimerCircle();
    }

    completeTimer() {
        this.pauseTimer();
        this.timer.remaining = 0;
        this.updateTimerDisplay();
        this.updateTimerCircle();
        
        // Vibration feedback if supported
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
        
        // Audio feedback
        this.playNotificationSound();
        
        alert('Timer completato! 🎉');
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timer.remaining / 60);
        const seconds = this.timer.remaining % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('timerTime').textContent = display;
        document.title = this.timer.isRunning ? `${display} - FitTracker` : 'FitTracker Pro';
    }

    updateTimerCircle() {
        const circle = document.getElementById('timerCircle');
        const circumference = 2 * Math.PI * 90; // radius = 90
        const progress = this.timer.duration > 0 ? 
            (this.timer.duration - this.timer.remaining) / this.timer.duration : 0;
        const offset = circumference - (progress * circumference);
        circle.style.strokeDashoffset = offset;
    }

    playNotificationSound() {
        // Create a simple beep sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Audio not supported');
        }
    }

    updateWorkoutPreview() {
        const workout = this.workoutData[this.currentDay];
        if (!workout) return;

        document.getElementById('workoutPreview').innerHTML = `
            <h4>${workout.name}</h4>
            <p>${workout.exercises.length} esercizi • ${workout.focus}</p>
        `;

        // Update next workout day display
        const dayNumber = this.currentDay.replace('day', '');
        document.getElementById('nextWorkoutDay').textContent = `Giorno ${dayNumber}`;
    }

    loadUserData() {
        try {
            const data = JSON.parse(localStorage.getItem('fitTracker') || '{}');
            this.userData = {
                totalWorkouts: 0,
                streakDays: 0,
                bestStreak: 0,
                lastWorkout: null,
                workoutDates: [],
                weights: {},
                ...data
            };
        } catch (e) {
            this.userData = {
                totalWorkouts: 0,
                streakDays: 0,
                bestStreak: 0,
                lastWorkout: null,
                workoutDates: [],
                weights: {}
            };
        }
    }

    saveUserData(key, value) {
        if (!this.userData) this.loadUserData();
        
        if (key && value !== undefined) {
            this.userData.weights = this.userData.weights || {};
            this.userData.weights[key] = value;
        }
        
        try {
            localStorage.setItem('fitTracker', JSON.stringify(this.userData));
        } catch (e) {
            console.error('Failed to save user data:', e);
        }
    }

    getUserData(key) {
        if (!this.userData) this.loadUserData();
        return this.userData.weights ? this.userData.weights[key] : null;
    }

    updateHomeStats() {
        if (!this.userData) this.loadUserData();
        
        document.getElementById('streakDays').textContent = this.userData.streakDays;
        document.getElementById('totalWorkouts').textContent = this.userData.totalWorkouts;
        
        // Calculate this week's workouts
        const thisWeek = this.getThisWeekWorkouts();
        document.getElementById('thisWeek').textContent = thisWeek;
    }

    getThisWeekWorkouts() {
        if (!this.userData.workoutDates) return 0;
        
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        return this.userData.workoutDates.filter(dateStr => {
            const date = new Date(dateStr);
            return date >= startOfWeek;
        }).length;
    }

    renderProgress() {
        this.renderWeekCalendar();
        this.updateProgressStats();
    }

    renderWeekCalendar() {
        const calendar = document.getElementById('weekCalendar');
        if (!calendar) return;
        
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        
        const days = ['D', 'L', 'M', 'M', 'G', 'V', 'S'];
        calendar.innerHTML = '';
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            
            const dayItem = document.createElement('div');
            dayItem.className = 'day-item';
            
            const isToday = date.toDateString() === today.toDateString();
            const hasWorkout = this.userData.workoutDates && 
                this.userData.workoutDates.includes(date.toISOString().split('T')[0]);
            
            if (isToday) dayItem.classList.add('today');
            if (hasWorkout) dayItem.classList.add('completed');
            
            dayItem.innerHTML = `
                <div>${days[i]}</div>
                <div>${date.getDate()}</div>
            `;
            
            calendar.appendChild(dayItem);
        }
    }

    updateProgressStats() {
        if (!this.userData) return;
        
        document.getElementById('totalWorkoutsProgress').textContent = this.userData.totalWorkouts;
        document.getElementById('currentStreakProgress').textContent = `${this.userData.streakDays} giorni`;
        document.getElementById('bestStreakProgress').textContent = `${this.userData.bestStreak} giorni`;
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (minutes === 0) {
            return `${remainingSeconds}"`;
        }
        return remainingSeconds === 0 ? `${minutes}'` : `${minutes}'${remainingSeconds}"`;
    }

    completeWorkout() {
        if (!this.userData) this.loadUserData();
        
        const today = new Date().toISOString().split('T')[0];
        
        // Add workout date if not already added
        if (!this.userData.workoutDates.includes(today)) {
            this.userData.workoutDates.push(today);
            this.userData.totalWorkouts++;
            
            // Update streak
            this.updateStreak();
        }
        
        this.userData.lastWorkout = today;
        this.saveUserData();
        this.updateHomeStats();
        this.renderProgress();
    }

    updateStreak() {
        if (!this.userData.workoutDates.length) return;
        
        const dates = this.userData.workoutDates
            .map(d => new Date(d))
            .sort((a, b) => b - a);
        
        let currentStreak = 0;
        let tempStreak = 1;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Check if we worked out today or yesterday
        const lastWorkout = dates[0];
        const daysDiff = Math.floor((today - lastWorkout) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 1) {
            currentStreak = 1;
            
            // Count consecutive days
            for (let i = 1; i < dates.length; i++) {
                const prevDate = dates[i - 1];
                const currentDate = dates[i];
                const diff = Math.floor((prevDate - currentDate) / (1000 * 60 * 60 * 24));
                
                if (diff === 1) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }
        
        this.userData.streakDays = currentStreak;
        this.userData.bestStreak = Math.max(this.userData.bestStreak, currentStreak);
    }
}

// Initialize the app
const fitTracker = new FitTracker();

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const swCode = `
            const CACHE_NAME = 'fittracker-v1';
            const urlsToCache = [
                '/',
                '/index.html',
                '/style.css',
                '/app.js'
            ];

            self.addEventListener('install', (event) => {
                event.waitUntil(
                    caches.open(CACHE_NAME)
                        .then((cache) => cache.addAll(urlsToCache))
                );
            });

            self.addEventListener('fetch', (event) => {
                event.respondWith(
                    caches.match(event.request)
                        .then((response) => {
                            return response || fetch(event.request);
                        })
                );
            });
        `;
        
        const blob = new Blob([swCode], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(blob);
        
        navigator.serviceWorker.register(swUrl)
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FitTracker;
}
