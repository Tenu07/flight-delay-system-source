const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  predictionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prediction', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  wasAccurate: { type: Boolean, required: true },
  comment: { type: String, trim: true, maxlength: 1000, default: '' }
}, { timestamps: true });

feedbackSchema.index({ userId: 1, predictionId: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
