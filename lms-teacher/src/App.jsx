import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';

import AddEmployee from './components/AddEmployee';
import AddMachine from './components/AddMachine';
import AddTour from './components/AddMaterial';
import ClassManagement from './components/ClassManagement';
import ClassResources from './components/ClassResources';
import EmployeeList from './components/EmployeeList';
import LoginSignup from './components/loginsingup';
import MachineList from './components/MachineList';
import MaterialList from './components/MaterialList';
import React from 'react';
import Sidebar from './components/Sidebar';

const App = () => {
  const location = useLocation();
  const hideSidebarRoutes = ['/', '/']; // Routes where Sidebar should not appear

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Conditionally render Sidebar based on the current route */}
        {!hideSidebarRoutes.includes(location.pathname) && <Sidebar />}
        <div className={`main-content ${!hideSidebarRoutes.includes(location.pathname) ? 'col-md-9' : 'col-md-12'}`}>
          <Routes>
           
            <Route path="/add-material" element={<AddTour />} />
            <Route path="/add-resources" element={<ClassResources />} />
            <Route path="/List-machine" element={<MachineList />} />
            <Route path="/List-material" element={<MaterialList/>} />
            <Route path="/Add-employee" element={<AddEmployee />} />
            <Route path="/list-employee" element={<EmployeeList />} />
            <Route path="/class-management" element={< ClassManagement />} />
          </Routes>
          
        </div>
        <Routes>
            <Route path="/" element={<LoginSignup />} />
          </Routes>
      </div>
    </div>
  );
};

const AppWrapper = () => {
  return (
    <Router>
      <App />
    </Router>
  );
};

export default AppWrapper;
