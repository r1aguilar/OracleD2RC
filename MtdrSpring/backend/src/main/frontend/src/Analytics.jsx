import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import { ResponsiveContainer, RadialBarChart, RadialBar, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend } from "recharts";
import { Bell, UserCircle, Menu } from "lucide-react";

const AnalyticsManager = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [productivityView, setProductivityView] = useState("Equipo");
  const [selectedSprint, setSelectedSprint] = useState("Sprint1");
  const [allTasks, setAllTasks] = useState([]);
  

  const sprints = [
    { name: "Sprint1", date: "Feb 16, 2025", status: "Completed", progress: 100 },
    { name: "Sprint2", date: "Feb 23, 2025", status: "Completed", progress: 100 },
    { name: "Sprint3", date: "Mar 2, 2025", status: "Completed", progress: 100 },
    { name: "Sprint4", date: "Mar 9, 2025", status: "Completed", progress: 100 },
    { name: "Sprint21", date: "Mar 16, 2025", status: "Completed", progress: 100 },
    { name: "Sprint22", date: "Mar 30, 2025", status: "Completed", progress: 100 },
    { name: "Sprint23", date: "Apr 6, 2025", status: "Completed", progress: 100 },
    { name: "Sprint41", date: "Apr 13, 2025", status: "Completed", progress: 100 },

  ];

  const userMap = {
    1: "Daniela",
    2: "Dora",
    3: "Carlos",
    4: "Rodrigo"
  };


  

  useEffect(() => {
    const fetchTasks = async () => {
      // Extraer el número del sprint seleccionado: "Sprint1" => 1
      const sprintNumber = selectedSprint.replace("Sprint", "");
  
      try {
        const response = await fetch(`http://220.158.67.50/pruebas/TareasSprint/${sprintNumber}`);
        const data = await response.json();
  
        const formatted = data.map((task) => ({
          name: task.nombre,
          sprint: `Sprint${task.idSprint}`,
          estimatedhours: task.tiempoEstimado || 0,
          realhours: task.tiempoReal || 0,
          status:
            task.idColumna === 1 ? "Pending" :
            task.idColumna === 2 ? "Doing": "Done",
          user: userMap[task.idEncargado] || "Developer",
          storypoints: task.storyPoints || 0
        }));
  
        setAllTasks(formatted);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };
  
    fetchTasks();
  }, [selectedSprint]);
  
  

  const sprintTasks = allTasks.filter(t => t.sprint === selectedSprint);
  const filteredTasks = selectedFilter === "ALL"
  ? sprintTasks
  : sprintTasks.filter((t) =>
      selectedFilter === "Completed"
        ? t.status === "Done"
        : selectedFilter === "Pending"
        ? t.status === "Pending"
        : t.status === "Doing"
    );


  const totalStoryPoints = sprintTasks.reduce((sum, t) => sum + (t.storypoints || 0), 0);


  const kpiTeam = sprints.map((sprint) => {
    const sprintData = allTasks.filter(t => t.sprint === sprint.name);
    const hours = sprintData.reduce((sum, t) => sum + t.realhours, 0);
    const tasks = sprintData.filter(t => t.status === "Done").length;
    return {
      sprint: sprint.name,
      hours,
      tasks,
    };
  });

  const kpiPerson = [];
  allTasks.forEach(t => {
    const key = `${t.user}-${t.sprint}`;
    let entry = kpiPerson.find(e => e.name === t.user && e.sprint === t.sprint);
    if (!entry) {
      entry = { name: t.user, sprint: t.sprint, hours: 0, tasks: 0 };
      kpiPerson.push(entry);
    }
    entry.hours += t.realhours;
    if (t.status === "Done") entry.tasks += 1;
  });

  const sprintKpiTeam = kpiTeam.find(k => k.sprint === selectedSprint);
  const sprintKpiPerson = kpiPerson.filter(k => k.sprint === selectedSprint);

  const kpiPersonAggregated = sprintKpiPerson.reduce((acc, cur) => {
    const key = cur.name;
    if (!acc[key]) acc[key] = { name: cur.name, hours: 0, tasks: 0 };
    acc[key].hours += cur.hours;
    acc[key].tasks += cur.tasks;
    return acc;
  }, {});

  const kpiPersonData = Object.values(kpiPersonAggregated);

  const progress = Math.round(
    (sprintTasks.filter((task) => task.status === "Done").length / sprintTasks.length) * 100 || 0
  );

  const sprintOptions = [...new Set(allTasks.map(task => task.sprint))];

  const hoursPerDeveloper = {};
  sprintTasks.forEach(task => {
    if (!hoursPerDeveloper[task.user]) {
      hoursPerDeveloper[task.user] = { name: task.user, estimated: 0, real: 0 };
    }
    hoursPerDeveloper[task.user].estimated += task.estimatedhours;
    hoursPerDeveloper[task.user].real += task.realhours;
  });
  const hoursComparisonByDeveloper = Object.values(hoursPerDeveloper);
  
  const getSprintProgress = (sprintName) => {
    const tasksForSprint = allTasks.filter(t => t.sprint === sprintName);
    const total = tasksForSprint.length;
    const done = tasksForSprint.filter(t => t.status === "Done").length;
    return total === 0 ? 0 : Math.round((done / total) * 100);
  };
  
  const getSprintStatus = (sprintName) => {
    const tasks = allTasks.filter(t => t.sprint === sprintName);
    if (tasks.length === 0) return "Pending";
    const total = tasks.length;
    const done = tasks.filter(t => t.status === "Done").length;
  
    if (done === 0) return "Pending";
    if (done < total) return "Doing";
    return "Completed";
  };
  

  return (
    <div className="flex h-screen bg-[#1a1a1a]">
      <Sidebar isMobileOpen={isMobileOpen} closeMobile={() => setIsMobileOpen(false)} />
      <div className="flex-1 p-6 overflow-y-auto text-white">
      <header className="flex flex-wrap items-center justify-between py-4 gap-4">
                  <h1 className="text-white text-2xl font-semibold">Analytics</h1>
                  <div className="flex flex-wrap gap-3 items-center">
                  <button className="bg-[#2a2a2a] border rounded px-4 py-2 shadow">Select a Project</button>
                  <select
                    value={selectedSprint}
                    onChange={(e) => setSelectedSprint(e.target.value)}
                    className="bg-[#2a2a2a] border text-white rounded px-4 py-2 shadow"
                  >
                    {sprints.map((s, i) => (
                      <option key={i} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                    <div className="flex items-center gap-3">
                      <Bell className="text-white cursor-pointer hover:text-red-500" />
                      <UserCircle className="text-white w-8 h-8 cursor-pointer hover:text-red-500" />
                    </div>
                  </div>
        </header>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#2a2a2a] rounded p-4 text-center">
            <p className="text-sm text-gray-400">Sprints Done</p>
            <h2 className="text-2xl font-bold">
              {sprints.filter(s => s.status === "Completed").length} / {sprints.length} Sprints
            </h2>
          </div>
          <div className="bg-[#2a2a2a] rounded p-4 text-center">
            <p className="text-sm text-gray-400">Story Points</p>
            <h2 className="text-2xl font-bold">{totalStoryPoints}</h2>
          </div>
          <div className="bg-[#2a2a2a] rounded p-4 text-center">
            <p className="text-sm text-gray-400">Tasks Done</p>
            <h2 className="text-2xl font-bold">{sprintTasks.filter(t => t.status === "Done").length} / {sprintTasks.length}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-[#2a2a2a] rounded p-4">
            <h3 className="text-lg font-semibold mb-4">Sprint Summary</h3>
            <table className="w-full text-sm">
              <thead className="text-gray-400">
                <tr>
                  <th className="text-left py-1">Name</th>
                  <th className="text-left py-1">Due date</th>
                  <th className="text-left py-1">Status</th>
                  <th className="text-left py-1">Progress</th>
                </tr>
              </thead>
              <tbody>
                {sprints.map((sprint, i) => (
                  <tr key={i} className="border-t border-neutral-700">
                    <td className="py-2">{sprint.name}</td>
                    <td className="py-2">{sprint.date}</td>
                    <td className="py-2 text-sm font-semibold">
                      <span className={
                        getSprintStatus(sprint.name) === "Completed" ? "text-green-400" :
                        getSprintStatus(sprint.name) === "Doing" ? "text-yellow-400" :
                        "text-transparent"
                      }>
                        {getSprintStatus(sprint.name)}
                      </span>
                    </td>
                    <td className="py-2">
                      <div className="bg-neutral-800 w-full h-2 rounded-full">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${getSprintProgress(sprint.name)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-400 ml-1">{getSprintProgress(sprint.name)}%</span>
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-[#2a2a2a] rounded p-4">
            <h3 className="text-lg font-semibold mb-4">Sprint's Tasks</h3>
            <div className="flex gap-4 mb-4 text-sm text-gray-400">
              {['ALL', 'Completed', 'Doing', 'Pending'].map(filter => (
                <span
                  key={filter}
                  className={`cursor-pointer ${selectedFilter === filter ? 'text-white font-semibold underline' : ''}`}
                  onClick={() => setSelectedFilter(filter)}
                >
                  {filter === 'ALL' ? 'ALL ' + sprintTasks.length :
                  filter === 'Completed' ? 'Completed ' + sprintTasks.filter(t => t.status === 'Done').length :
                  filter === 'Pending' ? 'Pending ' + sprintTasks.filter(t => t.status === 'Pending').length :
                  'Doing ' + sprintTasks.filter(t => t.status === 'Doing').length}

                </span>
              ))}
            </div>

            <div className="h-72 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="text-gray-400">
                  <tr>
                    <th className="text-left py-1">Task</th>
                    <th className="text-left py-1">Estimated hours</th>
                    <th className="text-left py-1">Real hours</th>
                    <th className="text-left py-1">State</th>
                    <th className="text-left py-1">Developer</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task, i) => (
                    <tr key={i} className="border-t border-neutral-700">
                      <td className="py-2">{task.name}</td>
                      <td className="py-2">{task.estimatedhours}</td>
                      <td className="py-2">{task.realhours}</td>
                      <td className="py-2">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            task.status === "Done"
                              ? "bg-green-500 text-white"
                              : task.status === "Pending"
                              ? "bg-red-500 text-white"
                              : "bg-yellow-400 text-black"
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="py-2 text-sm text-gray-300">{task.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>


    
        <div className="bg-[#2a2a2a] rounded p-4 md:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Productivity</h3>
          <div className="text-sm text-gray-400 mb-4">
          <h2 className="text-lg font-semibold text-white mb-4 px-6 pt-4">Worked hours and Completed Tasks</h2>

            <label className="mr-2">See productivity by:</label>
            <select
              value={productivityView}
              onChange={(e) => setProductivityView(e.target.value)}
              className="bg-[#1a1a1a] text-white border border-neutral-600 rounded px-2 py-1"
            >
              <option value="Equipo">Team</option>
              <option value="Persona">Developer</option>
            </select>
          </div>

          {productivityView === "Equipo" ? (
            <>
              <table className="w-full text-sm mb-6">
                <thead className="text-gray-400">
                  <tr>
                    <th className="text-left py-1">Worked hours</th>
                    <th className="text-left py-1">Completed tasks</th>
                  </tr>
                </thead>
                <tbody>
                  {[sprintKpiTeam].map((item, i) => (
                    <tr key={i} className="border-t border-neutral-700">
                      <td className="py-2">{item.hours} hrs</td>
                      <td className="py-2">{item.tasks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="w-full flex items-center justify-center mb-4 relative">
              <ResponsiveContainer width="50%" height={200}>
                <BarChart data={[sprintKpiTeam]} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                  <XAxis dataKey="sprint" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#c54534" name="Worked hours" />
                  <Bar dataKey="tasks" fill="#a9312c" name="Completed tasks" />
                </BarChart>
              </ResponsiveContainer>
              </div>
            </>
          ) : (
            <>
              <table className="w-full text-sm mb-6">
                <thead className="text-gray-400">
                  <tr>
                    <th className="text-left py-1">Developer</th>
                    <th className="text-left py-1">Worked hours</th>
                    <th className="text-left py-1">Completed tasks</th>
                  </tr>
                </thead>
                <tbody>
                  {sprintKpiPerson.map((item, i) => (
                    <tr key={i} className="border-t border-neutral-700">
                      <td className="py-2">{item.name}</td>
                      <td className="py-2">{item.hours} hrs</td>
                      <td className="py-2">{item.tasks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="w-full flex items-center justify-center mb-4 relative">
              <ResponsiveContainer width="70%" height={200}>
                <BarChart data={kpiPersonData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                  <XAxis dataKey="name" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#c54534" name="Worked hours" />
                  <Bar dataKey="tasks" fill="#a9312c" name="Completed tasks" />
                </BarChart>
              </ResponsiveContainer>
              </div>
            </>
          )}
            <h2 className="text-lg font-semibold mb-4 px-6 pt-4">Estimated vs Real Hours</h2>
            <div className="w-fill flex items-center justify-center mb-8">
              <ResponsiveContainer width="70%" height={300}>
                <BarChart data={hoursComparisonByDeveloper} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="name" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="estimated" fill="#c54534" name="Estimated Hours" />
                  <Bar dataKey="real" fill="#a9312c" name="Real Hours" />
                </BarChart>
              </ResponsiveContainer>
            </div>


        </div>
      </div>
    </div>
    </div>
  );
};

export default AnalyticsManager;
