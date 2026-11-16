import { Download, Edit3, Eraser, Sparkles, Trash2, X } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import { socket } from "../../config/socket";
import toast from "react-hot-toast";

const COLORS = [
  "#0f172a",
  "#0055ff",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#f59e0b",
];
const STROKE_WIDTHS = [2, 4, 8, 16];

const WhiteboardModal = ({ isOpen, onClose, roomId }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#0055ff");
  const [width, setWidth] = useState(4);
  const [tool, setTool] = useState("pen"); // 'pen' | 'highlighter' | 'eraser'
  const prevPointRef = useRef(null);

  // Setup canvas resolution & socket listeners
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Set internal resolution matching display
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Socket listener: draw from peer
    const handleRemoteDraw = ({ prevPoint, currentPoint, color: remoteColor, width: remoteWidth, mode }) => {
      if (!ctx) return;
      ctx.beginPath();
      ctx.moveTo(prevPoint.x, prevPoint.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);

      if (mode === 'eraser') {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = remoteWidth * 2;
        ctx.globalAlpha = 1.0;
      } else if (mode === 'highlighter') {
        ctx.strokeStyle = remoteColor;
        ctx.lineWidth = remoteWidth * 3;
        ctx.globalAlpha = 0.35;
      } else {
        ctx.strokeStyle = remoteColor;
        ctx.lineWidth = remoteWidth;
        ctx.globalAlpha = 1.0;
      }

      ctx.stroke();
    };

    const handleRemoteClear = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      toast("Whiteboard cleared by participant");
    }

    socket.on("draw-line", handleRemoteDraw);
    socket.on("whiteboard-cleared", handleRemoteClear);

    return () => {
      socket.off('draw-line', handleRemoteDraw);
      socket.off('whiteboard-cleared', handleRemoteClear);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getCanvasPoint = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const startDrawing = (e) => {
    const point = getCanvasPoint(e);
    if (!point) return;
    setIsDrawing(true);
    prevPointRef.current = point;
  }

  const draw = (e) => {
    if (!isDrawing || !prevPointRef.current) return;
    const currentPoint = getCanvasPoint(e);
    if (!currentPoint) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.moveTo(prevPointRef.current.x, prevPointRef.current.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);

    if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = width * 2;
      ctx.globalAlpha = 1.0;
    } else if (tool === 'highlighter') {
      ctx.strokeStyle = color;
      ctx.lineWidth = width * 3;
      ctx.globalAlpha = 0.35;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.globalAlpha = 1.0;
    }

    ctx.stroke();

    // Broadcast stroke to room peers
    socket.emit("draw-line", {
      roomId: roomId,
      prevPoint: prevPointRef.current,
      currentPoint,
      color,
      width,
      mode: tool,
    });

    prevPointRef.current = currentPoint;
  }

  const stopDrawing = () => {
    setIsDrawing(false);
    prevPointRef.current = null;
  }

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear-whiteboard', { roomId: roomId });
    toast.success("Whiteboard cleared");
  }

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create temporary white-background canvas for clean download
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvas, 0, 0);

    const imageURL = tempCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `meetup-whiteboard-${roomId}.png`;
    link.href = imageURL;
    link.click();
    toast.success("Whiteboard image saved!");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-150">
      {/* Modal Container */}
      <div className="bg-white rounded-4xl w-full max-w-5xl h-[85vh] shadow-2xl overflow-hidden flex flex-col border border-slate-200">
        {/* Header Toolbar */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          {/* Left: Tools */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
              <button
                onClick={() => setTool("pen")}
                className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  tool === "pen"
                    ? "bg-[#0055ff] text-white shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                title="Pen Tool"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setTool("highlighter")}
                className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  tool === "highlighter"
                    ? "bg-[#0055ff] text-white shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                title="Highlighter"
              >
                <Sparkles className="w-4 h-4" />
              </button>

              <button
                onClick={() => setTool("eraser")}
                className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  tool === "eraser"
                    ? "bg-[#0055ff] text-white shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                title="Eraser"
              >
                <Eraser className="w-4 h-4" />
              </button>
            </div>

            {/* Color Palette */}
            {tool !== "eraser" && (
              <div
                className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-2xl border border-slate-200 shadow-2xs"
              >
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                      color === c
                        ? "scale-125 ring-2 ring-blue-500 ring-offset-1"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: c }}
                  ></button>
                ))}
              </div>
            )}

            {/* Width Selector */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
              {STROKE_WIDTHS.map((w) => (
                <button
                  key={w}
                  onClick={() => setWidth(w)}
                  className={`h-7 w-7 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    width === w ? "bg-slate-200 font-bold" : "hover:bg-slate-100"
                  }`}
                >
                  <span
                    className="rounded-full bg-slate-900"
                    style={{
                      width: `${Math.max(w / 1.5, 3)}px`,
                      height: `${Math.max(w / 1.5, 3)}px`
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0055ff] hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PNG</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer ml-1"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Interactive Canvas Stage */}
        <div className="grow relative bg-white overflow-hidden cursor-crosshair">
          <canvas
            ref={canvasRef}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
            className="w-full h-full block touch-none"
          />
        </div>
      </div>
    </div>
  );
};

export default WhiteboardModal;
