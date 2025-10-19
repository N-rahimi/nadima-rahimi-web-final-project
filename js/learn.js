// Learning functionality for Pocket Classroom - COMPLETE WITH ALL FEATURES
class LearnManager {
    constructor() {
        this.capsuleSelect = document.getElementById('learnCapsuleSelect');
        this.learningContent = document.getElementById('learningContent');
        this.selectedCapsuleId = null;
        this.currentCapsule = null;
        this.currentFlashcardIndex = 0;
        this.flashcardStatus = []; // Track known/unknown status for flashcards
        
        // Quiz properties
        this.quizQuestions = [];
        this.currentQuizIndex = 0;
        this.quizAnswers = [];
        this.quizScore = 0;
        this.quizStarted = false;
        
        // Tab management
        this.currentTab = 'resources';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCapsuleOptions();
    }

    setupEventListeners() {
        // Capsule selection
        this.capsuleSelect.addEventListener('change', (e) => this.selectCapsule(e.target.value));

        // Flashcard navigation
        document.getElementById('prevFlashcard').addEventListener('click', () => this.previousFlashcard());
        document.getElementById('nextFlashcard').addEventListener('click', () => this.nextFlashcard());
        document.getElementById('markKnown').addEventListener('click', () => this.markFlashcard(true));
        document.getElementById('markUnknown').addEventListener('click', () => this.markFlashcard(false));

        // Flashcard flip on click
        document.querySelector('.flashcard').addEventListener('click', () => this.flipFlashcard());

        // Keyboard shortcuts for flashcards and tabs
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Quiz functionality
        document.getElementById('startQuizBtn').addEventListener('click', () => this.startQuiz());
        document.getElementById('prevQuestion').addEventListener('click', () => this.previousQuestion());
        document.getElementById('nextQuestion').addEventListener('click', () => this.nextQuestion());
        document.getElementById('restartQuiz').addEventListener('click', () => this.restartQuiz());

        // Notes search
        document.getElementById('notesSearch').addEventListener('input', (e) => this.searchNotes(e.target.value));

        // Tab events
        document.getElementById('learnTabs').addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                this.currentTab = e.target.id.replace('-tab', '');
            }
        });
    }

    loadCapsuleOptions() {
        const capsules = loadIndex();
        this.capsuleSelect.innerHTML = '<option value="">Select a Capsule</option>';
        
        capsules.forEach(capsule => {
            const option = document.createElement('option');
            option.value = capsule.id;
            option.textContent = capsule.title;
            this.capsuleSelect.appendChild(option);
        });
    }

    selectCapsule(capsuleId) {
        if (!capsuleId) {
            this.clearSelection();
            return;
        }

        this.selectedCapsuleId = capsuleId;
        this.currentCapsule = loadCapsule(capsuleId);
        
        if (!this.currentCapsule) {
            alert('Error loading capsule');
            this.clearSelection();
            return;
        }

        this.learningContent.classList.remove('d-none');
        this.loadProgress();
        this.showResources();
        this.showNotes();
        this.resetFlashcards();
        this.resetQuiz();
    }

    clearSelection() {
        this.selectedCapsuleId = null;
        this.currentCapsule = null;
        this.learningContent.classList.add('d-none');
    }

    loadProgress() {
        if (!this.selectedCapsuleId) return;
        
        const progress = loadProgress(this.selectedCapsuleId);
        if (progress && progress.flashcardStatus) {
            this.flashcardStatus = progress.flashcardStatus;
        } else {
            this.flashcardStatus = [];
        }
    }

    saveProgress() {
        if (!this.selectedCapsuleId) return;
        
        const progress = {
            flashcardStatus: this.flashcardStatus,
            lastStudied: new Date().toISOString()
        };
        
        saveProgress(this.selectedCapsuleId, progress);
    }

    // NEW: Show resources
    showResources() {
        const resourcesList = document.getElementById('resourcesList');
        resourcesList.innerHTML = '';

        if (!this.currentCapsule.resources || this.currentCapsule.resources.length === 0) {
            resourcesList.innerHTML = '<p class="text-muted text-center">No resources available for this capsule.</p>';
            return;
        }

        this.currentCapsule.resources.forEach((resource, index) => {
            const resourceElement = document.createElement('div');
            resourceElement.className = 'resource-item';
            resourceElement.innerHTML = `
                <div class="d-flex align-items-center">
                    <span class="badge bg-primary me-3">${index + 1}</span>
                    <div class="flex-grow-1">
                        <a href="${this.escapeHtml(resource.url)}" target="_blank" class="resource-link">
                            <strong>${this.escapeHtml(resource.label)}</strong>
                        </a>
                        <br>
                        <small class="text-muted">${this.escapeHtml(resource.url)}</small>
                    </div>
                    <i class="bi bi-box-arrow-up-right text-muted"></i>
                </div>
            `;
            resourcesList.appendChild(resourceElement);
        });
    }

    showNotes() {
        const notesList = document.getElementById('notesList');
        notesList.innerHTML = '';

        if (!this.currentCapsule.notes || this.currentCapsule.notes.length === 0) {
            notesList.innerHTML = '<p class="text-muted text-center">No notes available for this capsule.</p>';
            return;
        }

        this.currentCapsule.notes.forEach((note, index) => {
            const noteElement = document.createElement('div');
            noteElement.className = 'card mb-3';
            noteElement.innerHTML = `
                <div class="card-body">
                    <div class="d-flex align-items-start">
                        <span class="badge bg-primary me-2 mt-1">${index + 1}</span>
                        <div class="flex-grow-1 note-content">${this.escapeHtml(note)}</div>
                    </div>
                </div>
            `;
            notesList.appendChild(noteElement);
        });
    }

    searchNotes(query) {
        const noteElements = document.querySelectorAll('.note-content');
        const searchTerm = query.toLowerCase();
        
        noteElements.forEach(element => {
            const content = element.textContent.toLowerCase();
            const card = element.closest('.card');
            
            if (content.includes(searchTerm)) {
                card.style.display = 'block';
                // Highlight matching text
                const htmlContent = this.escapeHtml(element.textContent);
                const highlighted = htmlContent.replace(
                    new RegExp(this.escapeRegex(searchTerm), 'gi'),
                    match => `<mark>${match}</mark>`
                );
                element.innerHTML = highlighted;
            } else {
                card.style.display = 'none';
            }
        });
    }

    resetFlashcards() {
        this.currentFlashcardIndex = 0;
        if (this.currentCapsule.flashcards && this.currentCapsule.flashcards.length > 0) {
            // Initialize status array if needed
            while (this.flashcardStatus.length < this.currentCapsule.flashcards.length) {
                this.flashcardStatus.push(null);
            }
            this.showFlashcard();
        } else {
            this.showNoFlashcards();
        }
    }

    showFlashcard() {
        const flashcard = this.currentCapsule.flashcards[this.currentFlashcardIndex];
        const flashcardElement = document.querySelector('.flashcard');
        
        document.getElementById('flashcardFrontText').textContent = flashcard.front;
        document.getElementById('flashcardBackText').textContent = flashcard.back;
        
        // Reset flip state
        flashcardElement.classList.remove('flipped');
        document.querySelector('.flashcard-front').classList.remove('d-none');
        document.querySelector('.flashcard-back').classList.add('d-none');

        // Update counter
        document.getElementById('flashcardCounter').textContent = 
            `${this.currentFlashcardIndex + 1}/${this.currentCapsule.flashcards.length}`;

        // Update navigation buttons
        document.getElementById('prevFlashcard').disabled = this.currentFlashcardIndex === 0;
        document.getElementById('nextFlashcard').disabled = 
            this.currentFlashcardIndex === this.currentCapsule.flashcards.length - 1;

        // Update status buttons based on current status
        const currentStatus = this.flashcardStatus[this.currentFlashcardIndex];
        this.updateStatusButtons(currentStatus);
    }

    showNoFlashcards() {
        document.getElementById('flashcardFrontText').textContent = 'No flashcards available';
        document.getElementById('flashcardBackText').textContent = 'Add flashcards in the author section';
        document.getElementById('flashcardCounter').textContent = '0/0';
        document.getElementById('prevFlashcard').disabled = true;
        document.getElementById('nextFlashcard').disabled = true;
    }

    flipFlashcard() {
        const flashcardElement = document.querySelector('.flashcard');
        const frontElement = document.querySelector('.flashcard-front');
        const backElement = document.querySelector('.flashcard-back');
        
        flashcardElement.classList.toggle('flipped');
        
        if (flashcardElement.classList.contains('flipped')) {
            frontElement.classList.add('d-none');
            backElement.classList.remove('d-none');
        } else {
            frontElement.classList.remove('d-none');
            backElement.classList.add('d-none');
        }
    }

    previousFlashcard() {
        if (this.currentFlashcardIndex > 0) {
            this.currentFlashcardIndex--;
            this.showFlashcard();
        }
    }

    nextFlashcard() {
        if (this.currentFlashcardIndex < this.currentCapsule.flashcards.length - 1) {
            this.currentFlashcardIndex++;
            this.showFlashcard();
        }
    }

    markFlashcard(known) {
        if (!this.currentCapsule.flashcards || !this.currentCapsule.flashcards[this.currentFlashcardIndex]) return;
        
        this.flashcardStatus[this.currentFlashcardIndex] = known;
        this.updateStatusButtons(known);
        this.saveProgress();
        
        // Auto-advance to next flashcard after a short delay if marked as known
        if (known && this.currentFlashcardIndex < this.currentCapsule.flashcards.length - 1) {
            setTimeout(() => {
                this.nextFlashcard();
            }, 500);
        }
    }

    updateStatusButtons(status) {
        const knownBtn = document.getElementById('markKnown');
        const unknownBtn = document.getElementById('markUnknown');
        
        if (status === true) {
            knownBtn.classList.add('active');
            unknownBtn.classList.remove('active');
        } else if (status === false) {
            knownBtn.classList.remove('active');
            unknownBtn.classList.add('active');
        } else {
            knownBtn.classList.remove('active');
            unknownBtn.classList.remove('active');
        }
    }

    // NEW: Cycle through tabs with keyboard
    cycleTabs() {
        const tabs = ['resources', 'notes', 'flashcards', 'quiz'];
        const currentIndex = tabs.indexOf(this.currentTab);
        const nextIndex = (currentIndex + 1) % tabs.length;
        const nextTab = tabs[nextIndex];
        
        this.showTab(nextTab);
    }

    showTab(tabName) {
        this.currentTab = tabName;
        const tabElement = document.querySelector(`[data-bs-target="#${tabName}-tab-pane"]`);
        if (tabElement) {
            const tab = new bootstrap.Tab(tabElement);
            tab.show();
        }
    }

    // UPDATED QUIZ METHODS WITH EXPLANATION
    startQuiz() {
        if (!this.currentCapsule.quiz || this.currentCapsule.quiz.length === 0) {
            alert('No quiz questions available for this capsule.');
            return;
        }

        this.quizQuestions = [...this.currentCapsule.quiz];
        this.currentQuizIndex = 0;
        this.quizAnswers = new Array(this.quizQuestions.length).fill(null);
        this.quizScore = 0;
        this.quizStarted = true;

        // Show quiz interface
        document.getElementById('quizStart').classList.add('d-none');
        document.getElementById('quizInProgress').classList.remove('d-none');
        document.getElementById('quizResults').classList.add('d-none');

        this.showQuestion();
    }

    showQuestion() {
        if (this.currentQuizIndex >= this.quizQuestions.length) {
            this.finishQuiz();
            return;
        }

        const question = this.quizQuestions[this.currentQuizIndex];
        
        // Update question display
        document.getElementById('quizQuestionTitle').textContent = `Question ${this.currentQuizIndex + 1}`;
        document.getElementById('quizQuestionText').textContent = question.question;
        document.getElementById('quizProgress').textContent = `${this.currentQuizIndex + 1}/${this.quizQuestions.length}`;

        // Clear and populate options
        const optionsContainer = document.getElementById('quizOptions');
        optionsContainer.innerHTML = '';

        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = `quiz-option ${this.quizAnswers[this.currentQuizIndex] === index ? 'selected' : ''}`;
            optionElement.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
            optionElement.addEventListener('click', () => this.selectAnswer(index));
            optionsContainer.appendChild(optionElement);
        });

        // Update navigation
        document.getElementById('prevQuestion').disabled = this.currentQuizIndex === 0;
        document.getElementById('nextQuestion').textContent = 
            this.currentQuizIndex === this.quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question';

        // Clear feedback and explanation
        document.getElementById('quizFeedback').classList.add('d-none');
        document.getElementById('quizExplanation').classList.add('d-none');
        document.getElementById('nextQuestion').disabled = this.quizAnswers[this.currentQuizIndex] === null;
    }

    selectAnswer(answerIndex) {
        this.quizAnswers[this.currentQuizIndex] = answerIndex;
        
        // Update visual selection
        const options = document.querySelectorAll('#quizOptions .quiz-option');
        options.forEach((option, index) => {
            option.classList.toggle('selected', index === answerIndex);
        });

        // Enable next button
        document.getElementById('nextQuestion').disabled = false;

        // Show immediate feedback if this is the last question
        if (this.currentQuizIndex === this.quizQuestions.length - 1) {
            this.showQuestionFeedback();
        }
    }

    showQuestionFeedback() {
        const question = this.quizQuestions[this.currentQuizIndex];
        const userAnswer = this.quizAnswers[this.currentQuizIndex];
        const isCorrect = userAnswer === question.correctIndex;

        const feedbackElement = document.getElementById('quizFeedback');
        const explanationElement = document.getElementById('quizExplanation');

        // Update options with correct/incorrect styling
        const options = document.querySelectorAll('#quizOptions .quiz-option');
        options.forEach((option, index) => {
            if (index === question.correctIndex) {
                option.classList.add('correct');
            } else if (index === userAnswer && !isCorrect) {
                option.classList.add('incorrect');
            }
        });

        // Show feedback
        feedbackElement.textContent = isCorrect ? 'Correct! 🎉' : 'Incorrect ❌';
        feedbackElement.className = `alert ${isCorrect ? 'alert-success' : 'alert-danger'}`;
        feedbackElement.classList.remove('d-none');

        // Show explanation if available
        if (question.explanation) {
            explanationElement.textContent = question.explanation;
            explanationElement.classList.remove('d-none');
        }
    }

    previousQuestion() {
        if (this.currentQuizIndex > 0) {
            this.currentQuizIndex--;
            this.showQuestion();
        }
    }

    nextQuestion() {
        if (this.quizAnswers[this.currentQuizIndex] === null) {
            alert('Please select an answer before continuing.');
            return;
        }

        // Show feedback for current question before moving
        this.showQuestionFeedback();

        if (this.currentQuizIndex < this.quizQuestions.length - 1) {
            setTimeout(() => {
                this.currentQuizIndex++;
                this.showQuestion();
            }, 2000);
        } else {
            setTimeout(() => {
                this.finishQuiz();
            }, 2000);
        }
    }

    finishQuiz() {
        // Calculate score
        let correctCount = 0;
        this.quizQuestions.forEach((question, index) => {
            if (this.quizAnswers[index] === question.correctIndex) {
                correctCount++;
            }
        });

        this.quizScore = Math.round((correctCount / this.quizQuestions.length) * 100);

        // Save best score
        this.saveBestScore(this.quizScore);

        // Show results
        document.getElementById('quizScore').textContent = `${this.quizScore}%`;
        document.getElementById('quizResultText').textContent = 
            `You answered ${correctCount} out of ${this.quizQuestions.length} questions correctly.`;
        document.getElementById('quizProgressBar').style.width = `${this.quizScore}%`;

        // Update UI
        document.getElementById('quizInProgress').classList.add('d-none');
        document.getElementById('quizResults').classList.remove('d-none');
    }

    saveBestScore(currentScore) {
        if (!this.selectedCapsuleId) return;
        
        const progress = loadProgress(this.selectedCapsuleId);
        const bestScore = Math.max(currentScore, progress.bestScore || 0);
        
        saveProgress(this.selectedCapsuleId, {
            ...progress,
            bestScore: bestScore
        });

        // Show celebration for new record
        if (currentScore > (progress.bestScore || 0)) {
            setTimeout(() => {
                console.log(`🎊 New record! Best score: ${currentScore}%`);
            }, 100);
        }
    }

    restartQuiz() {
        this.resetQuiz();
        this.startQuiz();
    }

    resetQuiz() {
        this.quizQuestions = [];
        this.currentQuizIndex = 0;
        this.quizAnswers = [];
        this.quizScore = 0;
        this.quizStarted = false;

        // Reset UI to start state
        document.getElementById('quizStart').classList.remove('d-none');
        document.getElementById('quizInProgress').classList.add('d-none');
        document.getElementById('quizResults').classList.add('d-none');
    }

    handleKeyboard(event) {
        if (!this.currentCapsule) return;

        switch(event.code) {
            case 'Space':
                if (this.currentTab === 'flashcards') {
                    event.preventDefault();
                    this.flipFlashcard();
                }
                break;
            case 'ArrowLeft':
                if (this.currentTab === 'flashcards') {
                    event.preventDefault();
                    this.previousFlashcard();
                }
                break;
            case 'ArrowRight':
                if (this.currentTab === 'flashcards') {
                    event.preventDefault();
                    this.nextFlashcard();
                }
                break;
            case 'KeyK':
                if (this.currentTab === 'flashcards') {
                    event.preventDefault();
                    this.markFlashcard(true);
                }
                break;
            case 'KeyU':
                if (this.currentTab === 'flashcards') {
                    event.preventDefault();
                    this.markFlashcard(false);
                }
                break;
            case 'Slash':
                event.preventDefault();
                this.cycleTabs();
                break;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    refresh() {
        this.loadCapsuleOptions();
        if (this.selectedCapsuleId) {
            this.selectCapsule(this.selectedCapsuleId);
        }
    }
}
