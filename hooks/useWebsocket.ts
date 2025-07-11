import { useEffect, useRef, useState } from "react";

const RECONNECT_INTERVAL = 5000;

export default function useWebsocket<T>(url: string) {
  /* prettier-ignore */
  const [message, setMessage] = useState<T | null>(null);
  /* prettier-ignore */
  const [isConnected, setIsConnected] = useState<boolean>(false);
  /* prettier-ignore */
  const [error, setError] = useState<string>("");

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleReconnect = () => {
    clearTimeout(reconnectTimeoutRef.current ?? undefined);
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, RECONNECT_INTERVAL);
  };

  const connect = () => {
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError("");
        console.log(`[WebSocket]: Connected to ${url}`);
      };
      ws.onmessage = (event: MessageEvent<T>) => setMessage(event.data);
      ws.onclose = (event: CloseEvent) => {
        setIsConnected(false);
        if (event.code !== 1000) {
          handleReconnect();
          console.log(
            `[WebSocket]: Close with an error ${event.reason} (code ${event.code}), attempting to reconnect in 5s`
          );
        }
      };
      ws.onerror = () => {
        setError("[WebSocket]: Connection error.");
        setIsConnected(false);
        handleReconnect();
      };
    } catch (error) {
      setError("[WebSocket]: Initialization error.");
    }
  };

  const send = (
    data: WebSocket["send"] extends (data: infer T) => void ? T : never
  ) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
      console.log(`[WebSocket]: Sent message ${data}`);
    } else {
      console.warn("[WebSocket]: Connection has not been prepared yet.");
    }
  };

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close(1000, "User closes the connection");
      clearTimeout(reconnectTimeoutRef.current ?? undefined);
    };
  }, [url]);

  return {
    message,
    isConnected,
    send,
    error,
  };
}
