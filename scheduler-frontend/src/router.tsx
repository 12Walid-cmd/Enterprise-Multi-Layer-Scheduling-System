import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layout/RootLayout";

// Groups
import GroupsList from "./pages/org/groups/GroupsList";

// Teams
import TeamsList from "./pages/org/teams/TeamsList";

// Team Role Types
import TeamRoleTypesList from "./pages/org/roles/team-types/TeamRoleTypesList";

// Global Role Types
import GlobalRoleTypesList from "./pages/org/roles/global-types/GlobalRoleTypesList";



// Users
import UsersList from "./pages/user/UsersList";
import CreateUserPage from "./pages/user/CreateUserPage";
import EditUserPage from "./pages/user/EditUserPage";
import UserDetail from "./pages/user/UserDetail";

import UserScopePage from "./pages/user/UserScopePage";
import UserPermissionsPage from "./pages/user/UserPermissionsPage";

// Sub-teams
import SubTeamList from "./pages/org/sub-teams/SubTeamList";
// Domains
import DomainList from "./pages/org/domains/DomainList";







// Rotations
import RotationsList from "./pages/rotation/RotationsList";
import CreateRotationPage from "./pages/rotation/CreateRotationPage";
import RotationDetail from "./pages/rotation/RotationDetail";
import EditRotationPage from "./pages/rotation/EditRotationPage";
import RotationMembersPage from "./pages/rotation/RotationMembersPage";
import RotationTiersPage from "./pages/rotation/RotationTiersPage";


// Schedule
import ScheduleListPage from "./pages/schedule/ScheduleListPage";
import SchedulePage from "./pages/schedule/SchedulePage";
import RotationRulesPage from "./pages/rotation/RotationRulesPage";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";

// Leaves
import MyLeavesPage from "./pages/leave/MyLeavesPage";
import CreateLeavePage from "./pages/leave/CreateLeavePage";
import ApprovalsPage from "./pages/leave/ApprovalsPage";

// Holidays
import HolidayPage from "./pages/holiday/HolidayPage";

// Audit Logs
import AuditLogPage from "./pages/audit/AuditLogPage";

// Permissions and Roles
import RoleManagementPage from "./pages/org/roles/RoleManagementPage";
import PermissionManagementPage from "./pages/org/permissions/PermissionManagementPage";
import GlobalRolePermissionPage from "./pages/org/roles/GlobalRolePermissionPage";



export const router = createBrowserRouter([
  { path: "/login", element: <Login />, },
  { path: "/register", element: <Register />, },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      // Groups
      { index: true, element: <GroupsList /> },
      { path: "groups", element: <GroupsList /> },

      // Teams
      { path: "teams", element: <TeamsList /> },
      { path: "sub-teams", element: <SubTeamList /> },
      // Domains
      { path: "domains", element: <DomainList /> },


      // Team Role Types
      { path: "roles/team-types", element: <TeamRoleTypesList /> },

      // Global Role Types
      { path: "roles/global-types", element: <GlobalRoleTypesList /> },



      // Permissions and Roles
      { path: "roles/global-permissions/:roleId", element: <GlobalRolePermissionPage /> },
      { path: "roles", element: <RoleManagementPage /> },
      { path: "permissions", element: <PermissionManagementPage /> },

      // Users
      { path: "users", element: <UsersList /> },
      { path: "users/create", element: <CreateUserPage /> },
      { path: "users/:id", element: <UserDetail /> },
      { path: "users/:id/edit", element: <EditUserPage /> },
   
      { path: "users/:id/permissions", element: <UserPermissionsPage /> },
      { path: "users/:id/scope", element: <UserScopePage /> },

      // Rotations
      { path: "rotations", element: <RotationsList /> },
      { path: "rotations/create", element: <CreateRotationPage /> },
      { path: "rotations/:id", element: <RotationDetail /> },
      { path: "rotations/:id/edit", element: <EditRotationPage /> },

      // Rotation Members
      { path: "rotations/:id/members", element: <RotationMembersPage /> },
      // Rotation Tiers
      { path: "rotations/:id/tiers", element: <RotationTiersPage /> },
      // Rotation Rules
      { path: "rotations/:id/rules", element: <RotationRulesPage /> },

      // Schedule
      { path: '/schedule', element: <ScheduleListPage /> },
      { path: '/schedule/:id', element: <SchedulePage /> },
      // Leaves
      { path: "leave", element: <MyLeavesPage /> },
      { path: "leave/create", element: <CreateLeavePage /> },
      { path: "leave/approvals", element: <ApprovalsPage /> },

      // Holidays
      { path: "holidays", element: <HolidayPage /> },

      // Audit Logs
      { path: "audit-logs", element: <AuditLogPage /> },
    ],
  },
]);