const { GoogleGenAI } = require('@google/genai');

/**
 * Robust caller for Gemini models with exponential backoff retry logic.
 * Automatically catches 503 (UNAVAILABLE / high demand), 429 (rate limits),
 * waits with exponential backoff (1s, 2s, 4s), and retries up to 3 times before throwing.
 * 
 * @param {GoogleGenAI} ai - The GoogleGenAI instance
 * @param {string} modelName - Model name (e.g., 'gemini-3.8-flash' or 'gemini-2.5-flash')
 * @param {Array|string} contents - Prompt contents payload
 * @param {Object} config - Generation configuration options
 * @param {number} retries - Number of retry attempts (default: 3)
 * @returns {Promise<Object>} The Gemini API response
 */
async function callGeminiWithRetry(ai, modelName, contents, config, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      const generatePromise = ai.models.generateContent({
        model: modelName,
        contents,
        config,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API call timed out after 5000ms')), 5000)
      );

      const response = await Promise.race([generatePromise, timeoutPromise]);
      return response;
    } catch (error) {
      const msg = (error.message || '') + ' ' + (error.stack || '') + ' ' + String(error);
      const status = error.status || error.code || error.statusCode || (error.response && error.response.status);

      // If quota is exhausted (429), fail fast immediately to fallback without retrying
      const isQuotaExhausted =
        status === 429 ||
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('Quota exceeded') ||
        msg.includes('rate-limit');

      if (isQuotaExhausted) {
        throw error;
      }

      // Check if it's a 503, timeout, high demand, unavailable, or transient server error
      const isTransient =
        status === 503 ||
        status === 500 ||
        status === 'UNAVAILABLE' ||
        msg.includes('503') ||
        msg.includes('timed out') ||
        msg.includes('UNAVAILABLE') ||
        msg.includes('high demand') ||
        msg.includes('overloaded');

      if (isTransient) {
        if (i === retries - 1) {
          console.warn(`⚠️ Model ${modelName} call failed after ${retries} attempts due to temporary high demand / timeout.`);
          throw error;
        }

        // Exponential backoff: 1s (i=0), 2s (i=1)
        const waitMs = Math.pow(2, i) * 1000;
        console.warn(`⚠️ Model ${modelName} experiencing high demand or timeout. Retrying in ${waitMs / 1000}s (Attempt ${i + 1} of ${retries})...`);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      } else {
        throw error;
      }
    }
  }
}

/**
 * Heuristic fallback parser when AI API is unavailable (503 / outage).
 * Guarantees zero crashes and extracts demographic basics via pattern matching.
 */
