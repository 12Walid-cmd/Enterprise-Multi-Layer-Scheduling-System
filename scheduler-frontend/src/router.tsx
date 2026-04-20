import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layout/RootLayout";

// Groups
import GroupsList from "./pages/org/groups/GroupsList";

// Teams
import TeamsList from "./pages/org/teams/TeamsList";

// Team Role Types
import TeamRoleTypesList from "./pages/org/roles/TeamRoleTypesList";

// Global Role Types
import GlobalRoleTypesList from "./pages/org/roles/GlobalRoleTypesList";



// Users
import UsersList from "./pages/user/UsersList";
import UserDetail from "./pages/user/UserDetail";



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
import PermissionManagementPage from "./pages/org/permissions/PermissionManagementPage";




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
      { path: "permissions", element: <PermissionManagementPage /> },

      // Users
      { path: "users", element: <UsersList /> },
      { path: "users/:id", element: <UserDetail /> },
  

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
      { path: "groups/:groupId/holidays", element: <HolidayPage /> },

      // Audit Logs
      { path: "audit-logs", element: <AuditLogPage /> },
    ],
  },
]);