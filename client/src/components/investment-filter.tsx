import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

type FilterProps = {
  onFilterChange: (filters: {
    type?: "real_estate" | "business";
    category?: string;
    minRoi?: number;
  }) => void;
  className?: string;
};

const categories = {
  real_estate: ["Office", "Retail", "Industrial", "Residential"],
  business: ["Cafe", "Restaurant", "Fitness", "Retail"],
};

export default function InvestmentFilter({ onFilterChange, className }: FilterProps) {
  const [type, setType] = useState<"real_estate" | "business" | undefined>();
  const [category, setCategory] = useState<string>();
  const [minRoi, setMinRoi] = useState<number>(0);

  const handleTypeChange = (value: "real_estate" | "business") => {
    setType(value);
    setCategory(undefined); // Reset category when type changes
    onFilterChange({ type: value, minRoi });
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    onFilterChange({ type, category: value, minRoi });
  };

  const handleRoiChange = (value: number[]) => {
    setMinRoi(value[0]);
    onFilterChange({ type, category, minRoi: value[0] });
  };

  return (
    <div className={`grid gap-6 md:grid-cols-3 ${className}`}>
      <div className="space-y-2">
        <Label>Investment Type</Label>
        <Select value={type} onValueChange={handleTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="real_estate">Real Estate</SelectItem>
            <SelectItem value="business">Business</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={category}
          onValueChange={handleCategoryChange}
          disabled={!type}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {type &&
              categories[type].map((cat) => (
                <SelectItem key={cat} value={cat.toLowerCase()}>
                  {cat}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between">
          <Label>Minimum ROI</Label>
          <span className="text-sm text-muted-foreground">{minRoi}%</span>
        </div>
        <Slider
          defaultValue={[0]}
          max={30}
          step={1}
          onValueChange={handleRoiChange}
        />
      </div>
    </div>
  );
}
