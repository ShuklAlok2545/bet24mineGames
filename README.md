# Bet24 Mine Game WebApp

**Bet24 Mine Game** is an interactive web app that combines a fun **mine game** with a **public chat** feature, allowing users to play and chat in real-time. Built with modern web technologies, this app provides a thrilling and social experience with integrated features to calculate profits and losses.

## Features

- **Mine Game**: Players dig on a grid of tiles, each of which may contain either a profit or a mine. The goal is to avoid the mines and maximize earnings by uncovering profitable tiles. The game uses a **probability function** to calculate the chances of winning or losing on each tile.
  
- **Real-Time Public Chat**: The app features a public chat powered by **Socket.io**, allowing players to interact with each other while they play. Chat messages are delivered instantly, creating a dynamic and social atmosphere.

- **Profit and Loss Calculation**: The game includes a custom **probability function** that calculates the potential profit or loss based on the player's choices, adding a layer of strategy to the gameplay.

- **Real-Time Updates**: Using **Socket.io**, the game and chat are updated in real-time. Players see changes instantly without having to refresh the page.

## Technologies Used

- **Frontend**: 
  - **React.js**: A JavaScript library for building the user interface, making the app fast and interactive.
  - **CSS/HTML**: For styling and structuring the pages.

- **Backend**:
  - **Node.js**: A JavaScript runtime for building the server-side of the app.
  - **Express.js**: A framework for handling requests and serving the frontend.
  - **Socket.io**: To enable real-time communication between the server and players for both the game and the chat.

- **Database**:
  - **MySQL**: A relational database for storing user data, game history, and chat logs.

---
This app brings together exciting gameplay, social interaction, and real-time updates, creating a seamless and fun experience for all users!
