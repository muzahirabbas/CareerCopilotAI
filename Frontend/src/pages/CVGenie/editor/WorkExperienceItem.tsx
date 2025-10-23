
import { WorkExperience } from "../../../lib/types";
import { Input } from "../../../components/ui/Input";
import { Textarea } from "../../../components/ui/Textarea";
import { Button } from "../../../components/ui/Button";

interface WorkExperienceItemProps {
  item: WorkExperience;
  index: number;
  onUpdate: (index: number, updatedItem: WorkExperience) => void;
  onRemove: (index: number) => void;
}

export const WorkExperienceItem: React.FC<WorkExperienceItemProps> = ({ item, index, onUpdate, onRemove }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'description') {
      onUpdate(index, { ...item, description: value.split('\n') });
    } else {
      onUpdate(index, { ...item, [name]: value });
    }
  };
  
  return (
    <div className="relative p-4 mb-4 space-y-4 border rounded-lg bg-background/50">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input name="title" placeholder="Job Title" value={item.title} onChange={handleChange} />
        <Input name="company" placeholder="Company" value={item.company} onChange={handleChange} />
        <Input name="location" placeholder="Location" value={item.location} onChange={handleChange} />
        <Input name="dates" placeholder="Dates" value={item.dates} onChange={handleChange} />
      </div>
      <Textarea
        name="description"
        placeholder="Description (one bullet point per line)"
        value={item.description.join('\n')}
        onChange={handleChange}
        rows={4}
      />
      <Button variant="ghost" size="icon" onClick={() => onRemove(index)} className="absolute top-2 right-2 w-7 h-7 text-destructive hover:bg-destructive/10">
        &times;
      </Button>
    </div>
  );
};
