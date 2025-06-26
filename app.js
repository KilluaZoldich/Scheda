// FitTracker Pro - Apple-inspired fitness tracking PWA
class FitTracker {
    constructor() {
        this.currentSection = 'home';
        this.currentDay = 'day1'; // Sarà sovrascritto da loadWorkoutData se ci sono dati
        this.timer = {
            duration: 0,
            remaining: 0,
            isRunning: false,
            interval: null,
            appInterval: null
        };
        this.sessionData = {
            active: false,
            currentDay: null,
            startTime: null,
            exercises: {}
        };
        
        this.defaultWorkoutData = {
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
        this.workoutData = this.loadWorkoutData();
        this.currentDay = Object.keys(this.workoutData)[0] || null;


        this.init();
    }

    // --- Data Persistence ---
    /**
     * Loads workout data (days and their exercises) from localStorage.
     * If no data is found or data is invalid, returns a deep copy of defaultWorkoutData.
     * @returns {object} The workout data.
     */
    loadWorkoutData() {
        const storedData = localStorage.getItem('fitTrackerWorkoutData');
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                if (typeof parsedData === 'object' && parsedData !== null && Object.keys(parsedData).length > 0) {
                    return parsedData;
                } else {
                    console.warn("Invalid workout data in localStorage, using default.");
                    return JSON.parse(JSON.stringify(this.defaultWorkoutData));
                }
            } catch (error) {
                console.error("Error parsing workout data from localStorage, using default:", error);
                return JSON.parse(JSON.stringify(this.defaultWorkoutData));
            }
        }
        return JSON.parse(JSON.stringify(this.defaultWorkoutData));
    }

    /**
     * Saves the current state of this.workoutData to localStorage.
     */
    saveWorkoutData() {
        try {
            localStorage.setItem('fitTrackerWorkoutData', JSON.stringify(this.workoutData));
        } catch (error) {
            console.error("Error saving workout data to localStorage:", error);
        }
    }

    // --- Initialization and UI Setup ---
    init() {
        this.updateCurrentDate();
        this.setupEventListeners();
        this.loadUserData();
        this.updateDaySelector();
        this.updateHomeStats();
        this.renderWorkout();
        this.renderProgress();
        this.setupTimer();
        this.setupSWListener();
    }

    updateDaySelector() {
        const daySelector = document.getElementById('daySelector');
        daySelector.innerHTML = '';

        const dayIds = Object.keys(this.workoutData);

        if (dayIds.length === 0) {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "Nessun giorno";
            daySelector.appendChild(option);
            daySelector.disabled = true;
            document.getElementById('btnEditDay').disabled = true;
            document.getElementById('btnDeleteDay').disabled = true;
            document.getElementById('btnAddNewExerciseToDay').disabled = true;
             document.getElementById('startWorkoutSessionBtn').disabled = true;
            this.currentDay = null;
        } else {
            daySelector.disabled = false;
            document.getElementById('btnEditDay').disabled = false;
            document.getElementById('btnDeleteDay').disabled = false;
            document.getElementById('btnAddNewExerciseToDay').disabled = false;
            document.getElementById('startWorkoutSessionBtn').disabled = false;

            dayIds.forEach(dayId => {
                const dayData = this.workoutData[dayId];
                const option = document.createElement('option');
                option.value = dayId;
                option.textContent = dayData.name || dayId.replace('day', 'Giorno ');
                daySelector.appendChild(option);
            });

            if (this.currentDay && this.workoutData[this.currentDay]) {
                daySelector.value = this.currentDay;
            } else {
                this.currentDay = dayIds[0];
                daySelector.value = this.currentDay;
            }
        }

        if (this.currentDay) {
            this.renderWorkoutHeader();
        } else {
            document.getElementById('workoutTitle').textContent = "Nessun Allenamento";
            document.getElementById('workoutFocus').textContent = "Aggiungi un nuovo giorno di allenamento.";
            document.getElementById('exercisesList').innerHTML = '<p class="no-data">Nessun esercizio. Aggiungi un giorno di allenamento.</p>';
            const addExerciseContainer = document.getElementById('addExerciseContainer');
            if(addExerciseContainer) addExerciseContainer.style.display = 'none';
        }
    }

    renderWorkoutHeader() {
        if (this.currentDay && this.workoutData[this.currentDay]) {
            const workout = this.workoutData[this.currentDay];
            document.getElementById('workoutTitle').textContent = workout.name;
            document.getElementById('workoutFocus').textContent = workout.focus || "";
        } else {
            document.getElementById('workoutTitle').textContent = "Nessun Allenamento";
            document.getElementById('workoutFocus').textContent = "Seleziona o aggiungi un giorno.";
        }
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
            this.updateWorkoutPreview();
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

        // Start workout button (Home page)
        window.startWorkout = () => {
            this.switchSection('workout');
        };

        // Workout session buttons
        document.getElementById('startWorkoutSessionBtn').addEventListener('click', () => this.startWorkoutSession());
        document.getElementById('endWorkoutSessionBtn').addEventListener('click', () => this.endWorkoutSession());

        // Day Management Modal Listeners
        document.getElementById('btnAddNewDay').addEventListener('click', () => this.openDayEditor());
        document.getElementById('btnEditDay').addEventListener('click', () => this.openDayEditor(true));
        document.getElementById('btnDeleteDay').addEventListener('click', () => this.deleteWorkoutDay(this.currentDay));
        document.getElementById('closeDayEditorModal').addEventListener('click', () => this.closeDayEditor());
        document.getElementById('cancelDayEditor').addEventListener('click', () => this.closeDayEditor());
        document.getElementById('dayEditorForm').addEventListener('submit', (e) => this.handleDayEditorSubmit(e));

        // Exercise Management Listeners
        document.getElementById('btnAddNewExerciseToDay').addEventListener('click', () => this.openExerciseEditor(this.currentDay));
        document.getElementById('closeExerciseEditorModal').addEventListener('click', () => this.closeExerciseEditor());
        document.getElementById('cancelExerciseEditor').addEventListener('click', () => this.closeExerciseEditor());
        document.getElementById('exerciseEditorForm').addEventListener('submit', (e) => this.handleExerciseEditorSubmit(e));
    }

    // --- Day (Workout Schedule) CRUD and Modal Logic ---
    /**
     * Opens the modal for adding a new workout day or editing an existing one.
     * @param {boolean} isEditMode - True if editing an existing day, false for new.
     */
    openDayEditor(isEditMode = false) {
        const modal = document.getElementById('dayEditorModal');
        const title = document.getElementById('dayEditorTitle');
        const form = document.getElementById('dayEditorForm');
        const dayNameInput = document.getElementById('dayNameInput');
        const dayFocusInput = document.getElementById('dayFocusInput');
        const editingDayIdInput = document.getElementById('editingDayId');

        if (isEditMode) {
            if (!this.currentDay || !this.workoutData[this.currentDay]) {
                alert("Seleziona un giorno da modificare.");
                return;
            }
            title.textContent = "Modifica Giorno";
            const currentDayData = this.workoutData[this.currentDay];
            dayNameInput.value = currentDayData.name;
            dayFocusInput.value = currentDayData.focus || '';
            editingDayIdInput.value = this.currentDay;
        } else {
            title.textContent = "Nuovo Giorno";
            form.reset();
            editingDayIdInput.value = '';
        }
        modal.style.display = 'flex';
    }

    closeDayEditor() {
        document.getElementById('dayEditorModal').style.display = 'none';
        document.getElementById('dayEditorForm').reset();
    }

    handleDayEditorSubmit(event) {
        event.preventDefault();
        const dayName = document.getElementById('dayNameInput').value.trim();
        const dayFocus = document.getElementById('dayFocusInput').value.trim();
        const editingDayId = document.getElementById('editingDayId').value;

        if (!dayName) {
            alert("Il nome del giorno è obbligatorio.");
            return;
        }

        if (editingDayId) {
            this.editWorkoutDay(editingDayId, dayName, dayFocus);
        } else {
            this.addWorkoutDay(dayName, dayFocus);
        }
        this.closeDayEditor();
    }

    // --- Exercise CRUD and Modal Logic ---
    /**
     * Opens the modal for adding a new exercise to a day or editing an existing one.
     * @param {string} dayId - The ID of the day to add/edit the exercise for.
     * @param {number | null} exerciseIndex - The index of the exercise to edit, or null for a new exercise.
     */
    openExerciseEditor(dayId, exerciseIndex = null) {
        if (!dayId || !this.workoutData[dayId]) {
            alert("Seleziona o crea prima un giorno di allenamento valido.");
            const addExerciseContainer = document.getElementById('addExerciseContainer');
            if(addExerciseContainer) addExerciseContainer.style.display = 'none'; // Hide if no valid day
            return;
        }
        const addExerciseContainer = document.getElementById('addExerciseContainer');
        if(addExerciseContainer) addExerciseContainer.style.display = 'block';


        const modal = document.getElementById('exerciseEditorModal');
        const title = document.getElementById('exerciseEditorTitle');
        const form = document.getElementById('exerciseEditorForm');
        document.getElementById('editingExerciseDayId').value = dayId;

        if (exerciseIndex !== null && this.workoutData[dayId].exercises[exerciseIndex]) {
            title.textContent = "Modifica Esercizio";
            const exercise = this.workoutData[dayId].exercises[exerciseIndex];
            document.getElementById('exNameInput').value = exercise.name;
            document.getElementById('exSetsInput').value = exercise.sets;
            document.getElementById('exRepsInput').value = exercise.reps;
            document.getElementById('exRestInput').value = exercise.rest;
            document.getElementById('exRpeInput').value = exercise.rpe;
            document.getElementById('exNotesInput').value = exercise.notes || '';
            document.getElementById('editingExerciseIndex').value = exerciseIndex;
        } else {
            title.textContent = "Aggiungi Nuovo Esercizio";
            form.reset();
            document.getElementById('editingExerciseIndex').value = '';
        }
        modal.style.display = 'flex';
    }

    closeExerciseEditor() {
        document.getElementById('exerciseEditorModal').style.display = 'none';
        document.getElementById('exerciseEditorForm').reset();
    }

    handleExerciseEditorSubmit(event) {
        event.preventDefault();
        const dayId = document.getElementById('editingExerciseDayId').value;
        const exerciseIndex = document.getElementById('editingExerciseIndex').value;

        const exerciseData = {
            name: document.getElementById('exNameInput').value.trim(),
            sets: parseInt(document.getElementById('exSetsInput').value) || 3,
            reps: document.getElementById('exRepsInput').value.trim() || '8-12',
            rest: parseInt(document.getElementById('exRestInput').value) || 60,
            rpe: document.getElementById('exRpeInput').value.trim() || '8',
            notes: document.getElementById('exNotesInput').value.trim()
        };

        if (!exerciseData.name) {
            alert("Il nome dell'esercizio è obbligatorio.");
            return;
        }

        if (exerciseIndex !== '') {
            this.updateExercise(dayId, parseInt(exerciseIndex), exerciseData);
        } else {
            this.addExercise(dayId, exerciseData);
        }
        this.closeExerciseEditor();
    }

    addExercise(dayId, exerciseData) {
        if (!this.workoutData[dayId]) {
            console.error(`Day ID ${dayId} not found for adding exercise.`);
            return;
        }
        if (!this.workoutData[dayId].exercises) {
            this.workoutData[dayId].exercises = [];
        }
        this.workoutData[dayId].exercises.push(exerciseData);
        this.saveWorkoutData();
        this.renderWorkout(this.sessionData.active);
        console.log(`Added new exercise to day ${dayId}:`, exerciseData);
    }

    updateExercise(dayId, exerciseIndex, newExerciseData) {
        if (!this.workoutData[dayId] || !this.workoutData[dayId].exercises[exerciseIndex]) {
            console.error(`Exercise at index ${exerciseIndex} for day ID ${dayId} not found.`);
            return;
        }
        this.workoutData[dayId].exercises[exerciseIndex] = newExerciseData;
        this.saveWorkoutData();
        this.renderWorkout(this.sessionData.active);
        console.log(`Updated exercise ${exerciseIndex} in day ${dayId}:`, newExerciseData);
    }

    deleteExercise(dayId, exerciseIndex) {
        if (!this.workoutData[dayId] || !this.workoutData[dayId].exercises[exerciseIndex]) {
            console.error(`Exercise at index ${exerciseIndex} for day ID ${dayId} not found for deletion.`);
            return;
        }

        const exerciseName = this.workoutData[dayId].exercises[exerciseIndex].name;
        if (!confirm(`Sei sicuro di voler eliminare l'esercizio "${exerciseName}"?`)) {
            return;
        }

        this.workoutData[dayId].exercises.splice(exerciseIndex, 1);
        this.saveWorkoutData();
        this.renderWorkout(this.sessionData.active);
        console.log(`Deleted exercise ${exerciseIndex} from day ${dayId}`);
    }


    addWorkoutDay(name, focus) {
        let nextDayNum = 1;
        const dayKeys = Object.keys(this.workoutData);
        while (dayKeys.includes(`day${nextDayNum}`)) {
            nextDayNum++;
        }
        const newDayId = `day${nextDayNum}`;

        this.workoutData[newDayId] = {
            name: name,
            focus: focus || "",
            exercises: []
        };
        this.saveWorkoutData();
        this.currentDay = newDayId;
        this.updateDaySelector();
        this.renderWorkout(this.sessionData.active);
        console.log(`Added new day: ${newDayId} - ${name}`);
    }

    editWorkoutDay(dayId, newName, newFocus) {
        if (!this.workoutData[dayId]) {
            console.error(`Day ID ${dayId} not found for editing.`);
            return;
        }
        this.workoutData[dayId].name = newName;
        this.workoutData[dayId].focus = newFocus || "";
        this.saveWorkoutData();
        this.updateDaySelector();

        if (this.currentDay === dayId) {
            this.renderWorkoutHeader();
        }
        console.log(`Edited day: ${dayId} to ${newName}`);
    }

    deleteWorkoutDay(dayId) {
        if (!dayId || !this.workoutData[dayId]) {
            alert("Nessun giorno selezionato o giorno non valido per l'eliminazione.");
            console.error(`Day ID ${dayId} not found for deletion.`);
            return;
        }

        if (!confirm(`Sei sicuro di voler eliminare il giorno "${this.workoutData[dayId].name}" e tutti i suoi esercizi?`)) {
            return;
        }

        delete this.workoutData[dayId];
        this.saveWorkoutData();

        const remainingDayIds = Object.keys(this.workoutData);
        if (this.currentDay === dayId) {
            this.currentDay = remainingDayIds.length > 0 ? remainingDayIds[0] : null;
        }

        this.updateDaySelector();
        this.renderWorkout(this.sessionData.active);

        console.log(`Deleted day: ${dayId}`);
         if (!this.currentDay) {
            document.getElementById('addExerciseContainer').style.display = 'none';
        } else {
            document.getElementById('addExerciseContainer').style.display = 'block';
        }
    }


    switchSection(sectionName) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}-section`).classList.add('active');

        document.querySelectorAll('.tab-item').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        this.currentSection = sectionName;
    }

    renderWorkout(isSessionActive = false) {
        const addExerciseContainer = document.getElementById('addExerciseContainer');
        const startWorkoutBtn = document.getElementById('startWorkoutSessionBtn');


        if (!this.currentDay || !this.workoutData[this.currentDay]) {
            document.getElementById('workoutTitle').textContent = "Nessun Allenamento";
            document.getElementById('workoutFocus').textContent = "Aggiungi o seleziona un giorno.";
            document.getElementById('exercisesList').innerHTML = '<p class="no-data">Nessun giorno selezionato.</p>';
            if(addExerciseContainer) addExerciseContainer.style.display = 'none';
            if(startWorkoutBtn) startWorkoutBtn.disabled = true;
            this.updateWorkoutPreview(); // Update home preview to reflect no day selected
            return;
        }

        if(startWorkoutBtn) startWorkoutBtn.disabled = false;
        if(addExerciseContainer) addExerciseContainer.style.display = isSessionActive ? 'none' : 'block';


        const workout = this.workoutData[this.currentDay];
        this.renderWorkoutHeader();

        const exercisesList = document.getElementById('exercisesList');
        exercisesList.innerHTML = '';

        if (workout.exercises && workout.exercises.length > 0) {
            workout.exercises.forEach((exercise, index) => {
                const exerciseCard = this.createExerciseCard(exercise, index, isSessionActive);
                exercisesList.appendChild(exerciseCard);
            });
             if(startWorkoutBtn) startWorkoutBtn.disabled = isSessionActive; // Disable start if session active
        } else {
            exercisesList.innerHTML = '<p class="no-data">Nessun esercizio in questo giorno. Aggiungine uno!</p>';
            if(startWorkoutBtn) startWorkoutBtn.disabled = true; // Disable start if no exercises
        }

        document.querySelectorAll('.exercise-controls').forEach(controls => {
            controls.style.display = isSessionActive ? 'flex' : 'none';
        });
         // Disable CRUD buttons for exercises if session is active
        document.querySelectorAll('.btn-edit-exercise, .btn-delete-exercise').forEach(btn => {
            btn.disabled = isSessionActive;
        });

        this.updateWorkoutPreview();
    }

    createExerciseCard(exercise, index, isSessionActive) {
        const card = document.createElement('div');
        card.className = 'exercise-card-v2';
        
        const sessionExerciseData = (this.sessionData && this.sessionData.active && this.sessionData.exercises && this.sessionData.exercises[index.toString()])
                                    ? this.sessionData.exercises[index.toString()].sets
                                    : [];

        card.innerHTML = `
            <div class="exercise-header">
                <h3 class="exercise-name">${exercise.name}</h3>
                <div class="exercise-actions">
                    <button class="btn-icon btn-edit-exercise" onclick="fitTracker.openExerciseEditor('${this.currentDay}', ${index})" aria-label="Modifica Esercizio" ${isSessionActive ? 'disabled' : ''}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    </button>
                    <button class="btn-icon btn-delete-exercise" onclick="fitTracker.deleteExercise('${this.currentDay}', ${index})" aria-label="Elimina Esercizio" ${isSessionActive ? 'disabled' : ''}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            </div>
            
            <div class="exercise-details-grid">
                <div class="detail-item">
                    <span class="detail-label">Serie</span>
                    <span class="detail-value" id="sets-planned-${this.currentDay}-${index}">${exercise.sets}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Ripetizioni</span>
                    <span class="detail-value" id="reps-planned-${this.currentDay}-${index}">${exercise.reps}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Riposo</span>
                    <span class="detail-value">
                        <svg class="detail-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        ${this.formatTime(exercise.rest)}
                    </span>
                </div>
                 <div class="detail-item">
                    <span class="detail-label">RPE</span>
                    <span class="detail-value">${exercise.rpe || '-'}</span>
                </div>
            </div>
            
            ${exercise.notes ? `<div class="exercise-notes">${exercise.notes}</div>` : ''}
            
            <div class="exercise-sets-tracking" id="sets-tracking-${this.currentDay}-${index}" style="display: ${isSessionActive ? 'flex' : 'none'}; flex-direction: column; gap: var(--spacing-xs);">
                ${this.renderSetTrackers(exercise, index, isSessionActive, sessionExerciseData)}
            </div>

            <div class="exercise-controls" style="display: ${isSessionActive ? 'flex' : 'none'};">
                <button class="btn btn--secondary btn--sm" onclick="fitTracker.addSet('${this.currentDay}', ${index})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Aggiungi Set
                </button>
            </div>
        `;
        return card;
    }

    renderSetTrackers(exercise, exerciseIndex, isSessionActive = false, sessionSets = []) {
        let html = '';
        const numPlannedSets = parseInt(exercise.sets) || 0;
        const numActualSets = sessionSets.length;
        const numSetsToRender = Math.max(numPlannedSets, numActualSets);

        for (let i = 0; i < numSetsToRender; i++) {
            const setData = sessionSets[i] || {};
            const weightValue = setData.weight || '';
            const repsValue = setData.reps || '';
            const isCompleted = setData.completed || false;

            html += `
                <div class="set-tracker-item ${isCompleted ? 'completed' : ''}" id="set-${this.currentDay}-${exerciseIndex}-${i}">
                    <span class="set-number">Set ${i + 1}</span>
                    <div class="weight-input-wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5C9.24 5 7 7.24 7 10v5h10v-5C17 7.24 14.76 5 12 5z"></path><path d="M20.54 15H3.46"></path><path d="M15.23 15.23C13.43 17.03 10.57 17.03 8.77 15.23"></path><path d="M12 22V10"></path><path d="M7 10V7a5 5 0 0 1 10 0v3"></path></svg>
                        <input type="number" class="weight-input set-weight-input" placeholder="Peso" value="${weightValue}"
                               id="weight-${this.currentDay}-${exerciseIndex}-${i}" min="0" step="0.25" ${!isSessionActive ? 'disabled' : ''} oninput="fitTracker.saveSetDataOnInput('${this.currentDay}', ${exerciseIndex}, ${i})">
                        <span class="weight-unit">kg</span>
                    </div>
                    <div class="reps-input-wrapper">
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M3 12h18"></path><path d="M3 18h18"></path></svg>
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

    addSet(dayId, exerciseIndex) {
        if (!this.sessionData.active) {
            alert("Devi prima iniziare una sessione di allenamento per aggiungere set.");
            return;
        }
        const exercise = this.workoutData[dayId].exercises[exerciseIndex];
        const setsTrackingDiv = document.getElementById(`sets-tracking-${dayId}-${exerciseIndex}`);

        // Troviamo il numero di set attualmente visualizzati per questo esercizio
        const currentDisplayedSets = setsTrackingDiv.querySelectorAll('.set-tracker-item').length;
        const newSetIndex = currentDisplayedSets; // L'indice del nuovo set sarà il conteggio attuale

        // Aggiungere il nuovo set a sessionData prima di renderizzare
        const exerciseKey = exerciseIndex.toString();
        if (!this.sessionData.exercises[exerciseKey]) {
            this.sessionData.exercises[exerciseKey] = {
                name: exercise.name,
                sets: []
            };
        }
        // Assicura che l'array sets sia abbastanza lungo
        while (this.sessionData.exercises[exerciseKey].sets.length <= newSetIndex) {
            this.sessionData.exercises[exerciseKey].sets.push({ weight: '', reps: '', completed: false });
        }
        // Non è necessario modificare exercise.sets in workoutData per i set aggiunti dinamicamente durante la sessione

        // Ora, ri-renderizza TUTTI i set tracker per questo esercizio, usando i dati aggiornati da sessionData
        // (o i dati di default se non ci sono ancora dati di sessione per questo set specifico)
        const sessionSets = this.sessionData.exercises[exerciseKey] ? this.sessionData.exercises[exerciseKey].sets : [];
        setsTrackingDiv.innerHTML = this.renderSetTrackers(exercise, exerciseIndex, true, sessionSets);

        // Aggiorna il contatore delle serie visualizzato se il design lo prevede
        const setsPlannedElement = document.getElementById(`sets-planned-${dayId}-${exerciseIndex}`);
        if (setsPlannedElement) {
             // Mostra il numero maggiore tra i set pianificati e quelli tracciati
            setsPlannedElement.textContent = Math.max(parseInt(exercise.sets) || 0, newSetIndex + 1);
        }
    }

    saveSetDataOnInput(dayId, exerciseIndex, setIndex) {
        if (!this.sessionData.active) return;
        const weightInput = document.getElementById(`weight-${dayId}-${exerciseIndex}-${setIndex}`);
        const repsInput = document.getElementById(`reps-${dayId}-${exerciseIndex}-${setIndex}`);
        this.saveSetData(dayId, exerciseIndex, setIndex, weightInput.value, repsInput.value, null);
    }

    toggleSetComplete(dayId, exerciseIndex, setIndex) {
        if (!this.sessionData.active) return;

        const setItem = document.getElementById(`set-${dayId}-${exerciseIndex}-${setIndex}`);
        const isCompleted = setItem.classList.toggle('completed');
        const weightInput = document.getElementById(`weight-${dayId}-${exerciseIndex}-${setIndex}`);
        const repsInput = document.getElementById(`reps-${dayId}-${exerciseIndex}-${setIndex}`);

        this.saveSetData(dayId, exerciseIndex, setIndex, weightInput.value, repsInput.value, isCompleted);

        if (isCompleted) {
            const currentExercise = this.workoutData[dayId].exercises[exerciseIndex];
            if (currentExercise && currentExercise.rest > 0) {
                this.startRestTimer(currentExercise.rest);
            }
        }
    }

    saveSetData(dayId, exerciseIndex, setIndex, weight, reps, completedStatus) {
        if (!this.sessionData || !this.sessionData.active) return;

        const exerciseKey = exerciseIndex.toString();
        if (!this.sessionData.exercises[exerciseKey]) {
            this.sessionData.exercises[exerciseKey] = {
                name: this.workoutData[dayId].exercises[exerciseIndex].name,
                sets: []
            };
        }
        while (this.sessionData.exercises[exerciseKey].sets.length <= setIndex) {
            this.sessionData.exercises[exerciseKey].sets.push({ weight: '', reps: '', completed: false });
        }

        const currentSetData = this.sessionData.exercises[exerciseKey].sets[setIndex];
        currentSetData.weight = weight !== undefined ? weight : currentSetData.weight;
        currentSetData.reps = reps !== undefined ? reps : currentSetData.reps;
        if (completedStatus !== null) {
            currentSetData.completed = completedStatus;
        }
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
        if (!this.currentDay || !this.workoutData[this.currentDay] || !this.workoutData[this.currentDay].exercises.length === 0) {
            alert("Nessun esercizio in questa scheda per iniziare l'allenamento. Aggiungi prima degli esercizi.");
            return;
        }
        this.sessionData = {
            active: true,
            currentDay: this.currentDay,
            startTime: new Date(),
            exercises: {}
        };

        document.getElementById('startWorkoutSessionBtn').style.display = 'none';
        document.getElementById('endWorkoutSessionBtn').style.display = 'flex';
        document.getElementById('daySelector').disabled = true;
        document.getElementById('btnAddNewDay').disabled = true;
        document.getElementById('btnEditDay').disabled = true;
        document.getElementById('btnDeleteDay').disabled = true;
        document.getElementById('btnAddNewExerciseToDay').style.display = 'none';


        this.renderWorkout(true);
        console.log("Workout session started for day:", this.currentDay);
    }

    endWorkoutSession() {
        if (!this.sessionData.active) return;

        const endTime = new Date();
        const durationMs = endTime - (this.sessionData.startTime || endTime);

        console.log("Workout session ended. Duration:", durationMs, "Data:", this.sessionData);

        this.userData.totalWorkouts = (this.userData.totalWorkouts || 0) + 1;

        const today = new Date().toISOString().split('T')[0];
        if (!this.userData.workoutDates.includes(today)) {
            this.userData.workoutDates.push(today);
        }
        this.updateStreak();

        if (!this.userData.workoutLogs) {
            this.userData.workoutLogs = [];
        }
        this.userData.workoutLogs.push({
            date: this.sessionData.startTime ? this.sessionData.startTime.toISOString().split('T')[0] : today,
            day: this.sessionData.currentDay,
            workoutName: this.workoutData[this.sessionData.currentDay] ? this.workoutData[this.sessionData.currentDay].name : 'Allenamento Sconosciuto',
            startTime: this.sessionData.startTime ? this.sessionData.startTime.toISOString() : null,
            endTime: endTime.toISOString(),
            durationMs: durationMs,
            exercises: JSON.parse(JSON.stringify(this.sessionData.exercises))
        });


        this.saveUserData();
        this.updateHomeStats();
        this.renderProgress();

        this.sessionData = { active: false, currentDay: null, startTime: null, exercises: {} };
        document.getElementById('startWorkoutSessionBtn').style.display = 'flex';
        document.getElementById('endWorkoutSessionBtn').style.display = 'none';
        document.getElementById('daySelector').disabled = false;
        document.getElementById('btnAddNewDay').disabled = false;
        document.getElementById('btnEditDay').disabled = false;
        document.getElementById('btnDeleteDay').disabled = false;
        document.getElementById('btnAddNewExerciseToDay').style.display = 'block';

        this.renderWorkout(false);

        this.switchSection('progress');
    }

    // --- Service Worker Communication for Timer ---
    postMessageToSW(message) {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage(message);
        } else {
            // console.warn('[App] Service Worker not active or not controlling the page. Cannot send message:', message);
        }
    }

    setupSWListener() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', event => {
                if (event.data && event.data.type === 'TIMER_UPDATE') {
                    if (document.visibilityState === 'visible') {
                        if (!this.timer.isRunning && event.data.remaining > 0) {
                            this.timer.duration = event.data.duration || event.data.remaining;
                            this.timer.remaining = event.data.remaining;
                            this.updateTimerDisplay();
                            this.updateTimerCircle();
                        }
                    }
                    const newTitle = event.data.remaining > 0 ?
                                     `${this.formatTime(event.data.remaining)} - FitTracker` :
                                     'FitTracker Pro';
                    if (document.title !== newTitle) {
                        document.title = newTitle;
                    }
                }
            });
             if (navigator.serviceWorker.controller) {
                this.postMessageToSW({ type: 'REQUEST_TIMER_STATUS' });
            } else {
                navigator.serviceWorker.ready.then(registration => {
                    if (registration.active) {
                         this.postMessageToSW({ type: 'REQUEST_TIMER_STATUS' });
                    }
                });
            }
        }
    }


    toggleTimer() {
        if (this.timer.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        if (this.timer.remaining <= 0) {
            if(this.timer.duration <= 0) {
                if(this.timer.duration === 0 && document.getElementById('customMinutes') && document.getElementById('customSeconds')) {
                    const minutes = parseInt(document.getElementById('customMinutes').value) || 0;
                    const seconds = parseInt(document.getElementById('customSeconds').value) || 0;
                    this.timer.duration = (minutes * 60) + seconds;
                    this.timer.remaining = this.timer.duration;
                }
                if(this.timer.duration <= 0) return;
            } else {
                 this.timer.remaining = this.timer.duration;
            }
        }
        
        this.timer.isRunning = true;
        document.getElementById('timerPlayPause').innerHTML = '<span class="timer-icon">⏸</span>';
        this.postMessageToSW({ type: 'START_TIMER', duration: this.timer.remaining });
        
        if (this.timer.appInterval) clearInterval(this.timer.appInterval);
        this.timer.appInterval = setInterval(() => {
            this.timer.remaining--;
            this.updateTimerDisplay();
            this.updateTimerCircle();
            
            if (this.timer.remaining <= 0) {
                this.completeTimer(true);
            }
        }, 1000);
    }

    pauseTimer() {
        this.timer.isRunning = false;
        if(this.timer.appInterval) clearInterval(this.timer.appInterval);
        this.timer.appInterval = null;
        document.getElementById('timerPlayPause').innerHTML = '<span class="timer-icon">⏵</span>';
        this.postMessageToSW({ type: 'STOP_TIMER' });
        document.title = 'FitTracker Pro';
    }

    resetTimer() {
        this.pauseTimer();
        this.timer.remaining = this.timer.duration;
        this.updateTimerDisplay();
        this.updateTimerCircle();
    }

    completeTimer(isAppCompletion = false) {
        if(this.timer.appInterval) clearInterval(this.timer.appInterval);
        this.timer.appInterval = null;
        this.timer.isRunning = false;
        this.timer.remaining = 0;

        document.getElementById('timerPlayPause').innerHTML = '<span class="timer-icon">⏵</span>';
        this.updateTimerDisplay();
        this.updateTimerCircle();
        
        if (isAppCompletion) {
            this.postMessageToSW({ type: 'STOP_TIMER' });
        }

        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
        
        this.playNotificationSound();
        
        if (document.visibilityState === 'visible') {
            // alert('Timer completato! 🎉'); // Commentato per evitare alert durante i test automatici
        }
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
        const circumference = 2 * Math.PI * 90;
        const progress = this.timer.duration > 0 ? 
            (this.timer.duration - this.timer.remaining) / this.timer.duration : 0;
        const offset = circumference - (progress * circumference);
        circle.style.strokeDashoffset = offset;
    }

    playNotificationSound() {
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
            // console.log('Audio not supported');
        }
    }

    updateWorkoutPreview() {
        if (!this.currentDay || !this.workoutData[this.currentDay]) {
            document.getElementById('workoutPreview').innerHTML = `<h4>Nessun Giorno Selezionato</h4><p>Seleziona un giorno dall'area Allenamento.</p>`;
            document.getElementById('nextWorkoutDay').textContent = 'N/A';
            return;
        };
        const workout = this.workoutData[this.currentDay];
        if (!workout) return; // Should be caught by above, but defensive

        document.getElementById('workoutPreview').innerHTML = `
            <h4>${workout.name}</h4>
            <p>${workout.exercises.length} esercizi • ${workout.focus}</p>
        `;

        const dayKeyDisplay = this.currentDay.startsWith('day') ? `Giorno ${this.currentDay.replace('day','')}` : this.workoutData[this.currentDay].name;
        document.getElementById('nextWorkoutDay').textContent = dayKeyDisplay;
    }

    loadUserData() {
        try {
            const data = JSON.parse(localStorage.getItem('fitTrackerUser') || '{}'); // Changed key for clarity
            this.userData = {
                totalWorkouts: 0,
                streakDays: 0,
                bestStreak: 0,
                lastWorkout: null,
                workoutDates: [], // Array of YYYY-MM-DD strings
                workoutLogs: [], // Array of detailed workout session objects
                // weights: {}, // Deprecated, individual exercise weights are in workoutLogs
                ...data
            };
        } catch (e) {
            this.userData = {
                totalWorkouts: 0,
                streakDays: 0,
                bestStreak: 0,
                lastWorkout: null,
                workoutDates: [],
                workoutLogs: [],
            };
        }
    }

    saveUserData() { // Removed key, value params as we save the whole object now
        if (!this.userData) this.loadUserData();
        try {
            localStorage.setItem('fitTrackerUser', JSON.stringify(this.userData));
        } catch (e) {
            console.error('Failed to save user data:', e);
        }
    }

    updateHomeStats() {
        if (!this.userData) this.loadUserData();
        
        document.getElementById('streakDays').textContent = this.userData.streakDays || 0;
        document.getElementById('totalWorkouts').textContent = this.userData.totalWorkouts || 0;
        
        const thisWeek = this.getThisWeekWorkouts();
        document.getElementById('thisWeek').textContent = thisWeek;
    }

    getThisWeekWorkouts() {
        if (!this.userData.workoutDates || this.userData.workoutDates.length === 0) return 0;
        
        const now = new Date();
        const startOfWeek = new Date(now);
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startOfWeek.setDate(now.getDate() + diff);
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

        if (!lastLog || !lastLog.exercises || Object.keys(lastLog.exercises).length === 0) {
            recentWeightsContainer.innerHTML = '<p class="no-data">Nessun dato dall\'ultimo allenamento.</p>';
            return;
        }

        let html = '<ul class="stats-list">';
        for (const exerciseId in lastLog.exercises) {
            const exerciseLog = lastLog.exercises[exerciseId];
            html += `<li class="stat-item"><span>${exerciseLog.name}</span></li>`;
            if (exerciseLog.sets && exerciseLog.sets.length > 0) {
                exerciseLog.sets.forEach((set, index) => {
                    if (set.completed) {
                        html += `<li class="log-set-item" style="padding-left: var(--spacing-lg);">Set ${index + 1}: ${set.weight || 'N/A'} kg x ${set.reps || 'N/A'} reps</li>`;
                    }
                });
            }
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
        const logsToShow = this.userData.workoutLogs.slice().reverse().slice(0, 20);

        logsToShow.forEach(log => {
            const logDate = new Date(log.date);
            const formattedDate = logDate.toLocaleDateString('it-IT', { year: 'numeric', month: 'short', day: 'numeric' });
            const workoutDisplayName = log.workoutName || `Allenamento del ${formattedDate}`;


            html += `
                <div class="log-entry">
                    <div class="log-entry-header">
                        <h4>${workoutDisplayName}</h4>
                        <span class="date">${formattedDate}</span>
                    </div>
            `;
            if (log.exercises && Object.keys(log.exercises).length > 0) {
                for (const exerciseId in log.exercises) {
                    const ex = log.exercises[exerciseId];
                    html += `<div class="log-exercise-item"><strong>${ex.name}</strong>:`;
                    if (ex.sets && ex.sets.length > 0) {
                        ex.sets.forEach((set, index) => {
                            if (set.completed) {
                                html += `<div class="log-set-item">Set ${index + 1}: ${set.weight || 'N/A'} kg x ${set.reps || 'N/A'} reps</div>`;
                            }
                        });
                    }
                    html += `</div>`;
                }
            } else {
                 html += `<p class="no-data" style="font-size:12px; margin-left:var(--spacing-md);">Nessun dettaglio esercizio registrato.</p>`;
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
        const dayOfWeek = today.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startOfWeek.setDate(today.getDate() + diff);
        startOfWeek.setHours(0,0,0,0);
        
        const days = ['L', 'M', 'M', 'G', 'V', 'S', 'D']; // Start week with Monday
        calendar.innerHTML = '';
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            
            const dayItem = document.createElement('div');
            dayItem.className = 'day-item';
            
            const isToday = date.toDateString() === today.toDateString();
            const dateStringForComparison = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            const hasWorkout = this.userData.workoutDates && 
                this.userData.workoutDates.includes(dateStringForComparison);
            
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
        
        document.getElementById('totalWorkoutsProgress').textContent = this.userData.totalWorkouts || 0;
        document.getElementById('currentStreakProgress').textContent = `${this.userData.streakDays || 0} giorni`;
        document.getElementById('bestStreakProgress').textContent = `${this.userData.bestStreak || 0} giorni`;
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (minutes === 0) {
            return `${remainingSeconds}"`;
        }
        return remainingSeconds === 0 ? `${minutes}'` : `${minutes}'${remainingSeconds}"`;
    }

    updateStreak() {
        if (!this.userData.workoutDates || this.userData.workoutDates.length === 0) {
            this.userData.streakDays = 0;
            return;
        };
        
        const dates = this.userData.workoutDates
            .map(d => new Date(d))
            .sort((a, b) => b - a);
        
        let currentStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (dates[0] >= yesterday) {
            currentStreak = 1;
            for (let i = 0; i < dates.length - 1; i++) {
                const currentDate = dates[i];
                const previousDate = dates[i+1];
                
                const expectedPrevious = new Date(currentDate);
                expectedPrevious.setDate(currentDate.getDate() - 1);

                if (previousDate.getTime() === expectedPrevious.getTime()) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }
        
        this.userData.streakDays = currentStreak;
        this.userData.bestStreak = Math.max(this.userData.bestStreak || 0, currentStreak);
    }
}

// Initialize the app
const fitTracker = new FitTracker();

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('Service Worker registered successfully with scope:', registration.scope);
            })
            .catch((registrationError) => {
                console.log('Service Worker registration failed:', registrationError);
            });
    });
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FitTracker;
}; // Added semicolon

// Ensure there's a newline at the end of the file
