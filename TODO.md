# Chat Features Fixes

## Issues to Fix
- [x] Fix Typing Indicator Timing Mismatch (Frontend: 3s, Backend: 5s)
- [x] Improve Unread Count Reset Logic when opening chat
- [x] Fix Message Seen Status updates when receiver opens chat
- [x] Update Chat List Last Message when message is unsent

## Progress
- [x] 1. Fix typing indicator timing in backend (server.js)
- [x] 2. Remove redundant markMessagesAsSeen call from Chat.jsx (since joinChat already does it)
- [x] 3. Fix message seen status in markMessagesAsSeen
- [x] 4. Update chat list last message on unsend in frontend (ChatsList.jsx)
