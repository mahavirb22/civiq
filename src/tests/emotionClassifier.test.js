import { geminiService } from '../services/gemini';

// Mock fetch
global.fetch = jest.fn();

describe('Emotion Classifier Service', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  const testCases = [
    { message: "I don't understand", expected: "confused" },
    { message: "prove it", expected: "skeptical" },
    { message: "tell me more", expected: "engaged" },
    { message: "ok", expected: "neutral" },
  ];

  testCases.forEach(({ message, expected }) => {
    test(`should return ${expected} for message: "${message}"`, async () => {
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ emotion: expected, reply: 'AI response' }),
        })
      );

      const result = await geminiService.sendMessage({ message });
      expect(result.emotion).toBe(expected);
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  test('should fallback to neutral on error', async () => {
    fetch.mockImplementationOnce(() => Promise.reject("API error"));
    const result = await geminiService.sendMessage({ message: "error case" });
    expect(result.emotion).toBe('neutral');
  });
});
