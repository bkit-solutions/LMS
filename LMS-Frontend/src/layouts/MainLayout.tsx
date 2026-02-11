import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import { useAppSelector } from "../app/hooks";

const Layout: React.FC = () => {
  const location = useLocation();
  const isTestPage = location.pathname.includes("/test/take/");
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (isTestPage) {
    return (
      <div className="min-h-screen bg-white">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Navbar />}
      <main className="w-full">
        <div className={isAuthenticated ? "pt-0" : ""}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
