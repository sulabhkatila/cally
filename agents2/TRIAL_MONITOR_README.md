# TrialMonitor Agent

A comprehensive clinical trial monitoring agent that combines source data review and patient data validation capabilities into a unified solution.

## Overview

The TrialMonitor Agent is a specialized AI agent designed for clinical trial monitoring and validation. It provides a single point of access for all trial monitoring needs, combining 9 core capabilities into one unified interface.

## Features

### Patient Data Validation

-   **File Ranking**: Rank eSource files by relevance to CRF files
-   **Data Point Extraction**: Extract data point keys from CRF files
-   **Data Verification**: Verify CRF data against eSource data

### Source Data Review

-   **Data Quality Review**: Comprehensive quality assessment
-   **Protocol Compliance Review**: Verify protocol adherence
-   **Data Integrity Review**: Identify integrity issues
-   **Comprehensive Review Report**: Detailed analysis reports

### Clinical Trial Analysis

-   **Clinical Trial Protocol Analysis**: Analyze protocol text and extract structured information about objectives, endpoints, eligibility criteria, monitoring requirements, and more
-   **Monitoring Plan Generation**: Generate comprehensive monitoring plans including remote source data verification (SDV) plans based on protocol context

## Request Types

#### 1. File Ranking Request

Rank eSource files by likelihood of containing relevant data for a CRF file.

**Format:**

```
File ranking request:
CRF filename: crf_sub_1_Demographics.docx
eSource files: ["file1.docx", "file2.docx", "file3.docx"]
```

**Response:**

```json
[
    "Sub_1_DemographicParams.docx",
    "Sub_1_MedicalHiistory.docx",
    "Sub_1_Week0Labs.docx"
]
```

#### 2. Data Point Extraction Request

Extract all data point keys from CRF file content.

**Format:**

```
Extract data points from CRF file content:
[CRF file content here]
```

**Response:**

```json
[
    "patient_id",
    "date_of_birth",
    "gender",
    "race",
    "ethnicity",
    "height",
    "weight",
    "bmi"
]
```

#### 3. Data Verification Request

Verify CRF data against eSource data with detailed analysis.

**Format:**

```
Data verification:
CRF data: [CRF data content]
eSource data: [eSource data content]
data points: ["key1", "key2", "key3"]
```

**Response:**

```json
{
    "verified": true,
    "verified_data_points": ["patient_id", "date_of_birth", "height"],
    "unverified_data_points": [],
    "missing_data_points": [],
    "discrepancy_data_points": ["gender", "medical_history"],
    "additional_information_needed": []
}
```

#### 4. Data Quality Review

Comprehensive assessment of data quality, completeness, and accuracy.

**Format:**

```
Data quality review:
Source data: [source data content]
```

**Response:**

```json
{
    "overall_quality_score": 85,
    "completeness_score": 90,
    "accuracy_score": 80,
    "consistency_score": 85,
    "validity_score": 90,
    "quality_issues": [
        {
            "issue_type": "missing_data",
            "severity": "medium",
            "description": "Missing race and ethnicity information",
            "field_affected": "demographics",
            "recommendation": "Collect race and ethnicity data per protocol requirements"
        }
    ],
    "data_completeness": {
        "required_fields_present": 90,
        "optional_fields_present": 75,
        "missing_required_fields": ["race", "ethnicity"],
        "missing_optional_fields": ["emergency_contact"]
    },
    "data_accuracy": {
        "logical_consistency": 95,
        "value_ranges_valid": 100,
        "date_consistency": 100,
        "cross_field_validation": 90
    },
    "recommendations": [
        "Complete missing demographic information",
        "Verify medication dosing accuracy"
    ]
}
```

#### 5. Protocol Compliance Review

Verify data adherence to study protocol requirements.

**Format:**

```
Protocol compliance review:
Source data: [source data content]
Protocol requirements: [protocol requirements]
```

**Response:**

