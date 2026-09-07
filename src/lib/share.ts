export type ShareCard = {
  a: string;
  l: string;
  m: string[];
  n: number;
};

function b64urlEncode(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const byte of bytes) bin += String.fromCharCode(byte);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64urlDecode(text: string): string {
  const pad = "=".repeat((4 - (text.length % 4)) % 4);
  const b64 = text.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function encodeShare(card: ShareCard): string {
  return b64urlEncode(JSON.stringify({ v: 1, a: card.a, l: card.l, m: card.m.slice(0, 8), n: card.n }));
}

export function decodeShare(raw: string): ShareCard | null {
  try {
    const data = JSON.parse(b64urlDecode(raw)) as Partial<ShareCard> & { v?: number };
    if (!data || typeof data.a !== "string" || typeof data.l !== "string") return null;
    if (!Array.isArray(data.m)) return null;
    const m = data.m.filter((id): id is string => typeof id === "string" && /^tt\d+$/.test(id)).slice(0, 8);
    if (!m.length) return null;
    return { a: data.a.slice(0, 80), l: data.l.slice(0, 160), m, n: Number(data.n) || 0 };
  } catch {
    return null;
  }
}

export function shareUrl(payload: string): string {
  if (typeof window === "undefined") return `/condividi?p=${encodeURIComponent(payload)}`;
  const url = new URL("/condividi", window.location.origin);
  url.searchParams.set("p", payload);
  return url.toString();
}

export async function shareResult(card: ShareCard): Promise<"shared" | "copied" | "failed"> {
  const url = shareUrl(encodeShare(card));
  const text = `Il mio gusto su Platea: ${card.a}. ${card.l}`;
  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ title: `${card.a} · Platea`, text, url });
      return "shared";
    }
  } catch (err) {
    if ((err as { name?: string }).name === "AbortError") return "failed";
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    return "copied";
  } catch {
    return "failed";
  }
}

export async function copyShareUrl(card: ShareCard): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(shareUrl(encodeShare(card)));
    return true;
  } catch {
    return false;
  }
}

export function drawSharePng(card: ShareCard, titles: string[]): Promise<Blob> {
  const w = 1200;
  const h = 630;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("canvas"));
  ctx.fillStyle = "#140a1c";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#f0c43a";
  ctx.fillRect(0, 0, w, 8);
  ctx.fillStyle = "#e24b6e";
  ctx.font = "600 22px Figtree, Segoe UI, sans-serif";
  ctx.fillText("PLATEA", 72, 88);
  ctx.fillStyle = "#f8efd8";
  ctx.font = "italic 72px 'Instrument Serif', 'Times New Roman', serif";
  wrapText(ctx, card.a, 72, 200, w - 140, 80);
  ctx.fillStyle = "#d7c4a4";
  ctx.font = "28px Figtree, Segoe UI, sans-serif";
  wrapText(ctx, card.l, 72, 330, w - 140, 40);
  ctx.fillStyle = "#f8efd8";
  ctx.font = "italic 32px 'Instrument Serif', 'Times New Roman', serif";
  const first = titles[0] ?? "";
  if (first) wrapText(ctx, first, 72, 460, w - 140, 40);
  ctx.fillStyle = "#b39278";
  ctx.font = "20px Figtree, Segoe UI, sans-serif";
  const host = typeof window !== "undefined" ? window.location.host : "Platea";
  ctx.fillText(host, 72, 580);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("blob"))), "image/png");
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  max: number,
  lineH: number,
) {
  const words = text.split(" ");
  let line = "";
  let row = 0;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > max && line) {
      ctx.fillText(line, x, y + row * lineH);
      line = word;
      row += 1;
      if (row >= 2) break;
    } else {
      line = test;
    }
  }
  if (row < 3 && line) ctx.fillText(line, x, y + row * lineH);
}
