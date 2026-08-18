import { describe, expect, it } from "vitest";

import {
  DEFAULT_ACADEMIC_STUDENTS,
  DEFAULT_ACADEMIC_TEACHERS,
  DEFAULT_COURSE_OFFERINGS,
  DEFAULT_STUDENT_AFFILIATIONS,
  DEFAULT_TEACHER_AFFILIATIONS,
  DEFAULT_TEACHING_ASSIGNMENTS,
} from "./mock-data";
import {
  canTeacherAccessOffering,
  selectInstitutionStudents,
  selectInstitutionTeachers,
  selectTeacherCourseOfferings,
} from "./selectors";

const activeAt = new Date("2026-08-11T00:00:00.000Z");

describe("academic scope selectors", () => {
  it("limits a teacher to effective course assignments", () => {
    const offerings = selectTeacherCourseOfferings(
      DEFAULT_COURSE_OFFERINGS,
      DEFAULT_TEACHING_ASSIGNMENTS,
      "teacher-001",
      activeAt,
    );

    expect(offerings.map((offering) => offering.id)).toEqual([
      "offering-bcp-101",
      "offering-vpt-301",
    ]);
    expect(canTeacherAccessOffering(
      DEFAULT_TEACHING_ASSIGNMENTS,
      "teacher-001",
      "offering-vpt-302",
      activeAt,
    )).toBe(false);
    expect(canTeacherAccessOffering(
      DEFAULT_TEACHING_ASSIGNMENTS,
      "teacher-003",
      "offering-vpt-301",
      activeAt,
    )).toBe(false);
  });

  it("isolates students and teachers by institution", () => {
    const students = selectInstitutionStudents(
      DEFAULT_ACADEMIC_STUDENTS,
      DEFAULT_STUDENT_AFFILIATIONS,
      "org-inst-siriraj",
      activeAt,
    );
    const teachers = selectInstitutionTeachers(
      DEFAULT_ACADEMIC_TEACHERS,
      DEFAULT_TEACHER_AFFILIATIONS,
      "org-inst-siriraj",
      activeAt,
    );

    expect(students.map((student) => student.id)).toEqual([
      "วภท-2568-001",
      "RPC-2569-001",
      "RPC-2569-005",
      "RPC-2569-006",
      "RPC-2569-007",
      "RPC-2569-008",
    ]);
    expect(teachers.map((teacher) => teacher.id)).toEqual(["teacher-001", "teacher-003"]);
  });
});
