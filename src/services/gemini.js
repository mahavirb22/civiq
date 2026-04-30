/**
 * Service to handle Google Vertex/Gemini AI backend calls
 */
export const geminiService = {
  /**
   * Send message to custom /api/chat express endpoint
   */
  sendMessage: async ({
    message,
    sessionId,
    step,
    state,
    firstVoter,
    history = [],
  }) => {
    try {
      const response = await fetch("http://localhost:8081/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          sessionId,
          step,
          state,
          firstVoter,
          history,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Gemini Service Error:", error);
      return {
        reply: "I'm having trouble connecting. Please try again.",
        emotion: "neutral",
        suggestedChips: [],
      };
    }
  },
};
