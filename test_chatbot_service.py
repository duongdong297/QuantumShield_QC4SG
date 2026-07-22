import os
import json
import pytest
from unittest.mock import patch, MagicMock
from chatbot_service import DengueChatbot, process_allocation_file

def test_generate_dispatch_order():
    bot = DengueChatbot("dummy_key")
    with patch("chatbot_service.genai.GenerativeModel.generate_content") as mock_generate:
        mock_response = MagicMock()
        mock_response.text = "Mocked Dispatch Order"
        mock_generate.return_value = mock_response
        
        result = bot.generate_dispatch_order("Test prompt", "Test context")
        assert result == "Mocked Dispatch Order"
        mock_generate.assert_called_once()

def test_process_allocation_file(tmp_path):
    # Setup dummy JSON
    input_json = tmp_path / "input.json"
    input_json.write_text(json.dumps({
        "allocation_result": {
            "covered_regions": [
                {"region": "Region A", "llm_rag_prompt": "Test Prompt A"}
            ]
        }
    }))
    
    # Setup dummy RAG doc
    rag_doc = tmp_path / "rag.md"
    rag_doc.write_text("Dummy Medical Guidelines")
    
    output_json = tmp_path / "output.json"
    
    with patch("chatbot_service.DengueChatbot.generate_dispatch_order") as mock_gen:
        mock_gen.return_value = "Generated Text for Region A"
        process_allocation_file(str(input_json), str(rag_doc), str(output_json), "dummy_key")
        
        # Verify output
        output_data = json.loads(output_json.read_text())
        assert output_data[0]["region"] == "Region A"
        assert output_data[0]["dispatch_order_text"] == "Generated Text for Region A"
