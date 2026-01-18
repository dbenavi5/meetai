import { SearchIcon } from "lucide-react";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";
import { Input } from "@/components/ui/input";

export const MeetingsSearchFilter = () => {
  const [filter, setFilters] = useMeetingsFilters();

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
