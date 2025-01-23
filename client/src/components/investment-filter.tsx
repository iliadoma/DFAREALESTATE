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
import {
  Building2,
  Store,
  DoorClosed,
  Building,
  Warehouse,
  Dumbbell,
  Coffee,
  Home,
  ShoppingBag,
  Users
} from "lucide-react";

type FilterProps = {
  onFilterChange: (filters: {
    type?: "real_estate" | "business";
    category?: string;
    minRoi?: number;
    maxPrice?: number;
  }) => void;
  className?: string;
};

const categories = {
  real_estate: [
    { value: "standalone_building", label: "Standalone Building", icon: Building2 },
    { value: "ground_floor_commercial", label: "Ground Floor Commercial", icon: DoorClosed },
    { value: "mixed_use", label: "Mixed Use", icon: Building },
    { value: "office_space", label: "Office Space", icon: Building2 },
    { value: "warehouse", label: "Warehouse", icon: Warehouse }
  ],
  business: [
    { value: "yoga_studio", label: "Yoga Studio", icon: Users },
    { value: "restaurant", label: "Restaurant", icon: Store },
    { value: "fitness_center", label: "Fitness Center", icon: Dumbbell },
    { value: "coffee_shop", label: "Coffee Shop", icon: Coffee },
    { value: "retail_store", label: "Retail Store", icon: ShoppingBag },
    { value: "coworking_space", label: "Co-working Space", icon: Users }
  ]
};

export default function InvestmentFilter({ onFilterChange, className }: FilterProps) {
  const [type, setType] = useState<"real_estate" | "business" | undefined>();
  const [category, setCategory] = useState<string>();
  const [minRoi, setMinRoi] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(100000);

  const handleTypeChange = (value: "real_estate" | "business") => {
    setType(value);
    setCategory(undefined); // Reset category when type changes
    onFilterChange({ type: value, minRoi, maxPrice });
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    onFilterChange({ type, category: value, minRoi, maxPrice });
  };

  const handleRoiChange = (value: number[]) => {
    setMinRoi(value[0]);
    onFilterChange({ type, category, minRoi: value[0], maxPrice });
  };

  const handlePriceChange = (value: number[]) => {
    setMaxPrice(value[0]);
    onFilterChange({ type, category, minRoi, maxPrice: value[0] });
  };

  return (
    <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
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
              categories[type].map(({ value, label, icon: Icon }) => (
                <SelectItem key={value} value={value}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {label}
                  </div>
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

      <div className="space-y-4">
        <div className="flex justify-between">
          <Label>Max Investment</Label>
          <span className="text-sm text-muted-foreground">
            ${maxPrice.toLocaleString()}
          </span>
        </div>
        <Slider
          defaultValue={[100000]}
          max={1000000}
          step={10000}
          onValueChange={handlePriceChange}
        />
      </div>
    </div>
  );
}