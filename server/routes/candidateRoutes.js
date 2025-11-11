const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Candidate = require('../models/Candidate');
const mongoose = require('mongoose');
const router = express.Router();
require('dotenv').config();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'server', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Use disk storage to reduce moving parts and avoid GridFS issues
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${timestamp}-${safeName}`);
  },
});

const upload = multer({ storage });

// ✅ Register candidate (with resume + video)
router.post('/register', upload.fields([{ name: 'resume' }, { name: 'video' }]), async (req, res) => {
  try {
    const { name, email, mobile, skills, firstName, lastName, position, currentPosition, experience } = req.body;
    const resumeFile = req.files['resume'] ? req.files['resume'][0] : null;
    const videoFile = req.files['video'] ? req.files['video'][0] : null;

    // Basic logging for diagnostics
    console.log('POST /api/candidates/register');
    console.log('Body keys:', Object.keys(req.body || {}));
    console.log('Files:', {
      resume: resumeFile ? { fieldname: resumeFile.fieldname, originalname: resumeFile.originalname, filename: resumeFile.filename, path: resumeFile.path } : null,
      video: videoFile ? { fieldname: videoFile.fieldname, originalname: videoFile.originalname, filename: videoFile.filename, path: videoFile.path } : null,
    });

    const derivedName = name || [firstName, lastName].filter(Boolean).join(' ').trim();
    if (!derivedName) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!resumeFile) {
      return res.status(400).json({ error: 'Resume file is required (field name: resume)' });
    }
    if (!videoFile) {
      return res.status(400).json({ error: 'Video file is required (field name: video)' });
    }

    const newCandidate = new Candidate({
      name: derivedName,
      email,
      mobile,
      position,
      currentPosition,
      experience: isNaN(Number(experience)) ? undefined : Number(experience),
      skills: typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(Boolean) : [],
      resumeUrl: resumeFile?.filename || '',
      videoUrl: videoFile?.filename || '',
    });

    await newCandidate.save();
    res.status(201).json({ message: 'Candidate Registered Successfully' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

module.exports = router;
