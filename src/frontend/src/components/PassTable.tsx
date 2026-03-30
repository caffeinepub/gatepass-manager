import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, Eye, LogIn, LogOut, XCircle } from "lucide-react";
import type { GatePass } from "../backend.d";
import { StatusBadge } from "./StatusBadge";

function formatTs(ts: bigint | null | undefined) {
  if (!ts) return "-";
  return new Date(Number(ts) / 1_000_000).toLocaleString();
}

interface PassTableProps {
  passes: GatePass[];
  isAdmin?: boolean;
  onApprove?: (id: bigint) => void;
  onReject?: (id: bigint) => void;
  onMarkExit?: (id: bigint) => void;
  onMarkReturn?: (id: bigint) => void;
  onViewDetails?: (pass: GatePass) => void;
  loadingId?: bigint | null;
}

export function PassTable({
  passes,
  isAdmin,
  onApprove,
  onReject,
  onMarkExit,
  onMarkReturn,
  onViewDetails,
  loadingId,
}: PassTableProps) {
  if (passes.length === 0) {
    return (
      <div
        data-ocid="passes.empty_state"
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
          <title>No passes</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-lg font-medium">No gate passes found</p>
        <p className="text-sm">Gate passes will appear here once created.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead className="font-semibold">Student</TableHead>
            <TableHead className="font-semibold">Roll No.</TableHead>
            <TableHead className="font-semibold">Department</TableHead>
            <TableHead className="font-semibold">Purpose</TableHead>
            <TableHead className="font-semibold">Destination</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Requested</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {passes.map((pass, i) => (
            <TableRow
              key={String(pass.id)}
              data-ocid={`passes.item.${i + 1}`}
              className="hover:bg-muted/20 transition-colors"
            >
              <TableCell>
                <div>
                  <p className="font-medium">{pass.studentName}</p>
                  <p className="text-xs text-muted-foreground">
                    {pass.studentId}
                  </p>
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm">
                {pass.rollNumber}
              </TableCell>
              <TableCell>{pass.department}</TableCell>
              <TableCell
                className="max-w-[150px] truncate"
                title={pass.purpose}
              >
                {pass.purpose}
              </TableCell>
              <TableCell>{pass.destination}</TableCell>
              <TableCell>
                <StatusBadge status={pass.status} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatTs(pass.requestedAt)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 justify-end">
                  {onViewDetails && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(pass)}
                      data-ocid={`passes.edit_button.${i + 1}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {isAdmin && pass.status === "Pending" && onApprove && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => onApprove(pass.id)}
                      disabled={loadingId === pass.id}
                      data-ocid={`passes.primary_button.${i + 1}`}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  {isAdmin && pass.status === "Pending" && onReject && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onReject(pass.id)}
                      disabled={loadingId === pass.id}
                      data-ocid={`passes.delete_button.${i + 1}`}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                  {pass.status === "Approved" && onMarkExit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => onMarkExit(pass.id)}
                      disabled={loadingId === pass.id}
                      data-ocid={`passes.secondary_button.${i + 1}`}
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="ml-1 text-xs">Exit</span>
                    </Button>
                  )}
                  {pass.status === "Exited" && onMarkReturn && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                      onClick={() => onMarkReturn(pass.id)}
                      disabled={loadingId === pass.id}
                      data-ocid={`passes.toggle.${i + 1}`}
                    >
                      <LogIn className="h-4 w-4" />
                      <span className="ml-1 text-xs">Return</span>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
