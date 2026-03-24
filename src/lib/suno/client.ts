import type { SunoGenerateRequest, SunoTaskResponse, SunoStatusResponse } from "./types";

const SUNO_BASE_URL = "https://api.sunoapi.org/api/v1/generate";
const SUNO_API_KEY = process.env.SUNO_API_KEY!;

async function sunoFetch(url: string, options: RequestInit = {}) {
  console.log(`[Suno] ${options.method || "GET"} ${url}`);

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUNO_API_KEY}`,
      ...options.headers,
    },
  });

  const text = await response.text();
  console.log(`[Suno] Response ${response.status}: ${text.slice(0, 300)}`);

  if (!response.ok) {
    throw new Error(`Suno API error (${response.status}): ${text}`);
  }

  // Clean control characters before parsing
  const cleaned = text.replace(/[\x00-\x1f\x7f]/g, " ");
  return JSON.parse(cleaned);
}

export async function generateSong(
  request: SunoGenerateRequest
): Promise<SunoTaskResponse> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dhun-3.vercel.app";
  // Non-custom mode: prompt max 500 chars. Truncate if needed.
  const prompt = request.customMode
    ? request.prompt
    : (request.prompt || "").slice(0, 490);

  const body = {
    prompt,
    style: request.style || "",
    title: request.title || "",
    customMode: request.customMode ?? false,
    instrumental: request.instrumental ?? false,
    model: request.model || "V4",
    callBackUrl: request.callbackUrl || `${appUrl}/api/generate/webhook`,
  };

  const result = await sunoFetch(SUNO_BASE_URL, {
    method: "POST",
    body: JSON.stringify(body),
  });

  // Extract taskId — try all possible paths
  const taskId = result?.data?.taskId || result?.taskId || result?.data?.task_id || null;
  console.log(`[Suno] Raw result keys: ${JSON.stringify(Object.keys(result || {}))}`);
  console.log(`[Suno] result.data: ${JSON.stringify(result?.data)}`);
  console.log(`[Suno] Extracted taskId: ${taskId}`);

  if (!taskId) {
    throw new Error(`Suno returned no taskId. Response: ${JSON.stringify(result).slice(0, 200)}`);
  }

  return { task_id: taskId, status: "pending" };
}

export async function getSongStatus(
  taskId: string
): Promise<SunoStatusResponse> {
  const result = await sunoFetch(
    `https://api.sunoapi.org/api/v1/generate/record-info?taskId=${taskId}`,
    { method: "GET" }
  );

  const data = result.data;

  return {
    task_id: taskId,
    status: data?.status || "PENDING",
    data: data?.response?.sunoData || [],
    error: data?.errorMessage,
  };
}
