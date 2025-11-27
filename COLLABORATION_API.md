# Collaboration API Documentation

## Overview
Complete backend API for real-time collaboration with AI assistance, multi-user support, and session management.

## Features
✅ **AI Helper** - Get AI assistance with `@Helper` mention (3 prompts per day limit)
✅ **Multi-user Collaboration** - Join sessions using session ID
✅ **Solo Mode** - Work alone without teammates
✅ **Real-time Chat** - Message other collaborators
✅ **Session Management** - Create, update, delete, and list sessions
✅ **XSS Protection** - All inputs sanitized with DOMPurify

---

## API Endpoints

### 1. Session Management

#### **GET** `/api/collaboration/sessions`
List all collaboration sessions for the authenticated user.

**Response:**
```json
{
  "success": true,
  "sessions": [
    {
      "_id": "...",
      "sessionId": "collab-1234567-abc123",
      "title": "My Document",
      "content": "Document content...",
      "owner": { "_id": "...", "username": "john", "email": "john@example.com" },
      "participants": [],
      "lastActivity": "2025-11-27T...",
      "createdAt": "2025-11-27T..."
    }
  ],
  "count": 1
}
```

#### **POST** `/api/collaboration/sessions`
Create a new collaboration session.

**Request Body:**
```json
{
  "title": "My Document",
  "content": "Initial content"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Collaboration session created successfully",
  "session": {
    "sessionId": "collab-1234567-abc123",
    "title": "My Document",
    "content": "Initial content",
    "owner": { ... },
    "participants": [],
    ...
  }
}
```

---

### 2. Session Details

#### **GET** `/api/collaboration/sessions/[id]`
Get detailed information about a specific session.

**Response:**
```json
{
  "success": true,
  "session": {
    "sessionId": "collab-1234567-abc123",
    "title": "My Document",
    "content": "Document content...",
    "owner": { ... },
    "participants": [ ... ],
    "messages": [ ... ],
    "isActive": true,
    "lastActivity": "2025-11-27T..."
  }
}
```

#### **PUT** `/api/collaboration/sessions/[id]`
Update session content or title.

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Session updated successfully",
  "session": { ... }
}
```

#### **DELETE** `/api/collaboration/sessions/[id]`
Delete a session (owner only).

**Response:**
```json
{
  "success": true,
  "message": "Session deleted successfully"
}
```

---

### 3. Messages / Chat

#### **GET** `/api/collaboration/sessions/[id]/messages`
Get all messages for a session.

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "_id": "...",
      "user": { "_id": "...", "username": "john" },
      "text": "Hello team!",
      "createdAt": "2025-11-27T..."
    }
  ],
  "count": 1
}
```

#### **POST** `/api/collaboration/sessions/[id]/messages`
Send a new message to the chat.

**Request Body:**
```json
{
  "text": "Hello everyone!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "chatMessage": {
    "_id": "...",
    "user": { ... },
    "text": "Hello everyone!",
    "createdAt": "2025-11-27T..."
  }
}
```

---

### 4. AI Helper (3 per day limit)

#### **GET** `/api/collaboration/sessions/[id]/ai-helper`
Check remaining AI assistance usage for today.

**Response:**
```json
{
  "success": true,
  "used": 1,
  "remaining": 2,
  "limit": 3,
  "date": "2025-11-27"
}
```

#### **POST** `/api/collaboration/sessions/[id]/ai-helper`
Request AI assistance (mention `@Helper` in chat).

**Request Body:**
```json
{
  "prompt": "Can you help me improve this paragraph?",
  "documentContent": "Current document content for context..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "AI response generated successfully",
  "response": "Here's how you can improve it: ...",
  "chatMessage": {
    "_id": "...",
    "user": { ... },
    "text": "🤖 AI Helper: Here's how you can improve it: ...",
    "createdAt": "2025-11-27T..."
  },
  "usage": {
    "used": 2,
    "remaining": 1,
    "limit": 3
  }
}
```

**Error (429 - Rate Limit):**
```json
{
  "success": false,
  "error": "Daily limit reached. You can use AI Helper 3 times per day.",
  "remaining": 0
}
```

