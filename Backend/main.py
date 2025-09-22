import os
import json
import uuid
import io
from typing import List, Dict, Optional, Literal, TypedDict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
import openai

load_dotenv()


app = FastAPI(title="AI Interviewer Backend", version="0.1.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend and backend ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello from AI Interviewer Backend!"}

# ---------------------------
# LLM Setup (use env var OPENAI_API_KEY)
# ---------------------------
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is required. Please set it in your .env file.")

llm = ChatOpenAI(model="gpt-4", temperature=0.7, api_key=OPENAI_API_KEY)
parser = StrOutputParser()

# Initialize OpenAI client for TTS
openai_client = openai.OpenAI(api_key=OPENAI_API_KEY)

# ---------------------------
# Prompts
# ---------------------------
GENERATE_QUESTIONS_PROMPT = ChatPromptTemplate.from_template("""
You are an expert technical interviewer. Based on the job role and experience level, generate exactly 5 relevant technical questions.

Job Role: {job_role}
Experience Level: {experience} years

Generate 5 questions that are:
1. Appropriate for the experience level
2. Technical and role-specific
3. Progressive in difficulty
4. Cover different aspects of the role

Return ONLY a JSON array of 5 questions, no explanations:
[
    "Question 1",
    "Question 2",
    "Question 3",
    "Question 4",
    "Question 5"
]
""")

EVALUATE_ANSWER_PROMPT = ChatPromptTemplate.from_template("""
You are an expert technical interviewer evaluating a candidate's answer. You need to provide TWO different types of feedback:

1. USER_FEEDBACK: Encouraging, constructive feedback for the candidate to help them improve
2. ADMIN_FEEDBACK: Detailed scoring and assessment for the hiring manager

Job Role: {job_role}
Experience Level: {experience} years
Question: {question}
Candidate's Answer: {answer}

Please provide your evaluation in this EXACT format:

USER_FEEDBACK: [Write encouraging, constructive feedback for the candidate. Focus on what they did well, areas for improvement, and specific suggestions. Be supportive and helpful, as if you're mentoring them. Keep it conversational and positive.]

ADMIN_SCORE: [Overall score from 1-10]
ADMIN_TECHNICAL_ACCURACY: [Score from 1-10]
ADMIN_COMPLETENESS: [Score from 1-10]
ADMIN_CLARITY: [Score from 1-10]
ADMIN_FEEDBACK: [Detailed assessment for hiring manager. Include technical evaluation, strengths, weaknesses, and hiring recommendation. Be objective and professional.]

Example format:
USER_FEEDBACK: Great effort on this question! I can see you're thinking about the key concepts. For React components, you might want to explore the differences between class and functional components. Class components use lifecycle methods and can manage state, while functional components are simpler and now support hooks for state management. Try practicing with both types to get comfortable with their use cases.

ADMIN_SCORE: 3
ADMIN_TECHNICAL_ACCURACY: 2
ADMIN_COMPLETENESS: 3
ADMIN_CLARITY: 4
ADMIN_FEEDBACK: Candidate shows basic understanding but lacks depth. For 3 years experience, expected more detailed explanation of React component types. Recommend additional training in React fundamentals before proceeding.
""")

FINAL_REPORT_PROMPT = ChatPromptTemplate.from_template("""
You are an expert technical interviewer creating a comprehensive interview report. You need to provide TWO different types of reports:

1. USER_REPORT: Encouraging, constructive report for the candidate
2. ADMIN_REPORT: Detailed assessment for the hiring manager

Job Role: {job_role}
Experience Level: {experience} years

Interview Results:
{interview_results}

Please provide your reports in this EXACT format:

USER_REPORT: [Write an encouraging, constructive report for the candidate. Focus on their strengths, areas for improvement, and specific recommendations for growth. Be supportive and motivating, as if you're mentoring them. Include actionable advice and next steps for their career development.]

ADMIN_REPORT: [Write a detailed professional assessment for the hiring manager. Include:
- Overall technical competency assessment
- Strengths and weaknesses analysis
- Specific technical gaps identified
- Recommendation (Pass/Fail/Consider with conditions)
- Detailed breakdown of each question performance
- Hiring recommendation with justification
- Suggested next steps if considering the candidate]

Example format:
USER_REPORT: Congratulations on completing your technical interview! You showed good understanding of fundamental concepts and demonstrated problem-solving skills. Your communication was clear, and you handled the questions thoughtfully. To continue growing, I recommend focusing on [specific areas]. Keep practicing with [specific technologies/concepts] and consider working on [specific skills]. You're on the right track!

ADMIN_REPORT: Candidate demonstrates basic competency in [role] fundamentals but shows gaps in [specific areas]. Technical accuracy: 6/10, Communication: 7/10, Problem-solving: 5/10. Strengths: [list]. Weaknesses: [list]. Recommendation: Consider with conditions - candidate shows potential but requires additional training in [specific areas] before being ready for [specific level] position.
""")

