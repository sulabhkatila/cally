#!/usr/bin/env python3
"""
Demonstration script for the TrialMonitor Agent

This script shows all 9 capabilities of the unified TrialMonitor agent:
1. File Ranking Request
2. Data Point Extraction Request
3. Data Verification Request
4. Data Quality Review
5. Protocol Compliance Review
6. Data Integrity Review
7. Comprehensive Review Report
8. Clinical Trial Protocol Analysis
9. Monitoring Plan Generation
"""

import json


def demo_file_ranking():
    """Demonstrate file ranking capability"""
    print("📁 DEMO: File Ranking Request")
    print("=" * 50)

    # Sample CRF filename
    crf_filename = "crf_sub_1_Demographics.docx"

    # Sample eSource files to rank
    esource_files = [
        "Sub_1_DemographicParams.docx",
        "Sub_1_MedicalHiistory.docx",
        "Sub_1_Week0Labs.docx",
        "Sub_1_Week1_Physical.docx",
        "Sub_1_DrugAccountabilityRecords.docx",
        "Sub_1_PatientDiary;.docx",
        "Sub_1_Week0Joint.docx",
        "Sub_1_Week2Vitals.docx",
        "Sub_1_Week4Vitals.docx",
        "Sub_1_Week8_Vitals.docx",
        "sub_1_week10_vitals.docx",
    ]

    print(f"📋 CRF File: {crf_filename}")
    print(f"📁 eSource Files to Rank: {len(esource_files)} files")
    print()

    # Create the request message
    request_message = f"""File ranking request:

CRF filename: {crf_filename}

eSource files: {json.dumps(esource_files, indent=2)}

Please rank the eSource files by likelihood of containing relevant data for the CRF file based on filename analysis."""

    print("📝 Request Message:")
    print(request_message)
    print()

    print("🎯 Expected Response:")
    print("A JSON array of filenames ranked from most likely to least likely:")
    print('["Sub_1_DemographicParams.docx", "Sub_1_MedicalHiistory.docx", ...]')
    print()


def demo_data_extraction():
    """Demonstrate data point extraction capability"""
    print("🔍 DEMO: Data Point Extraction Request")
    print("=" * 50)

    # Sample CRF file content
    crf_content = """
Patient Demographics Form

Patient ID: SUB-001
Date of Birth: 01/15/1980
Gender: Male
Race: Caucasian
Ethnicity: Non-Hispanic
Height: 175 cm
Weight: 80 kg
BMI: 26.1
Medical History: Hypertension, Diabetes Type 2
Current Medications: Metformin 500mg BID, Lisinopril 10mg QD
Allergies: None known
Emergency Contact: Jane Doe (555-1234)
    """

    print("📄 CRF File Content:")
    print(crf_content)
    print()

    # Create the request message
    request_message = f"""Extract data points from CRF file content:

File content: {crf_content}

Please extract all the data points' keys (not values) from the CRF file."""

    print("📝 Request Message:")
    print(request_message)
    print()

    print("🎯 Expected Response:")
    print("A JSON array of data point keys:")
    print(
        '["patient_id", "date_of_birth", "gender", "race", "ethnicity", "height", "weight", "bmi", "medical_history", "current_medications", "allergies", "emergency_contact"]'
    )
    print()


