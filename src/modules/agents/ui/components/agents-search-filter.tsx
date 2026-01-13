import { SearchIcon } from "lucide-react";
import { useAgentsFilters } from "../../hooks/use-agents-filters";
import { Input } from "@/components/ui/input";

export const AgentsSearchFilter = () => {
  const [filter, setFilters] = useAgentsFilters();

  return (
    <div className="relative">
      <Input
        placeholder="Filter by name"
        value={filter.search}
        className="h-9 bg-white w-[200px] pl-7"
        onChange={(e) => setFilters({ search: e.target.value })}
      />
      <SearchIcon className="size-4 text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2" />
    </div>
  );
};