---

### 5. Join Session / Participants

#### **POST** `/api/collaboration/sessions/[id]/join`
Join an existing collaboration session.

**Response:**
```json
{
  "success": true,
  "message": "Successfully joined the collaboration session",
  "session": { ... },
  "role": "participant"
}
```

#### **GET** `/api/collaboration/sessions/[id]/join`
Get list of participants in a session.

**Response:**
```json
{
  "success": true,
  "owner": { "_id": "...", "username": "john", "email": "john@example.com" },
  "participants": [
    { "_id": "...", "username": "jane", "email": "jane@example.com" }
  ],
  "totalParticipants": 2
}
```

#### **DELETE** `/api/collaboration/sessions/[id]/join`
Leave a collaboration session (participants only, not owner).

**Response:**
```json
{
  "success": true,
  "message": "Successfully left the collaboration session"
}
```

---

## Usage Examples

### Solo Workflow
1. User logs in
2. Auto-creates new session on `/collaboration` page load
3. Edits document content
4. Saves session with "Save" button
5. Can use `@Helper` in chat for AI assistance (max 3 times/day)
6. Session persists and appears in "Sessions" list

### Team Collaboration Workflow
1. User A creates a session
2. User A copies the session ID (e.g., `collab-1234567-abc123`)
3. User A shares the session ID with User B
4. User B clicks "Join" button and enters session ID
5. User B is now a participant
6. Both users can:
   - Edit the document (updates via save)
   - Chat with each other
   - Use `@Helper` for AI assistance (3 per person per day)
   - See each other's names in participants list

### AI Helper Usage
In the chat box, type:
```
@Helper can you summarize this document?
```

The AI will:
- Read the current document content
- Respond with a helpful suggestion
- Post response in chat as "🤖 AI Helper: ..."
- Decrement your daily usage count (remaining 2/3)

---

## Security Features

1. **Authentication Required** - All endpoints require valid JWT token
2. **XSS Protection** - All user inputs sanitized with DOMPurify
3. **Access Control** - Users can only access sessions they own or participate in
4. **Rate Limiting** - AI Helper limited to 3 requests per user per session per day
5. **Input Validation** - Length limits and type checking on all inputs
6. **Owner Permissions** - Only owners can delete sessions

---

## Error Codes

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (invalid input) |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (no access to resource) |
| 404 | Not Found (session doesn't exist) |
| 429 | Too Many Requests (rate limit exceeded) |
| 500 | Internal Server Error |

---

## Environment Variables Required

```env
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

---

## Models

### Collaboration Model
```javascript
{
  sessionId: String (unique),
  title: String,
  content: String,
  owner: ObjectId (ref: users),
  participants: [ObjectId] (ref: users),
  messages: [{
    user: ObjectId (ref: users),
    text: String,
    createdAt: Date
  }],
  isActive: Boolean,
  lastActivity: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### AI Helper Usage Model
```javascript
{
  user: ObjectId (ref: users),
  session: ObjectId (ref: collaborations),
  date: String (YYYY-MM-DD),
  usageCount: Number,
  dailyLimit: Number (default: 3),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Additional Features

### Auto-polling
- Frontend polls for new messages every 10 seconds when session is active
- Ensures real-time-like experience without WebSocket complexity

### Session ID Format
- Pattern: `collab-[timestamp]-[random]`
- Example: `collab-1732723445-xy7k9m2`
- Unique and shareable

### Participants Display
- Shows owner badge
- Lists all active participants
- Updates when users join/leave

---

## Testing Tips

1. **Test Solo Mode**: Create session, save, use AI Helper
2. **Test Collaboration**: 
   - Open two browser windows (or incognito + normal)
   - Login as different users
   - Create session in window 1
   - Copy session ID
   - Join from window 2
   - Both can edit and chat
3. **Test AI Limit**: Use `@Helper` 4 times to see rate limit error
4. **Test Access Control**: Try accessing another user's session ID

---

Built with ❤️ for CogniVista
