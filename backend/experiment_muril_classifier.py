
import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoModel

# 1. Load pretrained MuRIL
MODEL_NAME = "google/muril-base-cased"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
muril = AutoModel.from_pretrained(MODEL_NAME)

# 2. Freeze MuRIL's parameters
for parameter in muril.parameters():
    parameter.requires_grad = False

muril.eval()

# 3. Define our purpose categories
labels = [
    "business",
    "education",
    "agriculture",
    "unknown"
]

# 4. Create the classification head
classifier = nn.Linear(
    in_features=muril.config.hidden_size,
    out_features=len(labels)
)

# 5. Process a sample message
message = "I want to open a small bakery."

inputs = tokenizer(
    message,
    return_tensors="pt",
    truncation=True,
    padding=True
)

# 6. Generate MuRIL's representation
with torch.no_grad():
    outputs = muril(**inputs)

    # Use the first token's representation
    sentence_representation = outputs.last_hidden_state[:, 0, :]

# 7. Pass representation through classification head
logits = classifier(sentence_representation)

# 8. Convert scores into normalized values
probabilities = torch.softmax(logits, dim=1)

# 9. Display results
predicted_index = torch.argmax(probabilities, dim=1).item()

print("Input:", message)
print("\nCategory scores:")

for index, label in enumerate(labels):
    print(f"{label}: {probabilities[0][index].item():.4f}")

print("\nPredicted category:", labels[predicted_index])

# Confirm which parameters can learn
print(
    "\nMuRIL trainable parameters:",
    sum(p.numel() for p in muril.parameters() if p.requires_grad)
)

print(
    "Classification head trainable parameters:",
    sum(p.numel() for p in classifier.parameters() if p.requires_grad)
)
