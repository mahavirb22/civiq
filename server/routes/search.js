import express from 'express';
import { query, validationResult } from 'express-validator';
import dotenv from 'dotenv';
import NodeCache from 'node-cache';
dotenv.config();

const router = express.Router();
const searchCache = new NodeCache({ stdTTL: 86400 }); // 24 hours

router.get(
  '/candidates',
  [
    query('state').optional().isString().trim().escape().isLength({ max: 50 }),
    query('constituency').optional().isString().trim().escape().isLength({ max: 50 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
    const { state, constituency } = req.query;

    const cacheKey = `search_${state}_${constituency}`;
    if (searchCache.has(cacheKey)) {
      return res.json(searchCache.get(cacheKey));
    }

    if (!state || !constituency) {
      return res.status(400).json({ error: "State and constituency required" });
    }

    const query = `${constituency} ${state} election candidate 2024 site:eci.gov.in OR site:myneta.info`;
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${process.env.SEARCH_API_KEY}&cx=${process.env.SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&num=3`;

    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const candidates = data.items.map(o => {
        let sourceDomain = 'Web';
        try { sourceDomain = new URL(o.link).hostname.replace('www.', ''); } catch (e) {}
        
        return {
          title: o.title,
          snippet: o.snippet,
          url: o.link,
          source: sourceDomain
        };
      });
      searchCache.set(cacheKey, candidates);
      return res.json(candidates);
    }

    return res.json([{ 
      title: "Visit ECI", 
      snippet: "Check eci.gov.in for official candidate list", 
      url: "https://eci.gov.in", 
      source: "eci.gov.in" 
    }]);

  } catch (err) {
    console.error("Search API Error:", err);
    res.json([{ 
      title: "Visit ECI", 
      snippet: "Check eci.gov.in for official candidate list", 
      url: "https://eci.gov.in", 
      source: "eci.gov.in" 
    }]);
  }
});

export default router;
