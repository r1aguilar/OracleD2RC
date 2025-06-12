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
  Cell,
} from "recharts";
import {
  Bell,
  UserCircle,
  ListTodo,
  SquareCheckBig,
  CalendarClock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AnalyticsSprint = () => {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [selectedSprint, setSelectedSprint] = useState("Sprint1");
  const [selectedProyecto, setSelectedProyecto] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [userIds, setUserIds] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [userTasks, setUserTasks] = useState([]);
  const [totalHoursBySprint, setTotalHoursBySprint] = useState([]);
  const [developerColors, setDeveloperColors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [sprintTasks, setSprintTasks] = useState([]);
  const [kpiPerson, setKpiPerson] = useState([]);
  const [sprintKpiPerson, setSprintKpiPerson] = useState([]);
  const [kpiPersonData, setKpiPersonData] = useState([]);
  const [hoursComparisonByDeveloper, setHoursComparisonByDeveloper] = useState(
    []
  );
  const [hoursPerSprint, setHoursPerSprint] = useState([]);
  const [completedTasksPerSprint, setCompletedTasksPerSprint] = useState([]);
  const [totalStoryPoints, setTotalStoryPoints] = useState(0);
  const [totalWorkedHours, setTotalWorkedHours] = useState(0);
  const [verification, setVerification] = useState(null);

  const fetchSprints = async () => {
    try {
      const response = await fetch(
        `/pruebasSprint/SprintsForKPIs/${selectedProyecto}`
      );
      const data = await response.json();

      const formattedSprints = data.map((sprint) => ({
        id: sprint.id,
        name: `Sprint${sprint.id}`,
        label: sprint.nombre,
        completado: sprint.completado,
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
      if (formattedSprints.length > 0) {
        const firstIncompleteSprint = formattedSprints.find(
          (sprint) => !sprint.completado
        );
        setSelectedSprint(firstIncompleteSprint.name);
      }
    } catch (error) {
      console.error("Error fetching sprint KPIs:", error);
    }
  };

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

  const fetchAllUserTasks = async () => {
    try {
      const allTasks = [];
      const hoursPerSprintMap = {};
      console.log("Userids", userIds);
      for (const id of userIds) {
        const res = await fetch(`/pruebas/TareasUsuario/${id}`);
        const data = await res.json();
        if (!Array.isArray(data)) {
          console.error("Expected array but got:", data);
        }
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
        console.log("Ending loop for ", id);
      }
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
      // Color gradient generator
      const generateColor = (index) => {
        const hexToRgb = (hex) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return { r, g, b };
        };

        const rgbToHex = ({ r, g, b }) => {
          const clamp = (val) => Math.max(0, Math.min(255, val));
          return (
            "#" +
            clamp(r).toString(16).padStart(2, "0") +
            clamp(g).toString(16).padStart(2, "0") +
            clamp(b).toString(16).padStart(2, "0")
          );
        };

        const baseColor = hexToRgb("#BEE9E8");
        const step = 30;

        return rgbToHex({
          r: baseColor.r - step * index,
          g: baseColor.g - step * index,
          b: baseColor.b - step * index,
        });
      };

      // Generate color map
      const developerColors = {};
      Object.values(newUserMap).forEach((name, index) => {
        const color = generateColor(index);
        developerColors[name] = {
          hours: color,
          tasks: color,
        };
      });

      setDeveloperColors(developerColors);
      console.log("Developer Colors", developerColors);
    } catch (err) {
      console.error("Error loading developers:", err);
    }
  };

  const fetchTasks = async () => {
    if (!selectedSprint || Object.keys(userMap).length === 0) return;

    const sprintNumber = selectedSprint.replace("Sprint", "");

    try {
      const response = await fetch(`/pruebas/TareasSprint/${sprintNumber}`);
      const data = await response.json();

      const formatted = data.map((task) => ({
        name: task.nombre,
        sprint: `Sprint${task.idSprint}`,
        estimatedhours: task.tiempoEstimado || 0,
        realhours: task.tiempoReal || 0,
        status:
          task.idColumna === 1
            ? "Pending"
            : task.idColumna === 2
            ? "Doing"
            : "Done",
        user: userMap[task.idEncargado] || "Developer",
        storypoints: task.storyPoints || 0,
      }));

      setAllTasks(formatted);

      const sprintlocaltasks = formatted.filter(
        (t) => t.sprint === selectedSprint
      );
      setSprintTasks(sprintlocaltasks);

      const localFiltered =
        selectedFilter === "ALL"
          ? sprintlocaltasks
          : sprintlocaltasks.filter((t) =>
              selectedFilter === "Completed"
                ? t.status === "Done"
                : selectedFilter === "Pending"
                ? t.status === "Pending"
                : t.status === "Doing"
            );

      setFilteredTasks(localFiltered);

      // KPIs by Person
      const kpiRaw = [];
      formatted.forEach((t) => {
        const key = `${t.user}-${t.sprint}`;
        let entry = kpiRaw.find(
          (e) => e.name === t.user && e.sprint === t.sprint
        );
        if (!entry) {
          entry = { name: t.user, sprint: t.sprint, hours: 0, tasks: 0 };
          kpiRaw.push(entry);
        }
        entry.hours += t.realhours;
        if (t.status === "Done") entry.tasks += 1;
      });
      setKpiPerson(kpiRaw);

      const localsprintKpiPerson = kpiRaw.filter(
        (k) => k.sprint === selectedSprint
      );
      setSprintKpiPerson(localsprintKpiPerson);
      const kpiAggregated = localsprintKpiPerson.reduce((acc, cur) => {
        if (!acc[cur.name])
          acc[cur.name] = { name: cur.name, hours: 0, tasks: 0 };
        acc[cur.name].hours += cur.hours;
        acc[cur.name].tasks += cur.tasks;
        return acc;
      }, {});
      setKpiPersonData(Object.values(kpiAggregated));

      // Hours Comparison by Developer
      const hoursMap = {};
      sprintlocaltasks.forEach((t) => {
        if (!hoursMap[t.user]) {
          hoursMap[t.user] = { name: t.user, estimated: 0, real: 0 };
        }
        hoursMap[t.user].estimated += t.estimatedhours;
        hoursMap[t.user].real += t.realhours;
      });
      setHoursComparisonByDeveloper(Object.values(hoursMap));

      // Aggregated hours and tasks per sprint/user
      const hoursBySprint = {};
      const tasksBySprint = {};

      formatted.forEach((t) => {
        const key = `${t.user}-${t.sprint}`;
        if (!hoursBySprint[key]) {
          hoursBySprint[key] = { sprint: t.sprint, user: t.user, hours: 0 };
        }
        hoursBySprint[key].hours += t.realhours;

        if (t.status === "Done") {
          if (!tasksBySprint[key]) {
            tasksBySprint[key] = { sprint: t.sprint, user: t.user, tasks: 0 };
          }
          tasksBySprint[key].tasks += 1;
        }
      });

      setHoursPerSprint(Object.values(hoursBySprint));
      setCompletedTasksPerSprint(Object.values(tasksBySprint));

      // Totals
      setTotalStoryPoints(
        sprintlocaltasks.reduce((sum, t) => sum + (t.storypoints || 0), 0)
      );
      setTotalWorkedHours(
        sprintlocaltasks.reduce((sum, t) => sum + (t.realhours || 0), 0)
      );
    } catch (err) {
      console.error("Error fetching tasks:", err);
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

  useEffect(() => {
    if (userIds.length > 0) {
      const loadTaskData = async () => {
        await fetchAllUserTasks();
        setIsLoading(false);
      };
      loadTaskData();
    }
  }, [userMap]);

  useEffect(() => {
    if (selectedSprint && Object.keys(userMap).length > 0) {
      const loadTaskDataSprint = async () => {
        await fetchTasks();
        setIsLoading(false);
      };
      loadTaskDataSprint();
    }
  }, [selectedSprint, userMap]);

  return (
    <div className="flex h-screen bg-[#1a1a1a]">
      <Sidebar
        isMobileOpen={isMobileOpen}
        closeMobile={() => setIsMobileOpen(false)}
      />
      <div className="flex-1 p-6 overflow-y-auto text-white">
        <header className="flex flex-wrap items-center justify-between py-4 gap-4">
          <h1 className="text-white text-2xl font-semibold">
            Analytics By Sprint
          </h1>
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
            <select
              value={selectedSprint}
              onChange={(e) => setSelectedSprint(e.target.value)}
              className="bg-[#2a2a2a] border text-white rounded px-4 py-2 shadow"
            >
              {sprints.map((s, i) => (
                <option key={i} value={s.name}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* BLOQUE DE RESUMEN Y TAREAS - PRIMERA FILA */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {/* Sprint's Tasks */}
          <div className="bg-[#2a2a2a] rounded p-4 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Sprint's Tasks</h3>
            <div className="flex gap-4 mb-4 text-sm text-gray-400">
              {["ALL", "Completed", "Doing", "Pending"].map((filter) => (
                <span
                  key={filter}
                  className={`cursor-pointer ${
                    selectedFilter === filter
                      ? "text-white font-semibold underline"
                      : ""
                  }`}
                  onClick={() => setSelectedFilter(filter)}
                >
                  {filter}{" "}
                  {
                    sprintTasks.filter((t) =>
                      filter === "ALL"
                        ? true
                        : filter === "Completed"
                        ? t.status === "Done"
                        : filter === "Doing"
                        ? t.status === "Doing"
                        : t.status === "Pending"
                    ).length
                  }
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
                          className="text-xs font-semibold px-2 py-1 rounded-full"
                          style={{
                            backgroundColor:
                              developerColors[task.user]?.tasks || "#ccc",
                            color: "#000",
                          }}
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
                <h2 className="text-6xl font-bold">
                  {sprintTasks.filter((t) => t.status === "Done").length} /{" "}
                  {sprintTasks.length}
                </h2>
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
                          backgroundColor: "#333333", // fondo oscuro
                          borderColor: "#62B6CB", // borde azul
                          borderRadius: "8px",
                        }}
                        itemStyle={{
                          color: "#ffffff",
                        }}
                        labelStyle={{
                          color: "#ffffff",
                          fontWeight: "bold",
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
            <h2 className="text-lg font-semibold  mb-4">
              Estimated vs Real Hours
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={hoursComparisonByDeveloper}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#333333", // fondo oscuro
                    borderColor: "#62B6CB", // borde azul
                    borderRadius: "8px",
                    color: "#ffffff", // color de texto
                  }}
                  labelStyle={{
                    color: "#ffffff",
                    fontWeight: "bold",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="estimated"
                  fill="#CAE9FF"
                  name="Estimated Hours"
                />
                <Bar dataKey="real" fill="#5FA8D3" name="Real Hours" />
              </BarChart>
            </ResponsiveContainer>
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

export default AnalyticsSprint;
