import React from "react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { toast } from "react-toastify";

const SettingsPage = () => {
  const handleSave = (e) => {
    e.preventDefault();
    toast.success("Settings saved successfully!");
  };
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
      </div>

      {/* SETTINGS FORM */}
      <Card>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Name */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-600">
                Business Name
              </label>
              <input
                type="text"
                defaultValue="Acme Retail Supplies"
                className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-600">
                Email
              </label>
              <input
                type="email"
                defaultValue="billing@acmeretail.com"
                className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Address */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-600">
                Address
              </label>
              <input
                type="text"
                defaultValue="125 Harbor Way, Building 4, San Francisco, CA"
                className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Timezone */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-600">
                Timezone
              </label>
              <select className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Pacific Time (US & Canada)</option>
                <option>Eastern Time (US & Canada)</option>
                <option>Central Time (US & Canada)</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button variant="outline" type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Settings
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SettingsPage;
