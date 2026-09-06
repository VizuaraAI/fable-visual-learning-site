"""Voice the motor lesson with the channel's ElevenLabs voice (same voice, model and settings as the video pipeline).
Writes static/hero/narration/motor-{en,hi}-{0..5}.mp3 (silence-trimmed) + manifest.json with durations."""
import json, os, subprocess, sys, time, urllib.request
sys.path.insert(0, '/Users/rajat/Desktop/Ramco Rise Claude 3/visuallearning-recreation/pipeline')
import narration  # key(), VOICE, MODEL
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'hero', 'narration')
EN = [
 'This is a rectangular coil ABCD. It sits between the north and south poles of a magnet, so a magnetic field runs across it from N to S.',
 'The two ends of the coil are joined to a split ring. Two brushes, X and Y, press on the ring and connect it to a battery. Current comes in at X and flows through A, B, C and D.',
 'Arm AB carries current one way and arm CD the other way. In the same field, AB is pushed up and CD is pushed down. Fleming’s left-hand rule gives the directions.',
 'Two equal forces in opposite directions make a couple, and the coil starts to turn about its axle.',
 'After half a turn the split ring swaps brushes. The current in the coil reverses, so the arm on the left is always pushed up, and the coil keeps turning the same way.',
 'That is an electric motor: electrical energy in, rotation out.',
]
HI = [
 'यह एक रेक्टैंगुलर कॉइल ABCD है। यह मैग्नेट के नॉर्थ और साउथ पोल के बीच रखी है, इसलिए मैग्नेटिक फ़ील्ड इसके आर-पार N से S की तरफ़ चलती है।',
 'कॉइल के दोनों सिरे एक स्प्लिट रिंग से जुड़े हैं। दो ब्रश, X और Y, रिंग पर दबते हैं और उसे बैटरी से जोड़ते हैं। करंट X से अंदर आता है और A, B, C, D से होकर बहता है।',
 'आर्म AB में करंट एक तरफ़ है और आर्म CD में दूसरी तरफ़। एक ही फ़ील्ड में AB ऊपर धकेला जाता है और CD नीचे। दिशा फ्लेमिंग के लेफ्ट-हैंड रूल से मिलती है।',
 'दो बराबर और उल्टी दिशा की फ़ोर्स मिलकर एक कपल बनाती हैं, और कॉइल अपने एक्सल के चारों ओर घूमने लगती है।',
 'आधे चक्कर के बाद स्प्लिट रिंग ब्रश बदल लेती है। कॉइल का करंट उल्टा हो जाता है, इसलिए बाईं तरफ़ वाला आर्म हमेशा ऊपर धकेला जाता है, और कॉइल उसी दिशा में घूमती रहती है।',
 'यही इलेक्ट्रिक मोटर है: इलेक्ट्रिकल एनर्जी अंदर, रोटेशन बाहर।',
]
def tts(text, lang_code, fn, prev):
    body = json.dumps({'text': text, 'model_id': narration.MODEL, 'language_code': lang_code, 'previous_text': prev or None,
                       'voice_settings': {'stability': 0.55, 'similarity_boost': 0.8, 'style': 0.0, 'use_speaker_boost': True, 'speed': 1.0}}).encode()
    req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{narration.VOICE}?output_format=mp3_44100_128', data=body,
                                 headers={'xi-api-key': narration.key(), 'Content-Type': 'application/json'})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=120) as r: open(fn, 'wb').write(r.read()); return
        except Exception as e:
            print('retry', fn, getattr(e, 'code', ''), str(e)[:120]); time.sleep(3 + attempt * 3)
    raise SystemExit('tts failed: ' + fn)
def trim(raw, out):
    # keep 80 ms of air each side, re-encode at 96 kbps mono
    subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse', '-ac', '1', '-b:a', '96k', out])
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]).decode().strip())
man = {'voice': 'Anika - Engaging Teacher (ElevenLabs, eleven_multilingual_v2)', 'en': [], 'hi': [], 'text': {'en': EN, 'hi': HI}}
for lang, lines, code in (('en', EN, 'en'), ('hi', HI, 'hi')):
    prev = ''
    for i, s in enumerate(lines):
        raw = os.path.join(OUT, f'raw-{lang}-{i}.mp3'); fn = os.path.join(OUT, f'motor-{lang}-{i}.mp3')
        if not os.path.exists(raw): tts(s, code, raw, prev)
        d = trim(raw, fn); man[lang].append(round(d, 2)); prev = s
        print(lang, i, f'{d:5.2f}s', s[:50], flush=True)
for lang in ('en', 'hi'):
    for i in range(6): os.remove(os.path.join(OUT, f'raw-{lang}-{i}.mp3'))
json.dump(man, open(os.path.join(OUT, 'manifest.json'), 'w'), ensure_ascii=False, indent=1)
print('DONE', man['en'], man['hi'])
