// Main application initialization for Pocket Classroom
class PocketClassroomApp {
    constructor() {
        this.currentSection = 'library';
        this.init();
    }

    init() {
        this.initializeManagers();
        this.setupEventListeners();
        this.setupNavigation();
        this.loadTheme();
        this.setupKeyboardShortcuts();
    }

    initializeManagers() {
        // Initialize all managers
        window.libraryManager = new LibraryManager();
        window.authorManager = new AuthorManager();
        window.learnManager = new LearnManager();
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // Import functionality
        document.getElementById('importBtn').addEventListener('click', () => this.showImportModal());
        document.getElementById('confirmImport').addEventListener('click', () => this.handleImport());

        // Export modal cleanup
        document.getElementById('exportModal').addEventListener('hidden.bs.modal', () => {
            const downloadBtn = document.getElementById('downloadExport');
            if (downloadBtn.href) {
                URL.revokeObjectURL(downloadBtn.href);
            }
        });
    }

    setupNavigation() {
        // Set up navigation between sections
        document.querySelectorAll('[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.closest('[data-section]').dataset.section;
                this.navigateToSection(section);
            });
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only process if not in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            // Cycle through tabs with [/] key
            if (e.key === '/' && this.currentSection === 'learn') {
                e.preventDefault();
                if (window.learnManager) {
                    window.learnManager.cycleTabs();
                }
            }
        });
    }

    navigateToSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show target section
        document.getElementById(sectionName).classList.add('active');

        // Activate corresponding nav link
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        this.currentSection = sectionName;

        // Refresh section if needed
        this.refreshCurrentSection();
    }

    refreshCurrentSection() {
        switch (this.currentSection) {
            case 'library':
                if (window.libraryManager) {
                    window.libraryManager.refresh();
                }
                break;
            case 'learn':
                if (window.learnManager) {
                    window.learnManager.refresh();
                }
                break;
        }
    }

    toggleTheme() {
        const body = document.body;
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle.querySelector('i');

        if (body.classList.contains('dark-mode')) {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            icon.classList.remove('bi-moon');
            icon.classList.add('bi-sun');
            localStorage.setItem('pc_theme', 'light');
        } else {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            icon.classList.remove('bi-sun');
            icon.classList.add('bi-moon');
            localStorage.setItem('pc_theme', 'dark');
        }
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('pc_theme') || 'dark';
        const body = document.body;
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle.querySelector('i');

        if (savedTheme === 'light') {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            icon.classList.remove('bi-moon');
            icon.classList.add('bi-sun');
        } else {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            icon.classList.remove('bi-sun');
            icon.classList.add('bi-moon');
        }
    }

    showImportModal() {
        const importModal = new bootstrap.Modal(document.getElementById('importModal'));
        document.getElementById('importFile').value = '';
        importModal.show();
    }

    handleImport() {
        const fileInput = document.getElementById('importFile');
        const file = fileInput.files[0];

        if (!file) {
            alert('Please select a file to import.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const capsuleId = importCapsule(e.target.result);
                if (capsuleId) {
                    alert('Capsule imported successfully!');
                    // Refresh library
                    if (window.libraryManager) {
                        window.libraryManager.refresh();
                    }
                    // Close modal
                    bootstrap.Modal.getInstance(document.getElementById('importModal')).hide();
                }
            } catch (error) {
                alert(`Error importing capsule: ${error.message}`);
            }
        };
        reader.readAsText(file);
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PocketClassroomApp();
});
