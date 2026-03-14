// API client for connecting to Go backend
// Base URL for the backend API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// ===== INTERFACES =====

// Note interface matching the backend structure
export interface Note {
  id: string;
  title: string;
  filename: string;
  filepath?: string; // ← Added (optional)
  content: string;
  cover: string;
  category?: { id: string; category: string }; // ← Added (optional)
  num: number;
  revision: string;
  created: string;
  revised: string;
  display: boolean;
}

// Cover/Category interface
export interface Cover {
  id: string;
  category: string;
  valid: boolean;
  created: string;
}

// Calendar Event interface
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  label: 'reading' | 'repeat' | 'shadowing' | 'solve' | 'writing' | 'development';
  event_date: string; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

// Note View interface
export interface NoteView {
  id: string;
  note_id: string;
  viewed_at: string;
  session_id: string;
}

// ===== NOTE OPERATIONS =====

export interface CreateNoteRequest {
  title: string;
  filename?: string;
  content: string;
  cover: string; // Category ID
  num?: number;
  revision?: string;
  display?: boolean;
}

export interface UpdateNoteRequest {
  title?: string;
  filename?: string;
  content?: string;
  cover?: string;
  num?: number;
  revision?: string;
  display?: boolean;
}

/**
 * Creates a new note
 */
export const createNote = async (note: CreateNoteRequest): Promise<Note> => {
  const response = await fetch(`${API_BASE_URL}/api/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });

  if (!response.ok) {
    throw new Error(`Failed to create note: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetches a single note by ID
 */
export const getNote = async (id: string): Promise<Note> => {
  const response = await fetch(`${API_BASE_URL}/api/notes/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch note: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Updates an existing note
 */
export const updateNote = async (id: string, updates: UpdateNoteRequest): Promise<Note> => {
  const response = await fetch(`${API_BASE_URL}/api/notes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(`Failed to update note: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Deletes a note by ID
 */
export const deleteNote = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/notes/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete note: ${response.statusText}`);
  }
};

/**
 * Fetches all notes
 */
export const getAllNotes = async (): Promise<Note[]> => {
  const response = await fetch(`${API_BASE_URL}/api/notes`);

  if (!response.ok) {
    throw new Error(`Failed to fetch notes: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetches all notes in a specific cover/category
 */
export const getNotesByCover = async (coverId: string): Promise<Note[]> => {
  const response = await fetch(`${API_BASE_URL}/api/covers/${coverId}/notes`);

  if (!response.ok) {
    throw new Error(`Failed to fetch notes: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Searches notes by title
 */
export const searchNotes = async (query: string): Promise<Note[]> => {
  const response = await fetch(`${API_BASE_URL}/api/notes/search?q=${encodeURIComponent(query)}`);

  if (!response.ok) {
    throw new Error(`Failed to search notes: ${response.statusText}`);
  }

  return response.json();
};

// ===== COVER/CATEGORY OPERATIONS =====

export interface CreateCoverRequest {
  category: string;
  valid?: boolean;
}

export interface UpdateCoverRequest {
  category?: string;
  valid?: boolean;
}

/**
 * Creates a new cover/category
 */
export const createCover = async (cover: CreateCoverRequest): Promise<Cover> => {
  const response = await fetch(`${API_BASE_URL}/api/covers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cover),
  });

  if (!response.ok) {
    throw new Error(`Failed to create cover: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetches a single cover by ID
 */
export const getCover = async (id: string): Promise<Cover> => {
  const response = await fetch(`${API_BASE_URL}/api/covers/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch cover: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Updates an existing cover
 */
export const updateCover = async (id: string, updates: UpdateCoverRequest): Promise<Cover> => {
  const response = await fetch(`${API_BASE_URL}/api/covers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(`Failed to update cover: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Deletes a cover by ID
 */
export const deleteCover = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/covers/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete cover: ${response.statusText}`);
  }
};

/**
 * Fetches all covers/categories
 */
export const getAllCovers = async (): Promise<Cover[]> => {
  const response = await fetch(`${API_BASE_URL}/api/covers`);

  if (!response.ok) {
    throw new Error(`Failed to fetch covers: ${response.statusText}`);
  }

  return response.json();
};

// ===== CALENDAR EVENT OPERATIONS =====

export interface CreateCalendarEventRequest {
  title: string;
  description?: string;
  label: 'reading' | 'repeat' | 'shadowing' | 'solve' | 'writing' | 'development';
  event_date: string; // YYYY-MM-DD
  user_id?: string;
}

export interface UpdateCalendarEventRequest {
  title?: string;
  description?: string;
  label?: 'reading' | 'repeat' | 'shadowing' | 'solve' | 'writing' | 'development';
  event_date?: string;
}

/**
 * Creates a new calendar event
 */
export const createCalendarEvent = async (event: CreateCalendarEventRequest): Promise<CalendarEvent> => {
  const response = await fetch(`${API_BASE_URL}/api/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    throw new Error(`Failed to create event: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetches a single calendar event by ID
 */
export const getCalendarEvent = async (id: string): Promise<CalendarEvent> => {
  const response = await fetch(`${API_BASE_URL}/api/events/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch event: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Updates an existing calendar event
 */
export const updateCalendarEvent = async (id: string, updates: UpdateCalendarEventRequest): Promise<CalendarEvent> => {
  const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(`Failed to update event: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Deletes a calendar event by ID
 */
export const deleteCalendarEvent = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete event: ${response.statusText}`);
  }
};

/**
 * Fetches all calendar events
 */
export const getAllCalendarEvents = async (): Promise<CalendarEvent[]> => {
  const response = await fetch(`${API_BASE_URL}/api/events`);

  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.statusText}`);
  }

  return response.json();
};

// ===== NOTE VIEW TRACKING OPERATIONS =====

export interface TrackViewRequest {
  note_id: string;
  session_id: string;
}

/**
 * Gets view count for a specific note
 */
export const getViewCount = async (noteId: string): Promise<{ note_id: string; count: number }> => {
  const response = await fetch(`${API_BASE_URL}/api/notes/${noteId}/views/count`);

  if (!response.ok) {
    throw new Error(`Failed to get view count: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Tracks a note view
 */
export const trackNoteView = async (noteId: string, sessionId: string): Promise<NoteView> => {
  const response = await fetch(`${API_BASE_URL}/api/views`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ note_id: noteId, session_id: sessionId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to track view: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Health check endpoint
 */
export const healthCheck = async (): Promise<{ status: string; time: string }> => {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error('Backend is not healthy');
  }

  return response.json();
};
