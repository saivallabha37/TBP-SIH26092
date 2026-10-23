import re

def extract_purpose(text: str) -> str:
    """Extract a likely purpose using simple keyword rules."""

    text = text.lower()

    if any(word in text for word in [
    "business", "shop", "tailoring", "enterprise",
    "bakery", "salon", "workshop",
    "manufacture", "furniture"
    ]):
        return "business"

    if any(word in text for word in [
        "education", "college", "tuition", "studies"
    ]):
        return "education"

    if any(word in text for word in [
        "farming", "agriculture", "farm", "crop"
    ]):
        return "agriculture"

    return "unknown"


def convert_money(text: str) -> int | None:
    """Convert a supported money expression into rupees."""

    text = text.lower().strip()

    # Remove common currency labels and symbols.
    text = text.replace("₹", "")
    text = re.sub(r"\brs\.?\s*", "", text)
    text = re.sub(r"\s+rupees?$", "", text)

    # Recognize a number, optionally followed by a unit.
    match = re.fullmatch(
        r"\s*(\d[\d,]*(?:\.\d+)?)\s*"
        r"(lakhs?|lacs?|thousand|k)?\s*",
        text,
    )

    if not match:
        return None

    number_text, unit = match.groups()

    # Remove digit-grouping commas, e.g. 2,00,000.
    amount = float(number_text.replace(",", ""))

    if unit in ("lakh", "lakhs", "lac", "lacs"):
        amount *= 100_000
    elif unit in ("thousand", "k"):
        amount *= 1_000

    # This version expects whole-rupee amounts.
    if not amount.is_integer():
        return None

    return int(amount)


def extract_financial_details(text: str) -> dict:
    """Extract project cost and annual family income from a sentence."""

    text = text.lower()

    result = {
        "project_cost": None,
        "annual_family_income": None,
    }

    
    patterns = {
        "project_cost": (
            r"(?:project cost|project costs|project will cost|budget)"
            r"\s*(?:is|of|will be|around|about|approximately)?\s*"
            r"(?:₹|rs\.?\s*)?"
            r"(\d[\d,]*(?:\.\d+)?\s*(?:lakhs?|lacs?|thousand|k)?)"
        ),
        "annual_family_income": (
            r"(?:annual family income|family's annual income|"
            r"family income|annual income|family earns)"
            r"\s*(?:is|of|around|about|approximately)?\s*"
            r"(?:₹|rs\.?\s*)?"
            r"(\d[\d,]*(?:\.\d+)?\s*(?:lakhs?|lacs?|thousand|k)?)"
        ),
    }


    for field, pattern in patterns.items():
        match = re.search(pattern, text)

        if match:
            result[field] = convert_money(match.group(1))

    return result



if __name__ == "__main__":
    examples = [
        "50000",
        "50 thousand",
        "₹2 lakh",
        "3 lakhs",
        "₹2,00,000",
        "Rs. 25000 rupees",
    ]

    for example in examples:
        print(example, "->", convert_money(example))



message = (
    "I want to start a tailoring business. "
    "My project cost is 2 lakh and my annual family income is 3 lakh."
)

print("Purpose:", extract_purpose(message))
print("Financial details:", extract_financial_details(message))
