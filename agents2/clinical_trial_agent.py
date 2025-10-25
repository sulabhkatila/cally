import os
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional

from dotenv import load_dotenv
from google import genai
from uagents import Agent, Context, Protocol
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    TextContent,
    chat_protocol_spec,
)

# Load environment variables
load_dotenv()

# Configure Gemini
gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

# Initialize Gemini client
client = genai.Client(api_key=gemini_api_key)

# Model configuration
MODEL_NAME = "gemini-2.5-flash"
GENERATION_CONFIG = {
    "temperature": 0.3,  # Lower temperature for more factual, structured responses
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 4096,  # Increased for detailed clinical trial analysis
}

# Create agent
agent = Agent(
    name="clinical_trial_analyzer",
    seed="ClinicalTrialsR0ck!",  # Unique seed phrase for this agent
    port=8001,
    mailbox=True,  # Required for Agentverse deployment
)

# Initialize chat protocol
chat_proto = Protocol(spec=chat_protocol_spec)

# System prompt for clinical trial analysis
SYSTEM_PROMPT = """You are a specialized Clinical Trial Protocol Analyzer powered by Google Gemini.

Your expertise includes:
- Clinical trial design and methodology
- Protocol structure and documentation
- Regulatory compliance (FDA, ICH-GCP guidelines)
- Source Data Verification (SDV) processes
- Monitoring schedules and requirements
- Endpoint definitions and efficacy measures
- Eligibility criteria and patient selection
- Adverse event monitoring
- Statistical analysis plans

When analyzing clinical trial protocol text, you should:
1. Extract and summarize the trial objectives and primary/secondary endpoints
2. Identify the monitoring schedule and frequency
3. Extract eligibility criteria (inclusion and exclusion)
4. Understand the study design and methodology
5. Identify key personnel (Principal Investigators, sites, etc.)
6. Extract timelines and visit schedules
7. Understand the data collection and verification process
8. Identify safety monitoring requirements
9. Extract statistical analysis plans
10. Note any special considerations or procedures

Provide structured, detailed, and accurate information. Use clinical trial terminology correctly."""


# Helper function to create text chat messages
def create_text_chat(text: str) -> ChatMessage:
    """Create a ChatMessage with TextContent"""
    return ChatMessage(content=[TextContent(text=text, type="text")])


def analyze_clinical_trial_text(
    protocol_text: str, text_label: str = "clinical trial protocol"
) -> Dict:
    """Use Gemini to analyze clinical trial protocol text"""

    analysis_prompt = f"""Please analyze this {text_label} and extract the following structured information:

1. **Trial Overview**
   - Protocol title/name
   - Protocol number
   - Study phase
   - Trial type (interventional, observational, etc.)

2. **Primary Objectives and Endpoints**
   - Primary objectives
   - Primary endpoints and how they're measured
   - Secondary endpoints

3. **Trial Design**
   - Study design description
   - Randomization (if applicable)
   - Blinding (if applicable)
   - Sample size

4. **Eligibility Criteria**
   - Inclusion criteria (detailed list)
   - Exclusion criteria (detailed list)

5. **Monitoring and SDV Requirements**
   - Monitoring schedule and frequency
   - Site visit schedule
   - Source Data Verification (SDV) requirements
   - What data points need verification
   - Frequency of monitoring visits

6. **Key Personnel and Sites**
   - Principal Investigators
   - Study sites
   - Sponsor information

7. **Timeline and Visit Schedule**
   - Visit schedule
   - Key milestones
   - Duration of participation

8. **Safety Monitoring**
   - Safety endpoints
   - Adverse event monitoring
   - Data Safety Monitoring Board (DSMB) requirements

9. **Statistical Analysis Plan**
   - Statistical methods
   - Primary analysis approach

10. **Other Important Details**
    - Special procedures or considerations
    - Regulatory information

Protocol Text Content:
{protocol_text}

Please provide a comprehensive, structured analysis in clear sections. Be specific and detailed."""

    try:
        response = client.models.generate_content(
            model=MODEL_NAME, contents=analysis_prompt, config=GENERATION_CONFIG
        )

        return {"success": True, "analysis": response.text}
    except Exception as e:
        return {"success": False, "error": str(e), "analysis": None}


@agent.on_event("startup")
async def startup(ctx: Context):
    """Initialize agent on startup"""
    ctx.logger.info("🏥 Starting Clinical Trial Analyzer Agent...")
    ctx.logger.info(f"📍 Agent address: {agent.address}")

    if gemini_api_key:
        ctx.logger.info("✅ Gemini API configured")
    else:
        ctx.logger.error("❌ Gemini API key not set")

    # Initialize storage
    ctx.storage.set("total_analyses", 0)
    ctx.storage.set("processed_documents", {})
    ctx.storage.set("conversations", {})


