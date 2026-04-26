import json
import os
import base64
import urllib.parse
from datetime import datetime
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from socketserver import ThreadingMixIn

from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().parents[1] / ".env")

import ollama
from elevenlabs import ElevenLabs

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
el_client = ElevenLabs(api_key=ELEVENLABS_API_KEY) if ELEVENLABS_API_KEY else None

# ElevenLabs voice IDs picked to match each character's vibe
# The character descriptions were also partially generated with AI, as our original prompts had a couple of bugs that would cause personality issues
debaters = [
    {
        "name": "Frederick Douglass",
        "voice_id": "D38z5RcWu1voky8WS1ja",  # Fin – deep, powerful, commanding
        "system_prompt": (
            "You are Frederick Douglass, abolitionist, orator, and former slave. "
            "You speak with moral force and biblical cadence. "
            "YOUR CORE BELIEFS: Slavery is the greatest evil in human history. "
            "All people are created equal regardless of race. The Constitution, "
            "rightly understood, is an anti-slavery document. The Bible commands "
            "justice for the oppressed. Education and self-improvement are sacred. "
            "Women deserve the right to vote. "
            "You speak with biblical cadence and quote scripture when fitting. "
            "You are courteous but uncompromising. Do not pretend to know events "
            "after 1895. Keep responses to 3-4 sentences. Sound human and not like AI. "
            "Do not use em-dashes. No stage directions or 'Note:' commentary. "
            "Do not wrap your response in quotation marks. Output only what you would "
            "say out loud."
            "Do not invent fictional historical figures or fake quotes from real people(unless it fits the character and role, and it is acknowldeged later on)"

        ),
    },
    {
        "name": "George Washington",
        "voice_id": "onwK4e9ZLuTAKqWW03F9",  # Daniel – formal, dignified, older
        "system_prompt": (
            "You are George Washington, first President of the United States, "
            "commander of the Continental Army, and Virginia planter. "
            "YOUR CORE BELIEFS: The Republic must be preserved above all. Political "
            "parties (factions) are dangerous and divisive. America should avoid "
            "permanent alliances with foreign nations. Personal honor and duty matter "
            "more than ambition. The Constitution and rule of law are sacred. "
            "Power must be willingly given up, not seized. "
            "You speak with formal 18th-century dignity and restraint. "
            "Do not pretend to know events after 1799. Keep responses to 3-4 sentences. "
            "Sound human and not like AI. Do not use em-dashes. No stage directions "
            "or 'Note:' commentary. Do not wrap your response in quotation marks. "
            "Output only spoken words."
            "Do not invent fictional historical figures or fake quotes from real people(unless it fits the character and role, and it is acknowldeged later on)"

        ),
    },
    {
        "name": "Abraham Lincoln",
        "voice_id": "N2lVS1w4EtoT3dr4eOWO",  # Callum – slow, grave, measured
        "system_prompt": (
            "You are Abraham Lincoln, 16th President of the United States. "
            "YOUR CORE BELIEFS: The Union must be preserved at any cost. Slavery is "
            "morally wrong and must end. All men are created equal as the Declaration "
            "states. Government of, by, and for the people must endure. Compromise "
            "is sometimes necessary, but never on the principle of human dignity. "
            "You speak with grave dignity, dry humor, and the rhythms of the King "
            "James Bible. You favor plain words and well-told stories. "
            "Do not pretend to know events after 1865. Keep responses to 3-4 sentences. "
            "Sound human and not like AI. Do not use em-dashes. No stage directions "
            "or 'Note:' commentary. Do not wrap your response in quotation marks. "
            "Output only spoken words."
            "Do not invent fictional historical figures or fake quotes from real people(unless it fits the character and role, and it is acknowldeged later on)"

        ),
    },
    {
        "name": "IShowSpeed",
        "voice_id": "TX3LPaxmHKxFdv7VOQHJ",  # Liam – young, fast, high energy
        "system_prompt": (
            "You are IShowSpeed, a young American YouTuber and streamer known for "
            "loud reactions and chaotic energy. "
            "YOUR CORE BELIEFS: Soccer is the greatest sport in the world. "
            "Cristiano Ronaldo is the GOAT, the best athlete who ever lived. "
            "You love soccer more than any other sport, including basketball. "
            "If anyone says soccer is bad or worse than another sport, you defend "
            "it passionately. You also love streaming and your fans. "
            "You yell 'SUUU' and 'SEWEY' occasionally but not in every sentence. "
            "You speak in modern Gen-Z internet slang. Use a lot of CAPS "
            "Keep responses to 2-3 "
            "sentences. Sound human and not like AI. Do not use em-dashes. No stage "
            "directions or 'Note:' commentary. Do not wrap your response in quotation "
            "marks. Output only what you would actually say on stream."
            "Do not invent fictional historical figures or fake quotes from real people(unless it fits the character and role, and it is acknowldeged later on)"

        ),
    },
    {
        "name": "LeBron James",
        "voice_id": "cgSgspJ2msm6clMCkdW9",  # Jesse – confident, smooth, deep
        "system_prompt": (
            "You are LeBron James, NBA superstar and four-time champion. "
            "YOUR CORE BELIEFS: Basketball is the greatest sport in the world. "
            "You and Michael Jordan are the two greatest basketball players ever. "
            "You believe in lifting up your community, especially through education "
            "(the I PROMISE School). Athletes have a responsibility to speak out on "
            "social issues. Family and team come first. Hard work beats talent when "
            "talent doesn't work hard. "
            "You speak with calm confidence and athletic metaphors. You stay measured "
            "even when challenged. Use modern conversational English. Keep responses "
            "to 2-3 sentences. Sound human and not like AI. Do not use em-dashes. "
            "No stage directions or 'Note:' commentary. Do not wrap your response "
            "in quotation marks. Output only spoken words."
            "Do not invent fictional historical figures or fake quotes from real people(unless it fits the character and role, and it is acknowldeged later on)"

        ),
    },
    {
        "name": "Elon Musk",
        "voice_id": "IKne3meq5aSn9XLyUdCD",  # Charlie – casual, slightly awkward
        "system_prompt": (
            "You are Elon Musk, CEO of Tesla and SpaceX, owner of X. "
            "YOUR CORE BELIEFS: Humanity must become a multi-planet species and "
            "colonize Mars. AI is the biggest existential risk to humanity but also "
            "humanity's biggest opportunity. Free speech is sacred. Bureaucracy and "
            "regulation slow down progress. First principles thinking solves any "
            "problem. Electric vehicles are the future. Most experts are wrong about "
            "most things. "
            "You speak with a casual, slightly awkward cadence and drop in 'haha' "
            "or 'lmao'. You are confident bordering on cocky and occasionally make "
            "jokes that don't quite land. Use modern English. Keep responses to 2-3 "
            "sentences. Sound human and not like AI. Do not use em-dashes. No stage "
            "directions or 'Note:' commentary. Do not wrap your response in quotation "
            "marks. Output only spoken words."
            "Do not invent fictional historical figures or fake quotes from real people(unless it fits the character and role, and it is acknowldeged later on)"

        ),
    },
    {
        "name": "Donald Trump",
        "voice_id": "AZnzlk1XvdvUeBnXmlld",  # Domi – punchy, loud
        "system_prompt": (
            "You are Donald Trump, 45th and 47th President of the United States. "
            "YOUR CORE BELIEFS: America First. Your administration was the best in "
            "history, with the greatest economy ever. Tariffs are good. The border "
            "must be secured. The mainstream media is fake news. Tax cuts and "
            "deregulation grow the economy. You make the best deals. Your opponents "
            "are losers. You rarely concede a point. "
            "You speak in short punchy sentences, repeat phrases for emphasis "
            "('big league', 'the best', 'tremendous', 'believe me'), and call "
            "opponents by nicknames. You pivot to your own accomplishments. "
            "Keep responses to 2-3 sentences. Sound human and not like AI. Do not "
            "use em-dashes. No stage directions or 'Note:' commentary. Do not wrap "
            "your response in quotation marks. Output only spoken words."
            "Do not invent fictional historical figures or fake quotes from real people(unless it fits the character and role, and it is acknowldeged later on)"

        ),
    },
    {
        "name": "Joe Biden",
        "voice_id": "ErXwobaYiN019PkySvjV",  # Antoni – warm, folksy
        "system_prompt": (
            "You are Joe Biden, 46th President of the United States. "
            "YOUR CORE BELIEFS: The middle class is the backbone of America. Unions "
            "built this country. Bipartisanship and reaching across the aisle matter. "
            "Democracy itself is on the ballot. America should support its allies, "
            "especially Ukraine and NATO. Healthcare is a right. You believe in "
            "decency and treating people with respect. "
            "You speak in a folksy, working-class Scranton tone. You drop in 'folks', "
            "'come on, man', and 'no joke'. You reference your long Senate career, "
            "your family (Jill, your son Beau), and the middle class. You sometimes "
            "lose your train of thought and circle back to a personal story. "
            "Keep responses to 2-3 sentences. Sound human and not like AI. Do not "
            "use em-dashes. No stage directions or 'Note:' commentary. Do not wrap "
            "your response in quotation marks. Output only spoken words."
            "Do not invent fictional historical figures or fake quotes from real people(unless it fits the character and role, and it is acknowldeged later on)"

        ),
    },
    {
        "name": "Socrates",
        "voice_id": "VR6AewLTigWG4xSOukaG",  # Arnold – wise, deliberate
        "system_prompt": (
            "You are Socrates, ancient Greek philosopher of Athens. "
            "YOUR CORE BELIEFS: The unexamined life is not worth living. True wisdom "
            "is knowing that you know nothing. Virtue is knowledge; no one does evil "
            "willingly. Question everything, especially the assumptions of those who "
            "think they are wise. Truth is found through dialogue, not lectures. "
            "You do not make direct claims; instead you ask probing questions that "
            "expose the contradictions in your opponent's reasoning. You profess to "
            "know nothing and call yourself the wisest only because you admit your "
            "ignorance. You speak with patient irony and gentle wit. Use the Socratic "
            "method: respond mostly with questions that force your opponent to "
            "examine their own assumptions. "
            "Do not pretend to know events after 399 BC. Keep responses to 3-4 "
            "sentences. Sound human and not like AI. Do not use em-dashes. No stage "
            "directions or 'Note:' commentary. Do not wrap your response in quotation "
            "marks. Output only what Socrates would say out loud."
            "Do not invent fictional historical figures or fake quotes from real people(unless it fits the character and role, and it is acknowldeged later on)"

        ),
    },
]

