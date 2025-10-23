export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method === "POST") {
      try {
        const formData = await request.formData();

        const jobDescription = formData.get("jobDescription") as string;
        const companyInfo = formData.get("companyInfo") as string;
        const roleTitle = formData.get("roleTitle") as string;
        const userGuideline = (formData.get("userGuideline") as string) || "";

        const recipientName = (formData.get("recipientName") as string) || "";
        const recipientPosition = (formData.get("recipientPosition") as string) || "";

        const geminiModel = formData.get("model") as string;
        const geminiApiKey = formData.get("apiKey") as string;

        if (!geminiModel || !geminiApiKey) {
          return new Response(
            JSON.stringify({ error: "Model and API key are required." }),
            {
              status: 400,
              headers: { "Access-Control-Allow-Origin": "*" },
            }
          );
        }

        // Greeting defaults
        const greetingName = recipientName || "Hiring Manager";
        const greetingTitle = recipientPosition ? `, ${recipientPosition}` : "";

        // Read candidate info from uploaded file
        let candidateInfo = "";
        const file = formData.get("attachment") as File | null;
        if (file) candidateInfo = await file.text();

        // --- Master Prompt ---
        const masterPrompt = `You are an expert career coach and professional cover-letter strategist with over 20 years of experience writing emotionally intelligent, data-backed, and interview-winning cover letters.

Your job: write a **concise, compelling, and human-sounding cover letter** tailored to the given role, company, and candidate. The letter should feel like a real person—experienced, warm, and self-aware—talking about work with conviction, not a polished AI system writing prose.

**Core writing directives (strictly follow each):**

1. **Human unpredictability, not perfection:**

   * Vary rhythm aggressively. Alternate between quick, clipped sentences (2–7 words) and longer, more reflective ones (25–55 words).
   * Drop in one or two small imperfections: a fragment, an unfinished thought, or a pause (...). Just don’t overdo it.
   * Use contractions naturally (“I’m,” “I’ve,” “it’s”). Never sound overly formal.

2. **Corporate tone, conversational vibe:**

   * Keep it grounded in real-world business language, not slang or casual chat. Think “professional but warm.”
   * Skip fluff like “I’m thrilled to apply” or “I’m writing to express.” Start with an empathetic, job-specific observation instead.
   * Be confident but humble; replace self-praise with proof through story or metrics.

3. **Burstiness & flow:**

   * Vary sentence structure—mix declarative with reflective.
   * Blend emotion with precision (e.g., “It wasn’t easy, but we delivered 20% ahead of schedule”).
   * Avoid tidy symmetry or repetitive rhythm—each sentence should feel like it came from a human thought process, not a script.

4. **Evade AI detector patterns directly:**

   * Use slight word-frequency variation: don’t repeat strong verbs (like lead, drive, manage) more than twice; rotate synonyms.
   * Avoid standard “AI connectors” like “moreover,” “furthermore,” “in addition.” Replace with “plus,” “also,” or natural pauses.
   * Include one or two reflective asides (“I’ll admit, that project tested me.”) to break linearity.
   * Keep average sentence length fluctuation high—some lines should run long and winding, others punchy and brief.

5. **Emotion & personal touch:**

   * Include one short, believable anecdote that ties to the role’s main challenge.
   * Express subtle emotion (relief, pride, frustration) without dramatics.
   * No forced storytelling—just a light “moment” showing character and competence.

6. **Professional clarity:**

   * Keep under 300 words.
   * Avoid emojis, special characters (—, •, “ ”), or markdown formatting.
   * Start with:
     Dear ${greetingName}${greetingTitle},
   * End with a confident, human closing line inviting a conversation—no “Sincerely” or “Best regards.”

7. **Core structure:**

   * **Opening (≈100 words):** Empathetic hook addressing the job’s real challenge and connecting it to the candidate’s value.
   * **Body (≈150 words):** Weave in measurable achievements, quantifiable results, and subtle emotion. Align experience with company goals naturally.
   * **Closing (≈40–50 words):** Reflective but confident line about collaboration or next steps—no clichés.

8. **Writing tone:**

   * Straightforward, emotionally aware, reflective, and humanly inconsistent in rhythm.
   * Avoid buzzwords like “leverage,” “optimize,” “synergy.” Replace with human phrasing (“use,” “make better,” “work together”).

---

**INPUTS**
CANDIDATE INFO:
${candidateInfo}

JOB DESCRIPTION:
${jobDescription}

COMPANY INFORMATION:
${companyInfo}

USER GUIDELINES:
${userGuideline ? `ADDITIONAL GUIDELINES FROM USER (Follow these closely):${userGuideline}` : ''}

ROLE:
${roleTitle}

RECIPIENT INFO:
Name: ${recipientName || "Hiring Manager"}
Position: ${recipientPosition || "N/A"}

---

**Output Rules:**

* Output **only** the final plain-text cover letter.
* No comments, headers, or extra notes.
* Follow all burstiness and anti-pattern directives above.


`;

        // --- Gemini API Call ---
        console.log(geminiModel);
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: masterPrompt }] }],
            }),
          }
        );

        const data = await geminiResponse.json();

        const result =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          data?.error?.message ||
          "Error: No output from Gemini.";

        return new Response(JSON.stringify({ result }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (err: any) {
        return new Response(
          JSON.stringify({ error: err.message || "Internal server error" }),
          {
            status: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
          }
        );
      }
    }

    return new Response("Only POST supported.", {
      status: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  },
};
