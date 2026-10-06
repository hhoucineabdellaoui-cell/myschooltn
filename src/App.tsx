import { useState, useEffect, useMemo } from 'react';
import { 
  mockStudents, 
  mockParents, 
  mockTeachers, 
  mockClasses, 
  mockAttendance, 
  mockGrades, 
  mockTimetable, 
  mockCanteenMenu, 
  mockTransportRoutes, 
  mockWhatsAppLogs,
  mockPayments,
  mockTunisianSchools,
  mockHomework
} from './mockData';
import { 
  Student, 
  Parent, 
  Teacher, 
  AttendanceRecord, 
  GradeRecord, 
  PaymentRecord, 
  TransportRoute, 
  WhatsAppMessageLog, 
  Language, 
  UserRole, 
  TabType,
  TunisianSchool,
  TimetableSlot,
  AuthUser,
  ClassRoom,
  HomeworkItem
} from './types';
import { Navbar } from './components/Navbar';
import { WhatsAppModal } from './components/WhatsAppModal';
import { StudentDetailModal } from './components/StudentDetailModal';
import { AuthPortal } from './components/AuthPortal';

// Admin Tabs
import { OverviewTab } from './components/admin/OverviewTab';
import { TunisiaSchoolsTab } from './components/admin/TunisiaSchoolsTab';
import { StudentsTab } from './components/admin/StudentsTab';
import { ParentsTab } from './components/admin/ParentsTab';
import { ClassesTab } from './components/admin/ClassesTab';
import { TeachersTab } from './components/admin/TeachersTab';
import { AttendanceTab } from './components/admin/AttendanceTab';
import { GradesTab } from './components/admin/GradesTab';
import { TimetableTab } from './components/admin/TimetableTab';
import { PaymentsTab } from './components/admin/PaymentsTab';
import { CanteenTab } from './components/admin/CanteenTab';
import { TransportTab } from './components/admin/TransportTab';
import { WhatsAppCenterTab } from './components/admin/WhatsAppCenterTab';

// Parent Portal
import { ParentPortal } from './components/ParentPortal';

// Teacher Portal
import { TeacherPortal } from './components/TeacherPortal';

