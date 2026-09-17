import type { ApiErrorBody } from '@/types/api';

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    super(body.error ?? body.errors?.join(', ') ?? `Request failed (${String(status)})`);
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = {
  method?: string;
  body?: BodyInit | null;
  headers?: HeadersInit;
  locale?: string;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.locale) {
    headers.set('Accept-Language', options.locale);
  }

  const hasJsonBody = options.body !== undefined && !(options.body instanceof FormData);
  if (hasJsonBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const url = new URL(`${baseUrl}${path.startsWith('/') ? path : `/${path}`}`);
  if (options.locale) {
    url.searchParams.set('locale', options.locale);
  }

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers,
    body: options.body,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : {};

  if (!response.ok) {
    throw new ApiError(response.status, data as ApiErrorBody);
  }

  return data as T;
}