```json
{
    "overall_compliance_score": 90,
    "compliance_status": "compliant",
    "protocol_adherence": {
        "inclusion_criteria_met": true,
        "exclusion_criteria_violated": false,
        "visit_schedule_adherence": 100,
        "data_collection_timeliness": 85,
        "required_assessments_completed": 90
    },
    "violations": [],
    "missing_requirements": [
        {
            "requirement_type": "lab_results",
            "description": "Lab results pending - must be available within 7 days",
            "protocol_reference": "Section 4.2.3",
            "impact": "May delay data analysis"
        }
    ],
    "recommendations": [
        "Ensure lab results are available within 7 days",
        "Complete physical exam documentation"
    ]
}
```

#### 6. Data Integrity Review

Identify potential data integrity issues and inconsistencies.

**Format:**

```
Data integrity review:
Source data: [source data content]
```

**Response:**

```json
{
    "overall_integrity_score": 95,
    "integrity_status": "intact",
    "integrity_issues": [
        {
            "issue_type": "data_manipulation",
            "severity": "low",
            "description": "Weight data modified after initial entry",
            "affected_data": "weight field",
            "evidence": "Weight changed from 82 kg to 80 kg with documented reason",
            "recommendation": "Verify weight measurement accuracy and document correction process"
        }
    ],
    "audit_trail_analysis": {
        "timestamps_consistent": true,
        "user_actions_logged": true,
        "data_modifications_tracked": true,
        "suspicious_activity_detected": false
    },
    "data_lineage": {
        "source_traceability": 100,
        "transformation_integrity": 100,
        "version_control": 100
    },
    "recommendations": [
        "Maintain detailed audit trail for all data modifications",
        "Implement additional validation for critical measurements"
    ]
}
```

#### 7. Comprehensive Review Report

Generate detailed review reports with all findings and recommendations.

**Format:**

```
Comprehensive review report:
Source data: [source data content]
```

**Response:**

```markdown
# TRIAL MONITOR COMPREHENSIVE REVIEW REPORT

## EXECUTIVE SUMMARY

-   Overall assessment score: 88/100
-   Key findings: Good data quality with minor compliance issues
-   Critical issues: Lab results delay at Week 4
-   Recommendations priority: High - Address lab result timeliness

## DATA QUALITY ASSESSMENT

-   Completeness: 92% - Most required fields present
-   Accuracy: 90% - Consistent measurements across visits
-   Consistency: 95% - Good internal consistency
-   Validity: 88% - Some missing optional data

## PROTOCOL COMPLIANCE REVIEW

-   Compliance status: Compliant with minor issues
-   Visit timing: All visits within protocol windows
-   Data collection: 90% complete
-   Missing: Week 4 lab results (pending)

## DATA INTEGRITY ANALYSIS

-   Integrity status: Intact
-   Audit trail: Complete and consistent
-   Data lineage: Fully traceable
-   No suspicious activity detected

## PATIENT DATA VALIDATION

-   Data verification: 85% verified
-   Patient matching: Confirmed
-   Data derivability: 90% derivable
-   Validation findings: Minor discrepancies in medical history format

## DETAILED FINDINGS

1. Lab results delay at Week 4 visit
2. Missing optional demographic data
3. Good study drug compliance
4. Consistent vital sign improvements
5. Minor data format inconsistencies

## RECOMMENDATIONS

-   Immediate: Obtain Week 4 lab results
-   Short-term: Complete missing demographic data
-   Long-term: Implement automated lab result tracking
-   Process: Enhance data collection timeliness

## APPENDICES

-   Detailed quality metrics
-   Compliance checklist
-   Integrity verification log
-   Patient data validation results
```

#### 8. Clinical Trial Protocol Analysis

Analyze clinical trial protocol text and extract structured information about objectives, endpoints, eligibility criteria, monitoring requirements, and more.

**Format:**

```
Clinical trial analysis:
[Protocol text content]
```

**Response:**

