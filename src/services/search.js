export async function searchCandidates(state, constituency) {
  try {
    const res = await fetch(`http://localhost:8081/api/search/candidates?state=${encodeURIComponent(state)}&constituency=${encodeURIComponent(constituency)}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Candidates Search API Error:", err);
    return [{ 
      title: "Visit ECI", 
      snippet: "Check eci.gov.in for official candidate list", 
      url: "https://eci.gov.in", 
      source: "eci.gov.in" 
    }];
  }
}
