
from fastapi import FastAPI
from pydantic import BaseModel, Field
from nlp import extract_purpose, extract_financial_details

app = FastAPI(title="Loan Saathi API")


class BeneficiaryProfile(BaseModel):
    purpose: str = Field(min_length=1)
    project_cost: float = Field(gt=0)
    annual_family_income: float = Field(ge=0)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "application": "Loan Saathi"
    }


@app.post("/profile")
def receive_profile(profile: BeneficiaryProfile):
    return {
        "message": "Profile received successfully",
        "profile": profile.model_dump()
    }


class MessageRequest(BaseModel):
    message: str = Field(min_length=1)


@app.post("/extract-profile")
def extract_profile(request: MessageRequest):
    message = request.message

    return {
        "purpose": extract_purpose(message),
        **extract_financial_details(message),
    }
