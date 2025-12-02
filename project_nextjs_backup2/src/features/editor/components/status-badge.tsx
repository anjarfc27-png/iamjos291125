export function StatusBadge({ status }: { status: string }) {
  const statusColors = {
    submitted: "bg-blue-100 text-blue-800",
    "in-review": "bg-yellow-100 text-yellow-800", 
    "review-completed": "bg-green-100 text-green-800",
    accepted: "bg-green-100 text-green-800",
    declined: "bg-red-100 text-red-800",
    unassigned: "bg-gray-100 text-gray-800",
    overdue: "bg-red-100 text-red-800",
    "response-due": "bg-orange-100 text-orange-800",
  };

  const statusLabels = {
    submitted: "Submitted",
    "in-review": "In Review",
    "review-completed": "Review Completed", 
    accepted: "Accepted",
    declined: "Declined",
    unassigned: "Unassigned",
    overdue: "Overdue",
    "response-due": "Response Due",
  };

  const colorClass = statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
  const label = statusLabels[status as keyof typeof statusLabels] || status;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {label}
    </span>
  );
}