const heuristicFallbackExtraction = (rawText) => {
  const lower = rawText.toLowerCase();

  // 1. Age extraction
  let age = null;
  const ageMatch = rawText.match(/\b(\d{1,2})\s*(?:-|\s)?(?:year|yr)s?(?:-|\s)?(?:old)?\b/i) || rawText.match(/\bage\s*:?\s*(\d{1,2})\b/i);
  if (ageMatch) {
    const val = parseInt(ageMatch[1], 10);
    if (val >= 16 && val <= 100) age = val;
  }

  // 2. Gender extraction
  let gender = null;
  if (/\b(female|woman|women|girl)\b/i.test(lower)) gender = 'Female';
  else if (/\b(transgender|trans)\b/i.test(lower)) gender = 'Transgender';
  else if (/\b(male|man|men|boy)\b/i.test(lower)) gender = 'Male';

  // 3. Category extraction
  let category = null;
  if (/\b(safai\s*karamchari|manual\s*scavenger)\b/i.test(lower)) category = 'SAFAI KARAMCHARI';
  else if (/\b(sc|scheduled\s*caste)\b/i.test(lower)) category = 'SC';
  else if (/\b(st|scheduled\s*tribe)\b/i.test(lower)) category = 'ST';
  else if (/\b(obc|other\s*backward\s*class(?:es)?)\b/i.test(lower)) category = 'OBC';
  else if (/\b(dnt|denotified\s*tribe)\b/i.test(lower)) category = 'DNT';
  else if (/\b(general|open)\b/i.test(lower)) category = 'GENERAL';

  // 4. Annual income extraction
  let annual_income = null;
  const lakhMatch = rawText.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs|lpa)\b/i);
  if (lakhMatch) {
    annual_income = Math.round(parseFloat(lakhMatch[1]) * 100000);
  } else {
    const numberMatch = rawText.match(/₹?\s*(\d{5,8})\b/);
    if (numberMatch) {
      annual_income = parseInt(numberMatch[1], 10);
    }
  }

  // 5. City extraction
  let city = null;
  const ignoredWords = ['a', 'the', 'my', 'small', 'our', 'flat', 'house', 'room', 'plot', 'sector', 'block', 'ward', 'road', 'street', 'lane', 'village'];
  const cityMatches = Array.from(rawText.matchAll(/\b(?:in|at|from|residing in|living in)\s+([A-Z][a-z]+)\b/g));
  for (const match of cityMatches) {
    const candidate = match[1].trim();
    if (!ignoredWords.includes(candidate.toLowerCase())) {
      city = candidate;
    }
  }
  if (!city) {
    const commaLocMatch = rawText.match(/,\s*([A-Z][a-z]+)\b(?:\.|\s|$)/);
    if (commaLocMatch && !ignoredWords.includes(commaLocMatch[1].toLowerCase())) {
      city = commaLocMatch[1].trim();
    }
  }

  // 6. State inference from city or text
  const CITY_TO_STATE = {
    hyderabad: 'Telangana',
    secunderabad: 'Telangana',
    warangal: 'Telangana',
    lucknow: 'Uttar Pradesh',
    kanpur: 'Uttar Pradesh',
    varanasi: 'Uttar Pradesh',
    agra: 'Uttar Pradesh',
    noida: 'Uttar Pradesh',
    prayagraj: 'Uttar Pradesh',
    bengaluru: 'Karnataka',
    bangalore: 'Karnataka',
    mysuru: 'Karnataka',
    chennai: 'Tamil Nadu',
    coimbatore: 'Tamil Nadu',
    madurai: 'Tamil Nadu',
    mumbai: 'Maharashtra',
    pune: 'Maharashtra',
    nagpur: 'Maharashtra',
    jaipur: 'Rajasthan',
    jodhpur: 'Rajasthan',
    delhi: 'Delhi',
    kolkata: 'West Bengal',
    patna: 'Bihar',
    bhopal: 'Madhya Pradesh',
    indore: 'Madhya Pradesh',
    ahmedabad: 'Gujarat',
    surat: 'Gujarat',
    kochi: 'Kerala',
    thiruvananthapuram: 'Kerala',
    amaravati: 'Andhra Pradesh',
    visakhapatnam: 'Andhra Pradesh',
    vijayawada: 'Andhra Pradesh',
  };

  const INDIAN_STATES = [
    'Telangana', 'Andhra Pradesh', 'Tamil Nadu', 'Karnataka', 'Kerala',
    'Uttar Pradesh', 'Maharashtra', 'Rajasthan', 'Delhi', 'West Bengal',
    'Bihar', 'Madhya Pradesh', 'Gujarat', 'Punjab', 'Haryana', 'Odisha',
    'Assam', 'Jharkhand', 'Chhattisgarh', 'Uttarakhand', 'Himachal Pradesh',
    'Jammu and Kashmir', 'Goa'
  ];

  let state = null;
  for (const st of INDIAN_STATES) {
    const reg = new RegExp(`\\b${st}\\b`, 'i');
    if (reg.test(rawText)) {
      state = st;
      break;
    }
  }
  if (!state && city) {
    state = CITY_TO_STATE[city.toLowerCase()] || null;
  }

  // 7. Purpose extraction
  let purpose = null;
  const purposeMatch =
    rawText.match(/(?:loan|concessional loan|credit|microfinance|assistance)\s+(?:for|to)\s+([^.,;!?\n]+)/i) ||
    rawText.match(/(?:want to|looking to|seeking to|need to|plan to)\s+([^.,;!?\n]+)/i) ||
    rawText.match(/(?:running a|operating a|start a|expand my)\s+([^.,;!?\n]+)/i);

  if (purposeMatch) {
    purpose = purposeMatch[1].trim().replace(/\s+/g, ' ');
    if (purpose.length > 80) purpose = purpose.slice(0, 80).trim();
  }

  return { age, gender, category, annual_income, city, state, purpose };
};

/**
 * Extracts structured demographic information from raw natural language text.
 * Strips PII and converts Indian numerical contexts (e.g., '1.5 lakhs' -> 150000).
 * If the Gemini API is temporarily unavailable (503), fails gracefully to heuristic extraction.
 * 
 * @param {string} rawText - Natural language input from user
 * @returns {Promise<{ age: number|null, gender: string|null, category: string|null, annual_income: number|null, city: string|null, state: string|null, purpose: string|null }>}
 */
