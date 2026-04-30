/**
 * Helper to fetch closest booth using proxy Maps backend
 */
export async function findNearbyBooth(lat, lng) {
  try {
    const res = await fetch(`http://localhost:8081/api/maps/booth?lat=${lat}&lng=${lng}`);
    const data = await res.json();
    if (!res.ok || data.error) return { error: data.error || "Could not find booth." };
    return data;
  } catch (err) {
    console.error("Maps Service Error:", err);
    return { error: "Could not find booth. Visit electoralsearch.eci.gov.in" };
  }
}

/**
 * Fallback to pincode geocoding mapping
 */
export async function findNearbyBoothByPincode(pincode) {
  try {
    const res = await fetch(`http://localhost:8081/api/maps/booth?pincode=${encodeURIComponent(pincode)}`);
    const data = await res.json();
    if (!res.ok || data.error) return { error: data.error || "Could not find booth." };
    return data;
  } catch (err) {
    console.error("Maps Service Error:", err);
    return { error: "Could not find booth. Visit electoralsearch.eci.gov.in" };
  }
}
