import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY is not defined in the environment variables. Please check your .env file.",
  );
}

const genAI = new GoogleGenerativeAI(apiKey);

const DEFAULT_MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL,
  // Primary models (may hit free-tier quota)
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  // Fallbacks verified to exist for this API key
  "gemini-2.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-2.5-flash",
  "gemini-flash-latest",
];


const buildModelCandidates = (candidates = []) =>
  [...candidates, ...DEFAULT_MODEL_CANDIDATES].filter(
    (modelName, index, allModels) =>
      Boolean(modelName) && allModels.indexOf(modelName) === index,
  );

export const isGeminiModelUnavailableError = (error) => {
  const message = error?.message || "";

  return (
    // Model not found / unsupported
    error?.status === 404 ||
    /is not found/i.test(message) ||
    /not supported for generateContent/i.test(message) ||
    // Quota / rate limit exhausted — try next model
    error?.status === 429 ||
    /quota/i.test(message) ||
    /Too Many Requests/i.test(message) ||
    /exceeded your current quota/i.test(message)
  );
};

export async function withGeminiModel(
  runWithModel,
  { candidates = [] } = {},
) {
  const modelCandidates = buildModelCandidates(candidates);
  let lastError = null;

  for (const modelName of modelCandidates) {
    const model = genAI.getGenerativeModel({ model: modelName });

    try {
      return await runWithModel(model, modelName);
    } catch (error) {
      const reason = error?.status === 429 ? "quota exceeded" : "unavailable";
      console.warn(`Model '${modelName}' ${reason} (${error?.status ?? "unknown status"}). Trying next fallback...`);

      if (!isGeminiModelUnavailableError(error)) {
        throw error;
      }

      lastError = error;
    }
  }

  throw (
    lastError ||
    new Error("No supported Gemini model candidates are configured.")
  );
}

