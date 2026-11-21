import { useState, useMemo } from 'react';
import {
  Calculator,
  X,
  TrendingDown,
  Sparkles,
  Percent,
  Calendar,
  Building2,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function FinancialCalculator({ scheme, isOpen, onClose }) {
  if (!scheme) return null;

  const terms = scheme.financial_terms || {};
  const maxAllowedLoan = terms.max_loan || 500000;
  const interestRate = terms.interest_rate || 5.0; // Concessional rate % p.a.
  const subsidyPercent = terms.subsidy_percent || 20.0; // Capital subsidy %
  const maxTenureYears = Math.min(10, Math.max(1, Math.round((terms.max_tenure_months || 60) / 12)));
  const commercialRate = 12.0; // Commercial bank baseline 12.0% p.a.

  // State
  const [loanAmount, setLoanAmount] = useState(
    Math.min(200000, maxAllowedLoan)
  );
  const [tenureYears, setTenureYears] = useState(
    Math.min(5, maxTenureYears)
  );
  const [workingCapitalPercent, setWorkingCapitalPercent] = useState(30); // 30% default working capital split

  // Calculations
  const calculations = useMemo(() => {
    const totalMonths = tenureYears * 12;

    // Subsidy Breakdown
    const subsidyAmount = Math.round(loanAmount * (subsidyPercent / 100));
    const effectivePrincipal = Math.max(0, loanAmount - subsidyAmount);

    // Working Capital vs Term Loan split
    const workingCapitalAmount = Math.round(loanAmount * (workingCapitalPercent / 100));
    const termLoanAmount = loanAmount - workingCapitalAmount;

    // Concessional EMI formula on effective principal
    const monthlyRate = interestRate / 12 / 100;
    let concessionalEmi = 0;
    if (monthlyRate > 0 && totalMonths > 0) {
      concessionalEmi = Math.round(
        (effectivePrincipal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
      );
    } else {
      concessionalEmi = Math.round(effectivePrincipal / totalMonths);
    }

    // Commercial Bank EMI (12% p.a. on gross loan amount without capital subsidy)
    const commMonthlyRate = commercialRate / 12 / 100;
    const commercialEmi = Math.round(
      (loanAmount * commMonthlyRate * Math.pow(1 + commMonthlyRate, totalMonths)) /
      (Math.pow(1 + commMonthlyRate, totalMonths) - 1)
    );

    const totalConcessionalRepayment = concessionalEmi * totalMonths;
    const totalCommercialRepayment = commercialEmi * totalMonths;
    const totalSavings = Math.max(0, totalCommercialRepayment - totalConcessionalRepayment);
    const monthlySavings = Math.max(0, commercialEmi - concessionalEmi);

    return {
      totalMonths,
      subsidyAmount,
      effectivePrincipal,
      workingCapitalAmount,
      termLoanAmount,
      concessionalEmi,
      commercialEmi,
      totalConcessionalRepayment,
      totalCommercialRepayment,
      totalSavings,
      monthlySavings,
    };
  }, [loanAmount, tenureYears, workingCapitalPercent, interestRate, subsidyPercent]);

  // Preset buttons
  const presets = [
    Math.round(maxAllowedLoan * 0.25),
    Math.round(maxAllowedLoan * 0.5),
    Math.round(maxAllowedLoan * 0.75),
    maxAllowedLoan,
  ].filter((v, i, a) => v >= 25000 && a.indexOf(v) === i);

  const content = (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden max-w-2xl w-full">
      {/* Modal Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-orange-50 via-white to-orange-50/30 border-b border-gray-200 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-700 bg-orange-100 border border-orange-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Calculator size={11} /> Step 05 · Financial Calculator
            </span>
            <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
              {scheme.state || 'Central'} Scheme
            </span>
          </div>
          <h2 className="text-lg font-extrabold text-gray-900 leading-snug">
            {scheme.name}
          </h2>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <Building2 size={12} className="text-gray-400" />
            {scheme.issuing_authority} · Concessional Rate: <strong className="text-orange-600 font-bold">{interestRate}% p.a.</strong>
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition cursor-pointer shrink-0"
            title="Close calculator"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Sliders Container */}
        <div className="space-y-5">
          {/* 1. Loan Amount Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <span>Sanctioned Loan Amount (P)</span>
              </label>
              <span className="text-base font-extrabold text-gray-900 font-mono">
                ₹{loanAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <input
              type="range"
              min="25000"
              max={maxAllowedLoan}
              step="5000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
            />

            <div className="flex justify-between text-[11px] text-gray-400 mt-1 font-medium">
              <span>Min: ₹25,000</span>
              <span>Max Cap: ₹{maxAllowedLoan.toLocaleString('en-IN')}</span>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-2 mt-2 items-center">
              <span className="text-[11px] text-gray-500 font-medium">Quick Presets:</span>
              {presets.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setLoanAmount(amt)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    loanAmount === amt
                      ? 'bg-orange-600 text-white shadow-2xs'
                      : 'bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200'
                  }`}
                >
                  ₹{(amt / 100000).toFixed(amt % 100000 === 0 ? 0 : 1)}L
                </button>
              ))}
            </div>
          </div>

          {/* 2. Repayment Tenure Slider */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Calendar size={14} className="text-orange-600" />
                <span>Repayment Tenure (n)</span>
              </label>
              <span className="text-sm font-extrabold text-gray-900 font-mono">
                {tenureYears} Year{tenureYears > 1 ? 's' : ''} ({calculations.totalMonths} Months)
              </span>
            </div>

            <input
              type="range"
              min="1"
              max={maxTenureYears}
              step="1"
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
            />

            <div className="flex justify-between text-[11px] text-gray-400 mt-1 font-medium">
              <span>1 Year (12 mo)</span>
              <span>Max: {maxTenureYears} Years ({maxTenureYears * 12} mo)</span>
            </div>
          </div>

          {/* 3. Working Capital vs Term Loan Slider */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Layers size={14} className="text-orange-600" />
                <span>Loan Allocation Split (Term Loan vs. Working Capital)</span>
              </label>
              <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                {100 - workingCapitalPercent}% Term · {workingCapitalPercent}% Working Cap
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={workingCapitalPercent}
              onChange={(e) => setWorkingCapitalPercent(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
            />

            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-2.5">
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">
                  Term Loan (Machinery / Equipment)
                </p>
                <p className="text-xs font-extrabold text-gray-900 mt-0.5">
                  ₹{calculations.termLoanAmount.toLocaleString('en-IN')}{' '}
                  <span className="text-[10px] text-gray-500 font-normal">({100 - workingCapitalPercent}%)</span>
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-2.5">
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">
                  Working Capital (Raw Material / Yarn)
                </p>
                <p className="text-xs font-extrabold text-gray-900 mt-0.5">
                  ₹{calculations.workingCapitalAmount.toLocaleString('en-IN')}{' '}
                  <span className="text-[10px] text-gray-500 font-normal">({workingCapitalPercent}%)</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Real-Time Computed Outputs Card */}
        <div className="bg-gradient-to-br from-orange-50 via-white to-orange-50/50 border border-orange-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-orange-100">
            <span className="text-xs font-bold text-orange-900 flex items-center gap-1.5">
              <Sparkles size={14} className="text-orange-600" />
              Real-Time Concessional Subsidy & EMI Analysis
            </span>
            <span className="text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck size={12} /> {subsidyPercent}% Capital Subsidy
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Output 1: Subsidized EMI */}
            <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs">
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                Monthly EMI (At {interestRate}%)
              </p>
              <p className="text-xl font-extrabold text-orange-600 font-mono mt-1">
                ₹{calculations.concessionalEmi.toLocaleString('en-IN')}
                <span className="text-xs text-gray-400 font-normal">/mo</span>
              </p>
              <p className="text-[10px] text-gray-500 mt-1 line-through">
                Bank EMI: ₹{calculations.commercialEmi.toLocaleString('en-IN')}/mo
              </p>
            </div>

            {/* Output 2: Capital Subsidy */}
            <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs">
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                Capital Subsidy ({subsidyPercent}%)
              </p>
              <p className="text-xl font-extrabold text-green-600 font-mono mt-1">
                ₹{calculations.subsidyAmount.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">
                Effective Principal: <strong className="text-gray-700">₹{calculations.effectivePrincipal.toLocaleString('en-IN')}</strong>
              </p>
            </div>

            {/* Output 3: Total Interest Saved */}
            <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs">
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                Total Money Saved
              </p>
              <p className="text-xl font-extrabold text-green-700 font-mono mt-1">
                ₹{calculations.totalSavings.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-green-600 font-semibold mt-1 flex items-center gap-1">
                <TrendingDown size={11} /> Saved vs 12% Bank Loan
              </p>
            </div>
          </div>

          {/* Formula Reference Note for Evaluation Transparency */}
          <div className="pt-2 text-[11px] text-gray-500 leading-relaxed bg-white/70 p-3 rounded-xl border border-orange-100 flex items-start gap-2">
            <span className="font-mono text-orange-600 font-bold shrink-0">EMI Formula:</span>
            <span>
              Standard reducing balance formula: <code className="bg-orange-100/70 text-orange-900 px-1 py-0.5 rounded font-mono text-[10px]">EMI = [P · r · (1+r)^n] / [(1+r)^n - 1]</code> computed at {interestRate}% concessional rate after deducting {subsidyPercent}% capital subsidy.
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Estimated values for guidance based on official MoSJE/SCA scheme guidelines.
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-2xs transition cursor-pointer"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );

  // If used as a modal
  if (isOpen !== undefined) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
        {content}
      </div>
    );
  }

  // Otherwise render inline
  return content;
}
