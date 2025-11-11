import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CandidateForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    position: '',
    currentPosition: '',
    experience: '',
    resume: null,
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setFormData({ ...formData, [name]: files[0] });
    else setFormData({ ...formData, [name]: value });
  };

  const handleNext = () => {
    const { firstName, lastName, position, currentPosition, experience, resume } = formData;
    if (!firstName || !lastName || !position || !currentPosition || !experience || !resume) {
      setError('All fields are required');
      return;
    }

    if (resume.type !== 'application/pdf') {
      setError('Resume must be a PDF file');
      return;
    }

    if (resume.size > 5 * 1024 * 1024) {
      setError('File size must not exceed 5 MB');
      return;
    }

    // Persist only text fields; store resume as object URL + name in session storage
    const { resume: resumeFile, ...textFields } = formData;
    sessionStorage.setItem('candidateFormData', JSON.stringify(textFields));
    const resumeURL = URL.createObjectURL(resumeFile);
    sessionStorage.setItem('candidateResumeURL', resumeURL);
    sessionStorage.setItem('candidateResumeName', resumeFile.name);
    navigate('/video');
  };

  return (
    <div className="container app-max mt-5">
      <h1 className="text-center mb-4">Candidate Registration Form</h1>
      <div className="card card-elevated p-4">
        <h2 className="mb-3">Candidate Information</h2>
        <p className="muted mb-4">Please fill in all fields and upload a PDF resume.</p>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="mb-3">
        <label>First Name</label>
        <input className="form-control" name="firstName" onChange={handleChange} />
      </div>
      <div className="mb-3">
        <label>Last Name</label>
        <input className="form-control" name="lastName" onChange={handleChange} />
      </div>
      <div className="mb-3">
        <label>Position Applied For</label>
        <input className="form-control" name="position" onChange={handleChange} />
      </div>
      <div className="mb-3">
        <label>Current Position</label>
        <input className="form-control" name="currentPosition" onChange={handleChange} />
      </div>
      <div className="mb-3">
        <label>Experience in Years</label>
        <input className="form-control" type="number" name="experience" onChange={handleChange} />
      </div>
      <div className="mb-3">
        <label>Upload Resume (PDF ≤ 5 MB)</label>
        <input className="form-control" type="file" name="resume" onChange={handleChange} />
      </div>
        <div className="d-flex justify-content-end">
          <button className="btn btn-primary" onClick={handleNext}>Next →</button>
        </div>
      </div>
    </div>
  );
};

export default CandidateForm;
