"""
Comprehensive test suite for AI Interviewer Backend
Tests all endpoints, LangGraph workflow, and error handling
"""

import pytest
import json
import uuid
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import os
from main import app, compiled_graph

# Test client
client = TestClient(app)

class TestAPIEndpoints:
    """Test all API endpoints"""
    
    def test_root_endpoint(self):
        """Test the root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        assert response.json() == {"message": "Hello from AI Interviewer Backend!"}
    
    @patch('main.llm')
    def test_create_session_success(self, mock_llm):
        """Test successful session creation"""
        # Mock the LLM response for question generation
        mock_llm.return_value = MagicMock()
        mock_llm.return_value.invoke.return_value = json.dumps([
            "What is React?",
            "Explain component lifecycle",
            "What are hooks?",
            "How do you handle state?",
            "What is JSX?"
        ])
        
        payload = {
            "job_role": "React Developer",
            "experience": 2
        }
        
        response = client.post("/sessions", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert "session_id" in data
        assert data["job_role"] == "React Developer"
        assert data["experience"] == 2
        assert len(data["questions"]) == 5
        assert data["current_question_idx"] == 0
    
    def test_create_session_missing_job_role(self):
        """Test session creation with missing job role"""
        payload = {
            "experience": 2
        }
        
        response = client.post("/sessions", json=payload)
        assert response.status_code == 422  # Validation error
    
    def test_create_session_missing_experience(self):
        """Test session creation with missing experience"""
        payload = {
            "job_role": "React Developer"
        }
        
        response = client.post("/sessions", json=payload)
        assert response.status_code == 422  # Validation error
    
    @patch('main.llm')
    def test_get_session(self, mock_llm):
        """Test getting session state"""
        # First create a session
        mock_llm.return_value = MagicMock()
        mock_llm.return_value.invoke.return_value = json.dumps([
            "What is React?", "Explain hooks", "What is JSX?", "How to handle state?", "What are props?"
        ])
        
        create_response = client.post("/sessions", json={
            "job_role": "React Developer",
            "experience": 2
        })
        session_id = create_response.json()["session_id"]
        
        # Now get the session
        response = client.get(f"/sessions/{session_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["job_role"] == "React Developer"
        assert data["experience"] == 2
        assert len(data["data"]) == 5
        assert data["current_question_idx"] == 0
    
    def test_get_nonexistent_session(self):
        """Test getting a session that doesn't exist"""
        fake_session_id = str(uuid.uuid4())
        response = client.get(f"/sessions/{fake_session_id}")
        # This might return 200 with empty state or 404, depending on implementation
        assert response.status_code in [200, 404]
    
    @patch('main.llm')
    def test_submit_answer(self, mock_llm):
        """Test submitting an answer"""
        # Mock LLM responses
        mock_llm.return_value = MagicMock()
        mock_llm.return_value.invoke.side_effect = [
            json.dumps(["What is React?", "Explain hooks", "What is JSX?", "How to handle state?", "What are props?"]),
            "Score: 8/10\nTechnical Accuracy: 8/10\nCompleteness: 7/10\nClarity: 9/10\nFeedback: Good understanding of React basics."
        ]
        
        # Create session
        create_response = client.post("/sessions", json={
            "job_role": "React Developer",
            "experience": 2
        })
        session_id = create_response.json()["session_id"]
        
        # Submit answer
        answer_payload = {"answer": "React is a JavaScript library for building user interfaces"}
        response = client.post(f"/sessions/{session_id}/answers", json=answer_payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "question_idx" in data
        assert "question" in data
        assert "feedback" in data
        assert data["question_idx"] == 0
    
    @patch('main.llm')
    def test_get_report(self, mock_llm):
        """Test getting final report"""
        # Mock LLM responses
        mock_llm.return_value = MagicMock()
        mock_llm.return_value.invoke.side_effect = [
            json.dumps(["What is React?", "Explain hooks", "What is JSX?", "How to handle state?", "What are props?"]),
            "Score: 8/10\nTechnical Accuracy: 8/10\nCompleteness: 7/10\nClarity: 9/10\nFeedback: Good understanding.",
            "Score: 7/10\nTechnical Accuracy: 7/10\nCompleteness: 6/10\nClarity: 8/10\nFeedback: Basic understanding.",
            "Score: 9/10\nTechnical Accuracy: 9/10\nCompleteness: 8/10\nClarity: 9/10\nFeedback: Excellent explanation.",
            "Score: 6/10\nTechnical Accuracy: 6/10\nCompleteness: 5/10\nClarity: 7/10\nFeedback: Needs improvement.",
            "Score: 8/10\nTechnical Accuracy: 8/10\nCompleteness: 7/10\nClarity: 8/10\nFeedback: Good understanding.",
            "Overall Assessment: The candidate shows good understanding of React fundamentals with room for improvement in advanced concepts."
        ]
        
        # Create session and complete interview
        create_response = client.post("/sessions", json={
            "job_role": "React Developer",
            "experience": 2
        })
        session_id = create_response.json()["session_id"]
        
        # Submit all answers
        answers = [
            "React is a JavaScript library for building user interfaces",
            "Hooks are functions that let you use state and other React features",
            "JSX is a syntax extension for JavaScript",
            "State is managed using useState hook",
            "Props are properties passed to components"
        ]
        
        for answer in answers:
            client.post(f"/sessions/{session_id}/answers", json={"answer": answer})
        
        # Get report
        response = client.get(f"/sessions/{session_id}/report")
        assert response.status_code == 200
        
        data = response.json()
        assert "job_role" in data
        assert "experience" in data
        assert "final_report" in data
        assert data["job_role"] == "React Developer"
        assert data["experience"] == 2

class TestLangGraphWorkflow:
    """Test LangGraph workflow components"""
    
    def test_interview_state_initialization(self):
        """Test interview state initialization"""
        from main import InterviewState
        
        state = InterviewState(
            job_role="Python Developer",
            experience=3,
            data=[],
            current_question_idx=0,
            interview_complete=False,
            final_report="",
            last_question="",
            last_answer=None
        )
        
        assert state["job_role"] == "Python Developer"
        assert state["experience"] == 3
        assert state["current_question_idx"] == 0
        assert not state["interview_complete"]
    
    @patch('main.llm')
    def test_generate_questions_node(self, mock_llm):
        """Test question generation node"""
        from main import generate_questions
        
        mock_llm.return_value = MagicMock()
        mock_llm.return_value.invoke.return_value = json.dumps([
            "What is Python?", "Explain OOP", "What are decorators?", "How to handle exceptions?", "What is PEP 8?"
        ])
        
        state = {
            "job_role": "Python Developer",
            "experience": 3,
            "data": [],
            "current_question_idx": 0,
            "interview_complete": False,
            "final_report": "",
            "last_question": "",
            "last_answer": None
        }
        
        result = generate_questions(state)
        
        assert len(result["data"]) == 5
        assert result["current_question_idx"] == 0
        assert not result["interview_complete"]
        assert result["last_question"] == "What is Python?"
    
    def test_ask_question_node(self):
        """Test ask question node"""
        from main import ask_question
        
        state = {
            "job_role": "Python Developer",
            "experience": 3,
            "data": [
                {"question": "What is Python?", "answer": "", "feedback": ""},
                {"question": "Explain OOP", "answer": "", "feedback": ""}
            ],
            "current_question_idx": 1,
            "interview_complete": False,
            "final_report": "",
            "last_question": "",
            "last_answer": None
        }
        
        result = ask_question(state)
        assert result["last_question"] == "Explain OOP"
    
    @patch('main.llm')
    def test_evaluate_answer_node(self, mock_llm):
        """Test answer evaluation node"""
        from main import evaluate_answer
        
        mock_llm.return_value = MagicMock()
        mock_llm.return_value.invoke.return_value = "Score: 8/10\nTechnical Accuracy: 8/10\nCompleteness: 7/10\nClarity: 9/10\nFeedback: Good understanding of Python basics."
        
        state = {
            "job_role": "Python Developer",
            "experience": 3,
            "data": [
                {"question": "What is Python?", "answer": "", "feedback": ""},
                {"question": "Explain OOP", "answer": "", "feedback": ""}
            ],
            "current_question_idx": 0,
            "interview_complete": False,
            "final_report": "",
            "last_question": "What is Python?",
            "last_answer": "Python is a high-level programming language"
        }
        
        result = evaluate_answer(state)
        
        assert result["data"][0]["answer"] == "Python is a high-level programming language"
        assert "Score: 8/10" in result["data"][0]["feedback"]
        assert result["current_question_idx"] == 1
        assert result["last_question"] == "Explain OOP"
    
    def test_should_continue_interview(self):
        """Test interview continuation logic"""
        from main import should_continue_interview
        
        # Should continue
        state = {"current_question_idx": 2}
        assert should_continue_interview(state) == "continue"
        
        # Should complete
        state = {"current_question_idx": 5}
        assert should_continue_interview(state) == "complete"

class TestErrorHandling:
    """Test error handling and edge cases"""
    
    def test_invalid_json_in_questions(self):
        """Test handling of invalid JSON from LLM"""
        with patch('main.llm') as mock_llm:
            mock_llm.return_value = MagicMock()
            mock_llm.return_value.invoke.return_value = "Invalid JSON response"
            
            payload = {
                "job_role": "React Developer",
                "experience": 2
            }
            
            response = client.post("/sessions", json=payload)
            # Should handle JSON parsing error gracefully
            assert response.status_code in [500, 422]
    
    def test_empty_answer_submission(self):
        """Test submitting empty answer"""
        with patch('main.llm') as mock_llm:
            mock_llm.return_value = MagicMock()
            mock_llm.return_value.invoke.return_value = json.dumps([
                "What is React?", "Explain hooks", "What is JSX?", "How to handle state?", "What are props?"
            ])
            
            # Create session
            create_response = client.post("/sessions", json={
                "job_role": "React Developer",
                "experience": 2
            })
            session_id = create_response.json()["session_id"]
            
            # Submit empty answer
            response = client.post(f"/sessions/{session_id}/answers", json={"answer": ""})
            # Should handle empty answer appropriately
            assert response.status_code in [400, 422, 500]
    
    def test_missing_openai_api_key(self):
        """Test behavior when OpenAI API key is missing"""
        original_key = os.getenv("OPENAI_API_KEY")
        
        # Temporarily remove the API key
        if "OPENAI_API_KEY" in os.environ:
            del os.environ["OPENAI_API_KEY"]
        
        try:
            payload = {
                "job_role": "React Developer",
                "experience": 2
            }
            
            response = client.post("/sessions", json=payload)
            # Should handle missing API key gracefully
            assert response.status_code in [500, 422]
        finally:
            # Restore the API key
            if original_key:
                os.environ["OPENAI_API_KEY"] = original_key

class TestIntegration:
    """Integration tests for complete workflow"""
    
    @patch('main.llm')
    def test_complete_interview_flow(self, mock_llm):
        """Test complete interview flow from start to finish"""
        # Mock all LLM responses
        mock_responses = [
            # Question generation
            json.dumps([
                "What is React?", "Explain hooks", "What is JSX?", "How to handle state?", "What are props?"
            ]),
            # Answer evaluations
            "Score: 8/10\nTechnical Accuracy: 8/10\nCompleteness: 7/10\nClarity: 9/10\nFeedback: Good understanding of React basics.",
            "Score: 7/10\nTechnical Accuracy: 7/10\nCompleteness: 6/10\nClarity: 8/10\nFeedback: Basic understanding of hooks.",
            "Score: 9/10\nTechnical Accuracy: 9/10\nCompleteness: 8/10\nClarity: 9/10\nFeedback: Excellent explanation of JSX.",
            "Score: 6/10\nTechnical Accuracy: 6/10\nCompleteness: 5/10\nClarity: 7/10\nFeedback: Needs improvement in state management.",
            "Score: 8/10\nTechnical Accuracy: 8/10\nCompleteness: 7/10\nClarity: 8/10\nFeedback: Good understanding of props.",
            # Final report
            "Overall Assessment: The candidate demonstrates solid understanding of React fundamentals with room for improvement in advanced state management concepts. Recommendation: Pass with conditions."
        ]
        
        mock_llm.return_value = MagicMock()
        mock_llm.return_value.invoke.side_effect = mock_responses
        
        # 1. Create session
        create_response = client.post("/sessions", json={
            "job_role": "React Developer",
            "experience": 2
        })
        assert create_response.status_code == 200
        session_id = create_response.json()["session_id"]
        
        # 2. Get initial session state
        session_response = client.get(f"/sessions/{session_id}")
        assert session_response.status_code == 200
        session_data = session_response.json()
        assert len(session_data["data"]) == 5
        
        # 3. Submit all answers
        answers = [
            "React is a JavaScript library for building user interfaces",
            "Hooks are functions that let you use state and other React features",
            "JSX is a syntax extension for JavaScript that looks like HTML",
            "State is managed using useState hook and can be updated with setState",
            "Props are properties passed to components to make them reusable"
        ]
        
        for i, answer in enumerate(answers):
            answer_response = client.post(f"/sessions/{session_id}/answers", json={"answer": answer})
            assert answer_response.status_code == 200
            answer_data = answer_response.json()
            assert answer_data["question_idx"] == i
        
        # 4. Get final report
        report_response = client.get(f"/sessions/{session_id}/report")
        assert report_response.status_code == 200
        report_data = report_response.json()
        assert "final_report" in report_data
        assert len(report_data["final_report"]) > 0

if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"])
