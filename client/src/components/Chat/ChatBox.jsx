import React, { useEffect, useState } from "react";
import socket from "../../socket";
import "./ChatBox.css";

const ChatBox = ({ myEmail, targetEmail }) => {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Always join your own room when ChatBox mounts or myEmail changes
    console.log("ChatBox: Joining room with email:", myEmail);
    socket.emit("join-room", { email: myEmail });

    const handleReceive = ({ sender, message }) => {
      console.log("ChatBox: Received message from", sender, ":", message);
      setMessages((prev) => [...prev, { sender, message }]);
    };
    
    socket.on("receive-message", handleReceive);

    // Cleanup
    return () => {
      socket.off("receive-message", handleReceive);
    };
  }, [myEmail]);

  const handleSend = () => {
    if (msg.trim()) {
      const messageText = msg.trim();
      console.log("ChatBox: Sending message:", {
        sender: myEmail,
        receiver: targetEmail,
        message: messageText,
      });
      
      socket.emit("send-message", {
        sender: myEmail,
        receiver: targetEmail,
        message: messageText,
      });
      
      setMsg("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`chat-container ${isCollapsed ? 'collapsed' : ''}`}>
      <div 
        className={`chat-header ${isCollapsed ? 'collapsed-header' : ''}`}
        onClick={isCollapsed ? toggleCollapse : undefined}
      >
        <span>{isCollapsed ? '💬 Chat' : `Chat with ${targetEmail}`}</span>
        {!isCollapsed && (
          <button className="collapse-btn" onClick={toggleCollapse}>
            −
          </button>
        )}
      </div>
      
      <div className={`chat-content ${isCollapsed ? 'hidden' : ''}`}>
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`chat-bubble ${
                m.sender === myEmail ? "sent" : "received"
              }`}
            >
              <strong>{m.sender === myEmail ? "You" : m.sender}:</strong> {m.message}
            </div>
          ))}
        </div>
        <div className="chat-input-area">
          <input
            type="text"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;