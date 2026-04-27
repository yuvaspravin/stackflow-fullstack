import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import z from "zod";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";

const AddUserPage = () => {
  const navigate = useNavigate();

  // 1. Define the Validation Schema
  const userSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    role: z.enum(["Admin", "Manager", "Staff"], {
      errorMap: () => ({ message: "Please select a valid role" }),
    }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: { name: "", email: "", role: "" },
  });

  const onSubmit = (data) => {
    console.log("New User Data:", data);
    toast.success("Team member added successfully!");
    navigate("/users");
  };
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Add Team Member</h2>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-600">
                Full Name
              </label>
              <input
                {...register("name")}
                type="text"
                placeholder="e.g. Marcus Lee"
                className={`w-full p-3 border rounded-lg focus:outline-none transition-colors ${errors.name ? "border-red-500" : "border-slate-200 focus:ring-2 focus:ring-blue-500"}`}
              />
              {errors.name && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-600">
                Email Address
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="e.g. marcus@acmeretail.com"
                className={`w-full p-3 border rounded-lg focus:outline-none transition-colors ${errors.email ? "border-red-500" : "border-slate-200 focus:ring-2 focus:ring-blue-500"}`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Role Select Dropdown */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-600">
                Assign Role
              </label>
              <select
                {...register("role")}
                className={`w-full p-3 border rounded-lg bg-white focus:outline-none transition-colors ${errors.role ? "border-red-500" : "border-slate-200 focus:ring-2 focus:ring-blue-500"}`}
              >
                <option value="" disabled>
                  Select a role...
                </option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Staff">Staff</option>
              </select>
              {errors.role && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.role.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save User
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddUserPage;
