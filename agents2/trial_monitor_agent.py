"""
TrialMonitor Agent

A comprehensive clinical trial monitoring agent that combines:
1. Source Data Review capabilities
2. Patient Data Validation capabilities
3. File ranking and data extraction
4. Protocol compliance monitoring
5. Data integrity analysis

This unified agent provides complete trial monitoring and validation services.
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
    name="trial_monitor",
    seed="TrialMonitor2024!",  # Unique seed phrase
    port=8004,
    mailbox=True,  # Required for Agentverse deployment
)

# Initialize chat protocol
chat_proto = Protocol(spec=chat_protocol_spec)

# System prompt for TrialMonitor
SYSTEM_PROMPT = """You are a specialized TrialMonitor Agent for clinical trials.

Your expertise includes:
- Source data validation and verification
- Patient data validation and matching
- Data quality assessment and improvement
- Protocol compliance review and monitoring
- Clinical trial data integrity analysis
- File ranking and data extraction
- Regulatory requirement validation
- Comprehensive trial monitoring

You can handle 8 types of requests:

**PATIENT DATA VALIDATION:**
1. **File Ranking Request**: When given a CRF filename and list of eSource filenames, rank the eSource files by likelihood of containing relevant source data.
2. **Data Point Extraction Request**: When given a CRF filename, extract all the data points' keys (not values) from the CRF file.
3. **Data Verification Request**: When given CRF data and eSource data, perform detailed verification analysis.

**SOURCE DATA REVIEW:**
4. **Data Quality Review**: Comprehensive assessment of data quality, completeness, and accuracy
5. **Protocol Compliance Review**: Verify data adherence to study protocol requirements
6. **Data Integrity Review**: Identify potential data integrity issues and inconsistencies
7. **Comprehensive Review Report**: Generate detailed review reports with findings and recommendations

**CLINICAL TRIAL ANALYSIS:**
8. **Clinical Trial Protocol Analysis**: Analyze clinical trial protocol text and extract structured information about objectives, endpoints, eligibility criteria, monitoring requirements, and more
9. **Monitoring Plan Generation**: Generate comprehensive monitoring plans including remote source data verification (SDV) plans based on protocol context

**Response Formats:**
- File Ranking: ["filename1", "filename2", "filename3"]
- Data Point Extraction: ["key1", "key2", "key3"]
- Data Verification: {"verified": true/false, "verified_data_points": [...], "unverified_data_points": [...], "missing_data_points": [...], "discrepancy_data_points": [...], "additional_information_needed": [...]}
- Data Quality Review: {"overall_quality_score": 0-100, "completeness_score": 0-100, "quality_issues": [...], "recommendations": [...]}
- Protocol Compliance: {"overall_compliance_score": 0-100, "compliance_status": "compliant/non_compliant", "violations": [...], "recommendations": [...]}
- Data Integrity: {"overall_integrity_score": 0-100, "integrity_status": "intact/compromised", "integrity_issues": [...], "recommendations": [...]}
- Comprehensive Report: Structured markdown report with executive summary, detailed findings, and recommendations
- Clinical Trial Protocol Analysis: Structured markdown analysis with trial overview, objectives, endpoints, eligibility criteria, monitoring requirements, and more
- Monitoring Plan Generation: Structured markdown monitoring plan with SDV strategy, visit schedules, risk assessment, and implementation guidelines

Do not include any other text in the return value.
"""


# Helper function to create text chat messages
def create_text_chat(text: str) -> ChatMessage:
    """Create a ChatMessage with TextContent"""
    return ChatMessage(content=[TextContent(text=text, type="text")])


# ============================================================================
# PATIENT DATA VALIDATION HANDLERS
# ============================================================================


def handle_file_ranking_request(crf_filename: str, esource_files: list) -> Dict:
    """
    Handle file ranking request - rank eSource files by relevance to CRF file

    Args:
        crf_filename: Name of the CRF file
        esource_files: List of eSource filenames to rank

    Returns:
        Dictionary with ranking results
    """

    ranking_prompt = f"""You are a specialized TrialMonitor Agent for clinical trials.

You can handle 7 types of requests:
1. **File Ranking Request**: When given a CRF filename and list of eSource filenames, rank the eSource files by likelihood of containing relevant source data.
2. **Data Point Extraction Request**: When given a CRF filename, extract all the data points' keys (not values) from the CRF file.
3. **Data Verification Request**: When given CRF data and eSource data, perform detailed verification analysis.
4. **Data Quality Review**: Comprehensive assessment of data quality, completeness, and accuracy
5. **Protocol Compliance Review**: Verify data adherence to study protocol requirements
6. **Data Integrity Review**: Identify potential data integrity issues and inconsistencies
7. **Comprehensive Review Report**: Generate detailed review reports with findings and recommendations

