
from transformers import pipeline
from evaluation_dataset import examples

print("Loading pretrained model...")

classifier = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli"
)

candidate_labels = [
    "business or starting an enterprise",
    "education or paying for studies",
    "agriculture or farming"
]

label_mapping = {
    "business or starting an enterprise": "business",
    "education or paying for studies": "education",
    "agriculture or farming": "agriculture"
}

correct = 0
total = len(examples)

for item in examples:
    message = item["message"]
    expected = item["expected"]

    result = classifier(
        message,
        candidate_labels,
        hypothesis_template="The person's purpose is {}."
    )

    top_label = result["labels"][0]
    confidence = result["scores"][0]

    predicted = label_mapping[top_label]

    # Experimental fallback for unclear messages.
    if confidence < 0.5:
        predicted = "unknown"

    is_correct = predicted == expected

    if is_correct:
        correct += 1

    print("\nMessage:", message)
    print("Expected:", expected)
    print("Predicted:", predicted)
    print("Top score:", round(confidence, 4))
    print("Correct:", is_correct)

accuracy = (correct / total) * 100

print("\n===== ZERO-SHOT EVALUATION =====")
print("Correct predictions:", correct, "/", total)
print("Accuracy:", round(accuracy, 2), "%")
#done