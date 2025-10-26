/**
 * File Scraping Service
 * Handles extraction of content from PDF and DOCX files for TrialMonitor agent
 */

// Mock file content extraction (in real implementation, this would use PDF.js or similar)
export const extractFileContent = async (fileName, fileType) => {
    try {
        console.log(`Extracting content from ${fileName} (${fileType})`);

        // Simulate file content extraction based on file type
        if (fileType === "crf") {
            return await extractCRFContent(fileName);
        } else if (fileType === "source") {
            return await extractSourceContent(fileName);
        }

        throw new Error(`Unsupported file type: ${fileType}`);
    } catch (error) {
        console.error(`Error extracting content from ${fileName}:`, error);
        throw error;
    }
};

// Extract content from CRF files
const extractCRFContent = async (fileName) => {
    // Mock CRF content based on file name
    const crfContentMap = {
        "crf_sub_1_adverseeffect.pdf": {
            content: `ADVERSE EVENT REPORT
Patient ID: SUB-001
Date of Event: 2024-01-15
Event Description: Mild headache
Severity: Grade 1
Action Taken: None
Outcome: Recovered
Investigator Assessment: Not related to study drug`,
            dataPoints: [
                "patient_id",
                "event_date",
                "event_description",
                "severity",
                "action_taken",
                "outcome",
                "investigator_assessment",
            ],
        },
        "crf_sub_1_Demographics.pdf": {
            content: `DEMOGRAPHICS FORM
Patient ID: SUB-001
Date of Birth: 1985-03-22
Age: 39 years
Gender: Female
Race: Caucasian
Ethnicity: Non-Hispanic
Height: 165 cm
Weight: 68 kg
BMI: 25.0 kg/m²`,
            dataPoints: [
                "patient_id",
                "date_of_birth",
                "age",
                "gender",
                "race",
                "ethnicity",
                "height",
                "weight",
                "bmi",
            ],
        },
        "crf_sub_1_diseaseActivityAssessment.pdf": {
            content: `DISEASE ACTIVITY ASSESSMENT
Patient ID: SUB-001
Assessment Date: 2024-01-10
DAS28 Score: 4.2
Swollen Joint Count: 8
Tender Joint Count: 12
ESR: 28 mm/h
CRP: 1.2 mg/L
Patient Global Assessment: 6/10
Physician Global Assessment: 5/10`,
            dataPoints: [
                "patient_id",
                "assessment_date",
                "das28_score",
                "swollen_joint_count",
                "tender_joint_count",
                "esr",
                "crp",
                "patient_global",
                "physician_global",
            ],
        },
        "crf_sub_1_medicalhistory.pdf": {
            content: `MEDICAL HISTORY
Patient ID: SUB-001
Primary Diagnosis: Rheumatoid Arthritis
Diagnosis Date: 2020-05-15
Previous Medications: Methotrexate, Hydroxychloroquine
Allergies: None known
Concomitant Conditions: Hypertension
Family History: Mother - RA, Father - Diabetes`,
            dataPoints: [
                "patient_id",
                "primary_diagnosis",
                "diagnosis_date",
                "previous_medications",
                "allergies",
                "concomitant_conditions",
                "family_history",
            ],
        },
        "crf_sub_1_medications.pdf": {
            content: `MEDICATION RECORD
Patient ID: SUB-001
Study Drug: ARX-945
Dose: 30 mg
Route: Oral
Start Date: 2024-01-01
End Date: Ongoing
Compliance: 100%
Concomitant Medications: Methotrexate 15mg weekly, Folic acid 5mg daily`,
            dataPoints: [
                "patient_id",
                "study_drug",
                "dose",
                "route",
                "start_date",
                "end_date",
                "compliance",
                "concomitant_medications",
            ],
        },
        "CRF_sub_1_week0-10.pdf": {
            content: `WEEKLY ASSESSMENT (Weeks 0-10)
Patient ID: SUB-001
Week 0: DAS28=5.1, Swollen=10, Tender=15
Week 2: DAS28=4.8, Swollen=8, Tender=12
Week 4: DAS28=4.2, Swollen=6, Tender=10
Week 6: DAS28=3.9, Swollen=5, Tender=8
Week 8: DAS28=3.5, Swollen=4, Tender=6
Week 10: DAS28=3.2, Swollen=3, Tender=5`,
            dataPoints: [
                "patient_id",
                "week_0_das28",
                "week_0_swollen",
                "week_0_tender",
                "week_2_das28",
                "week_2_swollen",
                "week_2_tender",
                "week_4_das28",
                "week_4_swollen",
                "week_4_tender",
                "week_6_das28",
                "week_6_swollen",
                "week_6_tender",
                "week_8_das28",
                "week_8_swollen",
                "week_8_tender",
                "week_10_das28",
                "week_10_swollen",
                "week_10_tender",
            ],
        },
        "crf_sub_1_week0.pdf": {
            content: `BASELINE ASSESSMENT (Week 0)
Patient ID: SUB-001
Visit Date: 2024-01-01
DAS28 Score: 5.1
Swollen Joint Count: 10
Tender Joint Count: 15
ESR: 35 mm/h
CRP: 2.1 mg/L
Patient Global Assessment: 8/10
Physician Global Assessment: 7/10
Physical Examination: Normal except for joint swelling`,
            dataPoints: [
                "patient_id",
                "visit_date",
                "das28_score",
                "swollen_joint_count",
                "tender_joint_count",
                "esr",
                "crp",
                "patient_global",
                "physician_global",
                "physical_examination",
            ],
        },
    };

    return (
        crfContentMap[fileName] || {
            content: `CRF Content for ${fileName}`,
            dataPoints: [
                "patient_id",
                "assessment_date",
                "primary_endpoint",
                "secondary_endpoint",
            ],
        }
    );
};

