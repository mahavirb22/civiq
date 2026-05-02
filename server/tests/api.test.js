import express from 'express';
import request from 'supertest';
import chatRouter from '../routes/chat.js';
import mapsRouter from '../routes/maps.js';
import quizRouter from '../routes/quiz.js';
import searchRouter from '../routes/search.js';
import ttsRouter from '../routes/tts.js';

// Mock dependencies
jest.mock('../middleware/auth.js', () => ({
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: jest.fn(),
        collection: jest.fn(() => ({
          add: jest.fn(),
        })),
      })),
    })),
  },
}));

jest.mock('../lib/gemini.js', () => ({
  withGeminiModel: jest.fn().mockImplementation(async (callback) => {
    // Return dummy data based on context
    return await callback({
      generateContent: jest.fn().mockResolvedValue({
        response: { text: () => 'engaged\n["What next?"]\n[{"question": "Q1", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "E"}]' }
      }),
      startChat: jest.fn().mockReturnValue({
        sendMessage: jest.fn().mockResolvedValue({
          response: { text: () => 'Hello from Gemini' }
        })
      })
    });
  }),
  isGeminiModelUnavailableError: jest.fn().mockReturnValue(false),
}));

const app = express();
app.use(express.json());
app.use('/api/chat', chatRouter);
app.use('/api/maps', mapsRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/search', searchRouter);
app.use('/api/tts', ttsRouter);

describe('API Routes', () => {

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Chat API', () => {
    it('returns 400 for missing message', async () => {
      const res = await request(app).post('/api/chat').send({});
      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('returns 200 and chat reply on success', async () => {
      const res = await request(app).post('/api/chat').send({
        message: 'Hello',
        sessionId: 'test1234',
        step: 1
      });
      expect(res.status).toBe(200);
      expect(res.body.reply).toBe('Hello from Gemini');
      expect(res.body.emotion).toBe('engaged');
      expect(res.body.suggestedChips).toBeDefined();
    });
  });

  describe('Maps API', () => {
    it('returns 400 for invalid lat/lng type', async () => {
      const res = await request(app).get('/api/maps/booth?lat=abc&lng=def');
      expect(res.status).toBe(400);
    });

    it('returns booth info when lat/lng are provided and fetch succeeds', async () => {
      global.fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({
          results: [{
            geometry: { location: { lat: 10, lng: 10 } },
            formatted_address: '123 Test St',
            name: 'Test Booth'
          }]
        })
      });

      const res = await request(app).get('/api/maps/booth?lat=10.1&lng=10.1');
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Test Booth');
      expect(res.body.distance).toBeDefined();
    });
  });

  describe('Quiz API', () => {
    it('returns generated quiz questions', async () => {
      const res = await request(app).post('/api/quiz/generate').send({ state: 'Karnataka' });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('Search API', () => {
    it('returns 400 for missing state/constituency', async () => {
      const res = await request(app).get('/api/search/candidates');
      expect(res.status).toBe(400); // Because state/constituency are required in logic, though validator is optional
    });

    it('returns candidates list on successful fetch', async () => {
      global.fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({
          items: [{
            title: 'Candidate A',
            snippet: 'Details',
            link: 'https://myneta.info/candidateA'
          }]
        })
      });

      const res = await request(app).get('/api/search/candidates?state=Delhi&constituency=New Delhi');
      expect(res.status).toBe(200);
      expect(res.body[0].title).toBe('Candidate A');
      expect(res.body[0].source).toBe('myneta.info');
    });
  });

  describe('TTS API', () => {
    it('returns 400 if no text is provided', async () => {
      const res = await request(app).post('/api/tts').send({});
      expect(res.status).toBe(400);
    });

    it('returns audioContent on success', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ audioContent: 'mockBase64Audio' })
      });

      const res = await request(app).post('/api/tts').send({ text: 'Hello World' });
      expect(res.status).toBe(200);
      expect(res.body.audioContent).toBe('mockBase64Audio');
    });
  });
});
