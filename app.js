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
        this.sessionData = { // To store data for the current workout session
            active: false,
            currentDay: null,
            startTime: null,
            exercises: {} // { exerciseIndex: { name: "...", sets: [ {weight:reps:completed}, ... ] } }
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
        window.startWorkout = () => { // This is the "Inizia Allenamento" on Home page
            this.switchSection('workout');
        };

        // Workout session buttons
        document.getElementById('startWorkoutSessionBtn').addEventListener('click', () => this.startWorkoutSession());
        document.getElementById('endWorkoutSessionBtn').addEventListener('click', () => this.endWorkoutSession());
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

    renderWorkout(isSessionActive = false) { // Added isSessionActive parameter
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
            const exerciseCard = this.createExerciseCard(exercise, index, isSessionActive); // Pass isSessionActive
            exercisesList.appendChild(exerciseCard);
        });

        // Show/hide exercise controls (add set, timer button) based on session state
        document.querySelectorAll('.exercise-controls').forEach(controls => {
            controls.style.display = isSessionActive ? 'flex' : 'none';
        });

        // Update home preview
        this.updateWorkoutPreview();
    }

    createExerciseCard(exercise, index, isSessionActive) { // Added isSessionActive
        const card = document.createElement('div');
        card.className = 'exercise-card';
        
        // Retrieve saved set data for this exercise if a session is active and data exists
        const sessionExerciseData = (this.sessionData.active && this.sessionData.exercises[index])
                                    ? this.sessionData.exercises[index].sets
                                    : [];

        card.innerHTML = `
            <div class="exercise-header">
                <h3 class="exercise-name">${exercise.name}</h3>
                <div class="exercise-rpe">RPE ${exercise.rpe}</div>
            </div>
            
            <div class="exercise-info-grid">
                <div class="info-item">
                    <div class="info-label">Serie</div>
                    <div class="info-value" id="sets-planned-${this.currentDay}-${index}">${exercise.sets}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Ripetizioni</div>
                    <div class="info-value" id="reps-planned-${this.currentDay}-${index}">${exercise.reps}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Riposo</div>
                    <div class="info-value">${this.formatTime(exercise.rest)}</div>
                </div>
            </div>
            
            ${exercise.notes ? `<div class="exercise-notes">${exercise.notes}</div>` : ''}
            
            <div class="exercise-sets-tracking" id="sets-tracking-${this.currentDay}-${index}">
                ${this.renderSetTrackers(exercise, index, isSessionActive, sessionExerciseData)}
            </div>

            <div class="exercise-controls" style="display: ${isSessionActive ? 'flex' : 'none'};">
                <button class="btn btn--secondary" onclick="fitTracker.addSet('${this.currentDay}', ${index})">Aggiungi Set</button>
                <button class="timer-btn" onclick="fitTracker.startRestTimer(${exercise.rest})" aria-label="Avvia timer di riposo">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </button>
            </div>
        `;
        return card;
    }

    renderSetTrackers(exercise, exerciseIndex, isSessionActive = false, sessionSets = []) {
        let html = '';
        // Use the greater of planned sets or actual sets done in the session for rendering rows
        const numPlannedSets = parseInt(exercise.sets) || 0;
        const numActualSets = sessionSets.length;
        const numSetsToRender = Math.max(numPlannedSets, numActualSets);

        for (let i = 0; i < numSetsToRender; i++) {
            const setData = sessionSets[i] || {}; // Get data for this set if it exists
            const weightValue = setData.weight || '';
            const repsValue = setData.reps || '';
            const isCompleted = setData.completed || false;

            html += `
                <div class="set-tracker-item ${isCompleted ? 'completed' : ''}" id="set-${this.currentDay}-${exerciseIndex}-${i}">
                    <span class="set-number">Set ${i + 1}</span>
                    <div class="weight-input-wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5C9.24 5 7 7.24 7 10v5h10v-5C17 7.24 14.76 5 12 5z"></path><path d="M20.54 15H3.46"></path><path d="M15.23 15.23C13.43 17.03 10.57 17.03 8.77 15.23"></path><path d="M12 22V10"></path><path d="M7 10V7a5 5 0 0 1 10 0v3"></path></svg>
                        <input type="number" class="weight-input set-weight-input" placeholder="Peso" value="${weightValue}"
                               id="weight-${this.currentDay}-${exerciseIndex}-${i}" min="0" step="0.25" ${!isSessionActive ? 'disabled' : ''} oninput="fitTracker.saveSetDataOnInput('${this.currentDay}', ${exerciseIndex}, ${i})">
                        <span class="weight-unit">kg</span>
                    </div>
                    <div class="reps-input-wrapper">
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M3 12h18"></path><path d="M3 18h18"></path></svg>
                        <input type="number" class="reps-input set-reps-input" placeholder="Reps" value="${repsValue}"
                               id="reps-${this.currentDay}-${exerciseIndex}-${i}" min="0" step="1" ${!isSessionActive ? 'disabled' : ''} oninput="fitTracker.saveSetDataOnInput('${this.currentDay}', ${exerciseIndex}, ${i})">
                    </div>
                    <button class="btn-icon set-complete-btn" onclick="fitTracker.toggleSetComplete('${this.currentDay}', ${exerciseIndex}, ${i})" aria-label="Completa set" ${!isSessionActive ? 'disabled' : ''}>
                        <svg class="check-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <svg class="circle-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>
                    </button>
                </div>
            `;
        }
        return html;
    }

    addSet(day, exerciseIndex) {
        // This function would dynamically add a new set tracker row.
        // For simplicity in this step, we'll assume a fixed number of sets initially.
        // Later, this can be expanded.
        console.log(`Adding set for ${day}, exercise ${exerciseIndex}`);
        const exercise = this.workoutData[day].exercises[exerciseIndex];
        const setsContainer = document.getElementById(`sets-tracking-${day}-${exerciseIndex}`);
        const currentSetCount = setsContainer.children.length;

        const newSetHtml = `
            <div class="set-tracker-item" id="set-${day}-${exerciseIndex}-${currentSetCount}">
                <span class="set-number">Set ${currentSetCount + 1}</span>
                <div class="weight-input-wrapper">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5C9.24 5 7 7.24 7 10v5h10v-5C17 7.24 14.76 5 12 5z"></path><path d="M20.54 15H3.46"></path><path d="M15.23 15.23C13.43 17.03 10.57 17.03 8.77 15.23"></path><path d="M12 22V10"></path><path d="M7 10V7a5 5 0 0 1 10 0v3"></path></svg>
                    <input type="number" class="weight-input set-weight-input" placeholder="Peso"
                           id="weight-${day}-${exerciseIndex}-${currentSetCount}" min="0" step="0.25">
                    <span class="weight-unit">kg</span>
                </div>
                 <div class="reps-input-wrapper">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M3 12h18"></path><path d="M3 18h18"></path></svg>
                    <input type="number" class="reps-input set-reps-input" placeholder="Reps"
                           id="reps-${day}-${exerciseIndex}-${currentSetCount}" min="0" step="1">
                </div>
                <button class="btn-icon set-complete-btn" onclick="fitTracker.toggleSetComplete('${day}', ${exerciseIndex}, ${currentSetCount})" aria-label="Completa set">
                    <svg class="check-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <svg class="circle-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>
                </button>
            </div>
        `;
        setsContainer.insertAdjacentHTML('beforeend', newSetHtml);

        // Update the planned sets display
        const setsPlannedElement = document.getElementById(`sets-planned-${day}-${exerciseIndex}`);
        if (setsPlannedElement) {
            setsPlannedElement.textContent = currentSetCount + 1;
        }
        // Also update in the workoutData structure (or a temporary session structure)
        // For now, let's assume we might need a temporary session data structure
        if (!this.sessionData) this.sessionData = {};
        if (!this.sessionData[day]) this.sessionData[day] = {};
        if (!this.sessionData[day][exerciseIndex]) this.sessionData[day][exerciseIndex] = { sets: [] }; // or clone from workoutData

        // This is a simplification; ideally, you'd manage set data more robustly.
        // For now, just visually adding, actual data handling for new sets needs more logic.
        // Also, we need to ensure the new set's inputs are enabled if a session is active.
        const newSetElement = setsContainer.lastElementChild;
        if (newSetElement && this.sessionData.active) {
            newSetElement.querySelectorAll('input, button').forEach(el => el.disabled = false);
        }
    }

    saveSetDataOnInput(day, exerciseIndex, setIndex) {
        if (!this.sessionData.active) return; // Only save if session is active
        const weightInput = document.getElementById(`weight-${day}-${exerciseIndex}-${setIndex}`);
        const repsInput = document.getElementById(`reps-${day}-${exerciseIndex}-${setIndex}`);
        this.saveSetData(day, exerciseIndex, setIndex, weightInput.value, repsInput.value, null); // null for completed status as it's just an input change
    }

    toggleSetComplete(day, exerciseIndex, setIndex) {
        if (!this.sessionData.active) return; // Can only complete if session is active

        const setItem = document.getElementById(`set-${day}-${exerciseIndex}-${setIndex}`);
        const isCompleted = setItem.classList.toggle('completed');
        const weightInput = document.getElementById(`weight-${day}-${exerciseIndex}-${setIndex}`);
        const repsInput = document.getElementById(`reps-${day}-${exerciseIndex}-${setIndex}`);

        this.saveSetData(day, exerciseIndex, setIndex, weightInput.value, repsInput.value, isCompleted);

        if (isCompleted) {
            console.log(`Set ${setIndex + 1} for ${this.workoutData[day].exercises[exerciseIndex].name} completed with ${weightInput.value}kg for ${repsInput.value} reps.`);
        }
    }

    saveSetData(day, exerciseIndex, setIndex, weight, reps, completedStatus) {
        // Ensure sessionData and nested structures exist
        if (!this.sessionData) this.sessionData = { active: false, currentDay: null, startTime: null, exercises: {} };
        if (!this.sessionData.exercises) this.sessionData.exercises = {};

        const exerciseKey = exerciseIndex.toString(); // Use string key for object
        if (!this.sessionData.exercises[exerciseKey]) {
            this.sessionData.exercises[exerciseKey] = {
                name: this.workoutData[day].exercises[exerciseIndex].name, // Store exercise name
                sets: []
            };
        }
        // Ensure sets array is long enough
        while (this.sessionData.exercises[exerciseKey].sets.length <= setIndex) {
            this.sessionData.exercises[exerciseKey].sets.push({ weight: '', reps: '', completed: false });
        }

        // Update only the provided fields. If completedStatus is null, it means it's an input update, don't change completion.
        const currentSetData = this.sessionData.exercises[exerciseKey].sets[setIndex];
        currentSetData.weight = weight !== undefined ? weight : currentSetData.weight;
        currentSetData.reps = reps !== undefined ? reps : currentSetData.reps;
        if (completedStatus !== null) {
            currentSetData.completed = completedStatus;
        }

        console.log("Session data updated:", JSON.parse(JSON.stringify(this.sessionData))); // Deep copy for logging
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

    startWorkoutSession() {
        this.sessionData = {
            active: true,
            currentDay: this.currentDay,
            startTime: new Date(),
            exercises: {}
        };

        document.getElementById('startWorkoutSessionBtn').style.display = 'none';
        document.getElementById('endWorkoutSessionBtn').style.display = 'flex'; // Assuming flex display for btn
        document.getElementById('daySelector').disabled = true;

        // Enable inputs and set complete buttons within workout cards
        this.renderWorkout(true); // Pass flag to enable inputs

        console.log("Workout session started for day:", this.currentDay);
        // Potentially scroll to the first exercise or show a start message
    }

    endWorkoutSession() {
        if (!this.sessionData.active) return;

        const endTime = new Date();
        const durationMs = endTime - this.sessionData.startTime;

        // TODO: Save sessionData to localStorage (userData.workoutHistory or similar)
        // This part needs to be carefully designed based on how progress is stored.
        // For now, let's log it and update basic stats.
        console.log("Workout session ended. Duration:", durationMs, "Data:", this.sessionData);

        this.userData.totalWorkouts = (this.userData.totalWorkouts || 0) + 1;

        const today = new Date().toISOString().split('T')[0];
        if (!this.userData.workoutDates.includes(today)) {
            this.userData.workoutDates.push(today);
        }
        this.updateStreak(); // Assumes this.userData.workoutDates is up-to-date

        // Store detailed workout log - NEW
        if (!this.userData.workoutLogs) {
            this.userData.workoutLogs = [];
        }
        this.userData.workoutLogs.push({
            date: today,
            day: this.sessionData.currentDay,
            startTime: this.sessionData.startTime.toISOString(),
            endTime: endTime.toISOString(),
            durationMs: durationMs,
            exercises: this.sessionData.exercises
        });


        this.saveUserData(); // Save all userData changes
        this.updateHomeStats();
        this.renderProgress(); // Re-render progress to show new workout

        // Reset UI
        this.sessionData = { active: false, currentDay: null, startTime: null, exercises: {} }; // Reset sessionData
        document.getElementById('startWorkoutSessionBtn').style.display = 'flex';
        document.getElementById('endWorkoutSessionBtn').style.display = 'none';
        document.getElementById('daySelector').disabled = false;

        this.renderWorkout(false); // Re-render with inputs disabled

        // Navigate to progress section to show results
        this.switchSection('progress');
        // alert('Allenamento terminato e salvato!'); // Alert can be removed or made more subtle
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
        this.renderRecentWeights();
        this.renderWorkoutLogHistory();
    }

    renderRecentWeights() {
        const recentWeightsContainer = document.getElementById('recentWeights');
        if (!recentWeightsContainer) return;

        const lastLog = this.userData.workoutLogs && this.userData.workoutLogs.length > 0
                        ? this.userData.workoutLogs[this.userData.workoutLogs.length - 1]
                        : null;

        if (!lastLog || Object.keys(lastLog.exercises).length === 0) {
            recentWeightsContainer.innerHTML = '<p class="no-data">Nessun dato dall\'ultimo allenamento.</p>';
            return;
        }

        let html = '<ul class="stats-list">'; // Re-use stats-list styling for simplicity
        for (const exerciseId in lastLog.exercises) {
            const exercise = lastLog.exercises[exerciseId];
            html += `<li class="stat-item"><span>${exercise.name}</span></li>`;
            exercise.sets.forEach((set, index) => {
                if (set.completed) {
                    html += `<li class="log-set-item" style="padding-left: var(--spacing-lg);">Set ${index + 1}: ${set.weight || 'N/A'} kg x ${set.reps || 'N/A'} reps</li>`;
                }
            });
        }
        html += '</ul>';
        recentWeightsContainer.innerHTML = html;
    }

    renderWorkoutLogHistory() {
        const historyContainer = document.getElementById('workoutLogHistory');
        if (!historyContainer) return;

        if (!this.userData.workoutLogs || this.userData.workoutLogs.length === 0) {
            historyContainer.innerHTML = '<p class="no-data">Nessuno storico allenamenti trovato.</p>';
            return;
        }

        let html = '';
        // Iterate in reverse to show newest first, but limit to e.g., last 10-20 logs for performance if many.
        const logsToShow = this.userData.workoutLogs.slice().reverse().slice(0, 20);

        logsToShow.forEach(log => {
            const logDate = new Date(log.date);
            const formattedDate = logDate.toLocaleDateString('it-IT', { year: 'numeric', month: 'short', day: 'numeric' });
            const workoutName = this.workoutData[log.day] ? this.workoutData[log.day].name : `Allenamento Giorno ${log.day.replace('day','')}`;

            html += `
                <div class="log-entry">
                    <div class="log-entry-header">
                        <h4>${workoutName}</h4>
                        <span class="date">${formattedDate}</span>
                    </div>
            `;
            for (const exerciseId in log.exercises) {
                const ex = log.exercises[exerciseId];
                html += `<div class="log-exercise-item"><strong>${ex.name}</strong>:`;
                ex.sets.forEach((set, index) => {
                    if (set.completed) {
                        html += `<div class="log-set-item">Set ${index + 1}: ${set.weight || 'N/A'} kg x ${set.reps || 'N/A'} reps</div>`;
                    }
                });
                html += `</div>`;
            }
            html += `</div>`;
        });
        historyContainer.innerHTML = html;
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
