import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

type SingleTopbarProps = {
  name: string;
  onNameChange: (next: string) => void;
  onRun: () => void;
  isRunning?: boolean;
};

export function SingleTopbar({ name, onNameChange, onRun, isRunning = false }: SingleTopbarProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          id="single-name-input"
          value={name}
          onChange={(event) => onNameChange(event.currentTarget.value)}
          placeholder="Enter sample input..."
        />
        <Button type="button" onClick={onRun} disabled={isRunning}>
          {isRunning ? "Running..." : "Run single"}
        </Button>
      </div>
    </section>
  );
}
