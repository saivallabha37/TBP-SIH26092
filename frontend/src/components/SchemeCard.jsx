import { useState } from 'react';
import {
  CheckCircle,
  FileText,
  Building2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Award,
  Calculator,
  Sparkles,
  MapPin,
  Percent,
  Coins,
} from 'lucide-react';
import FinancialCalculator from './FinancialCalculator';

const AUTHORITY_COLORS = {
  NSFDC: 'bg-blue-50 text-blue-800 border-blue-200',
  NBCFDC: 'bg-purple-50 text-purple-800 border-purple-200',
  NSKFDC: 'bg-teal-50 text-teal-800 border-teal-200',
  MoSJE: 'bg-orange-50 text-orange-800 border-orange-200',
  TSSCCFC: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  UPSCFDC: 'bg-indigo-50 text-indigo-800 border-indigo-200',
};

function getAuthorityTag(authority) {
  for (const [key, cls] of Object.entries(AUTHORITY_COLORS)) {
    if (authority?.includes(key)) return { key, cls };
  }
  return { key: 'Govt. Scheme', cls: 'bg-gray-100 text-gray-800 border-gray-200' };
}

export default function SchemeCard({
  scheme,
  breakdown,
  isSelectedForCompare = false,
  onToggleCompare,
  disableCompare = false,
  onOpenCalculator,
}) {
  const [docsExpanded, setDocsExpanded] = useState(false);
  const [auditExpanded, setAuditExpanded] = useState(false);
  const [calcExpanded, setCalcExpanded] = useState(false);
  const { key, cls } = getAuthorityTag(scheme.issuing_authority);

  const auditChecks = scheme.eligibility_audit || [];
  const terms = scheme.financial_terms || {};
  const semanticScore = scheme.semantic_score != null ? scheme.semantic_score : null;

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
        isSelectedForCompare
          ? 'border-orange-500 shadow-md ring-2 ring-orange-200'
          : 'border-gray-200 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Card Header */}
      <div className="p-5 pb-4">
        {/* Top Badges Row: Authority, State, ML Relevance, 100% Eligible & Compare Checkbox */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wide ${cls}`}
            >
              {key}
            </span>

            {/* Jurisdiction Badge */}
            <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <MapPin size={11} className="text-gray-400" />
              {scheme.state || 'Central'}
            </span>

            {/* ML Relevance Badge (Phase C Requirement) */}
            {semanticScore != null && (
              <span className="text-[11px] font-extrabold text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                <Sparkles size={11} className="text-orange-600" />
                AI Intent Match: {semanticScore}%
              </span>
            )}

            {/* 100% Rule Eligible Badge */}
            <button
              type="button"
              onClick={() => setAuditExpanded(!auditExpanded)}
              className="text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 transition cursor-pointer"
              title="Click to view rule verification audit"
            >
              <CheckCircle size={12} className="text-green-600" />
              100% Rule Eligible
            </button>
          </div>

          {/* Compare Checkbox Toggle (Phase C Requirement) */}
          {onToggleCompare && (
            <label
              className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border transition select-none ${
                isSelectedForCompare
                  ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                  : disableCompare
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400 cursor-pointer'
              }`}
              title={
                disableCompare && !isSelectedForCompare
                  ? 'Maximum 3 schemes can be compared at once'
                  : 'Select to compare side-by-side'
              }
            >
              <input
                type="checkbox"
                checked={isSelectedForCompare}
                disabled={disableCompare && !isSelectedForCompare}
                onChange={() => onToggleCompare(scheme)}
                className="accent-orange-600 rounded cursor-pointer w-3.5 h-3.5"
              />
              <span>Compare</span>
            </label>
          )}
        </div>

        {/* Title and Authority */}
        <h3 className="font-extrabold text-gray-900 text-base sm:text-lg leading-snug">
          {scheme.name}
        </h3>
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 font-medium">
          <Building2 size={13} className="text-gray-400 shrink-0" />
          {scheme.issuing_authority}
        </p>

        {/* Description */}
        <p className="text-sm text-gray-600 mt-3 leading-relaxed">
          {scheme.description}
        </p>
      </div>

      {/* Financial Terms Highlights Grid */}
      {terms.max_loan && (
        <div className="mx-5 mb-3 p-3 bg-gradient-to-r from-orange-50/70 via-gray-50 to-orange-50/40 border border-orange-100 rounded-xl grid grid-cols-3 gap-2 text-center">
          <div>
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider block">
              Max Sanction
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-gray-900 font-mono">
              ₹{(terms.max_loan / 100000).toFixed(terms.max_loan % 100000 === 0 ? 0 : 1)} Lakhs
            </span>
          </div>

          <div className="border-x border-orange-200/60">
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider block">
              Interest Rate
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-orange-700 font-mono">
              {terms.interest_rate || 5.0}% p.a.
            </span>
          </div>

          <div>
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider block">
              Capital Subsidy
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-green-700 font-mono">
              {terms.subsidy_percent || 20}%
            </span>
          </div>
        </div>
      )}

      {/* Eligibility Criteria Tags */}
      <div className="px-5 pb-3 flex flex-wrap gap-2">
        {scheme.eligibility_criteria?.max_income ? (
          <span className="text-xs font-semibold bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full">
            Income Cap: ₹{(scheme.eligibility_criteria.max_income / 100000).toFixed(1)} Lakhs
          </span>
        ) : (
          <span className="text-xs font-semibold bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full">
            No Income Ceiling
          </span>
        )}
        {scheme.eligibility_criteria?.target_category?.map((cat) => (
          <span
            key={cat}
            className="text-xs font-semibold bg-orange-50 text-orange-800 border border-orange-200 px-2.5 py-1 rounded-full"
          >
            Category: {cat}
          </span>
        ))}
        <span className="text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-full">
          Min Age: {scheme.eligibility_criteria?.min_age || 18}+
        </span>
      </div>

      {/* AI Grounded Reason (Why You Qualify) */}
      {breakdown?.why_you_qualify && (
        <div className="mx-5 mb-4 p-3.5 bg-orange-50 rounded-xl border border-orange-100">
          <p className="text-xs font-bold text-orange-900 mb-1 flex items-center gap-1.5">
            <Award size={14} className="text-orange-600" />
            Why You Qualify
          </p>
          <p className="text-xs text-orange-950 leading-relaxed font-normal">
            {breakdown.why_you_qualify}
          </p>
        </div>
      )}

      {/* Collapsible Section 1: Required Documents */}
      <div className="border-t border-gray-100">
        <button
          type="button"
          onClick={() => setDocsExpanded(!docsExpanded)}
          className="w-full px-5 py-3 flex items-center justify-between text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <FileText size={15} className="text-orange-600" />
            <span>Required Documents ({scheme.required_documents?.length || 0})</span>
          </span>
          {docsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {docsExpanded && (
          <div className="px-5 pb-4 space-y-2 bg-gray-50/50 pt-2 border-t border-gray-100">
            {scheme.required_documents?.map((doc, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs text-gray-800">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 shrink-0" />
                <span>{doc}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Collapsible Section 2: Step 05 Financial Calculator (Feature 3) */}
      <div className="border-t border-gray-100">
        <div className="flex items-center justify-between px-5 py-2.5 hover:bg-orange-50/40 transition">
          <button
            type="button"
            onClick={() => setCalcExpanded(!calcExpanded)}
            className="flex-1 flex items-center gap-2 text-xs font-bold text-gray-900 text-left cursor-pointer"
          >
            <Calculator size={15} className="text-orange-600" />
            <span>Interactive EMI & Subsidy Calculator</span>
            <span className="text-[10px] font-extrabold bg-orange-100 text-orange-800 border border-orange-200 px-2 py-0.5 rounded-full hidden sm:inline">
              Calculate Savings
            </span>
          </button>

          <div className="flex items-center gap-2">
            {onOpenCalculator && (
              <button
                type="button"
                onClick={() => onOpenCalculator(scheme)}
                className="text-[11px] font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-2.5 py-1 rounded-lg transition cursor-pointer shadow-2xs"
              >
                Open Full Modal
              </button>
            )}

            <button
              type="button"
              onClick={() => setCalcExpanded(!calcExpanded)}
              className="text-gray-500 p-1 cursor-pointer"
              title={calcExpanded ? 'Collapse calculator' : 'Expand calculator'}
            >
              {calcExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {calcExpanded && (
          <div className="p-4 bg-gray-50/60 border-t border-gray-100 animate-fadeIn">
            <FinancialCalculator scheme={scheme} />
          </div>
        )}
      </div>

      {/* Collapsible Section 3: Deterministic Rules Engine Audit Trail */}
      {auditChecks.length > 0 && (
        <div className="border-t border-gray-100">
          <button
            type="button"
            onClick={() => setAuditExpanded(!auditExpanded)}
            className="w-full px-5 py-3 flex items-center justify-between text-xs font-bold text-gray-900 hover:bg-green-50/40 transition cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-green-600" />
              <span>View Eligibility Audit</span>
              <span className="bg-green-100 text-green-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-green-200">
                {auditChecks.length}/{auditChecks.length} Passed
              </span>
            </span>
            <div className="flex items-center gap-1 text-gray-500">
              <span className="text-[11px] font-medium hidden sm:inline">
                {auditExpanded ? 'Hide' : 'Inspect Rules'}
              </span>
              {auditExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </button>

          {auditExpanded && (
            <div className="px-5 pb-4 pt-2 bg-green-50/40 border-t border-green-100 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between pb-1">
                <p className="text-[10px] font-bold text-green-900 uppercase tracking-wider">
                  Deterministic Rules Engine Audit Trail
                </p>
                <span className="text-[10px] text-green-700 bg-white border border-green-200 px-2 py-0.5 rounded font-mono font-medium">
                  100% Deterministic Compliance
                </span>
              </div>

              {auditChecks.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 bg-white border border-green-200 rounded-xl shadow-2xs"
                >
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle size={14} className="text-green-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-800 leading-relaxed font-medium">
                      {rule}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
