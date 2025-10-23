// File: src/pages/CoverLetterGenerator/index.tsx

import { useState, ChangeEvent } from 'react';
import FormField from './FormField';
import TextareaField from './TextareaField';
import { AppSettings } from '../../lib/types';
import { toast } from 'react-hot-toast';

const YOUR_WORKER_URL = "https://YOUR_WORKER_URL_HERE.workers.dev";

interface CoverLetterGeneratorProps {
    settings: AppSettings;
    setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

const CoverLetterGenerator: React.FC<CoverLetterGeneratorProps> = ({ settings, setSettings }) => {
  
  const [formData, setFormData] = useState({
    jobDescription: '',
    companyInfo: '',
    roleTitle: '',
    recipientName: '',
    userGuideline: '',
    recipientPosition: '',
    attachment: null as File | null,
  });
  
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Change the type here to be more specific for each handler
  const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const files = e.target.files;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files?.[0] : value
    }));
  };

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
     setFormData(prev => ({ ...prev, [name]: value }));
  };

   const handleSettingsChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({...prev, [name]: value}));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings.geminiApiKey) {
        setError("Gemini API Key is required. Please set it on the Settings page.");
        toast.error("Gemini API Key is required.");
        return;
    }
    if (!formData.attachment) {
        setError("Candidate Info file is required.");
        toast.error("Candidate Info file is required.");
        return;
    }

    setIsGenerating(true);
    setOutput("🚀 Generating cover letter with Gemini...");
    setError(null);

    const dataToSend = new FormData();
    dataToSend.append('apiKey', settings.geminiApiKey);
    dataToSend.append('model', settings.coverLetterModel);
    
    for (const key in formData) {
      const value = formData[key as keyof typeof formData];
      if (value !== null && value !== undefined) {
          if (value instanceof File) {
            dataToSend.append(key, value);
          } else {
            dataToSend.append(key, String(value));
          }
      }
    }

    try {
      const response = await fetch(YOUR_WORKER_URL, {
        method: "POST",
        body: dataToSend,
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}. Server response: ${errorText.substring(0, 100)}...`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setOutput(data.result || "Error: The generator returned an empty response.");
      toast.success("Cover letter generated!");
    } catch (err: any) {
      console.error("Fetch error:", err);
      const displayError = (err.message && err.message.toLowerCase().includes('api key'))
        ? "API Key likely invalid or formatted incorrectly. Please check the key in Settings."
        : (err.message || "Failed to connect to the server.");

      setError("An error occurred: " + displayError);
      setOutput("Error generating cover letter. Check the console for details or verify your API Key and Worker URL.");
      toast.error("Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };
  return (
    <div className="text-foreground transition-colors duration-300">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-extrabold" style={{color: 'var(--gemini-blue)'}}>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-400">
            CoverGenius: AI Cover Letter Guru
          </span>
          <span className="text-xl font-medium block mt-1 text-gray-400">(Powered by Gemini)</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        <section className="bg-card p-6 rounded-xl shadow-2xl border border-border">
          <h2 className="text-2xl font-semibold mb-6 border-b pb-2" style={{borderColor: 'var(--gemini-blue)'}}>Input Parameters</h2>
          <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Gemini API Key</label>
                  <input type="password" value={settings.geminiApiKey} readOnly placeholder="Set in Settings Page" className="w-full p-3 border border-gray-700 rounded-lg shadow-sm bg-gemini-dark text-white cursor-not-allowed" />
                </div>
                <FormField 
                  label="Model" 
                  name="coverLetterModel" 
                  type="select" 
                  required={true} 
                  value={settings.coverLetterModel} 
                  onChange={handleSettingsChange}
                >
                    <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                    <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                </FormField>
            </div>

            {/* Use the specific handlers for each component */}
            <TextareaField label="Job Description" name="jobDescription" rows={6} required={true} value={formData.jobDescription} onChange={handleTextareaChange} />
            <TextareaField label="Company Info (Culture, Mission, etc.)" name="companyInfo" rows={4} value={formData.companyInfo} onChange={handleTextareaChange} />
            <TextareaField label="Guideline or Direction for AI (Optional)" name="userGuideline" rows={4} value={formData.userGuideline} onChange={handleTextareaChange} />
            <FormField label="Role Applied For" name="roleTitle" required={true} value={formData.roleTitle} onChange={handleFormChange} />

            <fieldset className="p-4 border border-blue-500/30 rounded-lg mb-6">
              <legend className="text-sm px-2 font-medium text-blue-400">Recipient Info (optional)</legend>
              <div className="grid md:grid-cols-2 gap-4">
                <FormField label="Name" name="recipientName" placeholder="e.g. Jane Smith" value={formData.recipientName} onChange={handleFormChange} />
                <FormField label="Position" name="recipientPosition" placeholder="e.g. Senior Recruiter" value={formData.recipientPosition} onChange={handleFormChange} />
              </div>
            </fieldset>

            <FormField label="Upload Candidate Info (.txt or .json)" name="attachment" type="file" accept=".txt,.json" required={true} onChange={handleFormChange} />

            <button type="submit" disabled={isGenerating}
              className={`w-full py-3 mt-4 text-white font-bold rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-[1.01] flex items-center justify-center ${
                isGenerating ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50'
              }`}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : ( 'Generate Cover Letter' )}
            </button>
            {error && (
              <p className="mt-4 text-red-500 text-sm p-3 bg-red-900/50 rounded-lg border border-red-500">Error: {error}</p>
            )}
          </form>
        </section>

        <section className="bg-card p-6 rounded-xl shadow-2xl border border-border flex flex-col">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2" style={{borderColor: 'var(--gemini-blue)'}}>Generated Cover Letter</h2>
          <div className="flex-grow">
            <textarea id="output" rows={15} readOnly value={output}
              className="w-full h-full p-4 border border-gray-700 rounded-lg shadow-inner bg-background text-gray-200 resize-none custom-scrollbar"
              placeholder="Your AI-generated cover letter will appear here..."
            ></textarea>
          </div>
          {output && !isGenerating && !error && (
            <button
                onClick={() => {
                  navigator.clipboard.writeText(output);
                  toast.success("Copied to clipboard!");
                }}
                className="mt-4 py-2 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition"
            >
                Copy to Clipboard
            </button>
          )}
        </section>
      </div>
    </div>
  );
}

export default CoverLetterGenerator;