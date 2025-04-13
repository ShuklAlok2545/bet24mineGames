import React, { useEffect, useMemo, useState } from "react";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import SendIcon from "@mui/icons-material/Send";
import { io } from "socket.io-client";
import "./App.css";
import Tooltip from '@mui/material/Tooltip';

function ChatApp() {
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState({});
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  const socket = useMemo(() => io("http://localhost:3000"), []);

  useEffect(() => {
    socket.on("username-taken", (message, id) => {
      setUsernameError(message);
      setCurrentUserId(id);
    });

    socket.on("updateUsers", (userList) => {
      setUsers(userList);
    });

    socket.on("receive-message", ({ sender, message }) => {
      setMessages((prev) => [...prev, { sender, message }]);
    });

    return () => socket.disconnect();
  }, []);

  const handleSetUsername = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/api/insert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username }),
      });

      const result = await response.json();
      console.log("Response:", result);
    } catch (error) {
      console.error("Error inserting data:", error);
    }

    if (username.trim()) {
      socket.emit("set-username", username);
      setIsUsernameSet(true);
    }
  };

  const handleDeleteMessage = (index) => {
    setMessages((prevMessages) => prevMessages.filter((_, i) => i !== index));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit("message", message);
      setMessage("");
    }
  };

  return (
    <div className="chat-container">
      <h3>Enjoy Bet24 Public chat</h3>

      {!isUsernameSet ? (
        <form onSubmit={handleSetUsername} className="username-container">
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <button type="submit">Join Chat</button>
        </form>
      ) : (
        <>
          <div className="chat-box">
            {usernameError ? (
              <p className="error-message">
                {usernameError} <p >chat with new username</p>
              </p>
            ) : (
              <p className="usname">{username}: joined public chat</p>
            )}

            <div className="messages">
              {messages.map((msg, index) => (
                <p
                  key={`${index}+${currentUserId}`}
                  className={!msg.sender ? "client-message" : "server-message"}
                >
                  <strong>{msg.sender}:</strong> { msg.message}
                    <Tooltip title="Delete for me">
                      <DeleteForeverIcon
                        className="delete-icon"
                        onClick={() => handleDeleteMessage(index)}
                      />
                    </Tooltip>
                </p>
              ))}
            </div>

            <form onSubmit={handleSendMessage}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                required
              />
              <button className="sendmsg" type="submit">
                <SendIcon id="sndicn" fontSize="large" color="primary" />
              </button>
            </form>
          </div>

          <div className="user-list">
            <p >*Online Users</p>
            <ol>
              {Object.entries(users).map(([userId, user], index) => (
                <li key={index}>
                  <strong>{user}</strong>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}
    </div>
  );
}

export default ChatApp;
