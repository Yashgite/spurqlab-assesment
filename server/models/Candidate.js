const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  // Core identity
  name: { type: String, required: true },
  email: { type: String }, // not required to support current frontend
  mobile: { type: String }, // not required to support current frontend

  // Frontend fields
  position: { type: String },
  currentPosition: { type: String },
  experience: { type: Number },

  // Optional legacy field
  skills: [String],

  // Upload references (filenames in GridFS)
  resumeUrl: { type: String },
  videoUrl: { type: String },
}, { timestamps: true });

// Allow multiple documents without email; enforce uniqueness only when email exists
candidateSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: 'string' } } }
);

module.exports = mongoose.model('Candidate', candidateSchema);
