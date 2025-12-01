"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, FileText, CheckCircle, XCircle, Clock } from "lucide-react";

type Statistics = {
  totalSubmissions: number;
  byStatus: {
    published: number;
    declined: number;
    accepted: number;
    inReview: number;
  };
  byStage: {
    submission: number;
    review: number;
    copyediting: number;
    production: number;
  };
  averageReviewTime: number;
  averagePublicationTime: number;
  totalUsers: number;
  roleDistribution: Record<string, number>;
};

type Props = {
  statistics: Statistics;
};

export function StatisticsClient({ statistics }: Props) {
  const formatDays = (days: number) => {
    if (days === 0) return "N/A";
    return `${Math.round(days)} days`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistics & Reports</h1>
          <p className="text-sm text-gray-600 mt-1">View detailed statistics about your journal</p>
        </div>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            color: "#006798",
            backgroundColor: "transparent",
            border: "none",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
            padding: "0.25rem 0.5rem",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              backgroundColor: "#006798",
              color: "#ffffff",
              fontSize: "10px",
              fontWeight: "bold",
            }}
          >
            i
          </span>
          Help
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              Total Submissions
              <FileText className="h-4 w-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{statistics.totalSubmissions}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              Published
              <CheckCircle className="h-4 w-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.byStatus.published}</div>
            <p className="text-xs text-gray-500 mt-1">
              {statistics.totalSubmissions > 0
                ? Math.round((statistics.byStatus.published / statistics.totalSubmissions) * 100)
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              Declined
              <XCircle className="h-4 w-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statistics.byStatus.declined}</div>
            <p className="text-xs text-gray-500 mt-1">
              {statistics.totalSubmissions > 0
                ? Math.round((statistics.byStatus.declined / statistics.totalSubmissions) * 100)
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              Total Users
              <Users className="h-4 w-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statistics.totalUsers}</div>
            <p className="text-xs text-gray-500 mt-1">Registered users</p>
          </CardContent>
        </Card>
      </div>

      {/* Submissions by Stage */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Submissions by Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Submission</div>
              <div className="text-2xl font-bold text-gray-900">{statistics.byStage.submission}</div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Review</div>
              <div className="text-2xl font-bold text-orange-600">{statistics.byStage.review}</div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Copyediting</div>
              <div className="text-2xl font-bold text-purple-600">{statistics.byStage.copyediting}</div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Production</div>
              <div className="text-2xl font-bold text-indigo-600">{statistics.byStage.production}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <div className="text-sm font-medium text-gray-700">Average Review Time</div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatDays(statistics.averageReviewTime)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Time from assignment to completion</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-5 w-5 text-gray-400" />
                <div className="text-sm font-medium text-gray-700">Average Publication Time</div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatDays(statistics.averagePublicationTime)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Time from submission to publication</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Distribution */}
      {Object.keys(statistics.roleDistribution).length > 0 && (
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">User Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(statistics.roleDistribution).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-medium text-gray-700">
                      {role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#006798] h-2 rounded-full"
                        style={{
                          width: `${statistics.totalUsers > 0
                              ? Math.round((count / statistics.totalUsers) * 100)
                              : 0
                            }%`,
                        }}
                      />
                    </div>
                    <div className="text-sm font-medium text-gray-900 w-12 text-right">{count}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}



