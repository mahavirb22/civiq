const ELECTION_DATES = {
  "Bihar": "2025-10-15",
  "Delhi": "2025-02-05",
  "Maharashtra": "2024-11-20",
  "default": "2029-04-15"
};

function getNextElectionDate(state) {
  return ELECTION_DATES[state] || ELECTION_DATES.default;
}

export async function addElectionReminder(state) {
  return new Promise((resolve, reject) => {
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_CALENDAR_CLIENT_ID,
        scope: "https://www.googleapis.com/auth/calendar.events",
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            try {
              const eventDate = getNextElectionDate(state);
              
              const event = {
                summary: "🗳️ Vote today! — Civiq reminder",
                description: "Your polling booth and ballot info is ready on Civiq.",
                start: { date: eventDate },
                end: { date: eventDate },
                reminders: {
                  useDefault: false,
                  overrides: [
                    { method: "popup", minutes: 1440 },
                    { method: "popup", minutes: 120 }
                  ]
                }
              };

              const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${tokenResponse.access_token}`,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(event)
              });

              if (response.ok) {
                resolve({ success: true });
              } else {
                reject({ success: false });
              }
            } catch (err) {
              reject({ success: false });
            }
          } else {
            reject({ success: false });
          }
        }
      });

      tokenClient.requestAccessToken();
    } catch (error) {
      console.error("GIS Error:", error);
      reject({ success: false });
    }
  });
}
