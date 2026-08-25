// The list of item categories used across the whole app.
// To add a category: add one line here and it appears everywhere automatically.
import {
  Cog,
  Sofa,
  Refrigerator,
  Tv,
  HardHat,
  TreePine,
  Package,
  Shapes,
  type LucideIcon,
} from "lucide-react";

export interface Category {
  name: string;
  icon: LucideIcon;
}

export const CATEGORIES: Category[] = [
  { name: "Scrap Metal", icon: Cog },
  { name: "Furniture", icon: Sofa },
  { name: "Appliances", icon: Refrigerator },
  { name: "Electronics", icon: Tv },
  { name: "Building Materials", icon: HardHat },
  { name: "Wood", icon: TreePine },
  { name: "Reusable Items", icon: Package },
  { name: "Other", icon: Shapes },
];

// Returns the icon for a category name (falls back to "Other").
export function getCategoryIcon(categoryName: string): LucideIcon {
  const found = CATEGORIES.find((category) => category.name === categoryName);
  return found ? found.icon : Shapes;
}
