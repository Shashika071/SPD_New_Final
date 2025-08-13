import React, { useEffect, useState } from 'react';

import StudentDetails from './StudentDetails';
import { api } from '../utils/api';

const TeacherStudents = ({ classes }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await api.get('/teacher/students');
        setStudents(response.data.students);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching students:', error);
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesClass = selectedClass 
      ? student.class_id.toString() === selectedClass 
      : true;
    const matchesSearch = searchTerm 
      ? student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesClass && matchesSearch;
  });

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title mb-0">
                <i className="fas fa-users me-2"></i>
                Student Management
              </h2>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {/* Class Filter */}
                <div className="col-md-6">
                  <label htmlFor="class-filter" className="form-label">
                    <i className="fas fa-filter me-1"></i>
                    Filter by Class
                  </label>
                  <select
                    id="class-filter"
                    className="form-select"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    <option value="">All Classes</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.class_name} - {cls.subject} (Grade {cls.grade})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Filter */}
                <div className="col-md-6">
                  <label htmlFor="search-filter" className="form-label">
                    <i className="fas fa-search me-1"></i>
                    Search Students
                  </label>
                  <input
                    type="text"
                    id="search-filter"
                    className="form-control"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="row mt-3">
                <div className="col-12">
                  <div className="d-flex gap-3">
                    <span className="badge bg-primary fs-6">
                      Total Students: {students.length}
                    </span>
                    <span className="badge bg-info fs-6">
                      Filtered: {filteredStudents.length}
                    </span>
                    {selectedClass && (
                      <span className="badge bg-success fs-6">
                        Class Filter Active
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading students...</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="row">
          {/* Students List */}
          <div className="col-lg-4 col-md-5 mb-4">
            <div className="card h-100">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">
                  <i className="fas fa-list me-2"></i>
                  Students List
                </h5>
                <span className="badge bg-secondary">
                  {filteredStudents.length}
                </span>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush" style={{maxHeight: '600px', overflowY: 'auto'}}>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map(student => (
                      <div
                        key={student.student_id}
                        className={`list-group-item list-group-item-action cursor-pointer ${
                          selectedStudent?.student_id === student.student_id 
                            ? 'active' 
                            : ''
                        }`}
                        onClick={() => setSelectedStudent(student)}
                        style={{cursor: 'pointer'}}
                      >
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0 me-3">
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                                 style={{width: '40px', height: '40px'}}>
                              <span className="fw-bold">
                                {student.student_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="flex-grow-1 min-width-0">
                            <h6 className="mb-1 text-truncate">
                              {student.student_name}
                            </h6>
                            <p className="mb-0 text-muted small text-truncate">
                              <i className="fas fa-envelope me-1"></i>
                              {student.email}
                            </p>
                            {student.phone && (
                              <p className="mb-0 text-muted small text-truncate">
                                <i className="fas fa-phone me-1"></i>
                                {student.phone}
                              </p>
                            )}
                          </div>
                          {selectedStudent?.student_id === student.student_id && (
                            <div className="flex-shrink-0">
                              <i className="fas fa-chevron-right text-white"></i>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="list-group-item text-center py-4">
                      <i className="fas fa-users text-muted fs-1 mb-3"></i>
                      <p className="text-muted mb-0">
                        {searchTerm || selectedClass 
                          ? 'No students match your filters' 
                          : 'No students found'
                        }
                      </p>
                      {(searchTerm || selectedClass) && (
                        <button 
                          className="btn btn-sm btn-outline-primary mt-2"
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedClass('');
                          }}
                        >
                          <i className="fas fa-times me-1"></i>
                          Clear Filters
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Student Details */}
          <div className="col-lg-8 col-md-7">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="fas fa-user-graduate me-2"></i>
                  Student Details
                </h5>
              </div>
              <div className="card-body">
                {selectedStudent ? (
                  <StudentDetails student={selectedStudent} />
                ) : (
                  <div className="text-center py-5">
                    <i className="fas fa-user-plus text-muted" style={{fontSize: '4rem'}}></i>
                    <h4 className="text-muted mt-3">Select a Student</h4>
                    <p className="text-muted">
                      Choose a student from the list to view their detailed information and enrollment history.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherStudents;