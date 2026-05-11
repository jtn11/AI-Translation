import { NextRequest, NextResponse } from "next/server";

export async function POST(request : NextRequest) {
    
    try {

        const GroqFormData = new FormData();

        const formData = await request.formData();
        const sourceLanguage = formData.get("language") as string;
        const audioFile = formData.get("audio") as File; 

      const apikey = process.env.GROQ_API_KEY;
      if (!apikey) {
        return NextResponse.json({ error: "API key not configured" }, { status: 500 });
      }

      let translatedText = "";

      if (!sourceLanguage || sourceLanguage === "auto") {
        // Simple case: use the translations endpoint
        const groqFormData = new FormData();
        groqFormData.append("file", audioFile);
        groqFormData.append("model", "whisper-large-v3");

        const response = await fetch("https://api.groq.com/openai/v1/audio/translations", {
          method: "POST",
          headers: { Authorization: `Bearer ${apikey}` },
          body: groqFormData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "Translation failed");
        }

        const data = await response.json();
        translatedText = data.text;
      } else {
        // Specific language: Transcribe then Translate using LLM
        const transcribeFormData = new FormData();
        transcribeFormData.append("file", audioFile);
        transcribeFormData.append("model", "whisper-large-v3");
        transcribeFormData.append("language", sourceLanguage);

        const transcribeResponse = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apikey}` },
          body: transcribeFormData,
        });

        if (!transcribeResponse.ok) {
          const errorData = await transcribeResponse.json();
          throw new Error(errorData.error?.message || "Transcription failed");
        }

        const transcribeData = await transcribeResponse.json();
        const originalText = transcribeData.text;

        // Translate using a chat model
        const translateResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apikey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              {
                role: "system",
                content: "You are a professional translator. Translate the following text into English. Only provide the translated text, nothing else.",
              },
              {
                role: "user",
                content: originalText,
              },
            ],
          }),
        });

        if (!translateResponse.ok) {
          const errorData = await translateResponse.json();
          throw new Error(errorData.error?.message || "LLM Translation failed");
        }

        const translateData = await translateResponse.json();
        translatedText = translateData.choices[0].message.content;
      }

      return NextResponse.json({ text: translatedText });
    } catch (error : any) {
        console.error("Translation error:", error);
        return NextResponse.json(
          {error : error.message || "Unknown error"} , 
          {status : 500}
        )
    }
}