def demo_data_verification():
    """Demonstrate data verification capability"""
    print("✅ DEMO: Data Verification Request")
    print("=" * 50)

    # Sample CRF data
    crf_data = """
Patient ID: SUB-001
Date of Birth: 01/15/1980
Gender: Male
Height: 175 cm
Weight: 80 kg
BMI: 26.1
Medical History: Hypertension, Diabetes Type 2
    """

    # Sample eSource data
    esource_data = """
Patient ID: SUB-001
DOB: 01/15/1980
Sex: M
Height: 175 cm
Weight: 80 kg
BMI: 26.1
Medical History: HTN, DM Type 2
Current Medications: Metformin, Lisinopril
    """

    # Data points to verify
    data_points = [
        "patient_id",
        "date_of_birth",
        "gender",
        "height",
        "weight",
        "bmi",
        "medical_history",
    ]

    print("📋 CRF Data:")
    print(crf_data)
    print()
    print("📄 eSource Data:")
    print(esource_data)
    print()
    print("🔑 Data Points to Verify:")
    print(data_points)
    print()

    # Create the request message
    request_message = f"""Data verification request:

CRF data: {crf_data}

eSource data: {esource_data}

Data points: {json.dumps(data_points)}

Please perform detailed verification analysis."""

    print("📝 Request Message:")
    print(request_message)
    print()

    print("🎯 Expected Response:")
    print("A JSON dictionary with verification results:")
    expected_response = {
        "verified": True,
        "verified_data_points": [
            "patient_id",
            "date_of_birth",
            "height",
            "weight",
            "bmi",
        ],
        "unverified_data_points": [],
        "missing_data_points": [],
        "discrepancy_data_points": ["gender", "medical_history"],
        "additional_information_needed": [],
    }
    print(json.dumps(expected_response, indent=2))
    print()


def demo_data_quality_review():
    """Demonstrate data quality review capability"""
    print("📊 DEMO: Data Quality Review")
    print("=" * 50)

    # Sample source data
    source_data = """
Patient Demographics and Vitals - Visit 1

Patient ID: SUB-001
Date of Birth: 01/15/1980
Gender: Male
Height: 175 cm
Weight: 80 kg
BMI: 26.1
Blood Pressure: 120/80 mmHg
Heart Rate: 72 bpm
Temperature: 98.6°F
Medical History: Hypertension, Diabetes Type 2
Current Medications: Metformin 500mg BID, Lisinopril 10mg QD
Allergies: None known
Visit Date: 2024-01-15
Investigator: Dr. Smith
    """

    print("📄 Source Data:")
    print(source_data)
    print()

    # Create the request message
    request_message = f"""Data quality review:

Source data: {source_data}

Please perform a comprehensive data quality assessment."""

    print("📝 Request Message:")
    print(request_message)
    print()

    print("🎯 Expected Response:")
    print("A JSON dictionary with quality metrics and issues:")
    expected_response = {
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
                "recommendation": "Collect race and ethnicity data per protocol requirements",
            }
        ],
        "data_completeness": {
            "required_fields_present": 90,
            "optional_fields_present": 75,
            "missing_required_fields": ["race", "ethnicity"],
            "missing_optional_fields": ["emergency_contact"],
        },
        "data_accuracy": {
            "logical_consistency": 95,
            "value_ranges_valid": 100,
            "date_consistency": 100,
            "cross_field_validation": 90,
        },
        "recommendations": [
            "Complete missing demographic information",
            "Verify medication dosing accuracy",
            "Add emergency contact information",
        ],
    }
    print(json.dumps(expected_response, indent=2))
    print()


def demo_protocol_compliance_review():
    """Demonstrate protocol compliance review capability"""
    print("📋 DEMO: Protocol Compliance Review")
    print("=" * 50)

    # Sample source data
    source_data = """
Visit 2 - Week 4 Assessment

Patient ID: SUB-001
Visit Date: 2024-02-12
Visit Window: +3 days (within protocol)
Weight: 78 kg (2 kg weight loss)
Blood Pressure: 118/78 mmHg
Heart Rate: 70 bpm
Adverse Events: None
Concomitant Medications: Metformin 500mg BID, Lisinopril 10mg QD
Study Drug Compliance: 95%
Physical Exam: Normal
Lab Results: Pending
    """

    # Sample protocol requirements
    protocol_requirements = """
Protocol Requirements:
- Visit 2 must occur at Week 4 ± 3 days
- Weight must be measured and recorded
- Blood pressure must be measured
- Heart rate must be measured
- Adverse events must be documented
- Concomitant medications must be recorded
- Study drug compliance must be ≥90%
- Physical exam must be performed
- Lab results must be available within 7 days
    """

    print("📄 Source Data:")
    print(source_data)
    print()
    print("📋 Protocol Requirements:")
    print(protocol_requirements)
    print()

    # Create the request message
    request_message = f"""Protocol compliance review:

Source data: {source_data}

Protocol requirements: {protocol_requirements}

Please verify adherence to protocol specifications."""

    print("📝 Request Message:")
    print(request_message)
    print()

    print("🎯 Expected Response:")
    print("A JSON dictionary with compliance status and violations:")
    expected_response = {
        "overall_compliance_score": 90,
        "compliance_status": "compliant",
        "protocol_adherence": {
            "inclusion_criteria_met": True,
            "exclusion_criteria_violated": False,
            "visit_schedule_adherence": 100,
            "data_collection_timeliness": 85,
            "required_assessments_completed": 90,
        },
        "violations": [],
        "missing_requirements": [
            {
                "requirement_type": "lab_results",
                "description": "Lab results pending - must be available within 7 days",
                "protocol_reference": "Section 4.2.3",
                "impact": "May delay data analysis",
            }
        ],
        "recommendations": [
            "Ensure lab results are available within 7 days",
            "Complete physical exam documentation",
            "Verify study drug compliance calculation",
        ],
    }
    print(json.dumps(expected_response, indent=2))
    print()


