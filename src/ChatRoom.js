import React, { Component } from "react";
import "./ChatRoom.css";

export class ChatRoom extends Component {
  constructor(props) {
    super(props);
    this.messagesListRef = React.createRef();
  }
  componentDidUpdate() {
    this.scrollToBottom();
  }
  scrollToBottom() {
    this.messagesListRef.current.scrollTop = this.messagesListRef.current.scrollHeight;
  }
  render() {
    const {
      messageInput,
      messages,
      handleMessageChange,
      handleMessageSubmit
    } = this.props;
    const messagesList = messages.map((message, index) => {
      return (
        <div key={message.messageID}>
          <span className="sender-name">{message.senderName}</span>
          <span className="message">{message.message}</span>
        </div>
      );
    });
    return (
      <div className="chat-room-container">
        <div className="chat-room-messages" ref={this.messagesListRef}>
          {messagesList}
        </div>
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
  }
}
