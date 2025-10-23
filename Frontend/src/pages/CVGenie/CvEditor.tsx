// File: src/pages/CVGenie/CvEditor.tsx

import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Spinner } from '../../components/ui/Spinner';
import { CuratedCVData, ProfilePhoto, WorkExperience, Project, Certification, Education, AppSettings } from '../../lib/types';
import { generateCvHtml } from '../../lib/cv-template';

import { EditableSection } from './editor/EditableSection';
import { SkillsItem } from './editor/SkillsItem';
import { WorkExperienceItem } from './editor/WorkExperienceItem';
import { ProjectItem } from './editor/ProjectItem';
import { CertificationItem } from './editor/CertificationItem';
import { EducationItem } from './editor/EducationItem';

interface CvEditorProps {
  settings: AppSettings;
  initialData: CuratedCVData;
  extractedData: any | null;
  setCuratedData: (data: CuratedCVData) => void; 
  profilePhoto: ProfilePhoto | null;
  onStartOver: () => void;
  onError: (message: string) => void;
}

export const CvEditor: React.FC<CvEditorProps> = ({
  settings,
  initialData,
  extractedData,
  setCuratedData,
  profilePhoto,
  onStartOver,
  onError,
}) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [cvData, setCvData] = useState<CuratedCVData>(initialData);
    const [newJobTitle, setNewJobTitle] = useState('');
    const [newJobInfo, setNewJobInfo] = useState('');
    const [newCompanyInfo, setNewCompanyInfo] = useState('');
    const [isCurating, setIsCurating] = useState(false);


    const handleFieldChange = (field: keyof CuratedCVData, value: any) => {
        setCvData(prev => ({ ...prev, [field]: value }));
    };

    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCvData(prev => ({
          ...prev,
          contactInfo: { ...prev.contactInfo, [name]: value },
        }));
    };
    
    const handleUpdate = <T,>(section: keyof CuratedCVData, index: number, updatedItem: T) => {
      const items = (cvData[section] as T[] || []);
      const newItems = [...items];
      newItems[index] = updatedItem;
      handleFieldChange(section, newItems);
    };

    const handleRemove = <T,>(section: keyof CuratedCVData, index: number) => {
        const items = (cvData[section] as T[] || []);
        handleFieldChange(section, items.filter((_, i) => i !== index));
    };

    const handleAdd = <T,>(section: keyof CuratedCVData, newItem: T) => {
        const items = (cvData[section] as T[] || []);
        handleFieldChange(section, [...items, newItem]);
    };
    
    const handleSkillsUpdate = (oldCategory: string, newCategory: string, skills: string[]) => {
        const newSkills = { ...cvData.skills };
        if (oldCategory !== newCategory) {
            delete newSkills[oldCategory];
        }
        newSkills[newCategory] = skills;
        handleFieldChange('skills', newSkills);
    };
    const handleSkillsRemove = (category: string) => {
        const newSkills = { ...cvData.skills };
        delete newSkills[category];
        handleFieldChange('skills', newSkills);
    };

    const handleSkillsAdd = () => {
        const newSkills = { ...cvData.skills, [`New Category ${Object.keys(cvData.skills || {}).length + 1}`]: [] };
        handleFieldChange('skills', newSkills);
    };

    // --- PDF Generation ---

    // 🚀 ADDED THIS FUNCTION BACK
    const handleCreatePdfFromServer = async () => {
        setIsGenerating(true);
        onError('');
        
        try {
            const payload = { curatedData: cvData, profilePhoto };
            const response = await fetch('https://YOUR_WORKER_URL_HERE.workers.dev/api/create-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error((await response.json()).error || `PDF Generation Failed`);
            const blob = await response.blob();
            if (blob.type !== 'application/pdf') throw new Error('Server did not return a valid PDF.');

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `CV_Genie_${cvData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            onError(`Error: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };


    const handleCreatePdfLocally = () => {
        setIsGenerating(true);
        onError('');

        if (!profilePhoto) {
            onError("Profile photo is missing.");
            setIsGenerating(false);
            return;
        }

        try {
            const photoDataUrl = `data:${profilePhoto.mimeType};base64,${profilePhoto.data}`;
            const cvHtmlString = generateCvHtml(cvData, photoDataUrl);
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                throw new Error("Could not open a new window. Please disable your pop-up blocker.");
            }
            
            printWindow.document.write(cvHtmlString);
            printWindow.document.close();

            setTimeout(() => {
                printWindow.print();
                printWindow.close();
                setIsGenerating(false);
            }, 750);
        } catch (error: any) {
            onError(`Error: ${error.message}`);
            setIsGenerating(false);
        }
    };

const handleRecurate = async () => {
  if (!newJobTitle.trim()) {
    onError('Please enter a new job title');
    return;
  }
  if (!settings.geminiApiKey) {
    onError('Gemini API key is missing from Settings.');
    return;
  }

  try {
    setIsCurating(true);
    onError('');
    
    const personalDetails = {
      email: cvData.contactInfo?.email,
      phone: cvData.contactInfo?.phone,
      location: cvData.contactInfo?.location,
      summary: cvData.summary,
      dateOfBirth: cvData.personalData?.dateOfBirth,
      placeOfBirth: cvData.personalData?.placeOfBirth,
      nationality: cvData.personalData?.nationality,
    };
    const urls = {
      linkedinUrl: cvData.contactInfo?.linkedin,
      githubUrl: cvData.contactInfo?.github,
      portfolioUrl: cvData.contactInfo?.portfolio,
    };
    const body = {
      geminiApiKey: settings.geminiApiKey,
      geminiModel: settings.cvGenieModel,
      extractedJson: extractedData,
      targetJobTitle: newJobTitle,
      jobInfo: newJobInfo,
      companyInfo: newCompanyInfo,
      personalDetails,
      urls,
    };
    const res = await fetch(
      'https://YOUR_WORKER_URL_HERE.workers.dev/api/curate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Re-curation failed');
    }

    const newCurated = await res.json();
    setCuratedData(newCurated);
    setCvData(newCurated);
    setNewJobTitle('');
    setNewJobInfo('');
    setNewCompanyInfo('');
  } catch (err: any) {
    onError(err.message || 'Error during re-curation');
  } finally {
    setIsCurating(false);
  }
};

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="w-full">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl text-primary">Review & Edit Your CV</CardTitle>
                    <CardDescription>Make any final adjustments below, then click to create your PDF.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                         <div className="p-4 border rounded-lg">
                            <h3 className="pb-2 mb-4 text-xl font-semibold border-b">Contact & Summary</h3>
                            <Input placeholder="Full Name" className="mb-4 text-lg font-bold" value={cvData.name} onChange={(e) => handleFieldChange('name', e.target.value)} />
                             <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-3">
                                <Input name="email" placeholder="Email" value={cvData.contactInfo?.email} onChange={handleContactChange} />
                                <Input name="phone" placeholder="Phone" value={cvData.contactInfo?.phone} onChange={handleContactChange} />
                                <Input name="location" placeholder="Location" value={cvData.contactInfo?.location} onChange={handleContactChange} />
                                <Input name="linkedin" placeholder="LinkedIn URL" value={cvData.contactInfo?.linkedin} onChange={handleContactChange} />
                                <Input name="github" placeholder="GitHub URL" value={cvData.contactInfo?.github} onChange={handleContactChange} />
                                <Input name="portfolio" placeholder="Portfolio URL" value={cvData.contactInfo?.portfolio} onChange={handleContactChange} />
                            </div>
                            <Textarea placeholder="Professional Summary" value={cvData.summary} onChange={(e) => handleFieldChange('summary', e.target.value)} rows={4}/>
                        </div>

                        <EditableSection
                          title="Skills"
                          items={Object.entries(cvData.skills || {})}
                          onAdd={handleSkillsAdd}
                          renderItem={([category, skills], index) => <SkillsItem key={index} category={category} skills={skills} onUpdate={handleSkillsUpdate} onRemove={handleSkillsRemove} />}
                        />
                         <EditableSection
                          title="Work Experience"
                          items={cvData.workExperience}
                          onAdd={() => handleAdd<WorkExperience>('workExperience', { title: '', company: '', location: '', dates: '', description: [] })}
                          renderItem={(item, index) => <WorkExperienceItem key={index} item={item} index={index} onUpdate={(idx, updated) => handleUpdate('workExperience', idx, updated)} onRemove={(idx) => handleRemove('workExperience', idx)} />}
                        />
                        <EditableSection
                          title="Projects"
                          items={cvData.projects}
                          onAdd={() => handleAdd<Project>('projects', { name: '', description: '', url: '' })}
                          renderItem={(item, index) => <ProjectItem key={index} item={item} index={index} onUpdate={(idx, updated) => handleUpdate('projects', idx, updated)} onRemove={(idx) => handleRemove('projects', idx)} />}
                        />
                        <EditableSection
                          title="Certifications"
                          items={cvData.certifications}
                          onAdd={() => handleAdd<Certification>('certifications', { name: '', issuer: '', date: '' })}
                          renderItem={(item, index) => <CertificationItem key={index} item={item} index={index} onUpdate={(idx, updated) => handleUpdate('certifications', idx, updated)} onRemove={(idx) => handleRemove('certifications', idx)} />}
                        />
                         <EditableSection
                          title="Education"
                          items={cvData.education}
                          onAdd={() => handleAdd<Education>('education', { institution: '', degree: '', dates: '' })}
                          renderItem={(item, index) => <EducationItem key={index} item={item} index={index} onUpdate={(idx, updated) => handleUpdate('education', idx, updated)} onRemove={(idx) => handleRemove('education', idx)} />}
                        />
                    </div>
                     {/* 👇 RESTORED THE ORIGINAL BUTTON LAYOUT 👇 */}
                    <div className="flex flex-col items-center justify-center gap-4 mt-8 md:flex-row">
                        <Button variant="secondary" onClick={onStartOver} disabled={isGenerating}>Start Over</Button>
                        <Button onClick={handleCreatePdfLocally} disabled={isGenerating} variant="ghost" className="border-2 border-primary">
                            {isGenerating ? <Spinner /> : 'Create PDF Locally (Free)'}
                        </Button>
                        <Button onClick={handleCreatePdfFromServer} disabled={isGenerating} size="lg">
                            {isGenerating ? <Spinner /> : 'Create PDF from Server'}
                        </Button>
                    </div>
                    <div className="mt-8 border-t border-border pt-6 space-y-4">
                      <h3 className="text-center text-lg font-semibold text-muted-foreground">Re-curate for a Different Role</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          placeholder="New Job Title to tailor CV for"
                          value={newJobTitle}
                          onChange={(e) => setNewJobTitle(e.target.value)}
                        />
                        <Button onClick={handleRecurate} disabled={isCurating || !newJobTitle.trim()} className="w-full md:w-auto">
                          {isCurating ? <Spinner /> : 'Re-Curate CV'}
                        </Button>
                      </div>
                      <Textarea
                          placeholder="Optional: Paste new job description..."
                          value={newJobInfo}
                          onChange={(e) => setNewJobInfo(e.target.value)}
                          rows={4}
                      />
                      <Textarea
                          placeholder="Optional: Paste new company info..."
                          value={newCompanyInfo}
                          onChange={(e) => setNewCompanyInfo(e.target.value)}
                          rows={2}
                      />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};