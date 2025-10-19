// Library functionality for Pocket Classroom
class LibraryManager {
    constructor() {
        this.capsulesContainer = document.getElementById('capsulesContainer');
        this.emptyLibrary = document.getElementById('emptyLibrary');
        this.newCapsuleBtn = document.getElementById('newCapsuleBtn');
        this.createFirstCapsule = document.getElementById('createFirstCapsule');
        this.init();
    }

    init() {
        this.loadCapsules();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.newCapsuleBtn.addEventListener('click', () => this.navigateToAuthor());
        this.createFirstCapsule.addEventListener('click', () => this.navigateToAuthor());
    }

    loadCapsules() {
        const capsules = loadIndex();
        if (capsules.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();
        this.renderCapsules(capsules);
    }

    showEmptyState() {
        this.capsulesContainer.classList.add('d-none');
        this.emptyLibrary.classList.remove('d-none');
    }

    hideEmptyState() {
        this.capsulesContainer.classList.remove('d-none');
        this.emptyLibrary.classList.add('d-none');
    }

    renderCapsules(capsules) {
        // Sort capsules by last updated (newest first)
        capsules.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
        this.capsulesContainer.innerHTML = '';

        capsules.forEach(capsule => {
            const capsuleElement = this.createCapsuleCard(capsule);
            this.capsulesContainer.appendChild(capsuleElement);
        });
    }

    createCapsuleCard(capsule) {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';

        const levelBadges = {
            beginner: 'success',
            intermediate: 'warning',
            advanced: 'danger'
        };

        const levelTexts = {
            beginner: 'Beginner',
            intermediate: 'Intermediate',
            advanced: 'Advanced'
        };

        const progress = loadProgress(capsule.id);
        
        // Calculate known flashcards count
        const knownCount = progress.flashcardStatus ? 
            progress.flashcardStatus.filter(status => status === true).length : 0;
        
        const totalFlashcards = (() => {
            const fullCapsule = loadCapsule(capsule.id);
            return fullCapsule && fullCapsule.flashcards ? fullCapsule.flashcards.length : 0;
        })();

        col.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title">${this.escapeHtml(capsule.title)}</h5>
                        <span class="badge bg-${levelBadges[capsule.level] || 'secondary'}">
                            ${levelTexts[capsule.level] || capsule.level}
                        </span>
                    </div>
                    ${capsule.subject ? `<p class="card-text text-muted mb-2">${this.escapeHtml(capsule.subject)}</p>` : ''}
                    
                    <!-- Progress Indicators -->
                    <div class="mb-2">
                        <small class="text-muted">Best Quiz Score: ${progress.bestScore || 0}%</small>
                        <div class="progress" style="height: 4px;">
                            <div class="progress-bar" style="width: ${progress.bestScore || 0}%"></div>
                        </div>
                    </div>

                    <!-- NEW: Known Flashcards Count -->
                    ${totalFlashcards > 0 ? `
                    <div class="mb-2">
                        <small class="text-muted">Known Flashcards: ${knownCount}/${totalFlashcards}</small>
                        <div class="progress" style="height: 4px;">
                            <div class="progress-bar bg-success" style="width: ${totalFlashcards > 0 ? (knownCount / totalFlashcards) * 100 : 0}%"></div>
                        </div>
                    </div>
                    ` : ''}

                    <div class="mb-3">
                        <small class="text-muted">Last edited: ${timeAgo(capsule.lastUpdated)}</small>
                    </div>
                </div>
                <div class="card-footer bg-transparent border-top-0">
                    <div class="d-flex flex-wrap gap-2">
                        <button class="btn btn-sm btn-primary learn-btn" data-id="${capsule.id}">
                            Learn
                        </button>
                        <button class="btn btn-sm btn-outline-light edit-btn" data-id="${capsule.id}">
                            Edit
                        </button>
                        <button class="btn btn-sm btn-outline-info export-btn" data-id="${capsule.id}">
                            Export
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${capsule.id}">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners to buttons
        col.querySelector('.learn-btn').addEventListener('click', (e) => {
            this.learnCapsule(e.target.dataset.id);
        });

        col.querySelector('.edit-btn').addEventListener('click', (e) => {
            this.editCapsule(e.target.dataset.id);
        });

        col.querySelector('.export-btn').addEventListener('click', (e) => {
            this.exportCapsule(e.target.dataset.id);
        });

        col.querySelector('.delete-btn').addEventListener('click', (e) => {
            this.deleteCapsule(e.target.dataset.id);
        });

        return col;
    }

    learnCapsule(capsuleId) {
        // Switch to learn section and select this capsule
        window.app.navigateToSection('learn');
        setTimeout(() => {
            if (window.learnManager) {
                window.learnManager.selectCapsule(capsuleId);
            }
        }, 100);
    }

    editCapsule(capsuleId) {
        // Switch to author section and load this capsule for editing
        window.app.navigateToSection('author');
        setTimeout(() => {
            if (window.authorManager) {
                window.authorManager.loadCapsuleForEditing(capsuleId);
            }
        }, 100);
    }

    exportCapsule(capsuleId) {
        const capsule = loadCapsule(capsuleId);
        if (!capsule) {
            alert('Error loading capsule');
            return;
        }

        const exportData = exportCapsule(capsuleId);
        if (!exportData) {
            alert('Error creating export file');
            return;
        }

        // Show export modal
        document.getElementById('exportCapsuleTitle').textContent = capsule.title;
        const downloadBtn = document.getElementById('downloadExport');
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        downloadBtn.href = url;
        downloadBtn.download = `pocket-classroom-${this.slugify(capsule.title)}.json`;

        const exportModal = new bootstrap.Modal(document.getElementById('exportModal'));
        exportModal.show();
    }

    deleteCapsule(capsuleId) {
        const capsule = loadCapsule(capsuleId);
        if (!capsule) return;

        if (confirm(`Are you sure you want to delete the capsule "${capsule.title}"?`)) {
            if (deleteCapsule(capsuleId)) {
                this.loadCapsules(); // Reload the list
                // If we're in learn mode and this was the selected capsule, clear it
                if (window.learnManager && window.learnManager.selectedCapsuleId === capsuleId) {
                    window.learnManager.clearSelection();
                }
            } else {
                alert('Error deleting capsule');
            }
        }
    }

    navigateToAuthor() {
        window.app.navigateToSection('author');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    refresh() {
        this.loadCapsules();
    }
}
