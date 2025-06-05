import React, { useState, useEffect } from "react";
import Sidebar from "./components/SidebarManager";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell } from "recharts";
import { Bell, UserCircle, ListTodo, SquareCheckBig, CalendarClock } from "lucide-react";

const AnalyticsSprint = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [selectedSprint, setSelectedSprint] = useState("Sprint1");
  const [allTasks, setAllTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [userTasks, setUserTasks] = useState([]);
  const [setTotalHoursBySprint] = useState([]);

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
        const response = await fetch(`http://localhost:8080/pruebas/TareasSprint/${sprintNumber}`);
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

  useEffect(() => {
  const fetchSprints = async () => {
    try {
      const response = await fetch("http://localhost:8080/pruebasSprint/SprintsForKPIs/1");
      const data = await response.json();

      const formattedSprints = data.map(sprint => ({
        id: sprint.id,
        name: `Sprint${sprint.id}`,
        label: sprint.nombre,
        date: new Date(sprint.fechaFin).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric"
        }),
        status: sprint.tareasCompletadas === 0 //completadas y totales estan cambiadas
          ? "Pending"
          : sprint.tareasTotales === sprint.tareasCompletadas
          ? "Completed"
          : "Doing",
        progress: sprint.tareasTotales === 0
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
  const fetchAllUserTasks = async () => {
    try {
      const userIds = [1, 2, 3, 4];
      const allTasks = [];
      const hoursPerSprintMap = {};


      for (const id of userIds) {
        const res = await fetch(`http://localhost:8080/pruebas/TareasUsuario/${id}`);
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
          const sprintName = `{t.name}`;
          hoursPerSprintMap[sprintName] = (hoursPerSprintMap[sprintName] || 0) + (t.tiempoReal || 0);
        });

        const chartData = Object.entries(hoursPerSprintMap)
          .map(([sprint, hours]) => ({ sprint, hours }))
          .sort((a, b) => {
            const numA = parseInt(a.sprint.replace("Sprint", ""));
            const numB = parseInt(b.sprint.replace("Sprint", ""));
            return numA - numB;
          });

        setTotalHoursBySprint(chartData);


      }

      setUserTasks(allTasks);
    } catch (err) {
      console.error("Error fetching user tasks:", err);
    }
  };

  fetchAllUserTasks();
}, []);

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

const totalWorkedHours = sprintTasks.reduce((sum, t) => sum + (t.realhours || 0), 0);

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

const sprintKpiPerson = kpiPerson.filter(k => k.sprint === selectedSprint);

const kpiPersonAggregated = sprintKpiPerson.reduce((acc, cur) => {
  const key = cur.name;
  if (!acc[key]) acc[key] = { name: cur.name, hours: 0, tasks: 0 };
  acc[key].hours += cur.hours;
  acc[key].tasks += cur.tasks;
  return acc;
}, {});

const kpiPersonData = Object.values(kpiPersonAggregated);

const hoursPerDeveloper = {};
sprintTasks.forEach(task => {
  if (!hoursPerDeveloper[task.user]) {
    hoursPerDeveloper[task.user] = { name: task.user, estimated: 0, real: 0 };
  }
  hoursPerDeveloper[task.user].estimated += task.estimatedhours;
  hoursPerDeveloper[task.user].real += task.realhours;
});
const hoursComparisonByDeveloper = Object.values(hoursPerDeveloper);

// Agrupar horas reales por sprint y usuario
const hoursPerSprint = {};

userTasks.forEach(t => {
  const key = `${t.user}-${t.sprint}`;
  if (!hoursPerSprint[key]) {
    hoursPerSprint[key] = { sprint: t.sprint, user: t.user, hours: 0 };
  }
  hoursPerSprint[key].hours += t.realhours;
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

const developerColors = {
  Daniela: { hours: "#BEE9E8", tasks: "#BEE9E8" },
  Dora: { hours: "#62B6CB", tasks: "#62B6CB" },
  Carlos: { hours: "#CAE9FF", tasks: "#CAE9FF" },
  Rodrigo: { hours: "#5FA8D3", tasks: "#5FA8D3" }
};

  return (
    <div className="flex h-screen bg-[#1a1a1a]">
      <Sidebar isMobileOpen={isMobileOpen} closeMobile={() => setIsMobileOpen(false)} />
      <div className="flex-1 p-6 overflow-y-auto text-white">
      <header className="flex flex-wrap items-center justify-between py-4 gap-4">
                  <h1 className="text-white text-2xl font-semibold">Analytics By Sprint</h1>
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

        {/* BLOQUE DE RESUMEN Y TAREAS - PRIMERA FILA */}
<div className="grid grid-cols-1 md:grid-cols-1 gap-6">
  {/* Sprint's Tasks */}
  <div className="bg-[#2a2a2a] rounded p-4 md:col-span-2">
    <h3 className="text-lg font-semibold mb-4">Sprint's Tasks</h3>
    <div className="flex gap-4 mb-4 text-sm text-gray-400">
      {['ALL', 'Completed', 'Doing', 'Pending'].map(filter => (
        <span
          key={filter}
          className={`cursor-pointer ${selectedFilter === filter ? 'text-white font-semibold underline' : ''}`}
          onClick={() => setSelectedFilter(filter)}
        >
          {filter} {sprintTasks.filter(t =>
            filter === "ALL" ? true :
            filter === "Completed" ? t.status === "Done" :
            filter === "Doing" ? t.status === "Doing" :
            t.status === "Pending"
          ).length}
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
              <td className="py-2">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    task.user === "Daniela"
                      ? "bg-[#BEE9E8] text-black"
                      : task.user === "Dora"
                      ? "bg-[#62B6CB] text-black"
                      : task.user === "Carlos"
                      ? "bg-[#CAE9FF] text-black"
                      : "bg-[#5FA8D3] text-black"
                  }`}
                >
                  {task.user}
                </span>
              </td>
                  
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>
 
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-[#2a2a2a] rounded p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 ">
              <div className="ms-6 mt-1 w-20 h-20 flex items-center justify-center rounded-full bg-[#f25c54]"> 
                <ListTodo className="w-14 h-14 " />
              </div>
              <div className="flex flex-col items-start justify-center">
                <h2 className="text-6xl font-bold">{totalStoryPoints}</h2> 
                <p className="text-sm text-gray-400">Story Points</p>
              </div>
            </div>
          </div>
          <div className="bg-[#2a2a2a] rounded p-4 text-center">
            <div className="grid grid-cols-1 md:grid-cols-2 ">
              <div className="ms-6 mt-1 w-20 h-20 flex items-center justify-center rounded-full bg-[#f25c54]">
                <SquareCheckBig className="w-14 h-14 " />
              </div>
              <div className="flex flex-col items-start justify-center">
                <h2 className="text-6xl font-bold">{sprintTasks.filter(t => t.status === "Done").length} / {sprintTasks.length}</h2> 
                <p className="text-sm text-gray-400">Tasks Done</p>
              </div>
            </div>
          </div>
          <div className="bg-[#2a2a2a] rounded p-4 text-center">
            <div className="grid grid-cols-1 md:grid-cols-2 ">
              <div className="ms-6 mt-1 w-20 h-20 flex items-center justify-center rounded-full bg-[#f25c54]">
                <CalendarClock className="w-14 h-14 " />
              </div>
              <div className="flex flex-col items-start justify-center">
                <h2 className="text-6xl font-bold">{totalWorkedHours}</h2>
                <p className="text-sm text-gray-400">Total Worked Hours</p>
              </div>
            </div>           
          </div>
        </div>

{/* BLOQUE DE PRODUCTIVIDAD - SEGUNDA FILA */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
  {/* Productivity - Current Sprint */}
<div className="grid grid-rows-1 md:grid-rows-1 gap-6 md:col-span-2">

  <div className="bg-[#2a2a2a] rounded p-4">
      {/* Developer Productivity */}
    <h4 className="text-lg font-semibold  mb-4">Developers</h4>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Tabla de productividad por developer */}
      <table className="w-full text-sm">
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

      {/* Gráfica de productividad por developer */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={kpiPersonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#555" />
            <XAxis dataKey="name" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip
             contentStyle={{
            backgroundColor: "#333333",  // fondo oscuro
            borderColor: "#62B6CB",     // borde azul
            borderRadius: "8px",
          }}
          itemStyle={{
            color: "#ffffff" 
          }}
           labelStyle={{
            color: "#ffffff", 
            fontWeight: "bold"
          }}
            />
            <Legend />
            <Bar dataKey="hours" name="Hours">
  {kpiPersonData.map((entry, index) => (
    <Cell
      key={`cell-hours-${index}`}
      fill={developerColors[entry.name]?.hours || "#ccc"}
    />
  ))}
</Bar>

<Bar dataKey="tasks" name="Tasks">
  {kpiPersonData.map((entry, index) => (
    <Cell
      key={`cell-tasks-${index}`}
      fill={developerColors[entry.name]?.tasks || "#aaa"}
    />
  ))}
</Bar>

            

          </BarChart>

        </ResponsiveContainer>
    </div>
  </div>
  
</div>

  </div>
  
    
    <div className="bg-[#2a2a2a] rounded p-4">
      <h2 className="text-lg font-semibold  mb-4">Estimated vs Real Hours</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={hoursComparisonByDeveloper} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="name" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip 
           contentStyle={{
            backgroundColor: "#333333",  // fondo oscuro
            borderColor: "#62B6CB",     // borde azul
            borderRadius: "8px",
            color: "#ffffff",           // color de texto
          }}
         
           labelStyle={{
            color: "#ffffff", 
            fontWeight: "bold"
          }}
          />
          <Legend />
          <Bar dataKey="estimated" fill="#CAE9FF" name="Estimated Hours" />
          <Bar dataKey="real" fill="#5FA8D3" name="Real Hours" />
        </BarChart>
      </ResponsiveContainer>
          
    </div>
    
</div>
</div>
</div>
  );
};

export default AnalyticsSprint;