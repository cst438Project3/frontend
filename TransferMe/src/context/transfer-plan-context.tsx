import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { addMyClass, deleteMyClass, getMyClasses, UserClass } from "@/src/services/user-data";

type TransferPlanContextValue = {
  classes: UserClass[];
  completedCourses: string[];
  loadingClasses: boolean;
  classesError: string;
  addCourse: (course: string, term?: string, grade?: string) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  clearCourses: () => Promise<void>;
  refreshClasses: () => Promise<void>;
};

const TransferPlanContext = createContext<TransferPlanContextValue | undefined>(undefined);

export function TransferPlanProvider({ children }: { children: ReactNode }) {
  const [classes, setClasses] = useState<UserClass[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [classesError, setClassesError] = useState("");

  const refreshClasses = async () => {
    try {
      setLoadingClasses(true);
      setClassesError("");
      const data = await getMyClasses();
      setClasses(data);
    } catch (error) {
      setClassesError(error instanceof Error ? error.message : "Could not load classes");
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  useEffect(() => {
    refreshClasses();
  }, []);

  const addCourse = async (course: string, term?: string, grade?: string) => {
    const trimmed = course.trim();
    if (!trimmed) return;

    try {
      setClassesError("");
      const created = await addMyClass({ courseName: trimmed, term, grade });
      setClasses((prev) => {
        const alreadyExists = prev.some((item) => item.id === created.id);
        if (alreadyExists) return prev;
        return [...prev, created];
      });
    } catch (error) {
      setClassesError(error instanceof Error ? error.message : "Could not save class");
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      setClassesError("");
      await deleteMyClass(id);
      setClasses((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      setClassesError(error instanceof Error ? error.message : "Could not delete class");
    }
  };

  const clearCourses = async () => {
    try {
      setClassesError("");
      await Promise.all(classes.map((item) => deleteMyClass(item.id)));
      setClasses([]);
    } catch (error) {
      setClassesError(error instanceof Error ? error.message : "Could not clear classes");
    }
  };

  const completedCourses = useMemo(() => classes.map((item) => item.courseName), [classes]);

  const value = useMemo(
    () => ({
      classes,
      completedCourses,
      loadingClasses,
      classesError,
      addCourse,
      deleteCourse,
      clearCourses,
      refreshClasses,
    }),
    [classes, completedCourses, loadingClasses, classesError],
  );

  return <TransferPlanContext.Provider value={value}>{children}</TransferPlanContext.Provider>;
}

export function useTransferPlan() {
  const context = useContext(TransferPlanContext);
  if (!context) throw new Error("useTransferPlan must be used within TransferPlanProvider");
  return context;
}
