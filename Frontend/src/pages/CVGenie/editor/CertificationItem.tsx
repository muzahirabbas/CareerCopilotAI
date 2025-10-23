
import { Certification } from "../../../lib/types";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";

interface CertificationItemProps {
  item: Certification;
  index: number;
  onUpdate: (index: number, updatedItem: Certification) => void;
  onRemove: (index: number) => void;
}

export const CertificationItem: React.FC<CertificationItemProps> = ({ item, index, onUpdate, onRemove }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(index, { ...item, [e.target.name]: e.target.value });
  };

  return (
    <div className="relative p-4 mb-4 border rounded-lg bg-background/50">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Input name="name" placeholder="Certification Name" value={item.name} onChange={handleChange} />
        <Input name="issuer" placeholder="Issuer" value={item.issuer} onChange={handleChange} />
        <Input name="date" placeholder="Date" value={item.date} onChange={handleChange} />
      </div>
      <Button variant="ghost" size="icon" onClick={() => onRemove(index)} className="absolute top-2 right-2 w-7 h-7 text-destructive hover:bg-destructive/10">
        &times;
      </Button>
    </div>
  );
};
