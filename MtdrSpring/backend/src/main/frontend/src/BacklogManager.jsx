import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import { Plus } from "lucide-react";
import { Bell, UserCircle, Menu } from "lucide-react";


const BacklogManager = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [sprints, setSprints] = useState([]);
  const [backlog, setBacklog] = useState([]);

  useEffect(() => {
    // Simulación de datos estáticos
    setSprints([
      {
        id: 1,
        name: "Sprint 1",
        startDate: "2023-05-25",
        endDate: "2023-06-25",
        status: "Completed",
        developers: 3,
        tasks: ["TAREA 1", "TAREA 2", "TAREA 3", "TAREA 4", "TAREA 5"],
      },
      {
        id: 2,
        name: "Sprint 2",
        startDate: "2023-06-25",
        endDate: "-",
        status: "In progress",
        developers: 3,
        tasks: ["TAREA 6", "TAREA 7", "TAREA 8", "TAREA 9", "TAREA 10"],
      },
    ]);

    setBacklog(["TAREA 11", "TAREA 12", "TAREA 13", "TAREA 14", "TAREA 15"]);
  }, []);

  const handleAddSprint = () => {
    const newId = sprints.length + 1;
    const newSprint = {
      id: newId,
      name: `Sprint ${newId}`,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "-",
      status: "In progress",
      developers: 2,
      tasks: [],
    };
    setSprints([...sprints, newSprint]);
  };

  return (
    <div className="flex h-screen bg-[#1a1a1a]">
      <Sidebar isMobileOpen={isMobileOpen} closeMobile={() => setIsMobileOpen(false)} />

      <div className="flex-1 px-4 md:px-6 lg:px-8 overflow-y-auto">
        <header className="flex flex-wrap items-center justify-between py-4 gap-4">
                  <h1 className="text-white text-2xl font-semibold">Backlog</h1>
                  <div className="flex flex-wrap gap-3 items-center">
                    
                    <div className="flex items-center gap-3">
                      <Bell className="text-white cursor-pointer hover:text-red-500" />
                      <UserCircle className="text-white w-8 h-8 cursor-pointer hover:text-red-500" />
                    </div>
                  </div>
                </header>

        <div className="space-y-6">
          {sprints.map((sprint) => (
            <div key={sprint.id} className="bg-[#2a2a2a] rounded p-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-bold text-lg text-white">{sprint.name}</h2>
                <div className="flex gap-6 text-sm text-white">
                  <span>Start date: {sprint.startDate}</span>
                  <span>Completion date: {sprint.endDate}</span>
                  <span>Status: <select defaultValue={sprint.status} className="bg-transparent border-b border-gray-500">
                    <option>Completed</option>
                    <option>In progress</option>
                  </select></span>
                  <span className="flex items-center gap-1">Developers:
                    {[...Array(sprint.developers)].map((_, i) => (
                      <span key={i} className="inline-block w-6 h-6 bg-gray-400 rounded-full ml-1"></span>
                    ))}
                  </span>
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                {sprint.tasks.map((task, i) => (
                  <div key={i} className="bg-[#1a1a1a] text-white rounded-full px-4 py-1 text-sm shadow border border-neutral-700">{task}</div>
                ))}
              </div>
            </div>
          ))}

          <button onClick={handleAddSprint} className="flex items-center gap-2 bg-[#2a2a2a] text-white px-4 py-2 rounded-full border border-neutral-600">
            <Plus size={18} /> Create new sprint
          </button>

          <div className="bg-[#2a2a2a] rounded p-4">
            <div className="mb-2 flex justify-between items-center">
              <h2 className="font-bold text-lg text-white">Backlog</h2>
              <button className="flex items-center gap-2 bg-[#1a1a1a] text-white text-sm px-4 py-1 rounded-full shadow border border-neutral-700">
                <Plus size={16} /> Create new task
              </button>
            </div>
            <div className="flex gap-3 flex-wrap">
              {backlog.map((task, i) => (
                <div key={i} className="bg-[#1a1a1a] text-white rounded-full px-4 py-1 text-sm shadow border border-neutral-700">{task}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BacklogManager;
