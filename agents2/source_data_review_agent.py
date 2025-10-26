"""
Source Data Review Agent

This agent performs comprehensive review of source data in clinical trials to:
1. Validate data completeness and accuracy
2. Identify data quality issues and inconsistencies
3. Review compliance with protocol requirements
4. Generate detailed review reports
5. Flag potential data integrity concerns
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
    name="source_data_review",
    seed="SourceDataReview2024!",  # Unique seed phrase
    port=8003,
    mailbox=True,  # Required for Agentverse deployment
)

# Initialize chat protocol
chat_proto = Protocol(spec=chat_protocol_spec)

# System prompt for source data review
SYSTEM_PROMPT = """You are a specialized Source Data Review Agent for clinical trials.

Your expertise includes:
- Source data validation and verification
- Data quality assessment and improvement
- Protocol compliance review
- Clinical trial data integrity analysis
- Regulatory requirement validation
- Data completeness and accuracy review

You can handle 4 types of requests:
1. **Data Quality Review**: Comprehensive assessment of data quality, completeness, and accuracy
2. **Protocol Compliance Review**: Verify data adherence to study protocol requirements
3. **Data Integrity Review**: Identify potential data integrity issues and inconsistencies
4. **Comprehensive Review Report**: Generate detailed review reports with findings and recommendations

For data quality review:
    - You shall be given source data content and quality criteria
    - You shall assess data completeness, accuracy, consistency, and validity
    - The return value should be a JSON dictionary with quality metrics and issues

For protocol compliance review:
    - You shall be given source data and protocol requirements
    - You shall verify adherence to protocol specifications
    - The return value should be a JSON dictionary with compliance status and violations

For data integrity review:
    - You shall be given source data and integrity criteria
    - You shall identify potential integrity issues and inconsistencies
    - The return value should be a JSON dictionary with integrity findings

For comprehensive review report:
    - You shall be given source data and review parameters
    - You shall generate a detailed report with all findings and recommendations
    - The return value should be a structured report with sections for each review type

Do not include any other text in the return value.
"""


# Helper function to create text chat messages
def create_text_chat(text: str) -> ChatMessage:
    """Create a ChatMessage with TextContent"""
    return ChatMessage(content=[TextContent(text=text, type="text")])


def handle_data_quality_review(source_data: str, quality_criteria: str = None) -> Dict:
    """
    Handle data quality review request

    Args:
        source_data: Source data content to review
        quality_criteria: Optional quality criteria to apply

    Returns:
        Dictionary with quality review results
    """

    quality_prompt = f"""You are a specialized Source Data Review Agent for clinical trials.

You can handle 4 types of requests:
1. **Data Quality Review**: Comprehensive assessment of data quality, completeness, and accuracy
2. **Protocol Compliance Review**: Verify data adherence to study protocol requirements
3. **Data Integrity Review**: Identify potential data integrity issues and inconsistencies
4. **Comprehensive Review Report**: Generate detailed review reports with findings and recommendations

For data quality review:
    - You shall be given source data content and quality criteria
    - You shall assess data completeness, accuracy, consistency, and validity
    - The return value should be a JSON dictionary with quality metrics and issues

Source Data:
{source_data}

Quality Criteria:
{quality_criteria or "Standard clinical trial data quality criteria"}

Please perform a comprehensive data quality review and return the results as a JSON dictionary with the following structure:
{{
    "overall_quality_score": 0-100,
    "completeness_score": 0-100,
    "accuracy_score": 0-100,
    "consistency_score": 0-100,
    "validity_score": 0-100,
    "quality_issues": [
        {{
            "issue_type": "missing_data|inconsistent_data|invalid_data|format_issue",
            "severity": "low|medium|high|critical",
            "description": "Detailed description of the issue",
            "field_affected": "Field or section affected",
            "recommendation": "Recommended action to resolve"
        }}
    ],
    "data_completeness": {{
        "required_fields_present": 0-100,
        "optional_fields_present": 0-100,
        "missing_required_fields": ["field1", "field2"],
        "missing_optional_fields": ["field1", "field2"]
    }},
    "data_accuracy": {{
        "logical_consistency": 0-100,
        "value_ranges_valid": 0-100,
        "date_consistency": 0-100,
        "cross_field_validation": 0-100
    }},
    "recommendations": [
        "Specific recommendation 1",
        "Specific recommendation 2"
    ]
}}

