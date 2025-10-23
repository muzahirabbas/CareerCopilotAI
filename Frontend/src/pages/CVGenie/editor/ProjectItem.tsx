
import { Project } from "../../../lib/types";
import { Input } from "../../../components/ui/Input";
import { Textarea } from "../../../components/ui/Textarea";
import { Button } from "../../../components/ui/Button";

interface ProjectItemProps {
  item: Project;
  index: number;
  onUpdate: (index: number, updatedItem: Project) => void;
  onRemove: (index: number) => void;
}

export const ProjectItem: React.FC<ProjectItemProps> = ({ item, index, onUpdate, onRemove }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onUpdate(index, { ...item, [e.target.name]: e.target.value });
  };

  return (
    <div className="relative p-4 mb-4 space-y-4 border rounded-lg bg-background/50">
      <Input name="name" placeholder="Project Name" value={item.name} onChange={handleChange} />
      <Textarea name="description" placeholder="Description" value={item.description} onChange={handleChange} rows={3} />
      <Input name="url" placeholder="Project URL" value={item.url || ''} onChange={handleChange} />
      <Button variant="ghost" size="icon" onClick={() => onRemove(index)} className="absolute top-2 right-2 w-7 h-7 text-destructive hover:bg-destructive/10">
        &times;
      </Button>
    </div>
  );
};
