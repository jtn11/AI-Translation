import { NextRequest, NextResponse } from "next/server";

export async function POST(request : NextRequest) {
    
    try {

        const GroqFormData = new FormData();

        const formData = await request.formData();
        const audioFile = formData.get("audio") as File; 
        GroqFormData.append('file', audioFile);
        GroqFormData.append('model', 'whisper-large-v3');

        console.log("audio blob",audioFile)

        const apikey = process.env.GROQ_API_KEY ; 
        if(!apikey){
          return NextResponse.json(
            {error : "API key not configured"},
            {status : 500}
          )
        }

      const response = await fetch('https://api.groq.com/openai/v1/audio/translations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: GroqFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Translation failed');
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
          {error : error} , 
          {status : 500}
        )
    }
}