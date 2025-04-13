import express from "express";
import { createServer } from "http";
import cors from "cors";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import session from "express-session";
import MySQLStoreFactory from "express-mysql-session";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import crypto from "crypto"; 

dotenv.config();

const port = process.env.PORT || 4000;
const app = express();
const server = createServer(app);

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
}));

app.use(express.json());

async function startServer() {
    try {
        const db = mysql.createPool({
            host: "localhost",
            user: "root",
            password: "Mysql@1234",
            database: "betusers",
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        console.log("Connected to MySQL database");

        const MySQLStore = MySQLStoreFactory(session);
        const sessionStore = new MySQLStore({}, db);

        app.use(session({
            key: "user_sid",
            secret: "your_secret_key",
            resave: false,
            saveUninitialized: false,
            store: sessionStore,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24,//1d
                httpOnly: true,
                secure: false,
                sameSite: "lax",
            },
        }));

        await db.execute(`
            CREATE TABLE IF NOT EXISTS betUsers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                verified TINYINT DEFAULT 0,
                verification_token VARCHAR(255) NULL
            );
        `);

        console.log("✅ Users table ensured");

        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
              user: 'shuklalok2545@gmail.com',
              pass: 'lljpbdqfmgmgstpd',
            },
            tls: {
              rejectUnauthorized: false, 
            },
          });
          
          transporter.verify((error, success) => {
            if (error) {
              console.error("SMTP Connection Error:", error);
            } else {
              console.log("SMTP Server is ready to take messages.");
            }
          });
          
        // 🟢 User Signup & Sending Verification Email
        app.post("/user/data", async (req, res) => {
            try {
                const { username, email, password } = req.body;
                if (!username || !email || !password) {
                    return res.status(400).json({ error: "All fields are required" });
                }

                const [existingUsers] = await db.execute(
                    "SELECT * FROM betUsers WHERE username = ? OR email = ?",
                    [username, email]
                );

                if (existingUsers.length > 0) {
                    return res.status(400).json({ error: "Username or email already exists." });
                }

                const hashedPassword = await bcrypt.hash(password, 10);
                const verificationToken = crypto.randomBytes(32).toString("hex");

                await db.execute(
                    "INSERT INTO betUsers (username, email, password, verification_token) VALUES (?, ?, ?, ?)",
                    [username, email, hashedPassword, verificationToken]
                );

                const verificationLink = `http://localhost:4000/user/verify?token=${verificationToken}`;
                console.log(email)
                
                 transporter.sendMail({
                    from: 'shuklalok2545@gmail.com',
                    to: email,
                    subject: "Verify Your Email",
                    html: `<p> <h2>Welcome to Bet24 😊 </h2>Click <a href="${verificationLink}">here</a> to verify your email.</p>`
                }, (err, info) => {
                    if (err) {
                        console.error("❌ Email sending error:", err);
                    } else {
                        console.log("✅ Email sent successfully:", info.response);
                    }
                });

                console.log(`✅ Verification email sent to ${email}`);
                res.status(201).json({ message: "User registered successfully! Check your email for verification." });

            } catch (err) {
                console.error("❌ Error inserting data:", err);
                res.status(500).json({ error: "Failed to insert data" });
            }
        });

        // 🟢 Verify Email via Token
        app.get("/user/verify", async (req, res) => {
            const { token } = req.query;
            if (!token) {
                return res.status(400).json({ error: "Invalid verification request. Token is missing." });
            }
        
            try {
                const [users] = await db.execute("SELECT * FROM betUsers WHERE verification_token = ?", [token]);
        
                if (users.length === 0) {
                    return res.status(404).json({ error: "Invalid token or user not found." });
                }
        
                const user = users[0];
        
                // ✅ Mark user as verified
                await db.execute("UPDATE betUsers SET verified = 1, verification_token = NULL WHERE id = ?", [user.id]);
        
                // ✅ Store user session
                req.session.user = {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                };
        
                console.log(`✅ Email verified and user logged in: ${user.email}`);
        
                // ✅ Redirect user to frontend with session
                res.redirect(`http://localhost:5173`); // Change this to your actual dashboard URL
        
            } catch (err) {
                console.error("❌ Verification error:", err);
                res.status(500).json({ error: "Verification failed due to a server error." });
            }
        });
        
        // 🟢 User Login
        app.post("/user/login", async (req, res) => {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    return res.status(400).json({ error: "Email and password are required" });
                }

                const [users] = await db.execute("SELECT * FROM betUsers WHERE email = ?", [email]);
                if (users.length === 0) {
                    return res.status(401).json({ error: "Invalid credentials" });
                }

                const user = users[0];

                if (user.verified !== 1) {
                    return res.status(403).json({ error: "Please verify your email before logging in." });
                }

                const passwordMatch = await bcrypt.compare(password, user.password);
                if (!passwordMatch) {
                    return res.status(401).json({ error: "Invalid credentials" });
                }

                req.session.user = { id: user.id, username: user.username, email: user.email };
                console.log(`✅ User logged in: ${user.username}`);
                res.status(200).json({ message: "Login successful!", username: user.username });

            } catch (err) {
                console.error("❌ Error during login:", err);
                res.status(500).json({ error: "Failed to process login" });
            }
        });
        app.post("/user/logout", (req, res) => {
            res.clearCookie("token"); //  using cookies for authentication
            res.status(200).json({ message: "Logged out successfully" });
        });
        app.get("/user/auth", (req, res) => {
            if (req.session.user) {
                res.status(200).json({ isAuthenticated: true, user: req.session.user });
            } else {
                res.status(401).json({ isAuthenticated: false });
            }
        });
        
        // 🟢 Starting the server
        server.listen(port, () => {
            console.log(`🚀 Server running on port ${port}`);
        });

    } catch (err) {
        console.error("❌ Database connection error:", err);
    }
}

startServer();