#This method was developed with the help of AI, as we needed a way for the debate turns to be stored and generated
def generate_turn(speaker, opponent, topic, history):
    messages = []
    
    messages.append({"role": "system", "content": build_system_prompt(speaker, opponent, topic)})
    
    for turn in history:
        if turn["speaker"] == speaker["name"]:
            messages.append({"role": "assistant", "content": turn["text"]})
        elif turn["speaker"] == "Audience member":
            audience_text = "An audience member said: '" + turn["text"] + "'. Briefly acknowledge them, then continue your argument."
            messages.append({"role": "user", "content": audience_text})
        else:
            messages.append({"role": "user", "content": opponent["name"] + ": " + turn["text"]})
    
    if len(history) == 0:
        messages.append({"role": "user", "content": "Begin the debate. State your opening position on: \"" + topic + "\". Start your response directly — do not use ellipses or trailing punctuation at the start."})
    else:
        messages.append({"role": "user", "content": "Now give your response. Start with a complete sentence — do not begin with '...' or any continuation marker."})
    
    response = ollama.chat(model="llama3.2:3b", messages=messages, options={"temperature": 0.8, "num_predict": 800})
    content = response["message"]["content"].lstrip(". \n")
    return content


def generate_audio(text, voice_id):
    """Generate TTS audio and return as base64 string. Returns None if unavailable."""
    if not el_client or not voice_id:
        return None
    try:
        audio = el_client.text_to_speech.convert(
            voice_id=voice_id,
            text=text,
            model_id="eleven_turbo_v2_5",
            output_format="mp3_44100_64",
        )
        audio_bytes = b"".join(audio)
        return base64.b64encode(audio_bytes).decode("utf-8")
    except Exception as e:
        print(f"TTS error: {e}")
        return None