For file ranking request:
    - You shall be given a CRF filename and a list of eSource filenames.
    - You shall rank the eSource files by the likelihood of containing relevant data for CRF just based on the filenames.
    - The return value should be ["filename1", "filename2", "filename3"]

CRF Filename: {crf_filename}

eSource Files to Rank: {esource_files}

Please rank the eSource files by likelihood of containing relevant data for the CRF file based on filename analysis.
Return the ranking as a JSON array of filenames in order from most likely to least likely.

Do not include any other text in the return value."""

    try:
        response = client.models.generate_content(
            model=MODEL_NAME, contents=ranking_prompt, config=GENERATION_CONFIG
        )
        return {"success": True, "ranking": response.text.strip()}
    except Exception as e:
        return {"success": False, "error": str(e), "ranking": None}


def handle_data_point_extraction_request(file_content: str) -> Dict:
    """
    Handle data point extraction request - extract keys from CRF file content

    Args:
        file_content: Content of the CRF file

    Returns:
        Dictionary with extracted data points
    """

    extraction_prompt = f"""You are a specialized TrialMonitor Agent for clinical trials.

You can handle 7 types of requests:
1. **File Ranking Request**: When given a CRF filename and list of eSource filenames, rank the eSource files by likelihood of containing relevant source data.
2. **Data Point Extraction Request**: When given a CRF filename, extract all the data points' keys (not values) from the CRF file.
3. **Data Verification Request**: When given CRF data and eSource data, perform detailed verification analysis.
4. **Data Quality Review**: Comprehensive assessment of data quality, completeness, and accuracy
5. **Protocol Compliance Review**: Verify data adherence to study protocol requirements
6. **Data Integrity Review**: Identify potential data integrity issues and inconsistencies
7. **Comprehensive Review Report**: Generate detailed review reports with findings and recommendations

Data Point Extraction Request:
    - You shall be given file content.
    - You shall extract all the data points' keys (not values) from the CRF file.
    - The return value should be ["key1", "key2", "key3"]

File Content:
{file_content}

Please extract all the data points' keys (not values) from the CRF file.
Return the keys as a JSON array.

Do not include any other text in the return value."""

    try:
        response = client.models.generate_content(
            model=MODEL_NAME, contents=extraction_prompt, config=GENERATION_CONFIG
        )
        return {"success": True, "data_points": response.text.strip()}
    except Exception as e:
        return {"success": False, "error": str(e), "data_points": None}


def handle_data_verification_request(
    crf_data: str, esource_data: str, data_points: list
) -> Dict:
    """
    Handle data verification request - verify CRF data against eSource data

    Args:
        crf_data: CRF data content
        esource_data: eSource data content
        data_points: List of data point keys to verify

    Returns:
        Dictionary with verification results
    """

    verification_prompt = f"""You are a specialized TrialMonitor Agent for clinical trials.

You can handle 7 types of requests:
1. **File Ranking Request**: When given a CRF filename and list of eSource filenames, rank the eSource files by likelihood of containing relevant source data.
2. **Data Point Extraction Request**: When given a CRF filename, extract all the data points' keys (not values) from the CRF file.
3. **Data Verification Request**: When given CRF data and eSource data, perform detailed verification analysis.
4. **Data Quality Review**: Comprehensive assessment of data quality, completeness, and accuracy
5. **Protocol Compliance Review**: Verify data adherence to study protocol requirements
6. **Data Integrity Review**: Identify potential data integrity issues and inconsistencies
7. **Comprehensive Review Report**: Generate detailed review reports with findings and recommendations

Data Verification Request:
    - You shall be given CRF data, eSource data, and the data points' keys.
    - You shall perform detailed verification analysis.
    - The return value should be a dictionary with the following keys:
        - "verified": True/False
        - "verified_data_points": ["key1", "key2", "key3"]
        - "unverified_data_points": ["key1", "key2", "key3"]
        - "missing_data_points": ["key1", "key2", "key3"]
        - "discrepancy_data_points": ["key1", "key2", "key3"]
        - "additional_information_needed": ["key1", "key2", "key3"]

CRF Data:
{crf_data}

eSource Data:
{esource_data}

Data Points to Verify:
{data_points}

Please perform detailed verification analysis and return the results as a JSON dictionary with the specified keys.

