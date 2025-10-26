#!/usr/bin/env python3
"""
Test script for the new protocol analysis workflow
"""

import requests
import json


def test_protocol_analysis():
    """Test the protocol analysis endpoint"""

    # Test data - simulate a protocol text file
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

    # Create a temporary text file
    with open("test_protocol.txt", "w") as f:
        f.write(protocol_text)

    try:
        # Test the protocol analysis endpoint
        print("Testing protocol analysis endpoint...")

        with open("test_protocol.txt", "rb") as f:
            files = {"file": ("test_protocol.txt", f, "text/plain")}
            response = requests.post(
                "http://localhost:5000/api/analyze-protocol", files=files
            )

        if response.status_code == 200:
            result = response.json()
            print("✅ Protocol analysis successful!")
            print(
                f"Study Title: {result.get('trial_overview', {}).get('protocol_title', 'N/A')}"
            )
            print(
                f"Phase: {result.get('trial_overview', {}).get('study_phase', 'N/A')}"
            )
            print(
                f"Sample Size: {result.get('trial_design', {}).get('sample_size', 'N/A')}"
            )
            print(f"Duration: {result.get('trial_design', {}).get('duration', 'N/A')}")
        else:
            print(f"❌ Protocol analysis failed: {response.status_code}")
            print(response.text)

    except Exception as e:
        print(f"❌ Error testing protocol analysis: {e}")

    finally:
        # Clean up
        import os

        if os.path.exists("test_protocol.txt"):
            os.remove("test_protocol.txt")


def test_study_creation():
    """Test creating a study with protocol analysis"""

    print("\nTesting study creation with protocol analysis...")

    study_data = {
        "title": "Test Study from Protocol Analysis",
        "protocol": "test_protocol.txt",
        "sponsor": "Test Sponsor",
        "phase": "Phase III",
        "indication": "Type 2 Diabetes",
        "protocolAnalysis": {
            "trial_overview": {
                "protocol_title": "Test Protocol",
                "study_phase": "Phase III",
                "indication": "Type 2 Diabetes",
            },
            "trial_design": {"sample_size": "500 patients", "duration": "24 weeks"},
        },
    }

    try:
        response = requests.post("http://localhost:5000/api/studies", json=study_data)

        if response.status_code == 201:
            result = response.json()
            print("✅ Study creation successful!")
            print(f"Study ID: {result.get('study', {}).get('id', 'N/A')}")
            print(f"Title: {result.get('study', {}).get('title', 'N/A')}")
            print(
                f"Has Protocol Analysis: {'protocolAnalysis' in result.get('study', {})}"
            )
        else:
            print(f"❌ Study creation failed: {response.status_code}")
            print(response.text)

    except Exception as e:
        print(f"❌ Error testing study creation: {e}")


if __name__ == "__main__":
    print("🧪 Testing Protocol Analysis Workflow")
    print("=" * 50)

    test_protocol_analysis()
    test_study_creation()

    print("\n✅ Testing complete!")
