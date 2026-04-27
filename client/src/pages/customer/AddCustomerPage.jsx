import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  User,
  MapPin,
  Mail,
  Phone,
  Loader2,
  Globe,
} from "lucide-react";
import { toast } from "react-toastify";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import {
  useAddCustomerMutation,
  useGetCustomerQuery,
  useUpdateCustomerMutation,
} from "../../redux/api/apiSlice";

const AddCustomerPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // 1. API HOOKS
  const { data: customerData, isLoading: isFetching } = useGetCustomerQuery(
    id,
    { skip: !isEditMode },
  );
  const [addCustomer, { isLoading: isAdding }] = useAddCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] =
    useUpdateCustomerMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
  });

  // 2. HYDRATION
  useEffect(() => {
    if (isEditMode && customerData) {
      setFormData({
        name: customerData.name || "",
        email: customerData.email || "",
        phone: customerData.phone || "",
        street: customerData.address?.street || "",
        city: customerData.address?.city || "",
        state: customerData.address?.state || "",
        zip: customerData.address?.zip || "",
        country: customerData.address?.country || "India",
      });
    }
  }, [isEditMode, customerData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        country: formData.country,
      },
    };

    try {
      if (isEditMode) {
        await updateCustomer({ id, ...payload }).unwrap();
        toast.success("Client data updated");
      } else {
        await addCustomer(payload).unwrap();
        toast.success("New client profile created");
      }
      navigate("/customers");
    } catch (err) {
      toast.error(err?.data?.message || "Submission failed");
    }
  };

  if (isFetching)
    return (
      <div className="p-20 text-center">
        <Loader2
          className="animate-spin mx-auto text-blue-600 mb-4"
          size={32}
        />{" "}
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Retrieving Client Record...
        </p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <header className="flex items-center gap-4">
        <button
          onClick={() => navigate("/customers")}
          className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-blue-600 rounded-xl shadow-sm transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isEditMode ? "Edit Profile" : "Onboard Customer"}
          </h2>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            CRM Management
          </p>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <User size={18} className="text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                Identity & Contact
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                fullWidth
              />
              <InputField
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
              <InputField
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </div>
          </Card>

          <Card className="p-6 border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <MapPin size={18} className="text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                Shipping Logistics
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Street Address"
                name="street"
                value={formData.street}
                onChange={(e) =>
                  setFormData({ ...formData, street: e.target.value })
                }
                fullWidth
              />
              <InputField
                label="City"
                name="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
              <InputField
                label="State"
                name="state"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
              />
            </div>
          </Card>
        </div>

        {/* Sidebar Info & Save */}
        <div className="space-y-6">
          <Card className="p-6 border-slate-200 shadow-sm bg-slate-900 text-white">
            <div className="flex items-center gap-2 mb-6">
              <Globe size={18} className="text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-widest">
                Regional Settings
              </h3>
            </div>
            <InputField
              dark
              label="Country"
              name="country"
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
            />
          </Card>

          <div className="space-y-3">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              className="py-4 shadow-lg shadow-blue-500/20"
              disabled={isAdding || isUpdating}
            >
              {isAdding || isUpdating ? (
                "Processing..."
              ) : (
                <>
                  <Save size={18} className="mr-2" />{" "}
                  {isEditMode ? "Update Profile" : "Register Client"}
                </>
              )}
            </Button>
            <button
              type="button"
              onClick={() => navigate("/customers")}
              className="w-full py-3 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
            >
              Cancel Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// Reusable Input Component to keep code clean
const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  fullWidth,
  dark,
}) => (
  <div className={`space-y-2 ${fullWidth ? "md:col-span-2" : ""}`}>
    <label
      className={`text-[10px] font-bold uppercase tracking-widest ${dark ? "text-slate-400" : "text-slate-500"}`}
    >
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full p-3 rounded-xl border font-semibold text-sm outline-none transition-all ${dark ? "bg-white/10 border-white/10 text-white focus:bg-white/20" : "bg-slate-50 border-slate-100 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"}`}
    />
  </div>
);

export default AddCustomerPage;
