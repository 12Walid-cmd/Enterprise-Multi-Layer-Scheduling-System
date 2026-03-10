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

// Sub-teams
import { SubTeamList } from "./pages/org/sub-teams/SubTeamList";
import { EditSubTeamPage } from "./pages/org/sub-teams/EditSubTeamPage";
import { SubTeamDetail } from "./pages/org/sub-teams/SubTeamDetail";
import { CreateSubTeamPage } from "./pages/org/sub-teams/CreateSubTeamPage";

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
      // { path: "teams", element: <TeamsList /> },
      // { path: "teams/create", element: <CreateTeamPage /> },
      // { path: "teams/:id", element: <TeamDetail /> },
      // { path: "teams/:id/edit", element: <EditTeamPage /> },

      // Teams
      {
        path: "teams",
        children: [
          { index: true, element: <TeamsList /> },
          { path: "create", element: <CreateTeamPage /> },
          { path: ":id", element: <TeamDetail /> },
          { path: ":id/edit", element: <EditTeamPage /> },

          // Sub-teams
          { path: ":teamId/sub-teams", element: <SubTeamListWrapper /> },
          { path: ":teamId/sub-teams/create", element: <CreateSubTeamPage /> },

          // Sub-team 
          { path: "sub-teams/:id", element: <SubTeamDetail /> },
          { path: "sub-teams/:id/edit", element: <EditSubTeamPage /> },
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
    ],
  },
]);