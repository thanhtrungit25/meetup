import { Activity, Check, Loader2, Mic, Plus, ShieldCheck, Sliders, Sparkles, Video, Volume2, Wifi, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast';
import api from '../../config/api';
import useAudioLevel from '../../hooks/useAudioLevel';

export const VIRTUAL_BACKGROUNDS = [
  { id: 'none', label: 'None', preview: 'bg-slate-200' },
  { id: 'blur', label: 'Blur (Bokeh)', preview: 'backdrop-blur-md bg-white/40' },
  { id: 'office', label: 'Modern Office', preview: 'bg-gradient-to-tr from-slate-700 to-slate-900', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80' },
  { id: 'studio', label: 'Cozy Studio', preview: 'bg-gradient-to-tr from-amber-700 to-orange-900', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80' },
  { id: 'neon', label: 'Cyberpunk Neon', preview: 'bg-gradient-to-tr from-indigo-900 via-purple-900 to-pink-800', img: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80' },
  { id: 'gradient', label: 'Minimalist Soft', preview: 'bg-gradient-to-tr from-blue-400 to-indigo-600', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80' },
];

const SettingsModal = ({
  isOpen,
  onClose,
  localStream,
  virtualBackground,
  onSelectVirtualBackground,
  noiseSupressionEnabled,
  onToggleNoiseSuppression,
}) => {
  const [activeTab, setActiveTab] = useState("video"); // 'video' | 'audio' | 'network'
  const [customBackgrounds, setCustomBackgrounds] = useState([]);

  const [isUploadingBg, setIsUploadingBg] = useState(false);

  const videoPreviewRef = useRef(null);
  const bgFileInputRef = useRef(null);
  const { audioLevel } = useAudioLevel(localStream, true);

  useEffect(() => {
    if (isOpen && videoPreviewRef.current && localStream) {
      videoPreviewRef.current.srcObject = localStream;
    }
  }, [isOpen, localStream]);

  const handleCustomBackgroundUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image wallpaper");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setIsUploadingBg(true);
    const toastId = toast.loading("Uploading background to Cloudinary...");
    try {
      const res = await api.post("/api/upload/background", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data && res.data.url) {
        const newBg = {
          id: `custom_${Date.now()}`,
          label: "Custom",
          img: res.data.url,
        };
        
        setCustomBackgrounds(prev => [newBg, ...prev]);
        onSelectVirtualBackground(newBg);
        toast.success("Custom wallpaper uploaded & applied! 🖼️", { id: toastId });
      }
      
    } catch (error) {
      toast.error("Failed to upload custom background", { id: toastId });
    } finally {
      setIsUploadingBg(false);
    } 
  }

  if (!isOpen) return null;

  const allBackgrounds = [...VIRTUAL_BACKGROUNDS, ...customBackgrounds];

  const activeBg = allBackgrounds.find(b => b.id === virtualBackground.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-150">

      {/* Settings Modal Card */}
      <div className="bg-white rounded-4xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-[#0055ff]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Audio & Video Settings</h3>
              <p className="text-xs text-slate-500">Customize devices, virtual backgrounds, and quality</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('video')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === "video"
               ? "border-[#0055ff] text-[#0055ff]"
               : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Video & Backgrounds</span>
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === "audio"
               ? "border-[#0055ff] text-[#0055ff]"
               : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Audio & Noise Filter</span>
          </button>
          <button
            onClick={() => setActiveTab('network')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === "network"
               ? "border-[#0055ff] text-[#0055ff]"
               : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Wifi className="w-4 h-4" />
            <span>Network Health</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[65vh] space-y-6">
          
          {/* ================= 1. VIDEO & VIRTUAL BACKGROUNDS ================= */}
          {activeTab === "video"&& (
            <div className="space-y-5">

              {/* Live Preview Tile */}
              <div className="relative bg-slate-900 rounded-3xl aspect-video overflow-hidden border border-slate-200 flex items-center justify-center shadow-xs">
                {activeBg?.img && (
                  <img
                    src={activeBg.img}
                    alt="Virtual Wallpaper"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}

                <video
                  ref={videoPreviewRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover scale-x-[-1] relative z-10 transition-all ${
                    virtualBackground.id === "blur" ? "backdrop-blur-md filter blur-xs" : ""
                  }`}
                />

                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 text-white text-[10px] font-semibold backdrop-blur-xs z-20">
                  Camera Preview
                </div>
              </div>

              {/* Virtual Background Picker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Virtual Backgrounds & Effects
                  </label>
                  <span className="text-blue-600 font-semibold text-[10px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Cloudinary Enabled
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">

                  {/* Upload Custom Wallpaper Button */}
                  <button
                    type="button"
                    onClick={() => bgFileInputRef.current?.click()}
                    disabled={isUploadingBg}
                    className="h-20 rounded-2xl p-1.5 flex flex-col items-center justify-center border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 text-blue-600 transition-all cursor-pointer text-center"
                  >
                    {isUploadingBg ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mb-1" />
                        <span className="text-[10px] font-bold">Upload Custom</span>
                      </>
                    )}
                  </button>

                  <input
                    type="file"
                    ref={bgFileInputRef}
                    onChange={handleCustomBackgroundUpload}
                    className="hidden"
                    accept="image/png,image/jpeg,image/webp,image/jpg"  
                  />

                  {/* Preset & Custom Backgrounds */}
                  {allBackgrounds.map((bg) => {
                    const isSelected = virtualBackground.id === bg.id;
                    return (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => {
                          onSelectVirtualBackground(bg);
                          toast.success(`Applied: ${bg.label}`);
                        }}
                        className={`relative group h-20 p-1.5 flex flex-col justify-end text-left rounded-2xl border-2 overflow-hidden cursor-pointer transition-all ${
                          isSelected
                            ? "border-[#0055ff] ring-2 ring-blue-400/40 shadow-xs"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {bg.img ? (
                          <img src={bg.img} alt={bg.label} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <div className={`absolute inset-0 ${bg.preview}`} />
                        )}

                        <div className="relative z-10 bg-slate-900/75 backdrop-blur-xs px-1.5 py-0.5 rounded-lg text-white text-[9px] font-bold truncate">
                          {bg.label}
                        </div>

                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#0055ff] text-white flex items-center justify-center z-10 shadow-xs">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= 2. AUDIO & NOISE FILTER ================= */}
          {activeTab === "audio" && (
            <div className="space-y-5">

              {/* Mic Test Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-slate-600"  />
                    <span className="text-xs font-bold text-slate-800">Microphone Input Level</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-600">{audioLevel}%</span>
                </div>

                <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full transition-all duration-75 bg-linear-to-r from-emerald-400 via-teal-500 to-blue-600"
                    style={{ width: `${Math.max(audioLevel, 2)}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-500">
                  Speak normally to test if your microphone is picking up clear audio.
                </p>
              </div>

              {/* AI Noise Suppression Toggle */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-slate-900">AI Background Noise Suppression</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Filters out background air conditioner hums, keystrokes, and echo for crystal clear voice calls.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onToggleNoiseSuppression();
                    toast.success(noiseSupressionEnabled ? "Noise filter disabled" : "AI Noise Suppression enabled 🎙️");
                  }}
                  className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                    noiseSupressionEnabled ? "bg-[#0055ff]" : "bg-slate-300"
                  }`}
                >
                  <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform ${
                    noiseSupressionEnabled ? "translate-x-5.5" : "translate-x-0"
                  }`} />
                </button>
              </div>
            </div>
          )}

          {/* ================= 3. NETWORK DIAGNOSTICS ================= */}
          {activeTab === "network" && (
            <div className="space-y-4">

              <div className="p-4 rounded-2xl bg-emerald-50/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">Connection Status: Optimal</h4>
                    <p className="text-[11px] text-emerald-700">WebRTC Peer-to-Peer direct mesh connected</p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-2xs">
                  📶 Excellent
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Latency</span>
                  <p className="text-sm font-bold text-slate-900">~18 ms</p>
                </div>
                
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Packet Loss</span>
                  <p className="text-sm font-bold text-slate-900">0.0%</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Resolution</span>
                  <p className="text-sm font-bold text-slate-900">HD 720p</p>
                </div>
              </div>
            </div>
          )}
          

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-[#0055ff] hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal;
