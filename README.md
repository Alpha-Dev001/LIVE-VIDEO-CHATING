# NexCall — Live Video Chat Application

A full-stack 1-to-1 real-time video calling app built with React, Node.js, Socket.IO, WebRTC, and MongoDB.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (functional components + hooks) |
| Backend | Node.js + Express.js |
| Real-time | Socket.IO 4 |
| Video | WebRTC (native browser API) |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |

---

## Project Structure

```
nexcall/
├── client/                  # React frontend
│   └── src/
│       ├── context/
│       │   ├── AuthContext.js     # JWT auth state
│       │   └── SocketContext.js   # Socket.IO connection + online users
│       ├── hooks/
│       │   └── useWebRTC.js       # All WebRTC + signaling logic
│       ├── components/
│       │   ├── Sidebar.js         # User list with online presence
│       │   └── VideoCall.js       # Video UI (incoming/outgoing/active)
│       ├── pages/
│       │   ├── AuthPage.js        # Login + Register
│       │   └── DashboardPage.js   # Main chat layout
│       ├── App.js
│       └── App.css
│
└── server/                  # Node.js backend
    ├── models/
    │   └── User.js                # MongoDB user schema
    ├── controllers/
    │   └── authController.js      # Register, login, users
    ├── routes/
    │   └── auth.js                # REST API routes
    ├── middleware/
    │   └── auth.js                # JWT verification middleware
    ├── socket.js                  # Socket.IO + WebRTC signaling
    ├── index.js                   # Express server entry
    └── .env                       # Environment variables
```

---

## Prerequisites

- **Node.js** v16+
- **MongoDB** running locally (`mongod`) OR a MongoDB Atlas connection string
- A modern browser (Chrome, Firefox, Edge — must support WebRTC)

---

## Setup & Installation

### 1. Clone / Download the project

```bash
cd nexcall
```

### 2. Install server dependencies

```bash
cd server
npm install
```

### 3. Configure environment variables

Edit `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/videochat
JWT_SECRET=your_super_secret_key_here
CLIENT_URL=http://localhost:3000
```

If using MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.

### 4. Install client dependencies

```bash
cd ../client
npm install
```

---

## Running the Application

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd server
node index.js
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on port 5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm start
```

Opens at `http://localhost:3000`

---

## How to Use

### Testing with Two Users

To test video calling, you need **two browser windows** (or two different browsers/incognito tabs):

1. Open `http://localhost:3000` in **Chrome**
2. Open `http://localhost:3000` in **Chrome Incognito** (or Firefox)
3. Register two different accounts
4. In one window, click on the other user
5. Click **"Start Video Call"**
6. The other window will show an incoming call — click **Accept**
7. Grant camera/microphone permissions when prompted

---

## Features

### Authentication
- User registration with username, email, password
- JWT-based login sessions (7-day token)
- Auto-generated profile avatars via DiceBear API
- Password hashing with bcrypt

### Real-time Presence
- Online/offline status updates instantly via Socket.IO
- Green dot = online, grey dot = offline
- Users sorted by online status first

### Video Calling (WebRTC)
- 1-to-1 video calls
- Local + remote video streams
- Mute microphone toggle
- Turn camera on/off toggle
- End call from either side
- Automatic cleanup on disconnect
- ICE candidate exchange via Socket.IO signaling

### Signaling Flow
```
Caller                  Server              Callee
  |------ call-user ------->|                 |
  |                         |-- incoming-call->|
  |                         |<- accept-call ---|
  |<------ call-accepted ---|                 |
  |<===== ICE + SDP exchange (direct P2P) ===>|
  |<============ WebRTC video stream =========>|
```

### STUN Configuration
```javascript
iceServers: [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' }
]
```

---

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | — | Create new account |
| POST | /api/auth/login | — | Login + get token |
| GET | /api/auth/me | ✅ | Get current user |
| GET | /api/auth/users | ✅ | Get all other users |

---

## Socket.IO Events

| Event | Direction | Description |
|---|---|---|
| `online-users` | Server → Client | List of online user IDs |
| `call-user` | Client → Server | Send call offer to target |
| `incoming-call` | Server → Client | Notify callee of incoming call |
| `accept-call` | Client → Server | Send SDP answer |
| `call-accepted` | Server → Client | Notify caller of acceptance |
| `reject-call` | Client → Server | Reject incoming call |
| `call-rejected` | Server → Client | Notify caller of rejection |
| `end-call` | Client → Server | End an active call |
| `call-ended` | Server → Client | Notify the other party call ended |
| `ice-candidate` | Client → Server | Forward ICE candidate |
| `ice-candidate` | Server → Client | Deliver ICE candidate |

---

## Browser Permissions

WebRTC requires camera/microphone permissions. When starting a call, your browser will ask you to allow access. Make sure to click **Allow**.

For **localhost**, Chrome/Firefox grant permissions by default. For production deployment, you **must** use **HTTPS** as WebRTC requires a secure context.

---

## Production Deployment Notes

1. Use **HTTPS** (required for `getUserMedia`)
2. Add a **TURN server** for users behind strict NAT/firewalls (STUN alone may not work):
   ```javascript
   { urls: 'turn:your-turn-server.com', username: 'user', credential: 'pass' }
   ```
3. Set `JWT_SECRET` to a strong random string
4. Use MongoDB Atlas or a hosted MongoDB instance
5. Update `CLIENT_URL` in `.env` and remove the `proxy` in `client/package.json`

---

## Troubleshooting

**"User is not online" error**: Ensure both users are logged in with valid tokens.

**Black video screen**: Check browser permissions — click the camera icon in the address bar and allow access.

**Call doesn't connect**: Both users must be on the same network or behind NAT-compatible STUN. Add a TURN server for cross-network calls.

**MongoDB connection refused**: Make sure `mongod` is running (`brew services start mongodb-community` on Mac, or `sudo systemctl start mongod` on Linux).
