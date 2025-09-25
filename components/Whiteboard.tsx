import { useEffect, useRef, useState } from "react";
import socket from "./socket";

type Point = { x: number; y: number };
type Path = {
  points: Point[];
  color: string;
  tool: "pencil" | "eraser" | "line" | "rectangle" | "hand";
  lineWidth: number;
  startPoint?: Point;
  endPoint?: Point;
};

type WhiteboardProps = {
  username: string;
  color: string;
  setColor: (color: string) => void;
};

// Throttle function
function throttle<T extends (...args: any[]) => void>(fn: T, limit: number): T {
  let lastCall = 0;
  let lastArgs: any[];
  let timeout: any;
  return function (...args: any[]) {
    const now = Date.now();
    lastArgs = args;
    if (now - lastCall >= limit) {
      lastCall = now;
      fn(...args);
    } else {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        lastCall = Date.now();
        fn(...lastArgs);
      }, limit - (now - lastCall));
    }
  } as T;
}

const Whiteboard = ({ username, color, setColor }: WhiteboardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<
    "pencil" | "eraser" | "line" | "rectangle" | "hand"
  >("pencil");
  const [lineWidth, setLineWidth] = useState(3);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [lastPanPos, setLastPanPos] = useState<Point | null>(null);
  const [paths, setPaths] = useState<Path[]>([]);
  const [tempPath, setTempPath] = useState<Path | null>(null);

  // Get the appropriate cursor style based on the current tool
  const getCursorStyle = () => {
    switch (tool) {
      case "pencil":
        return 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M15.5 0.5L0.5 15.5" stroke="black" stroke-width="1.5" stroke-linecap="round"/><path d="M11 2L14 5" stroke="black" stroke-width="1.5" stroke-linecap="round"/><path d="M9 4L12 7" stroke="black" stroke-width="1.5" stroke-linecap="round"/><path d="M5 8L8 11" stroke="black" stroke-width="1.5" stroke-linecap="round"/></svg>\') 0 16, auto';
      case "eraser":
        return 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" fill="white" stroke="black" stroke-width="1.5"/></svg>\') 5 5, auto';
      case "line":
        return 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><line x1="2" y1="2" x2="14" y2="14" stroke="black" stroke-width="1.5" stroke-linecap="round"/></svg>\') 8 8, auto';
      case "rectangle":
        return 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect x="3" y="3" width="10" height="10" fill="none" stroke="black" stroke-width="1.5"/></svg>\') 8 8, auto';
      case "hand":
        return isDrawing ? "grabbing" : "grab";
      default:
        return "crosshair";
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctxRef.current = ctx;

    socket.on("init", (initialPaths: Path[]) => {
      setPaths(initialPaths);
    });

    socket.on("draw", (path: Path) => {
      setPaths((prev) => [...prev, path]);
    });

    socket.on("clear", () => {
      clearCanvasLocal();
    });

    return () => {
      socket.off("init");
      socket.off("draw");
      socket.off("clear");
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(scale, 0, 0, scale, offset.x, offset.y);

    paths.forEach((path) => drawPath(ctx, path));
    if (tempPath) drawPath(ctx, tempPath);
  }, [paths, scale, offset, tempPath]);

  const drawPath = (ctx: CanvasRenderingContext2D, path: Path) => {
    ctx.strokeStyle = path.color;
    ctx.lineWidth = path.lineWidth;

    if (path.tool === "pencil" || path.tool === "eraser") {
      ctx.beginPath();
      path.points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    } else if (path.tool === "line" && path.startPoint && path.endPoint) {
      ctx.beginPath();
      ctx.moveTo(path.startPoint.x, path.startPoint.y);
      ctx.lineTo(path.endPoint.x, path.endPoint.y);
      ctx.stroke();
    } else if (path.tool === "rectangle" && path.startPoint && path.endPoint) {
      ctx.beginPath();
      const width = path.endPoint.x - path.startPoint.x;
      const height = path.endPoint.y - path.startPoint.y;
      ctx.rect(path.startPoint.x, path.startPoint.y, width, height);
      ctx.stroke();
    }
  };

  const startDrawing = (e: React.MouseEvent) => {
    if (tool === "hand") {
      setLastPanPos({ x: e.clientX, y: e.clientY });
      return;
    }

    const { offsetX, offsetY } = e.nativeEvent;
    setIsDrawing(true);

    const point = screenToCanvas(offsetX, offsetY);

    if (tool === "pencil" || tool === "eraser") {
      const newPath: Path = {
        color: tool === "eraser" ? "#ffffff" : color,
        points: [point],
        tool,
        lineWidth: tool === "eraser" ? lineWidth * 2 : lineWidth,
      };
      setPaths((prev) => [...prev, newPath]);
    } else {
      const newPath: Path = {
        color,
        points: [],
        tool,
        lineWidth,
        startPoint: point,
        endPoint: point,
      };
      setPaths((prev) => [...prev, newPath]);
      setTempPath(newPath);
    }
  };

  const emitCursor = throttle((data: any) => {
    socket.emit("cursor", data);
  }, 30); // ~33fps

  const draw = (e: React.MouseEvent) => {
    if (tool === "hand") {
      if (!lastPanPos) return;
      const dx = e.clientX - lastPanPos.x;
      const dy = e.clientY - lastPanPos.y;
      setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastPanPos({ x: e.clientX, y: e.clientY });
      emitCursor({ x: e.clientX, y: e.clientY, tool, username, color });
      return;
    }

    emitCursor({ x: e.clientX, y: e.clientY, tool, username, color });

    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const point = screenToCanvas(offsetX, offsetY);

    if (tool === "pencil" || tool === "eraser") {
      setPaths((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].points.push(point);
        return updated;
      });
    } else {
      setPaths((prev) => {
        const updated = [...prev];
        const lastPath = updated[updated.length - 1];
        if (lastPath) lastPath.endPoint = point;
        return updated;
      });
      setTempPath((prev) => (prev ? { ...prev, endPoint: point } : null));
    }
  };

  const stopDrawing = () => {
    if (tool === "hand") {
      setLastPanPos(null);
      return;
    }

    setIsDrawing(false);
    if (paths.length > 0) {
      socket.emit("draw", paths[paths.length - 1]);
    }
    setTempPath(null);
  };

  const screenToCanvas = (x: number, y: number) => ({
    x: (x - offset.x) / scale,
    y: (y - offset.y) / scale,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const wheelHandler = (e: WheelEvent) => {
      e.preventDefault();
      const zoomIntensity = 0.1;
      const { offsetX, offsetY, deltaY } = e;
      const zoom = deltaY < 0 ? 1 + zoomIntensity : 1 - zoomIntensity;
      const newScale = Math.min(Math.max(scale * zoom, 0.1), 5);

      const x = offsetX - offset.x;
      const y = offsetY - offset.y;

      setScale(newScale);
      setOffset({
        x: offset.x - x * (zoom - 1),
        y: offset.y - y * (zoom - 1),
      });
    };

    canvas.addEventListener("wheel", wheelHandler, { passive: false });
    return () => canvas.removeEventListener("wheel", wheelHandler);
  }, [scale, offset]);

  const clearCanvasLocal = () => {
    setPaths([]);
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const clearCanvas = () => {
    clearCanvasLocal();
    socket.emit("clear");
  };

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("whiteboard_paths");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setPaths(parsed);
      } catch {}
    }
  }, []);

  // Save to localStorage on every change
  useEffect(() => {
    localStorage.setItem("whiteboard_paths", JSON.stringify(paths));
  }, [paths]);

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-gray-100">
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex items-center bg-white p-3 rounded-lg shadow-lg space-x-4">
        <button
          onClick={clearCanvas}
          className="px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
          title="Clear Canvas"
        >
          Clear
        </button>

        <label className="flex items-center space-x-2">
          <span className="text-sm font-medium">Width:</span>
          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
            className="w-24 cursor-pointer"
            title="Line Width"
            disabled={tool === "hand"}
          />
        </label>

        <label className="flex items-center space-x-2">
          <span className="text-sm font-medium">Color:</span>
          <input
            type="color"
            value={color}
            onChange={(e) => {
              if (tool !== "eraser") {
                setColor(e.target.value);
              }
            }}
            className="w-8 h-8 p-0 border-2 border-gray-300 rounded cursor-pointer"
            title="Pick Color"
            disabled={tool === "eraser"}
          />
        </label>

        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded-md transition-colors ${
              tool === "pencil"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
            onClick={() => setTool("pencil")}
            title="Pencil Tool"
          >
            Pencil
          </button>

          <button
            className={`px-3 py-1 rounded-md transition-colors ${
              tool === "eraser"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
            onClick={() => setTool("eraser")}
            title="Eraser Tool"
          >
            Eraser
          </button>

          <button
            className={`px-3 py-1 rounded-md transition-colors ${
              tool === "line"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
            onClick={() => setTool("line")}
            title="Line Tool"
          >
            Line
          </button>

          <button
            className={`px-3 py-1 rounded-md transition-colors ${
              tool === "rectangle"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
            onClick={() => setTool("rectangle")}
            title="Rectangle Tool"
          >
            Rectangle
          </button>

          <button
            className={`px-3 py-1 rounded-md transition-colors ${
              tool === "hand"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
            onClick={() => setTool("hand")}
            title="Hand Tool (Pan)"
          >
            Hand
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{ cursor: getCursorStyle() }}
      />
    </div>
  );
};

export default Whiteboard;
