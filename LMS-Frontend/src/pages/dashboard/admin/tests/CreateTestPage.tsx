import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCollegeTheme } from "../../../../hooks/useCollegeTheme";
import CreateTestForm from "../../../../components/admin/tests/CreateTestForm";

const CreateTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { applyTheme } = useCollegeTheme();

  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  const handleSuccess = () => {
    navigate("../tests", { relative: "path" });
  };

  const handleCancel = () => {
    navigate("../tests", { relative: "path" });
  };

  return (
    <div className="h-screen bg-surface overflow-hidden">
      <CreateTestForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
};

export default CreateTestPage;