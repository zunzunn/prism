import React, { useState, useEffect, useRef } from "react";
import { X, Camera, QrCode } from "lucide-react";

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (scannedReference: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
}) => {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Stop video stream when closing
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setCameraError(null);
      return;
    }

    // Try starting camera
    const startCamera = async () => {
      setCameraError(null);
      try {
        if (
          typeof navigator !== "undefined" &&
          navigator.mediaDevices &&
          navigator.mediaDevices.getUserMedia
        ) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        } else {
          setCameraError(
            "Hardware camera API is unavailable in this browser session. Select a simulated demo credential pass below."
          );
        }
      } catch (err: any) {
        console.warn("Camera access unavailable:", err);
        setCameraError(
          "Camera access permission was denied or no video input device was detected. You can select one of the synthetic test passes below."
        );
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectDemoRef = (ref: string) => {
    onScanComplete(ref);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded border border-[#1f2838] bg-[#0c1017] p-6 shadow-2xl z-10 flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#182132] pb-3">
          <div className="flex items-center space-x-2">
            <Camera className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-zinc-100 uppercase font-mono tracking-wider">
              Scan Credential QR Pass
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 transition hover:bg-[#121824] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Viewfinder / Video Feed */}
        <div className="relative aspect-video w-full overflow-hidden rounded border border-[#1e2738] bg-[#080b11] flex items-center justify-center">
          {streamRef.current ? (
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              playsInline
              muted
            />
          ) : (
            <div className="p-6 text-center space-y-2">
              <QrCode className="mx-auto h-12 w-12 text-zinc-600 animate-pulse" />
              <p className="text-xs text-zinc-400 font-mono">
                {cameraError || "Initializing optical verification camera..."}
              </p>
            </div>
          )}

          {/* Scanner Overlay Box */}
          <div className="pointer-events-none absolute inset-8 rounded border-2 border-emerald-500/60 border-dashed" />
        </div>

        {/* Quick Demo QR Reference Selector */}
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
            Simulate Scanning a Demo Credential QR Pass:
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <button
              onClick={() => handleSelectDemoRef("VRF-2026-V8892")}
              className="rounded border border-emerald-500/30 bg-[#0c141d] p-2 text-left hover:border-emerald-500/60 hover:bg-[#101b27]"
            >
              <div className="font-bold text-emerald-400">VRF-2026-V8892</div>
              <div className="text-[10px] text-zinc-400">Valid Verified Pass</div>
            </button>

            <button
              onClick={() => handleSelectDemoRef("VRF-2026-R4109")}
              className="rounded border border-amber-500/30 bg-[#0c141d] p-2 text-left hover:border-amber-500/60 hover:bg-[#101b27]"
            >
              <div className="font-bold text-amber-300">VRF-2026-R4109</div>
              <div className="text-[10px] text-zinc-400">Awaiting Review</div>
            </button>

            <button
              onClick={() => handleSelectDemoRef("VRF-2026-D9901")}
              className="rounded border border-sky-500/30 bg-[#0c141d] p-2 text-left hover:border-sky-500/60 hover:bg-[#101b27]"
            >
              <div className="font-bold text-sky-400">VRF-2026-D9901</div>
              <div className="text-[10px] text-zinc-400">Corrected Duplicate</div>
            </button>

            <button
              onClick={() => handleSelectDemoRef("VRF-2026-X0012")}
              className="rounded border border-rose-500/30 bg-[#0c141d] p-2 text-left hover:border-rose-500/60 hover:bg-[#101b27]"
            >
              <div className="font-bold text-rose-400">VRF-2026-X0012</div>
              <div className="text-[10px] text-zinc-400">Invalid / Revoked</div>
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#161c28]">
          <button
            onClick={onClose}
            className="rounded border border-[#1e2738] bg-[#0c1017] px-4 py-1.5 text-xs text-zinc-300 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
