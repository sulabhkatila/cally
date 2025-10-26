#!/usr/bin/env python3
"""
Test script for the optimized demo workflow
"""

import requests
import json


def test_phase_ii_analysis():
    """Test Phase II protocol analysis"""

    print("🧪 Testing Phase II Protocol Analysis")
    print("=" * 50)

    # Create a test file with Phase II in the name
    protocol_text = "This is a test Phase II protocol document"

    with open("test_phase_ii_protocol.txt", "w") as f:
        f.write(protocol_text)

    try:
        # Test the protocol analysis endpoint
        print("📄 Uploading Phase II protocol file...")

        with open("test_phase_ii_protocol.txt", "rb") as f:
            files = {"file": ("test_phase_ii_protocol.txt", f, "text/plain")}
            response = requests.post(
                "http://localhost:5001/api/analyze-protocol", files=files
            )

        if response.status_code == 200:
            result = response.json()
            print("✅ Phase II Protocol analysis successful!")
            print(
                f"Study Title: {result.get('trial_overview', {}).get('protocol_title', 'N/A')}"
            )
            print(
                f"Phase: {result.get('trial_overview', {}).get('study_phase', 'N/A')}"
            )
            print(f"Sponsor: {result.get('trial_overview', {}).get('sponsor', 'N/A')}")
            print(
                f"Sample Size: {result.get('trial_design', {}).get('sample_size', 'N/A')}"
            )
            print(f"Duration: {result.get('trial_design', {}).get('duration', 'N/A')}")
            print(
                f"Inclusion Criteria Count: {len(result.get('eligibility_criteria', {}).get('inclusion_criteria', []))}"
            )
            print(
                f"Exclusion Criteria Count: {len(result.get('eligibility_criteria', {}).get('exclusion_criteria', []))}"
            )
            print(
                f"Schedule of Assessments: {len(result.get('schedule_of_assessments', {}))} sections"
            )
        else:
            print(f"❌ Phase II Protocol analysis failed: {response.status_code}")
            print(response.text)

    except Exception as e:
        print(f"❌ Error testing Phase II analysis: {e}")

    finally:
        # Clean up
        import os

        if os.path.exists("test_phase_ii_protocol.txt"):
            os.remove("test_phase_ii_protocol.txt")


def test_non_phase_ii_analysis():
    """Test non-Phase II protocol analysis (should return error)"""

    print("\n🧪 Testing Non-Phase II Protocol Analysis")
    print("=" * 50)

    # Create a test file without Phase II in the name
    protocol_text = "This is a test Phase III protocol document"

    with open("test_protocol_phase3.txt", "w") as f:
        f.write(protocol_text)

    try:
        # Test the protocol analysis endpoint
        print("📄 Uploading Phase III protocol file...")

        with open("test_protocol_phase3.txt", "rb") as f:
            files = {"file": ("test_protocol_phase3.txt", f, "text/plain")}
            response = requests.post(
                "http://localhost:5001/api/analyze-protocol", files=files
            )

        if response.status_code == 400:
            result = response.json()
            print("✅ Non-Phase II Protocol correctly rejected!")
            print(f"Error: {result.get('error', 'N/A')}")
        else:
            print(f"❌ Expected error 400, got: {response.status_code}")
            print(response.text)

    except Exception as e:
        print(f"❌ Error testing non-Phase II analysis: {e}")

    finally:
        # Clean up
        import os

        if os.path.exists("test_protocol_phase3.txt"):
            os.remove("test_protocol_phase3.txt")


