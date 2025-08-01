import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import connectDB from './DB/connectDB.js';
import cookieParser from 'cookie-parser';
import { routes } from './routes/sport.route.js';
import UserRouter from './routes/user.route.js';
import PlayerRouter from './routes/player.route.js';
import adminRouter from './routes/admin.route.js';
import FeedbackRouter from './routes/feedback.route.js';
import paymentRouter from './routes/payment.route.js';
import stripeRouter from './routes/webhook.route.js'
import DonateRouter from './routes/donate.route.js';
import { console } from 'inspector';
import { cloudinaryConnect } from './utils/cloudinary.js';
import fileupload from 'express-fileupload'

const PORT = process.env.PORT;

const app = express();
const server = http.createServer(app);
app.use(cors({ 
  origin: ["http://localhost:3001", "http://localhost:3003", "https://top-scorer-ecru.vercel.app","https://top-scorer-admin.vercel.app"],
  credentials: true
}));

app.use(fileupload(
  {
      useTempFiles : true,
      tempFileDir : '/tmp/'
  }
));
app.use(express.json());
app.use(cookieParser());

// CORS Configuration
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// ========== EXISTING GAME DATA SOCKET LOGIC ==========
let full_Payload = {
  badminton: { 
    "lastMessageBD" : false
  },
  badminton_double: {
    "lastMessageBDouble" : false
  },
  tennis: {
    "TT": false
  },
  tennis_D: {
    "TTD": false
  },
  kabbadi_M: {
    "Kabb":false
  },
  Cricket_D: {
    "Cricket":false
  },
  Football:{
    "Foot":false
  }
};
let connectedClient = 0;

io.on("connection", (socket) => {
  connectedClient++; // ✅ Increment on connection
  console.log("A user connected. Total clients:", connectedClient);
  
  // Broadcast connected client count
  io.emit("clientCount", connectedClient);

  // Send full payload
  socket.emit("FullPayLoad", full_Payload);
  console.log(full_Payload)

  // Handle data updates
  socket.on("data", (payload) => {
    if (payload.name === "Badminton") { 
      full_Payload.badminton.lastMessageBD = payload.data;
    } else if (payload.name === "Badminton_D") {
      full_Payload.badminton_double.lastMessageBDouble = payload.data;
    } else if (payload.name === "tennis") {
      full_Payload.tennis.TT = payload.data;
    } else if (payload.name === "Tennis_D") {
      full_Payload.tennis_D.TTD = payload.data;
    } else if (payload.name === "Kabaddi") {
      full_Payload.kabbadi_M.Kabb = payload.data;
    }
    else if (payload.name==="Cricket"){
      full_Payload.Cricket_D.Cricket = payload.data;
    }
    else if (payload.name==="Football"){
      full_Payload.Football.Foot = payload.data;
    }

    // Optional: update payload with live client count
    full_Payload.clients = connectedClient;

    // Broadcast to all
    io.emit("FullPayLoad", full_Payload);
  });

  socket.on("disconnect", () => {
    connectedClient--; // ✅ Decrement on disconnect
    console.log("A user disconnected. Total clients:", connectedClient);
    io.emit("clientCount", connectedClient);

    // Handle cricket updates
    socket.on("cricket_update", (data) => {
      console.log("Received cricket update:", data);
      // Update the full payload
      full_Payload.Cricket_D.Cricket = data;
      // Broadcast to all clients
      io.emit("cricket_update", data);
    });
  });
});


// ========== NEW CHAT ROOM SOCKET LOGIC ==========
const chatNamespace = io.of('/chat');

// Store chat rooms, users, and message history
const chatRooms = {
  Badminton: { 
    users: [],
    messages: [] 
  },
  Badminton_Doubles: { 
    users: [],
    messages: [] 
  },
  Tennis: { 
    users: [],
    messages: [] 
  },
  Tennis_Doubles: { 
    users: [],
    messages: [] 
  },
  Kabaddi: { 
    users: [],
    messages: [] 
  },
  Cricket: { 
    users: [],
    messages: [] 
  },
  Football: { 
    users: [],
    messages: [] 
  }
};

// Maximum number of messages to store per room
const MAX_MESSAGES = 50;

chatNamespace.on('connection', (socket) => {
  // console.log('New user connected to chat namespace');

  // Join a chat room
  socket.on('join_chat_room', ({ username, room }) => {
    console.log(username);
    if (chatRooms[room]) {
      // Add user to room
      chatRooms[room].users.push({ id: socket.id, username });
      socket.join(room);
      
      // Notify room that user joined
      socket.to(room).emit('user_joined_chat', username);
      
      // Send room info and message history to user
      chatNamespace.to(socket.id).emit('chat_room_info', {
        room,
        users: chatRooms[room].users.map(u => u.username),
        messages: chatRooms[room].messages.slice(-MAX_MESSAGES) // Send last 50 messages
      });
      
      // console.log(`${username} joined ${room} chat room`);
    }
  });

  // Handle chat messages
  socket.on('send_chat_message', ({ room, message }) => {
    const user = chatRooms[room]?.users.find(u => u.id === socket.id);
    if (user) {
      const chatMessage = {
        username: message.username,
        message: message.message,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Kolkata'
        })
      };
      
      // Add message to room's message history
      chatRooms[room].messages.push(chatMessage);
      
      // Keep only the last MAX_MESSAGES messages
      if (chatRooms[room].messages.length > MAX_MESSAGES) {
        chatRooms[room].messages.shift();
      }
      
      // Broadcast message to room
      chatNamespace.to(room).emit('receive_chat_message', chatMessage);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    // Find and remove user from all rooms
    Object.keys(chatRooms).forEach(room => {
      const index = chatRooms[room].users.findIndex(u => u.id === socket.id);
      if (index !== -1) {
        const user = chatRooms[room].users[index];
        chatRooms[room].users.splice(index, 1);
        socket.to(room).emit('user_left_chat', user.username);
        console.log(`${user.username} left ${room} chat room`);
      }
    });
  });
});
// ========== EXPRESS ROUTES ==========
app.use('/api/v1/sports', routes);
app.use('/api/v1/users', UserRouter);
app.use('/api/v1/players', PlayerRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/feedback', FeedbackRouter);
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/donate',DonateRouter)

// this is route is still in progress
app.use('/api/v1',stripeRouter);

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`); 
});

cloudinaryConnect();
connectDB();