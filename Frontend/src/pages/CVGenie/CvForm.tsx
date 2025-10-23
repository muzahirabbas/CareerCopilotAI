import React, { useState, useCallback, useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { motion } from 'framer-motion';

import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { FormLabel } from '../../components/ui/Label';
import { processFiles, fileToBase64, cleanText } from '../../lib/file-processors';
import { AppStatus, CuratedCVData, ProfilePhoto, AppSettings } from '../../lib/types';

import { UploadCloudIcon, FileIcon } from '../../assets/icons';

interface IFormInput {
  email: string;
  phone: string;
  location: string;
  userSummary: string;
  profilePhoto: FileList;
  jobTitle: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  linkedinText: string;
  textFile: FileList;
  dateOfBirth: string;
  placeOfBirth: string;
  nationality: string;
  companyInfo: string;
  jobInfo: string;
}

interface CvFormProps {
  settings: AppSettings;
  extractedData: any | null;
  setAppStatus: (status: AppStatus) => void;
  setCuratedData: (data: CuratedCVData) => void;
  setExtractedData: (data: any) => void;
  setProfilePhoto: (photo: ProfilePhoto | null) => void;
  updateProgress: (percentage: number, text: string) => void;
  onError: (message: string) => void;
}

export const CvForm: React.FC<CvFormProps> = ({
  settings,
  extractedData,
  setAppStatus,
  setCuratedData,
  setExtractedData,
  setProfilePhoto,
  updateProgress,
  onError,
}) => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<IFormInput>();
  const [inputMethod, setInputMethod] = useState<'text' | 'files'>('text');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSkipExtraction = () => {
      if (extractedData) {
          setAppStatus('editing');
      } else {
          onError("No previously extracted data found to use.");
      }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      setUploadedFiles((prev) => [...prev, ...files]);
    }
  };
  
  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };
  
  const handleFileDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const files = Array.from(event.dataTransfer.files);
    setUploadedFiles((prev) => [...prev, ...files]);
  }, []);
  
  const handleTxtFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const text = await file.text();
      setValue('linkedinText', text, { shouldValidate: true });
    }
  };

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    if (!settings.geminiApiKey) {
      onError("Gemini API key not found. Please set it in the Settings page.");
      return;
    }
    setAppStatus('processing');
    onError('');
    updateProgress(0, 'Initializing...');
    try {
      let linkedinDataPayload = '';
      if (inputMethod === 'text') {
        if (!data.linkedinText) throw new Error('Pasted text or .txt file is required.');
        linkedinDataPayload = data.linkedinText;
        updateProgress(20, 'Sending text data...');
      } else {
        if (uploadedFiles.length === 0) throw new Error('At least one PDF or image file is required.');
        updateProgress(5, 'Processing files in your browser...');
        linkedinDataPayload = await processFiles(uploadedFiles, (p, t) =>
          updateProgress(5 + p * 0.25, t)
        );
        updateProgress(30, 'Uploading extracted text...');
      }

      const photo = data.profilePhoto[0] ? await fileToBase64(data.profilePhoto[0]) : null;
      if (photo) setProfilePhoto(photo);
      
      updateProgress(40, 'Extracting structured data...');
      const extractRes = await fetch(
        'https://YOUR_WORKER_URL_HERE.workers.dev/api/extract',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            geminiApiKey: settings.geminiApiKey,
            linkedinData: cleanText(linkedinDataPayload),
          }),
        }
      );
      if (!extractRes.ok) {
        const errBody = await extractRes.json().catch(() => ({ error: 'Extraction failed' }));
        throw new Error(errBody.error || 'Extraction failed');
      }
      const extractedJson = await extractRes.json();
      setExtractedData(extractedJson);
      updateProgress(60, 'Extraction complete! Preparing curation...');

      updateProgress(65, 'Curating CV...');
      const curateRes = await fetch(
        'https://YOUR_WORKER_URL_HERE.workers.dev/api/curate',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            geminiApiKey: settings.geminiApiKey,
            geminiModel: settings.cvGenieModel,
            extractedJson,
            targetJobTitle: data.jobTitle,
            jobInfo: data.jobInfo,
            companyInfo: data.companyInfo,
            personalDetails: {
              email: data.email,
              phone: data.phone,
              location: data.location,
              summary: data.userSummary,
              dateOfBirth: data.dateOfBirth,
              placeOfBirth: data.placeOfBirth,
              nationality: data.nationality,
            },
            urls: {
              linkedinUrl: data.linkedinUrl,
              githubUrl: data.githubUrl,
              portfolioUrl: data.portfolioUrl,
            },
          }),
        }
      );
      if (!curateRes.ok) {
        const errBody = await curateRes.json().catch(() => ({ error: 'Curation failed' }));
        throw new Error(errBody.error || 'Curation failed');
      }
      updateProgress(90, 'Finalizing results...');
      const curatedResult = await curateRes.json();
      setCuratedData(curatedResult);
      updateProgress(100, 'Ready for your review!');
      setAppStatus('editing');
    } catch (error: any) {
      onError(`Error: ${error.message}`);
      setAppStatus('idle');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
             <p className="text-sm text-muted-foreground">Your Gemini API key and preferred model are used from the global Settings page.</p>

            <div>
              <FormLabel htmlFor="email" optionalText="(Optional)">Personal Details</FormLabel>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Input id="email" type="email" placeholder="Email" {...register('email')} />
                <Input id="phone" type="tel" placeholder="Phone" {...register('phone')} />
                <Input id="location" placeholder="Location" {...register('location')} />
                <Input id="dateOfBirth" placeholder="Date of Birth" {...register('dateOfBirth')} />
                <Input id="placeOfBirth" placeholder="Place of Birth" {...register('placeOfBirth')} />
                <Input id="nationality" placeholder="Nationality" {...register('nationality')} />
              </div>
            </div>

            <div>
              <FormLabel htmlFor="user-summary" optionalText="(Optional)">Professional Summary</FormLabel>
              <Textarea id="user-summary" {...register('userSummary')} placeholder="A brief summary..." />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <FormLabel htmlFor="profile-photo" required>Profile Photo</FormLabel>
                <div className="flex items-center gap-4">
                  {photoPreview && <img src={photoPreview} alt="Preview" className="object-cover w-16 h-16 rounded-full" />}
                  <Input id="profile-photo" type="file" accept="image/*" {...register('profilePhoto', { required: true, onChange: (e) => setPhotoPreview(URL.createObjectURL(e.target.files[0])) })} />
                </div>
                {errors.profilePhoto && <p className="mt-1 text-xs text-destructive">Profile Photo is required.</p>}
              </div>
              <div>
                <FormLabel htmlFor="job-title" required>Target Job Title</FormLabel>
                <Input id="job-title" {...register('jobTitle', { required: true })} />
              </div>
              <div>
                <FormLabel htmlFor="job-info" optionalText="(Optional)">Job Description</FormLabel>
                <Textarea id="job-info" {...register('jobInfo')} placeholder="Paste the job description here for a more tailored CV..." rows={5}/>
              </div>
              <div>
                <FormLabel htmlFor="company-info" optionalText="(Optional)">Company Information</FormLabel>
                <Textarea id="company-info" {...register('companyInfo')} placeholder="Paste info about the company's culture, values, or recent news..." rows={5}/>
              </div>
            </div>

            <div>
              <FormLabel htmlFor="linkedin-url" optionalText="(Optional)">Professional URLs</FormLabel>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Input id="linkedin-url" type="url" placeholder="LinkedIn" {...register('linkedinUrl')} />
                <Input id="github-url" type="url" placeholder="GitHub" {...register('githubUrl')} />
                <Input id="portfolio-url" type="url" placeholder="Portfolio" {...register('portfolioUrl')} />
              </div>
            </div>

            <div>
              <FormLabel htmlFor="input-method" required>LinkedIn Profile Data Input</FormLabel>
              <Select id="input-method" value={inputMethod} onChange={(e) => setInputMethod(e.target.value as 'text' | 'files')}>
                <option value="text">Text / .txt (Recommended)</option>
                <option value="files">PDF / Images</option>
              </Select>
            </div>

            {inputMethod === 'text' ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <FormLabel htmlFor="linkedin-text">Paste LinkedIn profile text or upload .txt / .json file</FormLabel>
                <Textarea id="linkedin-text" {...register('linkedinText')} rows={8} placeholder="Paste LinkedIn text" />
                <Input id="text-file" type="file" accept=".txt,.json" {...register('textFile', { onChange: handleTxtFileChange })} className="mt-2" />
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div
                  onDrop={handleFileDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg cursor-pointer border-border hover:border-primary"
                >
                  <UploadCloudIcon className="w-12 h-12 text-muted-foreground" />
                  <p className="mt-2 font-semibold">Drag & drop PDF/image files here</p>
                  <p className="text-sm text-muted-foreground">Or click to select.</p>
                </div>
                <input type="file" multiple accept="application/pdf,image/*" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                {uploadedFiles.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-4 md:grid-cols-4">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 text-xs rounded-md bg-secondary">
                        <div className="flex items-center truncate">
                          <FileIcon className="w-4 h-4 mr-2 shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <button type="button" onClick={() => handleRemoveFile(index)} className="ml-2 text-destructive hover:underline">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            <div className="space-y-2">
              <Button type="submit" size="lg" className="w-full">Generate & Review CV</Button>
              <Button 
                type="button" 
                size="lg" 
                variant="secondary" 
                className="w-full"
                onClick={handleSkipExtraction}
                disabled={!extractedData}
              >
                Skip Extraction & Use Last Saved Data
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};