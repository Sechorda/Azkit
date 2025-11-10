/* Simple client for the local PowerShell backend (AzGraphBackend.ps1) */
export type ConnectResult = {
  ok: boolean;
  context?: any;
  alreadyConnected?: boolean;
  status?: string;
  message?: string;
  command?: string;
  error?: string;
};

export type StatusResult = {
  ok: boolean;
  connected: boolean;
  context?: any;
  error?: string;
};

export type RunResult<T = unknown> = {
  ok: boolean;
  data?: T;
  error?: string;
  details?: any;
};

const BASE = (import.meta as any).env?.VITE_PS_BASE || "http://127.0.0.1:8080";

async function getJSON<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  console.log(`🌐 Making API request to: ${input}`);
  console.log(`🌐 Request options:`, init);
  
  try {
    const res = await fetch(input, init);
    console.log(`🌐 Response status: ${res.status} ${res.statusText}`);
    console.log(`🌐 Response headers:`, Object.fromEntries(res.headers.entries()));
    
    if (!res.ok) {
      console.error(`❌ HTTP error: ${res.status} ${res.statusText}`);
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const json = (await res.json()) as T;
    console.log(`📦 Response JSON:`, json);
    return json;
  } catch (error) {
    console.error(`💥 Fetch error for ${input}:`, error);
    throw error;
  }
}

export async function psConnect(): Promise<ConnectResult> {
  console.log("🔗 Calling psConnect...");
  return getJSON<ConnectResult>(`${BASE}/connect`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
}

export async function psStatus(): Promise<StatusResult> {
  console.log("📊 Calling psStatus...");
  return getJSON<StatusResult>(`${BASE}/status`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
}

export async function psRun<T = unknown>(cmd: string, params?: Record<string, any>): Promise<RunResult<T>> {
  console.log(`⚡ Calling psRun with cmd: ${cmd}, params:`, params);
  return getJSON<RunResult<T>>(`${BASE}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cmd, params })
  });
}

export type EnvResult = {
  ok: boolean;
  mode?: "Server" | "Client";
  details?: any;
  error?: string;
};

export async function psEnv(): Promise<EnvResult> {
  console.log("🏠 Calling psEnv...");
  return getJSON<EnvResult>(`${BASE}/env`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
}

export type LocalResult = {
  ok: boolean;
  output?: any[];
  errors?: string[];
  warnings?: string[];
  hasErrors?: boolean;
  error?: string;
  details?: any;
};

export async function psRunLocal(command: string): Promise<LocalResult> {
  console.log(`⚡ Calling psRunLocal with command: ${command}`);
  return getJSON<LocalResult>(`${BASE}/local`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command })
  });
}

/* Connect with custom scopes (POST /connect) */
export async function psConnectWithScopes(scopes: string[]): Promise<ConnectResult> {
  console.log("🔐 Calling psConnectWithScopes with scopes:", scopes);
  console.log(`🌐 Backend URL: ${BASE}`);
  return getJSON<ConnectResult>(`${BASE}/connect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scopes })
  });
}