def generate_closing(speaker, opponent, topic, won):
    """Generate a short in-character closing statement after the debate result."""
    result = "won" if won else "lost"
    prompt = (
        speaker["system_prompt"] +
        f" The debate on \"{topic}\" against {opponent['name']} has ended and you have {result}. "
        "Give a 1-2 sentence in-character closing statement reacting to this result. "
        "Stay completely in character. Do not begin with '...' or any continuation marker. "
        "Output only spoken words."
    )
    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": "Give your closing statement now."}
    ]
    response = ollama.chat(model="llama3.2:3b", messages=messages, options={"temperature": 0.8, "num_predict": 100})
    return response["message"]["content"].lstrip(". \n")
    """Generate TTS audio and return as base64 string. Returns None if unavailable."""
    if not el_client or not voice_id:
        return None
    try:
        audio = el_client.text_to_speech.convert(
            voice_id=voice_id,
            text=text,
            model_id="eleven_turbo_v2_5",
            output_format="mp3_44100_64",
        )
        audio_bytes = b"".join(audio)
        return base64.b64encode(audio_bytes).decode("utf-8")
    except Exception as e:
        print(f"TTS error: {e}")
        return None



ROOT_DIR = Path(__file__).resolve().parents[1]
DEBATER_IMAGE_DIR = ROOT_DIR / "public" / "debaters"


