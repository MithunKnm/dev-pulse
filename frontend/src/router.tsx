import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "./routes/Home";
import Analyze from "./routes/Analyze";
import Repositories from "./routes/Repositories";
import RepositoryDetails from "./routes/RepositoryDetails";
import CompareRepositories from "./routes/CompareRepositories";
import Developers from "./routes/Developers";
import DeveloperDetails from "./routes/DeveloperDetails";
import CompareDevelopers from "./routes/CompareDevelopers";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "analyze", element: <Analyze /> },
      { path: "repositories", element: <Repositories /> },
      { path: "repositories/compare", element: <CompareRepositories /> },
      { path: "repositories/:owner/:repo", element: <RepositoryDetails /> },
      { path: "developers", element: <Developers /> },
      { path: "developers/compare", element: <CompareDevelopers /> },
      { path: "developers/:username", element: <DeveloperDetails /> },
    ],
  },
]);
