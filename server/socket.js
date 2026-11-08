import { sql } from "./config/db.js";

// Socket.IO Room State: roomId -> Map<socketId, participantObject>
const rooms = new Map();

export function setupSocketIO(io) {
  io.on("connection", (socket) => {
    let currentRoomId = null;
    let currentUser = null;

    // User joins a meeting room
    socket.on(
      "join-room",
      async ({ roomId, user, audioEnabled = true, videoEnabled = true }) => {
        try {
          // Verify meeting status from DB
          const meetings =
            await sql`SELECT * FROM meetings WHERE meeting_id = ${roomId}`;

          if (meetings.length === 0) {
            socket.emit("meeting-ended", { message: "Meeting not found." });
            return;
          }

          const meeting = meetings[0];

          if (meeting.status === "ended") {
            socket.emit("meeting-ended", {
              message: "This meeting has already ended.",
            });
            return;
          }

          currentRoomId = roomId;
          const isHost =
            meeting?.host_id &&
            user?.id &&
            meeting.host_id.toString() === user?.id.toString();

          currentUser = {
            socketId: socket.id,
            userId: user?.id,
            userName: user?.name || "Anonymous",
            isHost,
            audioEnabled,
            videoEnabled,
          };

          if (!rooms.has(roomId)) {
            rooms.set(roomId, new Map());
          }

          const roomParticipants = rooms.get(roomId);

          // Fetch host plan to enforce participants limits (10 for Free, 100 for Premium)
          const hosts =
            await sql`SELECT plan FROM users WHERE id = ${meeting.host_id}`;
          const hostPlan = hosts[0]?.plan || "free";
          const maxParticipants = hostPlan === "premium" ? 100 : 10;

          if (roomParticipants.size >= maxParticipants) {
            socket.emit("meeting-ended", {
              message: `Meeting capacity limit reached (max ${maxParticipants} participants for ${hostPlan.toUpperCase()} plan). Host must upgrade to Premium for up to 100 participants!`,
            });
            return;
          }
          socket.join(roomId);

          // Get existing participants in the room
          const existingUsers = Array.from(roomParticipants.values());

          // Add new participant to socket state
          roomParticipants.set(socket.id, currentUser);

          // Save participant into DB if not already present
          const userId = user?.id || null;
          const existingParticipants = await sql`
            SELECT id FROM meeting_participants
            WHERE meeting_id = ${meeting.id}
            AND (
              (${userId}::text IS NOT NULL AND user_id = ${userId}) OR (${userId}::text IS NULL AND name = ${currentUser.userName})
            )
        `;

          if (existingParticipants.length === 0) {
            await sql`
            INSERT INTO meeting_participants (meeting_id, user_id, name, joined_at)
            VALUES (${meeting.id}, ${userId}, ${currentUser.userName}, NOW())
          `;
          }

          // Send list of existing users to the newcomer
          socket.emit("all-users", existingUsers);

          // Notify everyone else in the room
          socket.to(roomId).emit("user-joined", currentUser);
        } catch (error) {
          console.error("Error joining room in socket:", error);
          socket.emit("meeting-ended", { message: "Failed to join room." });
        }
      },
    );

    // WebRTC Signaling: Offer
    // send the information needed to start the connection
    socket.on("offer", ({ targetSocketId, callerSocketId, sdp }) => {
      io.to(targetSocketId).emit("offer", {
        callerSocketId,
        sdp,
        callerUser: currentUser,
      });
    });

    // WebRTC Signaling: Answer
    // accept the offer request and process the connection
    socket.on("answer", ({ targetSocketId, responderSocketId, sdp }) => {
      io.to(targetSocketId).emit("answer", {
        responderSocketId,
        sdp,
      });
    });

    // WebRTC Signaling: ICE Candidate
    // passes the connection details from one user to the other so WebRTC can figure our how to connect them directly.
    socket.on(
      "ice-candidate",
      ({ targetSocketId, senderSocketId, candidate }) => {
        io.to(targetSocketId).emit("ice-candidate", {
          senderSocketId,
          candidate,
        });
      },
    );

    // Audio toggle event
    socket.on("toggle-audio", ({ roomId, audioEnabled }) => {
      if (rooms.has(roomId) && rooms.get(roomId).has(socket.id)) {
        rooms.get(roomId).get(socket.id).audioEnabled = audioEnabled;
      }
      socket.to(roomId).emit("user-toggled-audio", {
        socketId: socket.id,
        audioEnabled,
      });
    });

    // Video toggle event
    socket.on("toggle-video", ({ roomId, videoEnabled }) => {
      if (rooms.has(roomId) && rooms.get(roomId).has(socket.id)) {
        rooms.get(roomId).get(socket.id).videoEnabled = videoEnabled;
      }
      socket.to(roomId).emit("user-toggled-video", {
        socketId: socket.id,
        videoEnabled,
      });
    });

    // Chat message event -> persist to DB & broadcast
    socket.on("send-message", async ({ roomId, message }, acknowledge) => {
      if (!roomId || !message?.text?.trim()) {
        acknowledge?.({ ok: false, error: "Message cannot be empty" });
        return;
      }

      try {
        const meetings =
          await sql`SELECT id, status FROM meetings WHERE meeting_id = ${roomId} LIMIT 1`;

        if (meetings.length === 0) {
          acknowledge?.({ ok: false, error: "Meeting not found" });
          return;
        }

        const meeting = meetings[0];
        if (meeting.status === "ended") {
          acknowledge?.({ ok: false, error: "This meeting has ended" });
          return;
        }

        // The sender is taken from authenticated/registered socket
        // participant instead of trusting a client-supplied sender ID.
        const senderId = currentUser?.userId || message.senderId || null;
        const senderName = currentUser?.userName || meeting?.senderName || "Anonymous";
        const text = message.text.trim();

        // Ensure the socket is actually in this meeting before writing.
        if (currentRoomId !== roomId || !currentUser) {
          acknowledge?.({
            ok: false,
            error: "You are not connected to this meeting",
          });
          return;
        }


        const [savedMessage] = await sql`
          INSERT INTO meeting_messages
            (meeting_id, sender_id, sender_name, text, timestamp)
          VALUES
            (${meeting.id}, ${senderId}, ${senderName}, ${text}, NOW())
          RETURNING id, sender_id, sender_name, text, timestamp
        `;

        const chatMessage = {
          id: savedMessage.id,
          roomId,
          senderId: savedMessage.sender_id,
          senderName: savedMessage.sender_name,
          text: savedMessage.text,
          timestamp: savedMessage.timestamp,
          time: new Date(savedMessage.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          senderSocketId: socket.id,
        };

        io.in(roomId).emit("receive-message", chatMessage);
        acknowledge?.({ ok: true, message: chatMessage });
      } catch (error) {
        console.error("Error saving chat message to DB:", error);
        acknowledge?.({ ok: false, message: "Failed to save chat message" });
      }
    });

    // Host explicitly ends meeting for all via End Meeting button
    socket.on("end-meeting", async ({ roomId }) => {
      try {
        await sql`
          UPDATE meetings
          SET status = 'ended', ended_at = NOW()
          WHERE meeting_id = ${roomId}`;

        io.to(roomId).emit("meeting-ended", {
          message: "The meeting has been ended by the host.",
        });
        rooms.delete(roomId);
      } catch (error) {
        console.error("Error endign meeting:", error);
      }
    });

    // Handle Disconnect (Reloading window, network drop, or closing tab)
    socket.on("disconnect", () => {
      if (currentRoomId && rooms.has(currentRoomId)) {
        const roomParticipants = rooms.get(currentRoomId);
        roomParticipants.delete(socket.id);

        if (roomParticipants.size === 0) {
          rooms.delete(currentRoomId);
        } else {
          // Notify remaining peers that a user disconnect
          socket.to(currentRoomId).emit("user-left", {
            socketId: socket.id,
            user: currentUser,
          });
        }
      }
    });
  });
}
