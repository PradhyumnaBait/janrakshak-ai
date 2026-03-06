export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type DeepfakeRequest = {
  file?: File;
  url?: string;
  type: "video" | "audio";
};

export type DeepfakeResponse = {
  is_deepfake: boolean;
  confidence: number;
  details: string;
};

export type ClaimVerificationResponse = {
  claim: string;
  verdict: string;
  explanation: string;
  sources: string[];
};

export type MisinformationResponse = {
  original: string;
  simplified: string;
};

export async function uploadDeepfake(
  type: "video" | "audio",
  file: File
): Promise<DeepfakeResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const endpoint =
    type === "video" ? "/detect/video" : "/detect/audio";

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    body: formData
  });
  try {
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Failed to analyze media: ${res.status} ${text}`);
    }
    return res.json();
  } catch (err) {
    // Re-throw to be handled by UI with more detail
    throw err;
  }
}

export async function verifyClaim(
  query: string
): Promise<ClaimVerificationResponse> {
  const res = await fetch(`${API_BASE_URL}/verify-claim`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });
  try {
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Failed to verify claim: ${res.status} ${text}`);
    }
    return res.json();
  } catch (err) {
    throw err;
  }
}

export async function simplifyMisinformation(
  text: string
): Promise<MisinformationResponse> {
  const res = await fetch(`${API_BASE_URL}/simplify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
  try {
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Failed to analyze text: ${res.status} ${text}`);
    }
    return res.json();
  } catch (err) {
    throw err;
  }
}

