# Use a pipeline as a high-level helper
from transformers import pipeline

messages = [
    {"role": "user", "content": "Who are you?"},
]
pipe = pipeline("text-generation", model="CohereLabs/c4ai-command-r7b-12-2024")
pipe(messages)