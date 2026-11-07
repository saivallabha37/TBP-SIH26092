
import torch
from transformers import AutoTokenizer, AutoModel

MODEL_NAME = "google/muril-base-cased"

print("Loading MuRIL tokenizer...")

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

print("Loading MuRIL model...")

model = AutoModel.from_pretrained(MODEL_NAME)

model.eval()

examples = [
    "I want to start a tailoring business",
    "నేను టైలరింగ్ వ్యాపారం ప్రారంభించాలనుకుంటున్నాను",
    "मैं सिलाई का व्यवसाय शुरू करना चाहता हूँ",
]

for message in examples:

    inputs = tokenizer(
        message,
        return_tensors="pt",
        truncation=True,
        padding=True
    )

    with torch.no_grad():
        outputs = model(**inputs)

    # Contextual representation of every token
    token_embeddings = outputs.last_hidden_state

    # Representation of the first token
    sentence_representation = token_embeddings[:, 0, :]

    print("\nInput:", message)
    print("Token IDs:", inputs["input_ids"])
    print("Token embedding shape:", token_embeddings.shape)
    print(
        "Sentence representation shape:",
        sentence_representation.shape
    )

print("\nMuRIL experiment completed!")
