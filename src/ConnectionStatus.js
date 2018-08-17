import React from "react";
import "./ConnectionStatus.css";

export const ConnectionStatusText = ({ connectionStatus }) => {
  const message =
    connectionStatus === "connected"
      ? "You are connected to the server!"
      : connectionStatus === "connecting"
        ? "Trying to make contact with the server!"
        : "There's a problem connecting to the server, try refreshing the page?"; //error

  return <div>{message}</div>;
};

export const ConnectionStatus = ({
  connectionStatus,
  showConnectionStatus
}) => {
  const extraClass = showConnectionStatus ? "" : " hidden";
  return (
    <div className={`connection-status-container${extraClass}`}>
      <span className="connection-status-text">Connection status:</span>
      <div className={`connection-status ${connectionStatus}`} />
    </div>
  );
};
