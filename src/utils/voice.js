export let currentAudio = null;

// Simple hash function to generate stable filenames for the audio cache
const getHash = async (text) => {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const playVoice = async (text, onEnd) => {
  stopVoice(); // Stop any currently playing audio

  try {
    const hash = await getHash(text);
    const cache = await caches.open('cosmic-voice-cache');
    
    // 1. Check browser persistent cache
    const cachedResponse = await cache.match(hash);
    if (cachedResponse) {
      console.log(`Using browser cache for: "${text.substring(0, 30)}..."`);
      const audioBlob = await cachedResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      currentAudio = new Audio(audioUrl);
      currentAudio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        currentAudio = null;
        if (onEnd) onEnd();
      };
      currentAudio.play();
      return;
    }

    // 2. Check server-side public/audio-cache/ (pre-generated files)
    const serverPath = `/audio-cache/${hash}.mp3`;
    const serverCheck = await fetch(serverPath, { method: 'HEAD' });
    if (serverCheck.ok && serverCheck.headers.get('content-type')?.includes('audio')) {
      console.log(`Using server cache for: "${text.substring(0, 30)}..."`);
      currentAudio = new Audio(serverPath);
      currentAudio.onended = () => {
        currentAudio = null;
        if (onEnd) onEnd();
      };
      currentAudio.play();
      return;
    }

    // If not in cache, try ElevenLabs
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    if (apiKey) {
      console.log(`Generating new audio via ElevenLabs for: "${text.substring(0, 30)}..."`);
      const voiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'jBpfuIE2acCO8z3wKNLl'; 
      
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        
        // Save to persistent cache
        await cache.put(hash, new Response(audioBlob));
        
        const audioUrl = URL.createObjectURL(audioBlob);
        currentAudio = new Audio(audioUrl);
        
        currentAudio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          currentAudio = null;
          if (onEnd) onEnd();
        };
        
        currentAudio.play();
        return;
      } else {
        console.error("ElevenLabs API error:", await response.text());
      }
    }
  } catch (err) {
    console.error("Voice playback error:", err);
  }

  // Fallback to Web Speech API
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Child') || v.name.includes('Samantha'));
  if (preferredVoice) utterance.voice = preferredVoice;
  utterance.rate = 0.9;
  utterance.pitch = 1.2;
  
  utterance.onend = () => {
    if (onEnd) onEnd();
  };
  
  window.speechSynthesis.speak(utterance);
};

export const stopVoice = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  window.speechSynthesis.cancel();
};
