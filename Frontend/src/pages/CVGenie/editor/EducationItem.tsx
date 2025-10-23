
import { Education } from "../../../lib/types";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";

interface EducationItemProps {
  item: Education;
  index: number;
  onUpdate: (index: number, updatedItem: Education) => void;
  onRemove: (index: number) => void;
}

export const EducationItem: React.FC<EducationItemProps> = ({ item, index, onUpdate, onRemove }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(index, { ...item, [e.target.name]: e.target.value });
  };

  return (
    <div className="relative p-4 mb-4 border rounded-lg bg-background/50">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Input name="institution" placeholder="Institution" value={item.institution} onChange={handleChange} />
        <Input name="degree" placeholder="Degree" value={item.degree} onChange={handleChange} />
        <Input name="dates" placeholder="Dates" value={item.dates} onChange={handleChange} />
      </div>
      <Button variant="ghost" size="icon" onClick={() => onRemove(index)} className="absolute top-2 right-2 w-7 h-7 text-destructive hover:bg-destructive/10">
        &times;
      </Button>
    </div>
  );
};
