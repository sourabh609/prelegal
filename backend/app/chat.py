"""AI chat endpoint — uses OpenRouter with structured output to populate NDA fields."""

import json
import os
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from openai import AsyncOpenAI
from pydantic import BaseModel

from .auth import decode_token

router = APIRouter(prefix="/api")
bearer = HTTPBearer()

client = AsyncOpenAI(
    api_key=os.environ.get("OPENROUTER_API_KEY", ""),
    base_url="https://openrouter.ai/api/v1",
)

MODEL = "openai/gpt-oss-120b"

SYSTEM_PROMPT = """You are a helpful legal assistant guiding a user through filling out a Mutual Non-Disclosure Agreement (Mutual NDA).

Your job is to have a friendly, conversational chat to collect the key information needed for the agreement. Focus on these fields in roughly this order:
1. The purpose of the NDA (what the parties are evaluating or working on together)
2. Party 1: company name, representative name and title, contact address
3. Party 2: company name, representative name and title, contact address
4. Effective date (when the NDA starts)
5. Ask briefly about term length and confidentiality period only if needed

Keep your questions short and natural. Ask one or two questions at a time. When you learn information, acknowledge it and move on to what's still missing.

As you learn information from the conversation, extract it into the structured fields. Use null for fields you don't know yet. Always return ALL fields in the JSON, even if most are null.

Field reference:
- purpose: string (how confidential information may be used)
- effectiveDate: string in YYYY-MM-DD format
- mndaTermType: "expires" or "until_terminated"
- mndaTermYears: string number (only relevant if mndaTermType is "expires")
- confidentialityTermType: "expires" or "perpetuity"
- confidentialityTermYears: string number (only relevant if confidentialityTermType is "expires")
- governingLaw: string (state name, e.g. "Delaware")
- jurisdiction: string (city/county and state, e.g. "New Castle, Delaware")
- modifications: string (any modifications to standard terms, or empty string)
- party1Name, party1Title, party1Company, party1Address: strings
- party2Name, party2Title, party2Company, party2Address: strings

Return your response as JSON with exactly two keys:
- "reply": your conversational message to the user
- "fields": an object with all 17 field names above, each set to the extracted value or null if unknown
"""

RESPONSE_SCHEMA = {
    "type": "json_schema",
    "json_schema": {
        "name": "chat_response",
        "strict": True,
        "schema": {
            "type": "object",
            "properties": {
                "reply": {"type": "string"},
                "fields": {
                    "type": "object",
                    "properties": {
                        "purpose": {"type": ["string", "null"]},
                        "effectiveDate": {"type": ["string", "null"]},
                        "mndaTermType": {"type": ["string", "null"]},
                        "mndaTermYears": {"type": ["string", "null"]},
                        "confidentialityTermType": {"type": ["string", "null"]},
                        "confidentialityTermYears": {"type": ["string", "null"]},
                        "governingLaw": {"type": ["string", "null"]},
                        "jurisdiction": {"type": ["string", "null"]},
                        "modifications": {"type": ["string", "null"]},
                        "party1Name": {"type": ["string", "null"]},
                        "party1Title": {"type": ["string", "null"]},
                        "party1Company": {"type": ["string", "null"]},
                        "party1Address": {"type": ["string", "null"]},
                        "party2Name": {"type": ["string", "null"]},
                        "party2Title": {"type": ["string", "null"]},
                        "party2Company": {"type": ["string", "null"]},
                        "party2Address": {"type": ["string", "null"]},
                    },
                    "required": [
                        "purpose", "effectiveDate", "mndaTermType", "mndaTermYears",
                        "confidentialityTermType", "confidentialityTermYears",
                        "governingLaw", "jurisdiction", "modifications",
                        "party1Name", "party1Title", "party1Company", "party1Address",
                        "party2Name", "party2Title", "party2Company", "party2Address",
                    ],
                    "additionalProperties": False,
                },
            },
            "required": ["reply", "fields"],
            "additionalProperties": False,
        },
    },
}


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]


class FieldValues(BaseModel):
    purpose: Optional[str] = None
    effectiveDate: Optional[str] = None
    mndaTermType: Optional[str] = None
    mndaTermYears: Optional[str] = None
    confidentialityTermType: Optional[str] = None
    confidentialityTermYears: Optional[str] = None
    governingLaw: Optional[str] = None
    jurisdiction: Optional[str] = None
    modifications: Optional[str] = None
    party1Name: Optional[str] = None
    party1Title: Optional[str] = None
    party1Company: Optional[str] = None
    party1Address: Optional[str] = None
    party2Name: Optional[str] = None
    party2Title: Optional[str] = None
    party2Company: Optional[str] = None
    party2Address: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    fields: FieldValues


@router.post("/chat", response_model=ChatResponse)
async def chat(
    body: ChatRequest,
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
):
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages += [{"role": m.role, "content": m.content} for m in body.messages]

    completion = await client.chat.completions.create(
        model=MODEL,
        messages=messages,
        response_format=RESPONSE_SCHEMA,
    )

    content = completion.choices[0].message.content
    if not content:
        raise HTTPException(status_code=502, detail="Empty response from AI model")
    raw = json.loads(content)
    return ChatResponse(
        reply=raw["reply"],
        fields=FieldValues(**raw["fields"]),
    )