Do not include any other text in the return value."""

    try:
        response = client.models.generate_content(
            model=MODEL_NAME, contents=verification_prompt, config=GENERATION_CONFIG
        )
        return {"success": True, "verification": response.text.strip()}
    except Exception as e:
        return {"success": False, "error": str(e), "verification": None}


# ============================================================================
# SOURCE DATA REVIEW HANDLERS
# ============================================================================


def handle_data_quality_review(source_data: str, quality_criteria: str = None) -> Dict:
    """
    Handle data quality review request

    Args:
        source_data: Source data content to review
        quality_criteria: Optional quality criteria to apply

    Returns:
        Dictionary with quality review results
    """

    quality_prompt = f"""You are a specialized TrialMonitor Agent for clinical trials.

You can handle 7 types of requests:
1. **File Ranking Request**: When given a CRF filename and list of eSource filenames, rank the eSource files by likelihood of containing relevant source data.
2. **Data Point Extraction Request**: When given a CRF filename, extract all the data points' keys (not values) from the CRF file.
3. **Data Verification Request**: When given CRF data and eSource data, perform detailed verification analysis.
4. **Data Quality Review**: Comprehensive assessment of data quality, completeness, and accuracy
5. **Protocol Compliance Review**: Verify data adherence to study protocol requirements
6. **Data Integrity Review**: Identify potential data integrity issues and inconsistencies
7. **Comprehensive Review Report**: Generate detailed review reports with findings and recommendations

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

    compliance_prompt = f"""You are a specialized TrialMonitor Agent for clinical trials.

You can handle 7 types of requests:
1. **File Ranking Request**: When given a CRF filename and list of eSource filenames, rank the eSource files by likelihood of containing relevant source data.
2. **Data Point Extraction Request**: When given a CRF filename, extract all the data points' keys (not values) from the CRF file.
3. **Data Verification Request**: When given CRF data and eSource data, perform detailed verification analysis.
4. **Data Quality Review**: Comprehensive assessment of data quality, completeness, and accuracy
5. **Protocol Compliance Review**: Verify data adherence to study protocol requirements
6. **Data Integrity Review**: Identify potential data integrity issues and inconsistencies
7. **Comprehensive Review Report**: Generate detailed review reports with findings and recommendations

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

    integrity_prompt = f"""You are a specialized TrialMonitor Agent for clinical trials.

You can handle 7 types of requests:
1. **File Ranking Request**: When given a CRF filename and list of eSource filenames, rank the eSource files by likelihood of containing relevant source data.
2. **Data Point Extraction Request**: When given a CRF filename, extract all the data points' keys (not values) from the CRF file.
3. **Data Verification Request**: When given CRF data and eSource data, perform detailed verification analysis.
4. **Data Quality Review**: Comprehensive assessment of data quality, completeness, and accuracy
5. **Protocol Compliance Review**: Verify data adherence to study protocol requirements
6. **Data Integrity Review**: Identify potential data integrity issues and inconsistencies
7. **Comprehensive Review Report**: Generate detailed review reports with findings and recommendations

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

    comprehensive_prompt = f"""You are a specialized TrialMonitor Agent for clinical trials.

You can handle 7 types of requests:
1. **File Ranking Request**: When given a CRF filename and list of eSource filenames, rank the eSource files by likelihood of containing relevant source data.
2. **Data Point Extraction Request**: When given a CRF filename, extract all the data points' keys (not values) from the CRF file.
3. **Data Verification Request**: When given CRF data and eSource data, perform detailed verification analysis.
4. **Data Quality Review**: Comprehensive assessment of data quality, completeness, and accuracy
5. **Protocol Compliance Review**: Verify data adherence to study protocol requirements
6. **Data Integrity Review**: Identify potential data integrity issues and inconsistencies
7. **Comprehensive Review Report**: Generate detailed review reports with findings and recommendations

For comprehensive review report:
    - You shall be given source data and review parameters
    - You shall generate a detailed report with all findings and recommendations
    - The return value should be a structured report with sections for each review type

Source Data:
{source_data}

Review Parameters:
{review_parameters or "Standard comprehensive review parameters"}

Please generate a comprehensive review report and return it as a structured report with the following sections:

# TRIAL MONITOR COMPREHENSIVE REVIEW REPORT

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

## PATIENT DATA VALIDATION
- Data verification results
- Patient matching analysis
- Data derivability assessment
- Validation findings

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


# ============================================================================
# CLINICAL TRIAL ANALYSIS HANDLERS
# ============================================================================


def handle_clinical_trial_analysis(protocol_text: str) -> Dict:
    """
    Handle clinical trial protocol analysis request

    Args:
        protocol_text: Clinical trial protocol text to analyze

    Returns:
        Dictionary with analysis results
    """

    analysis_prompt = f"""You are a specialized TrialMonitor Agent for clinical trials.

