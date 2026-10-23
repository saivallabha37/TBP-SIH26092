
# Loan Saathi: NLP evaluation dataset
# Each message has a human-defined expected purpose label.

examples = [
    # Business
    {
        "message": "I want to open a bakery",
        "expected": "business",
    },
    {
        "message": "I need money to start a tailoring shop",
        "expected": "business",
    },
    {
        "message": "I want to manufacture furniture",
        "expected": "business",
    },
    {
        "message": "I want to open a beauty salon",
        "expected": "business",
    },

    # Education
    {
        "message": "I need a loan for college fees",
        "expected": "education",
    },
    {
        "message": "Help me pay my university tuition",
        "expected": "education",
    },
    {
        "message": "I want to continue my studies",
        "expected": "education",
    },
    {
        "message": "I need money for my daughter's college",
        "expected": "education",
    },

    # Agriculture
    {
        "message": "I need a loan to grow vegetables on my farm",
        "expected": "agriculture",
    },
    {
        "message": "I want to buy seeds for my crops",
        "expected": "agriculture",
    },
    {
        "message": "I need money for farming equipment",
        "expected": "agriculture",
    },

    # Unknown / unclear purpose
    {
        "message": "I need financial help",
        "expected": "unknown",
    },
]
