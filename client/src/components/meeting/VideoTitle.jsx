import { MicOffIcon, UserIcon, VideoOffIcon, Wifi } from "lucide-react";
import React, { useEffect, useRef } from "react";

const VideoTitle = ({
  stream,
  name,
  isLocal = false,
  audioEnabled = true,
  videoEnabled = true,
  isHandRaised,
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`relative group w-full h-full min-h-50 rounded-2xl overflow-hidden shadow-md flex items-center justify-center border ${isHandRaised ? "border-amber-400 ring-2 ring-amber-300" : "border-slate-300"}`}>

      {/* Top Left: Raised Hand Badge */}
      <div className="absolute top-3.5 left-3.5 flex items-center gap-2 z-10">
        {isHandRaised && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold shadow-md animate-bounce">
            <span>✋</span>
            <span>Hand Raised</span>
          </div>
        )}
      </div>

      {/* Top Right Overlay Actions (Network indicator) */}
      <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 z-10">
        <div className="px-2 py-1 rounded-full bg-slate-900/60 backdrop-blur-xs text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
          <Wifi className="w-3 h-3" />
          <span>HD</span>
        </div>
      </div>

      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          videoEnabled
            ? "opacity-100"
            : "opacity-0 pointer-events-none absolute"
        } ${isLocal ? "-scale-x-100" : ""}`}
      />

      {/* Camera off placeholder */}
      {!videoEnabled && (
        <div className="flex flex-col items-center justify-center space-y-3 z-10">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-indigo-400/40 flex items-center justify-center bg-linear-to-tr from-blue-600 to-indigo-500 text-white text-2xl font-bold uppercase shadow-inner">
            {name ? name.charAt(0) : <UserIcon className="w-8 h-8" />}
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700/60 flex items-center gap-1.5 shadow-xs">
            <VideoOffIcon className="w-3.5 h-3.5 text-rose-400" />
            Camera Off
          </span>
        </div>
      )}

      {/* Bottom Info Bar Overlay */}
      <div className="absolute bottom-3 left-3 flex items-center justify-between z-20 pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-xs font-medium text-white shadow-md">
          <span>
            {name} {isLocal ? "(You)" : ""}
          </span>
          {!audioEnabled && (
            <span className="p-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40">
              <MicOffIcon className="w-3 h-3" />
            </span>
          )}

        </div>
      </div>
    </div>
  );
};

export default VideoTitle;
