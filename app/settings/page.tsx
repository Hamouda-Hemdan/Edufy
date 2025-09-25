"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [selectedMic, setSelectedMic] = useState<string>("");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function getDevices() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setCameras(devices.filter((d) => d.kind === "videoinput"));
      setMicrophones(devices.filter((d) => d.kind === "audioinput"));
    }
    getDevices();
  }, []);

  useEffect(() => {
    if (!camOn || !selectedCamera) {
      setStream(null);
      return;
    }
    async function getStream() {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedCamera },
        audio: false,
      });
      setStream(newStream);
    }
    getStream();
    // Cleanup on unmount
    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
    // eslint-disable-next-line
  }, [selectedCamera, camOn]);

  const handleStart = () => {
    // Store selected devices in localStorage
    localStorage.setItem("selectedCamera", selectedCamera);
    localStorage.setItem("selectedMic", selectedMic);
    router.push("/meeting");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <div className="bg-gray-900 p-8 rounded-xl shadow-xl w-full max-w-md flex flex-col gap-6">
        <h1 className="text-2xl font-bold mb-2">Device Settings</h1>
        <div className="flex flex-col gap-4">
          <label>
            Camera:
            <select
              className="ml-2 p-2 rounded bg-gray-800 border border-gray-700"
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              disabled={!camOn}
            >
              <option value="">None</option>
              {cameras.map((cam) => (
                <option key={cam.deviceId} value={cam.deviceId}>
                  {cam.label || `Camera ${cam.deviceId}`}
                </option>
              ))}
            </select>
            <button
              className={`ml-4 px-3 py-1 rounded ${
                camOn ? "bg-green-600" : "bg-red-600"
              }`}
              onClick={() => setCamOn((v) => !v)}
              type="button"
            >
              {camOn ? "On" : "Off"}
            </button>
          </label>
          <label>
            Microphone:
            <select
              className="ml-2 p-2 rounded bg-gray-800 border border-gray-700"
              value={selectedMic}
              onChange={(e) => setSelectedMic(e.target.value)}
              disabled={!micOn}
            >
              <option value="">None</option>
              {microphones.map((mic) => (
                <option key={mic.deviceId} value={mic.deviceId}>
                  {mic.label || `Microphone ${mic.deviceId}`}
                </option>
              ))}
            </select>
            <button
              className={`ml-4 px-3 py-1 rounded ${
                micOn ? "bg-green-600" : "bg-red-600"
              }`}
              onClick={() => setMicOn((v) => !v)}
              type="button"
            >
              {micOn ? "On" : "Off"}
            </button>
          </label>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-48 h-36 bg-black border border-gray-700 rounded flex items-center justify-center overflow-hidden">
            {camOn && stream ? (
              <video
                autoPlay
                playsInline
                muted
                ref={(video) => {
                  if (video && stream) video.srcObject = stream;
                }}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500">Camera Off</span>
            )}
          </div>
        </div>
        <button
          className="mt-4 px-6 py-2 bg-blue-600 rounded-full hover:bg-blue-700 transition font-bold text-lg"
          onClick={handleStart}
        >
          Start Meeting
        </button>
      </div>
    </div>
  );
}
