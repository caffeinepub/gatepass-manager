import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { LogIn, LogOut } from "lucide-react";
import type { LogEntry } from "../backend.d";
import { useActor } from "../hooks/useActor";

function formatTs(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleString();
}

export function LogView() {
  const { actor, isFetching } = useActor();

  const { data: logs = [], isLoading } = useQuery<LogEntry[]>({
    queryKey: ["log"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLog();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <Skeleton key={n} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div
        data-ocid="log.empty_state"
        className="flex flex-col items-center justify-center py-16 text-muted-foreground"
      >
        <svg
          className="w-16 h-16 mb-4 opacity-30"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
          role="img"
        >
          <title>No logs</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="text-lg font-medium">No movement logs yet</p>
        <p className="text-sm">Exit and return events will be recorded here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead className="font-semibold">Pass ID</TableHead>
            <TableHead className="font-semibold">Student</TableHead>
            <TableHead className="font-semibold">Roll No.</TableHead>
            <TableHead className="font-semibold">Action</TableHead>
            <TableHead className="font-semibold">Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((entry, i) => (
            <TableRow
              key={`${String(entry.passId)}-${i}`}
              data-ocid={`log.item.${i + 1}`}
              className="hover:bg-muted/20"
            >
              <TableCell className="font-mono text-sm">
                #{String(entry.passId)}
              </TableCell>
              <TableCell className="font-medium">{entry.studentName}</TableCell>
              <TableCell className="font-mono text-sm">
                {entry.rollNumber}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    entry.action === "Exit"
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : "bg-teal-100 text-teal-800 border border-teal-200"
                  }`}
                >
                  {entry.action === "Exit" ? (
                    <LogOut className="h-3 w-3" />
                  ) : (
                    <LogIn className="h-3 w-3" />
                  )}
                  {entry.action}
                </span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatTs(entry.timestamp)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