You can handle 8 types of requests:
1. **File Ranking Request**: When given a CRF filename and list of eSource filenames, rank the eSource files by likelihood of containing relevant source data.
2. **Data Point Extraction Request**: When given a CRF filename, extract all the data points' keys (not values) from the CRF file.
3. **Data Verification Request**: When given CRF data and eSource data, perform detailed verification analysis.
4. **Data Quality Review**: Comprehensive assessment of data quality, completeness, and accuracy
5. **Protocol Compliance Review**: Verify data adherence to study protocol requirements
6. **Data Integrity Review**: Identify potential data integrity issues and inconsistencies
7. **Comprehensive Review Report**: Generate detailed review reports with findings and recommendations
8. **Clinical Trial Protocol Analysis**: Analyze clinical trial protocol text and extract structured information about objectives, endpoints, eligibility criteria, monitoring requirements, and more

For clinical trial protocol analysis:
    - You shall be given clinical trial protocol text
    - You shall extract structured information about the trial
    - The return value should be a structured markdown analysis

Protocol Text:
{protocol_text}

Please analyze this clinical trial protocol and extract the following structured information:

# Clinical Trial Protocol Analysis

## 1. Trial Overview
- Protocol title/name
- Protocol number
- Study phase
- Trial type (interventional, observational, etc.)

## 2. Primary Objectives and Endpoints
- Primary objectives
- Primary endpoints and how they're measured
- Secondary endpoints

## 3. Trial Design
- Study design description
- Randomization (if applicable)
- Blinding (if applicable)
- Sample size

## 4. Eligibility Criteria
- Inclusion criteria (detailed list)
- Exclusion criteria (detailed list)

## 5. Monitoring and SDV Requirements
- Monitoring schedule and frequency
- Site visit schedule
- Source Data Verification (SDV) requirements
- What data points need verification
- Frequency of monitoring visits

## 6. Key Personnel and Sites
- Principal Investigators
- Study sites
- Sponsor information

## 7. Timeline and Visit Schedule
- Visit schedule
- Key milestones
- Duration of participation

## 8. Safety Monitoring
- Safety endpoints
- Adverse event monitoring
- Data Safety Monitoring Board (DSMB) requirements

## 9. Statistical Analysis Plan
- Statistical methods
- Primary analysis approach

## 10. Other Important Details
- Special procedures or considerations
- Regulatory information

Please provide a comprehensive, structured analysis in clear sections. Be specific and detailed.

Do not include any other text in the return value."""

    try:
        response = client.models.generate_content(
            model=MODEL_NAME, contents=analysis_prompt, config=GENERATION_CONFIG
        )
        return {"success": True, "analysis": response.text.strip()}
    except Exception as e:
        return {"success": False, "error": str(e), "analysis": None}


def handle_monitoring_plan_generation(
    protocol_context: str, monitoring_requirements: str = None
) -> Dict:
    """
    Handle monitoring plan generation request based on protocol context

    Args:
        protocol_context: Clinical trial protocol context or analysis
        monitoring_requirements: Specific monitoring requirements (optional)

    Returns:
        Dictionary with monitoring plan results
    """

    monitoring_prompt = f"""You are a specialized TrialMonitor Agent for clinical trials.

You can handle 9 types of requests:
1. **File Ranking Request**: When given a CRF filename and list of eSource filenames, rank the eSource files by likelihood of containing relevant source data.
2. **Data Point Extraction Request**: When given a CRF filename, extract all the data points' keys (not values) from the CRF file.
3. **Data Verification Request**: When given CRF data and eSource data, perform detailed verification analysis.
4. **Data Quality Review**: Comprehensive assessment of data quality, completeness, and accuracy
5. **Protocol Compliance Review**: Verify data adherence to study protocol requirements
6. **Data Integrity Review**: Identify potential data integrity issues and inconsistencies
7. **Comprehensive Review Report**: Generate detailed review reports with findings and recommendations
8. **Clinical Trial Protocol Analysis**: Analyze clinical trial protocol text and extract structured information about objectives, endpoints, eligibility criteria, monitoring requirements, and more
9. **Monitoring Plan Generation**: Generate comprehensive monitoring plans including remote source data verification (SDV) plans based on protocol context

For monitoring plan generation:
    - You shall be given protocol context and optional monitoring requirements
    - You shall generate a comprehensive monitoring plan
    - The return value should be a structured markdown monitoring plan

Protocol Context:
{protocol_context}

{f"Monitoring Requirements: {monitoring_requirements}" if monitoring_requirements else ""}

Please generate a comprehensive monitoring plan based on the protocol context. The plan should include:

