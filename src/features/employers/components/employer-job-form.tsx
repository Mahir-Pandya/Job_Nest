"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  JOB_LEVEL,
  JOB_TYPE,
  MIN_EDUCATION,
  SALARY_CURRENCY,
  SALARY_PERIOD,
  WORK_TYPE,
} from "@/config/constant";
import { cn } from "@/lib/utils";
import {
  Award,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  GraduationCap,
  Loader,
  MapPin,
  Tag,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import Tiptap from "@/components/text-editor";
import { JobFormData, jobSchema } from "../jobs/jobs.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  createJobAction,
  updateJobAction,
} from "@/features/server/jobs.actions";
import { useRouter } from "next/navigation";

interface JobPostFormProps {
  initialData?: any; // The job data fetched from DB
  isEditMode?: boolean; // Flag to tell form what to do
}

export const JobForm = ({
  initialData,
  isEditMode = false,
}: JobPostFormProps) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          // FIX 1: Handle Date Format
          expiresAt: initialData.expiresAt
            ? new Date(initialData.expiresAt).toISOString().split("T")[0] //"2026-01-20T18:15:00.000Z"
            : "",
        }
      : {
          title: "",
          description: "",

          jobType: undefined,
          workType: undefined,
          jobLevel: undefined,

          location: "",
          tags: "",

          minSalary: "",
          maxSalary: "",
          salaryCurrency: undefined,
          salaryPeriod: undefined,

          minEducation: undefined,
          experience: "",
          expiresAt: "",
        },
  });

  const router = useRouter();

  const handleFormSubmit = async (data: JobFormData) => {
    try {
      let response;
      if (isEditMode && initialData) {
        // --- UPDATE FLOW ---
        response = await updateJobAction(initialData.id, data);
      } else {
        // --- CREATE FLOW ---
        response = await createJobAction(data);
      }
      // const response = await createJobAction(data);
      if (response.status === "SUCCESS") {
        toast.success(response.message);
        router.push("/dashboard/jobs");
        // router.refresh(); // Ensure the list page shows new data
      } else toast.error(response.message);
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="title"
                type="text"
                placeholder="e.g., Senior Frontend Developer"
                className={cn("pl-10", errors.title && "border-destructive")}
                {...register("title")}
                aria-invalid={!!errors.title}
              />
            </div>
            {errors.title && (
              <p className="text-sm text-destructive">
                {errors.title.message as string}
              </p>
            )}
          </div>

          {/* Job Type, Work Type, Job Level */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="jobType">Job Type *</Label>
              <Controller
                name="jobType"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="jobType"
                        className={cn(
                          "pl-10 w-full",
                          errors.jobType && "border-destructive",
                        )}
                      >
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        {JOB_TYPE.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
              {errors.jobType && (
                <p className="text-sm text-destructive">
                  {errors.jobType.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="workType">Work Type *</Label>
              <Controller
                name="workType"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="workType"
                        className={cn(
                          "pl-10 w-full",
                          errors.workType && "border-destructive",
                        )}
                      >
                        <SelectValue placeholder="Select work type" />
                      </SelectTrigger>
                      <SelectContent>
                        {WORK_TYPE.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
              {errors.workType && (
                <p className="text-sm text-destructive">
                  {errors.workType.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobLevel">Job Level *</Label>
              <Controller
                name="jobLevel"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="jobLevel"
                        className={cn(
                          "pl-10 w-full",
                          errors.jobLevel && "border-destructive",
                        )}
                      >
                        <SelectValue placeholder="Select job level" />
                      </SelectTrigger>
                      <SelectContent>
                        {JOB_LEVEL.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
              {errors.jobLevel && (
                <p className="text-sm text-destructive">
                  {errors.jobLevel.message as string}
                </p>
              )}
            </div>
          </div>

          {/* Location and Tags */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="location"
                  type="text"
                  placeholder="e.g., New York, NY or Remote"
                  className={cn(
                    "pl-10",
                    errors.location && "border-destructive",
                  )}
                  {...register("location")}
                  aria-invalid={!!errors.location}
                />
              </div>
              {errors.location && (
                <p className="text-sm text-destructive">
                  {errors.location.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (Optional)</Label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="tags"
                  type="text"
                  placeholder="e.g., React, TypeScript, Node.js"
                  className={cn("pl-10", errors.tags && "border-destructive")}
                  {...register("tags")}
                  aria-invalid={!!errors.tags}
                />
              </div>
              {errors.tags && (
                <p className="text-sm text-destructive">
                  {errors.tags.message as string}
                </p>
              )}
            </div>
          </div>

          {/* Salary Information */}
          <div className="grid gap-6 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="minSalary">Min Salary (Optional)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="minSalary"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g., 50000"
                  className={cn(
                    "pl-10",
                    errors.minSalary && "border-destructive",
                  )}
                  {...register("minSalary")}
                  aria-invalid={!!errors.minSalary}
                />
              </div>
              {errors.minSalary && (
                <p className="text-sm text-destructive">
                  {errors.minSalary.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxSalary">Max Salary (Optional)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="maxSalary"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g., 80000"
                  className={cn(
                    "pl-10",
                    errors.maxSalary && "border-destructive",
                  )}
                  {...register("maxSalary")}
                  aria-invalid={!!errors.maxSalary}
                />
              </div>
              {errors.maxSalary && (
                <p className="text-sm text-destructive">
                  {errors.maxSalary.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="salaryCurrency">Currency</Label>
              <Controller
                name="salaryCurrency"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="salaryCurrency"
                      className={cn(
                        "w-full",
                        errors.salaryCurrency && "border-destructive",
                      )}
                    >
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {SALARY_CURRENCY.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.salaryCurrency && (
                <p className="text-sm text-destructive">
                  {errors.salaryCurrency.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="salaryPeriod">Period</Label>
              <Controller
                name="salaryPeriod"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="salaryPeriod"
                      className={cn(
                        "w-full",
                        errors.salaryPeriod && "border-destructive",
                      )}
                    >
                      <SelectValue placeholder="Period" />
                    </SelectTrigger>
                    <SelectContent>
                      {SALARY_PERIOD.map((period) => (
                        <SelectItem key={period} value={period}>
                          {period}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.salaryPeriod && (
                <p className="text-sm text-destructive">
                  {errors.salaryPeriod.message as string}
                </p>
              )}
            </div>
          </div>

          {/* Education and Experience */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="minEducation">Minimum Education (Optional)</Label>
              <Controller
                name="minEducation"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="minEducation"
                        className={cn(
                          "pl-10 w-full",
                          errors.minEducation && "border-destructive",
                        )}
                      >
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent>
                        {MIN_EDUCATION.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
              {errors.minEducation && (
                <p className="text-sm text-destructive">
                  {errors.minEducation.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expiry Date (Optional)</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="expiresAt"
                  type="date"
                  className={cn(
                    "pl-10",
                    errors.expiresAt && "border-destructive",
                  )}
                  {...register("expiresAt")}
                  aria-invalid={!!errors.expiresAt}
                />
              </div>
              {errors.expiresAt && (
                <p className="text-sm text-destructive">
                  {errors.expiresAt.message as string}
                </p>
              )}
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-2">
            <Label htmlFor="experience">
              Experience Requirements (Optional)
            </Label>
            <div className="relative">
              <Award className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="experience"
                type="text"
                placeholder="e.g., 3+ years of React development"
                className={cn(
                  "pl-10",
                  errors.experience && "border-destructive",
                )}
                {...register("experience")}
                aria-invalid={!!errors.experience}
              />
            </div>
            {errors.experience && (
              <p className="text-sm text-destructive">
                {errors.experience.message as string}
              </p>
            )}
          </div>

          <Controller
            name="description"
            control={control}
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label>Job Description *</Label>
                <Tiptap
                  content={field.value}
                  onChange={(value) => field.onChange(value)}
                  // toolbarClassName="top-16"
                />
                {fieldState.error && (
                  <p className="text-sm text-destructive">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />

          <div className="flex items-center gap-4 pt-4 flex-wrap">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto"
            >
              {isSubmitting && <Loader className="w-4 h-4 animate-spin" />}
              {isEditMode
                ? isSubmitting
                  ? "Saving..."
                  : "Update Job"
                : isSubmitting
                  ? "Saving..."
                  : "Post Job"}
            </Button>
            {!isDirty && (
              <p className="text-sm text-muted-foreground">
                No changes to save
              </p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
