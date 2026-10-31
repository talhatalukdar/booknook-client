"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { Avatar } from "@/components/shared/avatar";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/input";
import { bookFormSchema, type BookFormValues } from "@/lib/validations";
import { CATEGORIES } from "@/types";
import { ImageUploader } from "./image-uploader";

interface Props {
  initial?: BookFormValues;
  submitLabel: string;
  onSubmit: (values: BookFormValues) => Promise<void>;
  onCancel?: () => void;
  /** Add Book only: shows the verified account (read-only). It is never part of the payload. */
  account?: { name: string; email: string; image: string | null };
  /** Edit only: copies currently borrowed. totalCopies cannot go below this. */
  onLoan?: number;
}

export function BookForm({ initial, submitLabel, onSubmit, onCancel, account, onLoan = 0 }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    mode: "onTouched",
    defaultValues: initial ?? { title: "", author: "", description: "", image: "", totalCopies: 1, category: "" as never },
  });
  const image = useWatch({ control, name: "image" });

  async function submit(v: BookFormValues) {
    if (v.totalCopies < onLoan) {
      setError("totalCopies", { message: `${onLoan} ${onLoan === 1 ? "copy is" : "copies are"} on loan, so the total cannot be lower` });
      return;
    }
    await onSubmit(v);
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-6">
      {account && (
        <fieldset className="rounded-[4px] border border-line bg-paper p-5">
          <legend className="px-2 text-sm font-semibold text-deep">Your account information</legend>
          <div className="flex items-center gap-4">
            <Avatar name={account.name} src={account.image} className="size-12" />
            <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="acc-name">Added by</Label>
                <Input id="acc-name" value={account.name} readOnly tabIndex={-1} className="bg-line/50" />
              </div>
              <div>
                <Label htmlFor="acc-email">Email</Label>
                <Input id="acc-email" value={account.email} readOnly tabIndex={-1} className="bg-line/50" />
              </div>
            </div>
          </div>
          <p className="mt-3 flex items-center gap-2 text-sm text-muted">
            <Lock className="size-3.5" /> Taken from your login. The server confirms your identity again when you save.
          </p>
        </fieldset>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="title">Book title</Label>
          <Input id="title" aria-invalid={!!errors.title} {...register("title")} />
          <FieldError message={errors.title?.message} />
        </div>
        <div>
          <Label htmlFor="author">Author name</Label>
          <Input id="author" aria-invalid={!!errors.author} {...register("author")} />
          <FieldError message={errors.author?.message} />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select id="category" aria-invalid={!!errors.category} {...register("category")}>
            <option value="" disabled>
              Select a category
            </option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <FieldError message={errors.category?.message} />
        </div>
        <div>
          <Label htmlFor="totalCopies">Total copies</Label>
          <Input id="totalCopies" type="number" min={1} step={1} inputMode="numeric" aria-invalid={!!errors.totalCopies} {...register("totalCopies", { valueAsNumber: true })} />
          {onLoan > 0 && <p className="mt-1.5 text-sm text-muted">{onLoan} on loan right now, so the total cannot go below {onLoan}.</p>}
          <FieldError message={errors.totalCopies?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor="cover">Book cover</Label>
        <input type="hidden" {...register("image")} />
        <ImageUploader value={image} onChange={(url) => setValue("image", url, { shouldValidate: true, shouldDirty: true })} error={errors.image?.message} />
      </div>

      <div>
        <Label htmlFor="description">Short description</Label>
        <Textarea id="description" aria-invalid={!!errors.description} {...register("description")} />
        <FieldError message={errors.description?.message} />
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button type="button" variant="outline" size="lg" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {isSubmitting ? "Saving" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
