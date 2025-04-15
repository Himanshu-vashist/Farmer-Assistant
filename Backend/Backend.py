import os
import logging
import speech_recognition as sr
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from io import BytesIO
import uvicorn
import re
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langdetect import detect
from langchain.schema.runnable import RunnableSequence
import langid
from googletrans import Translator
import pandas as pd
import requests
from datetime import datetime,timedelta
from collections import defaultdict
from geopy.geocoders import Nominatim
import google.generativeai as genai
from meteostat import Point, Daily
from dotenv import load_dotenv
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import credentials, auth

# Initialize Firebase Admin - Disabled for development
# cred = credentials.Certificate("path/to/your/serviceAccountKey.json")
# firebase_admin.initialize_app(cred)

security = HTTPBearer()

# Mock token verification for development
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # For development, return a mock token
    return {"uid": "mock-user-id"}

    # Production code (commented out)
    # try:
    #     decoded_token = auth.verify_id_token(credentials.credentials)
    #     return decoded_token
    # except Exception as e:
    #     raise HTTPException(
    #         status_code=status.HTTP_401_UNAUTHORIZED,
    #         detail="Invalid authentication credentials"
    #     )

# Logging setup
LOG_DIR = "logs"
LOG_FILE_NAME = "application.log"
os.makedirs(LOG_DIR, exist_ok=True)
log_path = os.path.join(LOG_DIR, LOG_FILE_NAME)
load_dotenv()

logging.basicConfig(
    filename=log_path,
    format="[ %(asctime)s ] %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8081", "http://127.0.0.1:8081", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TextRequest(BaseModel):
    text: str

# Google Generative AI model setup
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY").strip('"')
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY").strip('"')
genai.configure(api_key=GOOGLE_API_KEY)
llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=GOOGLE_API_KEY)
chat_history = []
translator = Translator()

PROMPT_TEMPLATES = {
    'en': ChatPromptTemplate.from_template(
        "You are an agricultural expert. Here is the chat history:\n{chat_history}\n"
        "User: {query}\nAI:"
    ),
    'hi': ChatPromptTemplate.from_template(
        "आप एक कृषि विशेषज्ञ हैं। यहाँ पिछले वार्तालाप का इतिहास है:\n{chat_history}\n"
        "उपयोगकर्ता: {query}\nएआई:"
    ),
     'bn': ChatPromptTemplate.from_template(
        "আপনি একজন কৃষি বিশেষজ্ঞ। এখানে আগের কথোপকথনের ইতিহাস:\n{chat_history}\n"
        "ব্যবহারকারী: {query}\nএআই:"
    ),
}


def detect_language(text: str) -> str:
    try:
        lang = translator.detect(text).lang
        if lang in ['hi', 'en','bn']:
            return lang
    except:
        pass  # If Google fails, use langdetect as fallback

    # Last resort: Use langdetect
    try:
        return detect(text)
    except:
        return 'en'

# Get appropriate prompt template
def get_prompt_template(language: str):
    return PROMPT_TEMPLATES.get(language, PROMPT_TEMPLATES['en'])

# Clean text response
def clean_text(text: str) -> str:
    text = text.replace('*', '')
    text = re.sub(r'\s*>\s*', '> ', text)
    text = re.sub(r'\n{2,}', '\n\n', text)
    text = re.sub(r'(\d+\.)(\S)', r'\1 \2', text)
    return text.strip()
#
#Data models
class TextRequest(BaseModel):
    text: Optional[str] = ""
    userInput: Optional[str] = ""

    def get_input(self):
        return self.text or self.userInput or ""
class SoilWeatherRequest(BaseModel):
     N: int
     P: int
     K: int
     pH: float
     city: str
class CityOnlyRequest(BaseModel):
    city: str

