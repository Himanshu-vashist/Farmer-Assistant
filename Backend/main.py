from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import google.generativeai as genai
import io
import base64
from googletrans import Translator
from gtts import gTTS
import os

app = FastAPI()

# Enable CORS to allow React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gemini API Configuration
genai.configure(api_key="AIzaSyBAUpS73pvEH_pZFg1MEFCTVtb8qErfYj0")  # Replace with your actual key
model = genai.GenerativeModel("gemini-1.5-flash")
translator = Translator()

@app.post("/classify")
async def classify_image(image: UploadFile = File(...), language: str = Form(...)):
    try:
        # Read and process image
        image_data = await image.read()
        image = Image.open(io.BytesIO(image_data))
        image_bytes = io.BytesIO()
        image.save(image_bytes, format="PNG")
        image_bytes.seek(0)

        # Gemini API prompt
        prompt = """
You are a plant pathologist AI. Based on the image provided, classify the plant disease in the image.

Please provide the following information in a structured format:
1. Disease Name: The name of the disease (if any).
2. Affected Plant Part: Which part seems to be affected (leaf, stem, fruit, etc.).
3. Detailed Description: Visual symptoms and explanation of how the disease looks.
4. Cause: What causes this disease (bacteria, fungus, virus, etc.).
5. Severity Level: Mild, moderate, or severe.
6. Recommended Treatment: Suggested pesticides or organic treatments.
7. Preventive Measure : How to prevent it in the future.
8. Impact on Crop Yield : How this disease may affect overall productivity.

Be detailed and use layman-friendly language so that even a farmer with no technical background can understand and act upon it. Dont use * IN THE FORMAT NO NEED TO MAKE IT BOLD
"""

        # Call Gemini API
        response = model.generate_content([
            {"text": prompt},
            {"mime_type": "image/png", "data": image_bytes.read()}
        ])
        diagnosis_text = response.text

        # Translate if needed
        lang_map = {"English": "en", "Hindi": "hi", "Bengali": "bn"}
        lang_code = lang_map.get(language, "en")
        if language != "English":
            translation = translator.translate(diagnosis_text, dest=lang_code)
            diagnosis_text = translation.text

        # Generate audio (first 100 characters)
        voice_text = diagnosis_text[:100]
        tts = gTTS(text=voice_text, lang=lang_code)
        audio_bytes = io.BytesIO()
        tts.write_to_fp(audio_bytes)
        audio_bytes.seek(0)
        audio_base64 = base64.b64encode(audio_bytes.read()).decode("utf-8")

        return {"diagnosis": diagnosis_text, "audio": audio_base64}

    except Exception as e:
        return {"error": str(e)}, 500

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)