import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layout/RootLayout";

import GroupsList from "./pages/org/groups/GroupsList";
import GroupDetail from "./pages/org/groups/GroupDetail";
import CreateGroupPage from "./pages/org/groups/CreateGroupPage";
import EditGroupPage from "./pages/org/groups/EditGroupPage";

import TeamDetail from "./pages/org/teams/TeamDetail";
import TeamsList from "./pages/org/teams/TeamsList";
import CreateTeamPage from "./pages/org/teams/CreateTeamPage";
import EditTeamPage from "./pages/org/teams/EditTeamPage";

import RoleTypeDetail from "./pages/org/roles/RoleTypeDetail";
import RoleTypesList from "./pages/org/roles/RoleTypesList";
import EditRoleTypePage from "./pages/org/roles/EditRoleTypePage";
import CreateRoleTypePage from "./pages/org/roles/CreateRoleTypePage";


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
      { path: "teams", element: <TeamsList /> },
      { path: "teams/create", element: <CreateTeamPage /> },
      { path: "teams/:id", element: <TeamDetail /> },
      { path: "teams/:id/edit", element: <EditTeamPage /> },
      // Roles
      { path: "roles/types", element: <RoleTypesList /> },
      { path: "roles/types/create", element: <CreateRoleTypePage /> },
      { path: "roles/types/:id", element: <RoleTypeDetail /> },
      { path: "roles/types/:id/edit", element: <EditRoleTypePage /> },
    ],
  },
]);