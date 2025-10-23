import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FileText, Sparkles, Clipboard, Check, User, Briefcase, Send, BrainCircuit } from 'lucide-react';
import { AppSettings } from '../../lib/types';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';

interface ApplyAssistProps {
    settings: AppSettings;
}

const ApplyAssist: React.FC<ApplyAssistProps> = ({ settings }) => {
  const [candidateData, setCandidateData] = useState('');
  const [fileName, setFileName] = useState('');
  const [candidateJobTitle, setCandidateJobTitle] = useState('');
  
  const [question, setQuestion] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [companyInfo, setCompanyInfo] = useState('');
  const [userGuideline, setUserGuideline] = useState('');

  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCandidateData(e.target?.result as string);
        setFileName(file.name);
        toast.success(`${file.name} loaded successfully!`);
      };
      reader.onerror = () => {
        toast.error('Failed to read file.');
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings.geminiApiKey) {
      toast.error('Gemini API Key is required. Please add it in the Settings page.');
      return;
    }
    if (!question || !jobTitle) {
      toast.error('Question and Job Title are required.');
      return;
    }

    setIsLoading(true);
    setResponse('');
    const toastId = toast.loading('Consulting the AI assistant...');
    try {
      const res = await fetch('https://YOUR_WORKER_URL_HERE.workers.dev/api/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: settings.geminiApiKey,
          candidateName: settings.userName,
          candidateJobTitle: candidateJobTitle,
          candidateData,
          question,
          jobTitle,
          jobDescription,
          companyInfo,
          userGuideline,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `HTTP error! status: ${res.status}`);
      }
      
      setResponse(data.answer);
      toast.success('Response received!', { id: toastId });
    } catch (error: any) {
      console.error('API call failed:', error);
      toast.error(`Error: ${error.message}`, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(response).then(() => {
        setIsCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setIsCopied(false), 2000);
    }, (err) => {
        toast.error('Failed to copy.');
        console.error('Could not copy text: ', err);
    });
  };

  return (
    <div className="font-sans text-foreground">
        <header className="text-center mb-10">
            <div className="flex justify-center items-center gap-4 mb-2">
                <img src="/logo.svg" alt="ApplyAssist Logo" className="h-16 w-16" />
                <h1 className="text-5xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 text-transparent bg-clip-text">ApplyAssist</h1>
            </div>
            <p className="text-muted-foreground text-lg">Your Personal AI-Powered Job Application Assistant</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg shadow-lg">
            <div>
              <h2 className="text-2xl font-semibold mb-4 border-b-2 border-secondary pb-2 flex items-center gap-2">
                <User className="text-sky-400" /> Your Data
              </h2>
              <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Your Name is used from the global Settings page.</p>
                  <Input 
                    type="text" 
                    placeholder="Current Job Title" 
                    value={candidateJobTitle} 
                    onChange={e => setCandidateJobTitle(e.target.value)} 
                    icon={<Briefcase size={18} />} 
                    aria-label="Your Current/Target Job Title"
                  />
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Your Data (.json or .txt)</label>
                    <label htmlFor="file-upload" className="cursor-pointer bg-input hover:bg-accent text-foreground font-bold py-2 px-4 rounded-md inline-flex items-center transition-colors">
                        <FileText size={18} className="mr-2" />
                        <span>{fileName || 'Upload resume data, skills, etc.'}</span>
                    </label>
                    <input id="file-upload" type="file" className="hidden" accept=".json,.txt" onChange={handleFileChange} />
                  </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold mb-4 border-b-2 border-secondary pb-2 flex items-center gap-2">
                <Send className="text-sky-400" /> Your Request
              </h2>
              <div className="space-y-4">
                <Textarea placeholder="question: e.g. What is your greatest weakness?" value={question} onChange={e => setQuestion(e.target.value)} required />
                <Input type="text" placeholder="Job Title Applying For" value={jobTitle} onChange={e => setJobTitle(e.target.value)} icon={<Briefcase size={18} />} required />
                <Textarea placeholder="Paste the job description here for a more tailored response." value={jobDescription} onChange={e => setJobDescription(e.target.value)} />
                <Textarea placeholder="Paste any info about the company" value={companyInfo} onChange={e => setCompanyInfo(e.target.value)} />
                <Textarea placeholder="Optional: Any specific guidelines or a rough draft for the AI to follow..." value={userGuideline} onChange={e => setUserGuideline(e.target.value)} />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} size="lg" className="w-full flex justify-center items-center gap-2">
              {isLoading ? 'Thinking...' : 'Assist Me'}
              {isLoading ? <BrainCircuit className="animate-spin" size={20} /> : <Sparkles size={20} />}
            </Button>
          </form>

          <div className="bg-card p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 border-b-2 border-secondary pb-2 flex items-center gap-2">
              <BrainCircuit className="text-sky-400" /> Generated Response
            </h2>
            <div className="bg-background rounded-md p-4 min-h-[60vh] relative prose prose-invert max-w-none overflow-y-auto custom-scrollbar">
                {response && (
                    <button onClick={copyToClipboard} className="absolute top-2 right-2 p-2 bg-input hover:bg-accent rounded-md transition-colors">
                        {isCopied ? <Check size={18} className="text-green-400" /> : <Clipboard size={18} />}
                    </button>
                )}
              {isLoading && <div className="flex justify-center items-center h-full"><p className="text-muted-foreground">Generating response...</p></div>}
              {!isLoading && !response && <div className="flex justify-center items-center h-full"><p className="text-muted-foreground">Your generated content will appear here.</p></div>}
              <pre className="whitespace-pre-wrap font-sans text-foreground">{response}</pre>
            </div>
          </div>
        </div>
    </div>
  );
};

export default ApplyAssist;