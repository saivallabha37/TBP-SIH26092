const mongoose = require('mongoose');

const eligibilityCriteriaSchema = new mongoose.Schema(
  {
    max_income: {
      type: Number,
      required: false, // null or undefined means no strict upper income limit
    },
    target_category: {
      type: [String], // Array of targeted categories (e.g., ['SC', 'ST', 'OBC', 'Safai Karamchari', 'Women', 'All'])
      default: [],
    },
    min_age: {
      type: Number,
      default: 18,
    },
  },
  { _id: false }
);

const financialTermsSchema = new mongoose.Schema(
  {
    max_loan: {
      type: Number,
      default: 500000,
    },
    interest_rate: {
      type: Number,
      default: 5.0, // Annual percentage (e.g., 4.0% - 6.0%)
    },
    subsidy_percent: {
      type: Number,
      default: 20.0, // Back-ended capital subsidy percentage
    },
    max_tenure_months: {
      type: Number,
      default: 60, // Repayment tenure in months
    },
    working_capital_allowed: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const schemeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Scheme name is required'],
      trim: true,
      unique: true,
    },
    issuing_authority: {
      type: String,
      required: [true, 'Issuing authority is required (e.g., NSFDC, NBCFDC, NSKFDC)'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Scheme description is required'],
      trim: true,
    },
    state: {
      type: String,
      default: 'Central',
      trim: true,
      index: true,
    },
    financial_terms: {
      type: financialTermsSchema,
      default: () => ({}),
    },
    required_documents: {
      type: [String],
      default: [],
    },
    eligibility_criteria: {
      type: eligibilityCriteriaSchema,
      required: true,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common filter queries during deterministic scheme matching
schemeSchema.index({ 'eligibility_criteria.max_income': 1 });
schemeSchema.index({ 'eligibility_criteria.target_category': 1 });

const Scheme = mongoose.model('Scheme', schemeSchema);

module.exports = Scheme;
