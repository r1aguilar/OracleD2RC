import React, { useState, useEffect } from "react";
import Sidebar from "./components/SidebarManager";
import { ResponsiveContainer, RadialBarChart, RadialBar, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { Bell, UserCircle, Menu, CircleCheckBig, CalendarClock, ListChecks } from "lucide-react";
import NotificationPanel from "./components/NotificationPanel";

const AnalyticsManager = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [productivityView, setProductivityView] = useState("Equipo");
  const [selectedSprint, setSelectedSprint] = useState("Sprint1");
  const [allTasks, setAllTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [userTasks, setUserTasks] = useState([]);
  const [totalHoursBySprint, setTotalHoursBySprint] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);


  const userMap = {
    1: "Daniela",
    2: "Dora",
    3: "Carlos",
    4: "Rodrigo"
  };

  const sprintNameMap = sprints.reduce((acc, s) => {
    acc[`Sprint${s.id}`] = s.name;
    return acc;
  }, {});

  var fontSize = 16;

  useEffect(() => {
    const fetchTasks = async () => {
      // Extraer el número del sprint seleccionado: "Sprint1" => 1
      const sprintNumber = selectedSprint.replace("Sprint", "");
  
      try {
        const response = await fetch(`/pruebas/TareasSprint/${sprintNumber}`);
        const data = await response.json();
  
        const formatted = data
          .filter(t => t.idSprint !== null)
          .map(t => ({
            user: userMap[t.idEncargado] || "Developer",
            sprint: `Sprint${t.idSprint}`,
            realhours: t.tiempoReal || 0,
            status:
              t.idColumna === 1 ? "Pending" :
              t.idColumna === 2 ? "Doing" : "Done"
          }));
  
        setAllTasks(formatted);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };
  
    fetchTasks();
  }, [selectedSprint]);

  useEffect(() => {
    const fetchSprints = async () => {
      try {
        const response = await fetch("/pruebasSprint/SprintsForKPIs/1");
        const data = await response.json();

        const formattedSprints = data.map(sprint => ({
          id: sprint.id,
          name: `${sprint.nombre}`,
          label: sprint.nombre,
          date: new Date(sprint.fechaFin).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric"
          }),
          tareasTotales: sprint.tareasTotales,
          tareasCompletadas: sprint.tareasCompletadas,
          status: sprint.tareasCompletadas === 0
            ? "Pending"
            : sprint.tareasTotales === sprint.tareasCompletadas
            ? "Completed"
            : "Doing",
          progress: sprint.tareasCompletadas === 0
            ? 0
            : Math.round((sprint.tareasTotales / sprint.tareasCompletadas) * 100)
        }));

        setSprints(formattedSprints);
      } catch (error) {
        console.error("Error fetching sprint KPIs:", error);
      }
    };

    fetchSprints();
  }, []);

useEffect(() => {
  if (sprints.length === 0) return;
  const fetchAllUserTasks = async () => {
    try {
      const userIds = [1, 2, 3, 4];
      const allTasks = [];
      const hoursPerSprintMap = {};
      for (const id of userIds) {
        const res = await fetch(`/pruebas/TareasUsuario/${id}`);
        const data = await res.json();
        const formatted = data.map(t => ({
          user: userMap[t.idEncargado] || "Developer",
          sprint: `Sprint${t.idSprint}`,
          realhours: t.tiempoReal || 0,
          status:
            t.idColumna === 1 ? "Pending" :
            t.idColumna === 2 ? "Doing" : "Done"
        }));
        allTasks.push(...formatted);
        data.forEach((t) => {
          const sprintName = `Sprint${t.idSprint}`;
          hoursPerSprintMap[sprintName] = (hoursPerSprintMap[sprintName] || 0) + (t.tiempoReal || 0);
        });
        var chartData = Object.entries(hoursPerSprintMap)
          .map(([sprint, hours]) => ({ sprint, hours }))
          .sort((a, b) => {
            const numA = parseInt(a.sprint.replace("Sprint", ""));
            const numB = parseInt(b.sprint.replace("Sprint", ""));
            return numA - numB;
          });
        
        chartData = chartData
        .filter(({ sprint }) => sprint !== "Sprintnull") // 🚫 Filter out Sprintnull
        .map(({ sprint, hours }) => {
          const sprintId = parseInt(sprint.replace("Sprint", ""));
          const sprintObj = sprints.find(s => s.id === sprintId);
          return {
            sprint: sprintObj ? sprintObj.name : sprint, // ✅ Replace with name if found
            hours
          };
        });

        setTotalHoursBySprint(chartData);

        fontSize = totalHoursBySprint.length > 10
        ? Math.max(8, 20 - totalHoursBySprint.length)
        : 14;
      }
      setUserTasks(allTasks);
    } catch (err) {
      console.error("Error fetching user tasks:", err);
    }
  };
  fetchAllUserTasks();
}, [sprints]);



const sprintTasks = allTasks.filter(t => t.sprint === selectedSprint);


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

