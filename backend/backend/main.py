# from huggingface_hub import InferenceClient

# client = InferenceClient(
# 	provider="together",
# 	api_key="api_key",
# )

# messages = [
# 	{
# 		"role": "user",
# 		"content": "What is the capital of France?"
# 	}
# ]

# completion = client.chat.completions.create(
#     model="deepseek-ai/DeepSeek-R1", 
# 	messages=messages, 
# 	max_tokens=500
# )

# print(completion.choices[0].message)
import requests

OLLAMA_URL = "http://127.0.0.1:11434"

def run_ollama_chat(prompt):
    """Send a request to Ollama's API and properly collect full response."""
    payload = {
        "model": "llama3.2",
        "prompt": prompt,
        "stream": False  
    }

    try:
        response = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json=payload,
            headers={"Content-Type": "application/json"}
        )

        if response.status_code == 200:
            data = response.json()
            return data.get("response", "No response from Ollama")
        else:
            return f"Error from Ollama: {response.status_code} - {response.text}"

    except requests.exceptions.RequestException as e:
        return f"Failed to connect to Ollama: {str(e)}"


print(run_ollama_chat("Tell me a fun fact about AI"))