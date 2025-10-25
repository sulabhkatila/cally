# Clinical Trial Agent - Usage Examples

## Quick Start

### 1. Setup

```bash
# Navigate to agents2 directory
cd agents2

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Make sure you have a .env file with your Gemini API key
# GEMINI_API_KEY=your_key_here
```

### 2. Run the Agent

```bash
python clinical_trial_agent.py
```

## Example Use Cases

### Example 1: Analyzing a Protocol Text

Send a message with clinical trial protocol text:

```
PROTOCOL TITLE: A Phase III Randomized Study of Treatment X vs. Placebo
PROTOCOL NUMBER: PROTO-2024-001
[... rest of protocol text ...]
```

**Agent Response:**

```
🤔 Analyzing clinical trial protocol with AI...

# Clinical Trial Protocol Analysis

## 1. Trial Overview
- Protocol Title: A Phase III Randomized Study of Treatment X vs. Placebo
- Protocol Number: PROTO-2024-001
- Study Phase: Phase III
- Trial Type: Interventional, Randomized, Double-Blind

## 2. Primary Objectives and Endpoints
- Primary Objective: To evaluate the efficacy of Treatment X in adult patients
- Primary Endpoint: Overall Survival (OS)
- Secondary Endpoints:
  * Progression-Free Survival (PFS)
  * Overall Response Rate (ORR)
  * Safety and Tolerability

[... detailed analysis continues]
```

### Example 2: Asking About Clinical Trials

```
What are the key monitoring requirements for a Phase III clinical trial?
```

**Agent Response:**

```
Key monitoring requirements for Phase III trials typically include:

1. **Source Data Verification (SDV)**:
   - Critical data points must be verified against source documents
   - Usually 100% SDV for primary endpoints and safety data
   - 20-30% SDV for other data

2. **Monitoring Visits**:
   - Often 3-4 on-site visits per year
   - Remote monitoring support between visits

3. **Data Quality**:
   - Query resolution and data cleaning
   - Centralized monitoring for data trends

[... comprehensive answer continues]
```

### Example 3: Eligibility Criteria Questions

```
What should be included in inclusion criteria for a cardiovascular trial?
```

**Agent Response:**

```
Inclusion criteria for cardiovascular trials should typically cover:

1. **Demographics**: Age range, gender
2. **Medical History**: Specific cardiovascular condition
3. **Clinical Parameters**:
   - Blood pressure ranges
   - Heart rate parameters
   - Ejection fraction thresholds
4. **Laboratory Values**: Relevant biomarkers
5. **Functional Status**: NYHA class, etc.

[... detailed guidance continues]
```

### Example 4: Understanding SDV Requirements

```
How often should Source Data Verification be performed?
```

**Agent Response:**

```
SDV frequency depends on several factors:

1. **Risk-Based Approach**:
   - High risk endpoints: 100% SDV
   - Medium risk: 50-80% SDV
   - Low risk: 20-30% SDV

2. **Trial Phase**:
   - Phase I/II: Lower SDV may be acceptable
   - Phase III: Higher SDV expectations

3. **Regulatory Requirements**:
   - FDA expects 100% SDV for critical data
   - Some flexibility for lower risk endpoints

[... detailed explanation continues]
```

## Integration with Backend

The agent can be integrated with the SDV Platform backend to automatically analyze protocol text:

```python
# Example integration code (pseudo-code)
from clinical_trial_agent import analyze_clinical_trial_text

# After receiving protocol text (e.g., from text extraction)
protocol_text = "PROTOCOL TITLE: ... [full protocol text]"
analysis = analyze_clinical_trial_text(protocol_text, "clinical trial protocol")

# Store analysis in database
store_analysis(study_id, analysis)
```

## Best Practices

1. **Text Quality**: Ensure protocol text is well-formatted and complete
2. **Text Length**: Agent automatically detects protocols (needs >500 chars or >10 lines)
3. **Large Protocols**: Very long protocols may take longer to process
4. **Context**: Maintain conversation history by asking follow-up questions
5. **Verification**: Always verify critical information with official documents

## Troubleshooting

### Agent won't start

-   Check that GEMINI_API_KEY is set in .env
-   Verify dependencies are installed: `pip install -r requirements.txt`

### Analysis is incomplete

-   Protocol text may have complex formatting
-   Ensure the text is long enough (agent detects protocols with >500 chars or >10 lines)
-   Try breaking very long protocols into sections
-   Verify the text contains actual protocol content
