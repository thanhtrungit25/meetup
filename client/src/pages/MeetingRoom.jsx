import React, { useCallback, useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { dummyMeetingDetails, dummyUser } from "../assets/asset";
import api from "../config/api";
import { useChat } from "../hooks/useChat";
import { useWebRTC } from "../hooks/useWebRTC";
import { useAuth, useUser } from "@clerk/react";
import VideoGrid from "../components/meeting/VideoGrid";
import ChatPanel from "../components/meeting/ChatPanel";
import ParticipantList from "../components/meeting/ParticipantList";
import ControlBar from "../components/meeting/ControlBar";
import Loader from "../components/Loader";

const Meeting = () => {
  const navigate = useNavigate();
  const { meetingId } = useParams();
  const { user } = useUser();

  const { getToken } = useAuth();

  const [meeting, setMeeting] = useState(null);
  const [loadingMeeting, setLoadingMeeting] = useState(true);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);

  const userData = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id,
      name:
        user.fullName ||
        user.firstName ||
        user.primaryEmailAddress?.emailAddress?.split("@")[0] ||
        "User",
      email: user.primaryEmailAddress?.emailAddress || "",
      image: user.imageUrl || "",
    };
  }, [
    user?.id,
    user?.fullName,
    user?.firstName,
    user?.primaryEmailAddress?.emailAddress,
    user?.imageUrl,
  ]);

  console.log("userData:", userData);

  // Fetch meeting details to verify valididy BEFORE enabling WEbRTC camera access
  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const token = await getToken();
        const res = await api.get(`/api/meetings/${meetingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.meeting.status === "ended") {
          toast.error("This meeting has ended");
          navigate("/dashboard");
          return;
        }
        setMeeting(res.data.meeting);
      } catch (error) {
        const errMsg =
          error?.response?.data?.error || "Meeting not found or has ended";
        toast.error(errMsg);
        navigate("/dashboard");
      } finally {
        setLoadingMeeting(false);
      }
    };
    fetchMeeting();
  }, [meetingId, navigate]);

  const handleMeetingEnded = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  // Initialize WebRTC
  const {
    localStream,
    remoteUsers,
    audioEnabled,
    videoEnabled,
    toggleAudio,
    toggleVideo,
    endMeeting,
  } = useWebRTC(meetingId, userData, handleMeetingEnded);

  // Initialize Chat
  const { isChatOpen, toggleChat, messages, sendMessage, unreadCount } =
    useChat(meetingId, userData);

  const hostId = meeting?.host?.id || meeting?.host;
  const isHost = Boolean(
    userData?.id && hostId && hostId.toString() === userData.id.toString(),
  );

  const handleLeave = () => {
    toast("You left the meeting");
    navigate("/dashboard");
  };

  const handleEndMeeting = () => {
    endMeeting();
    toast("Meeting ended for all partitipants");
    navigate("/dashboard");
  };

  if (loadingMeeting) {
    return <Loader title="Joining meeting room..." />;
  }

  return (
    <div className="h-screen w-screen bg-slate-100 text-slate-900 flex flex-col overflow-hidden font-sans">
      {/* Top Bar */}
      <header className="w-full bg-white/90 backdrop-blur-md px-6 py-3 border-b border-slate-200 flex items-center justify-between z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">
            {meeting.title} (
            {meetingId || meeting.meetingId})
          </h2>
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </header>

      {/* Main Content Area (Video Grid + Side Panels) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Video Grid Center */}
        <VideoGrid
          localStream={localStream}
          localUser={userData}
          remoteUsers={remoteUsers}
          audioEnabled={audioEnabled}
          videoEnabled={videoEnabled}
        />

        {/* In-Meeting Chat Drawer */}
        <ChatPanel
          isOpen={isChatOpen}
          onClose={toggleChat}
          messages={messages}
          onSendMessage={sendMessage}
          currentUser={userData}
        />

        {/* Participants Drawer */}
        <ParticipantList
          isOpen={isParticipantsOpen}
          onClose={() => setIsParticipantsOpen(false)}
          localUser={userData}
          localAudio={audioEnabled}
          localVideo={videoEnabled}
          remoteUsers={remoteUsers}
          meetingHostId={dummyUser.id}
        />
      </div>

      {/* Bottom Floating Control Bar */}
      <ControlBar
        roomId={meetingId || meeting.meetingId}
        audioEnabled={audioEnabled}
        videoEnabled={videoEnabled}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleChat={toggleChat}
        onToggleParticipants={() => setIsParticipantsOpen((prev) => !prev)}
        isChatOpen={isChatOpen}
        isParticipantsOpen={isParticipantsOpen}
        unreadCount={unreadCount}
        participantCount={1 + remoteUsers.length}
        isHost={isHost}
        onLeave={handleLeave}
        onEndMeeting={handleEndMeeting}
      />
    </div>
  );
};

export default Meeting;