def demo_data_integrity_review():
    """Demonstrate data integrity review capability"""
    print("🔒 DEMO: Data Integrity Review")
    print("=" * 50)

    # Sample source data with potential integrity issues
    source_data = """
Patient Demographics - Updated

Patient ID: SUB-001
Date of Birth: 01/15/1980
Gender: Male
Height: 175 cm
Weight: 80 kg (previously recorded as 82 kg on 2024-01-15)
BMI: 26.1
Blood Pressure: 120/80 mmHg
Heart Rate: 72 bpm
Temperature: 98.6°F
Medical History: Hypertension, Diabetes Type 2
Current Medications: Metformin 500mg BID, Lisinopril 10mg QD
Allergies: None known
Visit Date: 2024-01-20
Investigator: Dr. Smith
Last Modified: 2024-01-21 14:30:00
Modified By: Dr. Smith
Reason for Change: Data correction - weight measurement error
    """

    print("📄 Source Data:")
    print(source_data)
    print()

    # Create the request message
    request_message = f"""Data integrity review:

Source data: {source_data}

Please identify potential data integrity issues and inconsistencies."""

    print("📝 Request Message:")
    print(request_message)
    print()

    print("🎯 Expected Response:")
    print("A JSON dictionary with integrity findings:")
    expected_response = {
        "overall_integrity_score": 95,
        "integrity_status": "intact",
        "integrity_issues": [
            {
                "issue_type": "data_manipulation",
                "severity": "low",
                "description": "Weight data modified after initial entry",
                "affected_data": "weight field",
                "evidence": "Weight changed from 82 kg to 80 kg with documented reason",
                "recommendation": "Verify weight measurement accuracy and document correction process",
            }
        ],
        "audit_trail_analysis": {
            "timestamps_consistent": True,
            "user_actions_logged": True,
            "data_modifications_tracked": True,
            "suspicious_activity_detected": False,
        },
        "data_lineage": {
            "source_traceability": 100,
            "transformation_integrity": 100,
            "version_control": 100,
        },
        "recommendations": [
            "Maintain detailed audit trail for all data modifications",
            "Implement additional validation for critical measurements",
            "Regular review of data modification patterns",
        ],
    }
    print(json.dumps(expected_response, indent=2))
    print()