# ---------------------------
# LangGraph State Definition
# ---------------------------
class InterviewQA(TypedDict):
    question: str
    answer: str
    feedback: str

class InterviewState(TypedDict):
    job_role: str
    experience: int
    data: List[InterviewQA]
    current_question_idx: int
    interview_complete: bool
    final_report: str
    last_question: str
    last_answer: Optional[str]  # For API input

# ---------------------------
# LangGraph Nodes
# ---------------------------
def get_job_role_and_experience(state: InterviewState) -> InterviewState:
    """Validate job role and experience are provided."""
    if not state.get("job_role") or state.get("experience") is None:
        raise ValueError("job_role and experience must be provided.")
    return state

def generate_questions(state: InterviewState) -> InterviewState:
    """Generate interview questions based on job role and experience."""
    chain = GENERATE_QUESTIONS_PROMPT | llm | parser
    questions_json = chain.invoke({
        "job_role": state["job_role"],
        "experience": state["experience"]
    })
    questions = json.loads(questions_json)
    question_list: List[InterviewQA] = [{"question": q, "answer": "", "feedback": ""} for q in questions]
    
    return {
        **state,
        "data": question_list,
        "current_question_idx": 0,
        "interview_complete": False,
        "final_report": "",
        "last_question": question_list[0]["question"] if question_list else ""
    }

def ask_question(state: InterviewState) -> InterviewState:
    """Get the current question."""
    idx = state.get("current_question_idx", 0)
    if idx >= 5:
        return state
    q_text = state["data"][idx]["question"]
    return {**state, "last_question": q_text}

def evaluate_answer(state: InterviewState) -> InterviewState:
    """Evaluate the candidate's answer and generate feedback."""
    idx = state.get("current_question_idx", 0)
    if idx >= 5:
        return state
    
    # Check if we have an answer to evaluate
    last_answer = state.get("last_answer")
    if not last_answer:
        # No answer provided, just return current state
        return state
    
    question_text = state["data"][idx]["question"]
    answer_text = last_answer.strip()
    
    if not answer_text:
        raise ValueError("No answer provided for current question.")

    chain = EVALUATE_ANSWER_PROMPT | llm | parser
    evaluation = chain.invoke({
        "job_role": state["job_role"],
        "experience": state["experience"],
        "question": question_text,
        "answer": answer_text
    })
    
    # Parse the evaluation to extract user and admin feedback
    lines = evaluation.strip().split('\n')
    user_feedback = ""
    admin_feedback = ""
    admin_score = 0
    admin_technical_accuracy = 0
    admin_completeness = 0
    admin_clarity = 0
    
    current_section = None
    for line in lines:
        line = line.strip()
        if line.startswith("USER_FEEDBACK:"):
            current_section = "user"
            user_feedback = line.replace("USER_FEEDBACK:", "").strip()
        elif line.startswith("ADMIN_FEEDBACK:"):
            current_section = "admin"
            admin_feedback = line.replace("ADMIN_FEEDBACK:", "").strip()
        elif line.startswith("ADMIN_SCORE:"):
            try:
                admin_score = int(line.replace("ADMIN_SCORE:", "").strip())
            except:
                admin_score = 0
        elif line.startswith("ADMIN_TECHNICAL_ACCURACY:"):
            try:
                admin_technical_accuracy = int(line.replace("ADMIN_TECHNICAL_ACCURACY:", "").strip())
            except:
                admin_technical_accuracy = 0
        elif line.startswith("ADMIN_COMPLETENESS:"):
            try:
                admin_completeness = int(line.replace("ADMIN_COMPLETENESS:", "").strip())
            except:
                admin_completeness = 0
        elif line.startswith("ADMIN_CLARITY:"):
            try:
                admin_clarity = int(line.replace("ADMIN_CLARITY:", "").strip())
            except:
                admin_clarity = 0
        elif current_section == "user" and line:
            user_feedback += " " + line
        elif current_section == "admin" and line:
            admin_feedback += " " + line
    
    # Store both user and admin feedback
    feedback_data = {
        "user_feedback": user_feedback.strip(),
        "admin_feedback": admin_feedback.strip(),
        "admin_score": admin_score,
        "admin_technical_accuracy": admin_technical_accuracy,
        "admin_completeness": admin_completeness,
        "admin_clarity": admin_clarity
    }
    
    data_copy = state["data"].copy()
    data_copy[idx]["answer"] = answer_text
    data_copy[idx]["feedback"] = feedback_data

    new_idx = idx + 1
    next_question = data_copy[new_idx]["question"] if new_idx < 5 else ""
    
    return {
        **state,
        "data": data_copy,
        "current_question_idx": new_idx,
        "last_question": next_question,
        "last_answer": None  # Clear the answer after processing
    }

