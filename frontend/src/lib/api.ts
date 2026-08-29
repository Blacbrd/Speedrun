import { API_BASE_URL } from '../constants/config';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function parse<T>(response: Response): Promise<T> {
  const body = await response.text();
  let payload: unknown = null;

  if (body.length > 0) {
    try {
      payload = JSON.parse(body);
    } catch {
      payload = body;
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, detailOf(payload) ?? `Request failed (${response.status})`);
  }

  return payload as T;
}

function detailOf(payload: unknown): string | null {
  if (typeof payload === 'string' && payload.length > 0) {
    return payload;
  }
  if (payload && typeof payload === 'object' && 'detail' in payload) {
    const detail = (payload as { detail: unknown }).detail;
    if (typeof detail === 'string') {
      return detail;
    }
    return JSON.stringify(detail);
  }
  return null;
}

export async function get<T>(path: string, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return parse<T>(response);
}

export async function postJson<T>(path: string, body: unknown, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return parse<T>(response);
}

export async function postForm<T>(path: string, form: FormData, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    // Content-Type is set by the runtime so the multipart boundary is correct.
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });
  return parse<T>(response);
}