# CLINICAL TRIAL MONITORING PLAN

## 1. EXECUTIVE SUMMARY
- Study overview and monitoring objectives
- Risk-based monitoring approach
- Key monitoring priorities
- Resource allocation summary

## 2. MONITORING STRATEGY
- Overall monitoring approach (risk-based, traditional, hybrid)
- Remote vs. on-site monitoring ratio
- Centralized monitoring components
- Quality by design principles

## 3. SOURCE DATA VERIFICATION (SDV) PLAN
- SDV strategy and approach
- 100% SDV requirements (critical data points)
- Risk-based SDV for other data
- Remote SDV capabilities and tools
- SDV frequency and timing

## 4. MONITORING VISIT SCHEDULE
- Pre-study visit requirements
- Site initiation visit (SIV) plan
- Routine monitoring visit schedule
- Close-out visit planning
- Remote monitoring activities

## 5. RISK ASSESSMENT AND MITIGATION
- High-risk data points identification
- Site risk stratification
- Patient risk factors
- Protocol complexity assessment
- Mitigation strategies

## 6. DATA QUALITY OVERSIGHT
- Centralized data review processes
- Key risk indicators (KRIs)
- Data quality metrics
- Query management strategy
- Data cleaning procedures

## 7. COMPLIANCE MONITORING
- Protocol adherence verification
- Regulatory compliance checks
- GCP compliance monitoring
- Site performance metrics
- Investigator oversight

## 8. SAFETY MONITORING
- Adverse event monitoring
- Safety data review
- Medical monitoring requirements
- DSMB support activities
- Safety signal detection

## 9. REMOTE MONITORING CAPABILITIES
- Electronic data capture (EDC) utilization
- Remote access protocols
- Digital tools and platforms
- Virtual monitoring procedures
- Data security measures

## 10. MONITORING TEAM STRUCTURE
- Roles and responsibilities
- Central monitoring team
- Site monitoring team
- Data management coordination
- Quality assurance oversight

## 11. IMPLEMENTATION TIMELINE
- Phase 1: Study startup and SIV
- Phase 2: Active monitoring period
- Phase 3: Study close-out
- Key milestones and deliverables
- Resource allocation timeline

## 12. QUALITY METRICS AND KPIs
- Monitoring efficiency metrics
- Data quality indicators
- Site performance measures
- Timeline adherence
- Cost-effectiveness measures

## 13. CONTINGENCY PLANNING
- Risk escalation procedures
- Site performance issues
- Data quality problems
- Regulatory findings
- Emergency response protocols

## 14. TECHNOLOGY AND TOOLS
- EDC system requirements
- Remote monitoring platforms
- Data visualization tools
- Communication systems
- Training requirements

## 15. REGULATORY CONSIDERATIONS
- FDA/EMA requirements
- ICH-GCP guidelines
- Local regulatory compliance
- Audit preparation
- Inspection readiness

Please provide a comprehensive, detailed monitoring plan that addresses all aspects of clinical trial monitoring based on the protocol context provided.

