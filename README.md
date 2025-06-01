# Sympalyze – Healthcare Meets AI  

Sympalyze is an AI-powered medical information assistant that delivers concise, cited answers to health-related questions.  
Built on Google Gemini with real-time web search, Sympalyze augments traditional symptom checkers with conversational search, image analysis, and evidence-based sourcing.

---

## ✨ Key Features

- **Conversational Healthcare Search**  
  Ask any medical question in plain language and receive an organized, readable answer with reputable citations.

- **Symptom Selector**  
  Quickly add one or more symptoms from a searchable catalogue (e.g. *Fever*, *Fatigue*, *Chest pain*) to refine your query.

- **Image Attachment & Analysis**  
  Upload photos, X-rays, lab reports, or documents for additional context. Images are processed by the model to improve response relevance.  

- **Follow-Up Questions**  
  Continue the conversation without losing context; each follow-up is answered in the same session.

- **Source Badges & Citations**  
  Responses reference trusted medical sources such as MedlinePlus, Mayo Clinic, WebMD, Cleveland Clinic, NIH and more.

- **Built-in Medical Disclaimer**  
  Every answer reminds users that Sympalyze is **not** a substitute for professional medical advice.

---

## Tech Stack

| Layer      | Technology |
|------------|------------|
| **Frontend** | React + Vite · TypeScript · Tailwind CSS (shadcn/ui) |
| **Backend**  | Express.js · TypeScript |
| **AI / Search** | Google Gemini 2.0 Flash · Google Web Search Tool |
| **State & Data** | @tanstack/react-query · Drizzle ORM |

---

## Quick Start

### Prerequisites
- Node .js ≥ 18
- A Google API Key with Gemini access

### Installation
```bash
git clone https://github.com/your-org/Sympalyze.git
cd Sympalyze
npm install
```

Create a `.env` file in the project root:

```
GOOGLE_API_KEY=your_google_api_key
```

### Run in Development
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### Production Build
```bash
npm run build
npm run start
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GOOGLE_API_KEY` | Your Google Cloud API key with Gemini enabled |
| `NODE_ENV` | `development` (default) or `production` |

---

## Security Notes
- **Never** commit `.env` or expose API keys publicly.
- Review and comply with local regulations before deploying healthcare software.

---

## License
This project is licensed under the MIT License.

---

### Disclaimer  
Sympalyze provides information **for educational purposes only** and is **not** a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider with any questions regarding a medical condition.