// Extract content from source files
const extractSourceContent = async (fileName) => {
    // Mock source content based on file name
    const sourceContentMap = {
        "Sub_1_DemographicParams.pdf": {
            content: `PATIENT DEMOGRAPHIC PARAMETERS
Patient: Jane Smith
DOB: March 22, 1985
Age: 39 years
Gender: Female
Race: Caucasian
Ethnicity: Non-Hispanic
Height: 165 cm
Weight: 68 kg
BMI: 25.0 kg/m²
Address: 123 Main St, City, State 12345
Phone: (555) 123-4567
Email: jane.smith@email.com`,
            dataPoints: [
                "patient_name",
                "date_of_birth",
                "age",
                "gender",
                "race",
                "ethnicity",
                "height",
                "weight",
                "bmi",
                "address",
                "phone",
                "email",
            ],
        },
        "Sub_1_DrugAccountabilityRecords.pdf": {
            content: `DRUG ACCOUNTABILITY RECORDS
Patient: SUB-001
Drug: ARX-945 30mg tablets
Dispensed: 2024-01-01
Quantity: 30 tablets
Returned: 2024-01-31
Quantity Returned: 2 tablets
Compliance: 93.3%
Dispensed By: Dr. Smith
Returned By: Patient`,
            dataPoints: [
                "patient_id",
                "drug_name",
                "dispensed_date",
                "quantity_dispensed",
                "returned_date",
                "quantity_returned",
                "compliance",
                "dispensed_by",
                "returned_by",
            ],
        },
        "Sub_1_MedicalHiistory.pdf": {
            content: `MEDICAL HISTORY RECORD
Patient: SUB-001
Primary Diagnosis: Rheumatoid Arthritis
Diagnosis Date: May 15, 2020
Previous Treatments: Methotrexate 15mg weekly, Hydroxychloroquine 200mg daily
Current Medications: ARX-945 30mg daily, Methotrexate 15mg weekly
Allergies: None documented
Family History: Mother - Rheumatoid Arthritis, Father - Type 2 Diabetes
Social History: Non-smoker, Occasional alcohol use`,
            dataPoints: [
                "patient_id",
                "primary_diagnosis",
                "diagnosis_date",
                "previous_treatments",
                "current_medications",
                "allergies",
                "family_history",
                "social_history",
            ],
        },
        "Sub_1_PatientDiary.pdf": {
            content: `PATIENT DIARY
Patient: SUB-001
Week 1: Pain level 7/10, Stiffness 6/10, Fatigue 5/10
Week 2: Pain level 6/10, Stiffness 5/10, Fatigue 4/10
Week 3: Pain level 5/10, Stiffness 4/10, Fatigue 3/10
Week 4: Pain level 4/10, Stiffness 3/10, Fatigue 2/10
Adverse Events: Mild headache on day 3
Medication Compliance: 100%`,
            dataPoints: [
                "patient_id",
                "week_1_pain",
                "week_1_stiffness",
                "week_1_fatigue",
                "week_2_pain",
                "week_2_stiffness",
                "week_2_fatigue",
                "week_3_pain",
                "week_3_stiffness",
                "week_3_fatigue",
                "week_4_pain",
                "week_4_stiffness",
                "week_4_fatigue",
                "adverse_events",
                "medication_compliance",
            ],
        },
        "Sub_1_Week0Joint.pdf": {
            content: `JOINT ASSESSMENT - WEEK 0
Patient: SUB-001
Assessment Date: January 1, 2024
Swollen Joints: MCP 2,3,4,5 (R), PIP 2,3,4 (L), Wrist (R)
Tender Joints: MCP 1,2,3,4,5 (R), PIP 1,2,3,4,5 (L), Wrist (R), Elbow (L)
Joint Count: Swollen=10, Tender=15
Assessor: Dr. Smith
Notes: Significant joint involvement bilaterally`,
            dataPoints: [
                "patient_id",
                "assessment_date",
                "swollen_joints",
                "tender_joints",
                "swollen_count",
                "tender_count",
                "assessor",
                "notes",
            ],
        },
        "Sub_1_Week0Labs.pdf": {
            content: `LABORATORY RESULTS - WEEK 0
Patient: SUB-001
Collection Date: January 1, 2024
ESR: 35 mm/h (Normal: <20)
CRP: 2.1 mg/L (Normal: <3.0)
RF: 45 IU/mL (Normal: <14)
Anti-CCP: 85 U/mL (Normal: <5)
CBC: WBC 7.2, RBC 4.1, Hgb 12.8, Hct 38.5
Chemistry: Normal
Liver Function: Normal
Creatinine: 0.9 mg/dL`,
            dataPoints: [
                "patient_id",
                "collection_date",
                "esr",
                "crp",
                "rf",
                "anti_ccp",
                "wbc",
                "rbc",
                "hgb",
                "hct",
                "liver_function",
                "creatinine",
            ],
        },
        "Sub_1_Week1_Physical.pdf": {
            content: `PHYSICAL EXAMINATION - WEEK 1
Patient: SUB-001
Exam Date: January 8, 2024
Vital Signs: BP 120/80, HR 72, Temp 98.6°F
General Appearance: Well-appearing
Cardiovascular: Normal
Pulmonary: Normal
Abdomen: Soft, non-tender
Extremities: Joint swelling noted in hands
Neurological: Normal
Assessment: Stable condition`,
            dataPoints: [
                "patient_id",
                "exam_date",
                "bp",
                "hr",
                "temp",
                "general_appearance",
                "cardiovascular",
                "pulmonary",
                "abdomen",
                "extremities",
                "neurological",
                "assessment",
            ],
        },
        "sub_1_week10_vitals.pdf": {
            content: `VITAL SIGNS - WEEK 10
Patient: SUB-001
Date: March 11, 2024
Blood Pressure: 118/78 mmHg
Heart Rate: 68 bpm
Temperature: 98.4°F
Respiratory Rate: 16/min
Oxygen Saturation: 98%
Weight: 67.5 kg
Height: 165 cm
BMI: 24.8 kg/m²`,
            dataPoints: [
                "patient_id",
                "date",
                "blood_pressure",
                "heart_rate",
                "temperature",
                "respiratory_rate",
                "oxygen_saturation",
                "weight",
                "height",
                "bmi",
            ],
        },
        "Sub_1_Week2Vitals.pdf": {
            content: `VITAL SIGNS - WEEK 2
Patient: SUB-001
Date: January 15, 2024
Blood Pressure: 122/82 mmHg
Heart Rate: 70 bpm
Temperature: 98.5°F
Respiratory Rate: 18/min
Oxygen Saturation: 97%
Weight: 68.2 kg
Height: 165 cm
BMI: 25.1 kg/m²`,
            dataPoints: [
                "patient_id",
                "date",
                "blood_pressure",
                "heart_rate",
                "temperature",
                "respiratory_rate",
                "oxygen_saturation",
                "weight",
                "height",
                "bmi",
            ],
        },
        "Sub_1_Week4Vitals.pdf": {
            content: `VITAL SIGNS - WEEK 4
Patient: SUB-001
Date: January 29, 2024
Blood Pressure: 119/79 mmHg
Heart Rate: 69 bpm
Temperature: 98.3°F
Respiratory Rate: 17/min
Oxygen Saturation: 98%
Weight: 67.8 kg
Height: 165 cm
BMI: 24.9 kg/m²`,
            dataPoints: [
                "patient_id",
                "date",
                "blood_pressure",
                "heart_rate",
                "temperature",
                "respiratory_rate",
                "oxygen_saturation",
                "weight",
                "height",
                "bmi",
            ],
        },
        "Sub_1_Week8_Vitals.pdf": {
            content: `VITAL SIGNS - WEEK 8
Patient: SUB-001
Date: February 26, 2024
Blood Pressure: 117/77 mmHg
Heart Rate: 67 bpm
Temperature: 98.2°F
Respiratory Rate: 16/min
Oxygen Saturation: 98%
Weight: 67.3 kg
Height: 165 cm
BMI: 24.7 kg/m²`,
            dataPoints: [
                "patient_id",
                "date",
                "blood_pressure",
                "heart_rate",
                "temperature",
                "respiratory_rate",
                "oxygen_saturation",
                "weight",
                "height",
                "bmi",
            ],
        },
    };

    return (
        sourceContentMap[fileName] || {
            content: `Source Content for ${fileName}`,
            dataPoints: [
                "patient_id",
                "date",
                "primary_measurement",
                "secondary_measurement",
            ],
        }
    );
};

