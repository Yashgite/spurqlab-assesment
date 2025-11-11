import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const VideoInstructions = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);
  const [time, setTime] = useState(0);
  const [error, setError] = useState("");
  const timerRef = useRef(null);

  // 🎬 Start Recording
  const startRecording = () => {
    setError("");
    setRecording(true);
    setTime(0);
    // Request camera and mic only when starting
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        const chunks = [];

        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: "video/webm" });
          setVideoBlob(blob);
        };

        recorder.start();
        timerRef.current = setInterval(() => {
          setTime((prev) => {
            if (prev >= 90) {
              stopRecording();
              setError("Recording stopped — 90 second limit reached.");
              return prev;
            }
            return prev + 1;
          });
        }, 1000);
      })
      .catch(() => {
        setRecording(false);
        setError("Camera or microphone access denied.");
      });
  };

  // 🛑 Stop Recording
  const stopRecording = () => {
    setRecording(false);
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    const stream = videoRef.current?.srcObject;
    if (stream && typeof stream.getTracks === "function") {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Cleanup on unmount: ensure camera is turned off
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      const stream = videoRef.current?.srcObject;
      if (stream && typeof stream.getTracks === "function") {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  // 🚀 Submit and move to Review Page
  const handleSubmit = () => {
    if (!videoBlob) {
      setError("Please record a video before submitting.");
      return;
    }
    // Persist the recorded video as an object URL in session storage
    const videoURL = URL.createObjectURL(videoBlob);
    sessionStorage.setItem("candidateVideoURL", videoURL);
    navigate("/review");
  };

  return (
    <div className="container app-max mt-5">
      <div className="stepper mb-4">
        <div className="step"><span className="dot"></span> Info</div>
        <div className="bar"></div>
        <div className="step active"><span className="dot"></span> Video</div>
        <div className="bar"></div>
        <div className="step"><span className="dot"></span> Review</div>
      </div>
      <div className="card card-elevated p-4">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="mb-0">🎥 Video Recording Instructions</h2>
          <button className="btn btn-outline-light" onClick={() => navigate(-1)}>← Back</button>
        </div>
      <ul>
        <li>Introduce yourself briefly</li>
        <li>Explain why you're interested in this position</li>
        <li>Highlight your relevant experience</li>
        <li>Share your long-term career goals</li>
      </ul>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="text-center mt-4">
        <video
          ref={videoRef}
          autoPlay
          muted
          width="400"
          height="300"
          className="border rounded"
        ></video>
      </div>

      <div className="d-flex justify-content-center mt-3">
        {!recording ? (
          <button className="btn btn-success mx-2" onClick={startRecording}>
            ▶ Start Recording
          </button>
        ) : (
          <button className="btn btn-danger mx-2" onClick={stopRecording}>
            ⏹ Stop Recording
          </button>
        )}
      </div>

      <div className="text-center mt-3">
        <h5>⏱ Time: {time}s / 90s</h5>
      </div>

      {videoBlob && (
        <div className="text-center mt-3">
          <video
            controls
            src={URL.createObjectURL(videoBlob)}
            width="400"
            height="300"
            className="border rounded"
          ></video>
        </div>
      )}

      <div className="text-center mt-4">
        <button className="btn btn-primary" onClick={handleSubmit}>
          Submit & Continue
        </button>
      </div>
      </div>
    </div>
  );
};

export default VideoInstructions;