# AI Response Generation with Memory (including context for the latest query)
@app.post("/get-response")
async def get_response(request: TextRequest, token: dict = Depends(verify_token) if not os.getenv('DEVELOPMENT_MODE') else None):
    print("Received request:", request)
    """Generates an AI response while remembering past 10 messages and including them for context, but not showing them in the final response."""
    user_id = token.get('uid') if token else 'dev-user'
    try:
        # Get the input text from either text or userInput field
        input_text = request.get_input()
        if not input_text:
            raise HTTPException(status_code=400, detail="No input text provided")

        # Detect language of the request
        language = detect_language(input_text)
        prompt = get_prompt_template(language)
        print("language is:",language)
        # Store the current user's message
        chat_history.append(f"User: {input_text}")
        if len(chat_history) > 10:
            chat_history.pop(0)  # Keep only the last 10 messages (user queries)

        # Prepare the full chat history, excluding the previous responses from the final output
        full_chat_history = "\n".join(chat_history)  # This includes the user queries only

        # Adjust the prompt to include the full chat history, without showing previous responses in the output
        current_conversation = f"User: {input_text}\nAI:"

        # Use the `RunnableSequence` to process the conversation, providing the context (chat history)
        conversation_chain = RunnableSequence(prompt | llm)

        # Invoke the model with chat history as context (for generating a response)
        response = conversation_chain.invoke({
            "chat_history": full_chat_history,  # Full history as context for the model
            "query": input_text  # Current query being asked by the user
        })

        # Clean the AI response (to ensure no unwanted characters or formatting)
        formatted_response = clean_text(response.content)

        # Return only the current AI response (and optionally, chat history for debugging purposes)
        return {
            "response": formatted_response,
            "language": language,
        }

    except Exception as e:
        logging.error(f"AI response generation failed: {e}")
        raise HTTPException(status_code=500, detail="AI response generation failed")

#forecst
def get_5_day_forecast(city, api_key):
    URL = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&appid={api_key}&units=metric"
    response = requests.get(URL)
    daily_data = defaultdict(lambda: {'temps': [], 'humidity': [], 'descriptions': []})

    if response.status_code == 200:
        data = response.json()
        for forecast in data['list']:
            date = forecast['dt_txt'].split()[0]
            daily_data[date]['temps'].append(forecast['main']['temp'])
            daily_data[date]['humidity'].append(forecast['main']['humidity'])
            daily_data[date]['descriptions'].append(forecast['weather'][0]['description'])

        forecast_summary = ""
        for i, (date, values) in enumerate(daily_data.items()):
            if i == 5:
                break
            avg_temp = sum(values['temps']) / len(values['temps'])
            avg_humidity = sum(values['humidity']) / len(values['humidity'])
            desc = max(set(values['descriptions']), key=values['descriptions'].count)
            forecast_summary += f"{date}: {avg_temp:.1f}°C, {avg_humidity:.0f}% humidity, {desc}\n"

        return forecast_summary.strip()
    else:
        return "Weather API error."
#historic data
def get_historical_weather(location):
    start = datetime.now() - timedelta(days=730)
    end = datetime.now()
    point = Point(location.latitude, location.longitude)
    data = Daily(point, start, end).fetch()
    avg_temp = round(data['tavg'].mean(), 1)
    avg_precip = round(data['prcp'].mean(), 2)
    return f"📅 Historical Summary (Last 2 Years)\nAverage Temp: {avg_temp}°C\nAverage Precipitation: {avg_precip} mm/day"
def create_chunks(df):
    return [", ".join([f"{col}: {row[col]}" for col in df.columns]) for _, row in df.iterrows()]

def retrieve_relevant_chunks(chunks, query, top_n=5):
    return sorted(chunks, key=lambda x: sum(word.lower() in x.lower() for word in query.split()), reverse=True)[:top_n]

