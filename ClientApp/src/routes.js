import { HomePage } from "./pages/HomePage";
import { NotFound } from "./pages/NotFound";
import { LoginPage } from "./pages/Login";
import { Knowledge } from "./pages/Knowledge";
import { Admin } from "./pages/Admin";
import { TicketPage } from "./pages/Ticket";
import { TestPage } from "./pages/TestPage";
import { Accounts } from "./pages/Accounts";
<<<<<<< Updated upstream
import {AdminHistory} from "./pages/AdminHistory.tsx";
import { Machines } from "./pages/Machines";
import { MachineProblems } from "./pages/MachineProblems";
import { Machines2 } from "./pages/Machines2";
import { Settings } from "./pages/Settings"
import { Account } from "./pages/Account"
import { AddImage } from "./pages/AddImage";
=======
import { Machines2 } from "./pages/Machines2";
import {AdminHistory} from "./pages/AdminHistory.tsx";
import { Machines } from "./pages/Machines";
import { MachineProblems } from "./pages/MachineProblems";
import { AdminSettings } from "./pages/AdminSettings";

>>>>>>> Stashed changes


export const routes = [
  { path: "/", name: "homePage", component: <HomePage /> },
  { path: "/login", name: "loginPage", component: <LoginPage /> },
  { path: "/knowledge", name: "knowledgePage", component: <Machines /> /*<Knowledge />*/ },
  { path: "/admin", name: "adminPage", component: <Admin /> },
  { path: "/ticket", name: "ticketPage", component: <TicketPage />},
  { path: "/test", name: "testPage", component: <TestPage /> },
  { path: "/*", name: "notFound", component: <NotFound /> },
  { path: "/admin/accounts", name: "accounts", component: <Accounts /> },
<<<<<<< Updated upstream
  { path: "/admin/machines", name: "Machines2", component: <Machines2 /> },
  { path: "/admin/problems", name: "history", component: <AdminHistory /> },
  { path: "/machines", name: "machines", component: <Machines /> },
  { path: "/machineproblems/:Problem_Id", name: "machineproblems", component: <MachineProblems /> },
  { path: "/settings", name: "settings", component: <Settings /> },
  { path: "/account", name: "account", component: <Account /> },
  { path: "/addimage", name: "addimg", component: <AddImage /> },
=======
  { path: "/admin/machines", name: "machines", component: <Machines2 /> },
  { path: "/admin/problems", name: "history", component: <AdminHistory /> },
  { path: "/machines", name: "machines", component: <Machines /> },
  { path: "/machineproblems/:Problem_Id", name: "machineproblems", component: <MachineProblems /> },
  { path: "/admin/settings", name: "settings", component: <AdminSettings /> },
>>>>>>> Stashed changes
];

