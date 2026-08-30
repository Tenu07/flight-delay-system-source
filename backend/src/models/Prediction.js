const mongoose = require('mongoose');

const explanationSchema = new mongoose.Schema({
  feature: String,
  label: String,
  value: mongoose.Schema.Types.Mixed,
  shap_value: Number,
  direction: { type: String, enum: ['increase', 'decrease'] }
}, { _id: false });

const predictionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  origin: { type: String, required: true, uppercase: true, trim: true },
  destination: { type: String, required: true, uppercase: true, trim: true },
  carrier: { type: String, required: true, uppercase: true, trim: true },
  flightDate: { type: Date, required: true },
  depTime: { type: String, required: true },
  distance: { type: Number, required: true, min: 1 },
  delayProbability: { type: Number, required: true, min: 0, max: 100 },
  riskCategory: { type: String, enum: ['Low', 'Moderate', 'High'], required: true },
  shapExplanation: [explanationSchema],
  weather: { type: mongoose.Schema.Types.Mixed, default: {} },
  modelUsed: { type: String, default: 'XGBoost' }
}, { timestamps: true });

predictionSchema.index({ userId: 1, createdAt: -1 });
predictionSchema.index({ origin: 1, destination: 1, carrier: 1 });

module.exports = mongoose.model('Prediction', predictionSchema);
