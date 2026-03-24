export interface SunoGenerateRequest {
  prompt: string;
  style?: string;
  title?: string;
  customMode?: boolean;
  instrumental?: boolean;
  model?: string;
  callbackUrl?: string;
}

export interface SunoTaskResponse {
  task_id: string;
  status: string;
}

// Matches actual API camelCase response
export interface SunoSongData {
  id: string;
  title: string;
  audioUrl: string;
  sourceAudioUrl?: string;
  streamAudioUrl?: string;
  sourceStreamAudioUrl?: string;
  imageUrl?: string;
  sourceImageUrl?: string;
  prompt?: string;
  modelName?: string;
  duration?: number;
  createTime?: number;
  tags?: string;
}

export interface SunoStatusResponse {
  task_id: string;
  status: string;
  data?: SunoSongData[];
  error?: string;
}