def demo_comprehensive_review_report():
    """Demonstrate comprehensive review report capability"""
    print("📄 DEMO: Comprehensive Review Report")
    print("=" * 50)

    # Sample source data
    source_data = """
Patient Study Data - Complete Assessment

Patient ID: SUB-001
Study: ABC-123-001
Site: 001
Investigator: Dr. Smith

Baseline Visit (Day 1):
- Date: 2024-01-15
- Demographics: Complete
- Medical History: Hypertension, Diabetes Type 2
- Medications: Metformin 500mg BID, Lisinopril 10mg QD
- Vital Signs: BP 120/80, HR 72, Temp 98.6°F
- Lab Results: HbA1c 7.2%, Glucose 140 mg/dL
- Physical Exam: Normal

Week 4 Visit:
- Date: 2024-02-12
- Weight: 78 kg (2 kg loss)
- Vital Signs: BP 118/78, HR 70
- Adverse Events: None
- Study Drug Compliance: 95%
- Lab Results: Pending

Week 8 Visit:
- Date: 2024-03-12
- Weight: 76 kg (4 kg total loss)
- Vital Signs: BP 115/75, HR 68
- Adverse Events: Mild headache (Day 45-47)
- Study Drug Compliance: 98%
- Lab Results: HbA1c 6.8%, Glucose 125 mg/dL
    """

    print("📄 Source Data:")
    print(source_data)
    print()

    # Create the request message
    request_message = f"""Comprehensive review report:

Source data: {source_data}

Please generate a detailed review report with all findings and recommendations."""

    print("📝 Request Message:")
    print(request_message)
    print()

    print("🎯 Expected Response:")
    print("A structured comprehensive report with multiple sections:")
    print(
        """
# TRIAL MONITOR COMPREHENSIVE REVIEW REPORT

## EXECUTIVE SUMMARY
- Overall assessment score: 88/100
- Key findings: Good data quality with minor compliance issues
- Critical issues: Lab results delay at Week 4
- Recommendations priority: High - Address lab result timeliness

## DATA QUALITY ASSESSMENT
- Completeness: 92% - Most required fields present
- Accuracy: 90% - Consistent measurements across visits
- Consistency: 95% - Good internal consistency
- Validity: 88% - Some missing optional data

## PROTOCOL COMPLIANCE REVIEW
- Compliance status: Compliant with minor issues
- Visit timing: All visits within protocol windows
- Data collection: 90% complete
- Missing: Week 4 lab results (pending)

## DATA INTEGRITY ANALYSIS
- Integrity status: Intact
- Audit trail: Complete and consistent
- Data lineage: Fully traceable
- No suspicious activity detected

## PATIENT DATA VALIDATION
- Data verification: 85% verified
- Patient matching: Confirmed
- Data derivability: 90% derivable
- Validation findings: Minor discrepancies in medical history format

## DETAILED FINDINGS
1. Lab results delay at Week 4 visit
2. Missing optional demographic data
3. Good study drug compliance
4. Consistent vital sign improvements
5. Minor data format inconsistencies

## RECOMMENDATIONS
- Immediate: Obtain Week 4 lab results
- Short-term: Complete missing demographic data
- Long-term: Implement automated lab result tracking
- Process: Enhance data collection timeliness

## APPENDICES
- Detailed quality metrics
- Compliance checklist
- Integrity verification log
- Patient data validation results
    """
    )
    print()


