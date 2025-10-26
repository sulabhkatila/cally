#!/usr/bin/env python3
"""
Demonstration script for the Source Data Review Agent

This script shows the 4 main capabilities:
1. Data Quality Review
2. Protocol Compliance Review
3. Data Integrity Review
4. Comprehensive Review Report
"""

import json


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
# SOURCE DATA REVIEW REPORT

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

## DETAILED FINDINGS
1. Lab results delay at Week 4 visit
2. Missing optional demographic data
3. Good study drug compliance
4. Consistent vital sign improvements

## RECOMMENDATIONS
- Immediate: Obtain Week 4 lab results
- Short-term: Complete missing demographic data
- Long-term: Implement automated lab result tracking
- Process: Enhance data collection timeliness

## APPENDICES
- Detailed quality metrics
- Compliance checklist
- Integrity verification log
    """
    )
    print()


def main():
    """Run all demonstrations"""
    print("🔍 Source Data Review Agent - Capabilities Demo")
    print("=" * 70)
    print()

    print("The Source Data Review Agent supports 4 main capabilities:")
    print("1. Data Quality Review - Comprehensive quality assessment")
    print("2. Protocol Compliance Review - Verify protocol adherence")
    print("3. Data Integrity Review - Identify integrity issues")
    print("4. Comprehensive Review Report - Detailed analysis reports")
    print()

    # Run demonstrations
    demo_data_quality_review()
    demo_protocol_compliance_review()
    demo_data_integrity_review()
    demo_comprehensive_review_report()

    print("=" * 70)
    print("✅ Demo Complete!")
    print()
    print("🚀 To test the agent:")
    print("1. Start the agent: python source_data_review_agent.py")
    print("2. Send any of the request messages shown above")
    print("3. The agent will detect the request type and respond accordingly")
    print()
    print("📊 Key Features:")
    print("• Automated data quality assessment")
    print("• Protocol compliance verification")
    print("• Data integrity analysis")
    print("• Comprehensive reporting")
    print("• Structured JSON responses")
    print("• Detailed recommendations")
    print()
    print("🔧 Agent Configuration:")
    print("• Port: 8003")
    print("• Model: Gemini 2.5 Flash")
    print("• Temperature: 0.1 (precise analysis)")
    print("• Max tokens: 4096")


if __name__ == "__main__":
    main()