def generate_final_report(state: InterviewState) -> InterviewState:
    """Generate the final interview report."""
    print("Starting final report generation...")
    print(f"State data length: {len(state.get('data', []))}")
    
    interview_results = ""
    total_scores = []
    
    # Check if we have data
    if not state.get("data"):
        print("No data found in state!")
        return state
    
    for i in range(min(5, len(state["data"]))):
        qd = state["data"][i]
        print(f"Processing question {i+1}: {qd.get('question', 'No question')}")
        print(f"Answer: {qd.get('answer', 'No answer')}")
        print(f"Feedback type: {type(qd.get('feedback', 'No feedback'))}")
        
        interview_results += f"\nQuestion {i+1}: {qd['question']}\n"
        interview_results += f"Answer: {qd['answer']}\n"
        
        # Handle both old and new feedback formats
        if isinstance(qd.get('feedback'), dict):
            # New format with user and admin feedback
            feedback_data = qd['feedback']
            interview_results += f"User Feedback: {feedback_data.get('user_feedback', '')}\n"
            interview_results += f"Admin Feedback: {feedback_data.get('admin_feedback', '')}\n"
            interview_results += f"Admin Score: {feedback_data.get('admin_score', 0)}/10\n"
            total_scores.append(feedback_data.get('admin_score', 0))
        else:
            # Old format (fallback)
            interview_results += f"Feedback: {qd.get('feedback', '')}\n"
        
        interview_results += "-" * 40 + "\n"

    # Calculate average score
    avg_score = sum(total_scores) / len(total_scores) if total_scores else 0
    print(f"Average score: {avg_score}")
    print(f"Interview results length: {len(interview_results)}")

    try:
        chain = FINAL_REPORT_PROMPT | llm | parser
        report_response = chain.invoke({
            "job_role": state["job_role"],
            "experience": state["experience"],
            "interview_results": interview_results
        })
        
        print(f"Report response length: {len(report_response)}")
        print(f"Report response preview: {report_response[:200]}...")
        
        # Parse the report to extract user and admin reports
        lines = report_response.strip().split('\n')
        user_report = ""
        admin_report = ""
        
        current_section = None
        for line in lines:
            line = line.strip()
            if line.startswith("USER_REPORT:"):
                current_section = "user"
                user_report = line.replace("USER_REPORT:", "").strip()
            elif line.startswith("ADMIN_REPORT:"):
                current_section = "admin"
                admin_report = line.replace("ADMIN_REPORT:", "").strip()
            elif current_section == "user" and line:
                user_report += " " + line
            elif current_section == "admin" and line:
                admin_report += " " + line
        
        # Store both reports
        final_report_data = {
            "user_report": user_report.strip(),
            "admin_report": admin_report.strip(),
            "average_score": round(avg_score, 1)
        }
        
        print(f"Final report data: {final_report_data}")
        
        return {
            **state, 
            "final_report": final_report_data, 
            "interview_complete": True
        }
    except Exception as e:
        print(f"Error generating final report: {e}")
        import traceback
        traceback.print_exc()
        # Return a fallback report
        return {
            **state,
            "final_report": {
                "user_report": "Thank you for completing the interview! Your responses have been recorded and will be reviewed.",
                "admin_report": "Interview completed. Review individual question responses for detailed assessment.",
                "average_score": round(avg_score, 1)
            },
            "interview_complete": True
        }

