# Pocket Classroom - Offline Learning Capsules

A single-page web application for creating, studying, and sharing educational content. Works completely offline using LocalStorage.

## Features

- 📚 Library: Browse all your learning capsules with progress tracking
- ✏️ Author Mode: Create capsules with notes, flashcards, quiz questions, and resources
- 🎓 Learn Mode: Study with interactive flashcards and quizzes
- 📊 Progress Tracking: Track quiz scores and known flashcards
- 💾 Import/Export: Share capsules via JSON files
- 🌙 Dark/Light Theme: Toggle between themes
- ⌨️ Keyboard Shortcuts: Efficient navigation with keyboard

## Keyboard Shortcuts

- Space: Flip flashcard
- Arrow Keys: Navigate flashcards
- K: Mark flashcard as known
- U: Mark flashcard as unknown
- /: Cycle through tabs in Learn mode

## Data Structure

Capsules are stored with the following schema:

`json
{
  "schema": "pocket-classroom/v1",
  "id": "unique-id",
  "title": "Capsule Title",
  "subject": "Subject",
  "level": "beginner|intermediate|advanced",
  "description": "Description",
  "resources": [
    {"label": "Resource Name", "url": "https://example.com"}
  ],
  "notes": ["Note 1", "Note 2"],
  "flashcards": [
    {"front": "Question", "back": "Answer"}
  ],
  "quiz": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "Explanation text"
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "lastUpdated": "2024-01-01T00:00:00.000Z"
}