def demo_clinical_trial_analysis():
    """Demonstrate clinical trial protocol analysis capability"""
    print("🏥 DEMO: Clinical Trial Protocol Analysis")
    print("=" * 50)

    # Sample clinical trial protocol text
    protocol_text = """
PROTOCOL TITLE: A Phase III, Randomized, Double-Blind, Placebo-Controlled Study to Evaluate the Efficacy and Safety of DrugX in Patients with Type 2 Diabetes Mellitus

PROTOCOL NUMBER: DRGX-2024-001

STUDY PHASE: Phase III

STUDY DESIGN: Randomized, double-blind, placebo-controlled, parallel-group study

SAMPLE SIZE: 500 patients (250 per group)

PRIMARY OBJECTIVE: To evaluate the efficacy of DrugX compared to placebo in reducing HbA1c levels in patients with Type 2 diabetes mellitus

PRIMARY ENDPOINT: Change from baseline in HbA1c at Week 24

SECONDARY ENDPOINTS: 
- Change from baseline in fasting plasma glucose at Week 24
- Proportion of patients achieving HbA1c <7.0% at Week 24
- Change from baseline in body weight at Week 24

INCLUSION CRITERIA:
- Male or female patients aged 18-75 years
- Diagnosis of Type 2 diabetes mellitus for at least 6 months
- HbA1c between 7.0% and 10.5% at screening
- BMI between 25 and 45 kg/m²
- Stable diabetes medication for at least 8 weeks

EXCLUSION CRITERIA:
- Type 1 diabetes mellitus
- Severe renal impairment (eGFR <30 mL/min/1.73m²)
- History of diabetic ketoacidosis
- Pregnant or lactating women
- Known hypersensitivity to study drug

MONITORING SCHEDULE:
- Screening visit (Week -4)
- Baseline visit (Week 0)
- Treatment visits at Weeks 4, 8, 12, 16, 20, 24
- Follow-up visit at Week 28

SDV REQUIREMENTS:
- 100% SDV for primary efficacy endpoints
- 100% SDV for safety data
- 10% random SDV for other data points
- Source document verification for all AEs

SAFETY MONITORING:
- Adverse event reporting throughout study
- Laboratory safety assessments at each visit
- ECG monitoring at screening and Week 24
- DSMB review at 25% and 50% enrollment

STATISTICAL ANALYSIS:
- Primary analysis: ANCOVA with baseline HbA1c as covariate
- Sample size: 500 patients (90% power, 2-sided α=0.05)
- Interim analysis planned at 50% enrollment
    """

    print("📄 Clinical Trial Protocol Text:")
    print(protocol_text[:200] + "...")
    print()

    # Create the request message
    request_message = f"""Clinical trial analysis:

{protocol_text}

Please analyze this clinical trial protocol and extract structured information."""

    print("📝 Request Message:")
    print(request_message[:300] + "...")
    print()

    print("🎯 Expected Response:")
    print("A structured markdown analysis with the following sections:")
    print(
        """
# Clinical Trial Protocol Analysis

## 1. Trial Overview
- Protocol title/name: A Phase III, Randomized, Double-Blind, Placebo-Controlled Study...
- Protocol number: DRGX-2024-001
- Study phase: Phase III
- Trial type: Interventional

## 2. Primary Objectives and Endpoints
- Primary objectives: To evaluate the efficacy of DrugX compared to placebo...
- Primary endpoints: Change from baseline in HbA1c at Week 24
- Secondary endpoints: Change in fasting plasma glucose, HbA1c <7.0%, body weight

## 3. Trial Design
- Study design: Randomized, double-blind, placebo-controlled, parallel-group
- Randomization: Yes
- Blinding: Double-blind
- Sample size: 500 patients (250 per group)

## 4. Eligibility Criteria
- Inclusion criteria: Age 18-75, Type 2 DM ≥6 months, HbA1c 7.0-10.5%, BMI 25-45
- Exclusion criteria: Type 1 DM, severe renal impairment, diabetic ketoacidosis...

## 5. Monitoring and SDV Requirements
- Monitoring schedule: Screening, Baseline, Weeks 4,8,12,16,20,24, Follow-up
- SDV requirements: 100% for primary endpoints and safety, 10% random for others
- Source document verification: Required for all AEs

## 6. Key Personnel and Sites
- Principal Investigators: [To be specified]
- Study sites: [To be specified]
- Sponsor: [To be specified]

## 7. Timeline and Visit Schedule
- Visit schedule: 8 visits over 28 weeks
- Key milestones: Screening, Baseline, Treatment visits, Follow-up
- Duration of participation: 28 weeks

## 8. Safety Monitoring
- Safety endpoints: Adverse events, laboratory assessments, ECG
- Adverse event monitoring: Throughout study
- DSMB requirements: Review at 25% and 50% enrollment

## 9. Statistical Analysis Plan
- Statistical methods: ANCOVA with baseline HbA1c as covariate
- Primary analysis: Change from baseline in HbA1c at Week 24
- Sample size calculation: 500 patients (90% power, α=0.05)

## 10. Other Important Details
- Special procedures: ECG monitoring, laboratory assessments
- Regulatory information: Phase III study for regulatory submission
    """
    )
    print()


