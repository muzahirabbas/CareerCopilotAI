
import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';

interface ExpandNetworkFormProps {
    onGenerate: (data: any) => void;
    isLoading: boolean;
}

const contexts = [
    'switching fields',
    'updated porfolio',
    'looking for job opportunities',
    'seeking mentorship',
    'recently graduated'
];

const ExpandNetworkForm: React.FC<ExpandNetworkFormProps> = ({ onGenerate, isLoading }) => {
    const [formData, setFormData] = useState({
        recipientName: '',
        relationship: 'aquaintance',
        selectedContexts: ['looking for job opportunities'],
        profession: '',
        messageType: 'short linkedin message',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleContextChange = (context: string) => {
        setFormData(prev => {
            const newContexts = prev.selectedContexts.includes(context)
                ? prev.selectedContexts.filter(c => c !== context)
                : [...prev.selectedContexts, context];
            return { ...prev, selectedContexts: newContexts };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate({
            recipientName: formData.recipientName,
            relationship: formData.relationship,
            contexts: formData.selectedContexts,
            profession: formData.profession,
            messageType: formData.messageType
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-2">Expand Your Network</h3>
            <Input placeholder="Recipient's Name" name="recipientName" value={formData.recipientName} onChange={handleChange} required />
            <Select
                aria-label="Relationship"
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
            >
                <option value="aquaintance">Acquaintance</option>
                <option value="friend">Friend</option>
                <option value="fb frnd">Facebook Friend</option>
                <option value="relative">Relative</option>
                <option value="colleague">Colleague</option>
                <option value="classmate">Classmate</option>
                <option value="uni fellow">University Fellow</option>
            </Select>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-muted-foreground">Context (Select all that apply)</label>
                 <div className="flex flex-wrap gap-2">
                    {contexts.map(context => (
                        <button
                            type="button"
                            key={context}
                            onClick={() => handleContextChange(context)}
                            className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${
                                formData.selectedContexts.includes(context)
                                    ? 'bg-secondary text-white'
                                    : 'bg-input hover:bg-accent text-text-main'
                            }`}
                        >
                            {context}
                        </button>
                    ))}
                </div>
            </div>
            <Input placeholder="Your Profession / Title" name="profession" value={formData.profession} onChange={handleChange} required />
            <Select
                aria-label="Message Type"
                name="messageType"
                value={formData.messageType}
                onChange={handleChange}
            >
                <option value="short linkedin message">Short LinkedIn Message</option>
                <option value="detailed email">Detailed Email</option>
                <option value="short whatsapp casual message">Short WhatsApp Casual Message</option>
                <option value="one liner message">One Liner Message</option>
            </Select>
            <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <><FaSpinner className="animate-spin" /> Generating...</> : <><FaPaperPlane /> Generate</>}
            </Button>
        </form>
    );
};

export default ExpandNetworkForm;
