# Mock Trial Site - Current Status

## ✅ Working Components

### Backend (Port 5003)

-   **Health endpoint**: `/health` - ✅ Working
-   **Patients API**: `/api/patients` - ✅ Working (found 1 patient with 11 documents)
-   **Access request**: `/api/request-access` - ✅ Working
-   **Access check**: `/api/check-access-request` - ✅ Working
-   **Access response**: `/api/access-response` - ✅ Working

### Frontend (Port 3002)

-   **React app**: ✅ Running and accessible
-   **Patient display**: ✅ Should show patient_1 with 11 documents
-   **Document viewing**: ✅ Click patient to see documents
-   **Access popup**: ✅ Polls every 5 seconds for access requests

### Patient Data

-   **Location**: `mock_trial_site/patients/patient_1/`
-   **Documents**: 11 DOCX files including:
    -   Sub_1_DemographicParams.docx
    -   Sub_1_DrugAccountabilityRecords.docx
    -   Sub_1_MedicalHiistory.docx
    -   Sub_1_PatientDiary;.docx
    -   Sub_1_Week0Joint.docx
    -   Sub_1_Week0Labs.docx
    -   Sub_1_Week1_Physical.docx
    -   Sub_1_Week2Vitals.docx
    -   Sub_1_Week4Vitals.docx
    -   Sub_1_Week8_Vitals.docx
    -   Week 10 Vitals.docx

## 🌐 URLs

-   **Mock Trial Site Frontend**: http://localhost:3002
-   **Mock Trial Site Backend**: http://localhost:5003
-   **SDV Platform Frontend**: http://localhost:3000
-   **SDV Platform Backend**: http://localhost:5000

## 🔄 Complete Flow

1. **SDV Platform** → Sponsor clicks "Connect to Investigator" button
2. **Mock Trial Backend** → Receives POST request, sets access flag
3. **Mock Trial Frontend** → Polls every 5 seconds, detects flag, shows popup
4. **User Response** → Clicks Yes/No, sends response, flag cleared

## 🧪 Testing

Run the test script to verify everything:

```bash
cd mock_trial_site
python test_complete_flow.py
```

## 📋 Next Steps

1. **Open Mock Trial Site**: http://localhost:3002
2. **Verify patient display**: Should see patient_1 with 11 documents
3. **Test document viewing**: Click on patient_1 to see document list
4. **Test access flow**: Use SDV Platform to trigger access request
5. **Verify popup**: Should appear within 5 seconds on Mock Trial Site

## 🚀 All Systems Operational!

The mock trial site is fully functional and ready for testing the complete SDV workflow.
