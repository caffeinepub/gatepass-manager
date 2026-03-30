import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;

export type PassStatus = "Pending" | "Approved" | "Rejected" | "Exited" | "Returned";
export type UserRole = "admin" | "user" | "guest";

export interface GatePass {
    id: bigint;
    studentName: string;
    studentId: string;
    rollNumber: string;
    department: string;
    purpose: string;
    destination: string;
    expectedReturnTime: string;
    note: string;
    status: PassStatus;
    requestedAt: bigint;
    approvedAt: Option<bigint>;
    exitedAt: Option<bigint>;
    returnedAt: Option<bigint>;
    rejectionReason: Option<string>;
    requester: Principal;
}

export interface LogEntry {
    passId: bigint;
    studentName: string;
    rollNumber: string;
    action: string;
    timestamp: bigint;
}

export interface Stats {
    total: bigint;
    pending: bigint;
    approved: bigint;
    rejected: bigint;
    exited: bigint;
    returned: bigint;
}

export interface backendInterface {
    initializeAccessControl(secret: string): Promise<void>;
    approvePass(id: bigint): Promise<void>;
    rejectPass(id: bigint, reason: string): Promise<void>;
    markExit(id: bigint): Promise<void>;
    markReturn(id: bigint): Promise<void>;
    requestPass(studentName: string, studentId: string, rollNumber: string, department: string, purpose: string, destination: string, expectedReturnTime: string, note: string): Promise<bigint>;
    getAllPasses(): Promise<GatePass[]>;
    getMyPasses(): Promise<GatePass[]>;
    getPassById(id: bigint): Promise<Option<GatePass>>;
    getLog(): Promise<LogEntry[]>;
    getStats(): Promise<Stats>;
    getCallerUserRole(): Promise<UserRole>;
    isCallerAdmin(): Promise<boolean>;
    assignRole(user: Principal, role: UserRole): Promise<void>;
}
