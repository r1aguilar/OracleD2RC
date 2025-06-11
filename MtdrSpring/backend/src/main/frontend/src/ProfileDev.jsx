import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { Pencil, Save, Edit, Lock, X } from 'lucide-react';
import bcrypt from 'bcryptjs';
import { useNavigate } from "react-router-dom";

const ProfileDev = () => {
  // States
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });
  const [projects, setProjects] = useState([]);
  const [project, setProject] = useState(null);
  const [developers, setDevelopers] = useState([]);
  const [showMessage, setShowMessage] = useState(false);
  const [avatarStyleIndex, setAvatarStyleIndex] = useState(
    parseInt(localStorage.getItem('avatarStyleIndex') || '0')
  );
  const navigate = useNavigate();

  // User data
  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  const [formData, setFormData] = useState({
    nombre: userData.name || userData.nombre || '',
    correo: userData.email || userData.correo || '',
    telefono: userData.phone || userData.telefono || ''
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

  // Formatted current date
  const today = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZoneName: 'short',
  });

  // Cycle avatar styles
  const cycleAvatarStyle = () => {
    const newIndex = (avatarStyleIndex + 1) % avatarStyles.length;
    setAvatarStyleIndex(newIndex);
    localStorage.setItem('avatarStyleIndex', newIndex.toString());
  };

  // Fetch projects assigned to the developer
  const fetchProjects = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      const res = await fetch(`/pruebasProy/ProyectoUsuario/${userId}`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error obtaining project');
      }

      const data = await res.json();

      // Log valid sprints for debugging
      console.log("Fetched proyecto:", data);

      const response = await fetch(`/pruebasProy/Proyectos/${data}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error obtaining project by id');
      }

      const proyecto = await response.json();

      // Log valid sprints for debugging
      console.log("Fetched proyecto completo:", proyecto);

      setProject(proyecto);

    } catch (err) {
      console.error("Error loading projects:", err);
      setProject(null);
    }
  };

  // Fetch developers assigned to the same project
  const fetchDevelopers = async () => {
    if (project === null) return;

    try {
      const res = await fetch(`/pruebasProy/UsuariosProyecto/${project.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!res.ok) throw new Error("Error loading developers");

      const data = await res.json();
      setDevelopers(Array.isArray(data) ? data : (typeof data === 'object' ? Object.values(data) : []));
    } catch (err) {
      console.error("Error loading developers:", err);
      setDevelopers([]);
    }
  };

  // Update user data
  // Update user data
  const handleUpdateUser = async () => {
    setIsLoading(true);
    const updatedUser = { ...userData, ...formData };
    const userToSend = JSON.stringify({
      id_usuario: updatedUser.id,
      nombre: updatedUser.nombre,
      username: updatedUser.usernameModel,
      correo: updatedUser.correo,
      telefono: updatedUser.telefono,
      password: updatedUser.passwordModel,
      fechaCreacion: updatedUser.fechaCreacion,
      manager: updatedUser.manager,
      deleted: updatedUser.deleted,
      idTelegram: updatedUser.idTelegram
    })
    console.log(userToSend);
    try{
      const response = await fetch(`/pruebasUser/updateUsuario/${updatedUser.id_usuario}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: userToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error updating developer');
      }
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      displayMessage('Data updated succesfully');

    } catch(error) {
      console.error('Error:', error);
      displayMessage(error.message, false);
    } finally {
      setEditMode(false); 
      setIsLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    setIsLoading(true);

    // Compare the old password input with the hashed one from userData
    const isMatch = await bcrypt.compare(passwordData.oldPassword, userData.passwordModel);

    if (!isMatch) {
      displayMessage('Old password is incorrect', false);
      setIsLoading(false);
      return;
    }

    // Prepare the updated user object with the raw new password
    const userToSend = {
      id_usuario: userData.id,
      nombre: userData.nombre,
      username: userData.username,
      correo: userData.correo,
      telefono: userData.telefono,
      password: passwordData.newPassword, // raw new password
      fechaCreacion: userData.fechaCreacion,
      manager: userData.manager,
      deleted: userData.deleted,
      idTelegram: userData.idTelegram
    };

    try {
      const response = await fetch(`/pruebasUser/updateUsuarioProfile/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userToSend),
      });

      if (!response.ok) throw new Error('Password update failed');

      displayMessage('Password updated successfully');
    } catch (error) {
      displayMessage('Error updating password: ' + error.message);
    } finally {
      setIsLoading(false);
      setPasswordData({oldPassword:'', newPassword:''});
    }
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

  // Effects
  useEffect(() => { fetchProjects(); }, []);

  useEffect(() => { 
    if (project !== null) {
      const loadDevelopers = async () => {
        setIsLoading(true);
        await fetchDevelopers();
        setIsLoading(false);
      };
      loadDevelopers();
    }
  }, [project]);

  return (
    <div className="flex h-screen bg-[#1a1a1a] text-white">
      <Sidebar isMobileOpen={isMobileOpen} closeMobile={() => setIsMobileOpen(false)}/>
      
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto flex flex-col min-h-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Hello {formData.nombre},</h1>
            <p className="text-gray-400 text-sm">{today}</p>
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
                {/* Form fields */}
                <div>
                  <label className="text-sm text-gray-400">Name</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    readOnly={!editMode}
                    className={`w-full p-2 rounded-lg ${editMode ? 'bg-[#333]' : 'bg-[#1a1a1a]'} text-white`}
                  />
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleInputChange}
                    readOnly={!editMode}
                    className={`w-full p-2 rounded-lg ${editMode ? 'bg-[#333]' : 'bg-[#1a1a1a]'} text-white`}
                  />
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Phone</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    readOnly={!editMode}
                    className={`w-full p-2 rounded-lg ${editMode ? 'bg-[#333]' : 'bg-[#1a1a1a]'} text-white`}
                  />
                </div>

                {/* Password change */}
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

                {/* Action buttons */}
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

            {/* Projects and developers section - Show projects assigned to the developer */}
            <div className="flex-1 flex flex-col gap-6">
              <div className="bg-[#2b2b2b] rounded-2xl p-6 shadow-md">
                <h3 className="text-xl font-semibold mb-4">My Projects</h3>
                <div className="space-y-3 max-h-56 overflow-y-auto">
                  {project !== null ? (
                    <div key={project.id || project.id_proyecto} className="bg-[#1a1a1a] p-3 rounded-lg">
                      <div className="font-semibold">{project.nombre || project.name || `Project ${project.id || project.id_proyecto}`}</div>
                      <div className="text-sm text-gray-400">
                        {project.descripcion || project.description || 'No description'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-center py-4">You are not assigned to any project</div>
                  )}
                </div>
              </div>

              {/* Developers - Show users assigned to the project */}
              <div className="bg-[#2b2b2b] rounded-2xl p-6 shadow-md flex-1">
                <h3 className="text-xl font-semibold mb-4">My Developers</h3>
                <div className="space-y-3 h-[500px] overflow-y-auto">
                  {developers.length > 0 ? (
                    developers.map((user) => (
                      <div key={user.id || user.id_usuario} className="bg-[#1a1a1a] p-3 rounded-lg">
                        <div className="font-semibold">{user.nombre || user.name || `User ${user.id || user.id_usuario}`}</div>
                        <div className="text-sm text-gray-400">
                          {user.correo || user.email || 'No email'}
                        </div>
                        <div className="text-sm text-gray-400">
                          {user.telefono || user.phone || 'No phone'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-center py-4">
                      {project !== null ? 'No other developers assigned to this project' : 'You are not assigned to any project'}
                    </div>
                  )}
                </div>
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

export default ProfileDev;