Do not include any other text in the return value."""

    try:
        response = client.models.generate_content(
            model=MODEL_NAME, contents=monitoring_prompt, config=GENERATION_CONFIG
        )
        return {"success": True, "monitoring_plan": response.text.strip()}
    except Exception as e:
        return {"success": False, "error": str(e), "monitoring_plan": None}


# ============================================================================
# REQUEST DETECTION AND PARSING
# ============================================================================


def detect_request_type(user_text: str) -> str:
    """
    Detect the type of request based on user input

    Args:
        user_text: User input text

    Returns:
        Request type: 'file_ranking', 'data_extraction', 'data_verification', 'data_quality', 'protocol_compliance', 'data_integrity', 'comprehensive_report', 'clinical_trial_analysis', 'monitoring_plan', or 'unknown'
    """
    user_text_lower = user_text.lower()

    # Check for file ranking request
    if any(
        keyword in user_text_lower
        for keyword in [
            "file ranking",
            "rank files",
            "crf filename",
            "esource files",
            "rank the",
        ]
    ):
        return "file_ranking"

    # Check for data point extraction request
    if any(
        keyword in user_text_lower
        for keyword in [
            "extract data points",
            "data point extraction",
            "extract keys",
            "data points keys",
        ]
    ):
        return "data_extraction"

    # Check for data verification request
    if any(
        keyword in user_text_lower
        for keyword in [
            "data verification",
            "verify data",
            "crf data",
            "esource data",
            "verification analysis",
        ]
    ):
        return "data_verification"

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

    # Check for clinical trial analysis request
    if any(
        keyword in user_text_lower
        for keyword in [
            "clinical trial analysis",
            "protocol analysis",
            "analyze protocol",
            "trial protocol",
            "clinical trial protocol",
        ]
    ):
        return "clinical_trial_analysis"

    # Check if it looks like a protocol (long text, multiple lines)
    lines = user_text.strip().split("\n")
    is_likely_protocol = len(lines) > 10 or len(user_text.strip()) > 500

    if is_likely_protocol:
        return "clinical_trial_analysis"

    # Check for monitoring plan generation request
    if any(
        keyword in user_text_lower
        for keyword in [
            "monitoring plan",
            "generate monitoring plan",
            "sdv plan",
            "source data verification plan",
            "remote monitoring plan",
            "comprehensive monitoring",
            "monitoring strategy",
        ]
    ):
        return "monitoring_plan"

    return "unknown"


def parse_request(user_text: str) -> tuple:
    """
    Parse request to extract relevant data based on request type

    Args:
        user_text: User input text

    Returns:
        Tuple of parsed data based on request type
    """
    import json
    import re

    try:
        # For file ranking requests
        if "file ranking" in user_text.lower() or "rank files" in user_text.lower():
            # Look for CRF filename
            crf_match = re.search(
                r"crf[^:]*filename[^:]*:?\s*([^\n\r]+)", user_text, re.IGNORECASE
            )
            if not crf_match:
                crf_match = re.search(
                    r"crf[^:]*:?\s*([^\n\r]+)", user_text, re.IGNORECASE
                )

            crf_filename = crf_match.group(1).strip() if crf_match else None

            # Look for eSource files list
            esource_match = re.search(
                r"esource[^:]*files[^:]*:?\s*(\[.*?\])",
                user_text,
                re.IGNORECASE | re.DOTALL,
            )
            if esource_match:
                esource_files = json.loads(esource_match.group(1))
            else:
                esource_files = re.findall(
                    r'["\']([^"\']+\.(?:docx|pdf|txt))["\']', user_text, re.IGNORECASE
                )

            return crf_filename, esource_files

        # For data extraction requests
        elif "extract data points" in user_text.lower():
            content_markers = [
                "file content:",
                "content:",
                "data:",
                "crf content:",
                "file data:",
            ]
            for marker in content_markers:
                if marker in user_text.lower():
                    parts = user_text.split(marker, 1)
                    if len(parts) > 1:
                        return parts[1].strip()
            return user_text

        # For data verification requests
        elif "data verification" in user_text.lower():
            crf_match = re.search(
                r"crf[^:]*data[^:]*:?\s*([^\n\r]+(?:\n(?!eSource|data points)[^\n\r]+)*)",
                user_text,
                re.IGNORECASE | re.DOTALL,
            )
            crf_data = crf_match.group(1).strip() if crf_match else None

            esource_match = re.search(
                r"esource[^:]*data[^:]*:?\s*([^\n\r]+(?:\n(?!data points)[^\n\r]+)*)",
                user_text,
                re.IGNORECASE | re.DOTALL,
            )
            esource_data = esource_match.group(1).strip() if esource_match else None

            points_match = re.search(
                r"data[^:]*points[^:]*:?\s*(\[.*?\])",
                user_text,
                re.IGNORECASE | re.DOTALL,
            )
            if points_match:
                data_points = json.loads(points_match.group(1))
            else:
                data_points = None

            return crf_data, esource_data, data_points

        # For review requests (quality, compliance, integrity, comprehensive)
        else:
            # Look for source data markers
            data_markers = [
                "source data:",
                "data:",
                "source:",
                "content:",
                "file content:",
            ]
            source_data = None
            for marker in data_markers:
                if marker in user_text.lower():
                    parts = user_text.split(marker, 1)
                    if len(parts) > 1:
                        source_data = parts[1].strip()
                        break

            # If no markers found, try to find data in structured format
            if not source_data:
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


# ============================================================================
# AGENT SETUP AND MESSAGE HANDLING
# ============================================================================


@agent.on_event("startup")
async def startup(ctx: Context):
    """Initialize agent on startup"""
    ctx.logger.info("🔍 Starting TrialMonitor Agent...")
    ctx.logger.info(f"📍 Agent address: {agent.address}")

    if gemini_api_key:
        ctx.logger.info("✅ Gemini API configured")
    else:
        ctx.logger.error("❌ Gemini API key not set")

    # Initialize storage
    ctx.storage.set("total_requests", 0)
    ctx.storage.set("request_history", [])


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

        # Detect the type of request
        request_type = detect_request_type(user_text)
        ctx.logger.info(f"🔍 Detected request type: {request_type}")

        if request_type == "file_ranking":
            # Handle file ranking request
            ctx.logger.info("📁 Processing file ranking request")
            await ctx.send(
                sender, create_text_chat("🔬 Analyzing files for ranking...")
            )

            parsed_data = parse_request(user_text)
            if len(parsed_data) == 2:
                crf_filename, esource_files = parsed_data
                if crf_filename and esource_files:
                    result = handle_file_ranking_request(crf_filename, esource_files)
                    if result["success"]:
                        response_text = result["ranking"]
                    else:
                        response_text = f"Error ranking files: {result['error']}"
                else:
                    response_text = "Error: Could not parse CRF filename or eSource files from request"
            else:
                response_text = "Error: Invalid file ranking request format"

        elif request_type == "data_extraction":
            # Handle data point extraction request
            ctx.logger.info("🔍 Processing data point extraction request")
            await ctx.send(sender, create_text_chat("🔬 Extracting data points..."))

            file_content = parse_request(user_text)
            result = handle_data_point_extraction_request(file_content)

            if result["success"]:
                response_text = result["data_points"]
            else:
                response_text = f"Error extracting data points: {result['error']}"

        elif request_type == "data_verification":
            # Handle data verification request
            ctx.logger.info("✅ Processing data verification request")
            await ctx.send(sender, create_text_chat("🔬 Verifying data..."))

            parsed_data = parse_request(user_text)
            if len(parsed_data) == 3:
                crf_data, esource_data, data_points = parsed_data
                if crf_data and esource_data and data_points:
                    result = handle_data_verification_request(
                        crf_data, esource_data, data_points
                    )
                    if result["success"]:
                        response_text = result["verification"]
                    else:
                        response_text = f"Error verifying data: {result['error']}"
                else:
                    response_text = "Error: Could not parse CRF data, eSource data, or data points from request"
            else:
                response_text = "Error: Invalid data verification request format"

        elif request_type == "data_quality":
            # Handle data quality review request
            ctx.logger.info("📊 Processing data quality review request")
            await ctx.send(sender, create_text_chat("🔍 Analyzing data quality..."))

            parsed_data = parse_request(user_text)
            if len(parsed_data) == 2:
                source_data, quality_criteria = parsed_data
                result = handle_data_quality_review(source_data, quality_criteria)

                if result["success"]:
                    response_text = result["quality_review"]
                else:
                    response_text = f"Error reviewing data quality: {result['error']}"
            else:
                response_text = "Error: Invalid data quality request format"

        elif request_type == "protocol_compliance":
            # Handle protocol compliance review request
            ctx.logger.info("📋 Processing protocol compliance review request")
            await ctx.send(
                sender, create_text_chat("📋 Checking protocol compliance...")
            )

            parsed_data = parse_request(user_text)
            if len(parsed_data) == 2:
                source_data, protocol_requirements = parsed_data
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
                    response_text = "Error: Protocol requirements not specified for compliance review"
            else:
                response_text = "Error: Invalid protocol compliance request format"

        elif request_type == "data_integrity":
            # Handle data integrity review request
            ctx.logger.info("🔒 Processing data integrity review request")
            await ctx.send(sender, create_text_chat("🔒 Analyzing data integrity..."))

            parsed_data = parse_request(user_text)
            if len(parsed_data) == 2:
                source_data, integrity_criteria = parsed_data
                result = handle_data_integrity_review(source_data, integrity_criteria)

                if result["success"]:
                    response_text = result["integrity_review"]
                else:
                    response_text = f"Error reviewing data integrity: {result['error']}"
            else:
                response_text = "Error: Invalid data integrity request format"

        elif request_type == "comprehensive_report":
            # Handle comprehensive review report request
            ctx.logger.info("📄 Processing comprehensive review report request")
            await ctx.send(
                sender, create_text_chat("📄 Generating comprehensive review report...")
            )

            parsed_data = parse_request(user_text)
            if len(parsed_data) == 2:
                source_data, review_parameters = parsed_data
                result = handle_comprehensive_review_report(
                    source_data, review_parameters
                )

                if result["success"]:
                    response_text = result["comprehensive_report"]
                else:
                    response_text = (
                        f"Error generating comprehensive report: {result['error']}"
                    )
            else:
                response_text = "Error: Invalid comprehensive report request format"

        elif request_type == "clinical_trial_analysis":
            # Handle clinical trial protocol analysis request
            ctx.logger.info("🏥 Processing clinical trial protocol analysis request")
            await ctx.send(
                sender, create_text_chat("🏥 Analyzing clinical trial protocol...")
            )

            # For clinical trial analysis, use the entire text as protocol content
            result = handle_clinical_trial_analysis(user_text)

            if result["success"]:
                response_text = (
                    f"# Clinical Trial Protocol Analysis\n\n{result['analysis']}"
                )
            else:
                response_text = f"Error analyzing protocol: {result['error']}"

        elif request_type == "monitoring_plan":
            # Handle monitoring plan generation request
            ctx.logger.info("📋 Processing monitoring plan generation request")
            await ctx.send(
                sender,
                create_text_chat("📋 Generating comprehensive monitoring plan..."),
            )

            # Parse monitoring plan request
            parsed_data = parse_request(user_text)
            if len(parsed_data) == 2:
                protocol_context, monitoring_requirements = parsed_data
                result = handle_monitoring_plan_generation(
                    protocol_context, monitoring_requirements
                )
            else:
                # Use entire text as protocol context
                result = handle_monitoring_plan_generation(user_text)

            if result["success"]:
                response_text = (
                    f"# Clinical Trial Monitoring Plan\n\n{result['monitoring_plan']}"
                )
            else:
                response_text = f"Error generating monitoring plan: {result['error']}"

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

You are helping with clinical trial monitoring. {conversation_context}

User Input: {user_text}

Provide helpful guidance on how to use this TrialMonitor agent. The agent can handle 9 types of requests:
1. File Ranking Request
2. Data Point Extraction Request
3. Data Verification Request
4. Data Quality Review
5. Protocol Compliance Review
6. Data Integrity Review
7. Comprehensive Review Report
8. Clinical Trial Protocol Analysis
9. Monitoring Plan Generation

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
            history = ctx.storage.get("request_history") or []
            history.append(
                {
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "sender": sender,
                    "request_type": request_type,
                    "status": "processed",
                }
            )
            ctx.storage.set("request_history", history[-10:])  # Keep last 10

            total = ctx.storage.get("total_requests") or 0
            ctx.storage.set("total_requests", total + 1)

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
    print("🔍 Starting TrialMonitor Agent...")
    print(f"📍 Agent address: {agent.address}")

    if gemini_api_key:
        print("✅ Gemini API configured")
    else:
        print("❌ ERROR: GEMINI_API_KEY not set")
        print("   Please add it to your .env file")
        exit(1)

    print("\n🎯 Agent Capabilities:")
    print("   • File Ranking: Rank eSource files by relevance to CRF files")
    print("   • Data Point Extraction: Extract data point keys from CRF files")
    print("   • Data Verification: Verify CRF data against eSource data")
    print("   • Data Quality Review: Comprehensive quality assessment")
    print("   • Protocol Compliance Review: Verify protocol adherence")
    print("   • Data Integrity Review: Identify integrity issues")
    print("   • Comprehensive Review Report: Detailed analysis reports")
    print(
        "   • Clinical Trial Protocol Analysis: Analyze protocol text and extract structured information"
    )
    print(
        "   • Monitoring Plan Generation: Generate comprehensive monitoring plans including remote SDV plans"
    )

    print("\n💡 Usage Examples:")
    print("   1. File Ranking Request:")
    print("      'File ranking request: CRF filename: crf_sub_1_Demographics.docx'")
    print('      \'eSource files: ["file1.docx", "file2.docx"]\'')
    print("   ")
    print("   2. Data Point Extraction Request:")
    print("      'Extract data points from CRF file content: [file content here]'")
    print("   ")
    print("   3. Data Verification Request:")
    print(
        "      'Data verification: CRF data: [data] eSource data: [data] data points: [keys]'"
    )
    print("   ")
    print("   4. Data Quality Review:")
    print("      'Data quality review: Source data: [data content]'")
    print("   ")
    print("   5. Protocol Compliance Review:")
    print(
        "      'Protocol compliance review: Source data: [data] Protocol requirements: [requirements]'"
    )
    print("   ")
    print("   6. Data Integrity Review:")
    print("      'Data integrity review: Source data: [data content]'")
    print("   ")
    print("   7. Comprehensive Review Report:")
    print("      'Comprehensive review report: Source data: [data content]'")
    print("   ")
    print("   8. Clinical Trial Protocol Analysis:")
    print("      'Clinical trial analysis: [protocol text content]'")
    print("      Or simply paste protocol text (agent auto-detects long text)")
    print("   ")
    print("   9. Monitoring Plan Generation:")
    print("      'Generate monitoring plan: [protocol context]'")
    print("      'SDV plan: [protocol analysis]'")
    print("      'Remote monitoring plan: [protocol context]'")

    print("\n✅ Agent is running! Press Ctrl+C to stop.\n")

    agent.run()
