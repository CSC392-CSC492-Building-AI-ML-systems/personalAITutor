export async function POST(req: Request) {
    try {
      const { message } = await req.json(); // Extract user message
  
      // Simulated delay (2 sec) to mimic LLM processing
      await new Promise((resolve) => setTimeout(resolve, 2000));
  
      // Placeholder response
      const aiResponse = `I'm just a placeholder response for now. You asked: "${message}"`;
  
      return new Response(JSON.stringify({ text: aiResponse }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
  
    } catch (error) {
      console.error("Error in /api/chat:", error);
      return new Response(
        JSON.stringify({ text: "Oops! Something went wrong." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
  