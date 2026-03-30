import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

interface FormData {
  studentName: string;
  studentId: string;
  rollNumber: string;
  department: string;
  purpose: string;
  destination: string;
  expectedReturnTime: string;
  note: string;
}

const initialForm: FormData = {
  studentName: "",
  studentId: "",
  rollNumber: "",
  department: "",
  purpose: "",
  destination: "",
  expectedReturnTime: "",
  note: "",
};

export function RequestPassForm() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!actor) throw new Error("Not connected");
      return actor.requestPass(
        data.studentName,
        data.studentId,
        data.rollNumber,
        data.department,
        data.purpose,
        data.destination,
        data.expectedReturnTime,
        data.note,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myPasses"] });
      toast.success("Gate pass requested successfully!");
      setForm(initialForm);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    },
    onError: (err) => {
      toast.error(
        `Failed to submit: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.studentName ||
      !form.rollNumber ||
      !form.department ||
      !form.purpose ||
      !form.destination
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    mutation.mutate(form);
  };

  const handleChange =
    (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Request Gate Pass</CardTitle>
        <CardDescription>
          Fill in the details below to request a gate pass for leaving campus.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="studentName">Student Name *</Label>
              <Input
                id="studentName"
                data-ocid="request.input"
                value={form.studentName}
                onChange={handleChange("studentName")}
                placeholder="Full name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="studentId">Student ID *</Label>
              <Input
                id="studentId"
                data-ocid="request.search_input"
                value={form.studentId}
                onChange={handleChange("studentId")}
                placeholder="e.g. CS2021001"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rollNumber">Roll Number *</Label>
              <Input
                id="rollNumber"
                value={form.rollNumber}
                onChange={handleChange("rollNumber")}
                placeholder="e.g. 21CS001"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                value={form.department}
                onChange={handleChange("department")}
                placeholder="e.g. Computer Science"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="destination">Destination *</Label>
              <Input
                id="destination"
                value={form.destination}
                onChange={handleChange("destination")}
                placeholder="Where are you going?"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expectedReturnTime">Expected Return Time *</Label>
              <Input
                id="expectedReturnTime"
                value={form.expectedReturnTime}
                onChange={handleChange("expectedReturnTime")}
                placeholder="e.g. 5:00 PM Today"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="purpose">Purpose *</Label>
            <Textarea
              id="purpose"
              data-ocid="request.textarea"
              value={form.purpose}
              onChange={handleChange("purpose")}
              placeholder="Reason for leaving campus..."
              rows={3}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="note">Additional Note (Optional)</Label>
            <Textarea
              id="note"
              value={form.note}
              onChange={handleChange("note")}
              placeholder="Any additional information..."
              rows={2}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
            data-ocid="request.submit_button"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : submitted ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Submitted!
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
