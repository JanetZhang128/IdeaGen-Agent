import os
from fastapi import FastAPI, Depends  # type: ignore
from fastapi.responses import StreamingResponse  # type: ignore
from fastapi_clerk_auth import ClerkConfig, ClerkHTTPBearer, HTTPAuthorizationCredentials  # type: ignore
from openai import OpenAI  # type: ignore

app = FastAPI()

clerk_config = ClerkConfig(jwks_url=os.getenv("CLERK_JWKS_URL"))
clerk_guard = ClerkHTTPBearer(clerk_config)

@app.get("/api")
def idea(creds: HTTPAuthorizationCredentials = Depends(clerk_guard)):
    user_id = creds.decoded["sub"]  # User ID from JWT - available for future use
    # We now know which user is making the request! 
    # You could use user_id to:
    # - Track usage per user
    # - Store generated ideas in a database
    # - Apply user-specific limits or customization
    
    client = OpenAI()
    prompt = [{"role": "user", "content": """Generate a comprehensive business idea for AI Agents. Format your response with clear structure using:

# Main Business Idea Title

## Business Overview
- Brief description of the core concept
- Target market and audience
- Key value proposition

## Market Opportunity
- Market size and potential
- Current problems this solves
- Competitive landscape

## Product/Service Details
- Core features and functionality
- Technology requirements
- Unique selling points

## Business Model
- Revenue streams
- Pricing strategy
- Key partnerships

## Implementation Strategy
- Development phases
- Required resources
- Timeline and milestones

## Financial Projections
- Startup costs
- Revenue projections
- Break-even analysis

## Risk Assessment
- Potential challenges
- Mitigation strategies
- Success metrics

Make it engaging, practical, and well-structured with clear headings and bullet points for easy scanning."""}]
    stream = client.chat.completions.create(model="gpt-5-nano", messages=prompt, stream=True)

    def event_stream():
        for chunk in stream:
            text = chunk.choices[0].delta.content
            if text:
                lines = text.split("\n")
                for line in lines[:-1]:
                    yield f"data: {line}\n\n"
                    yield "data:  \n"
                yield f"data: {lines[-1]}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")