// Agrupar horas reales por sprint y usuario
const hoursPerSprint = {};

userTasks.forEach(t => {
  const key = `${t.user}-${t.sprint}`;
  if (!hoursPerSprint[key]) {
    hoursPerSprint[key] = { sprint: t.sprint, user: t.user, hours: 0 };
  }
  hoursPerSprint[key].hours += t.realhours;
});

const grouped = Object.values(hoursPerSprint);

// Ordenar sprints correctamente
const uniqueSprints = [...new Set(userTasks.map(row => row.sprint))].sort((a, b) => {
  const numA = parseInt(a.replace("Sprint", ""));
  const numB = parseInt(b.replace("Sprint", ""));
  return numA - numB;
});

const uniqueUsers = [...new Set(userTasks.map(row => row.user))];

// Crear tabla de horas trabajadas
const sprintTable = uniqueSprints
  .filter(sprintKey => sprintNameMap[sprintKey]) // ignore null or unmatched
  .map(sprintKey => {
    const row = { sprint: sprintNameMap[sprintKey] };
    uniqueUsers.forEach(user => {
      const match = grouped.find(r => r.sprint === sprintKey && r.user === user);
      row[user] = match ? match.hours : 0;
    });
    return row;
  });

// Agrupar tareas completadas por sprint y usuario
const completedTasksPerSprint = {};

userTasks.forEach(t => {
  if (t.status === "Done") {
    const key = `${t.user}-${t.sprint}`;
    if (!completedTasksPerSprint[key]) {
      completedTasksPerSprint[key] = { sprint: t.sprint, user: t.user, tasks: 0 };
    }
    completedTasksPerSprint[key].tasks += 1;
  }
});

const groupedCompleted = Object.values(completedTasksPerSprint);

// Crear tabla de tareas completadas
const completedSprintTable = uniqueSprints
  .filter(sprintKey => sprintNameMap[sprintKey])
  .map(sprintKey => {
    const row = { sprint: sprintNameMap[sprintKey] };
    uniqueUsers.forEach(user => {
      const match = groupedCompleted.find(r => r.sprint === sprintKey && r.user === user);
      row[user] = match ? match.tasks : 0;
    });
    return row;
  });

const getProgressColor = (progress) => {
  if (progress >= 80) return "#00C49F";   // Verde (bueno)
  if (progress >= 50) return "#FFBB28";   // Amarillo (regular)
  return "#FF4D4F";                       // Rojo (bajo)
};


const lastSprint = sprints[sprints.length - 1];
const lastSprintProgress = lastSprint ? lastSprint.progress : 0;

const progressData = [
  { name: "Completed", value: lastSprintProgress },
  { name: "Remaining", value: 100 - lastSprintProgress },
];

const totalTareas = sprints.reduce((sum, s) => sum + (s.tareasCompletadas || 0), 0);
const weightedProgress = sprints.reduce((sum, s) => {
  const peso = s.tareasCompletadas || 0;
  const progreso = s.progress || 0;
  return sum + peso * progreso;
}, 0);

const overallProgress = totalTareas === 0 ? 0 : Math.round(weightedProgress / totalTareas);


const totalWorkedHours = userTasks.reduce((sum, task) => sum + (task.realhours || 0), 0);

const totalCompletedTasks = userTasks.filter(task => task.status === "Done").length;

