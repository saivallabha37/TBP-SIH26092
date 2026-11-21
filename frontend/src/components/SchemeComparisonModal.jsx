import { X, Sparkles, Check, CheckCircle2, Building2, Calculator, ShieldCheck, Trash2 } from 'lucide-react';

export default function SchemeComparisonModal({
  isOpen,
  onClose,
  schemes = [],
  onCalculate,
  onRemove,
}) {
  if (!isOpen || !schemes || schemes.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-orange-50 via-white to-orange-50/40 border-b border-gray-200 flex items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-700 bg-orange-100 border border-orange-200 px-2.5 py-0.5 rounded-full inline-block">
                Decision Matrix · Section 4.4
              </span>
              <span className="text-xs font-semibold text-gray-500">
                Comparing {schemes.length} Scheme{schemes.length > 1 ? 's' : ''} (Max 3)
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 flex items-center gap-2">
              Side-by-Side Scheme Comparison Matrix
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition cursor-pointer shrink-0"
            title="Close comparison modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Table Content */}
        <div className="p-4 sm:p-6 overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full border-collapse text-left text-xs sm:text-sm min-w-[600px]">
            {/* Header Columns */}
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="p-3 w-1/4 bg-gray-50/80 font-bold text-gray-700 rounded-tl-xl text-xs uppercase tracking-wider">
                  Attribute / Parameter
                </th>
                {schemes.map((scheme) => (
                  <th
                    key={scheme._id}
                    className="p-3 bg-white border-l border-gray-200 text-left align-top"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <span className="text-[10px] font-extrabold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md inline-block mb-1">
                          {scheme.state || 'Central'} Jurisdiction
                        </span>
                        <h3 className="font-extrabold text-gray-900 text-sm leading-snug">
                          {scheme.name}
                        </h3>
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5 flex items-center gap-1">
                          <Building2 size={12} className="text-gray-400" />
                          {scheme.issuing_authority}
                        </p>
                      </div>

                      {onRemove && (
                        <button
                          type="button"
                          onClick={() => onRemove(scheme._id)}
                          className="text-gray-400 hover:text-red-600 transition p-1 cursor-pointer"
                          title="Remove from comparison"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-gray-800">
              {/* Row 1: AI Semantic Relevance Match */}
              <tr className="hover:bg-orange-50/20 transition">
                <td className="p-3 bg-gray-50/60 font-semibold text-gray-700 text-xs flex items-center gap-1.5">
                  <Sparkles size={13} className="text-orange-600" />
                  AI Semantic Intent Match
                </td>
                {schemes.map((scheme) => (
                  <td key={scheme._id} className="p-3 border-l border-gray-200">
                    {scheme.semantic_score != null ? (
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-orange-600 font-mono text-sm">
                          {scheme.semantic_score}%
                        </span>
                        <div className="w-20 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-orange-600 h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(5, scheme.semantic_score))}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Deterministic Match</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Row 2: Deterministic Rules Compliance */}
              <tr className="hover:bg-orange-50/20 transition">
                <td className="p-3 bg-gray-50/60 font-semibold text-gray-700 text-xs flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-green-600" />
                  Deterministic Rules Engine
                </td>
                {schemes.map((scheme) => (
                  <td key={scheme._id} className="p-3 border-l border-gray-200">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-md">
                      <CheckCircle2 size={12} /> 100% Eligible
                    </span>
                  </td>
                ))}
              </tr>

              {/* Row 3: Max Concessional Loan */}
              <tr className="hover:bg-orange-50/20 transition">
                <td className="p-3 bg-gray-50/60 font-semibold text-gray-700 text-xs">
                  Max Loan Limit (Cap)
                </td>
                {schemes.map((scheme) => (
                  <td key={scheme._id} className="p-3 border-l border-gray-200 font-mono font-extrabold text-gray-900">
                    ₹{(scheme.financial_terms?.max_loan || 500000).toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>

              {/* Row 4: Concessional Interest Rate */}
              <tr className="hover:bg-orange-50/20 transition">
                <td className="p-3 bg-gray-50/60 font-semibold text-gray-700 text-xs">
                  Subsidized Interest Rate
                </td>
                {schemes.map((scheme) => (
                  <td key={scheme._id} className="p-3 border-l border-gray-200">
                    <span className="font-extrabold text-orange-700 font-mono">
                      {scheme.financial_terms?.interest_rate || 5.0}% p.a.
                    </span>
                    <span className="text-[10px] text-gray-500 block">
                      (vs 12.0% Commercial Bank Rate)
                    </span>
                  </td>
                ))}
              </tr>

              {/* Row 5: Capital Subsidy % */}
              <tr className="hover:bg-orange-50/20 transition">
                <td className="p-3 bg-gray-50/60 font-semibold text-gray-700 text-xs">
                  Capital Subsidy
                </td>
                {schemes.map((scheme) => (
                  <td key={scheme._id} className="p-3 border-l border-gray-200">
                    <span className="font-extrabold text-green-700 font-mono">
                      {scheme.financial_terms?.subsidy_percent || 20}%
                    </span>{' '}
                    <span className="text-xs text-gray-500">Government Grant</span>
                  </td>
                ))}
              </tr>

              {/* Row 6: Repayment Tenure */}
              <tr className="hover:bg-orange-50/20 transition">
                <td className="p-3 bg-gray-50/60 font-semibold text-gray-700 text-xs">
                  Max Repayment Tenure
                </td>
                {schemes.map((scheme) => (
                  <td key={scheme._id} className="p-3 border-l border-gray-200 font-medium text-gray-800">
                    {scheme.financial_terms?.max_tenure_months || 60} Months (
                    {Math.round((scheme.financial_terms?.max_tenure_months || 60) / 12)} Years)
                  </td>
                ))}
              </tr>

              {/* Row 7: Working Capital Allowed */}
              <tr className="hover:bg-orange-50/20 transition">
                <td className="p-3 bg-gray-50/60 font-semibold text-gray-700 text-xs">
                  Working Capital Facility
                </td>
                {schemes.map((scheme) => (
                  <td key={scheme._id} className="p-3 border-l border-gray-200">
                    {scheme.financial_terms?.working_capital_allowed !== false ? (
                      <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Check size={11} /> Supported
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        Term Loan Only
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Row 8: Max Income Limit */}
              <tr className="hover:bg-orange-50/20 transition">
                <td className="p-3 bg-gray-50/60 font-semibold text-gray-700 text-xs">
                  Max Annual Income Limit
                </td>
                {schemes.map((scheme) => (
                  <td key={scheme._id} className="p-3 border-l border-gray-200 font-medium">
                    {scheme.eligibility_criteria?.max_income ? (
                      <span className="text-gray-900 font-mono font-bold">
                        ₹{(scheme.eligibility_criteria.max_income / 100000).toFixed(1)} Lakhs/yr
                      </span>
                    ) : (
                      <span className="text-green-700 font-semibold">No Income Cap</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Row 9: Target Categories */}
              <tr className="hover:bg-orange-50/20 transition">
                <td className="p-3 bg-gray-50/60 font-semibold text-gray-700 text-xs">
                  Target Beneficiary Categories
                </td>
                {schemes.map((scheme) => (
                  <td key={scheme._id} className="p-3 border-l border-gray-200">
                    <div className="flex flex-wrap gap-1">
                      {scheme.eligibility_criteria?.target_category?.map((cat) => (
                        <span
                          key={cat}
                          className="text-[10px] font-bold bg-orange-50 text-orange-800 border border-orange-200 px-1.5 py-0.5 rounded"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 10: Required Documents */}
              <tr className="hover:bg-orange-50/20 transition">
                <td className="p-3 bg-gray-50/60 font-semibold text-gray-700 text-xs">
                  Required Documentation
                </td>
                {schemes.map((scheme) => (
                  <td key={scheme._id} className="p-3 border-l border-gray-200 text-xs text-gray-700">
                    <p className="font-bold text-gray-900 mb-1">
                      {scheme.required_documents?.length || 0} Documents
                    </p>
                    <ul className="space-y-1 text-[11px] text-gray-600">
                      {scheme.required_documents?.slice(0, 4).map((doc, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-orange-600 shrink-0" />
                          <span className="truncate">{doc}</span>
                        </li>
                      ))}
                      {(scheme.required_documents?.length || 0) > 4 && (
                        <li className="text-[10px] text-gray-400 font-medium italic">
                          +{scheme.required_documents.length - 4} more documents...
                        </li>
                      )}
                    </ul>
                  </td>
                ))}
              </tr>

              {/* Row 11: Action / Calculator Launcher */}
              <tr className="bg-gray-50/40">
                <td className="p-3 bg-gray-100/70 font-bold text-gray-800 text-xs">
                  Interactive Analysis
                </td>
                {schemes.map((scheme) => (
                  <td key={scheme._id} className="p-3 border-l border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onCalculate) onCalculate(scheme);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-xs py-2 px-3 rounded-xl transition shadow-2xs cursor-pointer"
                    >
                      <Calculator size={13} />
                      <span>Calculate EMI & Subsidy</span>
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 shrink-0">
          <span>
            Comparing schemes side-by-side using unified financial terms & deterministic criteria.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
}
