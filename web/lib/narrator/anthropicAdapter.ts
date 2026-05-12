import Anthropic from "@anthropic-ai/sdk";

export const ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";

export async function completeProse(
  system: string,
  user: string,
): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  const client = new Anthropic({ apiKey: key });
  const msg = await client.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 320,
    system,
    messages: [{ role: "user", content: user }],
  });
  const block = msg.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("No text content from Anthropic");
  }
  return block.text.trim();
}
