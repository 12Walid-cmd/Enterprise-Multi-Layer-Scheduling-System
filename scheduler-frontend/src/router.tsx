import { createBrowserRouter, useParams } from "react-router-dom";
import RootLayout from "./layout/RootLayout";

// Groups
import GroupsList from "./pages/org/groups/GroupsList";
import GroupDetail from "./pages/org/groups/GroupDetail";
import CreateGroupPage from "./pages/org/groups/CreateGroupPage";
import EditGroupPage from "./pages/org/groups/EditGroupPage";

// Teams
import TeamsList from "./pages/org/teams/TeamsList";
import TeamDetail from "./pages/org/teams/TeamDetail";
import CreateTeamPage from "./pages/org/teams/CreateTeamPage";
import EditTeamPage from "./pages/org/teams/EditTeamPage";

// Team Role Types
import TeamRoleTypesList from "./pages/org/roles/team-types/TeamRoleTypesList";
import TeamRoleTypeDetail from "./pages/org/roles/team-types/TeamRoleTypeDetail";
import CreateTeamRoleTypePage from "./pages/org/roles/team-types/CreateTeamRoleTypePage";
import EditTeamRoleTypePage from "./pages/org/roles/team-types/EditTeamRoleTypePage";

// Global Role Types
import GlobalRoleTypesList from "./pages/org/roles/global-types/GlobalRoleTypesList";
import GlobalRoleTypeDetail from "./pages/org/roles/global-types/GlobalRoleTypeDetail";
import CreateGlobalRoleTypePage from "./pages/org/roles/global-types/CreateGlobalRoleTypePage";
import EditGlobalRoleTypePage from "./pages/org/roles/global-types/EditGlobalRoleTypePage";

// Users
import UsersList from "./pages/user/UsersList";
import CreateUserPage from "./pages/user/CreateUserPage";
import EditUserPage from "./pages/user/EditUserPage";
import UserDetail from "./pages/user/UserDetail";
import UserGlobalRolesPage from "./pages/user/[id]/UserGlobalRolesPage";

// Sub-teams
import SubTeamList from "./pages/org/sub-teams/SubTeamList";
import EditSubTeamPage from "./pages/org/sub-teams/EditSubTeamPage";
import SubTeamDetail from "./pages/org/sub-teams/SubTeamDetail";
import CreateSubTeamPage from "./pages/org/sub-teams/CreateSubTeamPage";



// Rotations
import RotationsList from "./pages/rotation/RotationsList";
import CreateRotationPage from "./pages/rotation/CreateRotationPage";
import RotationDetail from "./pages/rotation/RotationDetail";
import EditRotationPage from "./pages/rotation/EditRotationPage";
import RotationMembersPage from "./pages/rotation/RotationMembersPage";

// Schedule
import ScheduleListPage from "./pages/schedule/ScheduleListPage";
import SchedulePage from "./pages/schedule/SchedulePage";

const SubTeamListWrapper = () => {
  const { teamId } = useParams();
  return <SubTeamList teamId={teamId!} />;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      // Groups
      { index: true, element: <GroupsList /> },
      { path: "groups", element: <GroupsList /> },
      { path: "groups/create", element: <CreateGroupPage /> },
      { path: "groups/:id", element: <GroupDetail /> },
      { path: "groups/:id/edit", element: <EditGroupPage /> },


      // Teams
      {
        path: "teams",
        children: [
          { index: true, element: <TeamsList /> },
          { path: "create", element: <CreateTeamPage /> },
          { path: ":id", element: <TeamDetail /> },
          { path: ":id/edit", element: <EditTeamPage /> },
          // Sub-team 
          { path: "sub-teams/:id", element: <SubTeamDetail /> },
          { path: "sub-teams/:id/edit", element: <EditSubTeamPage /> },
          // Sub-teams
          { path: ":teamId/sub-teams", element: <SubTeamListWrapper /> },
          { path: ":teamId/sub-teams/create", element: <CreateSubTeamPage /> },
        ],
      },



      // Team Role Types
      { path: "roles/team-types", element: <TeamRoleTypesList /> },
      { path: "roles/team-types/create", element: <CreateTeamRoleTypePage /> },
      { path: "roles/team-types/:id", element: <TeamRoleTypeDetail /> },
      { path: "roles/team-types/:id/edit", element: <EditTeamRoleTypePage /> },

      // Global Role Types
      { path: "roles/global-types", element: <GlobalRoleTypesList /> },
      { path: "roles/global-types/create", element: <CreateGlobalRoleTypePage /> },
      { path: "roles/global-types/:id", element: <GlobalRoleTypeDetail /> },
      { path: "roles/global-types/:id/edit", element: <EditGlobalRoleTypePage /> },

      // Users
      { path: "users", element: <UsersList /> },
      { path: "users/create", element: <CreateUserPage /> },
      { path: "users/:id", element: <UserDetail /> },
      { path: "users/:id/edit", element: <EditUserPage /> },
      { path: "users/:id/global-roles", element: <UserGlobalRolesPage /> },

      // Rotations
      { path: "rotations", element: <RotationsList /> },
      { path: "rotations/create", element: <CreateRotationPage /> },
      { path: "rotations/:id", element: <RotationDetail /> },
      { path: "rotations/:id/edit", element: <EditRotationPage /> },

      // Rotation Members
      { path: "rotations/:id/members", element: <RotationMembersPage /> },

      // Schedule
      { path: '/schedule', element: <ScheduleListPage /> },
      { path: '/schedule/:id', element: <SchedulePage /> },
    ],
  },
]);