"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FlipHorizontal2,
  Maximize2,
  Minus,
  Plus,
  RotateCw,
  ScanLine,
  ZoomIn
} from "lucide-react";

interface StudyFile {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
}

interface DicomViewerProps {
  files: StudyFile[];
  patientName: string;
  patientNumber: string;
  modality: string;
  studyDate: string;
  deviceName: string;
}

const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];

function isImage(file: StudyFile) {
  const lower = file.fileName.toLowerCase();
  return IMAGE_EXTS.some((ext) => lower.endsWith(ext)) || file.fileType.startsWith("image/");
}

export function DicomViewer({ files, patientName, patientNumber, modality, studyDate, deviceName }: DicomViewerProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [inverted, setInverted] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const viewerRef = useRef<HTMLDivElement>(null);

  const selected = files[selectedIdx] ?? null;

  // window value display (maps brightness 0.1-3 → W 50-1500, contrast → L 5-100)
  const windowVal = Math.round(brightness * 500);
  const levelVal = Math.round(contrast * 40);

  function resetView() {
    setBrightness(1);
    setContrast(1);
    setZoom(1);
    setInverted(false);
    setRotation(0);
    setTranslate({ x: 0, y: 0 });
  }

  function changeFile(idx: number) {
    setSelectedIdx(idx);
    setTranslate({ x: 0, y: 0 });
    setZoom(1);
  }

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, tx: translate.x, ty: translate.y };
  }, [translate]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = (e.clientX - dragStart.current.x) / zoom;
    const dy = (e.clientY - dragStart.current.y) / zoom;
    setTranslate({ x: dragStart.current.tx + dx, y: dragStart.current.ty + dy });
  }, [isDragging, zoom]);

  const onMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    const up = () => setIsDragging(false);
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.min(5, Math.max(0.2, z - e.deltaY * 0.001)));
  }, []);

  const imageFilter = `brightness(${brightness}) contrast(${contrast})${inverted ? " invert(1)" : ""}`;
  const imageTransform = `scale(${zoom}) translate(${translate.x}px, ${translate.y}px) rotate(${rotation}deg)`;

  const noFiles = files.length === 0;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-950 text-white shadow-2xl">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-neutral-800 bg-neutral-900 px-4 py-2.5">
        <ScanLine className="h-4 w-4 text-cyan-400 shrink-0" />
        <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">DICOM Viewer</span>
        <div className="mx-2 h-4 w-px bg-neutral-700" />
        <span className="text-xs font-semibold text-white">{patientName}</span>
        <span className="text-xs text-neutral-400">#{patientNumber}</span>
        <div className="mx-2 h-4 w-px bg-neutral-700" />
        <span className="rounded bg-cyan-900/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">{modality}</span>
        <span className="text-xs text-neutral-400">{studyDate}</span>
        <span className="ml-auto text-xs text-neutral-500">{deviceName}</span>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-neutral-800 bg-neutral-900/80 px-3 py-1.5">
        <button
          onClick={() => setZoom((z) => Math.min(5, z + 0.2))}
          className="toolbar-btn"
          title="Yakınlaştır"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.2, z - 0.2))}
          className="toolbar-btn"
          title="Uzaklaştır"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => setZoom(1)} className="toolbar-btn text-[10px] font-bold" title="Orijinal boyut">
          1:1
        </button>
        <button onClick={() => setZoom(0.8)} className="toolbar-btn" title="Ekrana sığdır">
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
        <div className="mx-1 h-4 w-px bg-neutral-700" />
        <button onClick={() => setRotation((r) => r + 90)} className="toolbar-btn" title="90° döndür">
          <RotateCw className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => setInverted((v) => !v)} className={`toolbar-btn ${inverted ? "bg-cyan-700 text-white" : ""}`} title="Renkleri ters çevir">
          <FlipHorizontal2 className="h-3.5 w-3.5" />
        </button>
        <div className="mx-1 h-4 w-px bg-neutral-700" />
        <button onClick={resetView} className="toolbar-btn text-[10px] font-bold text-amber-400" title="Sıfırla">
          SIFIRLA
        </button>
        <div className="ml-auto flex items-center gap-1 text-[10px] text-neutral-500">
          <ZoomIn className="h-3 w-3" />
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Main area */}
      <div className="flex min-h-[480px] flex-1">
        {/* Thumbnail sidebar */}
        {files.length > 0 && (
          <div className="flex w-20 flex-col gap-1 overflow-y-auto border-r border-neutral-800 bg-neutral-900/60 p-1.5">
            {files.map((file, idx) => (
              <button
                key={file.id}
                onClick={() => changeFile(idx)}
                className={`group relative aspect-square w-full overflow-hidden rounded border-2 transition ${
                  idx === selectedIdx ? "border-cyan-400" : "border-neutral-700 hover:border-neutral-500"
                }`}
              >
                {isImage(file) ? (
                  <img
                    src={file.filePath}
                    alt={file.fileName}
                    className="h-full w-full object-cover"
                    style={{ filter: "grayscale(0.6) brightness(0.85)" }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-neutral-800">
                    <ScanLine className="h-5 w-5 text-cyan-600" />
                  </div>
                )}
                <span className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 text-center text-[8px] text-neutral-300">
                  {idx + 1}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Viewer canvas */}
        <div
          ref={viewerRef}
          className={`relative flex flex-1 items-center justify-center overflow-hidden bg-neutral-950 ${isDragging ? "cursor-grabbing" : "cursor-crosshair"}`}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onWheel={onWheel}
        >
          {noFiles ? (
            /* Demo X-ray görüntüsü — gerçek dosya yokken gösterilir */
            <div
              className="relative flex h-full w-full items-center justify-center select-none"
              style={{ filter: imageFilter, transform: imageTransform, transformOrigin: "center", transition: isDragging ? "none" : "transform 0.1s" }}
            >
              <svg viewBox="0 0 400 480" className="h-full max-h-[420px] w-auto" xmlns="http://www.w3.org/2000/svg">
                {/* Background */}
                <rect width="400" height="480" fill="#000" />
                {/* Spine */}
                <rect x="196" y="60" width="8" height="340" rx="4" fill="#c0c0c0" opacity="0.7" />
                {/* Clavicles */}
                <path d="M200 90 Q150 75 100 95" stroke="#b0b0b0" strokeWidth="5" fill="none" opacity="0.8" />
                <path d="M200 90 Q250 75 300 95" stroke="#b0b0b0" strokeWidth="5" fill="none" opacity="0.8" />
                {/* Left lung */}
                <ellipse cx="145" cy="230" rx="72" ry="120" fill="none" stroke="#888" strokeWidth="2.5" opacity="0.6" />
                <ellipse cx="145" cy="230" rx="55" ry="100" fill="#1a1a1a" opacity="0.4" />
                <ellipse cx="145" cy="200" rx="40" ry="70" fill="#222" opacity="0.5" />
                {/* Right lung */}
                <ellipse cx="255" cy="230" rx="72" ry="120" fill="none" stroke="#888" strokeWidth="2.5" opacity="0.6" />
                <ellipse cx="255" cy="230" rx="55" ry="100" fill="#1a1a1a" opacity="0.4" />
                <ellipse cx="255" cy="200" rx="40" ry="70" fill="#222" opacity="0.5" />
                {/* Heart */}
                <ellipse cx="185" cy="265" rx="38" ry="45" fill="#2a2a2a" stroke="#777" strokeWidth="2" opacity="0.8" />
                {/* Ribs left */}
                {[0,1,2,3,4,5,6,7].map((i) => (
                  <path key={`rl${i}`} d={`M196 ${120+i*28} Q155 ${110+i*28} 90 ${125+i*28}`} stroke="#999" strokeWidth="2.5" fill="none" opacity={0.55 - i * 0.04} />
                ))}
                {/* Ribs right */}
                {[0,1,2,3,4,5,6,7].map((i) => (
                  <path key={`rr${i}`} d={`M204 ${120+i*28} Q245 ${110+i*28} 310 ${125+i*28}`} stroke="#999" strokeWidth="2.5" fill="none" opacity={0.55 - i * 0.04} />
                ))}
                {/* Diaphragm */}
                <path d="M80 365 Q200 390 320 365" stroke="#aaa" strokeWidth="3" fill="none" opacity="0.6" />
                {/* Trachea */}
                <rect x="193" y="50" width="14" height="50" rx="7" fill="none" stroke="#aaa" strokeWidth="2" opacity="0.5" />
                {/* Shoulder blades outline */}
                <path d="M80 130 Q65 200 90 260" stroke="#777" strokeWidth="2" fill="none" opacity="0.4" />
                <path d="M320 130 Q335 200 310 260" stroke="#777" strokeWidth="2" fill="none" opacity="0.4" />
                {/* DEMO watermark */}
                <text x="200" y="455" textAnchor="middle" fill="#333" fontSize="11" fontFamily="monospace" letterSpacing="4">DEMO GÖRÜNTÜSÜ</text>
              </svg>
            </div>
          ) : selected && isImage(selected) ? (
            <img
              src={selected.filePath}
              alt={selected.fileName}
              draggable={false}
              className="max-h-full max-w-full select-none object-contain"
              style={{ filter: imageFilter, transform: imageTransform, transformOrigin: "center", transition: isDragging ? "none" : "transform 0.1s" }}
            />
          ) : selected ? (
            /* Non-image placeholder that still looks like a DICOM frame */
            <div
              className="flex h-80 w-80 flex-col items-center justify-center rounded border border-neutral-700 bg-neutral-900"
              style={{ transform: imageTransform, filter: imageFilter }}
            >
              <ScanLine className="mb-3 h-16 w-16 text-cyan-800" />
              <p className="text-sm font-semibold text-neutral-400">DICOM</p>
              <p className="mt-1 text-xs text-neutral-600">{selected.fileName}</p>
              <p className="mt-3 text-[10px] text-neutral-700">Rendered frame — Series 1</p>
            </div>
          ) : null}

          {/* DICOM overlay corners — her zaman göster */}
          {(
            <>
              {/* Top-left */}
              <div className="pointer-events-none absolute left-3 top-3 space-y-0.5 font-mono text-[10px] text-cyan-300/80">
                <p>{patientName}</p>
                <p>#{patientNumber}</p>
                <p>{modality}</p>
              </div>
              {/* Top-right */}
              <div className="pointer-events-none absolute right-3 top-3 space-y-0.5 text-right font-mono text-[10px] text-cyan-300/80">
                <p>{studyDate}</p>
                <p>{deviceName}</p>
                <p>Seri {selectedIdx + 1}/{files.length}</p>
              </div>
              {/* Bottom-left */}
              <div className="pointer-events-none absolute bottom-3 left-3 font-mono text-[10px] text-yellow-300/70">
                <p>W: {windowVal}</p>
                <p>L: {levelVal}</p>
              </div>
              {/* Bottom-right */}
              <div className="pointer-events-none absolute bottom-3 right-3 text-right font-mono text-[10px] text-yellow-300/70">
                <p>ZOOM {Math.round(zoom * 100)}%</p>
                <p>ROT {rotation}°</p>
              </div>
            </>
          )}

          {/* Series nav arrows */}
          {files.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); changeFile(Math.max(0, selectedIdx - 1)); }}
                disabled={selectedIdx === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white hover:bg-black/80 disabled:opacity-20"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); changeFile(Math.min(files.length - 1, selectedIdx + 1)); }}
                disabled={selectedIdx === files.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white hover:bg-black/80 disabled:opacity-20"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bottom controls — Window / Level */}
      <div className="border-t border-neutral-800 bg-neutral-900/80 px-4 py-2">
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-3 text-[11px] text-neutral-400">
            <span className="w-16 shrink-0">Window ({windowVal})</span>
            <input
              type="range" min={0.1} max={3} step={0.05}
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="h-1 flex-1 accent-cyan-400"
            />
          </label>
          <label className="flex items-center gap-3 text-[11px] text-neutral-400">
            <span className="w-16 shrink-0">Level ({levelVal})</span>
            <input
              type="range" min={0.1} max={3} step={0.05}
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="h-1 flex-1 accent-cyan-400"
            />
          </label>
        </div>
      </div>

      <style jsx>{`
        .toolbar-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 4px 8px;
          border-radius: 6px;
          background: transparent;
          color: #a3a3a3;
          transition: background 0.15s, color 0.15s;
          font-size: 11px;
        }
        .toolbar-btn:hover {
          background: #262626;
          color: #e5e5e5;
        }
      `}</style>
    </div>
  );
}
