"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  HISTORICAL_REQUESTS,
  type MockRequest,
  type RequestCategoryId,
  type RequestStatus,
} from "./request-schema";

const STORAGE_KEY = "royal-college.mock-requests.v1";
const STORAGE_EVENT = "royal-college:requests-updated";

function cloneHistoricalRequests(): MockRequest[] {
  return HISTORICAL_REQUESTS.map((request) => ({
    ...request,
    requester: { ...request.requester },
    fields: request.fields.map((field) => ({ ...field })),
    attachment: request.attachment ? { ...request.attachment } : undefined,
    progress: [...request.progress],
  }));
}

function isRequestStatus(value: unknown): value is RequestStatus {
  return (
    value === "pending" ||
    value === "needs_information" ||
    value === "approved" ||
    value === "rejected"
  );
}

function isRequestCategory(value: unknown): value is RequestCategoryId | "legacy" {
  return (
    value === "exam" ||
    value === "certificate" ||
    value === "training" ||
    value === "completion" ||
    value === "legacy"
  );
}

function isStoredRequest(value: unknown): value is MockRequest {
  if (!value || typeof value !== "object") return false;
  const request = value as Partial<MockRequest>;
  const requester = request.requester as Partial<MockRequest["requester"]> | undefined;
  const attachment = request.attachment as Partial<NonNullable<MockRequest["attachment"]>> | undefined;
  return (
    typeof request.id === "string" &&
    isRequestCategory(request.categoryId) &&
    typeof request.typeLabel === "string" &&
    typeof request.title === "string" &&
    typeof request.displayDate === "string" &&
    typeof request.createdAt === "string" &&
    typeof request.updatedAt === "string" &&
    isRequestStatus(request.status) &&
    typeof requester?.memberId === "string" &&
    typeof requester.name === "string" &&
    typeof requester.email === "string" &&
    Array.isArray(request.fields) &&
    request.fields.every(
      (field) =>
        Boolean(field) &&
        typeof field.id === "string" &&
        typeof field.label === "string" &&
        typeof field.value === "string",
    ) &&
    Array.isArray(request.progress) &&
    request.progress.every((progress) => typeof progress === "string") &&
    (!attachment ||
      (typeof attachment.name === "string" &&
        typeof attachment.type === "string" &&
        typeof attachment.size === "number" &&
        typeof attachment.lastModified === "number"))
  );
}

function mergeHistoricalRequests(storedRequests: MockRequest[]) {
  const storedIds = new Set(storedRequests.map((request) => request.id));
  const missingHistorical = cloneHistoricalRequests().filter(
    (request) => !storedIds.has(request.id),
  );
  return [...storedRequests, ...missingHistorical].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

function readStoredRequests(): MockRequest[] {
  const serialized = window.localStorage.getItem(STORAGE_KEY);
  if (!serialized) return cloneHistoricalRequests();

  const parsed: unknown = JSON.parse(serialized);
  if (!Array.isArray(parsed) || !parsed.every(isStoredRequest)) {
    throw new Error("รูปแบบข้อมูลคำร้องที่บันทึกไว้ไม่ถูกต้อง");
  }
  return mergeHistoricalRequests(parsed);
}

export function useRequestStore() {
  const [requests, setRequests] = useState<MockRequest[]>(cloneHistoricalRequests);
  const requestsRef = useRef(requests);
  const [storageError, setStorageError] = useState("");
  const [isReady, setIsReady] = useState(false);

  const reload = useCallback(() => {
    try {
      const storedRequests = readStoredRequests();
      requestsRef.current = storedRequests;
      setRequests(storedRequests);
      setStorageError("");
    } catch {
      const fallbackRequests = cloneHistoricalRequests();
      requestsRef.current = fallbackRequests;
      setRequests(fallbackRequests);
      setStorageError(
        "ไม่สามารถอ่านข้อมูลคำร้องที่บันทึกไว้ได้ กรุณาลองใหม่อีกครั้ง",
      );
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    // Hydrate the client-only mock store after the server-compatible seed render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
    window.addEventListener("storage", reload);
    window.addEventListener(STORAGE_EVENT, reload);
    return () => {
      window.removeEventListener("storage", reload);
      window.removeEventListener(STORAGE_EVENT, reload);
    };
  }, [reload]);

  const persist = useCallback((nextRequests: MockRequest[]) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRequests));
      setStorageError("");
      window.dispatchEvent(new Event(STORAGE_EVENT));
    } catch {
      setStorageError(
        "บันทึกข้อมูลลงเครื่องไม่สำเร็จ การเปลี่ยนแปลงนี้อาจหายไปเมื่อรีเฟรชหน้า",
      );
    }
  }, []);

  const addRequest = useCallback(
    (request: MockRequest) => {
      const next = [request, ...requestsRef.current];
      requestsRef.current = next;
      setRequests(next);
      persist(next);
    },
    [persist],
  );

  const updateRequest = useCallback(
    (requestId: string, updater: (request: MockRequest) => MockRequest) => {
      const next = requestsRef.current.map((request) =>
        request.id === requestId ? updater(request) : request,
      );
      requestsRef.current = next;
      setRequests(next);
      persist(next);
    },
    [persist],
  );

  return {
    requests,
    storageError,
    isReady,
    addRequest,
    updateRequest,
  };
}
