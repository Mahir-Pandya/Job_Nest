import type { Metadata, ResolvingMetadata } from "next";
import { getEmployerById } from "@/features/server/employers.queries";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  MapPin, 
  Globe, 
  Users, 
  Calendar, 
  Briefcase, 
  ArrowLeft,
  Building2,
  Clock,
  MessageSquare
} from "lucide-react";
import { getCurrentUser } from "@/features/auth/server/auth.queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface CompanyProfilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(
  { params }: CompanyProfilePageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id: rawId } = await params;
  const id = parseInt(rawId);
  if (isNaN(id)) return { title: "Company Not Found" };

  const data = await getEmployerById(id);
  if (!data) return { title: "Company Not Found" };

  const { employer, user } = data;
  const previousImages = (await parent).openGraph?.images || [];
  const ogImage = user.avatarUrl ? [user.avatarUrl, ...previousImages] : previousImages;
  const description = employer.description ? employer.description.substring(0, 160).replace(/<[^>]+>/g, '') : `View ${employer.name}'s company profile and open jobs on JobNest.`;

  return {
    title: employer.name || "Company Profile",
    description: description,
    openGraph: {
      title: employer.name || "Company Profile",
      description: description,
      images: ogImage,
    },
    twitter: {
      card: "summary_large_image",
      title: employer.name || "Company Profile",
      description: description,
      images: ogImage,
    },
  };
}

export default async function CompanyProfilePage({ params }: CompanyProfilePageProps) {
  const { id: rawId } = await params;
  const id = parseInt(rawId);
  
  if (isNaN(id)) return notFound();

  const currentUser = await getCurrentUser();
  const data = await getEmployerById(id);
  if (!data) return notFound();

  const { employer, user, activeJobs } = data;

  return (
    <div className="bg-gray-50/50 min-h-screen pb-20">
      {/* Banner */}
      <div className="h-48 md:h-64 w-full bg-blue-600 relative overflow-hidden">
        {employer.bannerImageUrl ? (
          <Image 
            src={employer.bannerImageUrl} 
            alt={employer.name || "Banner"} 
            fill 
            className="object-cover opacity-60" 
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-500 opacity-80" />
        )}
      </div>

      <div className="container mx-auto max-w-6xl px-4">
        <div className="relative -mt-16 md:-mt-24 mb-8">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-end gap-6">
            <div className="h-32 w-32 md:h-40 md:w-40 relative rounded-2xl overflow-hidden bg-white border-4 border-white shadow-md -mt-20 md:-mt-28 flex-shrink-0">
              {user.avatarUrl ? (
                <Image src={user.avatarUrl} alt={employer.name || "Logo"} fill className="object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-blue-50 text-blue-600 font-bold text-4xl">
                  {employer.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                    {employer.name || "Unnamed Company"}
                  </h1>
                  <p className="text-gray-500 font-medium text-lg mt-1">
                    {employer.organizationType || "Organization"}
                  </p>
                </div>
                <div className="flex gap-2">
                  {employer.websiteUrl && (
                    <Button asChild variant="outline" className="rounded-xl px-6 h-12 gap-2 border-blue-200 text-blue-600 hover:bg-blue-50">
                      <a href={employer.websiteUrl} target="_blank" rel="noreferrer">
                        Website
                        <Globe className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                  {(!currentUser || currentUser.id !== id) && (
                    <Button asChild className="rounded-xl px-6 h-12 gap-2 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100">
                      <Link href={`/messages/${id}`}>
                        Message
                        <MessageSquare className="w-4 h-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-y-3 gap-x-6 pt-2 border-t border-gray-100">
                {employer.location && (
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {employer.location}
                  </div>
                )}
                {employer.teamSize && (
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Users className="w-4 h-4 text-gray-400" />
                    {employer.teamSize} Employees
                  </div>
                )}
                {employer.yearOfEstablishment && (
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Founded in {employer.yearOfEstablishment}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Building2 className="w-6 h-6 text-blue-500" />
                About Company
              </h2>
              {employer.description ? (
                <div 
                  className="prose prose-blue max-w-none text-gray-600 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: employer.description }}
                />
              ) : (
                <p className="text-gray-600">No description provided by the company.</p>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Briefcase className="w-6 h-6 text-blue-500" />
                  Open Positions
                </h2>
                <Badge variant="outline" className="text-gray-500 font-medium">
                  {activeJobs.length} {activeJobs.length === 1 ? 'Job' : 'Jobs'} Available
                </Badge>
              </div>

              {activeJobs.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 border border-dashed border-gray-200 text-center">
                  <p className="text-gray-500">No open positions at the moment.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {activeJobs.map((job) => (
                    <Link 
                      key={job.id} 
                      href={`/jobs/${job.id}`}
                      className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5 capitalize">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {job.jobType}
                          </span>
                          <span>•</span>
                          <span>{job.location || 'Remote'}</span>
                          <span>•</span>
                          <span>
                            {job.minSalary && job.maxSalary 
                              ? `${job.salaryCurrency} ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()}`
                              : 'Salary not disclosed'}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" className="text-blue-600 font-bold group-hover:bg-blue-50">
                        View Details
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-lg shadow-blue-200">
              <h3 className="text-xl font-bold mb-4">Want to work here?</h3>
              <p className="text-blue-100 mb-6 text-sm leading-relaxed">
                Check out the open positions and apply to join {employer.name || 'this company'}'s growing team.
              </p>
              <Button variant="secondary" className="w-full h-12 font-bold bg-white text-blue-600 hover:bg-blue-50 border-none shadow-sm" asChild>
                <Link href="#jobs">View All Jobs</Link>
              </Button>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Info</h3>
              <div className="space-y-4">
                {employer.websiteUrl && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Website</span>
                    <a href={employer.websiteUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm truncate">
                      {employer.websiteUrl.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Member Since</span>
                  <span className="text-gray-900 text-sm font-medium">
                    {format(new Date(user.createdAt), 'MMMM yyyy')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
