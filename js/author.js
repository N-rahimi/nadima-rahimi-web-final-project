// Author functionality for creating and editing capsules
class AuthorManager {
    constructor() {
        this.form = document.getElementById('capsuleForm');
        this.resourcesContainer = document.getElementById('resourcesContainer');
        this.notesContainer = document.getElementById('notesContainer');
        this.flashcardsContainer = document.getElementById('flashcardsContainer');
        this.quizContainer = document.getElementById('quizContainer');
        this.currentCapsuleId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.resetForm();
    }

    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.saveCapsule(e));

        // Add item buttons
        document.getElementById('addResourceBtn').addEventListener('click', () => this.addResource());
        document.getElementById('addNoteBtn').addEventListener('click', () => this.addNote());
        document.getElementById('addFlashcardBtn').addEventListener('click', () => this.addFlashcard());
        document.getElementById('addQuizBtn').addEventListener('click', () => this.addQuiz());

        // Cancel button
        document.getElementById('cancelEdit').addEventListener('click', () => this.resetForm());
    }

    addResource(label = '', url = '') {
        const resourceId = Date.now();
        const resourceElement = document.createElement('div');
        resourceElement.className = 'resource-item mb-2';
        resourceElement.innerHTML = `
            <div class="row g-2 align-items-end">
                <div class="col-md-5">
                    <label class="form-label">Label</label>
                    <input type="text" class="form-control resource-label" placeholder="Resource name" value="${this.escapeHtml(label)}">
                </div>
                <div class="col-md-6">
                    <label class="form-label">URL</label>
                    <input type="url" class="form-control resource-url" placeholder="https://example.com" value="${this.escapeHtml(url)}">
                </div>
                <div class="col-md-1">
                    <button type="button" class="btn btn-sm btn-outline-danger delete-resource" data-resource-id="${resourceId}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;

        resourceElement.querySelector('.delete-resource').addEventListener('click', () => {
            resourceElement.remove();
        });

        this.resourcesContainer.appendChild(resourceElement);
    }

    addNote(content = '') {
        const noteId = Date.now();
        const noteElement = document.createElement('div');
        noteElement.className = 'note-item';
        noteElement.innerHTML = `
            <div class="d-flex align-items-start gap-2">
                <div class="flex-grow-1">
                    <textarea class="form-control note-content" placeholder="Enter your note..." rows="2">${this.escapeHtml(content)}</textarea>
                </div>
                <button type="button" class="btn btn-sm btn-outline-danger delete-note" data-note-id="${noteId}">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;

        noteElement.querySelector('.delete-note').addEventListener('click', () => {
            noteElement.remove();
        });

        this.notesContainer.appendChild(noteElement);
    }

    addFlashcard(front = '', back = '') {
        const cardId = Date.now();
        const cardElement = document.createElement('div');
        cardElement.className = 'card mb-2';
        cardElement.innerHTML = `
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <label class="form-label">Front (Question)</label>
                        <textarea class="form-control flashcard-front" placeholder="Enter question or term..." rows="2">${this.escapeHtml(front)}</textarea>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Back (Answer)</label>
                        <textarea class="form-control flashcard-back" placeholder="Enter answer or definition..." rows="2">${this.escapeHtml(back)}</textarea>
                    </div>
                </div>
                <div class="mt-2 text-end">
                    <button type="button" class="btn btn-sm btn-outline-danger delete-flashcard" data-card-id="${cardId}">
                        <i class="bi bi-trash me-1"></i>Delete
                    </button>
                </div>
            </div>
        `;

        cardElement.querySelector('.delete-flashcard').addEventListener('click', () => {
            cardElement.remove();
        });

        this.flashcardsContainer.appendChild(cardElement);
    }

    addQuiz(question = '', options = ['', '', '', ''], correctIndex = 0, explanation = '') {
        const quizId = Date.now();
        const quizElement = document.createElement('div');
        quizElement.className = 'card mb-3';
        quizElement.innerHTML = `
            <div class="card-body">
                <div class="mb-3">
                    <label class="form-label">Question</label>
                    <textarea class="form-control quiz-question" placeholder="Enter your question..." rows="2">${this.escapeHtml(question)}</textarea>
                </div>
                <div class="mb-3">
                    <label class="form-label">Options</label>
                    ${options.map((option, index) => `
                        <div class="input-group mb-2">
                            <span class="input-group-text">
                                <input class="form-check-input mt-0 correct-option" type="radio" name="correct-${quizId}" value="${index}" ${index === correctIndex ? 'checked' : ''}>
                            </span>
                            <input type="text" class="form-control quiz-option" placeholder="Option ${index + 1}" value="${this.escapeHtml(option)}">
                        </div>
                    `).join('')}
                </div>
                <div class="mb-3">
                    <label class="form-label">Explanation (Optional)</label>
                    <textarea class="form-control quiz-explanation" placeholder="Explain why this answer is correct..." rows="2">${this.escapeHtml(explanation)}</textarea>
                </div>
                <div class="text-end">
                    <button type="button" class="btn btn-sm btn-outline-danger delete-quiz" data-quiz-id="${quizId}">
                        <i class="bi bi-trash me-1"></i>Delete Question
                    </button>
                </div>
            </div>
        `;

        quizElement.querySelector('.delete-quiz').addEventListener('click', () => {
            quizElement.remove();
        });

        this.quizContainer.appendChild(quizElement);
    }

    saveCapsule(event) {
        event.preventDefault();

        // Get basic capsule info
        const capsule = {
            title: document.getElementById('capsuleTitle').value.trim(),
            subject: document.getElementById('capsuleSubject').value.trim(),
            level: document.getElementById('capsuleLevel').value,
            description: document.getElementById('capsuleDescription').value.trim(),
            resources: [],
            notes: [],
            flashcards: [],
            quiz: []
        };

        // Validate required fields
        if (!capsule.title) {
            alert('Capsule title is required');
            return;
        }

        // Collect resources
        const resourceElements = this.resourcesContainer.querySelectorAll('.resource-item');
        resourceElements.forEach(element => {
            const label = element.querySelector('.resource-label').value.trim();
            const url = element.querySelector('.resource-url').value.trim();
            if (label && url) {
                // Basic URL validation
                try {
                    new URL(url);
                    capsule.resources.push({ label, url });
                } catch (e) {
                    alert(`Invalid URL: ${url}`);
                    throw e;
                }
            }
        });

        // Collect notes
        const noteElements = this.notesContainer.querySelectorAll('.note-item');
        noteElements.forEach(element => {
            const content = element.querySelector('.note-content').value.trim();
            if (content) {
                capsule.notes.push(content);
            }
        });

        // Collect flashcards
        const flashcardElements = this.flashcardsContainer.querySelectorAll('.card');
        flashcardElements.forEach(element => {
            const front = element.querySelector('.flashcard-front').value.trim();
            const back = element.querySelector('.flashcard-back').value.trim();
            if (front && back) {
                capsule.flashcards.push({ front, back });
            }
        });

        // Collect quiz questions
        const quizElements = this.quizContainer.querySelectorAll('.card');
        quizElements.forEach(element => {
            const question = element.querySelector('.quiz-question').value.trim();
            const optionInputs = element.querySelectorAll('.quiz-option');
            const options = Array.from(optionInputs).map(input => input.value.trim());
            const correctOption = element.querySelector('.correct-option:checked');
            const correctIndex = correctOption ? parseInt(correctOption.value) : 0;
            const explanation = element.querySelector('.quiz-explanation').value.trim();

            if (question && options.some(opt => opt)) {
                capsule.quiz.push({
                    question,
                    options: options.filter(opt => opt), // Remove empty options
                    correctIndex,
                    explanation
                });
            }
        });

        // Validate that at least one content type exists
        if (capsule.notes.length === 0 && capsule.flashcards.length === 0 && 
            capsule.quiz.length === 0 && capsule.resources.length === 0) {
            alert('Please add at least one note, flashcard, quiz question, or resource.');
            return;
        }

        // Save the capsule
        if (this.currentCapsuleId) {
            capsule.id = this.currentCapsuleId;
        }

        const savedId = saveCapsule(capsule);
        if (savedId) {
            alert('Capsule saved successfully!');
            this.resetForm();
            // Refresh library if it exists
            if (window.libraryManager) {
                window.libraryManager.refresh();
            }
            // Navigate back to library
            window.app.navigateToSection('library');
        } else {
            alert('Error saving capsule');
        }
    }

    loadCapsuleForEditing(capsuleId) {
        const capsule = loadCapsule(capsuleId);
        if (!capsule) {
            alert('Error loading capsule');
            return;
        }

        this.currentCapsuleId = capsuleId;

        // Fill basic info
        document.getElementById('capsuleTitle').value = capsule.title || '';
        document.getElementById('capsuleSubject').value = capsule.subject || '';
        document.getElementById('capsuleLevel').value = capsule.level || 'beginner';
        document.getElementById('capsuleDescription').value = capsule.description || '';

        // Clear existing content
        this.resourcesContainer.innerHTML = '';
        this.notesContainer.innerHTML = '';
        this.flashcardsContainer.innerHTML = '';
        this.quizContainer.innerHTML = '';

        // Load resources
        if (capsule.resources && capsule.resources.length > 0) {
            capsule.resources.forEach(resource => this.addResource(resource.label, resource.url));
        }

        // Load notes
        if (capsule.notes && capsule.notes.length > 0) {
            capsule.notes.forEach(note => this.addNote(note));
        } else {
            this.addNote(); // Add one empty note by default
        }

        // Load flashcards
        if (capsule.flashcards && capsule.flashcards.length > 0) {
            capsule.flashcards.forEach(card => this.addFlashcard(card.front, card.back));
        }

        // Load quiz questions
        if (capsule.quiz && capsule.quiz.length > 0) {
            capsule.quiz.forEach(quiz => {
                const options = [...quiz.options];
                // Ensure we have 4 options
                while (options.length < 4) {
                    options.push('');
                }
                this.addQuiz(quiz.question, options, quiz.correctIndex, quiz.explanation || '');
            });
        }

        // Update form title
        document.querySelector('#author h2').textContent = 'Edit Educational Capsule';
    }

    resetForm() {
        this.currentCapsuleId = null;
        this.form.reset();
        this.resourcesContainer.innerHTML = '';
        this.notesContainer.innerHTML = '';
        this.flashcardsContainer.innerHTML = '';
        this.quizContainer.innerHTML = '';
        document.querySelector('#author h2').textContent = 'Create Educational Capsule';
        
        // Add one empty note by default
        this.addNote();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
