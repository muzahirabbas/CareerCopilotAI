// File: src/pages/ReachyAI/index.tsx

import { useState, useEffect } from 'react'; // 👈 ADD useEffect
import axios from 'axios';
import AfterApplyingForm from './AfterApplyingForm';
import ExpandNetworkForm from './ExpandNetworkForm';
import { AppSettings } from '../../lib/types';
import { FaBolt, FaCopy, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { Input } from '../../components/ui/Input'; // 👈 ADD Input
import { FormLabel } from '../../components/ui/Label'; // 👈 ADD Label


type Tab = 'after-applying' | 'expand-network';

interface ReachyAIProps {
    settings: AppSettings;
}

const ReachyAI: React.FC<ReachyAIProps> = ({ settings }) => {
    
    const [activeTab, setActiveTab] = useState<Tab>('after-applying');
    const [generatedMessage, setGeneratedMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [userName, setUserName] = useState(settings.userName || ''); // 👈 ADD LOCAL NAME STATE

    // 👈 ADD HOOK TO SYNC WITH GLOBAL SETTINGS
    useEffect(() => {
        setUserName(settings.userName || '');
    }, [settings.userName]);

    const handleGenerate = async (type: Tab, data: any) => {
        if (!settings.geminiApiKey) {
            setError('Please provide your Gemini API Key in the Settings page.');
            return;
        }
        setIsLoading(true);
        setError('');
        setGeneratedMessage('');
        const toastId = toast.loading('Generating message...');

        const requestBody = {
            apiKey: settings.geminiApiKey,
            type,
            data: {
                ...data,
                userInfo: {
                    userName: userName, // 👈 UPDATE TO USE LOCAL NAME
                    githubLink: settings.githubLink,
                    websiteLink: settings.websiteLink,
                    linkedinLink: settings.linkedinLink,
                    profession: data.profession || '' // 👈 UPDATE FALLBACK
                }
            }
        };

        try {
            const workerUrl = 'https://YOUR_WORKER_URL_HERE.workers.dev';
            const response = await axios.post(workerUrl, requestBody);
            setGeneratedMessage(response.data.message);
            toast.success('Message generated!', { id: toastId });
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'An unexpected error occurred.';
            setError(errorMessage);
            toast.error(errorMessage, { id: toastId });
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedMessage);
        toast.success('Message copied to clipboard!');
    };


    return (
        <div className="font-sans">
            <header className="text-center mb-8">
                <div className="flex items-center gap-3 justify-center">
                    <FaBolt className="text-3xl text-secondary"/>
                    <h1 className="text-4xl font-bold text-white">ReachyAI</h1>
                </div>
                <p className="text-muted-foreground mt-1 text-lg">Your Personal AI Outreach Assistant</p>
            </header>

            <main className="container mx-auto max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    <div className="flex flex-col gap-8">
                         {/* 👇 ADD LOCAL NAME INPUT HERE */}
                         <div className="bg-card p-6 rounded-lg shadow-lg">
                            <FormLabel htmlFor="reachy-userName">Your Name (for this message)</FormLabel>
                            <Input 
                                id="reachy-userName"
                                name="userName"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="Enter your name or a nickname"
                            />
                            <p className="text-xs text-muted-foreground mt-2">Links from global settings will be used automatically.</p>
                         </div>
                        
                         <div className="bg-card p-6 rounded-lg shadow-lg">
                            <div className="flex border-b border-border mb-4">
                                <button onClick={() => setActiveTab('after-applying')} className={`py-2 px-4 text-lg font-semibold transition-colors duration-300 ${activeTab === 'after-applying' ? 'border-b-2 border-secondary text-white' : 'text-muted-foreground hover:text-white'}`}>
                                    After Applying
                                </button>
                                
                                <button onClick={() => setActiveTab('expand-network')} className={`py-2 px-4 text-lg font-semibold transition-colors duration-300 ${activeTab === 'expand-network' ? 'border-b-2 border-secondary text-white' : 'text-muted-foreground hover:text-white'}`}>
                                    Expand Network
                                </button>
                            </div>

                            {activeTab === 'after-applying' ? (
                                <AfterApplyingForm onGenerate={(data) => handleGenerate('after-applying', data)} isLoading={isLoading} />
                            ) : (
                                <ExpandNetworkForm onGenerate={(data) => handleGenerate('expand-network', data)} isLoading={isLoading} />
                            )}
                        </div>
                    </div>

                    <div className="bg-card p-6 rounded-lg shadow-lg sticky top-8 self-start">
                        <h2 className="text-2xl font-bold mb-4 text-white">Generated Message</h2>
                        {error && <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-md mb-4">{error}</div>}
                        
                        <div className="relative w-full h-[60vh] bg-background rounded-md p-4 overflow-y-auto whitespace-pre-wrap font-mono text-sm custom-scrollbar">
                           {isLoading ? (
                             <div className="flex items-center justify-center h-full">
                               <FaSpinner className="animate-spin text-4xl text-secondary" />
                             </div>
                            ) : (
                            generatedMessage || <span className="text-muted-foreground">Your generated message will appear here...</span>
                           )}
                         </div>
                        
                        {generatedMessage && !isLoading && (
                            <button onClick={copyToClipboard} className="mt-4 w-full bg-secondary hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-300">
                                <FaCopy /> Copy to Clipboard
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ReachyAI;