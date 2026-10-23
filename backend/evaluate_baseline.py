
from evaluation_dataset import examples
from nlp import extract_purpose

correct = 0

for item in examples:
    message = item["message"]
    expected = item["expected"]

    predicted = extract_purpose(message)
    is_correct = predicted == expected

    if is_correct:
        correct += 1

    print(f"\nMessage: {message}")
    print(f"Expected: {expected}")
    print(f"Predicted: {predicted}")
    print(f"Correct: {is_correct}")

accuracy = correct / len(examples) * 100

print("\n--- Baseline Evaluation ---")
print(f"Correct predictions: {correct}/{len(examples)}")
print(f"Accuracy: {accuracy:.1f}%")
