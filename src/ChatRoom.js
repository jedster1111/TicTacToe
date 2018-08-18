import React, { Component } from "react";
import "./ChatRoom.css";

export class ChatRoom extends Component {
  constructor(props) {
    super(props);
    this.messagesListRef = React.createRef();
  }
  getSnapshotBeforeUpdate(prevProps) {
    if (prevProps.messages.length !== this.props.messages.length) {
      const messagesList = this.messagesListRef.current;
      return {
        scrollTop: messagesList.scrollTop,
        scrollHeight: messagesList.scrollHeight
      };
    }
    return null;
  }
  componentDidUpdate(prevProps, prevState, prevScrollData) {
    const messageListRef = this.messagesListRef.current;
    const prevMessages = prevProps.messages;
    const prevLastMessage = prevMessages[prevMessages.length - 1];
    const messages = this.props.messages;
    const lastMessage = messages[messages.length - 1];
    const isArray = this.isArray();
    const shouldScroll =
      isArray(prevMessages) &&
      isArray(messages) &&
      prevLastMessage.messageID !== lastMessage.messageID;
    const shouldScrollToBottom =
      shouldScroll &&
      prevScrollData.scrollTop + messageListRef.clientHeight ===
        prevScrollData.scrollHeight;
    if (shouldScrollToBottom) {
      this.scrollToBottom();
    } else if (shouldScroll) {
      this.scrollToPrevious(prevScrollData.scrollTop);
    }
  }
  isArray() {
    return array => Array.isArray(array) && array.length;
  }
  scrollToBottom() {
    this.messagesListRef.current.scrollTop = this.messagesListRef.current.scrollHeight;
  }
  scrollToPrevious(prevScrollTop) {
    this.messagesListRef.current.scrollTop = prevScrollTop;
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
