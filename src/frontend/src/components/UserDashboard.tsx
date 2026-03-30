import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import type { GatePass } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { PassTable } from "./PassTable";
import { RequestPassForm } from "./RequestPassForm";

interface UserDashboardProps {
  studentName: string;
}

export function UserDashboard({ studentName }: UserDashboardProps) {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const [actionLoadingId, setActionLoadingId] = useState<bigint | null>(null);

  const { data: passes = [], isLoading } = useQuery<GatePass[]>({
    queryKey: ["myPasses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyPasses();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });

  const exitMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      setActionLoadingId(id);
      await actor.markExit(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myPasses"] });
      toast.success("Exit marked successfully");
      setActionLoadingId(null);
    },
    onError: (err) => {
      toast.error(
        `Failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
      setActionLoadingId(null);
    },
  });

  const returnMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      setActionLoadingId(id);
      await actor.markReturn(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myPasses"] });
      toast.success("Return marked successfully");
      setActionLoadingId(null);
    },
    onError: (err) => {
      toast.error(
        `Failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
      setActionLoadingId(null);
    },
  });

  return (
    <Tabs defaultValue="my-passes" data-ocid="user.tab">
      <TabsList className="bg-muted">
        <TabsTrigger value="my-passes" data-ocid="user.tab">
          My Passes
        </TabsTrigger>
        <TabsTrigger value="request" data-ocid="user.tab">
          Request Pass
        </TabsTrigger>
      </TabsList>

      <TabsContent value="my-passes" className="mt-4">
        {isLoading ? (
          <div className="space-y-2" data-ocid="passes.loading_state">
            {[1, 2, 3].map((n) => (
              <Skeleton key={n} className="h-14 w-full" />
            ))}
          </div>
        ) : (
          <PassTable
            passes={passes}
            onMarkExit={(id) => exitMutation.mutate(id)}
            onMarkReturn={(id) => returnMutation.mutate(id)}
            loadingId={actionLoadingId}
          />
        )}
      </TabsContent>

      <TabsContent value="request" className="mt-4">
        <RequestPassForm studentName={studentName} />
      </TabsContent>
    </Tabs>
  );
}
