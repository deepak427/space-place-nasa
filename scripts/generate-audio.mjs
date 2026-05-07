import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Manually parse .env to avoid adding dotenv dependency
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const API_KEY = envContent.match(/VITE_ELEVENLABS_API_KEY=([^\s]+)/)?.[1];
const VOICE_ID = envContent.match(/VITE_ELEVENLABS_VOICE_ID=([^\s]+)/)?.[1] || 'jBpfuIE2acCO8z3wKNLl';
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'audio-cache');

if (!API_KEY) {
  console.error('Error: VITE_ELEVENLABS_API_KEY not found in .env file');
  process.exit(1);
}

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const stepTexts = [
  "Hey there, space explorer! Welcome to the Moon! Have you ever looked up at the night sky and wondered why the Moon seems to change its shape? Sometimes it's a tiny sliver, and other times it's a big, glowing pizza! But guess what? The Moon isn't actually changing shape. We're just seeing different parts lit up by the Sun as it travels around our Earth!",
  "Whoa! Look at that! The Moon is zooming right across your screen! It moves super fast out there in space!",
  "Want to see how the phases work? Try grabbing the Moon and spinning it around! It's like your very own cosmic puppet. I'll give it a spin for you now, just watch!",
  "Wow! Look at that glow! But did you know... the Moon doesn't actually make its own light? It's true! It works just like a giant space mirror, reflecting the bright light coming all the way from the Sun!",
  "Here's a spooky question: Is there a 'dark side' of the Moon? Well... not really! The Moon spins around exactly once for every trip it takes around Earth. That means we always see the exact same side from our backyard! The side we don't see gets just as much sunlight, so scientists prefer to call it the 'far side'.",
  "So, how did this giant rock get up there? Billions of years ago, a massive space object the size of Mars crashed right into Earth! BOOM! That giant splash sent chunks of rock flying into space. Slowly, gravity pulled all those pieces together to build the Moon we see today!",
  "How do we study it? Well, thousands of years ago, people just drew pictures. But today, we use super powerful telescopes and incredible spacecraft! The Moon is actually the only other world humans have ever visited. In 1969, astronauts Neil Armstrong and Buzz Aldrin walked right on that dusty surface!",
  "We know the Moon is covered in craters from space rocks crashing into it over billions of years. Those big dark spots? They're ancient lava that cooled down long ago! There are still so many mysteries left. Maybe YOU will be one of the next explorers to visit the Moon!"
];

async function generateAudio(text) {
  const hash = crypto.createHash('sha256').update(text).digest('hex');
  const fileName = `${hash}.mp3`;
  const filePath = path.join(OUTPUT_DIR, fileName);

  if (fs.existsSync(filePath)) {
    console.log(`Skipping (already exists): "${text.substring(0, 30)}..."`);
    return;
  }

  console.log(`Generating: "${text.substring(0, 30)}..."`);
  
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': API_KEY
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

    if (!response.ok) {
      throw new Error(`ElevenLabs error: ${response.statusText} - ${await response.text()}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    console.log(`Saved: ${fileName}`);
  } catch (error) {
    console.error(`Failed to generate audio for: "${text.substring(0, 30)}..."`, error.message);
  }
}

async function main() {
  console.log('Starting audio cache generation...');
  for (const text of stepTexts) {
    await generateAudio(text);
  }
  console.log('Finished!');
}

main();
