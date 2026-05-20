import { getCurrentUser } from "@/features/auth/server/auth.queries";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Download, FileText, UserCircle, Briefcase, MessageSquare } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getEmployerApplications,
  getSavedCandidateIds,
} from "@/features/server/employers.queries";
import { StatusSelect } from "@/features/employers/components/StatusSelect";
import { SaveCandidateButton } from "@/features/employers/components/save-candidate-button";

type EmployerApplication = Awaited<
  ReturnType<typeof getEmployerApplications>
>[number];


export default async function EmployerApplicationsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "employer") return redirect("/login");

  const applications = await getEmployerApplications(user.id);
  const savedCandidateIds = await getSavedCandidateIds(user.id);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Received Applications
        </h2>
        <p className="text-gray-500 mt-1">
          Review and manage candidates who applied to your job postings.
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="inline-flex items-center justify-center p-4 bg-gray-100 rounded-full mb-4">
            <Briefcase className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            No applications yet
          </h3>
          <p className="text-gray-500 mt-1">
            When candidates apply to your jobs, they will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80">
                <TableHead>Candidate</TableHead>
                <TableHead>Applied Role</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Save</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app: EmployerApplication) => {
                const { application, job, user, resume } = app;

                return (
                  <TableRow
                    key={application.id}
                    className="hover:bg-gray-50/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 relative rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border">
                          {user.avatarUrl ? (
                            <Image
                              src={user.avatarUrl}
                              alt={user.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <UserCircle className="h-full w-full text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 leading-none mb-1">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{job.title}</p>
                        <Badge
                          variant="secondary"
                          className="mt-1 font-normal text-xs"
                        >
                          {job.jobType}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {formatDistanceToNow(new Date(application.appliedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </TableCell>

                    <TableCell>
                      <StatusSelect
                        applicationId={application.id}
                        currentStatus={application.status}
                      />
                    </TableCell>

                    {/* Save Candidate Button */}
                    <TableCell className="text-center">
                      <SaveCandidateButton
                        applicantId={application.applicantId}
                        initialIsSaved={savedCandidateIds.has(
                          application.applicantId
                        )}
                      />
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {application.coverLetter && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                              >
                                <FileText className="w-4 h-4" />
                                <span className="hidden sm:inline">
                                  Cover Letter
                                </span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>
                                  Cover Letter: {user.name}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap leading-relaxed border">
                                {application.coverLetter}
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        {resume?.fileUrl ? (
                          <Button
                            size="sm"
                            asChild
                            className="gap-2 bg-blue-600 hover:bg-blue-700"
                          >
                            <a
                              href={resume.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Download className="w-4 h-4" />
                              <span className="hidden sm:inline">Resume</span>
                            </a>
                          </Button>
                        ) : (
                          <Button size="sm" disabled variant="secondary">
                            No Resume
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          <Link href={`/messages/${user.id}`}>
                            <MessageSquare className="w-4 h-4" />
                            <span className="hidden sm:inline">Message</span>
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
