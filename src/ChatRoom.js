import React from "react";

export const ChatRoom = props => {
  const {
    messageInput,
    messages,
    handleMessageChange,
    handleMessageSubmit
  } = props;
  const messagesList = messages.map(message => {
    return (
      <div key={message.messageID}>
        <span className="sender-name">{message.senderName}:</span>
        <span className="message">{message.message}</span>
      </div>
    );
  });
  return (
    <div className="chat-room-container">
      <div className="chat-room-messages">{messagesList}</div>
      <form onSubmit={handleMessageSubmit} className="chat-room-form">
        <input
          name="messageInput"
          type="text"
          value={messageInput}
          onChange={handleMessageChange}
          placeholder="Enter your message"
          autoComplete="off"
          className="chat-room-text-area"
        />
        <input type="submit" value="Send" className="chat-room-send-button" />
      </form>
    </div>
  );
};
