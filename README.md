# Satis Motor AI Voice CRM System

An AI-powered CRM system for Satis Motor (Tata vehicle dealer & service center) that automates customer calls using AI, with live monitoring and human takeover capabilities.

## Features

- **AI-Powered Call Handling**: GPT-4 powered agent handles customer inquiries
- **Demo Call Interface**: Test the AI agent with simulated calls
- **Live Call Monitoring**: Monitor all active calls with live transcripts
- **Human Takeover**: Seamlessly take over calls when needed
- **Full CRM**: Manage customers, appointments, complaints, leads, and vehicles
- **Excel-Based Storage**: POC uses Excel files for easy data inspection

## Tech Stack

- **Backend**: Python + Flask + Flask-SocketIO
- **Frontend**: React (Vite) + Tailwind CSS
- **AI**: OpenAI GPT-4
- **Storage**: Excel (pandas + openpyxl)

## Project Structure

```
crm_system/
├── backend/
│   ├── app/
│   │   ├── agent/          # AI agent (prompts, functions)
│   │   ├── api/routes/     # API endpoints
│   │   ├── services/       # Business logic
│   │   └── data/           # Excel handler
│   ├── data/               # Excel files
│   ├── requirements.txt
│   ├── run.py              # Entry point
│   └── seed_data.py        # Seed initial data
│
├── frontend/
│   ├── src/
│   │   ├── pages/          # React pages
│   │   ├── components/     # React components
│   │   └── lib/            # API client
│   └── package.json
│
├── .env                    # API keys
└── PRD.md                  # Product Requirements
```

## Setup Instructions

### Option 1: Docker Compose (Recommended)

```bash
# Make sure .env file has your OpenAI API key
# Then run:
docker-compose up --build

# Or run in background:
docker-compose up --build -d
```

This will start:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000

To stop:
```bash
docker-compose down
```

### Option 2: Manual Setup

#### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Seed initial data (vehicles, sample customers, etc.)
python seed_data.py

# Run the backend
python run.py
```

Backend will run at `http://localhost:5000`

#### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will run at `http://localhost:3000`

### Environment Variables

Make sure `.env` in root directory has:

```
openai_api_key=your_openai_api_key
elevenlabs_api_key=your_elevenlabs_key (for future voice)
gemini_api_key=your_gemini_key (optional)
```

## Usage

### Demo Call (Test AI Agent)

1. Open `http://localhost:3000`
2. Click **Demo Call** in sidebar
3. Click **Start Call**
4. Type messages as the customer would speak
5. Watch AI respond and handle the conversation
6. See functions being called (booking appointments, etc.)
7. Click **Takeover** to simulate human intervention
8. Click **End Call** when done

### Live Monitoring

1. Start a demo call
2. Open **Live Calls** in another tab
3. See the call appear with live transcript
4. Monitor confidence and sentiment
5. Click **Takeover** if needed

### CRM Sections

- **Dashboard**: Overview stats
- **Customers**: Manage customer database
- **Appointments**: View/manage test drives and service appointments
- **Complaints**: Track and resolve complaints
- **Leads**: Sales pipeline with stage tracking
- **Vehicles**: Tata vehicle catalog with pricing
- **Call Logs**: Historical call records with transcripts

## API Endpoints

### Demo Call
- `POST /api/demo/start` - Start new demo call
- `POST /api/demo/message` - Send message, get AI response
- `POST /api/demo/takeover` - Takeover call
- `POST /api/demo/end` - End call

### Calls
- `GET /api/calls/active` - Get active calls
- `GET /api/calls/logs` - Get call history
- `GET /api/calls/transcript/:id` - Get call transcript

### CRM
- `GET/POST /api/customers/` - Customer CRUD
- `GET/POST /api/appointments/` - Appointment CRUD
- `GET/POST /api/complaints/` - Complaint CRUD
- `GET/POST /api/leads/` - Lead CRUD
- `GET /api/vehicles/` - Vehicle catalog

## Sample Conversation

```
AI: "Satis Motor mein aapka swagat hai! Main aapki kaise madad kar sakta hoon?"

Customer: "Nexon EV ke baare mein batao"

AI: "Zaroor sir! Nexon EV hamare best-selling electric vehicles mein se ek hai.
     Iske 3 variants hain:
     - Prime: ₹14.49 lakh se shuru
     - Creative: ₹15.49 lakh
     - Fearless: ₹17.49 lakh
     465 km tak ki range milti hai. Kya aap test drive book karna chahenge?"

Customer: "Haan, kal ka slot mil sakta hai?"

AI: "Ek second sir... Kal ke available slots:
     - 10:00 AM - 11:00 AM
     - 2:00 PM - 3:00 PM
     - 4:00 PM - 5:00 PM
     Kaun sa time suitable hai?"
```

## Future Roadmap

1. **Phase 2**: ElevenLabs voice integration
2. **Phase 3**: Twilio/Exotel phone integration
3. **Phase 4**: WhatsApp integration
4. **Phase 5**: Multi-language support
5. **Phase 6**: PostgreSQL migration

## Troubleshooting

### Backend not starting
- Check if port 5000 is available
- Verify OpenAI API key in `.env`
- Run `pip install -r requirements.txt` again

### Frontend not connecting
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify vite proxy config

### AI not responding
- Check OpenAI API key validity
- Verify internet connection
- Check backend logs for errors

---

Built for Satis Motor - Tata Vehicle Dealer & Service Center, Pune
