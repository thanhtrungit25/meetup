import { use, useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export const useRecording = (roomId) => {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const recordingStreamRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const mediaRecorderRef = useRef(null);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isRecording) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1)
      }, 1000);
    } else {
      setSeconds(0);
    }

    return () => clearInterval(interval);
  }, [isRecording]);

  const formattedTime = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  const startRecording = useCallback(async () => {
    try {
      // 1. Capture screen video + tab/system audio
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: true,
      });

      // 2. Try to capture microphone audio as well to mix
      let micStream = null;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (error) {
        console.warn("No mic stream available for recording mix:", e.message);
      }

      // combine tracks
      const tracks = [...displayStream.getVideoTracks()];
      if (displayStream.getAudioTracks().length > 0) {
        tracks.push(...displayStream.getAudioTracks());
      }
      if (micStream && micStream.getAudioTracks().length > 0) {
        tracks.push(...micStream.getAudioTracks());
      }

      const combinedStream = new MediaStream(tracks);
      recordingStreamRef.current = combinedStream;
      recordedChunksRef.current = [];

      const recorder = new MediaRecorder(combinedStream, {
        mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : "video/webm",
      });

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `meetup-recording-${roomId || 'session'}-${new Date().toISOString().slice(0, 10)}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("Meeting recording downloaded!");
      };

      // Handle user stopping screen capture from browser banner
      displayStream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      recorder.start(1000); // 1-second chunks
      
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      toast("Meeting recording started 🔴", { icon: "🎥" });
    } catch (err) {
      if (err.name !== "NotAllowedError") {
        toast.error("Failed to start recording");
        console.error("Recording error:", err);
      }
    }
  }, [roomId]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (recordingStreamRef.current) {
      recordingStreamRef.current.getTracks().forEach((track) => track.stop());
      recordingStreamRef.current = null;
    }

    setIsRecording(false);
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    recordingTime: formattedTime,
    startRecording,
    stopRecording,
    toggleRecording,
  };
};
