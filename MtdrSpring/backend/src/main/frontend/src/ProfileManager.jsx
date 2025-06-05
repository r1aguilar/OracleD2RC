import React, { useState, useEffect } from 'react';
import SidebarManager from './components/SidebarManager';
import CreateProjectModal from './components/CreateProjectModal';
import AssignDeveloperModal from './components/AssignDeveloperModal';
import { Pencil, Save, Edit, Lock, Plus, X } from 'lucide-react';

const ProfileManager = () => {
  // States
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });
  const [projects, setProjects] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isAssignDeveloperModalOpen, setIsAssignDeveloperModalOpen] = useState(false);
  const [availableDevelopers, setAvailableDevelopers] = useState([]);
  const [avatarStyleIndex, setAvatarStyleIndex] = useState(
    parseInt(localStorage.getItem('avatarStyleIndex') || '0')
  );

  // User data
  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  const [formData, setFormData] = useState({
    name: userData.name || userData.nombre || '',
    email: userData.email || userData.correo || '',
    phone: userData.phone || userData.telefono || ''
  });

  // Avatar configuration
  const avatarStyles = ['avataaars', 'bottts', 'micah', 'pixel-art', 'thumbs'];
  const avatarUrl = `https://api.dicebear.com/7.x/${avatarStyles[avatarStyleIndex]}/svg?seed=${encodeURIComponent(formData.name || 'user')}`;

  // Display temporary message
  const displayMessage = (msg, isSuccess = true) => {
    setMessage(msg);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 5000);
  };

  // Fetch projects for the manager
  const fetchProjects = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    
    try {
      const res = await fetch(`/pruebasProy/ProyectosForManager/${userId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!res.ok) throw new Error("Error loading projects");
      
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading projects:", err);
      displayMessage("Error loading projects", false);
    }
  };

  // Fetch developers of the selected project
  const fetchDevelopers = async () => {
    if (!selectedProject) return;
    
    try {
      const idProy = selectedProject.id_proyecto || selectedProject.id;
      const res = await fetch(`/pruebasProy/UsuariosProyecto/${idProy}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!res.ok) throw new Error("Error loading developers");
      
      const data = await res.json();
      setDevelopers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading developers:", err);
      displayMessage("Error loading developers", false);
    }
  };

  // Fetch all available users (excluding managers)
  const fetchAvailableDevelopers = async () => {
    try {
      const res = await fetch('/pruebasUser/usuarios', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!res.ok) throw new Error("Error loading users");
      
      const data = await res.json();
      // Filter users who are not managers
      const normalizedDevelopers = Array.isArray(data) ? 
        data
          .filter(dev => !dev.manager)
          .map(dev => ({
            id: dev.ID || dev.id,
            nombre: dev.nombre,
            correo: dev.correo,
            telefono: dev.telefono
          })) : [];
      
      setAvailableDevelopers(normalizedDevelopers);
    } catch (err) {
      console.error("Error loading users:", err);
      displayMessage("Error loading available developers", false);
    }
  };

  // Create new project
  const handleCreateProject = async (projectData) => {
    setIsLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) throw new Error('User not authenticated');

      const response = await fetch('/pruebasProy/Proyectos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          nombre: projectData.nombre,
          descripcion: projectData.descripcion || '',
          idManager: parseInt(userId),
          deleted: false
        })
      });

      const locationHeader = response.headers.get('location');
      if (!locationHeader) throw new Error('No project ID received');

      const idProy = parseInt(locationHeader);
      if (isNaN(idProy)) throw new Error('Invalid project ID');

      const newProject = {
        id_proyecto: idProy,
        nombre: projectData.nombre,
        descripcion: projectData.descripcion || '',
        idManager: parseInt(userId),
        deleted: false
      };

      setProjects(prev => [...prev, newProject]);
      displayMessage('Project created successfully!');
      setIsCreateProjectModalOpen(false);
      setSelectedProject(newProject);
    } catch (error) {
      console.error('Error creating project:', error);
      displayMessage(error.message, false);
    } finally {
      setIsLoading(false);
    }
  };

  // Assign developer to project
  const assignDeveloper = async (idUser) => {
    if (!selectedProject || !idUser) {
      displayMessage('Invalid user or project ID', false);
      return;
    }
    
    setIsLoading(true);
    try {
      const idProy = selectedProject.id_proyecto || selectedProject.id;
      const response = await fetch(`/pruebasProy/addIntegrante/${idUser}/${idProy}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error assigning developer');
      }

      displayMessage('Developer assigned successfully!');
      setIsAssignDeveloperModalOpen(false);
      fetchDevelopers();
    } catch (error) {
      console.error('Error:', error);
      displayMessage(error.message, false);
    } finally {
      setIsLoading(false);
    }
  };

  // Update user data
  const handleUpdateUser = () => {
    setIsLoading(true);
    const updatedUser = { ...userData, ...formData };
    localStorage.setItem('userData', JSON.stringify(updatedUser));
    displayMessage('Data updated');
    setEditMode(false);
    setIsLoading(false);
  };

  // Change password
  const handleChangePassword = () => {
    displayMessage('To change the password, contact the administrator');
    setPasswordData({ oldPassword: '', newPassword: '' });
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  // Cycle avatar styles
  const cycleAvatarStyle = () => {
    const newIndex = (avatarStyleIndex + 1) % avatarStyles.length;
    setAvatarStyleIndex(newIndex);
    localStorage.setItem('avatarStyleIndex', newIndex.toString());
  };

  // Effects
  useEffect(() => { fetchProjects(); }, []);

  useEffect(() => { 
    if (selectedProject) {
      fetchDevelopers();
    }
  }, [selectedProject]);

  return (
    <div className="flex h-screen bg-[#1a1a1a] text-white">
      <SidebarManager />
      
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto flex flex-col min-h-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Hello {formData.name},</h1>
            <p className="text-gray-400 text-sm">
              {new Date().toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
                timeZoneName: 'short',
              })}
            </p>
          </div>

          {/* Messages */}
          {showMessage && (
            <div className={`mb-4 p-3 rounded-lg flex justify-between items-center ${
              message.includes('success') ? 'bg-green-600' : 'bg-red-600'
            }`}>
              <span>{message}</span>
              <button 
                onClick={() => setShowMessage(false)}
                className="ml-2 p-1 rounded-full hover:bg-black/20"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-10 flex-grow">
            {/* Profile section */}
            <div className="bg-[#2b2b2b] rounded-2xl p-6 shadow-md w-full lg:max-w-md">
              <div className="relative mx-auto w-52 h-52">
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover transition-all duration-300"
                />
                <div
                  className="absolute bottom-2 right-2 bg-red-600 p-1 rounded-full cursor-pointer"
                  onClick={cycleAvatarStyle}
                  title="Change avatar style"
                >
                  <Pencil size={16} color="white" />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    readOnly={!editMode}
                    className={`w-full p-2 rounded-lg ${editMode ? 'bg-[#333]' : 'bg-[#1a1a1a]'} text-white`}
                  />
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    readOnly={!editMode}
                    className={`w-full p-2 rounded-lg ${editMode ? 'bg-[#333]' : 'bg-[#1a1a1a]'} text-white`}
                  />
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    readOnly={!editMode}
                    className={`w-full p-2 rounded-lg ${editMode ? 'bg-[#333]' : 'bg-[#1a1a1a]'} text-white`}
                  />
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <Lock size={18} />
                    Change Password
                  </h4>
                  <div>
                    <label className="text-sm text-gray-400">Current Password</label>
                    <input
                      type="password"
                      name="oldPassword"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-2 rounded-lg bg-[#1a1a1a] text-white"
                    />
                  </div>
                  <div className="mt-2">
                    <label className="text-sm text-gray-400">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-2 rounded-lg bg-[#1a1a1a] text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  {editMode ? (
                    <>
                      <button
                        onClick={() => setEditMode(false)}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateUser}
                        disabled={isLoading}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-xl flex items-center justify-center gap-2"
                      >
                        <Save size={18} />
                        {isLoading ? 'Saving...' : 'Save'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditMode(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl flex items-center justify-center gap-2"
                    >
                      <Edit size={18} />
                      Edit Profile
                    </button>
                  )}
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={!passwordData.oldPassword || !passwordData.newPassword}
                  className={`w-full mt-2 bg-red-600 text-white py-2 px-4 rounded-xl ${
                    (!passwordData.oldPassword || !passwordData.newPassword) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
                  }`}
                >
                  Change Password
                </button>
              </div>
            </div>

            {/* Projects and developers section */}
            <div className="flex-1 flex flex-col gap-6">
              {/* Projects */}
              <div className="bg-[#2b2b2b] rounded-2xl p-6 shadow-md">
                <h3 className="text-xl font-semibold mb-4">My Projects</h3>
                <div className="space-y-3 max-h-56 overflow-y-auto">
                  {projects.length > 0 ? (
                    projects.map((project) => (
                      <button
                        key={project.id_proyecto}
                        onClick={() => setSelectedProject(project)}
                        className={`w-full text-left p-3 rounded-lg border ${
                          selectedProject?.id_proyecto === project.id_proyecto 
                            ? 'border-red-600 bg-[#333]' 
                            : 'border-transparent bg-[#1a1a1a] hover:bg-[#333]'
                        }`}
                      >
                        <div className="font-semibold">{project.nombre}</div>
                        <div className="text-sm text-gray-300">
                          {project.descripcion || 'No description'}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-gray-400 text-center py-4">No projects available</div>
                  )}
                </div>
                <button
                  onClick={() => setIsCreateProjectModalOpen(true)}
                  className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-full font-semibold flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Create new project
                </button>
              </div>

              {/* Developers */}
              <div className="bg-[#2b2b2b] rounded-2xl p-6 shadow-md flex-1">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">My Developers</h3>
                  {selectedProject && (
                    <button
                      onClick={() => {
                        fetchAvailableDevelopers();
                        setIsAssignDeveloperModalOpen(true);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-full font-semibold flex items-center gap-1"
                    >
                      <Plus size={18} />
                      Assign developer
                    </button>
                  )}
                </div>
                <div className="space-y-3 h-[500px] overflow-y-auto">
                  {developers.length > 0 ? (
                    developers.map((dev) => (
                      <div key={dev.ID} className="bg-[#1a1a1a] p-3 rounded-lg">
                        <div className="font-semibold">{dev.nombre}</div>
                        <div className="text-sm text-gray-400">
                          {dev.correo || 'No email'}
                        </div>
                        <div className="text-sm text-gray-400">
                          {dev.telefono || 'No phone'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-center py-4">
                      {selectedProject ? 'No developers in this project' : 'Select a project'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        onCreate={handleCreateProject}
        isLoading={isLoading}
      />

      <AssignDeveloperModal
        isOpen={isAssignDeveloperModalOpen}
        onClose={() => setIsAssignDeveloperModalOpen(false)}
        developers={availableDevelopers}
        onAssign={assignDeveloper}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ProfileManager;