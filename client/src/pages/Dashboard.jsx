import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ArrowRightIcon,
  KeyboardIcon,
  PlusIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { dummyStats, dummyUser } from "../assets/asset";

const Dashboard = () => {
  const user = dummyUser;
  const userName = user.fullName;
  const userEmail = user.primaryEmailAddress.emailAddress;
  const navigate = useNavigate();

  const [isCreating, setIsCreating] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const stats = dummyStats;

  const [joinId, setJoinId] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCreateMetting = () => {
    setIsCreating(true);
    const chars = "abcdefghijklmnopqrstuvwxyz";
    const seg = () =>
      Array.from(
        { length: 3 },
        () => chars[Math.floor(Math.random() * chars.length)],
      ).join("");
    const newMeetingId = `${seg()}-${seg()}-${seg()}`;

    setTimeout(() => {
      setIsCreating(false);
      toast.success("Meeting created!");
      navigate(`/meeting/${newMeetingId}`);
    }, 400);
  };

  const handleJoinMetting = (e) => {
    e.preventDefault();
    const cleanId = joinId.trim();
    if (!cleanId) {
      toast.error("Please enter a valid meeting ID");
      return;
    }
    navigate(`/meeting/${cleanId}`);
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12 flex flex-col justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column - Actions */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 pr-6 py-2 bg-white/25 text-xs font-medium rounded-full">
              <ShieldCheckIcon size={16} />
              Secure Peer-to-Peer Encryption <br />
            </div>
            <h1 className="text-4xl sm:text-5xl text-slate-800 leading-tight font-medium">
              High quality video calls. <br />
              <span className="text-primary">Build for everyone.</span>
            </h1>
            <p className="text-slate-700 text-base sm:text-lg max-w-xl leading-relaxed">
              connect, collaborate, and celebrate from anywhere with ultra-low
              latency video, screen sharing, and real-time chat.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={handleCreateMetting}
                disabled={isCreating}
                className="bg-primary text-white px-6 py-3.5 rounded-full flex items-center justify-center gap-2.5 hover:bg-primary-hover font-medium shadow-md shadow-primary/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <PlusIcon className="w-5 h-5" />
                <span>{isCreating ? "Creating..." : "New Meeting"}</span>
              </button>

              <form
                onSubmit={handleJoinMetting}
                className="flex-1 flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <KeyboardIcon className="h-5 w-5 text-primary/90 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Enter meeting code (e.g. abd-ghi)"
                    value={joinId}
                    onChange={(e) => setJoinId(e.target.value)}
                    className="w-full bg-white/75 border border-primary-border/80 focus:border-primary/60 focus:ring-1 focus:ring-primary/60 outline-none rounded-full pl-12 pr-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!joinId.trim()}
                  className="bg-slate-900 text-white font-medium px-6 py-3.5 rounded-full flex items-center justify-center cursor-pointer shadow-xs hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 transition-all"
                >
                  <span>Join</span>
                  <ArrowRightIcon className="w-4 h-4 ml-1.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
        {/* Right Column - Hero graphic & Clock Card */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-4">
          <div className="w-full bg-white/25 backdrop-blur rounded-4xl p-8 border border-slate-200 text-center space-y-6 relative overflow-hidden">
            <div className="space-y-1">
              <p className="mb-5 text-xl text-left">
                Hi, <span className="font-medium">{userName}</span>
              </p>

              <h2 className="text-4xl xl:text-7xl my-4 text-slate-900 tracking-wide">
                {currentTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </h2>
              <p className="font-medium tracking-wider text-primary">
                {currentTime.toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="pt-4 border-t border-white/30 text-sm text-slate-600">
              <div className="flex items-center justify-between py-6 px-4">
                <p>
                  Logged in as: <span className="">{userEmail}</span>
                </p>
                <span
                  className={`px-4 py-1 font-semibold text-xs uppercase rounded-full ${
                    stats?.plan === "premium"
                      ? "bg-blue-700 text-white"
                      : "bg-white text-slate-800"
                  }`}
                >
                  {stats?.plan || "Free"}
                </span>
              </div>

              {stats && (
                <div className="w-full bg-white/50 rounded-2xl px-5 py-4 border border-slate-100">
                  <div className="flex items-center justify-between text-sm">
                    <span>Montly Meetings</span>
                    <span className="text-xs text-slate-600 font-mono">
                      {stats.monthlyLimit
                        ? `${stats.monthlyCount} / ${stats.monthlyLimit} Used`
                        : `${stats.monthlyCount} Created (Unlimted)`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
