import type { SunoGenerateRequest, SunoTaskResponse, SunoStatusResponse } from "./types";

const SUNO_BASE_URL = "https://apibox.erweima.ai/api/v1/generate";
const SUNO_API_KEY = process.env.SUNO_API_KEY!;

async function sunoFetch(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUNO_API_KEY}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Suno API error (${response.status}): ${error}`);
  }

  return response.json();
}

export async function generateSong(
  request: SunoGenerateRequest
): Promise<SunoTaskResponse> {
  const body = {
    prompt: request.prompt,
    style: request.style || "",
    title: request.title || "",
    customMode: request.customMode ?? false,
    instrumental: request.instrumental ?? false,
    model: request.model || "V4",
    callbackUrl: request.callbackUrl || "",
  };

  const result = await sunoFetch(SUNO_BASE_URL, {
    method: "POST",
    body: JSON.stringify(body),
  });

  return {
    task_id: result.data?.taskId || result.taskId || result.data?.task_id,
    status: "pending",
  };
}

export async function getSongStatus(
  taskId: string
): Promise<SunoStatusResponse> {
  const result = await sunoFetch(
    `https://apibox.erweima.ai/api/v1/generate/record-info?taskId=${taskId}`,
    { method: "GET" }
  );

  const data = result.data;

  return {
    task_id: taskId,
    status: data?.status || "pending",
    data: data?.response?.sunoData || data?.sunoData || [],
    error: data?.errorMessage,
  };
}