```markdown
# Clinical Trial Protocol Analysis

## 1. Trial Overview

-   Protocol title/name: [Title]
-   Protocol number: [Number]
-   Study phase: [Phase]
-   Trial type: [Type]

## 2. Primary Objectives and Endpoints

-   Primary objectives: [Objectives]
-   Primary endpoints: [Endpoints]
-   Secondary endpoints: [Secondary endpoints]

## 3. Trial Design

-   Study design: [Design description]
-   Randomization: [Yes/No]
-   Blinding: [Type]
-   Sample size: [Number]

## 4. Eligibility Criteria

-   Inclusion criteria: [Detailed list]
-   Exclusion criteria: [Detailed list]

## 5. Monitoring and SDV Requirements

-   Monitoring schedule: [Schedule]
-   SDV requirements: [Requirements]
-   Source document verification: [Requirements]

## 6. Key Personnel and Sites

-   Principal Investigators: [Names]
-   Study sites: [Sites]
-   Sponsor information: [Sponsor]

## 7. Timeline and Visit Schedule

-   Visit schedule: [Schedule]
-   Key milestones: [Milestones]
-   Duration of participation: [Duration]

## 8. Safety Monitoring

-   Safety endpoints: [Endpoints]
-   Adverse event monitoring: [Requirements]
-   DSMB requirements: [Requirements]

## 9. Statistical Analysis Plan

-   Statistical methods: [Methods]
-   Primary analysis: [Analysis approach]

## 10. Other Important Details

-   Special procedures: [Procedures]
-   Regulatory information: [Information]
```

#### 9. Monitoring Plan Generation

Generate comprehensive monitoring plans including remote source data verification (SDV) plans based on protocol context.

**Format:**

```
Generate monitoring plan:
[Protocol context or analysis]
```

**Response:**

```markdown
# CLINICAL TRIAL MONITORING PLAN

## 1. EXECUTIVE SUMMARY

-   Study overview and monitoring objectives
-   Risk-based monitoring approach
-   Key monitoring priorities
-   Resource allocation summary

## 2. MONITORING STRATEGY

-   Overall monitoring approach (risk-based, traditional, hybrid)
-   Remote vs. on-site monitoring ratio
-   Centralized monitoring components
-   Quality by design principles

## 3. SOURCE DATA VERIFICATION (SDV) PLAN

-   SDV strategy and approach
-   100% SDV requirements (critical data points)
-   Risk-based SDV for other data
-   Remote SDV capabilities and tools
-   SDV frequency and timing

## 4. MONITORING VISIT SCHEDULE

-   Pre-study visit requirements
-   Site initiation visit (SIV) plan
-   Routine monitoring visit schedule
-   Close-out visit planning
-   Remote monitoring activities

## 5. RISK ASSESSMENT AND MITIGATION

-   High-risk data points identification
-   Site risk stratification
-   Patient risk factors
-   Protocol complexity assessment
-   Mitigation strategies

## 6. DATA QUALITY OVERSIGHT

-   Centralized data review processes
-   Key risk indicators (KRIs)
-   Data quality metrics
-   Query management strategy
-   Data cleaning procedures

## 7. COMPLIANCE MONITORING

-   Protocol adherence verification
-   Regulatory compliance checks
-   GCP compliance monitoring
-   Site performance metrics
-   Investigator oversight

## 8. SAFETY MONITORING

-   Adverse event monitoring
-   Safety data review
-   Medical monitoring requirements
-   DSMB support activities
-   Safety signal detection

## 9. REMOTE MONITORING CAPABILITIES

-   Electronic data capture (EDC) utilization
-   Remote access protocols
-   Digital tools and platforms
-   Virtual monitoring procedures
-   Data security measures

## 10. MONITORING TEAM STRUCTURE

-   Roles and responsibilities
-   Central monitoring team
-   Site monitoring team
-   Data management coordination
-   Quality assurance oversight

## 11. IMPLEMENTATION TIMELINE

-   Phase 1: Study startup and SIV
-   Phase 2: Active monitoring period
-   Phase 3: Study close-out
-   Key milestones and deliverables
-   Resource allocation timeline

## 12. QUALITY METRICS AND KPIs

-   Monitoring efficiency metrics
-   Data quality indicators
-   Site performance measures
-   Timeline adherence
-   Cost-effectiveness measures

## 13. CONTINGENCY PLANNING

-   Risk escalation procedures
-   Site performance issues
-   Data quality problems
-   Regulatory findings
-   Emergency response protocols

## 14. TECHNOLOGY AND TOOLS

-   EDC system requirements
-   Remote monitoring platforms
-   Data visualization tools
-   Communication systems
-   Training requirements

## 15. REGULATORY CONSIDERATIONS

-   FDA/EMA requirements
-   ICH-GCP guidelines
-   Local regulatory compliance
-   Audit preparation
-   Inspection readiness
```

