import express from 'express';
import dotenv from 'dotenv';
import NodeCache from 'node-cache';
dotenv.config();

const router = express.Router();
const mapCache = new NodeCache({ stdTTL: 86400 }); // 24 hours

/**
 * Calculates distance between two coords using Haversine
 */
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Distance in km
}

/**
 * GET /api/maps/booth?lat=&lng=&pincode=
 */
router.get('/booth', async (req, res) => {
  try {
    let { lat, lng, pincode } = req.query;

    const cacheKey = `booth_${lat}_${lng}_${pincode}`;
    if (mapCache.has(cacheKey)) {
      return res.json(mapCache.get(cacheKey));
    }

    if (pincode && (!lat || !lng)) {
      // First geocode the pincode
      const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(pincode)},India&key=${process.env.MAPS_API_KEY}`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();
      if (geoData.results && geoData.results.length > 0) {
        lat = geoData.results[0].geometry.location.lat;
        lng = geoData.results[0].geometry.location.lng;
      }
    }

    if (!lat || !lng) {
      return res.status(400).json({ error: "Could not find booth. Visit electoralsearch.eci.gov.in" });
    }

    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent("polling booth OR election booth OR voting center")}&location=${lat},${lng}&radius=5000&key=${process.env.MAPS_API_KEY}`;
    
    const placesRes = await fetch(searchUrl);
    const placesData = await placesRes.json();

    if (placesData.results && placesData.results.length > 0) {
      const result = placesData.results[0];
      const resultLat = result.geometry.location.lat;
      const resultLng = result.geometry.location.lng;

      const distance = getDistanceFromLatLonInKm(
        parseFloat(lat), 
        parseFloat(lng), 
        resultLat, 
        resultLng
      ).toFixed(1) + " km";

      const address = result.formatted_address;
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

      const responseData = {
        name: result.name,
        address: address,
        distance: distance,
        mapsUrl: mapsUrl
      };
      mapCache.set(cacheKey, responseData);
      return res.json(responseData);
    }

    return res.json({ error: "Could not find booth. Visit electoralsearch.eci.gov.in" });

  } catch (err) {
    console.error("Maps proxy error:", err);
    res.json({ error: "Could not find booth. Visit electoralsearch.eci.gov.in" });
  }
});

export default router;
