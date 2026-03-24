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

// Domains
import DomainList from "./pages/org/domains/DomainList";
import DomainDetailPage from "./pages/org/domains/DomainDetailPage";
import EditDomainPage from "./pages/org/domains/EditDomainPage";
import CreateDomainPage from "./pages/org/domains/CreateDomainPage";

// Domain-Team
import DomainTeamDetail from "./pages/org/domain-teams/DomainTeamDetail";
// import AddUserToDomainTeamPage from "./pages/org/domain-teams/AddUserToDomainPage";
import AddUserToDomainPage from "./pages/org/domains/AddUserToDomainPage";
import AddTeamToDomainPage from "./pages/org/domains/AddTeamToDomainPage";
// inport EditDomainTeamPage from "./pages/org/domain-teams/EditDomainTeamPage";
import CreateDomainTeamPage from "./pages/org/domain-teams/CreateDomainTeamPage";
import DomainTeamList from "./pages/org/domain-teams/DomainTeamsList";




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
      // Domains
      { path: "domains", element: <DomainList /> },
      { path: "domains/create", element: <CreateDomainPage /> },
      { path: "domains/:id", element: <DomainDetailPage /> },
      { path: "domains/:id/edit", element: <EditDomainPage /> },

      // Domain-Team
      { path: "domains/:id/teams", element: <DomainTeamList /> },
      { path: "domains/:id/teams/create", element: <CreateDomainTeamPage /> },
      { path: "domains/:id/teams/:teamId", element: <DomainTeamDetail /> },
      // { path: "domains/:id/teams/:teamId/edit", element: <EditDomainTeamPage /> },
      { path: "domains/:domainId/add-user", element: <AddUserToDomainPage /> },
      { path: "domains/:id/add-team", element: <AddTeamToDomainPage /> },


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
      // Rotation Tiers
      { path: "rotations/:id/tiers", element: <RotationTiersPage /> },
      // Rotation Rules
      { path: "rotations/:id/rules", element: <RotationRulesPage /> },

      // Schedule
      { path: '/schedule', element: <ScheduleListPage /> },
      { path: '/schedule/:id', element: <SchedulePage /> },
    ],
  },
]);