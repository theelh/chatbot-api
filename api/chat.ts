import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ✅ CORS (important pour GitHub Pages)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Preflight (sinon erreur CORS)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method Not Allowed" });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "No message provided" });
  }

  try {
    const hf = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: [{ role: "user", content: message }],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    const data = await hf.json();

    const reply =
      data?.choices?.[0]?.message?.content ||
      data?.generated_text ||
      "No response";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ reply: "Server error" });
  }
}