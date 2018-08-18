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
      <div>
        <span>{message.message}</span>
        <span>{message.sender}</span>
      </div>
    );
  });
  return (
    <div className="chat-room-container">
      <div className="chat-room-messages">{messagesList}</div>
      <form onSubmit={handleMessageSubmit} className="chat-room-form">
        <textarea
          name="messageInput"
          value={messageInput}
          onChange={handleMessageChange}
          placeholder="Enter your message"
          className="chat-room-text-area"
        />
        <input type="submit" value="Send" className="chat-room-send-button" />
      </form>
    </div>
  );
};
