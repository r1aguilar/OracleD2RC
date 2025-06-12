import React, { useState, useEffect } from "react";
import Sidebar from "./components/SidebarManager";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  UserCircle,
  CircleCheckBig,
  CalendarClock,
  ListChecks,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AnalyticsManager = () => {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState("Sprint1");
  const [allTasks, setAllTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [selectedProyecto, setSelectedProyecto] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [userIds, setUserIds] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [userTasks, setUserTasks] = useState([]);
  const [totalHoursBySprint, setTotalHoursBySprint] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [verification, setVerification] = useState(null);

  const sprintNameMap = sprints.reduce((acc, s) => {
    acc[`Sprint${s.id}`] = s.name;
    return acc;
  }, {});

  const fetchProyectos = async () => {
    const userId = JSON.parse(localStorage.getItem("userId"));
    if (!userId) return;
    try {
      const res = await fetch(`/pruebasProy/ProyectosForManager/${userId}`);
      const data = await res.json();

      // Ensure we get valid sprint data
      const validProys = data.filter(
        (proy) => proy && proy.id !== undefined && proy.id !== null
      );

      // Log valid sprints for debugging
      console.log("Fetched proyectos:", validProys);

      setProyectos(validProys);
      console.log(validProys[0].id);
      if (validProys.length > 0) {
        const firstId = validProys[0].id;
        setSelectedProyecto(firstId); // This triggers useEffect that calls fetchSprints
      } else {
        setSelectedProyecto(0);
      }

      console.log("Initial selected proyecto IDs:", validProys[0].id);
    } catch (err) {
      console.error("Failed to fetch proyectos", err);
    }
  };

  const fetchSprints = async () => {
    try {
      const response = await fetch(
        `/pruebasSprint/SprintsForKPIs/${selectedProyecto}`
      );
      const data = await response.json();

      const formattedSprints = data.map((sprint) => ({
        id: sprint.id,
        name: `${sprint.nombre}`,
        label: sprint.nombre,
        date: new Date(sprint.fechaFin).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        tareasTotales: sprint.tareasTotales,
        tareasCompletadas: sprint.tareasCompletadas,
        status:
          sprint.tareasCompletadas === 0
            ? "Pending"
            : sprint.tareasTotales === sprint.tareasCompletadas
            ? "Completed"
            : "Doing",
        progress:
          sprint.tareasCompletadas === 0
            ? 0
            : Math.round(
                (sprint.tareasTotales / sprint.tareasCompletadas) * 100
              ),
      }));

      setSprints(formattedSprints);
    } catch (error) {
      console.error("Error fetching sprint KPIs:", error);
    }
  };

  const fetchAllUserTasks = async () => {
    try {
      const allTasks = [];
      const hoursPerSprintMap = {};
      console.log("Userids", userIds);
      for (const id of userIds) {
        const res = await fetch(`/pruebas/TareasUsuario/${id}`);
        const data = await res.json();
        const formatted = data.map((t) => ({
          user: userMap[t.idEncargado] || "Developer",
          sprint: `Sprint${t.idSprint}`,
          realhours: t.tiempoReal || 0,
          status:
            t.idColumna === 1
              ? "Pending"
              : t.idColumna === 2
              ? "Doing"
              : "Done",
        }));
        allTasks.push(...formatted);
        data.forEach((t) => {
          const sprintName = `Sprint${t.idSprint}`;
          hoursPerSprintMap[sprintName] =
            (hoursPerSprintMap[sprintName] || 0) + (t.tiempoReal || 0);
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
            const sprintObj = sprints.find((s) => s.id === sprintId);
            return {
              sprint: sprintObj ? sprintObj.name : sprint, // ✅ Replace with name if found
              hours,
            };
          });

        console.log("chartData Total hours", chartData);

        setTotalHoursBySprint(chartData);
      }
      setUserTasks(allTasks);
    } catch (err) {
      console.error("Error fetching user tasks:", err);
    }
  };

  const fetchDevelopers = async () => {
    if (!selectedProyecto) return;

    try {
      const res = await fetch(
        `/pruebasProy/UsuariosProyecto/${selectedProyecto}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (!res.ok) throw new Error("Error loading developers");

      const data = await res.json();
      const devList = Array.isArray(data) ? data : [];

      console.log("Developers", devList);

      // Create a new userMap from developer list
      const newUserMap = {};
      devList.forEach((dev) => {
        const firstName = dev.nombre?.split(" ")[0] || "";
        newUserMap[dev.id] = firstName;
      });

      setDevelopers(devList);
      console.log("User Map", newUserMap);
      setUserMap(newUserMap);
      const ids = Object.keys(newUserMap).map(Number);
      console.log("User Ids", ids);
      setUserIds(ids);
    } catch (err) {
      console.error("Error loading developers:", err);
    }
  };

  const checkTokenAndFetchData = async () => {
    try {
      const response = await fetch("/pruebasUser/validarTokenManager", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // or however you store it
        },
      });

      if (!response.ok) throw new Error("Token validation request failed");

      const isValid = await response.json();
      if (!isValid) {
        navigate("/login");
        return;
      }
      console.log("Verification completed");
      setVerification(true);
    } catch (error) {
      navigate("/login");
    }
  };

  useEffect(() => {
    const init = async () => {
      await checkTokenAndFetchData();
    };
    init();
  }, [checkTokenAndFetchData]);

  useEffect(() => {
    const init = async () => {
      await fetchProyectos();
    };
    init();
  }, [verification]);

  // 2. When selectedProyecto changes
  useEffect(() => {
    if (selectedProyecto != 0) {
      const loadProjectData = async () => {
        setIsLoading(true);
        await fetchSprints();
        await fetchDevelopers(); // this updates userMap
      };
      loadProjectData();
    }
  }, [selectedProyecto]);

  // 3. When userMap updates, compute userIds and fetch tasks
  useEffect(() => {
    if (userIds.length > 0) {
      const loadTaskData = async () => {
        await fetchAllUserTasks();
        setIsLoading(false);
      };
      loadTaskData();
    }
  }, [userMap]);

  const kpiPerson = [];

  allTasks.forEach((t) => {
    const key = `${t.user}-${t.sprint}`;
    let entry = kpiPerson.find(
      (e) => e.name === t.user && e.sprint === t.sprint
    );
    if (!entry) {
      entry = { name: t.user, sprint: t.sprint, hours: 0, tasks: 0 };
      kpiPerson.push(entry);
    }
    entry.hours += t.realhours;
    if (t.status === "Done") entry.tasks += 1;
  });

  const sprintKpiPerson = kpiPerson.filter((k) => k.sprint === selectedSprint);

  const kpiPersonAggregated = sprintKpiPerson.reduce((acc, cur) => {
    const key = cur.name;
    if (!acc[key]) acc[key] = { name: cur.name, hours: 0, tasks: 0 };
    acc[key].hours += cur.hours;
    acc[key].tasks += cur.tasks;
    return acc;
  }, {});

  // Agrupar horas reales por sprint y usuario
  const hoursPerSprint = {};

  userTasks.forEach((t) => {
    const key = `${t.user}-${t.sprint}`;
    if (!hoursPerSprint[key]) {
      hoursPerSprint[key] = { sprint: t.sprint, user: t.user, hours: 0 };
    }
    hoursPerSprint[key].hours += t.realhours;
  });

  const grouped = Object.values(hoursPerSprint);

  // Ordenar sprints correctamente
  const uniqueSprints = [...new Set(userTasks.map((row) => row.sprint))].sort(
    (a, b) => {
      const numA = parseInt(a.replace("Sprint", ""));
      const numB = parseInt(b.replace("Sprint", ""));
      return numA - numB;
    }
  );

  const uniqueUsers = [...new Set(userTasks.map((row) => row.user))];

  // Crear tabla de horas trabajadas
  const sprintTable = uniqueSprints
    .filter((sprintKey) => sprintNameMap[sprintKey]) // ignore null or unmatched
    .map((sprintKey) => {
      const row = { sprint: sprintNameMap[sprintKey] };
      uniqueUsers.forEach((user) => {
        const match = grouped.find(
          (r) => r.sprint === sprintKey && r.user === user
        );
        row[user] = match ? match.hours : 0;
      });
      return row;
    });

  // Agrupar tareas completadas por sprint y usuario
  const completedTasksPerSprint = {};

  userTasks.forEach((t) => {
    if (t.status === "Done") {
      const key = `${t.user}-${t.sprint}`;
      if (!completedTasksPerSprint[key]) {
        completedTasksPerSprint[key] = {
          sprint: t.sprint,
          user: t.user,
          tasks: 0,
        };
      }
      completedTasksPerSprint[key].tasks += 1;
    }
  });

  const groupedCompleted = Object.values(completedTasksPerSprint);

  // Crear tabla de tareas completadas
  const completedSprintTable = uniqueSprints
    .filter((sprintKey) => sprintNameMap[sprintKey])
    .map((sprintKey) => {
      const row = { sprint: sprintNameMap[sprintKey] };
      uniqueUsers.forEach((user) => {
        const match = groupedCompleted.find(
          (r) => r.sprint === sprintKey && r.user === user
        );
        row[user] = match ? match.tasks : 0;
      });
      return row;
    });

  const totalTareas = sprints.reduce(
    (sum, s) => sum + (s.tareasCompletadas || 0),
    0
  );
  const weightedProgress = sprints.reduce((sum, s) => {
    const peso = s.tareasCompletadas || 0;
    const progreso = s.progress || 0;
    return sum + peso * progreso;
  }, 0);

  const overallProgress =
    totalTareas === 0 ? 0 : Math.round(weightedProgress / totalTareas);

  const totalWorkedHours = userTasks.reduce(
    (sum, task) => sum + (task.realhours || 0),
    0
  );

  const totalCompletedTasks = userTasks.filter(
    (task) => task.status === "Done"
  ).length;

  return (
    <div className="flex h-screen bg-[#1a1a1a]">
      <Sidebar
        isMobileOpen={isMobileOpen}
        closeMobile={() => setIsMobileOpen(false)}
      />
      <div className="flex-1 p-6 overflow-y-auto text-white">
        <header className="flex flex-wrap items-center justify-between py-4 gap-4">
          <h1 className="text-white text-2xl font-semibold">Analytics</h1>
          <div className="flex flex-wrap gap-3 items-center">
            {/* Project Dropdown */}
            <select
              value={selectedProyecto}
              onChange={(e) => setSelectedProyecto(e.target.value)}
              className="bg-[#2a2a2a] border text-white rounded px-4 py-2 shadow"
            >
              <option value="">Select a Project</option>
              {proyectos.map((proyecto) => (
                <option key={proyecto.id} value={proyecto.id}>
                  {proyecto.nombre}
                </option>
              ))}
            </select>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
          <div className="bg-[#2a2a2a] rounded p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 ">
              <div className="ms-6 mt-1 w-20 h-20 flex items-center justify-center rounded-full bg-#f25c54]">
                <CircleCheckBig className="w-14 h-14 " />
              </div>
              <div className="flex flex-col items-start justify-center">
                <h2 className="text-6xl font-bold leading-none">
                  {sprints.filter((s) => s.status === "Completed").length} /{" "}
                  {sprints.length}
                </h2>
                <p className="text-gray-400 mt-1 text-center">Sprints Done</p>
              </div>
            </div>
          </div>
          <div className="bg-[#2a2a2a] rounded p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 ">
              <div className="ms-6 mt-1 w-20 h-20 flex items-center justify-center rounded-full bg-#f25c54]">
                <CalendarClock className="w-14 h-14 " />
              </div>
              <div className="flex flex-col items-start justify-center">
                <h2 className="text-6xl font-bold leading-none">
                  {totalWorkedHours}
                </h2>
                <p className="text-gray-400 mt-1 text-center">
                  Total Worked Hours
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#2a2a2a] rounded p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 ">
              <div className="ms-6 mt-1 w-20 h-20 flex items-center justify-center rounded-full bg-#f25c54]">
                <ListChecks className="w-14 h-14" />
              </div>
              <div className="flex flex-col items-start justify-center">
                <h2 className="text-6xl font-bold leading-none">
                  {totalCompletedTasks}
                </h2>
                <p className="text-gray-400 mt-1 text-center">
                  Total Completed Tasks
                </p>
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
                        <span
                          className={
                            sprint.status === "Completed"
                              ? "text-green-400"
                              : sprint.status === "Doing"
                              ? "text-yellow-400"
                              : "text-gray-400"
                          }
                        >
                          {sprint.status}
                        </span>
                      </td>
                      <td className="py-2">
                        <div className="bg-neutral-800 w-full h-2 rounded-full">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${sprint.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-400 ml-1">
                          {sprint.progress}%
                        </span>
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
                  <linearGradient
                    id="gaugeGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
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
                <circle
                  cx="100"
                  cy="100"
                  r="6"
                  fill="#fff"
                  stroke="#2a2a2a"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold mt-6">{overallProgress}%</div>
              <p className="text-gray-400 mt-1 text-center">Progress</p>
            </div>
          </div>
        </div>

        {/* BLOQUE DE PRODUCTIVIDAD - SEGUNDA FILA */}
        <div className="mt-6">
          <div className="bg-[#2a2a2a] rounded p-4">
            <h3 className="text-md font-semibold text-white mb-4">
              Worked hours by developer
            </h3>
            <div className="overflow-x-auto">
              <div style={{ minWidth: Object.keys(userMap).length * 160 }}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={sprintTable}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="sprint" stroke="#ccc" />
                    <YAxis stroke="#ccc" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#2a2a2a",
                        borderColor: "#62B6CB",
                        borderRadius: "8px",
                        color: "#ffffff",
                      }}
                      labelStyle={{
                        color: "#ffffff",
                        fontWeight: "bold",
                      }}
                    />
                    <Legend />
                    {Object.entries(userMap).map(([id, name], index) => {
                      const r = Math.max(0, 190 - index * 30);
                      const g = Math.max(0, 233 - index * 30);
                      const b = Math.max(0, 232 - index * 30);
                      const color = `rgb(${r}, ${g}, ${b})`;
                      return <Bar key={id} dataKey={name} fill={color} />;
                    })}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className="bg-[#2a2a2a] rounded p-4">
            <h3 className="text-md font-semibold text-white mb-4">
              Completed tasks by developer
            </h3>
            <div className="overflow-x-auto">
              <div style={{ minWidth: Object.keys(userMap).length * 160 }}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={completedSprintTable}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="sprint" stroke="#ccc" />
                    <YAxis stroke="#ccc" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#2a2a2a",
                        borderColor: "#62B6CB",
                        borderRadius: "8px",
                        color: "#ffffff",
                      }}
                      labelStyle={{
                        color: "#ffffff",
                        fontWeight: "bold",
                      }}
                    />
                    <Legend />
                    {Object.entries(userMap).map(([id, name], index) => {
                      const r = Math.max(0, 190 - index * 30);
                      const g = Math.max(0, 233 - index * 30);
                      const b = Math.max(0, 232 - index * 30);
                      const color = `rgb(${r}, ${g}, ${b})`;
                      return <Bar key={id} dataKey={name} fill={color} />;
                    })}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="bg-[#2a2a2a] rounded p-4 mt-6">
            <h3 className="text-lg font-semibold mb-4">
              Total Worked Hours by Sprint
            </h3>

            <div className="overflow-x-auto">
              <div style={{ minWidth: totalHoursBySprint.length * 160 }}>
                {" "}
                {/* Adjust 80 as needed */}
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={totalHoursBySprint}>
                    <defs>
                      <linearGradient
                        id="colorHours"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#BEE9E8"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#BEE9E8"
                          stopOpacity={0}
                        />
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
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#2a2a2a", // fondo oscuro
                        borderColor: "#62B6CB", // borde azulAdd commentMore actions
                        borderRadius: "8px",
                        color: "#ffffff", // color de texto
                      }}
                      labelStyle={{
                        color: "#ffffff",
                        fontWeight: "bold",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="hours"
                      stroke="#BEE9E8"
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
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-24 w-24 border-8 border-t-transparent border-red-600"></div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsManager;
