import React, { useState } from "react";
import { Bell } from "lucide-react";

const NotificationPanel = () => {
  const [showPanel, setShowPanel] = useState(false);

  const notifications = [
    {
      title: "Notificación 1",
      description: "Descripción...",
      date: "26/05/2025",
      unread: true,
    },
    {
      title: "Notificación 2",
      description: "Descripción...",
      date: "26/05/2025",
      unread: true,
    },
    {
      title: "Notificación 3",
      description: "Descripción...",
      date: "26/05/2025",
      unread: false,
    },
    {
      title: "Notificación 3",
      description: "Descripción...",
      date: "26/05/2025",
      unread: false,
    },
    {
      title: "Notificación 3",
      description: "Descripción...",
      date: "26/05/2025",
      unread: false,
    },
    {
      title: "Notificación 3",
      description: "Descripción...",
      date: "26/05/2025",
      unread: false,
    },
  ];

  return (
    <div className="relative">
      <Bell
        className="text-white cursor-pointer hover:text-red-500"
        onClick={() => setShowPanel(!showPanel)}
      />
      {showPanel && (
        <div className="absolute right-0 mt-6 rounded-lg shadow-lg w-96 z-50 overflow-hidden">
          <div className="bg-[#9e3e2f] px-4 py-2">
            <h4 className="text-white font-bold text-lg">My Notifications</h4>
          </div>
          <div className="bg-[#1a1a1a] max-h-96 overflow-y-auto px-4 py-2 space-y-4">
            {notifications.map((note, index) => (
              <div key={index} className="bg-[#2a2a2a] rounded-lg p-3 relative">
                <div className="flex justify-between items-start">
                  <h5 className="text-sm font-semibold text-white w-4/5 truncate">{note.title}</h5>
                  <span className="text-xs text-gray-400">{note.date}</span>
                </div>
                <p className="text-xs text-white mt-1 line-clamp-2">{note.description}</p>
                {note.unread && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full"></span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;