Do not include any other text in the return value."""

    try:
        response = client.models.generate_content(
            model=MODEL_NAME, contents=quality_prompt, config=GENERATION_CONFIG
        )
        return {"success": True, "quality_review": response.text.strip()}
    except Exception as e:
        return {"success": False, "error": str(e), "quality_review": None}


def handle_protocol_compliance_review(
    source_data: str, protocol_requirements: str
) -> Dict:
    """
    Handle protocol compliance review request

    Args:
        source_data: Source data content to review
        protocol_requirements: Protocol requirements to check against

    Returns:
        Dictionary with compliance review results
    """

    compliance_prompt = f"""You are a specialized Source Data Review Agent for clinical trials.

You can handle 4 types of requests:
1. **Data Quality Review**: Comprehensive assessment of data quality, completeness, and accuracy
2. **Protocol Compliance Review**: Verify data adherence to study protocol requirements
3. **Data Integrity Review**: Identify potential data integrity issues and inconsistencies
4. **Comprehensive Review Report**: Generate detailed review reports with findings and recommendations

For protocol compliance review:
    - You shall be given source data and protocol requirements
    - You shall verify adherence to protocol specifications
    - The return value should be a JSON dictionary with compliance status and violations

Source Data:
{source_data}

Protocol Requirements:
{protocol_requirements}

Please perform a protocol compliance review and return the results as a JSON dictionary with the following structure:
{{
    "overall_compliance_score": 0-100,
    "compliance_status": "compliant|non_compliant|partially_compliant",
    "protocol_adherence": {{
        "inclusion_criteria_met": true/false,
        "exclusion_criteria_violated": true/false,
        "visit_schedule_adherence": 0-100,
        "data_collection_timeliness": 0-100,
        "required_assessments_completed": 0-100
    }},
    "violations": [
        {{
            "violation_type": "inclusion_criteria|exclusion_criteria|visit_timing|data_collection|assessment_missing",
            "severity": "low|medium|high|critical",
            "description": "Detailed description of the violation",
            "protocol_section": "Relevant protocol section",
            "corrective_action": "Required corrective action"
        }}
    ],
    "missing_requirements": [
        {{
            "requirement_type": "visit|assessment|data_point|documentation",
            "description": "Missing requirement description",
            "protocol_reference": "Protocol section reference",
            "impact": "Impact on study integrity"
        }}
    ],
    "recommendations": [
        "Specific compliance recommendation 1",
        "Specific compliance recommendation 2"
    ]
}}

Do not include any other text in the return value."""

    try:
        response = client.models.generate_content(
            model=MODEL_NAME, contents=compliance_prompt, config=GENERATION_CONFIG
        )
        return {"success": True, "compliance_review": response.text.strip()}
    except Exception as e:
        return {"success": False, "error": str(e), "compliance_review": None}


def handle_data_integrity_review(
    source_data: str, integrity_criteria: str = None
) -> Dict:
    """
    Handle data integrity review request

    Args:
        source_data: Source data content to review
        integrity_criteria: Optional integrity criteria to apply

    Returns:
        Dictionary with integrity review results
    """

    integrity_prompt = f"""You are a specialized Source Data Review Agent for clinical trials.

You can handle 4 types of requests:
1. **Data Quality Review**: Comprehensive assessment of data quality, completeness, and accuracy
2. **Protocol Compliance Review**: Verify data adherence to study protocol requirements
3. **Data Integrity Review**: Identify potential data integrity issues and inconsistencies
4. **Comprehensive Review Report**: Generate detailed review reports with findings and recommendations

