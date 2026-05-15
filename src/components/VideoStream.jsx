import React, { useRef, useEffect } from 'react';

const VideoStream = ({ onFrame }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let stream = null;
    let animationFrameId = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    const processFrame = () => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64
        const dataUrl = canvas.toDataURL('image/jpeg', 0.5); // Quality 0.5 for speed
        
        // Send frame up to parent
        onFrame(dataUrl);
      }
      
      // Throttle frame capture to ~10 FPS to avoid overloading the backend
      setTimeout(() => {
        animationFrameId = requestAnimationFrame(processFrame);
      }, 100);
    };

    startCamera().then(() => {
      // Small delay before starting processing to ensure video is playing
      setTimeout(() => {
        processFrame();
      }, 1000);
    });

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [onFrame]);

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-700 bg-slate-800">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-auto transform -scale-x-100" // Mirror the video
      />
      {/* Hidden canvas for extracting frames */}
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="hidden"
      />
      <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-white text-sm font-medium tracking-wider uppercase">Live Translation</span>
      </div>
    </div>
  );
};

export default VideoStream;
