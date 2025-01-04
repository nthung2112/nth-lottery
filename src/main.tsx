import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { routers } from "./routes";

import './i18n/config';

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <RouterProvider router={routers} />
);
