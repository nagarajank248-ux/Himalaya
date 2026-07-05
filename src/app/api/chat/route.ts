import { NextResponse } from 'next/server';

const SYSTEM_INSTRUCTION = `You are a professional Vastu Shastra Expert, Civil Architect, and CAD drafting assistant integrated inside the Himalaya CRM & Vasthu Suite application.
Your goal is to guide home builders, architects, and end clients to design their 2D floor plans in perfect alignment with Vastu guidelines.
Keep your answers brief, structured, and easy to read.
Use lists or bullet points when explaining directional alignment.
You can communicate in Tanglish (Tamil + English) or clear English depending on the client's language.
If the client asks for a plan layout text, format it clearly so they can copy and paste it into the AI Plan Parser box on the floor plan tab (e.g., Plot Size: 30x40, Facing: East, etc.).`;

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid or missing messages array.' }, { status: 400 });
    }

    const latestMessage = messages[messages.length - 1]?.content || '';
    const geminiApiKey = process.env.GEMINI_API_KEY;

    // FALLBACK SIMULATION MODE: If no API key is set, run Vastu Local Logic
    if (!geminiApiKey) {
      console.log('No GEMINI_API_KEY found. Running in Local Vastu Simulation Mode.');
      const responseText = getLocalVastuResponse(latestMessage);
      
      return NextResponse.json({
        source: 'local_vastu_simulator',
        content: responseText,
        message: 'Running in offline simulation mode. Add process.env.GEMINI_API_KEY in .env.local to link live conversational AI.'
      });
    }

    // LIVE MODE: Call official Google Gemini Developer API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

    // Format chat history for Gemini API content structure
    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    // Inject system instruction inside prompt body
    const requestBody = {
      contents: formattedContents,
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }]
      },
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.7
      }
    };

    const apiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!apiResponse.ok) {
      const errBody = await apiResponse.text();
      throw new Error(`Gemini API returned error status ${apiResponse.status}: ${errBody}`);
    }

    const apiData = await apiResponse.json();
    const generatedText = apiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

    return NextResponse.json({
      source: 'live_gemini_api',
      content: generatedText
    });

  } catch (error: any) {
    console.error('Error handling AI chat request:', error);
    return NextResponse.json(
      { error: 'Failed to process AI request.', details: error.message },
      { status: 500 }
    );
  }
}

// Local simulation logic returning accurate Vastu rules based on keywords
function getLocalVastuResponse(query: string): string {
  const q = query.toLowerCase();

  let response = `**🤖 Himalaya Vastu AI Assistant (Offline Simulator Mode)**\n\n`;

  if (q.includes('kitchen') || q.includes('samayal')) {
    response += `### 🔥 Kitchen Vastu Guidelines:\n` +
      `- **Best Position**: **Southeast (SE - Agneya)**. Agni is the fire lord here, perfect for stove placement.\n` +
      `- **Alternative**: Northwest (NW - Vayu) can be used if Southeast is occupied.\n` +
      `- **Strictly Avoid**: Northeast (NE) and Southwest (SW) corners. NE kitchen causes health issues, SW causes family conflicts.\n` +
      `- **Cooking Direction**: Face **East** while cooking to attract positive energy.`;
  } else if (q.includes('bedroom') || q.includes('padukai') || q.includes('bed')) {
    response += `### 🛌 Master Bedroom Vastu Guidelines:\n` +
      `- **Best Position**: **Southwest (SW - Nairutya)**. Earth element brings stability, power, and wealth to the family head.\n` +
      `- **Alternative**: South (S) or West (W) zones.\n` +
      `- **Strictly Avoid**: Northeast (NE) zone. Placing a bedroom in the spiritual zone causes restlessness and poor sleep.\n` +
      `- **Sleeping Direction**: Head pointing **South** or **East** is recommended for peaceful sleep.`;
  } else if (q.includes('pooja') || q.includes('sami') || q.includes('temple') || q.includes('altar')) {
    response += `### 🌸 Pooja Room Vastu Guidelines:\n` +
      `- **Best Position**: **Northeast (NE - Ishanya)**. The water element and Lord Shiva rule this spiritual corner. Perfect for peaceful prayer.\n` +
      `- **Alternative**: East (E) or North (N) zones.\n` +
      `- **Strictly Avoid**: South (S) or Southwest (SW) directions. Never place a pooja room adjacent to a toilet wall or underneath a staircase.`;
  } else if (q.includes('toilet') || q.includes('bath') || q.includes('restroom')) {
    response += `### 🚿 Toilet / Bathroom Vastu Guidelines:\n` +
      `- **Best Position**: **Northwest (NW - Vayu)** or **West (W)**. Assists in quick elimination of negative energy.\n` +
      `- **Strictly Avoid**: Northeast (NE) and Southwest (SW) zones. A toilet in NE destroys the positive cosmic entry point of the home.`;
  } else if (q.includes('stair') || q.includes('staircase') || q.includes('padi')) {
    response += `### 🪜 Staircase Vastu Guidelines:\n` +
      `- **Best Position**: **South**, **West**, or **Southwest**. These directions should remain heavy.\n` +
      `- **Strictly Avoid**: Northeast corner. Staircases should rotate **clockwise** when climbing up.`;
  } else if (q.includes('example') || q.includes('sample') || q.includes('demo') || q.includes('draft') || q.includes('23')) {
    response += `### 📝 Custom Vastu Floor Plan Requirements Draft:\n` +
      `Here is a template copy-paste requirement. You can paste this directly into the **AI Plan Parser Box** on the floor plan tab:\n\n` +
      `\`\`\`text\n` +
      `Plot Size: 25 x 40\n` +
      `Facing: East\n` +
      `Follow Vastu principles.\n` +
      `Include:\n` +
      `- 1 Living Hall\n` +
      `- 1 Master Bedroom with Attached Bathroom\n` +
      `- 1 Kitchen (SE)\n` +
      `- 1 Pooja Room (NE)\n` +
      `- Staircase (Clockwise)\n` +
      `- Car Parking\n` +
      `\`\`\``;
  } else {
    response += `Welcome to **Himalaya AI Vastu Consultant**!\n\n` +
      `Ask me Vastu queries or architectural questions. Example inputs:\n` +
      `- *Where is the best place to build the Kitchen?*\n` +
      `- *Can I place the Master Bedroom in the Northeast corner?*\n` +
      `- *Where should the Pooja room go?*\n` +
      `- *Give me a requirement text draft for a 30x50 plot.*\n\n` +
      `👉 *Developer Tip*: Put your \`GEMINI_API_KEY=your_key\` inside the \`.env.local\` file in your project root to connect to the live AI conversation model!`;
  }

  return response;
}
