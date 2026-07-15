'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiPost } from '@/lib/api';

export interface Employee {
  id: string;
  name: string;
  department: string;
  joinedAt: string;
  coursesCompleted: string[];
  scores: Record<string, number>;
  lastActivity: string;
}

interface EmployeeContextType {
  currentEmployee: Employee | null;
  allEmployees: Employee[];
  isRegistered: boolean;
  registerEmployee: (name: string, department: string) => void;
  completeCourse: (courseId: string, score: number) => void;
  logout: () => void;
}

const EmployeeContext = createContext<EmployeeContextType | null>(null);

export function EmployeeProvider({ children }: { children: React.ReactNode }) {
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('isms-employees');
    const currentId = localStorage.getItem('isms-current-employee');
    if (stored) {
      const employees: Employee[] = JSON.parse(stored);
      setAllEmployees(employees);
      if (currentId) {
        setCurrentEmployee(employees.find(e => e.id === currentId) || null);
      }
    }
    setLoaded(true);
  }, []);

  const save = useCallback((employees: Employee[], current: Employee | null) => {
    localStorage.setItem('isms-employees', JSON.stringify(employees));
    if (current) {
      localStorage.setItem('isms-current-employee', current.id);
    }
  }, []);

  const registerEmployee = useCallback((name: string, department: string) => {
    const newEmployee: Employee = {
      id: `emp-${Date.now()}`,
      name,
      department,
      joinedAt: new Date().toISOString().split('T')[0],
      coursesCompleted: [],
      scores: {},
      lastActivity: new Date().toISOString().split('T')[0],
    };
    const updated = [...allEmployees, newEmployee];
    setAllEmployees(updated);
    setCurrentEmployee(newEmployee);
    save(updated, newEmployee);
  }, [allEmployees, save]);

  const completeCourse = useCallback((courseId: string, score: number) => {
    if (!currentEmployee) return;
    const updated = currentEmployee;
    if (!updated.coursesCompleted.includes(courseId)) {
      updated.coursesCompleted.push(courseId);
    }
    updated.scores[courseId] = score;
    updated.lastActivity = new Date().toISOString().split('T')[0];
    setCurrentEmployee({ ...updated });
    const all = allEmployees.map(e => e.id === updated.id ? { ...updated } : e);
    setAllEmployees(all);
    save(all, updated);
    // Persist to backend (fire-and-forget — localStorage remains the source of truth for UI)
    apiPost('/awareness/complete', {
      employeeName: currentEmployee.name,
      department: currentEmployee.department,
      courseId,
      score,
    }).catch(() => {/* silent fail — progress already saved locally */});
  }, [currentEmployee, allEmployees, save]);

  const logout = useCallback(() => {
    setCurrentEmployee(null);
    localStorage.removeItem('isms-current-employee');
  }, []);

  if (!loaded) return null;

  return (
    <EmployeeContext.Provider value={{
      currentEmployee,
      allEmployees,
      isRegistered: !!currentEmployee,
      registerEmployee,
      completeCourse,
      logout,
    }}>
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployee() {
  const ctx = useContext(EmployeeContext);
  if (!ctx) throw new Error('useEmployee must be used within EmployeeProvider');
  return ctx;
}