For data integrity review:
    - You shall be given source data and integrity criteria
    - You shall identify potential integrity issues and inconsistencies
    - The return value should be a JSON dictionary with integrity findings

Source Data:
{source_data}

Integrity Criteria:
{integrity_criteria or "Standard clinical trial data integrity criteria"}

Please perform a data integrity review and return the results as a JSON dictionary with the following structure:
{{
    "overall_integrity_score": 0-100,
    "integrity_status": "intact|compromised|questionable",
    "integrity_issues": [
        {{
            "issue_type": "data_manipulation|unauthorized_changes|missing_audit_trail|inconsistent_timestamps|suspicious_patterns",
            "severity": "low|medium|high|critical",
            "description": "Detailed description of the integrity issue",
            "affected_data": "Specific data elements affected",
            "evidence": "Evidence supporting the finding",
            "recommendation": "Recommended investigation or action"
        }}
    ],
    "audit_trail_analysis": {{
        "timestamps_consistent": true/false,
        "user_actions_logged": true/false,
        "data_modifications_tracked": true/false,
        "suspicious_activity_detected": true/false
    }},
    "data_lineage": {{
        "source_traceability": 0-100,
        "transformation_integrity": 0-100,
        "version_control": 0-100
    }},
    "recommendations": [
        "Specific integrity recommendation 1",
        "Specific integrity recommendation 2"
    ]
}}

Do not include any other text in the return value."""

    try:
        response = client.models.generate_content(
            model=MODEL_NAME, contents=integrity_prompt, config=GENERATION_CONFIG
        )
        return {"success": True, "integrity_review": response.text.strip()}
    except Exception as e:
        return {"success": False, "error": str(e), "integrity_review": None}


def handle_comprehensive_review_report(
    source_data: str, review_parameters: str = None
) -> Dict:
    """
    Handle comprehensive review report request

    Args:
        source_data: Source data content to review
        review_parameters: Optional parameters for the review

    Returns:
        Dictionary with comprehensive review report
    """

    comprehensive_prompt = f"""You are a specialized Source Data Review Agent for clinical trials.

You can handle 4 types of requests:
1. **Data Quality Review**: Comprehensive assessment of data quality, completeness, and accuracy
2. **Protocol Compliance Review**: Verify data adherence to study protocol requirements
3. **Data Integrity Review**: Identify potential data integrity issues and inconsistencies
4. **Comprehensive Review Report**: Generate detailed review reports with findings and recommendations

For comprehensive review report:
    - You shall be given source data and review parameters
    - You shall generate a detailed report with all findings and recommendations
    - The return value should be a structured report with sections for each review type

Source Data:
{source_data}

Review Parameters:
{review_parameters or "Standard comprehensive review parameters"}

Please generate a comprehensive review report and return it as a structured report with the following sections:

# SOURCE DATA REVIEW REPORT

## EXECUTIVE SUMMARY
- Overall assessment score: 0-100
- Key findings summary
- Critical issues identified
- Recommendations priority

## DATA QUALITY ASSESSMENT
- Completeness analysis
- Accuracy evaluation
- Consistency review
- Validity assessment
- Quality issues identified

## PROTOCOL COMPLIANCE REVIEW
- Compliance status
- Protocol adherence metrics
- Violations identified
- Missing requirements

## DATA INTEGRITY ANALYSIS
- Integrity status
- Audit trail analysis
- Data lineage review
- Integrity issues found

## DETAILED FINDINGS
- Issue-by-issue breakdown
- Severity assessment
- Impact analysis
- Evidence provided

## RECOMMENDATIONS
- Immediate actions required
- Short-term improvements
- Long-term enhancements
- Process improvements

## APPENDICES
- Detailed metrics
- Supporting evidence
- Reference materials

