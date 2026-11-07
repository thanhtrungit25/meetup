import React from "react";
import { ArrowRightIcon } from "lucide-react";
import { Link } from "react-router-dom";

const EmptySession = () => {
  return (
    <div className="w-full bg-white/50 backdrop-blur rounded-3xl p-12 xl:py-24 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center space-y-4">
      <h3 className="text-xl lg:text-2xl font-medium text-slate-700">No meeting history yet</h3>
      <p className="text-sm text-slate-500 max-w-md">
        Once you create or join meeting calls, your meeting sessions,
        participants, and chat logs will appear here.
      </p>
      <Link to="/dashboard" className="bg-primary text-white px-6 py-3 flex items-center gap-2 rounded-full hover:bg-primary-hover font-medium transition-all mt-2">
        Start a Meeting
        <ArrowRightIcon className="w-4 h-4" />
      </Link>
    </div>
  );
};

export default EmptySession;
