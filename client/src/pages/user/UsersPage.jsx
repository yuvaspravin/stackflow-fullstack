import React from "react";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import { useNavigate } from "react-router-dom";

const UsersPage = () => {
  const navigate = useNavigate();
  const usersData = [
    {
      id: 1,
      name: "Amelia Turner",
      email: "amelia.turner@acmeretail.com",
      role: "Admin",
    },
    {
      id: 2,
      name: "Marcus Lee",
      email: "marcus.lee@acmeretail.com",
      role: "Staff",
    },
    {
      id: 3,
      name: "Priya Nair",
      email: "priya.nair@acmeretail.com",
      role: "Staff",
    },
  ];
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Users</p>
          <h2 className="text-2xl font-bold text-slate-800">Team Members</h2>
        </div>
        <Button onClick={() => navigate("/users/add")} variant="primary">
          Add User
        </Button>
      </div>

      {/* TEAM MEMBERS TABLE */}
      <Card className="p-0 overflow-hidden">
        <Table headers={["Name", "Email", "Role", "Actions"]}>
          {usersData.map((user) => (
            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
              <td className="py-4 px-6 text-sm font-bold text-slate-800">
                {user.name}
              </td>
              <td className="py-4 px-6 text-sm text-slate-600">{user.email}</td>
              <td className="py-4 px-6">
                {/* Custom styling for Roles */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.role === "Admin"
                      ? "bg-indigo-50 text-indigo-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {user.role}
                </span>
              </td>
              <td className="py-4 px-6">
                <Button variant="outline" className="px-3 py-1 text-xs">
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
};

export default UsersPage;
