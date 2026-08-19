"use client";

import { useSyncExternalStore } from "react";

export type MemberNotificationKind = "info" | "success" | "warning";

export interface MemberNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  destination: string;
  kind: MemberNotificationKind;
  isRead: boolean;
}

const STORAGE_KEY = "member_notifications_v1";

export const defaultMemberNotifications: MemberNotification[] = [
  { id: "notice-payment-2569-01", title: "กำหนดชำระค่าลงทะเบียน", message: "กรุณาชำระค่าลงทะเบียนภาคการศึกษาที่ 1/2569 ภายในวันที่ 30 มิถุนายน 2569", createdAt: "2026-06-24T09:30:00+07:00", destination: "/member/finance", kind: "warning", isRead: false },
  { id: "notice-request-2569-02", title: "คำร้องได้รับการพิจารณาแล้ว", message: "คำร้องแก้ไขข้อมูลติดต่อได้รับการพิจารณาเรียบร้อยแล้ว", createdAt: "2026-06-23T14:15:00+07:00", destination: "/member/requests", kind: "success", isRead: false },
  { id: "notice-registration-2569-03", title: "ตรวจสอบข้อมูลการลงทะเบียน", message: "ข้อมูลรายวิชาที่เลือกพร้อมให้ตรวจสอบก่อนยืนยันการลงทะเบียน", createdAt: "2026-06-22T10:00:00+07:00", destination: "/member/registration", kind: "info", isRead: true },
  { id: "notice-schedule-2569-04", title: "ปรับปรุงตารางเรียน", message: "ห้องเรียนรายวิชาองค์ความรู้ทางเภสัชบำบัดเฉพาะทางมีการเปลี่ยนแปลง", createdAt: "2026-06-20T16:45:00+07:00", destination: "/member/schedule", kind: "warning", isRead: true },
  { id: "notice-result-2569-05", title: "ประกาศผลการประเมิน", message: "ผลการประเมินรายวิชาที่ประกาศแล้วสามารถตรวจสอบได้ในระบบ", createdAt: "2026-06-18T11:20:00+07:00", destination: "/member/results", kind: "success", isRead: true },
];

let snapshot = defaultMemberNotifications;
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) snapshot = JSON.parse(stored) as MemberNotification[];
  } catch {
    snapshot = defaultMemberNotifications;
  }
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  hydrate();
  return snapshot;
}

function update(next: MemberNotification[]) {
  snapshot = next;
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

export function useMemberNotifications() {
  const notifications = useSyncExternalStore(subscribe, getSnapshot, () => defaultMemberNotifications);
  return {
    notifications,
    markRead: (id: string) => update(notifications.map((item) => item.id === id ? { ...item, isRead: true } : item)),
    markAllRead: () => update(notifications.map((item) => ({ ...item, isRead: true }))),
  };
}
