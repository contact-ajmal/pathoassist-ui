# AI Model Setup Guide for Mac (Apple Silicon)

Since you are running on a **Mac with Apple Silicon (M1/M2/M3)**, you have a powerful setup for local AI. Follow these steps to authenticate and download the model.

## Phase 1: Browser Setup (Required)
The model `google/medgemma-2b` is "gated," meaning you must agree to Google's specialized medical license.

1.  **Create Account**: If you don't have one, sign up at [huggingface.co](https://huggingface.co/join).
2.  **Accept License**: 
    *   Visit: **[https://huggingface.co/google/medgemma-1.5-4b-it](https://huggingface.co/google/medgemma-1.5-4b-it)**
    *   Look for a section asking you to share your contact info/agree to terms.
    *   Click **"Agree and Access Repository"**.
3.  **Get Access Token**:
    *   Go to: [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
    *   Click **"Create new token"**.
    *   Type: Read
    *   Name: `MacLocalAI` (or anything you like).
    *   **Copy the token** (starts with `hf_...`).

## Phase 2: Terminal Integration

We will set up the environment, login, and download the model.

### 1. Initialize the Backend
Open your terminal in the project root and run:

```bash
cd backend
./setup.sh
```

*   It will install all dependencies.
*   **⚠️ IMPORTANT**: When it asks `"Download MedGemma model now? (y/N)"`, type **`N` (No)**.
    *   *Why?* Because you aren't logged in yet, so it would fail.

### 2. Login to Hugging Face
Once setup is done, stay in the `backend` folder and run:

```bash
# Activate the virtual environment
source venv/bin/activate

# Run the login tool
huggingface-cli login
```

*   It will ask `"Token:"`.
*   Paste your **hf_...** token (it will happen invisibly, just paste and press Enter).
*   It might ask `"Add token as git credential?"` -> Type `n`.

### 3. Download the Model
Now that you are logged in, run the downloader script I created for you:

```bash
python download_model.py
```

### 4. Verify & Run
Once the download finishes successfully, you can start the server:

```bash
./run.sh
```

You should see logs indicating `MPS` (Metal Performance Shaders) is detected and the model loads!
