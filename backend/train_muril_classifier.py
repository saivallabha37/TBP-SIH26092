
import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoModel

from multilingual_dataset import multilingual_examples


# ==========================================
# 1. CONFIGURATION
# ==========================================

MODEL_NAME = "google/muril-base-cased"

labels = [
    "business",
    "education",
    "agriculture",
    "unknown"
]

label_to_id = {
    label: index
    for index, label in enumerate(labels)
}


# ==========================================
# 2. LOAD TOKENIZER AND MURIL
# ==========================================

print("Loading MuRIL...")

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
muril = AutoModel.from_pretrained(MODEL_NAME)

# Freeze MuRIL parameters
for parameter in muril.parameters():
    parameter.requires_grad = False

muril.eval()

print("MuRIL loaded successfully!")
print("Number of examples:", len(multilingual_examples))
print("Categories:", labels)


# ==========================================
# 3. FEATURE EXTRACTION
# ==========================================

print("\nExtracting features...")

features = []
targets = []

with torch.no_grad():

    for example in multilingual_examples:

        message = example["message"]
        expected_label = example["expected"]

        # Tokenize message
        inputs = tokenizer(
            message,
            return_tensors="pt",
            truncation=True,
            padding=True
        )

        # Generate contextual representations
        outputs = muril(**inputs)

        # Extract first token representation
        sentence_representation = outputs.last_hidden_state[:, 0, :]

        # Store representation
        features.append(sentence_representation.squeeze(0))

        # Store numerical label
        targets.append(label_to_id[expected_label])


# Convert to tensors
X = torch.stack(features)
y = torch.tensor(targets, dtype=torch.long)

print("Feature extraction completed!")
print("Feature tensor shape:", X.shape)
print("Target tensor shape:", y.shape)


# ==========================================
# 4. CREATE CLASSIFICATION HEAD
# ==========================================

classifier = nn.Linear(
    in_features=muril.config.hidden_size,
    out_features=len(labels)
)

print("\nClassifier created successfully!")
print("Input features:", muril.config.hidden_size)
print("Output categories:", len(labels))

trainable_parameters = sum(
    parameter.numel()
    for parameter in classifier.parameters()
    if parameter.requires_grad
)

print("Trainable parameters:", trainable_parameters)


# ==========================================
# 5. LOSS FUNCTION AND OPTIMIZER
# ==========================================

criterion = nn.CrossEntropyLoss()

optimizer = torch.optim.Adam(
    classifier.parameters(),
    lr=0.001
)


# ==========================================
# 6. TRAINING LOOP
# ==========================================

epochs = 50

classifier.train()

print("\nStarting training...\n")

for epoch in range(epochs):

    # Forward pass
    logits = classifier(X)

    # Calculate loss
    loss = criterion(logits, y)

    # Clear previous gradients
    optimizer.zero_grad()

    # Backpropagation
    loss.backward()

    # Update classifier weights
    optimizer.step()

    # Display progress
    if (epoch + 1) % 5 == 0:
        print(
            f"Epoch [{epoch + 1}/{epochs}], "
            f"Loss: {loss.item():.4f}"
        )


print("\nTraining completed!")


# ==========================================
# 7. EVALUATE TRAINING PREDICTIONS
# ==========================================

classifier.eval()

correct = 0

print("\n========== TRAINING PREDICTIONS ==========\n")

with torch.no_grad():

    logits = classifier(X)

    predictions = torch.argmax(logits, dim=1)

    for index, example in enumerate(multilingual_examples):

        predicted_label = labels[predictions[index].item()]
        actual_label = example["expected"]

        is_correct = predicted_label == actual_label

        if is_correct:
            correct += 1

        print("Message:", example["message"])
        print("Language:", example["language"])
        print("Expected:", actual_label)
        print("Predicted:", predicted_label)
        print("Correct:", is_correct)
        print("------------------------------------------")


# ==========================================
# 8. FINAL RESULTS
# ==========================================

accuracy = (correct / len(multilingual_examples)) * 100

print("\n========== FINAL RESULTS ==========")

print(
    f"Correct predictions: "
    f"{correct}/{len(multilingual_examples)}"
)

print(f"Training accuracy: {accuracy:.2f}%")

print("\nMuRIL trainable parameters:",
      sum(p.numel() for p in muril.parameters() if p.requires_grad))

print("Classifier trainable parameters:",
      sum(p.numel() for p in classifier.parameters() if p.requires_grad))



# 9. Language-wise training accuracy
language_results = {}

for index, example in enumerate(multilingual_examples):

    language = example["language"]

    if language not in language_results:
        language_results[language] = {
            "correct": 0,
            "total": 0
        }

    language_results[language]["total"] += 1

    predicted_label = labels[predictions[index].item()]

    if predicted_label == example["expected"]:
        language_results[language]["correct"] += 1


print("\n========== LANGUAGE-WISE RESULTS ==========")

for language, result in language_results.items():

    accuracy = (
        result["correct"] / result["total"]
    ) * 100

    print(
        f"{language}: "
        f"{result['correct']}/{result['total']} "
        f"({accuracy:.2f}%)"
    )
