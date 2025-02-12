from huggingface_hub import InferenceClient

client = InferenceClient(
	provider="together",
	api_key="api_key",
)

messages = [
	{
		"role": "user",
		"content": "What is the capital of France?"
	}
]

completion = client.chat.completions.create(
    model="deepseek-ai/DeepSeek-R1", 
	messages=messages, 
	max_tokens=500
)

print(completion.choices[0].message)