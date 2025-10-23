# AI Career Copilot ✨

**Your personal AI-powered assistant for navigating the job application process.**

[![AI Career Copilot Demo Video](https://img.youtube.com/vi/ZC_RiRlVmg8/0.jpg)](https://www.youtube.com/watch?v=ZC_RiRlVmg8)

*(Click the image above to watch the demo tutorial)*

**Live Demo:** [**careercopilot.pages.dev**](https://careercopilot.pages.dev/)

---

## Overview

AI Career Copilot is a web application designed to streamline and enhance your job search by leveraging the power of Google's Gemini AI models. It combines several specialized tools into a single, cohesive interface, helping you craft professional CVs, generate tailored cover letters, answer application questions, and manage your professional outreach.

Stop juggling multiple tools and websites – AI Career Copilot brings everything you need under one roof.

## Features

This application suite includes the following integrated tools:

### 📄 **CV Genie**
* **AI-Powered CV Creation:** Generate a professional, ATS-friendly CV directly from your LinkedIn profile data (pasted text, .txt, .json, PDF, or images).
* **Targeted Curation:** Automatically tailors your CV content to a specific job title using AI.
* **Re-Curation:** Easily adapt your generated CV for different job titles or add context like job descriptions and company info.
* **Editable Interface:** Fine-tune every section of your AI-generated CV before finalizing.
* **Local PDF Generation:** Create a polished PDF of your CV directly in your browser.
* **Persistence:** Saves your last extracted and curated CV data in your browser, allowing you to skip extraction on future visits.

### ✉️ **Cover Letter Generator (CoverGenius)**
* **Tailored Content:** Generates compelling cover letters based on the job description, company information, the role you're applying for, and your uploaded candidate info (.txt or .json).
* **Optional Personalization:** Include recipient details (name, position) for a more personalized touch.
* **AI Guidelines:** Provide optional instructions or a rough draft to guide the AI's writing style and content.
* **Model Selection:** Choose between different Gemini models (`gemini-pro`, `gemini-1.0-pro`) depending on your needs.

### 📝 **Apply Assist**
* **AI Application Helper:** Get AI assistance for various application tasks, such as answering specific interview questions or writing short application sections.
* **Context-Aware:** Uses your profile data, the target job title, job description, and company info to provide relevant responses.
* **AI Guidelines:** Add optional instructions to direct the AI's response.

### 🤝 **Reachy AI**
* **Smart Outreach Messages:** Generate personalized messages for networking or following up after applying.
* **Multiple Scenarios:**
    * **After Applying:** Craft messages to executives, university fellows, or friends/acquaintances at the company.
    * **Expand Network:** Create messages for various contexts (switching fields, seeking mentorship, job opportunities, etc.) tailored to your relationship with the recipient (acquaintance, friend, colleague, etc.).
* **Format Options:** Generate messages suitable for LinkedIn (short messages, connection requests), detailed emails, or casual WhatsApp messages.
* **Personalization:** Uses your name (editable per message), profession, and profile links (LinkedIn, GitHub, Portfolio) from settings.

### ⚙️ **Settings**
* **Centralized Configuration:** Manage your Google Gemini API Key, name, profile links (LinkedIn, GitHub, Portfolio), and preferred AI models for CV Genie and Cover Letter Generator.
* **Local Storage:** All settings are securely saved in your browser's local storage for convenience.

### ✨ **General Features**
* **Progressive Web App (PWA):** Installable on your desktop or mobile home screen for a native-app feel.
* **Collapsible Sidebar:** Modern off-canvas navigation menu.
* **Customizable Theme:** Uses Tailwind CSS with theme variables (though currently defaults to dark mode based on the configuration).
* **Responsive Design:** Adapts to different screen sizes.

## Technology Stack

* **Frontend:** React, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons, React Hook Form
* **Backend Services:** Cloudflare Workers (handling API calls to Google Gemini AI)
* **AI Model:** Google Gemini (various models like `gemini-pro`, `gemini-1.5-flash`)
* **PDF Generation (CV Genie):** Puppeteer running on Cloudflare Workers (server-side option) or Browser Print API (local option)
* **Text Extraction (CV Genie):** `react-pdf` (PDFs), `tesseract.js` (Images)

## Getting Started Locally

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd ai-career-copilot
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure API Key:**
    * You'll need a Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    * Run the application locally first, navigate to the **Settings** page in the UI, and paste your API key there. It will be saved in your browser's local storage.
4.  **Run the development server:**
    ```bash
    npm run dev
    ```
5.  Open your browser and navigate to the local URL provided (usually `http://localhost:5173`).

*(Note: The backend Cloudflare Workers for each tool need to be deployed separately for the application to fully function. The URLs are hardcoded in the frontend components.)*

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is open-source. (Consider adding a specific license like MIT if you wish).

---

*Built with ❤️ to help you land your dream job.*
