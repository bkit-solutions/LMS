import React from "react";
import { useNavigate } from "react-router-dom";
import CreateTestForm from "../../../../components/admin/tests/CreateTestForm";

const CreateTestPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/dashboard/tests");
  };

  const handleCancel = () => {
    navigate("/dashboard/tests");
  };

  return (
    <div className="min-h-screen bg-surface p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <CreateTestForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  );
};

export default CreateTestPage;