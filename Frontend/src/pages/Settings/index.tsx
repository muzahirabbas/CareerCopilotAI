// File: src/pages/Settings/index.tsx

import React from 'react';
import { AppSettings } from '../../lib/types';
import { Input } from '../../components/ui/Input';
import { FormLabel } from '../../components/ui/Label';
import { Select } from '../../components/ui/Select';

interface SettingsProps {
    settings: AppSettings;
    setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

const Settings: React.FC<SettingsProps> = ({ settings, setSettings }) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="max-w-4xl mx-auto">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-bold">Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Configure your details and API keys here. This information is saved locally in your browser.
                </p>
            </header>

            <div className="bg-card p-8 rounded-lg shadow-lg space-y-8">
                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-white border-b border-border pb-2">Core Configuration</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <FormLabel htmlFor="geminiApiKey">Gemini API Key</FormLabel>
                            <Input id="geminiApiKey" name="geminiApiKey" type="password" value={settings.geminiApiKey} onChange={handleChange} placeholder="Enter your Google AI Studio API Key" />
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-white border-b border-border pb-2">Your Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <FormLabel htmlFor="userName">Your Name</FormLabel>
                            <Input id="userName" name="userName" value={settings.userName} onChange={handleChange} placeholder="e.g., Jane Doe" />
                        </div>
                        {/* 👇 THE JOB TITLE INPUT IS REMOVED FROM THIS SECTION */}
                        <div>
                            <FormLabel htmlFor="linkedinLink">LinkedIn Profile URL</FormLabel>
                            <Input id="linkedinLink" name="linkedinLink" value={settings.linkedinLink} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
                        </div>
                        <div>
                            <FormLabel htmlFor="githubLink">GitHub Profile URL</FormLabel>
                            <Input id="githubLink" name="githubLink" value={settings.githubLink} onChange={handleChange} placeholder="https://github.com/..." />
                        </div>
                        <div>
                           <FormLabel htmlFor="websiteLink">Website/Portfolio URL</FormLabel>
                            <Input id="websiteLink" name="websiteLink" value={settings.websiteLink} onChange={handleChange} placeholder="https://your-portfolio.com" />
                        </div>
                    </div>
                </section>
                 <section>
                    <h2 className="text-2xl font-semibold mb-4 text-white border-b border-border pb-2">Model Preferences</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <FormLabel htmlFor="cvGenieModel">CV Genie Model</FormLabel>
                            <Select id="cvGenieModel" name="cvGenieModel" value={settings.cvGenieModel} onChange={handleChange}>
                                <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                                <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                            </Select>
                        </div>
                         <div>
                            <FormLabel htmlFor="coverLetterModel">Cover Letter Model</FormLabel>
                            <Select id="coverLetterModel" name="coverLetterModel" value={settings.coverLetterModel} onChange={handleChange}>
                                <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                                <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                            </Select>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Settings;