const extractDemographicsFromText = async (rawText) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('⚠️ GEMINI_API_KEY is not defined. Using resilient fallback extractor.');
    return heuristicFallbackExtraction(rawText);
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

  const systemInstruction = `
You are an expert NLP information extraction engine for the government welfare platform "Loan Saathi".
Your mission is to extract socioeconomic demographic variables from user-submitted text for scheme eligibility.

CRITICAL SECURITY & PRIVACY RULES:
1. Strip all Personally Identifiable Information (PII). Do NOT include names, family members' names, phone numbers, email addresses, Aadhaar/PAN numbers, or specific street addresses/house numbers.
2. Only output a valid JSON object with the following EXACT schema:
   {
     "age": number or null,
     "gender": string or null (e.g. "Male", "Female", "Transgender", "Other"),
     "category": string or null (e.g. "SC", "ST", "OBC", "Safai Karamchari", "General", "DNT"),
     "annual_income": number or null,
     "city": string or null (extract ONLY the city/town/district name, strip street/colony/house details),
     "state": string or null (infer Indian State from city or text, e.g. "Telangana", "Uttar Pradesh", "Tamil Nadu", "Karnataka", "Maharashtra", "Rajasthan", "Delhi"),
     "purpose": string or null (concise 3-8 word phrase describing business, equipment, trade, or educational goal)
   }
3. CURRENCY CONVERSION RULE:
   Convert Indian numbering expressions into full annual numerical integers:
   - "1 lakh" -> 100000
   - "1.5 lakh" or "1.5 lakhs" -> 150000
   - "2.5 lpa" -> 250000
   - "50k" or "50 thousand" -> 50000
   - "per month" or "monthly": multiply by 12 to get annual income.
4. If a field is not mentioned or cannot be inferred with certainty, set it to null.
5. Do NOT include markdown code blocks or any conversational commentary. Return ONLY the raw JSON object.
`;

  try {
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `${systemInstruction}\n\nUSER INPUT TEXT:\n"${rawText}"`,
          },
        ],
      },
    ];

    const config = {
      responseMimeType: 'application/json',
      temperature: 0.1, // low temperature for deterministic extraction
    };

    const response = await callGeminiWithRetry(ai, modelName, contents, config, 3);

    const responseText = response.text ? response.text.trim() : '{}';
    const cleanedText = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const parsedData = JSON.parse(cleanedText);

    const city = parsedData.city ? String(parsedData.city).trim() : null;
    let state = parsedData.state ? String(parsedData.state).trim() : null;
    if (!state && city) {
      const CITY_TO_STATE = {
        hyderabad: 'Telangana',
        secunderabad: 'Telangana',
        warangal: 'Telangana',
        lucknow: 'Uttar Pradesh',
        kanpur: 'Uttar Pradesh',
        varanasi: 'Uttar Pradesh',
        agra: 'Uttar Pradesh',
        noida: 'Uttar Pradesh',
        bengaluru: 'Karnataka',
        bangalore: 'Karnataka',
        mysuru: 'Karnataka',
        chennai: 'Tamil Nadu',
        coimbatore: 'Tamil Nadu',
        madurai: 'Tamil Nadu',
        mumbai: 'Maharashtra',
        pune: 'Maharashtra',
        nagpur: 'Maharashtra',
        jaipur: 'Rajasthan',
        delhi: 'Delhi',
        kolkata: 'West Bengal',
        patna: 'Bihar',
        kochi: 'Kerala',
        amaravati: 'Andhra Pradesh',
      };
      state = CITY_TO_STATE[city.toLowerCase()] || null;
    }

    return {
      age: typeof parsedData.age === 'number' ? parsedData.age : null,
      gender: parsedData.gender ? String(parsedData.gender).trim() : null,
      category: parsedData.category ? String(parsedData.category).toUpperCase().trim() : null,
      annual_income: typeof parsedData.annual_income === 'number' ? parsedData.annual_income : null,
      city,
      state,
      purpose: parsedData.purpose ? String(parsedData.purpose).trim() : null,
    };
  } catch (error) {
    console.warn(`⚠️ Gemini Demographic Extraction unavailable (${error.message}). Using resilient fallback extraction.`);
    return heuristicFallbackExtraction(rawText);
  }
};

/**
 * Generates a warm, jargon-free explanation and document checklist
 * strictly grounded in the matched schemes and the user's demographic profile.
 * Automatically falls back to deterministic scheme data if Gemini 503 occurs.
 * 
 * @param {Object} userProfile - Extracted demographics { age, gender, category, annual_income, city }
 * @param {Array} matchedSchemes - List of schemes returned by the deterministic rules engine
 * @returns {Promise<Object>} Grounded explanation and actionable document checklist
 */
