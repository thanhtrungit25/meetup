import { useRef, useEffect, useCallback, useState } from "react";
import { socket } from "../config/socket";
import api from "../config/api.js";

export const useChat = (roomId, user, getToken) => {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const isChatOpenRef = useRef(isChatOpen);
  useEffect(() => {
    isChatOpenRef.current = isChatOpen;
  }, [isChatOpen]);

  // Load messages that were already saved for this meeting.
  useEffect(() => {
    if (!roomId || !user?.id) return;

    let cancelled = false;

    const fetchMessages = async () => {
      try {
        const token = await getToken?.();

        const response = await api.get(
          `/api/meetings/${encodeURIComponent(roomId)}/messages`,
          token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
        );

        if (!cancelled) {
          const history = response.data?.messages || [];

          setMessages((prev) => {
            const combined = [...prev, ...history];

            const unique = new Map();

            combined.forEach((msg) => {
              const key =
                msg?.id !== null
                  ? String(msg.id)
                  : `${msg?.senderId || ""}-${msg?.timestamp || ""}-${msg?.text || ""}`;
              if (!unique.has(key)) unique.set(key, msg);
            });

            return Array.from(unique.values()).sort(
              (a, b) =>
                new Date(a.timestamp || 0).getTime() -
                new Date(b.timestamp || 0).getTime(),
            );
          });
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to fetch meeting chat messages:", error);
        }
      }
    };

    fetchMessages();

    return () => {
      cancelled = true;
    };
  }, [roomId, user?.id, getToken]);

  useEffect(() => {
    if (!roomId) return;
    const handleReceiveMessage = (message) => {
      setMessages((prev) => [...prev, message]);
      if (!isChatOpenRef.current) {
        setUnreadCount((prev) => prev + 1);
      }
    };
    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [roomId]);

  const sendMessage = useCallback(
    (text) => {
      if (!text.trim() || !user) return;

      const message = {
        id: Date.now().toString(),
        text: text.trim(),
        senderName: user.name || user.fullName || "You",
        senderId: user.id,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      socket.emit("send-message", { roomId, message });
    },
    [roomId, user?.id, user?.name],
  );

  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => {
      if (!prev) setUnreadCount(0);
      return !prev;
    });
  }, []);

  return {
    messages,
    sendMessage,
    unreadCount,
    isChatOpen,
    toggleChat,
  };
};