// Send data to TrialMonitor agent
export const sendToTrialMonitorAgent = async (requestType, data) => {
    try {
        console.log(
            `Sending ${requestType} request to TrialMonitor agent:`,
            data
        );

        // Call actual TrialMonitor agent REST endpoints
        const response = await callTrialMonitorAgent(requestType, data);

        return response;
    } catch (error) {
        console.error(
            `Error sending ${requestType} to TrialMonitor agent:`,
            error
        );
        // Fallback to mock response if agent is not available
        console.log("Falling back to mock response");
        return await mockTrialMonitorRequest(requestType, data);
    }
};

// Call actual TrialMonitor agent REST endpoints
const callTrialMonitorAgent = async (requestType, data) => {
    const baseUrl = "http://localhost:8004"; // TrialMonitor agent URL

    try {
        switch (requestType) {
            case "data_extraction":
                const extractResponse = await fetch(`${baseUrl}/extract-data`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        fileName: data.fileName,
                        content: data.content,
                        dataPoints: data.dataPoints || [],
                    }),
                });

                if (!extractResponse.ok) {
                    throw new Error(
                        `HTTP error! status: ${extractResponse.status}`
                    );
                }

                const extractResult = await extractResponse.json();
                return {
                    success: extractResult.success,
                    dataPoints: extractResult.extractedDataPoints,
                    error: extractResult.error,
                };

            case "data_verification":
                const verifyResponse = await fetch(`${baseUrl}/verify-data`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        crfData: data.crfData,
                        esourceData: data.esourceData,
                        crfDataPoints: data.crfDataPoints || [],
                        esourceDataPoints: data.esourceDataPoints || [],
                    }),
                });

                if (!verifyResponse.ok) {
                    throw new Error(
                        `HTTP error! status: ${verifyResponse.status}`
                    );
                }

                const verifyResult = await verifyResponse.json();
                return {
                    success: verifyResult.success,
                    verification: {
                        verified: verifyResult.verified,
                        verified_data_points: verifyResult.verifiedDataPoints,
                        unverified_data_points:
                            verifyResult.unverifiedDataPoints,
                        missing_data_points: verifyResult.missingDataPoints,
                        discrepancy_data_points:
                            verifyResult.discrepancyDataPoints,
                        additional_information_needed:
                            verifyResult.additionalInformationNeeded,
                    },
                    error: verifyResult.error,
                };

            case "file_ranking":
                // For file ranking, we'll use the chat protocol for now
                // This could be extended with a dedicated REST endpoint
                return await mockTrialMonitorRequest(requestType, data);

            default:
                return {
                    success: true,
                    result: "Processed successfully",
                };
        }
    } catch (error) {
        console.error(`Error calling TrialMonitor agent:`, error);
        throw error;
    }
};

// Mock TrialMonitor agent requests (fallback)
const mockTrialMonitorRequest = async (requestType, data) => {
    // Simulate network delay
    await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 2000)
    );

    switch (requestType) {
        case "data_extraction":
            return {
                success: true,
                dataPoints: data.dataPoints || [
                    "patient_id",
                    "assessment_date",
                    "primary_endpoint",
                ],
            };

        case "data_verification":
            return {
                success: true,
                verification: {
                    verified: true,
                    verified_data_points: data.crfDataPoints?.slice(0, 3) || [],
                    unverified_data_points:
                        data.crfDataPoints?.slice(3, 5) || [],
                    missing_data_points: [],
                    discrepancy_data_points: [],
                    additional_information_needed: [],
                },
            };

        case "file_ranking":
            return {
                success: true,
                ranking: data.esourceFiles || [],
            };

        default:
            return {
                success: true,
                result: "Processed successfully",
            };
    }
};
