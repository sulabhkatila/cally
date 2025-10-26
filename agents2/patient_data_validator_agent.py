"""
Patient Data Validator Agent

This agent compares two sets of patient information (source input and possible output)
to determine:
1. If they correspond to the same patient
2. What data points are available in each set
3. Which data points from possible output can be derived from the source input
"""

import os
from datetime import datetime, timezone
from typing import Dict, List

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
    "temperature": 0.1,  # Lower temperature for more precise, consistent analysis
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 4096,
}

# Create agent
agent = Agent(
    name="patient_data_validator",
    seed="PatientDataValidator2024!",  # Unique seed phrase
    port=8002,
    mailbox=True,  # Required for Agentverse deployment
)

# Initialize chat protocol
chat_proto = Protocol(spec=chat_protocol_spec)

# System prompt for patient data validation
SYSTEM_PROMPT = """You are a specialized Patient Data Validation Agent for clinical trials.

Your expertise includes:
- Patient identification verification
- Data mapping and cross-referencing
- Clinical trial data validation
- Medical history analysis
- Demographic data verification
- Progress tracking validation

When analyzing patient data, you should:

1. **Patient Matching**:
   - Compare patient identifiers (patient ID, initials, DOB, etc.)
   - Verify if source input and possible output refer to the same patient
   - Identify key matching criteria

2. **Data Point Extraction**:
   - Extract all data points from source input
   - Extract all data points from possible output
   - Categorize data points (demographics, medical history, lab results, etc.)

3. **Derivability Analysis**:
   - Determine which data points from possible output can be derived from source input
   - Identify data points that require additional information
   - Flag inconsistencies or discrepancies

Provide clear, structured, and accurate analysis using clinical trial terminology."""


# Helper function to create text chat messages
def create_text_chat(text: str) -> ChatMessage:
    """Create a ChatMessage with TextContent"""
    return ChatMessage(content=[TextContent(text=text, type="text")])


