import React, { useState } from "react";
import { createSessionStorage, Link, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import { dummySessions } from "../assets/asset";
import EmptySession from "../components/sessions/EmptySession";
import SessionCard from "../components/sessions/SessionCard";
import SessionDetailModal from "../components/sessions/SessionDetailModal";

const Sessions = () => {
  const [sessions] = useState(dummySessions);
  const [selectedSession, setSelectedSession] = useState(null);
  const navigate = useNavigate();

  const openSessionDetails = (sessionId) => {
    const session = sessions.find(
      (s) => s.id === sessionId || s.meetingId === sessionId,
    );

    if (session) {
      setSelectedSession(session);
    }
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12">
      {/* Page Title & Navigation Header */}
      <Link
        to="/dashboard"
        className="flex items-center text-sm gap-1 text-slate-500 m-4 hover:text-slate-900 transition-colors"
      >
        <ArrowLeftIcon size={14} />
        Go to Dashboard
      </Link>
      <div className="mb-8">
        <h1 className="text-3xl font-medium tracking-tight text-slate-900">
          Meeting sessions.
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your past and active meeting history, participant logs, and
          chat transcript
        </p>
      </div>

      {/* Session Grid / Empty State */}
      {sessions.length === 0 ? (
        <EmptySession />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onOpenDetails={() => openSessionDetails(session.meetingId)}
              onRejoin={(meetingId) => navigate(`/meeting/${meetingId}`)}
            />
          ))}
        </div>
      )}

      {/* Session Detail Modal */}
      <SessionDetailModal
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
      />
    </div>
  );
};

export default Sessions;
