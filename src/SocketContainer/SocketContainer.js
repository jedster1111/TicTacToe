import React, { Component } from "react";
import io from "socket.io-client";
import { ENVIRONMENT } from "../GameContainer/environmentCheck";

export function withSocket(WrappedComponent) {
  class withSocket extends Component {
    constructor(props) {
      super(props);
      let socket;
      if (ENVIRONMENT === "development") {
        let LOCALIP = process.env.REACT_APP_LOCAL_IP || "localhost";
        if (LOCALIP === "localhost") {
          console.log(
            `You are running on ${LOCALIP}, see readme to set environment variable for local ip if you want to test on multiple devices!`
          );
        } else {
          console.log(`You are running on ${LOCALIP}`);
        }
        socket = io(`http://${LOCALIP}:8000`);
      } else {
        socket = io();
      }
      this.state = {
        socket: socket
      };
    }
    render() {
      return <WrappedComponent socket={this.state.socket} {...this.props} />;
    }
  }
  withSocket.displayName = `WithSocket(${getDisplayName(WrappedComponent)})`;
  return withSocket;
}
function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
}
