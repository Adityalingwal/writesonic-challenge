import { Eye, Check, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface PerspectiveSelectorProps {
  allBrands: string[];
  activeBrand: string;
  myBrand: string;
  onBrandChange: (brand: string) => void;
}

export function PerspectiveSelector({
  allBrands,
  activeBrand,
  myBrand,
  onBrandChange,
}: PerspectiveSelectorProps) {
  const isImpersonating = activeBrand !== myBrand;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground hidden sm:inline-block">
        Perspective:
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={isImpersonating ? "secondary" : "outline"}
            size="sm"
            className={`gap-2 ${
              isImpersonating
                ? "bg-purple-500/10 text-purple-600 border-purple-200 hover:bg-purple-500/20"
                : ""
            }`}
          >
            {isImpersonating ? (
              <Eye className="h-4 w-4" />
            ) : (
              <User className="h-4 w-4" />
            )}
            <span className="font-medium">
              {isImpersonating ? `Viewing as ${activeBrand}` : "My View"}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
            Switch Perspective
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="gap-2 cursor-pointer"
            onClick={() => onBrandChange(myBrand)}
          >
            <div className="flex items-center justify-between w-full">
              <span className="flex items-center gap-2 font-medium">
                <User className="h-4 w-4 text-green-500" />
                {myBrand} (You)
              </span>
              {activeBrand === myBrand && <Check className="h-4 w-4" />}
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Impersonate Competitor
          </DropdownMenuLabel>

          {allBrands
            .filter((b) => b !== myBrand)
            .map((brand) => (
              <DropdownMenuItem
                key={brand}
                className="gap-2 cursor-pointer"
                onClick={() => onBrandChange(brand)}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    {brand}
                  </span>
                  {activeBrand === brand && <Check className="h-4 w-4" />}
                </div>
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {isImpersonating && (
        <Badge
          variant="outline"
          className="border-purple-200 text-purple-600 bg-purple-50"
        >
          Impersonating Mode
        </Badge>
      )}
    </div>
  );
}