@chat_proto.on_message(ChatMessage)
async def handle_chat_message(ctx: Context, sender: str, msg: ChatMessage):
    """Handle incoming chat messages"""

    try:
        # Extract text from message content
        user_text = ""
        for item in msg.content:
            if isinstance(item, TextContent):
                user_text = item.text
                break

        if not user_text:
            ctx.logger.warning("No text content in message")
            return

        # Log incoming message
        ctx.logger.info(f"📨 Message from {sender}: {user_text[:100]}...")

        # Send acknowledgement
        await ctx.send(
            sender,
            ChatAcknowledgement(
                timestamp=datetime.now(timezone.utc), acknowledged_msg_id=msg.msg_id
            ),
        )

        # Check if message is a protocol text or a question
        response_text = ""

        # Check if it looks like a protocol (long text, multiple lines)
        lines = user_text.strip().split("\n")
        is_likely_protocol = len(lines) > 10 or len(user_text.strip()) > 500

        if is_likely_protocol:
            # User provided protocol text - analyze it
            ctx.logger.info(f"📄 Analyzing clinical trial protocol text...")

            await ctx.send(
                sender,
                create_text_chat("🤔 Analyzing clinical trial protocol with AI..."),
            )

            # Analyze with Gemini
            result = analyze_clinical_trial_text(user_text, "clinical trial protocol")

            if result["success"]:
                response_text = (
                    f"# Clinical Trial Protocol Analysis\n\n{result['analysis']}"
                )

                # Store the analysis
                processed = ctx.storage.get("processed_documents") or {}
                doc_id = f"doc_{len(processed)}"
                processed[doc_id] = {
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "status": "analyzed",
                    "text_length": len(user_text),
                }
                ctx.storage.set("processed_documents", processed)

                total = ctx.storage.get("total_analyses") or 0
                ctx.storage.set("total_analyses", total + 1)
            else:
                response_text = f"Error analyzing protocol: {result['error']}"
        else:
            # Regular chat message - use contextual responses
            conversations = ctx.storage.get("conversations") or {}
            history = conversations.get(sender, [])

            # Build context
            conversation_context = ""
            if history:
                for h in history[-3:]:  # Last 3 exchanges
                    role = "User" if h["role"] == "user" else "Assistant"
                    conversation_context += f"{role}: {h['text'][:500]}\n"

            # Create a contextual prompt
            full_prompt = f"""{SYSTEM_PROMPT}

You are discussing clinical trial protocols. {conversation_context}

User Question: {user_text}

Provide a helpful, expert answer about clinical trials:"""

            # Generate response from Gemini
            ctx.logger.info("🤔 Generating response with Gemini...")
            response = client.models.generate_content(
                model=MODEL_NAME, contents=full_prompt, config=GENERATION_CONFIG
            )
            response_text = response.text

            # Update conversation history
            history.append({"role": "user", "text": user_text})
            history.append({"role": "model", "text": response_text})
            conversations[sender] = history[-10:]  # Keep last 10 messages
            ctx.storage.set("conversations", conversations)

        ctx.logger.info(f"✅ Response generated")

        # Send response back to user
        await ctx.send(sender, create_text_chat(response_text))
        ctx.logger.info(f"💬 Response sent to {sender}")

    except Exception as e:
        ctx.logger.error(f"❌ Error processing message: {e}")
        import traceback

        ctx.logger.error(traceback.format_exc())

        # Send error message to user
        error_msg = "I'm sorry, I encountered an error processing your request. Please try again."
        await ctx.send(sender, create_text_chat(error_msg))


@chat_proto.on_message(ChatAcknowledgement)
async def handle_acknowledgement(ctx: Context, sender: str, msg: ChatAcknowledgement):
    """Handle message acknowledgements"""
    ctx.logger.debug(f"✓ Message {msg.acknowledged_msg_id} acknowledged by {sender}")


# Include the chat protocol
agent.include(chat_proto, publish_manifest=True)


if __name__ == "__main__":
    print("🏥 Starting Clinical Trial Protocol Analyzer...")
    print(f"📍 Agent address: {agent.address}")

    if gemini_api_key:
        print("✅ Gemini API configured")
    else:
        print("❌ ERROR: GEMINI_API_KEY not set")
        print("   Please add it to your .env file")
        exit(1)

    print("\n🎯 Agent Features:")
    print("   • Clinical trial protocol text analysis")
    print("   • Automatic extraction of key trial information")
    print("   • Understanding of trial objectives, endpoints, and monitoring")
    print("   • Analysis of eligibility criteria")
    print("   • SDV and monitoring schedule extraction")
    print("   • Expert knowledge of clinical trial methodology")
    print("   • Conversational Q&A about clinical trials")

    print("\n💡 Usage:")
    print("   • Paste or send clinical trial protocol text to analyze")
    print("   • Ask questions about clinical trials")
    print("   • Get expert guidance on trial protocols")
    print("\n   Tip: The agent will automatically detect if your message")
    print("   is a protocol (long text) or a question (short text)")

    print(
        "\n✅ Agent is running! Connect via ASI One or send messages programmatically."
    )
    print("   Press Ctrl+C to stop.\n")

    agent.run()
