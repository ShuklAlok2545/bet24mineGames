import { useState } from "react";
import Header from "./component/Header";
import Footer from "./component/Footer";
import Mine from "./component/Mine";
import "./App.css"; 

function App() {
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      <div className="header"><Header /></div>

      <div className="game-container">
         <Mine />
      </div>

      <div className="footer"><Footer /></div>

     
      {!showChat && (
        <div className="chat-toggle" onClick={() => setShowChat(true)}>
          💬 Open Chat
        </div>
      )}

{!showChat && (
  <div className="chat-toggle" onClick={() => setShowChat(true)}>
    💬 Open Chat
  </div>
)}

{showChat && (
  <div className="chatapp-modal">
    <div className="chat-header">
      <button onClick={() => setShowChat(false)}>❌</button>
    </div>
    <iframe
      src="http://localhost:5174/"
      title="Chat Application"
      className="chat-embed"
    />
  </div>
)}

    </>
  );
}

export default App;
