import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ReviewPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [videoURL, setVideoURL] = useState(null);
  const [resumeURL, setResumeURL] = useState(null);
  const [resumeName, setResumeName] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedData = JSON.parse(sessionStorage.getItem("candidateFormData"));
    const storedVideoURL = sessionStorage.getItem("candidateVideoURL");
    const storedResumeURL = sessionStorage.getItem("candidateResumeURL");
    const storedResumeName = sessionStorage.getItem("candidateResumeName");

    if (storedData) {
      setFormData(storedData);
    }
    if (storedVideoURL) {
      setVideoURL(storedVideoURL);
    }
    if (storedResumeURL) setResumeURL(storedResumeURL);
    if (storedResumeName) setResumeName(storedResumeName);
  }, []);

  const handleSubmit = async () => {
    if (!formData || !resumeURL || !videoURL) {
      setMessage("Please complete all steps before submitting.");
      return;
    }

    const data = new FormData();
    data.append("firstName", formData.firstName);
    data.append("lastName", formData.lastName);
    data.append("position", formData.position);
    data.append("currentPosition", formData.currentPosition);
    data.append("experience", formData.experience);

    // 🔹 Reconstruct resume File from object URL
    const resumeResponse = await fetch(resumeURL);
    const resumeBlob = await resumeResponse.blob();
    data.append("resume", new File([resumeBlob], resumeName || "resume.pdf", { type: resumeBlob.type || "application/pdf" }));

    // 🔹 Convert video object URL back to Blob
    const response = await fetch(videoURL);
    const blob = await response.blob();
    data.append("video", blob, "recording.webm");

    try {
      setLoading(true);
      // Use relative path; vite proxy forwards to backend
      const res = await axios.post("/api/candidates/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(res.data.message || "🎉 Your application has been submitted successfully!");
      // Clear session storage and return to home after a brief delay
      sessionStorage.clear();
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      const errorText = err.response?.data?.error || err.message || "Something went wrong!";
      setMessage(errorText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container app-max mt-5">
      <div className="stepper mb-4">
        <div className="step"><span className="dot"></span> Info</div>
        <div className="bar"></div>
        <div className="step"><span className="dot"></span> Video</div>
        <div className="bar"></div>
        <div className="step active"><span className="dot"></span> Review</div>
      </div>
      <div className="card card-elevated p-4">
        <h2>📝 Review Your Information</h2>
      {message && <div className="alert alert-info mt-3">{message}</div>}

      {formData ? (
        <div className="card p-4 mt-4">
          <h5>Candidate Details</h5>
          <p><strong>First Name:</strong> {formData.firstName}</p>
          <p><strong>Last Name:</strong> {formData.lastName}</p>
          <p><strong>Position Applied For:</strong> {formData.position}</p>
          <p><strong>Current Position:</strong> {formData.currentPosition}</p>
          <p><strong>Experience:</strong> {formData.experience} years</p>

          <hr />
          <h5>Resume</h5>
          {resumeURL ? (
            <a
              href={resumeURL}
              download={resumeName || "resume.pdf"}
              className="btn btn-outline-primary"
            >
              Download Resume
            </a>
          ) : null}

          <hr />
          <h5>Recorded Video</h5>
          {videoURL ? (
            <video controls width="400" className="border rounded">
              <source src={videoURL} type="video/webm" />
            </video>
          ) : (
            <p>No video found.</p>
          )}

          <div className="text-center mt-4">
            <button
              className="btn btn-success"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Uploading..." : "Submit to Backend"}
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-danger">No data available. Please fill the form first.</p>
      )}
      </div>
    </div>
  );
};

export default ReviewPage;
