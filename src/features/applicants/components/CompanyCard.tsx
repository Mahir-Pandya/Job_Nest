import Link from "next/link";
import Image from "next/image";
import { MapPin, Briefcase, ExternalLink, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CompanyCardProps {
  id: number;
  name: string | null;
  description: string | null;
  location: string | null;
  avatarUrl: string | null;
  jobCount: number;
  organizationType: string | null;
}

export function CompanyCard({
  id,
  name,
  description,
  location,
  avatarUrl,
  jobCount,
  organizationType,
}: CompanyCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col h-full">
      <div className="flex items-start gap-4 mb-4">
        <div className="h-16 w-16 relative rounded-lg overflow-hidden bg-gray-50 border flex-shrink-0">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={name || "Company"} fill className="object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-blue-50 text-blue-600 font-bold text-xl">
              {name?.charAt(0).toUpperCase() || <Building2 className="w-8 h-8" />}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 truncate">{name || "Unnamed Company"}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{location || "Location not specified"}</span>
          </div>
        </div>
      </div>

      {organizationType && (
        <div className="mb-4">
          <Badge variant="secondary" className="font-normal text-xs">
            {organizationType}
          </Badge>
        </div>
      )}

      <p className="text-sm text-gray-600 line-clamp-3 mb-6 flex-grow">
        {description ? description.replace(/<[^>]*>?/gm, '') : "No description provided."}
      </p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t">
        <div className="flex items-center gap-1.5 text-blue-600 font-medium text-sm">
          <Briefcase className="w-4 h-4" />
          {jobCount} {jobCount === 1 ? "Open Job" : "Open Jobs"}
        </div>
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-gray-600 hover:text-blue-600">
          <Link href={`/companies/${id}`}>
            View Profile
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
