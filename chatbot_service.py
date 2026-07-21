import os
import json
import google.generativeai as genai

class DengueChatbot:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    def generate_dispatch_order(self, prompt: str, context: str) -> str:
        full_prompt = (
            "You are an AI Medical Coordinator for the Health Department. "
            "Based on the following Dengue Prevention Guidelines, respond to the system request.\n\n"
            f"--- GUIDELINES ---\n{context}\n------------------\n\n"
            f"SYSTEM REQUEST: {prompt}"
        )
        response = self.model.generate_content(full_prompt)
        return response.text

def process_allocation_file(json_path: str, rag_doc_path: str, output_path: str, api_key: str = None):
    if api_key is None:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set.")

    bot = DengueChatbot(api_key)
    
    with open(rag_doc_path, 'r', encoding='utf-8') as f:
        rag_context = f.read()
        
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    results = []
    covered_regions = data.get("allocation_result", {}).get("covered_regions", [])
    
    for region_data in covered_regions:
        prompt = region_data.get("llm_rag_prompt", "")
        region_name = region_data.get("region", "Unknown")
        
        if prompt:
            print(f"Generating dispatch order for {region_name}...")
            generated_text = bot.generate_dispatch_order(prompt, rag_context)
            results.append({
                "region": region_name,
                "dispatch_order_text": generated_text
            })
            
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
        
    print(f"Generated {len(results)} dispatch orders to {output_path}")

if __name__ == "__main__":
    # Example execution (will fail if GEMINI_API_KEY is not set)
    process_allocation_file(
        json_path="artifacts/allocation_output.json",
        rag_doc_path="docs/SXH.md",
        output_path="artifacts/dispatch_orders.json"
    )
