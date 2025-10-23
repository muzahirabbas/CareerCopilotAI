
import { Button } from "../../../components/ui/Button";

interface EditableSectionProps<T> {
  title: string;
  items: T[] | undefined;
  onAdd: () => void;
  renderItem: (item: T, index: number) => React.ReactNode;
}

export function EditableSection<T>({ title, items, onAdd, renderItem }: EditableSectionProps<T>) {
  return (
    <div className="p-4 mb-6 border rounded-lg border-border">
      <h3 className="pb-2 mb-4 text-xl font-semibold border-b">{title}</h3>
      <div>{items && items.map((item, index) => renderItem(item, index))}</div>
      <Button
        type="button"
        onClick={onAdd}
        className="w-full mt-4 border-2 border-dashed text-primary border-primary hover:bg-primary hover:text-primary-foreground"
        variant="ghost"
      >
        + Add {title}
      </Button>
    </div>
  );
}
