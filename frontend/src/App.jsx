import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import appStore from "./utils/appStore";

import Body from "./component/Body";
import Login from "./component/Login";
import Profile from "./component/Profile";
import ErrorPage from "./component/ErrorPage";
import Feed from "./component/Feed";
import Connections from "./component/Connections";
import Requests from "./component/Requests";
import Chat from "./component/Chat";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import AdminDashboard from "./component/admin/AdminDashboard";
import AdminLogin from "./component/admin/AdminLogin";
import AdminStats from "./component/admin/AdminStats";
import AuthLoader from "./routes/AuthLoader";
import AdminUsersList from "./component/admin/AdminUsersList";
import AdminUserDetails from "./component/admin/AdminUserDetails";
import AdminConnectionsList from "./component/admin/AdminConnectionsList";
import SocketManager from "./utils/SocketManager";


function App() {
  return (
    <Provider store={appStore}>
      <AuthLoader>
        <SocketManager />

        <BrowserRouter basename="/">
          <Routes>

            {/* Public route */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected user routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Body />}>
                <Route index element={<Feed />} />
                <Route path="profile" element={<Profile />} />
                <Route path="connections" element={<Connections />} />
                <Route path="requests" element={<Requests />} />
                <Route path="chat/:targetUserId" element={<Chat />} />
              </Route>
            </Route>

            {/* Admin routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsersList />} />
              <Route path="/admin/users/:userId" element={<AdminUserDetails />} />
              <Route path="/admin/connections" element={<AdminConnectionsList />} />
              <Route path="/admin/stats" element={<AdminStats />} />
            </Route>

            {/* Error page */}
            <Route path="/error" element={<ErrorPage />} />
            <Route path="*" element={<ErrorPage />} />

          </Routes>
        </BrowserRouter>
      </AuthLoader>
    </Provider>
  );
}


export default App;
