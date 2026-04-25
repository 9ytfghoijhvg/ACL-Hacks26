import ollama

response = ollama.chat(
    model="llama3.1:8b",
    messages=[{"role": "user", "content": "You are Albert Einstein. You are debating with Issac Newton about if the earth is flat or not. Newton said that the earth is flat because he doesn't see the curvature. What will you say next?"}]
)

print(response["message"]["content"])