def analyze_patient_data(source_input: str, possible_output: str) -> Dict:
    """
    Analyze patient data to determine derivability

    Args:
        source_input: Available patient information
        possible_output: Target patient information to validate

    Returns:
        Dictionary with analysis results
    """

    analysis_prompt = f"""Please analyze the following patient data to determine:

1. **Patient Matching**: Do these two datasets refer to the same patient?
2. **Data Point Mapping**: What data points are available in each dataset?
3. **Derivability Analysis**: Which data points from possible_output can be derived from source_input?

**Source Input (Available Information):**
{source_input}

**Possible Output (Target Information):**
{possible_output}

Please provide a structured analysis with the following sections:

## 1. Patient Matching
- Do the datasets refer to the same patient? (Yes/No)
- Matching criteria found:
- Identifiers present:
- Confidence level:

## 2. Data Point Inventory

### Source Input Data Points:
List all data points available in source_input, categorized as:
- Demographics
- Medical History
- Lab Results
- Vital Signs
- Progress/Follow-up
- Other

### Possible Output Data Points:
List all data points in possible_output, categorized the same way.

## 3. Derivability Analysis

For each data point in possible_output:
- Can it be derived from source_input? (Yes/No/Partially)
- Reasoning:
- Required additional information (if applicable):

## 4. Summary

- Total data points in source_input: 
- Total data points in possible_output: 
- Derivable data points: 
- Non-derivable data points: 
- Additional information needed: 

Please be specific and detailed in your analysis."""

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
    ctx.logger.info("🔬 Starting Patient Data Validator Agent...")
    ctx.logger.info(f"📍 Agent address: {agent.address}")

    if gemini_api_key:
        ctx.logger.info("✅ Gemini API configured")
    else:
        ctx.logger.error("❌ Gemini API key not set")

    # Initialize storage
    ctx.storage.set("total_validations", 0)
    ctx.storage.set("validation_history", [])


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

        response_text = ""

        # Check if message contains the required format for data validation
        # Expected format: structured JSON or clear text sections

        # Check if it looks like a data validation request
        has_source_keywords = any(
            keyword in user_text.lower()
            for keyword in [
                "source input",
                "source_input",
                "source data",
                "available information",
                "input data",
            ]
        )
        has_output_keywords = any(
            keyword in user_text.lower()
            for keyword in [
                "possible output",
                "possible_output",
                "target",
                "output data",
                "validate",
            ]
        )

        if has_source_keywords or has_output_keywords:
            # Try to parse the input to extract source and possible output
            ctx.logger.info("🔍 Detected data validation request")

            await ctx.send(
                sender, create_text_chat("🔬 Analyzing patient data for validation...")
            )

            # Simple parsing: look for common delimiters
            if (
                "SOURCE INPUT:" in user_text
                or "source input:" in user_text
                or "=====SOURCE" in user_text
            ):
                # Try to parse structured format
                parts = user_text.split("POSSIBLE OUTPUT:")
                if len(parts) == 2:
                    source_input = parts[0].replace("SOURCE INPUT:", "").strip()
                    possible_output = parts[1].strip()
                else:
                    parts = user_text.split("=====POSSIBLE OUTPUT")
                    if len(parts) == 2:
                        source_input = (
                            parts[0]
                            .replace("=====SOURCE INPUT", "")
                            .replace("SOURCE INPUT:", "")
                            .strip()
                        )
                        possible_output = parts[1].strip()
                    else:
                        # If no clear delimiter, use the entire message for both
                        source_input = user_text
                        possible_output = user_text
            else:
                # Treat entire message as input, ask AI to analyze patterns
                source_input = user_text
                possible_output = user_text

            # Analyze with Gemini
            result = analyze_patient_data(source_input, possible_output)

            if result["success"]:
                response_text = (
                    f"# Patient Data Validation Analysis\n\n{result['analysis']}"
                )

                # Store the validation
                history = ctx.storage.get("validation_history") or []
                history.append(
                    {
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "sender": sender,
                        "status": "validated",
                    }
                )
                ctx.storage.set("validation_history", history[-10:])  # Keep last 10

                total = ctx.storage.get("total_validations") or 0
                ctx.storage.set("total_validations", total + 1)
            else:
                response_text = f"Error analyzing patient data: {result['error']}"
        else:
            # Regular chat message - provide guidance
            conversations = ctx.storage.get("conversations") or {}
            history = conversations.get(sender, [])

            # Build context
            conversation_context = ""
            if history:
                for h in history[-3:]:  # Last 3 exchanges
                    role = "User" if h["role"] == "user" else "Assistant"
                    conversation_context += f"{role}: {h['text'][:500]}\n"

            # Create a contextual prompt
            guidance_prompt = f"""{SYSTEM_PROMPT}

You are helping with patient data validation. {conversation_context}

User Input: {user_text}

Provide helpful guidance on how to use this agent for patient data validation:"""

            # Generate response from Gemini
            ctx.logger.info("🤔 Generating contextual response...")
            response = client.models.generate_content(
                model=MODEL_NAME, contents=guidance_prompt, config=GENERATION_CONFIG
            )
            response_text = response.text

            # Update conversation history
            history.append({"role": "user", "text": user_text})
            history.append({"role": "model", "text": response_text})
            conversations[sender] = history[-10:]
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
    print("🔬 Starting Patient Data Validator Agent...")
    print(f"📍 Agent address: {agent.address}")

    if gemini_api_key:
        print("✅ Gemini API configured")
    else:
        print("❌ ERROR: GEMINI_API_KEY not set")
        print("   Please add it to your .env file")
        exit(1)

    print("\n🎯 Agent Features:")
    print("   • Patient data validation")
    print("   • Patient matching verification")
    print("   • Data point extraction and mapping")
    print("   • Derivability analysis")
    print("   • Clinical trial data validation")

    print("\n💡 Usage:")
    print("   Format your message with:")
    print("   SOURCE INPUT:")
    print("   [Your available patient information]")
    print("   ")
    print("   POSSIBLE OUTPUT:")
    print("   [Your target patient information to validate]")

    print("\n✅ Agent is running! Press Ctrl+C to stop.\n")

    agent.run()
