import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import TestList from "../../../components/admin/tests/TestList";
import CreateTestPage from "./tests/CreateTestPage";
import TestDetailPage from "./tests/TestDetailPage";
import ResultsPage from "./tests/ResultsPage";
import QuestionManagementPage from "./tests/QuestionManagementPage";
import ProctoringTestPage from "./ProctoringTestPage";
import ProfilePage from "../ProfilePage";
import TopicList from "../../../components/admin/topics/TopicList";
import CreateTopicPage from "./topics/CreateTopicPage";
import TopicDetailPage from "./topics/TopicDetailPage";

const AdminRouter: React.FC = () => {
  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="tests" element={<TestList />} />
      <Route path="tests/create" element={<CreateTestPage />} />
      <Route path="tests/:id" element={<TestDetailPage />} />
      <Route path="tests/:id/questions" element={<QuestionManagementPage />} />
      <Route path="topics" element={<TopicList />} />
      <Route path="topics/create" element={<CreateTopicPage />} />
      <Route path="topics/:id" element={<TopicDetailPage />} />
      <Route path="results" element={<ResultsPage />} />
      <Route path="proctoring-test" element={<ProctoringTestPage />} />
      <Route path="profile" element={<ProfilePage />} />
    </Routes>
  );
};

export default AdminRouter;
