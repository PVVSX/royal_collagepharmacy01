"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  DEFAULT_ROLE_ASSIGNMENTS,
  type RoleAssignment,
  validateRoleAssignment,
} from "./role-assignment";

const STORAGE_KEY = "royal-college.mock-role-assignments.v1";
const STORAGE_EVENT = "royal-college:role-assignments-updated";

function cloneDefaults(): RoleAssignment[] {
  return DEFAULT_ROLE_ASSIGNMENTS.map((assignment) => ({ ...assignment }));
}

function isRoleAssignment(value: unknown): value is RoleAssignment {
  if (!value || typeof value !== "object") return false;
  const assignment = value as Partial<RoleAssignment>;
  return (
    typeof assignment.id === "string" &&
    typeof assignment.userId === "string" &&
    typeof assignment.userName === "string" &&
    typeof assignment.email === "string" &&
    (assignment.role === "member" ||
      assignment.role === "staff" ||
      assignment.role === "finance_officer" ||
      assignment.role === "college_president" ||
      assignment.role === "super_admin") &&
    typeof assignment.collegeCode === "string" &&
    typeof assignment.collegeName === "string" &&
    typeof assignment.startsAt === "string" &&
    typeof assignment.endsAt === "string" &&
    typeof assignment.appointedBy === "string"
  );
}

function readAssignments() {
  const serialized = window.localStorage.getItem(STORAGE_KEY);
  if (!serialized) return cloneDefaults();
  const parsed: unknown = JSON.parse(serialized);
  if (!Array.isArray(parsed) || !parsed.every(isRoleAssignment)) {
    throw new Error("รูปแบบข้อมูลวาระไม่ถูกต้อง");
  }
  return parsed;
}

export function useRoleAssignmentStore() {
  const [assignments, setAssignments] = useState<RoleAssignment[]>(cloneDefaults);
  const assignmentsRef = useRef(assignments);
  const [isReady, setIsReady] = useState(false);
  const [storageError, setStorageError] = useState("");

  const reload = useCallback(() => {
    try {
      const next = readAssignments();
      assignmentsRef.current = next;
      setAssignments(next);
      setStorageError("");
    } catch {
      const fallback = cloneDefaults();
      assignmentsRef.current = fallback;
      setAssignments(fallback);
      setStorageError("อ่านข้อมูลวาระไม่สำเร็จ ระบบกำลังใช้ข้อมูลเริ่มต้น");
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
    window.addEventListener("storage", reload);
    window.addEventListener(STORAGE_EVENT, reload);
    return () => {
      window.removeEventListener("storage", reload);
      window.removeEventListener(STORAGE_EVENT, reload);
    };
  }, [reload]);

  const persist = useCallback((next: RoleAssignment[]) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setStorageError("");
      window.dispatchEvent(new Event(STORAGE_EVENT));
    } catch {
      setStorageError("บันทึกข้อมูลวาระไม่สำเร็จ การเปลี่ยนแปลงอาจหายเมื่อรีเฟรช");
    }
  }, []);

  const addAssignment = useCallback((assignment: RoleAssignment) => {
    const validationError = validateRoleAssignment(assignment, assignmentsRef.current);
    if (validationError) return validationError;
    const next = [...assignmentsRef.current, assignment].sort((left, right) =>
      left.startsAt.localeCompare(right.startsAt),
    );
    assignmentsRef.current = next;
    setAssignments(next);
    persist(next);
    return null;
  }, [persist]);

  return { assignments, addAssignment, isReady, storageError };
}
