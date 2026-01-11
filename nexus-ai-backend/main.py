import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
from pydantic import BaseModel
from langchain_groq import ChatGroq


from crewai import Agent,Task,Crew,Process,LLM
from langchain_community.tools import DuckDuckGoSearchRun 


load_dotenv() #Loading secret key from .env 
app=FastAPI(title="Nexus-ai Backend")


# Enable CORS for your React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","https://nexus-ai-frontend-z75f.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


llm = LLM(
    model="groq/llama-3.1-8b-instant", 
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0
)                                           #Using llama-3.1-8b-instant because it's powerful and currently free on Groq


search_tool = DuckDuckGoSearchRun()
researcher= Agent(
    role="Senior Research Analyst",
    goal="uncover cutting-edge developments in {topic}",
    backstory="""You are an expert at finding the most relevant information 
    and synthesizing it for technical teams. You have 10 years of experience 
    in market research and solutions development.""",
    tool=[search_tool],
    max_iter=3,
    function_calling_llm=llm,
    llm=llm,
    verbose=True,
    allow_delegation=False

)

writer = Agent(
  role='Technical Content Strategist',
  goal='Craft a professional friendly knowledge brief about {topic}',
  backstory="""You are a world-class writer who takes complex 
  research and makes it easy to understand for developers. You specialize 
  in high-level executive summaries.""",
  llm=llm,
  verbose=True,
  allow_delegation=False
)



from typing import List, Dict

class QueryRequest(BaseModel):
    query: str
    chat_history: List[Dict[str, str]] = []

@app.post("/research")
async def start_research(request: QueryRequest):
    # Format chat history for context
    history_context = "\n".join([f"{msg['role']}: {msg['content']}" for msg in request.chat_history])
    
    # 1. Define Task 1 with expected_output
    task1 = Task(
        description=f'Research the latest trends in {request.query}. '
                    f'IMPORTANT: "Context from previous conversation":\n{history_context}\n'
                    f'If the query is vague or a follow-up (like "tell me more"), use the Context to determine the true topic.',
        agent=researcher,
        expected_output="A detailed list of the top 3-5 trends with a brief explanation for each."
    )

    # 2. Define Task 2 with expected_output
    task2 = Task(
        description=f'Write a professional response about {request.query} based on the research. \n'
                    f'- Context: {history_context}\n'
                    f'- CRITICAL FORMAT RULES: \n'
                    f'  1. RESPONSE MUST BE IN BULLET POINTS.\n'
                    f'  2. Keep paragraphs short (max 2 sentences).\n'
                    f'  3. Use simple, clear language.',
        agent=writer,
        expected_output="A simplified response STRICTLY in bullet points."
    )

    # 3. Form the Crew
    crew = Crew(
      agents=[researcher, writer],
      tasks=[task1, task2],
      process=Process.sequential
    )

    # 4. Kickoff the process
    result = crew.kickoff()
    return {"result": str(result)}