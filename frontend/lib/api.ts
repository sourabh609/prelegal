/** API client for the FastAPI backend. */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail ?? "Request failed");
  return data as T;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: number;
  email: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface PartialNdaFields {
  purpose?: string | null;
  effectiveDate?: string | null;
  mndaTermType?: string | null;
  mndaTermYears?: string | null;
  confidentialityTermType?: string | null;
  confidentialityTermYears?: string | null;
  governingLaw?: string | null;
  jurisdiction?: string | null;
  modifications?: string | null;
  party1Name?: string | null;
  party1Title?: string | null;
  party1Company?: string | null;
  party1Address?: string | null;
  party2Name?: string | null;
  party2Title?: string | null;
  party2Company?: string | null;
  party2Address?: string | null;
}

export interface ChatResponse {
  reply: string;
  fields: PartialNdaFields;
}

export const api = {
  signup: (email: string, password: string) =>
    request<TokenResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    request<TokenResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<UserResponse>("/api/auth/me"),

  chat: (messages: ChatMessage[]) =>
    request<ChatResponse>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages }),
    }),
};