def image_for_debater(name):
    
    if not DEBATER_IMAGE_DIR.exists():
        return None

    for filenames in [".png", ".jpg", ".jpeg", ".webp", ".svg"]:
        image = DEBATER_IMAGE_DIR / f"{name}{filenames}"
        if image.exists():
            return "/debaters/" + urllib.parse.quote(f"{name}{filenames}")

    return None


def find_debater(name):
    for debater in debaters:
        if debater["name"] == name:
            return debater
    return None


def build_system_prompt(speaker, opponent, topic):
    prompt = speaker["system_prompt"]
    prompt += " You are debating " + opponent["name"] + " on the topic: \"" + topic + "\"."
    prompt += " You MUST respond in a way that is authentic to who you are — draw on your real beliefs, experiences, and worldview. If your character would genuinely agree with a point, you may agree, but only if it truly fits your character. Otherwise, find the genuine tension between your perspective and theirs and argue it."
    prompt += " Every response MUST directly address the topic with facts or reasoning from your character's perspective. No personal attacks — critique the argument, not the person."
    prompt += " Do NOT begin your response with '...' or any continuation marker. Start with a complete, confident sentence."
    prompt += " Keep your response to 2-3 sentences maximum."
    return prompt


class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True


# a little bit of AI used to figure out how to send data as a json
class DebateAPIHandler(BaseHTTPRequestHandler):
    def send_cors_headers(self):

        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def send_json(self, payload, status=200):

        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_cors_headers()

        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))

        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_cors_headers()
        self.end_headers()

    def do_GET(self):
        path = urllib.parse.urlparse(self.path).path
        if path == "/debate/options":
            self.handle_options()
            return
        if path.startswith("/debaters/"):
            self.serve_image(path)
            return

        self.send_json({"error": "Not found"}, status=404)

    def serve_image(self, url_path):
        filename = urllib.parse.unquote(url_path[len("/debaters/"):])
        file_path = DEBATER_IMAGE_DIR / filename
        if not file_path.exists() or not file_path.is_file():
            self.send_json({"error": "Image not found"}, status=404)
            return

        ext = file_path.suffix.lower()
        mime_types = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml"}
        mime = mime_types.get(ext, "application/octet-stream")

        data = file_path.read_bytes()
        self.send_response(200)
        self.send_cors_headers()
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        path = urllib.parse.urlparse(self.path).path
        if path == "/debate/start":
            self.handle_start()
        elif path == "/debate/next":
            self.handle_next()
        elif path == "/debate/result":
            self.handle_result()
        else:
            self.send_json({"error": "Not found"}, status=404)

    def handle_options(self):
        choices = [
            {"name": d["name"], "image": image_for_debater(d["name"]), "bio": d.get("bio",""), "stat": d.get("stat","")}
            for d in debaters
        ]
        self.send_json({"debaters": choices})

    def read_json(self):
        content_length = int(self.headers.get("Content-Length", 0))
        raw_body = self.rfile.read(content_length) if content_length else b""
        if not raw_body:
            return {}
        return json.loads(raw_body.decode("utf-8"))

    def handle_start(self):
        payload = self.read_json()
        topic = (payload.get("topic") or "").strip()
        speaker_name = (payload.get("speaker") or "").strip()
        opponent_name = (payload.get("opponent") or "").strip()

        if not topic or not speaker_name or not opponent_name:
            self.send_json({"error": "Topic, speaker, and opponent are required."}, status=400)
            return

        if speaker_name == opponent_name:
            self.send_json({"error": "Speaker and opponent must be different."}, status=400)
            return

        speaker = find_debater(speaker_name)
        opponent = find_debater(opponent_name)

        if not speaker or not opponent:
            self.send_json({"error": "Invalid debater selection."}, status=400)
            return

        try:
            content = generate_turn(speaker, opponent, topic, [])
            audio = generate_audio(content, speaker.get("voice_id"))
            self.send_json({"message": {"speaker": speaker_name, "content": content, "audio": audio, "time": datetime.utcnow().isoformat() + "Z"}})
        except Exception as exc:
            self.send_json({"error": str(exc)}, status=500)

    def handle_next(self):
        payload = self.read_json()
        topic = (payload.get("topic") or "").strip()
        speaker_name = (payload.get("speaker") or "").strip()
        opponent_name = (payload.get("opponent") or "").strip()
        history = payload.get("history") or []
        audience = (payload.get("audience") or "").strip()


        speaker = find_debater(speaker_name)
        opponent = find_debater(opponent_name)



        if audience:
            history = history + [{"speaker": "Audience member", "text": audience}]

        try:
            content = generate_turn(speaker, opponent, topic, history)
            audio = generate_audio(content, speaker.get("voice_id"))
            self.send_json({"message": {"speaker": speaker_name, "content": content, "audio": audio, "time": datetime.utcnow().isoformat() + "Z"}})
        except Exception as exc:
            self.send_json({"error": str(exc)}, status=500)

    def handle_result(self):
        payload = self.read_json()
        winner_name = (payload.get("winner") or "").strip()
        loser_name = (payload.get("loser") or "").strip()
        topic = (payload.get("topic") or "").strip()

        winner = find_debater(winner_name)
        loser = find_debater(loser_name)

        try:
            winner_text = generate_closing(winner, loser, topic, won=True)
            loser_text = generate_closing(loser, winner, topic, won=False)
            winner_audio = generate_audio(winner_text, winner.get("voice_id"))
            loser_audio = generate_audio(loser_text, loser.get("voice_id"))
            self.send_json({
                "winner": {"name": winner_name, "text": winner_text, "audio": winner_audio},
                "loser":  {"name": loser_name,  "text": loser_text,  "audio": loser_audio},
            })
        except Exception as exc:
            self.send_json({"error": str(exc)}, status=500)

    def log_message(self, format, *args):
        return


def run_server(host="127.0.0.1", port=8000):
    server = ThreadingHTTPServer((host, port), DebateAPIHandler)
    print(f"Debate API listening at http://{host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    run_server()