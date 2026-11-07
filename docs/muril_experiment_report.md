# Loan Saathi – MuRIL Multilingual Classification Experiment

## 1. Objective

The objective of this experiment was to investigate whether Google's MuRIL pretrained multilingual encoder could be used to represent beneficiary messages in English, Telugu and Hindi for purpose classification.

The four target categories were:

- Business
- Education
- Agriculture
- Unknown

## 2. Model and Architecture

Base model: `google/muril-base-cased`

Architecture:

1. User message is received.
2. MuRIL tokenizer converts the message into token IDs.
3. Frozen MuRIL encoder generates contextual representations.
4. The first token representation (768 dimensions) is extracted.
5. A linear classification head maps the representation to four output scores.
6. Softmax can be applied to obtain normalized category scores.
7. The highest-scoring category is selected.

MuRIL was kept frozen during this experiment. Only the classification head was trained.

## 3. Dataset

The experimental dataset contained 96 illustrative examples.

| Language | Examples |
| -------- | -------: |
| English  |       32 |
| Telugu   |       32 |
| Hindi    |       32 |
| Total    |       96 |

The dataset was balanced across four purpose categories.

Each category contained 24 examples:

- Business: 24
- Education: 24
- Agriculture: 24
- Unknown: 24

The multilingual examples are initial drafts and require fluent-speaker review, particularly for Telugu and Hindi.

## 4. Training Configuration

- Framework: PyTorch
- Encoder: MuRIL
- Classification head: Linear layer
- Input features: 768
- Output classes: 4
- Loss function: CrossEntropyLoss
- Optimizer: Adam
- Learning rate: 0.001
- Training epochs: 50
- MuRIL trainable parameters: 0
- Classification head trainable parameters: 3,076

## 5. Experimental Results

Observed training results from the recorded run:

Overall training accuracy: 75.00%

Correct predictions: 72 out of 96.

### Language-wise training accuracy

| Language | Correct | Total | Training accuracy |
| -------- | ------: | ----: | ----------------: |
| English  |      28 |    32 |            87.50% |
| Telugu   |      21 |    32 |            65.62% |
| Hindi    |      23 |    32 |            71.88% |

English had the highest observed training accuracy, while Telugu had the lowest.

## 6. Observations

- MuRIL successfully processed messages in all three languages.
- The encoder generated 768-dimensional representations.
- A four-class classification head was successfully implemented.
- The classification head was trained while keeping MuRIL frozen.
- The experiment demonstrated a complete multilingual feature-extraction and classification pipeline.
- Performance differed across languages.

## 7. Limitations

- The dataset contains only 96 examples.
- The Telugu and Hindi examples require fluent-speaker validation.
- The classifier was evaluated on the same examples used for training.
- Therefore, the reported accuracy is training accuracy, not independent test accuracy.
- The classifier was randomly initialized on each execution.
- The first-token representation was used without comparing alternative pooling strategies.
- The experiment does not establish production readiness or real-world eligibility accuracy.

## 8. Future Improvements

1. Expand and validate the multilingual dataset.
2. Create separate training, validation and test datasets.
3. Evaluate using precision, recall and F1-score.
4. Investigate language-wise and category-wise errors.
5. Compare frozen MuRIL with fine-tuned MuRIL.
6. Compare alternative multilingual classification approaches.
7. Save trained model weights and tokenizer configuration.
8. Integrate the validated classifier into the Loan Saathi backend.

## 9. Conclusion

The experiment successfully demonstrated the use of MuRIL as a multilingual text encoder with a trainable four-class classification head.

The observed training accuracy was 75.00% on the 96-example development dataset.

Further dataset validation and independent testing are required before considering this approach for real beneficiary interactions.
