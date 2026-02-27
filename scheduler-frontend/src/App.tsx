import { Routes, Route } from "react-router-dom";
import GroupsList from "./pages/org/groups/GroupsList";
import GroupDetail from "./pages/org/groups/GroupDetail";
import CreateGroupPage from "./pages/org/groups/CreateGroupPage";
import EditGroupPage from "./pages/org/groups/EditGroupPage";

export default function App() {
  return (
    <Routes>
      <Route path="/groups" element={<GroupsList />} />
      <Route path="/groups/:id" element={<GroupDetail />} />
      <Route path="/groups/create" element={<CreateGroupPage />} />
      <Route path="/groups/:id/edit" element={<EditGroupPage />} />
    </Routes>
  );
}

