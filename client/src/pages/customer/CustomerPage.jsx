import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Plus,
  Loader2,
  Users,
  Edit3,
  Trash2,
  Search,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  MoreVertical,
} from "lucide-react";
import { toast } from "react-toastify";

// --- Custom Components ---
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import {
  useGetCustomersQuery,
  useDeleteCustomerMutation,
} from "../../redux/api/apiSlice";

const CustomerPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. STATE & API
  const page = parseInt(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";

  const { data, isLoading, isError, error } = useGetCustomersQuery({
    page,
    search,
  });
  const [deleteCustomer] = useDeleteCustomerMutation();

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage, search });
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this customer? This cannot be undone.",
      )
    ) {
      try {
        await deleteCustomer(id).unwrap();
        toast.success("Customer removed from records");
      } catch (err) {
        toast.error(err?.data?.message || "Could not delete customer");
      }
    }
  };

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            CRM Module
          </p>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
            Customer Database
          </h2>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="hidden lg:flex gap-4 mr-2">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Active Clients
              </p>
              <p className="text-xl font-bold text-slate-800">
                {data?.totalItems || 0}
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate("/customers/add")}
            variant="primary"
            className="flex-1 md:flex-none h-12 shadow-lg shadow-blue-500/20"
          >
            <Plus size={18} className="mr-2" /> New Customer
          </Button>
        </div>
      </div>

      {/* --- DATA TABLE --- */}
      <Card className="p-0 overflow-hidden border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <th className="py-4 px-6">Customer Identity</th>
                <th className="py-4 px-6">Contact Channels</th>
                <th className="py-4 px-6">Location</th>
                <th className="py-4 px-6 text-right">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {data?.customers?.length === 0 ? (
                <EmptyState colSpan={4} search={search} />
              ) : (
                data?.customers?.map((customer) => (
                  <tr
                    key={customer._id}
                    className="hover:bg-slate-50 transition-colors group font-sans"
                  >
                    {/* Identity */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-sm border border-indigo-100">
                          {customer.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800 text-sm">
                          {customer.name}
                        </span>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-4 px-6 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <Mail size={12} className="text-slate-400" />{" "}
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                        <Phone size={12} className="text-slate-400" />{" "}
                        {customer.phone}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <MapPin size={12} className="text-slate-400" />
                        {customer.address?.city}, {customer.address?.state}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() =>
                            navigate(`/customers/edit/${customer._id}`)
                          }
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit Customer"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(customer._id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Delete Customer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION --- */}
        {data?.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t">
            <p className="text-[10px] font-bold text-slate-400 uppercase">
              Page {page} of {data.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
                className="p-2 text-slate-400 hover:text-slate-800 disabled:opacity-30"
              >
                Prev
              </button>
              <button
                disabled={page === data.totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="p-2 text-slate-400 hover:text-slate-800 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

// ... Internal UI Helpers (LoadingState, EmptyState) ...

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center h-[60vh]">
    <Loader2 className="animate-spin text-blue-600 w-12 h-12 mb-4" />
    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
      Accessing CRM Registry...
    </p>
  </div>
);

const EmptyState = ({ colSpan, search }) => (
  <tr>
    <td colSpan={colSpan} className="py-20 text-center">
      <div className="flex flex-col items-center opacity-40">
        <Users size={48} className="text-slate-300 mb-3" />
        <p className="text-sm font-bold text-slate-400 uppercase">
          {search ? `No results for "${search}"` : "Customer list is empty"}
        </p>
      </div>
    </td>
  </tr>
);

export default CustomerPage;