def test_monitoring_plan_generation():
    """Test monitoring plan generation"""

    print("\n🧪 Testing Monitoring Plan Generation")
    print("=" * 50)

    # Sample protocol analysis data
    protocol_analysis = {
        "trial_overview": {
            "protocol_title": "A Phase II, Randomized, Double-Blind, Placebo-Controlled, Parallel-Group Study to Evaluate the Efficacy, Safety, and Pharmacokinetics of ARX-945, an Oral Selective JAK3 Inhibitor, in Adults with Moderate-to-Severe Rheumatoid Arthritis",
            "study_phase": "Phase II",
            "sponsor": "Regeneron Pharmaceuticals",
            "indication": "Moderate-to-Severe Rheumatoid Arthritis",
        },
        "primary_objectives": {"primary_endpoints": "ACR50 response rate at Week 12"},
        "trial_design": {
            "duration": "24 weeks (12 weeks treatment + 12 weeks follow-up)"
        },
        "eligibility_criteria": {
            "exclusion_criteria": [
                "Prior JAK inhibitor use",
                "Active or latent TB without completed prophylaxis",
            ]
        },
    }

    try:
        # Test the monitoring plan generation endpoint
        print("📋 Generating monitoring plan...")

        response = requests.post(
            "http://localhost:5001/api/generate-monitoring-plan",
            json={"protocol_analysis": protocol_analysis},
        )

        if response.status_code == 200:
            result = response.json()
            print("✅ Monitoring plan generation successful!")
            monitoring_plan = result.get("monitoring_plan", "")
            print(f"Plan length: {len(monitoring_plan)} characters")
            print(
                f"Contains Executive Summary: {'EXECUTIVE SUMMARY' in monitoring_plan}"
            )
            print(f"Contains SDV Plan: {'SOURCE DATA VERIFICATION' in monitoring_plan}")
            print(f"Contains Risk Assessment: {'RISK ASSESSMENT' in monitoring_plan}")
            print(
                f"Contains Regulatory Considerations: {'REGULATORY CONSIDERATIONS' in monitoring_plan}"
            )
        else:
            print(f"❌ Monitoring plan generation failed: {response.status_code}")
            print(response.text)

    except Exception as e:
        print(f"❌ Error testing monitoring plan generation: {e}")


def test_complete_workflow():
    """Test the complete workflow from protocol analysis to study creation"""

    print("\n🧪 Testing Complete Workflow")
    print("=" * 50)

    # Step 1: Analyze protocol
    print("Step 1: Analyzing protocol...")
    protocol_analysis = {
        "trial_overview": {
            "protocol_title": "A Phase II, Randomized, Double-Blind, Placebo-Controlled, Parallel-Group Study to Evaluate the Efficacy, Safety, and Pharmacokinetics of ARX-945, an Oral Selective JAK3 Inhibitor, in Adults with Moderate-to-Severe Rheumatoid Arthritis",
            "study_phase": "Phase II",
            "sponsor": "Regeneron Pharmaceuticals",
            "indication": "Moderate-to-Severe Rheumatoid Arthritis",
        },
        "trial_design": {
            "sample_size": "180 patients (120 active, 60 placebo)",
            "duration": "24 weeks (12 weeks treatment + 12 weeks follow-up)",
        },
        "key_personnel": {"principal_investigators": "To be assigned per site"},
    }

    # Step 2: Generate monitoring plan
    print("Step 2: Generating monitoring plan...")
    try:
        response = requests.post(
            "http://localhost:5001/api/generate-monitoring-plan",
            json={"protocol_analysis": protocol_analysis},
        )

        if response.status_code == 200:
            monitoring_plan = response.json().get("monitoring_plan", "")
            print("✅ Monitoring plan generated successfully!")
        else:
            print(f"❌ Monitoring plan generation failed: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Error generating monitoring plan: {e}")
        return

    # Step 3: Create study
    print("Step 3: Creating study...")
    study_data = {
        "title": protocol_analysis["trial_overview"]["protocol_title"],
        "protocol": "test_phase_ii_protocol.txt",
        "sponsor": "Test Sponsor",
        "phase": protocol_analysis["trial_overview"]["study_phase"],
        "indication": protocol_analysis["trial_overview"]["indication"],
        "protocolAnalysis": protocol_analysis,
    }

    try:
        response = requests.post("http://localhost:5001/api/studies", json=study_data)

        if response.status_code == 201:
            result = response.json()
            print("✅ Study created successfully!")
            print(f"Study ID: {result.get('study', {}).get('id', 'N/A')}")
            print(f"Title: {result.get('study', {}).get('title', 'N/A')}")
            print(
                f"Has Protocol Analysis: {'protocolAnalysis' in result.get('study', {})}"
            )
        else:
            print(f"❌ Study creation failed: {response.status_code}")
            print(response.text)

    except Exception as e:
        print(f"❌ Error creating study: {e}")


if __name__ == "__main__":
    print("🚀 Testing Optimized Demo Workflow")
    print("=" * 60)

    test_phase_ii_analysis()
    test_non_phase_ii_analysis()
    test_monitoring_plan_generation()
    test_complete_workflow()

    print("\n✅ All tests completed!")
    print("\n📝 Demo Instructions:")
    print("1. Upload a file with 'Phase-II' or 'phase_ii' in the filename")
    print("2. Click 'Analyze Protocol' to see the hardcoded Phase II data")
    print("3. Click 'Generate Monitoring Plan' to see the monitoring plan")
    print("4. Click 'Create Study' to create the study with all extracted data")
    print("5. Upload any other file to see 'Error: code 789'")