export default function App() {
  // Localization & Role State
  const [lang, setLang] = useState<Language>('fr');
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('madrasati_auth_user');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  // Tunisian Schools State
  const [schools, setSchools] = useState<TunisianSchool[]>(mockTunisianSchools);
  const [activeSchoolId, setActiveSchoolId] = useState<string>(mockTunisianSchools[0]?.id || 'sch-1');
  const activeSchool = schools.find(s => s.id === activeSchoolId) || schools[0];

  // Application Data State
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('madrasati_students');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return mockStudents;
  });

  const [parents, setParents] = useState<Parent[]>(() => {
    try {
      const saved = localStorage.getItem('madrasati_parents');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return mockParents;
  });

  const [selectedParentId, setSelectedParentId] = useState<string>(() => {
    try {
      const savedUser = localStorage.getItem('madrasati_auth_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u.parentId) return u.parentId;
      }
    } catch (e) {
      console.error(e);
    }
    return mockParents[0]?.id || 'par-1';
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('madrasati_students', JSON.stringify(students));
    } catch (e) {
      console.error(e);
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem('madrasati_parents', JSON.stringify(parents));
    } catch (e) {
      console.error(e);
    }
  }, [parents]);

  // Derived effective parent always synced with parents state
  const effectiveParent = useMemo(() => {
    if (currentUser?.role === 'parent' && currentUser.parentId) {
      const found = parents.find(p => p.id === currentUser.parentId);
      if (found) return found;
    }
    const foundSelected = parents.find(p => p.id === selectedParentId);
    if (foundSelected) return foundSelected;
    return parents[0] || mockParents[0];
  }, [parents, selectedParentId, currentUser]);

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    try {
      const saved = localStorage.getItem('madrasati_teachers');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return mockTeachers;
  });

  useEffect(() => {
    try {
      localStorage.setItem('madrasati_teachers', JSON.stringify(teachers));
    } catch (e) {
      console.error(e);
    }
  }, [teachers]);

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(() => {
    try {
      const savedUser = localStorage.getItem('madrasati_auth_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u.teacherId) return u.teacherId;
      }
    } catch (e) {
      console.error(e);
    }
    return mockTeachers[0]?.id || 'tch-1';
  });

  // Derived effective teacher always synced with teachers state
  const effectiveTeacher = useMemo(() => {
    if (currentUser?.role === 'teacher' && currentUser.teacherId) {
      const found = teachers.find(t => t.id === currentUser.teacherId);
      if (found) return found;
    }
    const foundSelected = teachers.find(t => t.id === selectedTeacherId);
    if (foundSelected) return foundSelected;
    return teachers[0] || mockTeachers[0];
  }, [teachers, selectedTeacherId, currentUser]);

  const [homework, setHomework] = useState<HomeworkItem[]>(() => {
    try {
      const saved = localStorage.getItem('madrasati_homework');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return mockHomework;
  });

  useEffect(() => {
    try {
      localStorage.setItem('madrasati_homework', JSON.stringify(homework));
    } catch (e) {
      console.error(e);
    }
  }, [homework]);

  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    try {
      const saved = localStorage.getItem('madrasati_classes');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return mockClasses;
  });

  useEffect(() => {
    try {
      localStorage.setItem('madrasati_classes', JSON.stringify(classes));
    } catch (e) {
      console.error(e);
    }
  }, [classes]);

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('madrasati_attendance');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return mockAttendance;
  });

  useEffect(() => {
    try {
      localStorage.setItem('madrasati_attendance', JSON.stringify(attendance));
    } catch (e) {
      console.error(e);
    }
  }, [attendance]);

  const [grades, setGrades] = useState<GradeRecord[]>(() => {
    try {
      const saved = localStorage.getItem('madrasati_grades');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return mockGrades;
  });

  useEffect(() => {
    try {
      localStorage.setItem('madrasati_grades', JSON.stringify(grades));
    } catch (e) {
      console.error(e);
    }
  }, [grades]);

  const [payments, setPayments] = useState<PaymentRecord[]>(mockPayments);
  const [timetable, setTimetable] = useState<TimetableSlot[]>(mockTimetable);
  const [canteenMenu] = useState(mockCanteenMenu);
  const [transportRoutes, setTransportRoutes] = useState<TransportRoute[]>(mockTransportRoutes);
  const [whatsappLogs, setWhatsappLogs] = useState<WhatsAppMessageLog[]>(mockWhatsAppLogs);

  // Modals State
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [whatsAppModalData, setWhatsAppModalData] = useState<{
    recipientName: string;
    phone: string;
    defaultMsg: string;
    studentName?: string;
  }>({
    recipientName: '',
    phone: '',
    defaultMsg: '',
    studentName: undefined
  });

  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);

  // Sync HTML document direction & lang
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Open WhatsApp Modal Helper
  const handleOpenWhatsApp = (
    recipientName: string, 
    phone: string, 
    defaultMsg: string, 
    studentName?: string
  ) => {
    setWhatsAppModalData({
      recipientName,
      phone,
      defaultMsg,
      studentName
    });
    setWhatsAppModalOpen(true);
  };

  // Close WhatsApp Modal and log message
  const handleSendWhatsAppLog = (log: WhatsAppMessageLog) => {
    setWhatsappLogs(prev => [log, ...prev]);
  };

  // Student Actions
  const handleAddStudent = (newStudent: Student) => {
    setStudents(prev => [newStudent, ...prev]);
    // Automatically synchronize parent's childrenIds
    if (newStudent.parentId) {
      setParents(prevParents => prevParents.map(parent => {
        if (parent.id === newStudent.parentId) {
          const currentIds = parent.childrenIds || [];
          if (!currentIds.includes(newStudent.id)) {
            return {
              ...parent,
              childrenIds: [...currentIds, newStudent.id]
            };
          }
        }
        return parent;
      }));
    }
  };

  const handleUpdateStudent = (updated: Student) => {
    setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
    // Synchronize parent relationships
    if (updated.parentId) {
      setParents(prevParents => prevParents.map(parent => {
        const currentIds = parent.childrenIds || [];
        if (parent.id === updated.parentId) {
          if (!currentIds.includes(updated.id)) {
            return { ...parent, childrenIds: [...currentIds, updated.id] };
          }
        } else if (currentIds.includes(updated.id)) {
          return { ...parent, childrenIds: currentIds.filter(id => id !== updated.id) };
        }
        return parent;
      }));
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
    // Remove from all parents
    setParents(prev => prev.map(p => ({
      ...p,
      childrenIds: (p.childrenIds || []).filter(id => id !== studentId)
    })));
  };

  // Direct Student-Parent Linker
  const handleLinkStudentToParent = (studentId: string, parentId: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, parentId } : s));
    setParents(prev => prev.map(p => {
      if (p.id === parentId) {
        const current = p.childrenIds || [];
        return current.includes(studentId) ? p : { ...p, childrenIds: [...current, studentId] };
      }
      return p;
    }));
  };

  // Parent Actions
  const handleAddParent = (newParent: Parent) => {
    setParents(prev => [newParent, ...prev]);
    if (newParent.childrenIds && newParent.childrenIds.length > 0) {
      setStudents(prevStudents => prevStudents.map(stu => {
        if (newParent.childrenIds.includes(stu.id)) {
          return { ...stu, parentId: newParent.id };
        }
        return stu;
      }));
    }
  };

  const handleUpdateParent = (updatedParent: Parent) => {
    setParents(prev => prev.map(p => p.id === updatedParent.id ? updatedParent : p));
    if (updatedParent.childrenIds) {
      setStudents(prevStudents => prevStudents.map(stu => {
        if (updatedParent.childrenIds.includes(stu.id)) {
          return { ...stu, parentId: updatedParent.id };
        }
        return stu;
      }));
    }
  };

  const handleDeleteParent = (parentId: string) => {
    setParents(prev => prev.filter(p => p.id !== parentId));
  };

  // Class Actions
  const handleAddClass = (newClass: ClassRoom) => {
    setClasses(prev => [newClass, ...prev]);
  };

  const handleUpdateClass = (updatedClass: ClassRoom) => {
    setClasses(prev => prev.map(c => c.id === updatedClass.id ? updatedClass : c));
    setStudents(prev => prev.map(stu => {
      if (stu.classId === updatedClass.id) {
        return {
          ...stu,
          className: updatedClass.name,
          classNameAr: updatedClass.nameAr
        };
      }
      return stu;
    }));
  };

  const handleDeleteClass = (classId: string, reassignedClassId?: string) => {
    setClasses(prev => prev.filter(c => c.id !== classId));
    if (reassignedClassId) {
      const targetClass = classes.find(c => c.id === reassignedClassId);
      if (targetClass) {
        setStudents(prev => prev.map(stu => {
          if (stu.classId === classId) {
            return {
              ...stu,
              classId: targetClass.id,
              className: targetClass.name,
              classNameAr: targetClass.nameAr
            };
          }
          return stu;
        }));
      }
    } else {
      setStudents(prev => prev.map(stu => {
        if (stu.classId === classId) {
          return {
            ...stu,
            classId: '',
            className: 'Non assigné',
            classNameAr: 'غير معين'
          };
        }
        return stu;
      }));
    }
  };

  // Teacher Actions
  const handleAddTeacher = (newTeacher: Teacher) => {
    setTeachers(prev => [newTeacher, ...prev]);
  };

  const handleUpdateTeacher = (updatedTeacher: Teacher) => {
    setTeachers(prev => prev.map(t => t.id === updatedTeacher.id ? updatedTeacher : t));
  };

  const handleDeleteTeacher = (teacherId: string) => {
    setTeachers(prev => prev.filter(t => t.id !== teacherId));
  };

  // Tunisian Schools Actions
  const handleAddNewSchool = (newSchool: TunisianSchool) => {
    setSchools(prev => [newSchool, ...prev]);
  };

  const handleUpdateSchool = (updatedSchool: TunisianSchool) => {
    setSchools(prev => prev.map(s => s.id === updatedSchool.id ? updatedSchool : s));
  };

  const handleDeleteSchool = (schoolId: string) => {
    setSchools(prev => prev.filter(s => s.id !== schoolId));
    if (activeSchoolId === schoolId) {
      const remaining = schools.filter(s => s.id !== schoolId);
      if (remaining.length > 0) {
        setActiveSchoolId(remaining[0].id);
      }
    }
  };

  // Timetable Actions
  const handleAddTimetableSlot = (newSlot: TimetableSlot) => {
    setTimetable(prev => [newSlot, ...prev]);
  };

  const handleUpdateTimetableSlot = (updatedSlot: TimetableSlot) => {
    setTimetable(prev => prev.map(s => s.id === updatedSlot.id ? updatedSlot : s));
  };

  const handleDeleteTimetableSlot = (slotId: string) => {
    setTimetable(prev => prev.filter(s => s.id !== slotId));
  };

  // Attendance Actions
  const handleUpdateAttendance = (updated: AttendanceRecord) => {
    setAttendance(prev => {
      const idx = prev.findIndex(a => a.studentId === updated.studentId && a.date === updated.date);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [updated, ...prev];
    });
  };

  const handleBatchUpdateAttendance = (updatedList: AttendanceRecord[]) => {
    setAttendance(prev => {
      const next = [...prev];
      updatedList.forEach(item => {
        const idx = next.findIndex(a => a.studentId === item.studentId && a.date === item.date);
        if (idx >= 0) {
          next[idx] = item;
        } else {
          next.unshift(item);
        }
      });
      return next;
    });
  };

  // Grades Actions
  const handleAddGrade = (newGrade: GradeRecord) => {
    setGrades(prev => {
      const idx = prev.findIndex(g => g.id === newGrade.id || (g.studentId === newGrade.studentId && g.subject === newGrade.subject && g.examType === newGrade.examType));
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = newGrade;
        return next;
      }
      return [newGrade, ...prev];
    });

    setStudents(prev => prev.map(s => {
      if (s.id === newGrade.studentId) {
        const otherGrades = grades.filter(g => g.studentId === s.id && g.id !== newGrade.id && !(g.subject === newGrade.subject && g.examType === newGrade.examType));
        const allGrades = [...otherGrades, newGrade];
        const sum = allGrades.reduce((acc, curr) => acc + (typeof curr.score === 'number' ? curr.score : 0), 0);
        const avg = allGrades.length > 0 ? Number((sum / allGrades.length).toFixed(2)) : 14;
        return { ...s, averageGrade: isNaN(avg) ? 14 : avg };
      }
      return s;
    }));
  };

  const handleBatchAddGrades = (newGrades: GradeRecord[]) => {
    setGrades(prev => {
      const next = [...prev];
      newGrades.forEach(item => {
        const idx = next.findIndex(g => g.id === item.id || (g.studentId === item.studentId && g.subject === item.subject && g.examType === item.examType));
        if (idx >= 0) {
          next[idx] = item;
        } else {
          next.unshift(item);
        }
      });
      return next;
    });

    setStudents(prev => prev.map(s => {
      const studentNewGrades = newGrades.filter(g => g.studentId === s.id);
      if (studentNewGrades.length === 0) return s;
      const otherGrades = grades.filter(g => g.studentId === s.id && !studentNewGrades.some(ng => ng.id === g.id || (ng.subject === g.subject && ng.examType === g.examType)));
      const allGrades = [...otherGrades, ...studentNewGrades];
      if (allGrades.length === 0) return s;
      const sum = allGrades.reduce((acc, curr) => acc + (typeof curr.score === 'number' ? curr.score : 0), 0);
      const avg = Number((sum / allGrades.length).toFixed(2));
      return { ...s, averageGrade: isNaN(avg) ? 14 : avg };
    }));
  };

  // Payment Actions
  const handleUpdatePayment = (updated: PaymentRecord) => {
    setPayments(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleAddPayment = (newPayment: PaymentRecord) => {
    setPayments(prev => [newPayment, ...prev]);
  };

  // Transport Actions
  const handleUpdateRoute = (updatedRoute: TransportRoute) => {
    setTransportRoutes(prev => prev.map(r => r.id === updatedRoute.id ? updatedRoute : r));
  };

  // Auth Handlers
  const handleLoginSuccess = (user: AuthUser, parentData?: Parent, teacherData?: Teacher) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    if (user.role === 'parent' && user.parentId) {
      setSelectedParentId(user.parentId);
      if (parentData) {
        setParents(prev => {
          const exists = prev.some(p => p.id === parentData.id);
          if (!exists) return [parentData, ...prev];
          return prev.map(p => p.id === parentData.id ? { ...p, ...parentData } : p);
        });
      }
    } else if (user.role === 'teacher' && user.teacherId) {
      setSelectedTeacherId(user.teacherId);
      if (teacherData) {
        setTeachers(prev => {
          const exists = prev.some(t => t.id === teacherData.id);
          if (!exists) return [teacherData, ...prev];
          return prev.map(t => t.id === teacherData.id ? { ...t, ...teacherData } : t);
        });
      }
    }
    try {
      localStorage.setItem('madrasati_auth_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  };

  // Teacher Space Handlers
  const handleAddHomework = (newHw: HomeworkItem) => {
    setHomework(prev => [newHw, ...prev]);
  };

  const handleDeleteHomework = (hwId: string) => {
    setHomework(prev => prev.filter(h => h.id !== hwId));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('madrasati_auth_user');
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangeRole = (newRole: UserRole) => {
    if (currentUser && currentUser.role !== newRole) {
      setCurrentRole(newRole);
      handleLogout();
    } else {
      setCurrentRole(newRole);
    }
  };

  // If user is not authenticated, show the authentication portal
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <AuthPortal 
          schools={schools}
          activeSchoolId={activeSchoolId}
          students={students}
          parents={parents}
          teachers={teachers}
          lang={lang}
          onToggleLang={() => setLang(prev => prev === 'fr' ? 'ar' : 'fr')}
          onLoginSuccess={handleLoginSuccess}
          initialRole={currentRole}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        lang={lang}
        onToggleLang={() => setLang(prev => prev === 'fr' ? 'ar' : 'fr')}
        role={currentRole}
        onChangeRole={handleChangeRole}
        selectedParent={effectiveParent}
        parents={parents}
        onSelectParent={p => setSelectedParentId(p.id)}
        selectedTeacher={effectiveTeacher}
        teachers={teachers}
        onSelectTeacher={t => setSelectedTeacherId(t.id)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeSchoolName={lang === 'ar' ? activeSchool.nameAr : activeSchool.name}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenQuickBroadcast={() => handleOpenWhatsApp(
          lang === 'ar' ? 'أولياء أمور المدارس التونسية' : 'Tous les parents - Écoles Tunisie',
          '+21698123456',
          lang === 'ar' ? 'مرحبا بكم في منصة MySchoolTN...' : 'Bonjour chers parents, bienvenue sur la plateforme MySchoolTN...'
        )}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentRole === 'teacher' ? (
          <TeacherPortal
            currentTeacher={effectiveTeacher}
            allTeachers={teachers}
            classes={classes}
            students={students}
            parents={parents}
            attendance={attendance}
            grades={grades}
            homework={homework}
            lang={lang}
            onOpenWhatsApp={handleOpenWhatsApp}
            onUpdateAttendance={handleUpdateAttendance}
            onBatchUpdateAttendance={handleBatchUpdateAttendance}
            onAddGrade={handleAddGrade}
            onBatchAddGrades={handleBatchAddGrades}
            onAddHomework={handleAddHomework}
            onDeleteHomework={handleDeleteHomework}
          />
        ) : currentRole === 'parent' ? (
          <ParentPortal
            currentParent={effectiveParent}
            allParents={parents}
            students={students}
            grades={grades}
            attendance={attendance}
            payments={payments}
            timetable={timetable}
            canteenMenu={canteenMenu}
            transportRoutes={transportRoutes}
            homework={homework}
            lang={lang}
            onOpenWhatsApp={handleOpenWhatsApp}
            onLinkChild={handleLinkStudentToParent}
            onUpdateAttendance={handleUpdateAttendance}
          />
        ) : (
          <div>
            {activeTab === 'overview' && (
              <OverviewTab
                students={students}
                parents={parents}
                teachers={teachers}
                payments={payments}
                attendance={attendance}
                transportRoutes={transportRoutes}
                whatsappLogs={whatsappLogs}
                lang={lang}
                onNavigateTab={setActiveTab}
                onOpenWhatsApp={handleOpenWhatsApp}
              />
            )}

            {activeTab === 'tunisia_schools' && (
              <TunisiaSchoolsTab
                schools={schools}
                activeSchoolId={activeSchoolId}
                onSelectSchool={setActiveSchoolId}
                lang={lang}
                onOpenWhatsApp={(name, phone, defaultMsg) => handleOpenWhatsApp(name, phone, defaultMsg || '')}
                onAddNewSchool={handleAddNewSchool}
                onUpdateSchool={handleUpdateSchool}
                onDeleteSchool={handleDeleteSchool}
              />
            )}

            {activeTab === 'students' && (
              <StudentsTab
                students={students}
                parents={parents}
                classes={classes}
                lang={lang}
                onSelectStudent={setSelectedStudentForDetail}
                onOpenWhatsApp={handleOpenWhatsApp}
                onAddStudent={handleAddStudent}
                onUpdateStudent={handleUpdateStudent}
                onDeleteStudent={handleDeleteStudent}
              />
            )}

            {activeTab === 'classes' && (
              <ClassesTab
                classes={classes}
                students={students}
                teachers={teachers}
                parents={parents}
                lang={lang}
                onAddClass={handleAddClass}
                onUpdateClass={handleUpdateClass}
                onDeleteClass={handleDeleteClass}
                onOpenWhatsApp={handleOpenWhatsApp}
                onNavigateToStudents={() => {
                  setActiveTab('students');
                }}
              />
            )}

            {activeTab === 'parents' && (
              <ParentsTab
                parents={parents}
                students={students}
                lang={lang}
                onOpenWhatsApp={handleOpenWhatsApp}
                onAddParent={handleAddParent}
                onUpdateParent={handleUpdateParent}
                onDeleteParent={handleDeleteParent}
                onLinkStudentToParent={handleLinkStudentToParent}
              />
            )}

            {activeTab === 'teachers' && (
              <TeachersTab
                teachers={teachers}
                lang={lang}
                onOpenWhatsApp={(recipientName, phone, defaultMsg) => handleOpenWhatsApp(recipientName, phone, defaultMsg)}
                onAddTeacher={handleAddTeacher}
                onUpdateTeacher={handleUpdateTeacher}
                onDeleteTeacher={handleDeleteTeacher}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceTab
                students={students}
                parents={parents}
                classes={classes}
                attendance={attendance}
                lang={lang}
                onUpdateAttendance={handleUpdateAttendance}
                onOpenWhatsApp={handleOpenWhatsApp}
              />
            )}

            {activeTab === 'grades' && (
              <GradesTab
                students={students}
                parents={parents}
                classes={classes}
                grades={grades}
                lang={lang}
                onAddGrade={handleAddGrade}
                onOpenWhatsApp={handleOpenWhatsApp}
              />
            )}

            {activeTab === 'timetable' && (
              <TimetableTab
                classes={classes}
                timetable={timetable}
                lang={lang}
                onOpenWhatsApp={(recipientName, phone, defaultMsg) => handleOpenWhatsApp(recipientName, phone, defaultMsg)}
                onAddSlot={handleAddTimetableSlot}
                onUpdateSlot={handleUpdateTimetableSlot}
                onDeleteSlot={handleDeleteTimetableSlot}
              />
            )}

            {activeTab === 'payments' && (
              <PaymentsTab
                payments={payments}
                students={students}
                parents={parents}
                lang={lang}
                onUpdatePayment={handleUpdatePayment}
                onAddPayment={handleAddPayment}
                onOpenWhatsApp={handleOpenWhatsApp}
              />
            )}

            {activeTab === 'canteen' && (
              <CanteenTab
                menu={canteenMenu}
                students={students}
                lang={lang}
                onOpenWhatsApp={(recipientName, phone, defaultMsg) => handleOpenWhatsApp(recipientName, phone, defaultMsg)}
              />
            )}

            {activeTab === 'transport' && (
              <TransportTab
                routes={transportRoutes}
                lang={lang}
                onUpdateRoute={handleUpdateRoute}
                onOpenWhatsApp={(recipientName, phone, defaultMsg) => handleOpenWhatsApp(recipientName, phone, defaultMsg)}
              />
            )}

            {activeTab === 'whatsapp_center' && (
              <WhatsAppCenterTab
                parents={parents}
                students={students}
                whatsappLogs={whatsappLogs}
                lang={lang}
                onSendMessage={handleSendWhatsAppLog}
              />
            )}
          </div>
        )}
      </main>

      {/* Global WhatsApp Message Modal */}
      <WhatsAppModal
        isOpen={whatsAppModalOpen}
        onClose={() => setWhatsAppModalOpen(false)}
        recipientName={whatsAppModalData.recipientName}
        recipientPhone={whatsAppModalData.phone}
        defaultMessage={whatsAppModalData.defaultMsg}
        studentName={whatsAppModalData.studentName}
        lang={lang}
        onMessageSent={(log) => {
          handleSendWhatsAppLog({
            id: `wlog-${Date.now()}`,
            recipientName: log.recipientName,
            phone: log.phone,
            studentName: log.studentName,
            contentFr: log.message,
            contentAr: log.message,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            status: 'sent',
            type: 'custom'
          });
        }}
      />

      {/* Global Student Profile Modal */}
      {selectedStudentForDetail && (
        <StudentDetailModal
          student={selectedStudentForDetail}
          parent={parents.find(p => p.id === selectedStudentForDetail.parentId)}
          grades={grades.filter(g => g.studentId === selectedStudentForDetail.id)}
          attendance={attendance.filter(a => a.studentId === selectedStudentForDetail.id)}
          payments={payments.filter(p => p.studentId === selectedStudentForDetail.id)}
          lang={lang}
          onClose={() => setSelectedStudentForDetail(null)}
          onOpenWhatsApp={handleOpenWhatsApp}
        />
      )}
    </div>
  );
}
