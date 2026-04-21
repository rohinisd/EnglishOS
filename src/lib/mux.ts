import Mux from "@mux/mux-node";

let muxClient: Mux | null = null;

function getMux() {
  if (!muxClient) {
    const tokenId = process.env.MUX_TOKEN_ID;
    const tokenSecret = process.env.MUX_TOKEN_SECRET;
    if (!tokenId || !tokenSecret || tokenId === "placeholder_fill_later") {
      return null;
    }
    muxClient = new Mux({ tokenId, tokenSecret });
  }
  return muxClient;
}

export function getMuxVideo() {
  const client = getMux();
  return client?.video ?? null;
}

export function isMuxConfigured(): boolean {
  const id = process.env.MUX_TOKEN_ID;
  return !!id && id !== "placeholder_fill_later";
}
