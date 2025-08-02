import React, { useEffect, useState } from "react";
import socket from "../../socket";

const ChatBox = ({ myEmail, targetEmail }) => {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    socket.emit("join-room", { email: myEmail });

    socket.on("receive-message", ({ sender, message }) => {
      if (sender === targetEmail || sender === myEmail) {
        setMessages((prev) => [...prev, { sender, message }]);
      }
    });

    return () => {
      socket.off("receive-message");
    };
  }, [myEmail, targetEmail]);

  const handleSend = () => {
    if (msg.trim()) {
      socket.emit("send-message", {
        sender: myEmail,
        receiver: targetEmail,
        message: msg,
      });

      setMessages((prev) => [...prev, { sender: myEmail, message: msg }]);
      setMsg("");
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`chat-bubble ${
              m.sender === myEmail ? "sent" : "received"
            }`}
          >
            <strong>{m.sender === myEmail ? "You" : targetEmail}:</strong> {m.message}
          </div>
        ))}
      </div>
      <div className="chat-input-area">
        <input
          type="text"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatBox;
