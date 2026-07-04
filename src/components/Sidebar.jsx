import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Image as ImageIcon,
  Music,
  Video,
  Users,
  Shield,
} from "lucide-react";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <Shield className="logo-icon" size={28} />
        <span className="logo-text text-gradient">Media Harbor</span>
      </div>

      <div className="nav-links">
        <NavLink
          to="/"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <Home className="icon" size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/image"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <ImageIcon className="icon" size={20} />
          <span>Image Studio</span>
        </NavLink>

        <NavLink
          to="/audio"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <Music className="icon" size={20} />
          <span>Audio Studio</span>
        </NavLink>

        <NavLink
          to="/video"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <Video className="icon" size={20} />
          <span>Video Studio</span>
        </NavLink>
      </div>

      <div className="sidebar-footer">
        <p>UAS Sistem Multimedia &copy; 2026</p>
      </div>
    </nav>
  );
};

export default Sidebar;
