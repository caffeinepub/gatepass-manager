import type { PassStatus } from "../backend.d";

interface StatusBadgeProps {
  status: PassStatus;
}

const statusConfig: Record<PassStatus, { label: string; className: string }> = {
  Pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-800 border border-amber-200",
  },
  Approved: {
    label: "Approved",
    className: "bg-green-100 text-green-800 border border-green-200",
  },
  Rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 border border-red-200",
  },
  Exited: {
    label: "Exited",
    className: "bg-blue-100 text-blue-800 border border-blue-200",
  },
  Returned: {
    label: "Returned",
    className: "bg-teal-100 text-teal-800 border border-teal-200",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
