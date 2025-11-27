# Collaboration Feature - User Guide

## 🚀 Quick Start

### Working Solo
1. Navigate to `/collaboration` page
2. A new session is auto-created for you
3. Start typing in the document editor
4. Click **Save** to persist your work
5. Your session appears in **Sessions** list

### Working with Team
1. Create or open an existing session
2. Click **Copy** next to the session ID
3. Share the session ID with teammates (e.g., `collab-1234567-abc123`)
4. Teammates click **Join** button
5. They paste your session ID and click "Join Session"
6. Everyone can now edit and chat together!

---

## 🤖 Using AI Helper

### How to Ask AI for Help
1. In the chat box, type your message starting with `@Helper`
2. Example: `@Helper can you summarize this document?`
3. AI reads your document and responds with helpful suggestions
4. Response appears in chat as "🤖 AI Helper: ..."

### Daily Limit
- ✅ **3 AI prompts per day per session**
- Counter shows: "AI: 2/3 left today"
- Resets every 24 hours

### What AI Can Do
- Summarize documents
- Improve writing
- Answer questions about content
- Suggest edits
- Explain concepts
- Generate ideas

### Example Prompts
```
@Helper can you make this paragraph more concise?
@Helper what are the main points in this document?
@Helper can you suggest a better title?
@Helper help me structure these ideas better
```

---

## 💬 Chat Features

### Regular Messages
- Type normally without `@Helper` to chat with teammates
- Messages appear instantly
- All participants can see the conversation

### AI Messages
- Start with `@Helper` to get AI assistance
- Uses one of your 3 daily prompts
- AI response includes document context

---

## 📋 Session Management

### Create New Session
- Auto-created when you visit `/collaboration`
- Or click existing session and "Save As New"

### View All Sessions
- Click **Sessions** button
- See all your sessions and shared sessions
- Click any session to open it
- Shows title, last activity, and owner

### Join Existing Session
1. Click **Join** button
2. Enter the session ID shared by owner
3. Click "Join Session"
4. You're now a participant!

### Session ID Format
- Example: `collab-1732723445-xy7k9m2`
- Share this ID with teammates
- Click **Copy** to copy to clipboard

---

## 🔒 Permissions

### As Owner
- ✅ Edit document
- ✅ Delete session
- ✅ See all participants
- ✅ Chat with team
- ✅ Use AI Helper (3/day)

### As Participant
- ✅ Edit document (saves as updates)
- ✅ Chat with team
- ✅ Use AI Helper (3/day)
- ✅ Leave session anytime
- ❌ Cannot delete session

---

## 💡 Tips & Best Practices

### Collaboration Tips
1. **Save Frequently** - Click Save button to persist changes
2. **Use Descriptive Titles** - Helps identify sessions later
3. **Communicate** - Use chat to coordinate edits
4. **Check Participants** - See who's in the session
5. **Session ID Security** - Only share with trusted teammates

### AI Helper Tips
1. **Be Specific** - Clear prompts get better responses
2. **Provide Context** - AI reads your document for context
3. **Save Prompts** - You have only 3 per day
4. **Ask Follow-ups** - Refine AI responses with more questions
5. **Use for Review** - Great for getting second opinions

### Performance Tips
1. **Limit Document Size** - Keep under 100,000 characters
2. **Regular Saves** - Don't lose work
3. **Close Unused Sessions** - Keep list clean
4. **Check Connection** - Badge shows "Connected" status

---

## 🐛 Troubleshooting

### "Session not found" Error
- Session may have been deleted by owner
- Double-check session ID is correct
- Ask owner to verify session still exists

### "Daily limit reached" for AI
- You've used all 3 AI prompts today
- Wait until tomorrow for reset
- Regular chat still works

### "Access denied" Error
- You don't have permission to view this session
- Ask owner to share correct session ID
- Make sure you're logged in

### Can't see new messages
- Wait up to 10 seconds (auto-refresh interval)
- Reload page if needed
- Check internet connection

### Join button not working
- Verify session ID format (starts with `collab-`)
- Check if session still exists
- Make sure you're authenticated

---

## 🎯 Use Cases

### Solo Writing
- Draft documents
- Get AI feedback on writing
- Organize thoughts
- Iterate on ideas

### Team Projects
- Collaborative editing
- Real-time feedback
- Coordinate through chat
- AI assistance for all members

### Education
- Student collaboration
- Teacher feedback
- Peer review
- AI tutoring assistance

### Professional
- Meeting notes
- Project planning
- Documentation
- Team brainstorming

---

## 📱 Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save | `Ctrl + S` (coming soon) |
| Copy Session ID | Click Copy button |
| Send Message | `Enter` in chat |
| New Line in Chat | `Shift + Enter` |

---

## 🌟 Coming Soon

- [ ] Real-time cursor positions
- [ ] Version history
- [ ] Export to PDF/Markdown
- [ ] Video/voice chat
- [ ] More AI model options
- [ ] Collaborative drawing
- [ ] Code syntax highlighting

---

## ❓ FAQ

**Q: How many people can join a session?**
A: Unlimited! Owner + any number of participants.

**Q: Do all participants share the AI limit?**
A: No! Each person gets 3 AI prompts per day per session.

**Q: Can I work offline?**
A: No, collaboration requires internet connection.

**Q: Are sessions encrypted?**
A: All data is transmitted securely via HTTPS and stored in MongoDB.

**Q: Can I recover deleted sessions?**
A: No, deletion is permanent. Save important work externally.

**Q: What happens if two people edit at once?**
A: Last save wins. Use chat to coordinate edits.

---

For technical documentation, see [COLLABORATION_API.md](./COLLABORATION_API.md)

Happy Collaborating! 🎉
