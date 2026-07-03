import { Outlet } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";

export default function App() {
  return (
    <div className="flex min-h-screen bg-bg text-ink font-sans">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="p-8 flex-1 w-full max-w-[1280px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
