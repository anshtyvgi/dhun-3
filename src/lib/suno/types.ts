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

export interface SunoSongData {
  id: string;
  title: string;
  audio_url: string;
  stream_audio_url?: string;
  image_url?: string;
  lyric?: string;
  model_name?: string;
  status: string;
  duration?: number;
  created_at?: string;
  tags?: string;
  error_message?: string;
}

export interface SunoStatusResponse {
  task_id: string;
  status: string;
  data?: SunoSongData[];
  error?: string;
}
