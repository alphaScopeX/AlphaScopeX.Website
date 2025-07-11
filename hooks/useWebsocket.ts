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
      /* Actually, if you set the type of `event` as `MessageEvent<T>`, it will
       * not be sent as `T` but still `string`.
       */
      ws.onmessage = (event: MessageEvent<string>) => {
        setMessage(JSON.parse(event.data));
        console.log("[WebSocket]: Received data");

        // Sometimes the data is very big, so here doesn't need to print the
        // raw data in the console.
      };
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
      console.log(
        `[WebSocket]: Initialization error: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  };

  const send = async (
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