const toggleNotifications = () => {
  setShowNotifications(prev => !prev);
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
                <NotificationPanel />
                <UserCircle className="text-white w-8 h-8 me-6 cursor-pointer hover:text-red-500" />
              </div>
          </div>
        </header>



  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
    <div className="bg-[#2a2a2a] rounded p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 ">
        <div className="ms-6 mt-1 w-20 h-20 flex items-center justify-center rounded-full bg-[#9e3e2f]">
          <CircleCheckBig className="w-14 h-14 " />
        </div>
        <div className="flex flex-col items-start justify-center">
          <h2 className="text-6xl font-bold leading-none">
            {sprints.filter(s => s.status === "Completed").length} / {sprints.length}
          </h2>
          <p className="text-gray-400 mt-1 text-center">Sprints Done</p>
        </div>
      </div>
    </div>
    <div className="bg-[#2a2a2a] rounded p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 ">
        <div className="ms-6 mt-1 w-20 h-20 flex items-center justify-center rounded-full bg-[#9e3e2f]">
          <CalendarClock className="w-14 h-14 " />  
        </div>
        <div className="flex flex-col items-start justify-center">
          <h2 className="text-6xl font-bold leading-none">{totalWorkedHours}</h2>
          <p className="text-gray-400 mt-1 text-center">Total Worked Hours</p>
        </div>
      </div>
    </div>

    <div className="bg-[#2a2a2a] rounded p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 ">
        <div className="ms-6 mt-1 w-20 h-20 flex items-center justify-center rounded-full bg-[#9e3e2f]">
          <ListChecks className="w-14 h-14" />
        </div>
        <div className="flex flex-col items-start justify-center">
          <h2 className="text-6xl font-bold leading-none">{totalCompletedTasks}</h2>
          <p className="text-gray-400 mt-1 text-center">Total Completed Tasks</p>
        </div>

      </div>
    </div>

  </div>

        {/* BLOQUE DE RESUMEN Y TAREAS - PRIMERA FILA */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
  {/* Sprint Summary */}
  <div className="bg-[#2a2a2a] rounded p-4 md:col-span-2">
    <h3 className="text-lg font-semibold mb-4">Sprint Summary</h3>
    <div className="h-96 overflow-y-auto">
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
                sprint.status === "Completed" ? "text-green-400" :
                sprint.status === "Doing" ? "text-yellow-400" : "text-transparent"
              }>
                {sprint.status}
              </span>
            </td>
            <td className="py-2">
              <div className="bg-neutral-800 w-full h-2 rounded-full">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${sprint.progress}%` }}></div>
              </div>
              <span className="text-xs text-gray-400 ml-1">{sprint.progress}%</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  </div>
    {/*div más grande*/}
  <div className="bg-[#2a2a2a] rounded p-4 col-span-1">
    <h3 className="text-lg font-semibold mb-4">Overall Progress</h3>
    <div className="relative w-full h-48 flex items-center justify-center mt-24">
      <svg width="100%" height="100%" viewBox="0 0 200 100">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF4E42" />
            <stop offset="50%" stopColor="#ECC431" />
            <stop offset="100%" stopColor="#77C235" />
          </linearGradient>
        </defs>

        {/* Gauge semicircle */}
        <path
          d="M10,100 A90,90 0 0,1 190,100"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="20"
          strokeLinecap="round"
        />

        {/* Needle */}
        {(() => {
          const angle = (overallProgress / 100) * 180; // 0 to 180 degrees
          const radius = 90;
          const centerX = 100;
          const centerY = 100;
          const rad = (Math.PI / 180) * angle;
          const needleX = centerX + radius * Math.cos(Math.PI - rad);
          const needleY = centerY - radius * Math.sin(Math.PI - rad);

          return (
            <line
              x1={centerX}
              y1={centerY}
              x2={needleX}
              y2={needleY}
              stroke="#fff"
              strokeWidth="4"
              strokeLinecap="round"
            />
          );
        })()}

        {/* Needle cap */}
        <circle cx="100" cy="100" r="6" fill="#fff" stroke="#1a1a1a" strokeWidth="2" />
      </svg>

      
    </div>
    <div className="text-center">
        <div className="text-6xl font-bold mt-6">{overallProgress}%</div>
        <p className="text-gray-400 mt-1 text-center">Progress</p>

      </div>
  </div>

  </div>

{/* BLOQUE DE PRODUCTIVIDAD - SEGUNDA FILA */}
<div className=" mt-6">
  <div className="bg-[#2a2a2a] rounded p-4">
  <h3 className="text-md font-semibold text-white mb-4">Worked hours by developer</h3>
  <ResponsiveContainer width="100%" height={200}>
    <BarChart data={sprintTable}>
      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
      <XAxis dataKey="sprint" stroke="#ccc" />
      <YAxis stroke="#ccc" />
      <Tooltip />
      <Legend />
      <Bar dataKey="Daniela" fill="#A7322C" />
      <Bar dataKey="Dora" fill="#BA3E2B" />
      <Bar dataKey="Carlos" fill="#9e3e2f" />
      <Bar dataKey="Rodrigo" fill="#66210E" />
    </BarChart> 
  </ResponsiveContainer>
  </div>
</div>
<div className=" mt-6">
  <div className="bg-[#2a2a2a] rounded p-4">
    <h3 className="text-md font-semibold text-white mb-4">Completed tasks by developer</h3>
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={completedSprintTable}>
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis dataKey="sprint" stroke="#ccc" />
        <YAxis stroke="#ccc" />
        <Tooltip />
        <Legend />
        <Bar dataKey="Daniela" fill="#A7322C" />
        <Bar dataKey="Dora" fill="#BA3E2B" />
        <Bar dataKey="Carlos" fill="#9e3e2f" />
        <Bar dataKey="Rodrigo" fill="#66210E" />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

<div className="mt-6">
  <div className="bg-[#2a2a2a] rounded p-4 mt-6">
    <h3 className="text-lg font-semibold mb-4">Total Worked Hours by Sprint</h3>
    
    <div className="overflow-x-auto">
      <div style={{ minWidth: totalHoursBySprint.length * 160 }}> {/* Adjust 80 as needed */}
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={totalHoursBySprint}>
            <defs>
              <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DD4F3A" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#DD4F3A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis 
              dataKey="sprint" 
              stroke="#ccc" 
              fontSize={12} 
              angle={-70}
              height={60} 
            />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="hours" 
              stroke="#DD4F3A" 
              fillOpacity={1} 
              fill="url(#colorHours)" 
              name="Total Hours" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>

  </div>
</div>

    </div>
  </div>
  );
};

export default AnalyticsManager;