def should_continue_interview(state: InterviewState) -> Literal["continue", "complete"]:
    """Determine if interview should continue or complete."""
    current_idx = state.get("current_question_idx", 0)
    return "continue" if current_idx < 5 else "complete"

# ---------------------------
# LangGraph Workflow Setup
# ---------------------------
workflow = StateGraph(InterviewState)
workflow.add_node("get_job_role_and_experience", get_job_role_and_experience)
workflow.add_node("generate_questions", generate_questions)
workflow.add_node("ask_question", ask_question)
workflow.add_node("evaluate_answer", evaluate_answer)
workflow.add_node("generate_final_report", generate_final_report)

# Simple workflow: just generate questions and ask first question
workflow.add_edge(START, "get_job_role_and_experience")
workflow.add_edge("get_job_role_and_experience", "generate_questions")
workflow.add_edge("generate_questions", "ask_question")
workflow.add_edge("ask_question", END)

# Compile with memory checkpointer for session persistence
checkpointer = MemorySaver()
compiled_graph = workflow.compile(checkpointer=checkpointer)

class CreateSessionRequest(BaseModel):
    job_role:str = Field(...,example="React Developer")
    experience:int = Field(...,example=2)

class CreateSessionResponse(BaseModel):
    session_id: str
    job_role: str
    experience: int
    questions: List[str]
    current_question_idx: int

class SessionState(BaseModel):
    job_role: str
    experience: int
    data: List[dict]
    current_question_idx: int
    final_report: str

class SubmitAnswerRequest(BaseModel):
    answer: str

class SubmitAnswerResponse(BaseModel):
    question_idx: int
    question: str
    user_feedback: str
    admin_feedback: str
    admin_score: int
    admin_technical_accuracy: int
    admin_completeness: int
    admin_clarity: int
    next_question_idx: Optional[int] = None
    next_question: Optional[str] = None

class TTSRequest(BaseModel):
    text: str
    voice: str = "alloy"  # Default voice

@app.post("/sessions")
async def create_session(payload:CreateSessionRequest):
    try:
        print(f"Creating session for job_role: {payload.job_role}, experience: {payload.experience}")
        
        session_id = str(uuid.uuid4())
        config = {"configurable":{"thread_id":session_id}}
        initial_state:InterviewState = {
            "job_role":payload.job_role,
            "experience":payload.experience,
            "data": [],
            "current_question_idx": 0,
            "interview_complete": False,
            "final_report": "",
            "last_question": "",
            "last_answer": None
        }

        print("Invoking compiled graph...")
        compiled_graph.invoke(initial_state,config=config)
        print("Graph invocation successful")

        state = compiled_graph.get_state(config)
        values = state.values
        print(f"State values: {values}")

        # Validate that data was generated
        if "data" not in values or not values["data"]:
            raise HTTPException(status_code=500, detail="Failed to generate interview questions.")
        
        questions = [row["question"] for row in values.get("data",[])]
        print(f"Generated questions: {questions}")

        # Validate questions were generated
        if not questions or len(questions) == 0:
            raise HTTPException(status_code=500, detail="No questions were generated for this session.")

        return CreateSessionResponse(
            session_id=session_id,
            job_role= values["job_role"],
            experience=values["experience"],
            questions=questions,
            current_question_idx=values.get("current_question_idx",0)
        )
    except Exception as e:
        print(f"Error creating session: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")



@app.get("/sessions/{session_id}")
async def get_session(session_id:str):
    try:
        config = {"configurable":{"thread_id":session_id}}
        state = compiled_graph.get_state(config)
        values = state.values
        
        print(f"Get session request for {session_id}, values: {values}")
        
        # Check if session exists
        if not values:
            raise HTTPException(status_code=404, detail="Session not found.")
        
        return SessionState(
            job_role=values.get("job_role", ""),
            experience=values.get("experience", 0),
            data=values.get("data", []),
            current_question_idx=values.get("current_question_idx", 0),
            final_report=values.get("final_report", "")
        )
    except Exception as e:
        print(f"Error in get_session: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to get session: {str(e)}")


