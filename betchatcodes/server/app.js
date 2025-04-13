import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import cors from 'cors';
import mysql from "mysql2/promise";
const port = process.env.PORT || 3000;
const app = express();
const server = createServer(app);

// Create a new Socket.IO server with specific CORS configuration
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5174",  // Allow connections from this origin (frontend app)
        methods: ['GET', 'POST'],        // Allowed methods for requests
        credentials: true,               // Allow credentials (cookies, authorization headers)
    },
});
// Store connected users with their socket IDs
let connectedUsers = {};
// Set to track usernames that are already taken
let usernamesInUse = new Set();

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`); // Log connection event with socket ID

    // Listen for 'set-username' event to assign a username to the connected user
    socket.on('set-username', (username) => {
        // Check if the username is not empty and not already in use
        if (username.trim() && !usernamesInUse.has(username)) {
            connectedUsers[socket.id] = username;  // Assign username to the socket ID
            usernamesInUse.add(username);          // Mark the username as taken
            io.emit("updateUsers",connectedUsers);  // Update the user list to all clients
            console.log(`Username set: ${username} (Socket ID: ${socket.id})`);
        } else {
            // If username is already taken or invalid, emit 'username-taken' error to the user
            socket.emit('username-taken', 'Username is already taken, please choose another one.');
            console.log(`Failed to set username: ${username} (Socket ID: ${socket.id})`);
        }
    });

    // Listen for 'message' event to receive and broadcast a chat message
    socket.on('message', (message) => {
        // Only send the message if the user is connected and has a username
        if (connectedUsers[socket.id]) {
            io.emit('receive-message', { sender: connectedUsers[socket.id], message });
        }
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id} (${connectedUsers[socket.id] || 'Unknown'})`);
        let username = connectedUsers[socket.id];

        if (username) {
            // Remove the username from the set of taken usernames
            usernamesInUse.delete(username);
        }
        // Delete the user from the connected users object
        delete connectedUsers[socket.id];
        
        // Update the remaining users list for all clients
        io.emit("updateUsers", Object.values(connectedUsers));
    });
});

// Set up CORS middleware to allow cross-origin requests from the frontend
app.use(cors({
    origin: "http://localhost:5174",  // Frontend app origin
    methods: ['GET', 'POST'],        // Allowed methods
    credentials: true,               // Allow credentials (cookies, authorization headers)
}));

app.use(express.json());

//connection to database
const db = await mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'Mysql@1234',
    database:'newchatusers'
})
console.log('connected')

db.connect((err) => {
    if (err) {
      console.error("Database connection failed:", err);
    } else {
      console.log("Connected to MySQL database");
    }
  });
  
  // API Route to Insert Data

    app.post("/api/insert",async (req, res) => {
        try {
            const { name } = req.body;
              if (!name) {
                  return res.status(400).json({ error: "Name is required" });
              }
              const sql = "INSERT INTO users (username) VALUES (?)";
              const [result] = await  db.execute(sql, [name]);
              console.log(result)
        } catch (err) {
            console.error("Error inserting data:", err);
          res.status(500).json({ error: "Failed to insert data" });
        }
    });
    
// Basic route to check if the server is running
app.get('/', (req, res) => {
    res.send('hi server');
});

// Start the server on the specified port
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});