# GatePass Manager

## Current State
New project with no existing application files.

## Requested Changes (Diff)

### Add
- Gate pass request form (student/visitor submits name, ID, purpose, destination, expected return time)
- Admin dashboard to approve/reject gate pass requests
- Security guard dashboard to mark entry/exit of pass holders
- Pass list with status (Pending, Approved, Rejected, Exited, Returned)
- Entry/exit log with timestamps
- Role-based access: Admin, Security Guard, Student/Visitor

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend: Gate pass CRUD with statuses, role-based authorization (admin, guard, student)
2. Backend: Entry/exit log recording with timestamps
3. Frontend: Login/role-based routing
4. Frontend: Student/Visitor pass request form
5. Frontend: Admin dashboard - view all passes, approve/reject
6. Frontend: Security guard dashboard - scan/search pass, mark entry/exit
7. Frontend: Pass history/log view
