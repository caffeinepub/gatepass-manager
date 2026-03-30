import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  LogOut,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { GatePass, Stats } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { LogView } from "./LogView";
import { PassTable } from "./PassTable";

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  loading,
}: {
  title: string;
  value: bigint | undefined;
  icon: React.ElementType;
  color: string;
  loading: boolean;
}) {
  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p className="text-3xl font-bold">
            {value !== undefined ? String(value) : "0"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminDashboard() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectPassId, setRejectPassId] = useState<bigint | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<bigint | null>(null);
  const [detailPass, setDetailPass] = useState<GatePass | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: async () => {
      if (!actor)
        return {
          total: 0n,
          pending: 0n,
          approved: 0n,
          rejected: 0n,
          exited: 0n,
          returned: 0n,
        } as Stats;
      return actor.getStats();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });

  const { data: passes = [], isLoading: passesLoading } = useQuery<GatePass[]>({
    queryKey: ["allPasses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPasses();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });

  const approveMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      setActionLoadingId(id);
      await actor.approvePass(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPasses"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Pass approved successfully");
      setActionLoadingId(null);
    },
    onError: (err) => {
      toast.error(
        `Approval failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
      setActionLoadingId(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: bigint; reason: string }) => {
      if (!actor) throw new Error("Not connected");
      setActionLoadingId(id);
      await actor.rejectPass(id, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPasses"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Pass rejected");
      setRejectDialogOpen(false);
      setRejectReason("");
      setActionLoadingId(null);
    },
    onError: (err) => {
      toast.error(
        `Rejection failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
      setActionLoadingId(null);
    },
  });

  const handleRejectOpen = (id: bigint) => {
    setRejectPassId(id);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (!rejectPassId) return;
    rejectMutation.mutate({
      id: rejectPassId,
      reason: rejectReason || "No reason provided",
    });
  };

  const statCards = [
    {
      title: "Total Passes",
      value: stats?.total,
      icon: FileText,
      color: "bg-primary",
    },
    {
      title: "Pending",
      value: stats?.pending,
      icon: Clock,
      color: "bg-amber-500",
    },
    {
      title: "Approved",
      value: stats?.approved,
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      title: "Exited",
      value: stats?.exited,
      icon: LogOut,
      color: "bg-blue-500",
    },
    {
      title: "Returned",
      value: stats?.returned,
      icon: RefreshCw,
      color: "bg-teal-500",
    },
    {
      title: "Rejected",
      value: stats?.rejected,
      icon: XCircle,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} loading={statsLoading} />
        ))}
      </div>

      {/* Passes & Logs Tabs */}
      <Tabs defaultValue="passes" data-ocid="admin.tab">
        <TabsList className="bg-muted">
          <TabsTrigger value="passes" data-ocid="admin.tab">
            All Gate Passes
          </TabsTrigger>
          <TabsTrigger value="log" data-ocid="admin.tab">
            Entry/Exit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="passes" className="mt-4">
          {passesLoading ? (
            <div className="space-y-2" data-ocid="passes.loading_state">
              {[1, 2, 3].map((n) => (
                <Skeleton key={n} className="h-14 w-full" />
              ))}
            </div>
          ) : (
            <PassTable
              passes={passes}
              isAdmin
              onApprove={(id) => approveMutation.mutate(id)}
              onReject={handleRejectOpen}
              onViewDetails={setDetailPass}
              loadingId={actionLoadingId}
            />
          )}
        </TabsContent>

        <TabsContent value="log" className="mt-4">
          <LogView />
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent data-ocid="reject.dialog">
          <DialogHeader>
            <DialogTitle>Reject Gate Pass</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this gate pass request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="rejectReason">Rejection Reason</Label>
            <Textarea
              id="rejectReason"
              data-ocid="reject.textarea"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              data-ocid="reject.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={rejectMutation.isPending}
              data-ocid="reject.confirm_button"
            >
              {rejectMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Reject Pass
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog
        open={!!detailPass}
        onOpenChange={(o) => !o && setDetailPass(null)}
      >
        <DialogContent className="max-w-lg" data-ocid="detail.dialog">
          <DialogHeader>
            <DialogTitle>Gate Pass Details</DialogTitle>
          </DialogHeader>
          {detailPass && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-medium text-muted-foreground">
                    Student:
                  </span>
                  <p>{detailPass.studentName}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">ID:</span>
                  <p>{detailPass.studentId}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Roll No:
                  </span>
                  <p>{detailPass.rollNumber}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Department:
                  </span>
                  <p>{detailPass.department}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Destination:
                  </span>
                  <p>{detailPass.destination}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Return By:
                  </span>
                  <p>{detailPass.expectedReturnTime}</p>
                </div>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Purpose:
                </span>
                <p className="mt-1">{detailPass.purpose}</p>
              </div>
              {detailPass.note && (
                <div>
                  <span className="font-medium text-muted-foreground">
                    Note:
                  </span>
                  <p className="mt-1">{detailPass.note}</p>
                </div>
              )}
              {detailPass.rejectionReason.__kind__ === "Some" && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <span className="font-medium text-red-700">
                    Rejection Reason:
                  </span>
                  <p className="mt-1 text-red-700">
                    {detailPass.rejectionReason.value}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailPass(null)}
              data-ocid="detail.close_button"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