## Configuration

### Agent Settings

-   **Port**: 8004
-   **Model**: Gemini 2.5 Flash
-   **Temperature**: 0.1 (precise analysis)
-   **Max Tokens**: 4096
-   **Seed**: "TrialMonitor2024!"

### Model Configuration

The agent uses a low temperature (0.1) for precise, consistent analysis suitable for clinical trial data validation.

## Key Features

### Smart Request Detection

The agent automatically detects the type of request based on keywords and patterns in the user input.

### Flexible Parsing

Handles various input formats and structures, automatically extracting relevant data from different request types.

### Structured Responses

Each request type returns exactly the format specified in the system prompt, ensuring consistency across all interactions.

### Comprehensive Error Handling

-   Graceful error handling with fallback guidance
-   Detailed error messages for debugging
-   Automatic request type detection with fallback

### Request Tracking

-   Logs all processed requests for audit purposes
-   Maintains conversation history for context
-   Tracks processing metrics and success rates

## Use Cases

### Clinical Trial Monitoring

-   Monitor data quality across study sites
-   Verify protocol compliance
-   Track data integrity issues
-   Generate comprehensive monitoring reports

### Source Data Verification (SDV)

-   Rank source documents by relevance
-   Extract data points from CRF files
-   Verify CRF data against source documents
-   Identify data discrepancies

### Quality Assurance

-   Assess data completeness and accuracy
-   Identify quality issues and trends
-   Generate quality metrics and reports
-   Provide recommendations for improvement

### Regulatory Compliance

-   Verify adherence to protocol requirements
-   Check data integrity and audit trails
-   Generate compliance reports
-   Identify potential regulatory issues

## Examples

### Example 1: File Ranking

```
Input: File ranking request: CRF filename: crf_sub_1_Demographics.docx eSource files: ["Sub_1_DemographicParams.docx", "Sub_1_Week0Labs.docx", "Sub_1_Week2Vitals.docx"]

Output: ["Sub_1_DemographicParams.docx", "Sub_1_Week0Labs.docx", "Sub_1_Week2Vitals.docx"]
```

### Example 2: Data Quality Assessment

```
Input: Data quality review: Source data: Patient ID: SUB-001, Age: 45, Gender: Male, Weight: 80kg

Output: {"overall_quality_score": 75, "completeness_score": 80, "quality_issues": [...], "recommendations": [...]}
```

### Example 3: Protocol Compliance Check

```
Input: Protocol compliance review: Source data: [visit data] Protocol requirements: [protocol specs]

Output: {"overall_compliance_score": 90, "compliance_status": "compliant", "violations": [], "recommendations": [...]}
```

## Benefits

### Unified Interface

-   Single point of access for all trial monitoring needs
-   Consistent request/response patterns across all capabilities
-   Reduced complexity in agent management

### Better Context Sharing

-   Information can be shared between different analysis types
-   Maintains conversation history and context
-   Enables comprehensive analysis workflows

### Streamlined Deployment

-   One agent to deploy and maintain
-   Unified logging and monitoring
-   Simplified configuration management

### Comprehensive Coverage

-   Covers all aspects of clinical trial monitoring
-   From data validation to compliance checking
-   End-to-end trial monitoring solution

## Support

For issues or questions:

1. Review the example requests and responses
2. Ensure your request format matches the expected patterns
3. Include relevant keywords in your request (e.g., "file ranking", "data quality", "protocol compliance")
4. Check the agent logs for detailed error information

## License

This agent is part of the SDV (Source Data Verification) project for clinical trial monitoring.

## Version

Current version: 2.0.0

## Changelog

### v2.0.0

-   Added Clinical Trial Protocol Analysis capability
-   Added Monitoring Plan Generation capability
-   9 core request types supported
-   Comprehensive monitoring plan generation with 15 detailed sections
-   Remote SDV planning and risk assessment
-   Enhanced protocol analysis with structured extraction

### v1.0.0

-   Initial release
-   Unified TrialMonitor agent combining all capabilities
-   7 core request types supported
-   Comprehensive error handling and logging
-   Structured JSON responses for all request types