@app.post("/sessions/{session_id}/answers")
async def submit_answer(session_id:str,payload:SubmitAnswerRequest):
    try:
        config = {"configurable": {"thread_id": session_id}}
        current_state = compiled_graph.get_state(config)
        values = current_state.values
        
        print(f"Current state values: {values}")
        
        # Check if data exists and has the expected structure
        if "data" not in values or not values["data"]:
            raise HTTPException(status_code=400, detail="Session data not found. Please create a new session.")
        
        idx = values.get("current_question_idx", 0)
        
        # Validate index is within bounds
        if idx >= len(values["data"]):
            raise HTTPException(status_code=400, detail="Invalid question index.")
        
        question = values["data"][idx]["question"]
        print(f"Processing answer for question {idx}: {question}")

        eval_state={**values,"last_answer":payload.answer}
        updated_state = evaluate_answer(eval_state)

        compiled_graph.update_state(config,updated_state)
        feedback_data = updated_state["data"][idx]["feedback"]
        
        # Check if this was the last question (question 5, index 4)
        if updated_state.get("current_question_idx", 0) >= 5:
            print("Interview complete! Generating final report...")
            final_state = generate_final_report(updated_state)
            compiled_graph.update_state(config, final_state)
            next_q_idx = None
            next_q = None
        else:
            next_q_idx = updated_state["current_question_idx"]
            next_q = updated_state["data"][next_q_idx]["question"]

        return SubmitAnswerResponse(
            question_idx=idx,
            question=question,
            user_feedback=feedback_data["user_feedback"],
            admin_feedback=feedback_data["admin_feedback"],
            admin_score=feedback_data["admin_score"],
            admin_technical_accuracy=feedback_data["admin_technical_accuracy"],
            admin_completeness=feedback_data["admin_completeness"],
            admin_clarity=feedback_data["admin_clarity"],
            next_question_idx=next_q_idx,
            next_question=next_q,
        )
    except Exception as e:
        print(f"Error in submit_answer: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to submit answer: {str(e)}")



@app.get("/sessions/{session_id}/report")
async def get_report(session_id: str):
    try:
        config = {"configurable": {"thread_id": session_id}}
        state = compiled_graph.get_state(config)
        values = state.values
        
        print(f"Report request for session {session_id}, values: {values}")

        # Check if session exists
        if not values:
            raise HTTPException(status_code=404, detail="Session not found.")
        
        final_report = values.get("final_report", {})
        
        # Handle both old and new report formats
        if isinstance(final_report, dict):
            # New format with user and admin reports
            return {
                "job_role": values.get("job_role", ""),
                "experience": values.get("experience", 0),
                "user_report": final_report.get("user_report", ""),
                "admin_report": final_report.get("admin_report", ""),
                "average_score": final_report.get("average_score", 0),
                "interview_complete": values.get("interview_complete", False),
                "total_questions": len(values.get("data", [])),
                "completed_questions": values.get("current_question_idx", 0)
            }
        else:
            # Old format (fallback)
            return {
                "job_role": values.get("job_role", ""),
                "experience": values.get("experience", 0),
                "user_report": final_report,
                "admin_report": final_report,
                "average_score": 0,
                "interview_complete": values.get("interview_complete", False),
                "total_questions": len(values.get("data", [])),
                "completed_questions": values.get("current_question_idx", 0)
            }
    except Exception as e:
        print(f"Error in get_report: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to get report: {str(e)}")

@app.post("/tts")
async def text_to_speech(request: TTSRequest):
    """Convert text to speech using OpenAI TTS API"""
    try:
        print(f"Generating TTS for text: {request.text[:100]}...")
        
        # Generate speech using OpenAI TTS
        response = openai_client.audio.speech.create(
            model="tts-1",
            voice=request.voice,
            input=request.text
        )
        
        # Convert response to bytes
        audio_bytes = response.content
        
        # Return audio as streaming response
        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline; filename=speech.mp3"}
        )
        
    except Exception as e:
        print(f"Error generating TTS: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate speech: {str(e)}")