Do not include any other text in the return value."""

    try:
        response = client.models.generate_content(
            model=MODEL_NAME, contents=comprehensive_prompt, config=GENERATION_CONFIG
        )
        return {"success": True, "comprehensive_report": response.text.strip()}
    except Exception as e:
        return {"success": False, "error": str(e), "comprehensive_report": None}


def detect_review_request_type(user_text: str) -> str:
    """
    Detect the type of review request based on user input

    Args:
        user_text: User input text

    Returns:
        Request type: 'data_quality', 'protocol_compliance', 'data_integrity', 'comprehensive_report', or 'unknown'
    """
    user_text_lower = user_text.lower()

    # Check for data quality review request
    if any(
        keyword in user_text_lower
        for keyword in [
            "data quality",
            "quality review",
            "quality assessment",
            "data completeness",
            "data accuracy",
        ]
    ):
        return "data_quality"

    # Check for protocol compliance review request
    if any(
        keyword in user_text_lower
        for keyword in [
            "protocol compliance",
            "compliance review",
            "protocol adherence",
            "protocol requirements",
        ]
    ):
        return "protocol_compliance"

    # Check for data integrity review request
    if any(
        keyword in user_text_lower
        for keyword in [
            "data integrity",
            "integrity review",
            "data integrity analysis",
            "audit trail",
        ]
    ):
        return "data_integrity"

    # Check for comprehensive review report request
    if any(
        keyword in user_text_lower
        for keyword in [
            "comprehensive review",
            "review report",
            "full review",
            "complete assessment",
        ]
    ):
        return "comprehensive_report"

    return "unknown"


def parse_review_request(user_text: str) -> tuple:
    """
    Parse review request to extract source data and additional parameters

    Args:
        user_text: User input text

    Returns:
        Tuple of (source_data, additional_params) or (None, None) if parsing fails
    """
    import re

    try:
        # Look for source data markers
        data_markers = ["source data:", "data:", "source:", "content:", "file content:"]

        source_data = None
        for marker in data_markers:
            if marker in user_text.lower():
                parts = user_text.split(marker, 1)
                if len(parts) > 1:
                    source_data = parts[1].strip()
                    break

        # If no markers found, try to find data in structured format
        if not source_data:
            # Look for data between common delimiters
            data_match = re.search(
                r"(?:data|source|content)[^:]*:?\s*([^\n\r]+(?:\n(?!protocol|criteria|requirements)[^\n\r]+)*)",
                user_text,
                re.IGNORECASE | re.DOTALL,
            )
            if data_match:
                source_data = data_match.group(1).strip()

        # Look for additional parameters
        additional_params = None
        param_markers = [
            "protocol requirements:",
            "quality criteria:",
            "integrity criteria:",
            "review parameters:",
        ]

        for marker in param_markers:
            if marker in user_text.lower():
                parts = user_text.split(marker, 1)
                if len(parts) > 1:
                    additional_params = parts[1].strip()
                    break

        return source_data or user_text, additional_params
    except Exception as e:
        return user_text, None


@agent.on_event("startup")
async def startup(ctx: Context):
    """Initialize agent on startup"""
    ctx.logger.info("🔍 Starting Source Data Review Agent...")
    ctx.logger.info(f"📍 Agent address: {agent.address}")

    if gemini_api_key:
        ctx.logger.info("✅ Gemini API configured")
    else:
        ctx.logger.error("❌ Gemini API key not set")

    # Initialize storage
    ctx.storage.set("total_reviews", 0)
    ctx.storage.set("review_history", [])


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

        # Detect the type of review request
        request_type = detect_review_request_type(user_text)
        ctx.logger.info(f"🔍 Detected review request type: {request_type}")

        if request_type == "data_quality":
            # Handle data quality review request
            ctx.logger.info("📊 Processing data quality review request")
            await ctx.send(sender, create_text_chat("🔍 Analyzing data quality..."))

            source_data, quality_criteria = parse_review_request(user_text)
            result = handle_data_quality_review(source_data, quality_criteria)

            if result["success"]:
                response_text = result["quality_review"]
            else:
                response_text = f"Error reviewing data quality: {result['error']}"

        elif request_type == "protocol_compliance":
            # Handle protocol compliance review request
            ctx.logger.info("📋 Processing protocol compliance review request")
            await ctx.send(
                sender, create_text_chat("📋 Checking protocol compliance...")
            )

            source_data, protocol_requirements = parse_review_request(user_text)
            if protocol_requirements:
                result = handle_protocol_compliance_review(
                    source_data, protocol_requirements
                )
                if result["success"]:
                    response_text = result["compliance_review"]
                else:
                    response_text = (
                        f"Error reviewing protocol compliance: {result['error']}"
                    )
            else:
                response_text = (
                    "Error: Protocol requirements not specified for compliance review"
                )

        elif request_type == "data_integrity":
            # Handle data integrity review request
            ctx.logger.info("🔒 Processing data integrity review request")
            await ctx.send(sender, create_text_chat("🔒 Analyzing data integrity..."))

            source_data, integrity_criteria = parse_review_request(user_text)
            result = handle_data_integrity_review(source_data, integrity_criteria)

            if result["success"]:
                response_text = result["integrity_review"]
            else:
                response_text = f"Error reviewing data integrity: {result['error']}"

        elif request_type == "comprehensive_report":
            # Handle comprehensive review report request
            ctx.logger.info("📄 Processing comprehensive review report request")
            await ctx.send(
                sender, create_text_chat("📄 Generating comprehensive review report...")
            )

            source_data, review_parameters = parse_review_request(user_text)
            result = handle_comprehensive_review_report(source_data, review_parameters)

            if result["success"]:
                response_text = result["comprehensive_report"]
            else:
                response_text = (
                    f"Error generating comprehensive report: {result['error']}"
                )

        else:
            # Unknown request type - provide guidance
            ctx.logger.info("❓ Unknown request type, providing guidance")
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

You are helping with source data review. {conversation_context}

User Input: {user_text}

Provide helpful guidance on how to use this agent for source data review. The agent can handle 4 types of requests:
1. Data Quality Review
2. Protocol Compliance Review
3. Data Integrity Review
4. Comprehensive Review Report

Please provide specific guidance based on the user's input."""

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

        # Store the request in history
        if request_type != "unknown":
            history = ctx.storage.get("review_history") or []
            history.append(
                {
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "sender": sender,
                    "request_type": request_type,
                    "status": "processed",
                }
            )
            ctx.storage.set("review_history", history[-10:])  # Keep last 10

            total = ctx.storage.get("total_reviews") or 0
            ctx.storage.set("total_reviews", total + 1)

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
    print("🔍 Starting Source Data Review Agent...")
    print(f"📍 Agent address: {agent.address}")

    if gemini_api_key:
        print("✅ Gemini API configured")
    else:
        print("❌ ERROR: GEMINI_API_KEY not set")
        print("   Please add it to your .env file")
        exit(1)

    print("\n🎯 Agent Features:")
    print("   • Data Quality Review: Comprehensive quality assessment")
    print("   • Protocol Compliance Review: Verify protocol adherence")
    print("   • Data Integrity Review: Identify integrity issues")
    print("   • Comprehensive Review Report: Detailed analysis reports")
    print("   • Clinical trial data validation")

    print("\n💡 Usage Examples:")
    print("   1. Data Quality Review:")
    print("      'Data quality review: Source data: [data content]'")
    print("   ")
    print("   2. Protocol Compliance Review:")
    print(
        "      'Protocol compliance review: Source data: [data] Protocol requirements: [requirements]'"
    )
    print("   ")
    print("   3. Data Integrity Review:")
    print("      'Data integrity review: Source data: [data content]'")
    print("   ")
    print("   4. Comprehensive Review Report:")
    print("      'Comprehensive review report: Source data: [data content]'")

    print("\n✅ Agent is running! Press Ctrl+C to stop.\n")

    agent.run()
