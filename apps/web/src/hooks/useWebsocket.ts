import { useEffect, useRef, useState } from "react";

export const useWebsocket = (url: string) => {
  const [data, setData] = useState<string>("");
  const [error] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  const sendMessage = ((message: any) => {
    if (isConnected) {
      ws.current?.send(JSON.stringify(message));
    }
  });

  useEffect(() => {
    ws.current = new WebSocket(url);
    ws.current.onopen = () => {
      setIsConnected(true)
      console.log("Connected to ws");
    };
    ws.current.onmessage = (message) => {
      setData(message.data.toString());
    };
    ws.current.onerror = (error) => {
      setData(error.toString());
    };
    ws.current.onclose = () => {
      console.log("Connection closed");
    };
    return () => {
      ws.current?.close();
    };
  }, []);

  return { data, error, sendMessage, isConnected, ws: ws.current }
};
