'use client';

import { useWebsocket } from "@/hooks/useWebsocket";
import React, { createContext, useContext } from "react";

type Props = {
  children: React.ReactNode;
};

const WebSocketContext = createContext<{
  data: string;
  error: string;
  isConnected: boolean;
  sendMessage: (event: any) => void;
  ws: WebSocket | null;
} | null>(null);

const WebSocketProvider = ({ children }: Props) => {
  const { data, error, isConnected, sendMessage, ws } = useWebsocket(
    "https://simple-blockchain-o3o4.onrender.com/"
  );
  return (
    <WebSocketContext.Provider
      value={{ data, error, isConnected, sendMessage, ws }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebsocketContext = () => useContext(WebSocketContext);

export default WebSocketProvider;
