# Patient Data Validator Agent

A specialized AI agent for validating patient data in clinical trials by comparing source input with possible output to determine data derivability.

## Overview

This agent helps with:
- **Patient Matching**: Verifies if two datasets refer to the same patient
- **Data Point Extraction**: Identifies all data points in both source and target datasets
- **Derivability Analysis**: Determines which data points can be derived from source input
- **Clinical Trial Validation**: Validates patient information across different data sources

## Features

### 1. Patient Identification
- Compares patient identifiers (ID, initials, DOB, etc.)
- Verifies if datasets correspond to the same patient
- Identifies matching criteria and confidence levels

### 2. Data Point Inventory
- Extracts all data points from source input
- Extracts all data points from possible output
- Categorizes data points (demographics, medical history, lab results, etc.)

### 3. Derivability Analysis
- Determines which data points can be derived from source input
- Identifies data points requiring additional information
- Flags inconsistencies or discrepancies
- Provides reasoning for each analysis

## Installation

Same as other agents:

```bash
cd agents2
pip install -r requirements.txt
```

Ensure you have `GEMINI_API_KEY` in your `.env` file.

## Usage

### Running the Agent

```bash
cd agents2
python patient_data_validator_agent.py
```

### Input Format

Send messages with the following structure:

```
SOURCE INPUT:
Patient ID: P001
Name: John Doe
Age: 45
Blood Pressure: 120/80
Medical History: Hypertension, Diabetes

POSSIBLE OUTPUT:
Patient ID: P001
Age: 45
BP: 120/80
Heart Rate: 72
Condition: Hypertension
```

### Example Analysis Output

The agent will provide:

## 1. Patient Matching
- Do the datasets refer to the same patient? **Yes**
- Matching criteria found: Patient ID (P001), Age (45), Blood Pressure (120/80)
- Identifiers present: Patient ID, Age, Medical Condition
- Confidence level: **High**

## 2. Data Point Inventory

### Source Input Data Points:
- Demographics: Patient ID, Name, Age
- Vital Signs: Blood Pressure
- Medical History: Hypertension, Diabetes

### Possible Output Data Points:
- Demographics: Patient ID, Age
- Vital Signs: BP, Heart Rate
- Medical Condition: Hypertension

## 3. Derivability Analysis

| Data Point | Derivable | Reasoning |
|------------|-----------|-----------|
| Patient ID | ✅ Yes | Exact match in source |
| Age | ✅ Yes | Exact match in source |
| BP | ✅ Yes | Same as Blood Pressure in source |
| Heart Rate | ❌ No | Not present in source input |
| Condition | ⚠️ Partially | Hypertension mentioned in medical history |

## 4. Summary

- Total data points in source_input: **5**
- Total data points in possible_output: **5**
- Derivable data points: **3**
- Non-derivable data points: **1** (Heart Rate)
- Additional information needed: Heart Rate measurement

## Use Cases

### 1. Source Data Verification (SDV)
Compare source documents with CRF data to verify accuracy.

### 2. Data Migration
Validate patient data when migrating between systems.

### 3. EDC Validation
Check if EDC data can be derived from source documents.

### 4. Query Resolution
Determine which queries can be resolved with available source data.

### 5. Protocol Compliance
Verify if patient data meets protocol requirements.

## Example Scenarios

### Scenario 1: Demographic Validation

**Source Input:**
```
Patient ID: S001
Date of Birth: 01/15/1980
Gender: Male
```

**Possible Output:**
```
Patient ID: S001
Age: 44
Sex: M
```

**Result:** ✅ All data points derivable (Age calculated from DOB, Sex matches Gender)

### Scenario 2: Medical History Validation

**Source Input:**
```
Medical History: Diabetes Type 2 diagnosed 2015, well controlled
Current Medications: Metformin 500mg BID
```

**Possible Output:**
```
Condition: Diabetes
Medications: Metformin
Dose: 500mg
Frequency: BID
```

**Result:** ✅ All data points derivable from source

### Scenario 3: Lab Results Validation

**Source Input:**
```
HbA1c: 7.2%
Fasting Glucose: 140 mg/dL
```

**Possible Output:**
```
HbA1c: 7.2%
Glucose: 140 mg/dL
Glucose Category: High
```

**Result:** ⚠️ Glucose Category requires additional information for interpretation

## Tips

1. **Be Specific**: Include as many identifiers as possible for patient matching
2. **Use Consistent Terminology**: Use standard medical terminology
3. **Include Units**: Specify units for lab values and measurements
4. **Provide Context**: Include medical history for better analysis
5. **Structured Format**: Use clear sections (SOURCE INPUT: and POSSIBLE OUTPUT:)

## Integration

This agent can be integrated with:
- SDV Platform backend for automatic validation
- EDC systems for data verification
- Query management systems for query resolution
- Data migration tools for validation

## Port

The agent runs on port **8002** by default (different from clinical_trial_analyzer which uses 8001).

## Error Handling

The agent gracefully handles:
- Missing data points
- Inconsistent formats
- Incomplete information
- Unclear patient matching

## Limitations

- Requires clear structure in input
- Best results with detailed source information
- Some derivability may be subjective
- Complex medical reasoning may require human review

## Support

For issues or questions, refer to the main agents2 README or contact the development team.
