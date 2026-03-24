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

  return JSON.parse(text);
}

export async function generateSong(
  request: SunoGenerateRequest
): Promise<SunoTaskResponse> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dhun-3.vercel.app";
  const body = {
    prompt: request.prompt,
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

  const taskId = result.data?.taskId || result.taskId || result.data?.task_id;
  console.log(`[Suno] Generated taskId: ${taskId}`);

  return {
    task_id: taskId,
    status: "pending",
  };
}

export async function getSongStatus(
  taskId: string
): Promise<SunoStatusResponse> {
  const result = await sunoFetch(
    `https://api.sunoapi.org/api/v1/generate/record-info?taskId=${taskId}`,
    { method: "GET" }
  );

  const data = result.data;
  console.log(`[Suno] Status for ${taskId}: ${data?.status}, sunoData count: ${data?.response?.sunoData?.length || 0}`);

  return {
    task_id: taskId,
    status: data?.status || "PENDING",
    data: data?.response?.sunoData || [],
    error: data?.errorMessage,
  };
}