const generateSchemeExplanation = async (userProfile, matchedSchemes = []) => {
  // Deduplicate all required documents across matched schemes
  const documentSet = new Set();
  (matchedSchemes || []).forEach((scheme) => {
    (scheme.required_documents || []).forEach((doc) => documentSet.add(doc));
  });
  const consolidatedDocs = Array.from(documentSet);

  const fallbackExplanation = {
    summary: matchedSchemes && matchedSchemes.length > 0
      ? `Great news! Based on your profile (${userProfile?.category || 'eligible applicant'}, annual income ₹${userProfile?.annual_income ? userProfile.annual_income.toLocaleString('en-IN') : 'within limits'}), you qualify for ${matchedSchemes.length} government welfare loan scheme(s).`
      : "We couldn't find an exact scheme match for your current profile at this moment. Don't worry—government guidelines change frequently, and local District Industries Centers (DIC) often have regional grants available.",
    schemes_breakdown: (matchedSchemes || []).map((s) => ({
      scheme_name: s.name,
      issuing_authority: s.issuing_authority,
      why_you_qualify: (s.eligibility_audit && s.eligibility_audit.length > 0)
        ? s.eligibility_audit.join(' ')
        : `Meets all income, age, and social category criteria specified by ${s.issuing_authority}.`,
      required_documents: s.required_documents || [],
    })),
    actionable_document_checklist: consolidatedDocs.length > 0
      ? consolidatedDocs
      : [
          'Aadhaar Card (Identity proof)',
          'Income Certificate from local Revenue Authority',
          'Community / Caste Certificate (if applicable)',
          'Bank Passbook / Account statement',
        ],
    next_steps_advice: 'Collect the verified identity, income, and category documents listed above and visit your local State Channelizing Agency (SCA) or participating bank branch to initiate your application.',
  };

  if (!matchedSchemes || matchedSchemes.length === 0) {
    return fallbackExplanation;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ GEMINI_API_KEY missing. Returning structured fallback explanation.');
    return fallbackExplanation;
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

  // Build grounded scheme context from actual database records
  const schemesContext = matchedSchemes.map((s, idx) => {
    return `[Scheme ${idx + 1}]
Name: ${s.name}
Issuing Authority: ${s.issuing_authority}
Description: ${s.description}
Required Documents: ${(s.required_documents || []).join(', ')}
Eligibility Criteria: Max Income: ₹${s.eligibility_criteria?.max_income ? s.eligibility_criteria.max_income.toLocaleString('en-IN') : 'No ceiling'}, Target Categories: ${(s.eligibility_criteria?.target_category || []).join(', ') || 'All'}, Min Age: ${s.eligibility_criteria?.min_age || 18}
Audit Passed: ${(s.eligibility_audit || []).join(' | ')}`;
  }).join('\n\n');

  const systemInstruction = `
You are the compassionate, expert AI financial counselor for "Loan Saathi", an initiative empowering marginalized entrepreneurs and students under the Ministry of Social Justice & Empowerment (MoSJE).

YOUR MISSION:
Translate government scheme rules into a warm, encouraging, plain-language, and completely jargon-free explanation of why the applicant qualifies for their matched schemes, accompanied by a consolidated checklist of documents they need to prepare.

CRITICAL GROUNDING & INTEGRITY RULES:
1. STRICT GROUNDING: Rely ONLY on the schemes provided in the "MATCHED SCHEMES CONTEXT". Do NOT hallucinate, fabricate, or mention any external schemes, banks, interest rates, or eligibility rules not explicitly stated.
2. JARGON-FREE TONE: Use friendly, empowering, and easily understandable language. Demystify bureaucratic terms into everyday terms.
3. ACCURACY: Explicitly mention how the user's specific demographics (e.g. their income, category, or age) satisfy the scheme's criteria.

OUTPUT FORMAT:
Output ONLY a valid JSON object matching the following structure:
{
  "summary": "Warm, encouraging 2-3 sentence overview addressed directly to the user.",
  "schemes_breakdown": [
    {
      "scheme_name": "Exact name of the scheme",
      "issuing_authority": "Issuing organization",
      "why_you_qualify": "Clear, friendly explanation of why their profile matches this scheme.",
      "required_documents": ["List of documents required specifically for this scheme"]
    }
  ],
  "actionable_document_checklist": [
    "Deduplicated, comprehensive list of all documents the user should collect"
  ],
  "next_steps_advice": "A short, actionable tip on preparing papers or visiting local channel partners."
}
`;

  const prompt = `${systemInstruction}

APPLICANT DEMOGRAPHIC PROFILE:
${JSON.stringify(userProfile, null, 2)}

MATCHED SCHEMES CONTEXT:
${schemesContext}
`;

  try {
    const contents = [
      {
        role: 'user',
        parts: [
          { text: prompt },
        ],
      },
    ];

    const config = {
      responseMimeType: 'application/json',
      temperature: 0.2,
    };

    const response = await callGeminiWithRetry(ai, modelName, contents, config, 3);
    const responseText = response.text ? response.text.trim() : '{}';
    const cleanedText = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const explanationData = JSON.parse(cleanedText);

    return explanationData;
  } catch (error) {
    console.warn(`⚠️ Gemini Explanation 503 / High Demand (${error.message}). Returning clean, structured fallback explanation directly from database schemes.`);
    return fallbackExplanation;
  }
};

module.exports = {
  callGeminiWithRetry,
  extractDemographicsFromText,
  generateSchemeExplanation,
};