@app.post("/crop-suggestion")
async def suggest_crop(req: SoilWeatherRequest):
    try:
        # First verify all required parameters are present
        if not req.city:
            raise HTTPException(status_code=400, detail="City is required")
        if None in [req.N, req.P, req.K, req.pH]:
            raise HTTPException(status_code=400, detail="All soil parameters (N, P, K, pH) are required")

        # Verify dataset exists
        file_path = "Crop_dataset.csv"
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Crop dataset file not found")

        df = pd.read_csv(file_path)

        # Get location with timeout
        geolocator = Nominatim(user_agent="weather_app", timeout=10)
        try:
            location = geolocator.geocode(req.city)
            if not location:
                raise HTTPException(status_code=400, detail=f"Could not find location for city: {req.city}")
        except Exception as geocode_error:
            logging.error(f"Geocoding failed for {req.city}: {str(geocode_error)}")
            raise HTTPException(status_code=400, detail="Location service unavailable")

        # Get weather data with fallback
        try:
            forecast = get_5_day_forecast(req.city, api_key=OPENWEATHER_API_KEY)
            if forecast == "Weather API error.":
                forecast = "Weather forecast unavailable"
        except Exception as weather_error:
            logging.error(f"Weather API failed: {str(weather_error)}")
            forecast = "Weather forecast unavailable"

        # Get historical data with fallback
        historical = "Historical data unavailable"
        try:
            historical = get_historical_weather(location)
        except Exception as hist_error:
            logging.error(f"Historical weather failed: {str(hist_error)}")

        # Prepare query
        query = f"N: {req.N}, P: {req.P}, K: {req.K}, pH: {req.pH}, Forecast: {forecast}, Historical: {historical}"
        context = "\n".join(retrieve_relevant_chunks(create_chunks(df), query))

        prompt = f"""You are an expert agricultural scientist providing crop recommendations.
        Analyze the following data and provide detailed, scientifically-valid crop suggestions:

        SOIL ANALYSIS:
        - Nitrogen (N): {req.N} ppm
        - Phosphorus (P): {req.P} ppm
        - Potassium (K): {req.K} ppm
        - pH Level: {req.pH}

        LOCATION: {req.city}

        WEATHER CONDITIONS:
        5-Day Forecast:
        {forecast}

        Historical Weather Patterns:
        {historical}

        RELEVANT CROP DATA:
        {context}

    GUIDELINES FOR RESPONSE:
    1. Recommend 3-5 most suitable crops based on the soil parameters and climate
    2. For each recommended crop:
   - List optimal growing conditions
   - Mention any special requirements
   - Provide planting season advice
    3. Include 1-2 alternative crops that could work with minor soil amendments
    4. Highlight any potential challenges based on current conditions
    5. Provide brief cultivation tips for each recommended crop
    6. Format the response clearly with sections and bullet points

OUTPUT FORMAT:
### Recommended Crops for {req.city}

#### [Crop 1 Name]
- **Suitability**: [Excellent/Good/Fair] match for current conditions
- **Optimal Conditions**: [Ideal soil pH, temperature range, etc.]
- **Planting Window**: [Best planting times]
- **Key Requirements**: [Water needs, sunlight, etc.]
- **Yield Potential**: [Expected yield under these conditions]
- **Management Tips**: [Specific cultivation advice]

#### [Crop 2 Name]
[...]

### Alternative Options
[List crops that could work with minor adjustments]

### Important Considerations
[Any warnings about pests, diseases, or weather risks]

Note: All recommendations should be practical, scientifically valid, and tailored to the specific location and conditions provided.
"""
        # Get AI response
        try:
            model = genai.GenerativeModel("gemini-2.0-flash")
            response = model.generate_content(prompt)
            return {
                "suggested_crops": response.text.strip(),
                "city": req.city  # Include city in response for verification
            }
        except Exception as ai_error:
            logging.error(f"AI generation failed: {str(ai_error)}")
            raise HTTPException(status_code=500, detail="AI service temporarily unavailable")

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Unexpected error in crop suggestion: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="An unexpected error occurred")

@app.post("/forecast")
async def get_forecast_only(req: CityOnlyRequest):
    try:
        forecast = get_5_day_forecast(req.city, api_key=OPENWEATHER_API_KEY)
        print(forecast)
        return {"forecast": forecast}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Weather forecast failed")


# Simple test endpoint
@app.post("/test")
async def test_endpoint(request: dict = None):
    if request is None:
        request = {}
    return {"message": "Test successful", "received": request}

# Simple response endpoint
@app.post("/simple-response")
async def simple_response(request: dict = None):
    if request is None:
        request = {}
    return {
        "response": "This is a fixed response from the server. Growing tomatoes requires well-drained soil, regular watering, and plenty of sunlight. Start by planting seedlings after the last frost, and provide support as they grow. Water at the base of the plant to prevent leaf diseases.",
        "language": "en"
    }

# Run the server
if __name__ == "__main__":
    uvicorn.run("Backend:app", host="0.0.0.0", port=8000, reload=True)
