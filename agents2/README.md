# Clinical Trial Protocol Analyzer Agent

A specialized AI agent for analyzing clinical trial protocol PDFs using Google Gemini.

## Overview

This agent is designed to:

-   Analyze clinical trial protocol text content
-   Understand trial objectives, endpoints, and methodology
-   Extract eligibility criteria (inclusion/exclusion)
-   Identify monitoring schedules and SDV requirements
-   Analyze safety monitoring requirements
-   Provide expert knowledge about clinical trial protocols

## Features

### 1. Text Analysis

-   Analyzes clinical trial protocol text content
-   Handles long-form protocol documents
-   Extracts structured information from unstructured text

### 2. Clinical Trial Analysis

The agent extracts and analyzes:

-   **Trial Overview**: Protocol title, number, phase, type
-   **Objectives & Endpoints**: Primary and secondary endpoints
-   **Trial Design**: Study design, randomization, blinding, sample size
-   **Eligibility Criteria**: Detailed inclusion and exclusion criteria
-   **Monitoring Requirements**: SDV schedule, site visits, frequency
-   **Key Personnel**: Principal Investigators, sites, sponsor
-   **Timeline**: Visit schedule, milestones, duration
-   **Safety Monitoring**: Safety endpoints, AE monitoring, DSMB
-   **Statistical Analysis**: Methods and analysis plans

### 3. Expert Knowledge

-   Understanding of FDA and ICH-GCP guidelines
-   Clinical trial methodology expertise
-   Source Data Verification (SDV) knowledge
-   Regulatory compliance awareness

### 4. Conversational Q&A

-   Answer questions about clinical trials
-   Provide expert guidance on trial protocols
-   Maintain conversation history for context

## Installation

1. **Install dependencies**:

```bash
pip install -r requirements.txt
```

Or install manually:

```bash
pip install python-dotenv google-genai uagents
```

2. **Set up environment variables**:

Create a `.env` file in the agents2 directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your Gemini API key from: https://makersuite.google.com/app/apikey

## Usage

### Running the Agent

```bash
cd agents2
python clinical_trial_agent.py
```

### Interacting with the Agent

The agent can be used in two ways:

#### 1. Analyze a Protocol Text

Send the agent a message with the clinical trial protocol text:

```
PROTOCOL TITLE: A Phase III Study of Treatment X
PROTOCOL NUMBER: PROTO-2024-001
[... rest of protocol text ...]
```

Or simply paste a long protocol text. The agent will:

1. Detect that it's a protocol (if it's long enough)
2. Analyze the protocol using AI
3. Return a comprehensive analysis

#### 2. Ask Questions

Send any question about clinical trials:

```
What are the key components of a clinical trial protocol?
```

```
What is Source Data Verification (SDV) in clinical trials?
```

```
What should I include in eligibility criteria?
```

## Example Output

When analyzing a PDF, the agent returns structured information like:

```markdown
# Clinical Trial Protocol Analysis

## 1. Trial Overview

-   Protocol Title: A Phase III Study of Treatment X
-   Protocol Number: PROTO-2024-001
-   Study Phase: Phase III
-   Trial Type: Interventional

## 2. Primary Objectives and Endpoints

-   Primary Objective: Evaluate efficacy of Treatment X
-   Primary Endpoint: Overall Survival (OS)
-   Secondary Endpoints: Progression-Free Survival (PFS), Quality of Life

## 3. Eligibility Criteria

-   Inclusion Criteria:
    -   Adults aged 18-75 years
    -   Diagnosed with Condition Y
    -   ECOG performance status 0-2
        ...

[... continues with detailed analysis]
```

## Agent Configuration

### Model Settings

The agent uses Gemini 2.5 Flash with optimized settings:

-   **Temperature**: 0.3 (lower for more factual responses)
-   **Max Tokens**: 4096 (for detailed analysis)
-   **Model**: gemini-2.5-flash

### Port Configuration

-   Default port: **8001**
-   Can be modified in the agent initialization

## Integration with SDV Platform

This agent can be integrated with the SDV Platform backend to:

1. **Automatically analyze uploaded protocols**
2. **Extract monitoring requirements** for SDV planning
3. **Identify data points** that need verification
4. **Generate monitoring schedules** based on protocol analysis

## Architecture

```
User Message
    ↓
Chat Protocol Handler
    ↓
    ├─→ PDF Path? → Extract Text → Analyze with Gemini → Return Analysis
    └─→ Question? → Contextual Response → Return Answer
```

## Dependencies

-   **google-genai**: Google Gemini API client
-   **uagents**: Fetch.ai agent framework
-   **python-dotenv**: Environment variable management

## Limitations

-   Text-based analysis only (no PDF parsing)
-   Very long protocols may take longer to process
-   Text quality and formatting affect extraction accuracy
-   Agent automatically detects protocol text vs. questions

## Future Enhancements

-   File upload support for text files
-   Support for DOCX and other formats
-   Structured JSON output
-   Integration with ChromaDB for document storage
-   Multi-agent collaboration
-   Real-time updates during analysis

## Troubleshooting

### Gemini API Key Not Set

Make sure you have a `.env` file with `GEMINI_API_KEY` set.

### Analysis Issues

-   Ensure protocol text is comprehensive and well-formatted
-   Check that text is long enough to be detected as a protocol
-   Try breaking up very long protocols into sections

## Support

For issues or questions, contact the development team.
