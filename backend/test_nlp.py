from nlp import extract_purpose, extract_financial_details


def test_business_purpose():
    assert extract_purpose("I want to open a tailoring shop") == "business"


def test_education_purpose():
    assert extract_purpose("I need an education loan") == "education"


def test_budget_and_family_earnings():
    message = (
        "I want to open a tailoring shop with a budget of 2 lakh. "
        "My family earns 3 lakh per year."
    )

    result = extract_financial_details(message)

    assert result["project_cost"] == 200000
    assert result["annual_family_income"] == 300000


def test_missing_financial_details():
    result = extract_financial_details("I need financial help")

    assert result["project_cost"] is None
    assert result["annual_family_income"] is None

    
def test_bakery_purpose_current_behavior():
    assert extract_purpose("I want to open a bakery") == "business"


def test_daughters_college_fees():
    assert extract_purpose(
        "I need money for my daughter's college fees"
    ) == "education"


def test_decimal_lakh_budget():
    message = "My budget is 2.5 lakh"
    result = extract_financial_details(message)

    assert result["project_cost"] == 250000
