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
            "day4": { // Mantengo day4 e day5 come da originale, ma la logica CRUD permetterà di modificarli
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
        this.workoutData = this.loadWorkoutData(); // Carica da localStorage o usa default
        this.currentDay = Object.keys(this.workoutData)[0] || null; // Imposta il primo giorno come corrente


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
                    // console.log("Loaded workout data from localStorage:", parsedData); // Debug
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
        // console.log("No workout data in localStorage, using default."); // Debug
        return JSON.parse(JSON.stringify(this.defaultWorkoutData));
    }

    /**
     * Saves the current state of this.workoutData to localStorage.
     */
    saveWorkoutData() {
        try {
            localStorage.setItem('fitTrackerWorkoutData', JSON.stringify(this.workoutData));
            // console.log("Workout data saved to localStorage."); // Debug
        } catch (error) {
            console.error("Error saving workout data to localStorage:", error);
        }
    }

    // --- Initialization and UI Setup ---
    init() {
        this.updateCurrentDate();
        this.setupEventListeners();
        this.loadUserData(); // Loads user stats like streak, total workouts, logs etc.
        // this.workoutData is loaded in constructor
        this.updateDaySelector(); // Populate daySelector based on loaded/default workoutData
        this.updateHomeStats();
        // currentDay is set in constructor or after add/delete. renderWorkout uses it.
        this.renderWorkout();
        this.renderProgress();
        this.setupTimer();
        this.setupSWListener(); // Initialize SW listener
    }

    updateDaySelector() {
        const daySelector = document.getElementById('daySelector');
        daySelector.innerHTML = ''; // Clear existing options

        const dayIds = Object.keys(this.workoutData);

        if (dayIds.length === 0) {
            // Handle case with no workout days
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "Nessun giorno";
            daySelector.appendChild(option);
            daySelector.disabled = true;
            // Disable management buttons if no days
            document.getElementById('btnEditDay').disabled = true;
            document.getElementById('btnDeleteDay').disabled = true;
            return;
        } else {
            daySelector.disabled = false;
            document.getElementById('btnEditDay').disabled = false;
            document.getElementById('btnDeleteDay').disabled = false;
        }

        dayIds.forEach(dayId => {
            const dayData = this.workoutData[dayId];
            const option = document.createElement('option');
            option.value = dayId;
            // Use the 'name' for display, fallback to dayId if name is missing (should not happen with new structure)
            option.textContent = dayData.name || dayId.replace('day', 'Giorno ');
            daySelector.appendChild(option);
        });

        // Set the selected option based on this.currentDay
        if (this.currentDay && this.workoutData[this.currentDay]) {
            daySelector.value = this.currentDay;
        } else if (dayIds.length > 0) {
            // If currentDay is invalid or null, select the first available day
            this.currentDay = dayIds[0];
            daySelector.value = this.currentDay;
        } else {
            this.currentDay = null; // No days available
        }

        // After updating selector, if a valid day is selected, render its workout details
        if (this.currentDay) {
            this.renderWorkoutHeader(); // Update title/focus specifically
        }
    }

    renderWorkoutHeader() { // New function to specifically update header info
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

        // Day Management Modal Listeners
        document.getElementById('btnAddNewDay').addEventListener('click', () => this.openDayEditor());
        document.getElementById('btnEditDay').addEventListener('click', () => this.openDayEditor(true));
        document.getElementById('btnDeleteDay').addEventListener('click', () => this.deleteWorkoutDay(this.currentDay));
        document.getElementById('closeDayEditorModal').addEventListener('click', () => this.closeDayEditor());
        document.getElementById('cancelDayEditor').addEventListener('click', () => this.closeDayEditor());
        document.getElementById('dayEditorForm').addEventListener('submit', (e) => this.handleDayEditorSubmit(e));

        // Exercise Management Listeners
        document.getElementById('btnAddNewExercise').addEventListener('click', () => this.openExerciseEditor(this.currentDay));
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
            form.reset(); // Clear form fields
            editingDayIdInput.value = ''; // No ID when adding new
        }
        modal.style.display = 'flex'; // Use flex to center it as per new CSS
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
            return;
        }

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
            form.reset(); // Clear form for new exercise
            document.getElementById('editingExerciseIndex').value = ''; // Clear editing index
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
            this.workoutData[dayId].exercises = []; // Initialize if undefined
        }
        this.workoutData[dayId].exercises.push(exerciseData);
        this.saveWorkoutData();
        this.renderWorkout(); // Re-render the current day's workout to show the new exercise
        console.log(`Added new exercise to day ${dayId}:`, exerciseData);
    }

    updateExercise(dayId, exerciseIndex, newExerciseData) {
        if (!this.workoutData[dayId] || !this.workoutData[dayId].exercises[exerciseIndex]) {
            console.error(`Exercise at index ${exerciseIndex} for day ID ${dayId} not found.`);
            return;
        }
        this.workoutData[dayId].exercises[exerciseIndex] = newExerciseData;
        this.saveWorkoutData();
        this.renderWorkout(); // Re-render to show updated exercise
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
        this.renderWorkout(); // Re-render the workout list
        console.log(`Deleted exercise ${exerciseIndex} from day ${dayId}`);
    }


    addWorkoutDay(name, focus) {
        // Find the next available day number if current IDs are like "dayX"
        let nextDayNum = 1;
        const dayKeys = Object.keys(this.workoutData);
        while (dayKeys.includes(`day${nextDayNum}`)) {
            nextDayNum++;
        }
        const newDayId = `day${nextDayNum}`;

        this.workoutData[newDayId] = {
            name: name,
            focus: focus || "", // Ensure focus is at least an empty string
            exercises: []
        };
        this.saveWorkoutData();
        this.currentDay = newDayId; // Select the new day
        this.updateDaySelector(); // Update the <select>
        this.renderWorkout(); // Re-render the workout section for the new day
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
        this.updateDaySelector(); // Update display names in selector if needed

        // If the edited day is the current day, re-render its header
        if (this.currentDay === dayId) {
            document.getElementById('workoutTitle').textContent = newName;
            document.getElementById('workoutFocus').textContent = newFocus || "";
            // No need to call renderWorkout() fully unless exercises changed,
            // but if name/focus in selector text needs update, updateDaySelector handles it.
        }
        console.log(`Edited day: ${dayId} to ${newName}`);
    }

    deleteWorkoutDay(dayId) {
        if (!dayId || !this.workoutData[dayId]) {
            alert("Nessun giorno selezionato o giorno non valido per l'eliminazione.");
            console.error(`Day ID ${dayId} not found for deletion.`);
            return;
        }

        // Confirmation dialog
        if (!confirm(`Sei sicuro di voler eliminare il giorno "${this.workoutData[dayId].name}" e tutti i suoi esercizi?`)) {
            return;
        }

        delete this.workoutData[dayId];
        this.saveWorkoutData();

        // Determine next currentDay
        const remainingDayIds = Object.keys(this.workoutData);
        if (this.currentDay === dayId) { // If the deleted day was the current one
            this.currentDay = remainingDayIds.length > 0 ? remainingDayIds[0] : null;
        }

        this.updateDaySelector(); // Update the <select>
        this.renderWorkout(); // Re-render the workout section

        console.log(`Deleted day: ${dayId}`);
        if (!this.currentDay) {
            // Handle UI for no days existing, e.g. clear workout display
            document.getElementById('workoutTitle').textContent = "Nessun Allenamento";
            document.getElementById('workoutFocus').textContent = "Aggiungi un nuovo giorno di allenamento.";
            document.getElementById('exercisesList').innerHTML = '<p class="no-data">Nessun esercizio. Aggiungi un giorno di allenamento.</p>';
            document.getElementById('addExerciseContainer').style.display = 'none'; // Hide "Add Exercise" button if no day is selected
        } else {
            // Ensure "Add Exercise" button is visible if a day is selected (its content will be handled by renderWorkout)
            document.getElementById('addExerciseContainer').style.display = 'block';
        }
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

        // Update day selector - value is set by updateDaySelector or change event
        // document.getElementById('daySelector').value = this.currentDay; // This is now handled by updateDaySelector

        // Render workout header (title, focus) - now handled by renderWorkoutHeader, called by updateDaySelector or on day change
        this.renderWorkoutHeader();

        // Render exercises
        const exercisesList = document.getElementById('exercisesList');
        exercisesList.innerHTML = ''; // Clear previous exercises

        if (workout.exercises && workout.exercises.length > 0) {
            workout.exercises.forEach((exercise, index) => {
                const exerciseCard = this.createExerciseCard(exercise, index, isSessionActive); // Pass isSessionActive
                exercisesList.appendChild(exerciseCard);
            });
            // Ensure "Add exercise" button container is visible if it was hidden
            document.getElementById('addExerciseContainer').style.display = 'block';
        } else {
            exercisesList.innerHTML = '<p class="no-data">Nessun esercizio in questo giorno. Aggiungine uno!</p>';
            // Still show "Add exercise" button even if list is empty
            document.getElementById('addExerciseContainer').style.display = 'block';
        }


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
                <div class="exercise-actions">
                    <button class="btn-icon btn-edit-exercise" onclick="fitTracker.openExerciseEditor('${this.currentDay}', ${index})" aria-label="Modifica Esercizio">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    </button>
                    <button class="btn-icon btn-delete-exercise" onclick="fitTracker.deleteExercise('${this.currentDay}', ${index})" aria-label="Elimina Esercizio">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
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
        const repsInput = document.getElementById(`reps-${day}-${exerciseIndex}-${setIndex}`); // Get the reps input element
        this.saveSetData(day, exerciseIndex, setIndex, weightInput.value, repsInput.value, null); // Pass repsInput.value
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

        // console.log("Session data updated:", JSON.parse(JSON.stringify(this.sessionData))); // Debug, deep copy for logging
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

    // --- Service Worker Communication for Timer ---
    postMessageToSW(message) {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage(message);
            console.log('[App] Sent message to SW:', message);
        } else {
            console.warn('[App] Service Worker not active or not controlling the page. Cannot send message:', message);
        }
    }

    setupSWListener() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', event => {
                if (event.data && event.data.type === 'TIMER_UPDATE') {
                    console.log('[App] Received TIMER_UPDATE from SW:', event.data);
                    // Only update app's timer if it's not the source of truth OR if it helps sync
                    // For now, primarily focus on updating document.title
                    if (document.visibilityState === 'visible') {
                         // If timer is running in app, it's the source. If not, SW is.
                        if (!this.timer.isRunning && event.data.remaining > 0) {
                            // SW has an active timer, page timer was not running or desynced
                            // This could happen if page was reloaded and SW had an ongoing timer
                            this.timer.duration = event.data.duration || event.data.remaining; //
                            this.timer.remaining = event.data.remaining;
                            this.updateTimerDisplay();
                            this.updateTimerCircle();
                            // Potentially start the visual timer in the app if desired
                        }
                    }
                    // Always update title if app is visible, or rely on SW notification if hidden
                    const newTitle = event.data.remaining > 0 ?
                                     `${this.formatTime(event.data.remaining)} - FitTracker` :
                                     'FitTracker Pro';
                    if (document.title !== newTitle) {
                        document.title = newTitle;
                    }
                }
            });
            // On load, request current timer status from SW
             if (navigator.serviceWorker.controller) {
                this.postMessageToSW({ type: 'REQUEST_TIMER_STATUS' });
            } else {
                // Wait for SW to be ready if it's not controller yet (e.g. first load)
                navigator.serviceWorker.ready.then(registration => {
                    if (registration.active) {
                         this.postMessageToSW({ type: 'REQUEST_TIMER_STATUS' });
                    }
                });
            }
        }
    }
    // Call setupSWListener in init
    // this.setupSWListener(); // Will be called in init method


    toggleTimer() {
        if (this.timer.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        if (this.timer.remaining <= 0) { // If starting fresh, ensure duration is set
            if(this.timer.duration <= 0) { // No preset/custom time was set
                 // Default to 1 minute if no duration set, or handle error
                // For now, let's assume setTimer was called before startTimer
                if(this.timer.duration === 0 && document.getElementById('customMinutes') && document.getElementById('customSeconds')) {
                    // Attempt to get from custom input if not set
                    const minutes = parseInt(document.getElementById('customMinutes').value) || 0;
                    const seconds = parseInt(document.getElementById('customSeconds').value) || 0;
                    this.timer.duration = (minutes * 60) + seconds;
                    this.timer.remaining = this.timer.duration;
                }
                if(this.timer.duration <= 0) return; // Still no valid duration
            } else {
                 this.timer.remaining = this.timer.duration; // Reset remaining to full duration
            }
        }
        
        this.timer.isRunning = true;
        document.getElementById('timerPlayPause').innerHTML = '<span class="timer-icon">⏸</span>';
        this.postMessageToSW({ type: 'START_TIMER', duration: this.timer.remaining }); // Use remaining as duration for SW
        
        // App's visual timer interval
        if (this.timer.appInterval) clearInterval(this.timer.appInterval); // Clear existing if any
        this.timer.appInterval = setInterval(() => {
            this.timer.remaining--;
            this.updateTimerDisplay(); // This will also update document.title if page is visible
            this.updateTimerCircle();
            
            if (this.timer.remaining <= 0) {
                this.completeTimer(true); // Pass true if completed by app timer
            }
        }, 1000);
    }

    pauseTimer() {
        this.timer.isRunning = false;
        if(this.timer.appInterval) clearInterval(this.timer.appInterval);
        this.timer.appInterval = null;
        document.getElementById('timerPlayPause').innerHTML = '<span class="timer-icon">⏵</span>';
        this.postMessageToSW({ type: 'STOP_TIMER' });
        // Update title to remove time when paused
        document.title = 'FitTracker Pro';
    }

    resetTimer() {
        this.pauseTimer(); // This will also send STOP_TIMER to SW
        this.timer.remaining = this.timer.duration;
        this.updateTimerDisplay();
        this.updateTimerCircle();
        // No need to send START_TIMER to SW here, it will be sent if user presses play again
    }

    completeTimer(isAppCompletion = false) {
        if(this.timer.appInterval) clearInterval(this.timer.appInterval);
        this.timer.appInterval = null;
        this.timer.isRunning = false; // Ensure isRunning is false
        this.timer.remaining = 0;

        document.getElementById('timerPlayPause').innerHTML = '<span class="timer-icon">⏵</span>';
        this.updateTimerDisplay(); // Updates title to FitTracker Pro
        this.updateTimerCircle();
        
        if (isAppCompletion) { // If app timer completed it, SW might still be running for a sec
            this.postMessageToSW({ type: 'STOP_TIMER' }); // Ensure SW stops
        }

        // Vibration feedback if supported
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
        
        // Audio feedback
        this.playNotificationSound();
        
        // The SW will show its own notification if app is not visible.
        // If app is visible, this alert is fine, or could be a custom in-app notification.
        if (document.visibilityState === 'visible') {
            alert('Timer completato! 🎉');
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
        navigator.serviceWorker.register('/sw.js') // Register the external sw.js file
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

[end of app.js]
