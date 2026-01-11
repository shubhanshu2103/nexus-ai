# NEXUS-AI: Multi-Agent Intelligence Hub

An advanced agentic research platform powered by **CrewAI**, **Groq (LPU)**, and **FastAPI**.

## 🚀 Overview
Nexus-AI leverages a swarm of AI agents to perform autonomous web research. By utilizing the Groq LPU (Language Processing Unit), it delivers sub-second synthesis of complex technical topics.

## 🤖 AI Agents
- **Senior Research Analyst**: Scours the web using DuckDuckGo tools to find cutting-edge developments.
- **Technical Content Strategist**: Synthesizes raw research into structured, professional briefs.

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion (Animations).
- **Backend**: FastAPI (Python 3.12), Pydantic v2.
- **AI Orchestration**: CrewAI & LangChain.
- **Inference**: Llama 3.3 (via Groq).

## 📥 Setup
1. **Clone the repo**: `git clone https://github.com/shubhanshu2103/nexus-ai.git`
2. **Backend**: 
   - `cd nexus-ai-backend`
   - `pip install -r requirements.txt`
   - Create `.env` with `GROQ_API_KEY`.
3. **Frontend**:
   - `cd frontend`
   - `npm install`
   - `npm run dev`
