import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "../../components/templates";
import { Card, Button } from "../../components/atoms";

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Student Dashboard
            </h2>
            <p className="text-gray-600 mt-1">Track your learning progress</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate("/courses")}>
              Browse Courses
            </Button>
            <Button variant="primary" onClick={() => navigate("/my-courses")}>
              My Courses
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
