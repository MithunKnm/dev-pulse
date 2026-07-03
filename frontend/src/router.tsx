import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Overview from "./routes/Overview";
import Engineers from "./routes/Engineers";
import EngineerReport from "./routes/EngineerReport";
import Repositories from "./routes/Repositories";
import Insights from "./routes/Insights";
import Reports from "./routes/Reports";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Overview /> },
      { path: "engineers", element: <Engineers /> },
      { path: "engineers/:id", element: <EngineerReport /> },
      { path: "repositories", element: <Repositories /> },
      { path: "insights", element: <Insights /> },
      { path: "reports", element: <Reports /> },
    ],
  },
]);
