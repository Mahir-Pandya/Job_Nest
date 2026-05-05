import { getAllEmployers } from "@/features/server/employers.queries";
import { CompanyCard } from "@/features/applicants/components/CompanyCard";
import { Building2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const metadata = {
  title: "Companies | JobNest",
  description: "Browse top companies and their current job openings.",
};

export default async function CompaniesPage() {
  const companies = await getAllEmployers();

  return (
    <div className="bg-gray-50/50 min-h-screen pb-20">
      <div className="bg-white border-b py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-2xl mb-6">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
            Find Top Companies
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
            Discover the best places to work and explore career opportunities with leading organizations.
          </p>
          
          <div className="max-w-xl mx-auto relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <Input 
              placeholder="Search companies by name or location..." 
              className="pl-12 h-14 bg-white border-gray-200 shadow-sm rounded-xl text-lg focus-visible:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 mt-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Featured Companies
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {companies.length}
            </span>
          </h2>
        </div>

        {companies.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500">No companies found at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <CompanyCard
                key={company.employer.id}
                id={company.employer.id}
                name={company.employer.name}
                description={company.employer.description}
                location={company.employer.location}
                avatarUrl={company.user.avatarUrl}
                jobCount={company.jobCount}
                organizationType={company.employer.organizationType}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
