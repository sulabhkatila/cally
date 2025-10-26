#!/usr/bin/env python3
"""
Demonstration script for the updated Patient Data Validator Agent

This script shows the 3 new capabilities:
1. File Ranking Request
2. Data Point Extraction Request
3. Data Verification Request
"""

import json


def demo_file_ranking():
    """Demonstrate file ranking capability"""
    print("🔬 DEMO: File Ranking Request")
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


def main():
    """Run all demonstrations"""
    print("🔬 Patient Data Validator Agent - Updated Capabilities Demo")
    print("=" * 70)
    print()

    print("The updated agent now supports 3 specific request types:")
    print("1. File Ranking Request")
    print("2. Data Point Extraction Request")
    print("3. Data Verification Request")
    print()

    # Run demonstrations
    demo_file_ranking()
    demo_data_extraction()
    demo_data_verification()

    print("=" * 70)
    print("✅ Demo Complete!")
    print()
    print("🚀 To test the agent:")
    print("1. Start the agent: python patient_data_validator_agent.py")
    print("2. Send any of the request messages shown above")
    print("3. The agent will detect the request type and respond accordingly")
    print()
    print("📊 Key Improvements:")
    print("• Structured request detection")
    print("• Specific response formats for each request type")
    print("• Better error handling and parsing")
    print("• Clear usage examples and guidance")


if __name__ == "__main__":
    main()
