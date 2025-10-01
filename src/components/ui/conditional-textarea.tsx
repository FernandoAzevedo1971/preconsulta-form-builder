import { Textarea } from "./textarea";
import { Label } from "./label";

interface ConditionalTextareaProps {
  condition: boolean;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const ConditionalTextarea: React.FC<ConditionalTextareaProps> = ({
  condition,
  label,
  value,
  onChange,
  placeholder = `Fale mais sobre ${label.toLowerCase()}`
}) => {
  if (!condition) return null;

  return (
    <div className="mt-2">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1"
      />
    </div>
  );
};