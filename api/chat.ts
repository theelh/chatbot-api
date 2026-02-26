import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ reply: "Method Not Allowed" });

  const { message } = req.body;
  if (!message) return res.status(400).json({ reply: "No message provided" });

  try {
    const hf = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.1-8B-Instruct",
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await hf.json();

    // 🔹 TEMPORAIRE : renvoyer tout ce que HF retourne
    return res.status(200).json({ raw: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ reply: "Server error" });
  }
}
