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
  TrendingUp,
  Building,
  LineChart,
  BarChart3,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n/context";

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
    { value: "new_conservative", label: "Новая консервативная недвижимость", icon: Building2 },
    { value: "core_plus", label: "Core Plus недвижимость", icon: Building },
    { value: "value_add", label: "Уникальная недвижимость с добавленной стоимостью", icon: TrendingUp }
  ],
  business: [
    { value: "systematic", label: "Системные бизнесы", icon: BarChart3 }
  ]
};

export default function InvestmentFilter({ onFilterChange, className }: FilterProps) {
  const { t } = useI18n();
  const [type, setType] = useState<"real_estate" | "business">("real_estate");
  const [category, setCategory] = useState<string>();
  const [minRoi, setMinRoi] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(100000);

  const handleTypeChange = (value: string) => {
    const newType = value as "real_estate" | "business";
    setType(newType);
    setCategory(undefined); // Reset category when type changes
    onFilterChange({ type: newType, minRoi, maxPrice });
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
    <div className={`space-y-6 ${className}`}>
      <Tabs defaultValue={type} onValueChange={handleTypeChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="real_estate" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {t("investment.types.realEstate")}
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            {t("investment.types.business")}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label>{t("investment.category")}</Label>
          <Select
            value={category}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("investment.allCategories")} />
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
            <Label>{t("investment.minRoi")}</Label>
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
            <Label>{t("investment.maxInvestment")}</Label>
            <span className="text-sm text-muted-foreground">
              ₽{maxPrice.toLocaleString()}
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
    </div>
  );
}