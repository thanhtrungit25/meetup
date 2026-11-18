import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  CheckIcon,
  Circle,
  CopyIcon,
  FileText,
  Hand,
  MessagesSquareIcon,
  MicIcon,
  MicOffIcon,
  Monitor,
  Palette,
  PhoneOffIcon,
  Settings,
  Smile,
  Square,
  UsersIcon,
  VideoIcon,
  VideoOff,
} from "lucide-react";

const REACTION_EMOJIS = ['🎉', '❤️', '👍', '😂', '👏', '🔥', '🚀', '💯'];

const ControlBar = ({
  roomId,
  audioEnabled,
  videoEnabled,
  isHandRaised,
  isScreenSharing,
  isRecording,
  recordingTime,
  onToggleAudio,
  onToggleVideo,
  onToggleChat,
  onToggleParticipants,
  onToggleNotes,
  onToggleRaiseHand,
  isChatOpen,
  isParticipantsOpen,
  isNotesOpen,
  unreadCount,
  participantCount,
  isHost,
  onSendReaction,
  onOpenWhiteboard,
  onOpenSettings,
  onToggleScreenShare,
  onToggleRecording,
  onLeave,
  onEndMeeting,
}) => {
  const reactionPickerRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [isReactionPickerOpen, setIsReactionPickerOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (reactionPickerRef.current && !reactionPickerRef.current.contains(e.target)) {
        setIsReactionPickerOpen(false);
      }
    }

    if (isReactionPickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isReactionPickerOpen]);

  const copyMeetingId = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Meeting link copied");
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleEmojiClick = (emoji) => {
    if (onSendReaction) {
      onSendReaction(emoji);
    }
    setIsReactionPickerOpen(false);
  }

  return (
    <footer className="w-full bg-white/90 backdrop-blur-md border-t border-slate-200/80 px-6 py-4 flex items-center justify-between z-40 shadow-lg shadow-slate-200/50">
      {/* Left Info / Copy Link */}
      <div className="hidden sm:flex items-center gap-3">
        <span className="text-xs font-medium text-slate-600 font-mono tracking-wider">
          Id: {roomId}
        </span>
        <button
          onClick={copyMeetingId}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 hover:text-slate-900 flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-all"
        >
          {copied ? (
            <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <CopyIcon className="w-3.5 h-3.5" />
          )}
          <span>{copied ? "Copied" : "Copy Link"}</span>
        </button>

        {/* Live Recording Indicator Pill */}
        {isRecording && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            <span>REC {recordingTime}</span>
          </div>
        )}
      </div>

      {/* Center Controls */}
      <div className="flex items-center gap-3 mx-auto sm:mx-0">
        {/* Audio Toggle */}
        <button
          onClick={onToggleAudio}
          className={`p-3.5 rounded-2xl transition-all cursor-pointer border ${
            audioEnabled
              ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-xs"
              : "bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200 shadow-xs"
          }`}
          title={audioEnabled ? "Mute Microphone" : "Unmute Microphone"}
        >
          {audioEnabled ? (
            <MicIcon className="w-5 h-5" />
          ) : (
            <MicOffIcon className="w-5 h-5" />
          )}
        </button>

        {/* Video Toggle */}
        <button
          onClick={onToggleVideo}
          className={`p-3.5 rounded-2xl transition-all cursor-pointer border ${
            videoEnabled
              ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-xs"
              : "bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200 shadow-xs"
          }`}
          title={videoEnabled ? "Turn Off Camera" : "Turn On Camera"}
        >
          {videoEnabled ? (
            <VideoIcon className="w-5 h-5" />
          ) : (
            <VideoOff className="w-5 h-5" />
          )}
        </button>

        {/* Screen Share Toggle */}
        <button
          onClick={onToggleScreenShare}
          className={`p-2.5 sm:p-3 rounded-2xl transition-all border cursor-pointer shrink-0 ${
            isScreenSharing
              ? 'bg-[#0055ff] border-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400/40'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
          }`}
          title={isScreenSharing ? "Stop Sharing Screen" : "Share Screen"}
        >
          <Monitor className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        {/* Chat Toggle */}
        <button
          onClick={onToggleChat}
          className={`p-2.5 rounded-2xl transition-all cursor-pointer border ${
            isChatOpen
              ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
              : "bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-300 shadow-xs relative"
          }`}
          title="Toggle In-Meeting Chat"
        >
          <MessagesSquareIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          {unreadCount > 0 && !isChatOpen && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Participants Toggle */}
        <button
          onClick={onToggleParticipants}
          className={`relative p-2.5 rounded-2xl transition-all cursor-pointer border ${
            isParticipantsOpen
              ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
              : "bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-300 shadow-xs"
          }`}
          title="Toggle Participants List"
        >
          <UsersIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span className="absolute -top-1 -right-1 bg-slate-200 text-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-slate-300">
            {participantCount}
          </span>
        </button>

        {/* Shared Notes Drawer Trigger */}
        <button
          onClick={onToggleNotes}
          className={`relative p-2.5 rounded-2xl transition-all cursor-pointer border ${
            isNotesOpen
              ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
              : "bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-300 shadow-xs"
          }`}
          title="Open Shared Meeting Notes"
        >
          <FileText className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        {/* Raise Hand Toggle */}
        <button
          onClick={onToggleRaiseHand}
          className={`p-2.5 sm:p-3 rounded-2xl transition-all border cursor-pointer shrink-0 ${
            isHandRaised
              ? 'bg-amber-500 border-amber-600 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-300'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
          }`}
          title={isHandRaised ? "Lower Hand" : "Raise Hand"}
        >
          <Hand className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        {/* Live Emoji Reactions Popover */}
        <div className="relative shrink-0" ref={reactionPickerRef}>
          <button
            onClick={() => setIsReactionPickerOpen(!isReactionPickerOpen)}
            className={`p-2.5 sm:p-3 rounded-2xl transition-all border cursor-pointer shrink-0 ${
              isReactionPickerOpen
                ? "bg-blue-50 border-blue-200 text-blue-600"
                : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
            }`}
            title="Reactions"
          >
            <Smile className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          {isReactionPickerOpen && (
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl p-2 flex items-center gap-1.5 border border-slate-200 rounded-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-xl hover:scale-125 transition-transform cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Whiteboard Modal Trigger */}
        <button
          onClick={onOpenWhiteboard}
          className="p-2.5 sm:p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-all cursor-pointer shrink-0"
          title="Open Collaborative Whiteboard"
        >
          <Palette className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        {/* Record Meeting Toggle */}
        <button
          onClick={onToggleRecording}
          className={`p-2.5 sm:p-3 rounded-2xl transition-all border cursor-pointer shrink-0 ${
            isRecording
               ? "bg-rose-600 border-rose-700 text-white shadow-md shadow-rose-500/30 animate-pulse"
               : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
          }`}
          title={isRecording ? "Stop Recording" : "Record Meeting"}
        >
          {isRecording ? <Square className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> : <Circle className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-rose-500 fill-rose-500" />}
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2.5 sm:p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-all cursor-pointer shrink-0"
          title="Audio, Video & Quality Settings"
        >
          <Settings className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        {/* Leave / End Meeting */}
        {isHost ? (
          <button
            onClick={onEndMeeting}
            className="p-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25 transition-all cursor-pointer border border-red-500 ml-2 flex items-center gap-2 text-xs"
            title="End Meeting for All"
          >
            <PhoneOffIcon className="w-5 h-5" />
            <span className="hidden md:inline">End Meeting</span>
          </button>
        ) : (
          <button
            onClick={onLeave}
            className="p-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25 transition-all cursor-pointer border border-red-500 ml-2 flex items-center gap-2 text-xs"
            title="Leave Meeting"
          >
            <PhoneOffIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Right placeholder */}
      <div className="hidden sm:block w-32 text-right">
        <span className="font-medium text-slate-400">MeetUp Room</span>
      </div>
    </footer>
  );
};

export default ControlBar;
