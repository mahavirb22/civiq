export async function speakText(text) {
  try {
    const res = await fetch('http://localhost:8081/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    const data = await res.json();
    if (!res.ok || data.error) return null;

    const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
    audio.play();
    return audio;
  } catch (err) {
    console.error("TTS External Fail:", err);
    return null;
  }
}
