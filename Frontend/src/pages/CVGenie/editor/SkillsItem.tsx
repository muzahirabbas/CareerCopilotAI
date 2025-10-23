
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";

interface SkillsItemProps {
  category: string;
  skills: string[];
  onUpdate: (category: string, updatedCategory: string, skills: string[]) => void;
  onRemove: (category: string) => void;
}

export const SkillsItem: React.FC<SkillsItemProps> = ({ category, skills, onUpdate, onRemove }) => {
  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(category, e.target.value, skills);
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(category, category, e.target.value.split(',').map(s => s.trim()));
  };
  
  return (
    <div className="relative p-4 mb-4 border rounded-lg bg-background/50">
      <div className="space-y-4">
        <Input placeholder="Category (e.g., Programming Languages)" value={category} onChange={handleCategoryChange} />
        <Input placeholder="Skills (comma-separated)" value={skills.join(', ')} onChange={handleSkillsChange} />
      </div>
      <Button variant="ghost" size="icon" onClick={() => onRemove(category)} className="absolute top-2 right-2 w-7 h-7 text-destructive hover:bg-destructive/10">
        &times;
      </Button>
    </div>
  );
};