def demo_monitoring_plan_generation():
    """Demonstrate monitoring plan generation capability"""
    print("📋 DEMO: Monitoring Plan Generation")
    print("=" * 50)

    # Sample protocol context (from previous analysis)
    protocol_context = """
# Clinical Trial Protocol Analysis

## 1. Trial Overview
- Protocol title: A Phase III, Randomized, Double-Blind, Placebo-Controlled Study to Evaluate the Efficacy and Safety of DrugX in Patients with Type 2 Diabetes Mellitus
- Protocol number: DRGX-2024-001
- Study phase: Phase III
- Trial type: Interventional

## 2. Primary Objectives and Endpoints
- Primary objectives: To evaluate the efficacy of DrugX compared to placebo in reducing HbA1c levels
- Primary endpoints: Change from baseline in HbA1c at Week 24
- Secondary endpoints: Change in fasting plasma glucose, HbA1c <7.0%, body weight

## 3. Trial Design
- Study design: Randomized, double-blind, placebo-controlled, parallel-group
- Sample size: 500 patients (250 per group)
- Duration: 28 weeks

## 4. Eligibility Criteria
- Inclusion: Age 18-75, Type 2 DM ≥6 months, HbA1c 7.0-10.5%, BMI 25-45
- Exclusion: Type 1 DM, severe renal impairment, diabetic ketoacidosis

## 5. Monitoring and SDV Requirements
- Monitoring schedule: Screening, Baseline, Weeks 4,8,12,16,20,24, Follow-up
- SDV requirements: 100% for primary endpoints and safety, 10% random for others
- Source document verification: Required for all AEs

## 6. Safety Monitoring
- Safety endpoints: Adverse events, laboratory assessments, ECG
- DSMB requirements: Review at 25% and 50% enrollment
    """

    print("📄 Protocol Context:")
    print(protocol_context[:200] + "...")
    print()

    # Create the request message
    request_message = f"""Generate monitoring plan:

{protocol_context}

Please generate a comprehensive monitoring plan including remote source data verification (SDV) plan based on this protocol context."""

    print("📝 Request Message:")
    print(request_message[:300] + "...")
    print()

    print("🎯 Expected Response:")
    print("A comprehensive monitoring plan with the following sections:")
    print(
        """
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
    """
    )
    print()


def main():
    """Run all demonstrations"""
    print("🔍 TrialMonitor Agent - Comprehensive Capabilities Demo")
    print("=" * 80)
    print()

    print("The TrialMonitor Agent combines all capabilities into one unified agent:")
    print("1. File Ranking Request - Rank eSource files by relevance")
    print("2. Data Point Extraction Request - Extract data point keys")
    print("3. Data Verification Request - Verify CRF vs eSource data")
    print("4. Data Quality Review - Comprehensive quality assessment")
    print("5. Protocol Compliance Review - Verify protocol adherence")
    print("6. Data Integrity Review - Identify integrity issues")
    print("7. Comprehensive Review Report - Detailed analysis reports")
    print(
        "8. Clinical Trial Protocol Analysis - Analyze protocol text and extract structured information"
    )
    print(
        "9. Monitoring Plan Generation - Generate comprehensive monitoring plans including remote SDV plans"
    )
    print()

    # Run demonstrations
    demo_file_ranking()
    demo_data_extraction()
    demo_data_verification()
    demo_data_quality_review()
    demo_protocol_compliance_review()
    demo_data_integrity_review()
    demo_comprehensive_review_report()
    demo_clinical_trial_analysis()
    demo_monitoring_plan_generation()

    print("=" * 80)
    print("✅ Demo Complete!")
    print()
    print("🚀 To test the TrialMonitor agent:")
    print("1. Start the agent: python trial_monitor_agent.py")
    print("2. Send any of the request messages shown above")
    print("3. The agent will detect the request type and respond accordingly")
    print()
    print("📊 Key Features:")
    print("• Unified interface for all trial monitoring needs")
    print("• Automated request type detection")
    print("• Structured JSON responses for all request types")
    print("• Comprehensive error handling and guidance")
    print("• Detailed logging and request tracking")
    print("• Conversation history and context maintenance")
    print()
    print("🔧 Agent Configuration:")
    print("• Port: 8004")
    print("• Model: Gemini 2.5 Flash")
    print("• Temperature: 0.1 (precise analysis)")
    print("• Max tokens: 4096")
    print("• Seed: TrialMonitor2024!")
    print()
    print("🎯 Benefits of Unified Agent:")
    print("• Single point of access for all trial monitoring")
    print("• Consistent response formats across all capabilities")
    print("• Reduced complexity in agent management")
    print("• Better context sharing between different analysis types")
    print("• Streamlined deployment and maintenance")


if __name__ == "__main__":
    main()
