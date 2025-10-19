// Storage utility functions for Pocket Classroom
const STORAGE_KEYS = {
    CAPSULES_INDEX: 'pc_capsules_index',
    PROGRESS_PREFIX: 'pc_progress_'
};

// Generate a unique ID for capsules
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Load the capsules index from localStorage
function loadIndex() {
    try {
        const index = localStorage.getItem(STORAGE_KEYS.CAPSULES_INDEX);
        return index ? JSON.parse(index) : [];
    } catch (error) {
        console.error('Error loading capsules index:', error);
        return [];
    }
}

// Save a capsule to localStorage
function saveCapsule(capsule) {
    try {
        if (!capsule.id) {
            capsule.id = generateId();
            capsule.createdAt = new Date().toISOString();
        }
        capsule.lastUpdated = new Date().toISOString();

        // Save the capsule
        localStorage.setItem(`pc_capsule_${capsule.id}`, JSON.stringify(capsule));

        // Update the index
        const index = loadIndex();
        const existingIndex = index.findIndex(item => item.id === capsule.id);
        
        const indexItem = {
            id: capsule.id,
            title: capsule.title,
            subject: capsule.subject,
            level: capsule.level,
            lastUpdated: capsule.lastUpdated
        };

        if (existingIndex >= 0) {
            index[existingIndex] = indexItem;
        } else {
            index.push(indexItem);
        }

        localStorage.setItem(STORAGE_KEYS.CAPSULES_INDEX, JSON.stringify(index));
        return capsule.id;
    } catch (error) {
        console.error('Error saving capsule:', error);
        return null;
    }
}

// Load a specific capsule by ID
function loadCapsule(id) {
    try {
        const capsuleData = localStorage.getItem(`pc_capsule_${id}`);
        return capsuleData ? JSON.parse(capsuleData) : null;
    } catch (error) {
        console.error('Error loading capsule:', error);
        return null;
    }
}

// Delete a capsule by ID
function deleteCapsule(id) {
    try {
        // Remove the capsule
        localStorage.removeItem(`pc_capsule_${id}`);
        // Update the index
        const index = loadIndex();
        const updatedIndex = index.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEYS.CAPSULES_INDEX, JSON.stringify(updatedIndex));
        // Remove any progress data
        localStorage.removeItem(`${STORAGE_KEYS.PROGRESS_PREFIX}${id}`);
        return true;
    } catch (error) {
        console.error('Error deleting capsule:', error);
        return false;
    }
}

// Save progress for a capsule
function saveProgress(capsuleId, progressData) {
    try {
        const progressKey = `${STORAGE_KEYS.PROGRESS_PREFIX}${capsuleId}`;
        localStorage.setItem(progressKey, JSON.stringify(progressData));
        return true;
    } catch (error) {
        console.error('Error saving progress:', error);
        return false;
    }
}

// Load progress for a capsule
function loadProgress(capsuleId) {
    try {
        const progressKey = `${STORAGE_KEYS.PROGRESS_PREFIX}${capsuleId}`;
        const progressData = localStorage.getItem(progressKey);
        return progressData ? JSON.parse(progressData) : {};
    } catch (error) {
        console.error('Error loading progress:', error);
        return {};
    }
}

// Export a capsule as JSON
function exportCapsule(capsuleId) {
    const capsule = loadCapsule(capsuleId);
    if (!capsule) return null;

    // Add schema information
    const exportData = {
        schema: "pocket-classroom/v1",
        exportedAt: new Date().toISOString(),
        ...capsule
    };

    return JSON.stringify(exportData, null, 2);
}

// Import a capsule from JSON
function importCapsule(jsonData) {
    try {
        const data = JSON.parse(jsonData);
        
        // Validate schema
        if (data.schema !== "pocket-classroom/v1") {
            throw new Error("Invalid schema. Expected 'pocket-classroom/v1'");
        }

        // Validate required fields
        if (!data.title || typeof data.title !== 'string') {
            throw new Error("Capsule title is required and must be a string");
        }

        // Validate at least one content type exists
        const hasNotes = data.notes && data.notes.length > 0;
        const hasFlashcards = data.flashcards && data.flashcards.length > 0;
        const hasQuiz = data.quiz && data.quiz.length > 0;
        const hasResources = data.resources && data.resources.length > 0;

        if (!hasNotes && !hasFlashcards && !hasQuiz && !hasResources) {
            throw new Error("Capsule must contain at least one note, flashcard, quiz question, or resource");
        }

        // Remove schema and export metadata
        const { schema, exportedAt, ...capsuleData } = data;
        
        // Generate new ID to avoid conflicts
        capsuleData.id = generateId();
        capsuleData.lastUpdated = new Date().toISOString();

        // Save the capsule
        return saveCapsule(capsuleData);
    } catch (error) {
        console.error('Error importing capsule:', error);
        throw error;
    }
}

// Utility function for human-readable time
function timeAgo(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
}
