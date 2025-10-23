
import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';

interface AfterApplyingFormProps {
    onGenerate: (data: any) => void;
    isLoading: boolean;
}

const AfterApplyingForm: React.FC<AfterApplyingFormProps> = ({ onGenerate, isLoading }) => {
    const [formData, setFormData] = useState({
        recipientName: '',
        recipientRole: 'Executive at company',
        universityName: '',
        companyName: '',
        recipientPosition: '',
        jobTitle: '',
        messageType: 'short linkedin message',
        aboutJob: '',
        aboutCompany: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-2">Reach Out After Applying</h3>
            <Input placeholder="Recipient's Name" name="recipientName" value={formData.recipientName} onChange={handleChange} required />
            <Select
                aria-label="Who are they?"
                name="recipientRole"
                value={formData.recipientRole}
                onChange={handleChange}
            >
                <option value="Executive at company">Executive at Company</option>
                <option value="university fellow in company">University Fellow in Company</option>
                <option value="friend / aquaintance from company">Friend / Acquaintance from Company</option>
            </Select>
            {formData.recipientRole === 'university fellow in company' && (
                 <Input placeholder="University Name" name="universityName" value={formData.universityName} onChange={handleChange} required />
            )}
            <Input placeholder="Company Name" name="companyName" value={formData.companyName} onChange={handleChange} required />
            <Input placeholder="Recipient's Position (Optional)" name="recipientPosition" value={formData.recipientPosition} onChange={handleChange} />
            <Input placeholder="Job Title You Applied For" name="jobTitle" value={formData.jobTitle} onChange={handleChange} required />
            
            <Textarea 
                aria-label="About the job (Optional)"
                name="aboutJob" 
                value={formData.aboutJob} 
                onChange={handleChange} 
                placeholder="About Job (optional)"
            />
            <Textarea 
                aria-label="About the company (Optional)"
                name="aboutCompany" 
                value={formData.aboutCompany} 
                onChange={handleChange} 
                placeholder="About the company (Optional)"
            />

            <Select
                aria-label="Message Type"
                name="messageType"
                value={formData.messageType}
                onChange={handleChange}
            >
                <option value="short linkedin message">Short LinkedIn Message</option>
                <option value="detailed email">Detailed Email</option>
                <option value="one liner 200 characters connection request message">LinkedIn Connection Request (200 chars)</option>
                <option value="short message">Short Message (General)</option>
            </Select>
            <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <><FaSpinner className="animate-spin" /> Generating...</> : <><FaPaperPlane /> Generate</>}
            </Button>
        </form>
    );
};

export default AfterApplyingForm;
