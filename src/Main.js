import React from "react";
import {
  RouterProvider,
  createBrowserRouter,
  Outlet,
  useRoutes,
  Navigate,
} from "react-router-dom";
import Footer from "./Components/Footer";
import Header from "./Components/Header";
import Login from "./Components/Login";
import DeviceData from "./Components/DeviceData";
import { Provider } from "react-redux";
import appStore from "./store/store";
import Profile from "./Components/Profile";
import Devices from "./Components/Devices";
import DeviceDetails from "./Components/DeviceDetails";
import VariableDetails from "./Components/VariableDetails";
import Users from "./Components/Users/Users";
import Notifications from "./Components/Notifications";
import Customers from "./Components/Customers";
import Dashboard from "./Components/Dashboard";
import Schedule from "./Components/Schedule";
import Reports from "./Components/Reports";
import TerminalView from "./Components/View/TerminalView/TerminalView";
import TerminalDetailPage from "./Components/View/TerminalView/TerminalDetailPage";
import DataTable from "./Components/View/TerminalView/HistoricalData/DataTable";
import SldcDashboard from "./Components/Dashboard/SldcDashboard";
import NotificationDashboard from "./Components/Notifications/NotificationDashboard";
const Main = () => {
  const HeaderLayout = () => {
    const isLoginPage = useRoutes([{ path: "/", element: <Login /> }]);
    if (isLoginPage) {
      return (
        <Provider store={appStore}>
          <div className="flex flex-col min-h-screen">
            <Outlet />
          </div>
        </Provider>
      );
    }
    let user = localStorage.getItem("user");
    if (user == null || user == undefined) {
      return <Navigate to="/"></Navigate>;
    }

    return (
      <Provider store={appStore}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <div className="flex-grow mx-5 my-7">
            <Outlet />
          </div>
          <Footer />
        </div>
      </Provider>
    );
  };

  const appRouter = createBrowserRouter([
    {
      element: <HeaderLayout />,
      children: [
        {
          path: "/",
          element: <Login />,
        },
        {
          path: "/users",
          element: <Users />,
        },
        {
          path: "/profile?",
          element: <Profile />,
        },
        {
          path: "/devicedata",
          element: <DeviceData />,
        },
        {
          path: "/devices",
          element: <Devices />,
        },
        {
          path: "/devices/details/:deviceId",
          element: <DeviceDetails />,
        },
        {
          path: "/variabledetails/:variableid",
          element: <VariableDetails />,
        },
        {
          path: "/notifications",
          element: <Notifications />,
        },
        {
          path: "/notification-management",
          element: <NotificationDashboard />,
        },
        {
          path: "/customers",
          element: <Customers />,
        },
        {
          path: "/sldcview",
          element: <Dashboard />,
        },
        {
          path: "/dashboard",
          element: <SldcDashboard />,
        },
        {
          path: "/view/terminal",
          element: <TerminalView />,
        },
        {
          path: "/terminal/:terminalId",
          element: <TerminalDetailPage />,
        },
        {
          path: "/schedule",
          element: <Schedule />,
        },
        {
          path: "/reports",
          element: <Reports />,
        },
        {
          path: "/profile",
          element: <Profile />,
        },
        {
          path: "/data-table/:tableId",
          element: <DataTable />,
        },
        {
          path: "*",
          element: <h1>Page Not Found</h1>,
        },
      ],
    },
  ]);

  return (
    <>
      <RouterProvider router={appRouter}>
        <HeaderLayout />
      </RouterProvider>
    </>
  );
};

export default Main;
