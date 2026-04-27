import React from "react";
import {
  ArrowLeft,
  ShoppingBag,
  Package,
  Eye,
  CheckCircle,
  Loader2,
  Trash2,
  Search,
} from "lucide-react";
import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";
import { useOrderLogic } from "./useOrderLogic";
import { formatINR } from "../../../utils/formatCurrency";

const OrderWorkstation = () => {
  const logic = useOrderLogic();

  if (logic.loadingOrder) return <FullPageLoader />;

  return (
    <div className="max-w-[1440px] mx-auto space-y-6 pb-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => logic.navigate("/orders")}
            className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-blue-600 rounded-xl shadow-sm transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {logic.isViewOnly
                ? "Audit Invoice"
                : logic.isEditMode
                  ? "Modify Transaction"
                  : "New Sale"}
            </h2>
            {logic.isExisting && (
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mt-1">
                Reference: {logic.existingOrder?.orderId}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-6">
          {/* CUSTOMER SELECTION */}
          <Card
            className={`p-6 border-slate-200 shadow-sm ${logic.isViewOnly ? "bg-slate-50 opacity-80" : ""}`}
          >
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">
              Customer Assignment
            </label>
            <select
              disabled={logic.isExisting}
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
              value={logic.formState.customerId}
              onChange={(e) => logic.updateForm({ customerId: e.target.value })}
            >
              <option value="">Select a registered customer...</option>
              {logic.customersData?.customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Card>

          {/* INVENTORY BROWSER */}
          {!logic.isViewOnly ? (
            <Card className="p-6 border-slate-200 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <h3 className="text-sm font-bold text-slate-800">
                  Available Inventory
                </h3>
                <div className="relative w-full md:w-72">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                    onChange={(e) => logic.setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {logic.productsData?.products
                  .filter((p) =>
                    p.name
                      .toLowerCase()
                      .includes(logic.searchTerm.toLowerCase()),
                  )
                  .map((p) => (
                    <ProductCard
                      key={p._id}
                      product={p}
                      onAdd={() => logic.addToCart(p)}
                    />
                  ))}
              </div>
            </Card>
          ) : (
            <div className="p-20 text-center border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center bg-slate-50">
              <Eye size={48} className="mb-4 text-slate-300" />
              <p className="font-bold text-slate-400 uppercase text-xs tracking-widest">
                Audit Mode: Item Selection Disabled
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: POS LEDGER */}
        <div className="xl:col-span-4">
          <Card className="p-0 overflow-hidden sticky top-6 shadow-xl border-slate-200 h-[calc(100vh-120px)] flex flex-col">
            <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Cart Summary
                </span>
              </div>
              <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-lg text-[10px] font-bold">
                {logic.formState.cart.length} Items
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {logic.formState.cart.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                  <Package size={40} className="mb-2" />
                  <p className="text-xs font-bold uppercase">Cart is Empty</p>
                </div>
              )}
              {logic.formState.cart.map((item) => (
                <CartItem
                  key={item.product}
                  item={item}
                  onUpdate={logic.updateQty}
                  onRemove={logic.removeFromCart}
                  disabled={logic.isViewOnly}
                />
              ))}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase">
                  Subtotal
                </span>
                <span className="text-lg font-bold text-slate-900">
                  {formatINR(logic.subtotal)}
                </span>
              </div>
              <div className="flex justify-between items-center py-4 border-y border-dashed border-slate-300">
                <span className="text-xs font-bold text-emerald-600 uppercase">
                  Amount Paid
                </span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={logic.formState.paidAmount}
                    disabled={logic.isViewOnly}
                    onChange={(e) =>
                      logic.updateForm({ paidAmount: e.target.value })
                    }
                    className="w-32 p-2.5 pl-7 bg-white border border-slate-200 rounded-xl text-right font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-900 uppercase">
                  Balance Due
                </span>
                <span
                  className={`text-xl font-bold ${logic.balanceDue > 0 ? "text-rose-600" : "text-emerald-600"}`}
                >
                  {formatINR(logic.balanceDue)}
                </span>
              </div>

              {!logic.isViewOnly && (
                <Button
                  fullWidth
                  onClick={logic.handleSave}
                  variant="primary"
                  className="py-4 rounded-xl shadow-lg shadow-blue-500/20 font-bold"
                  disabled={logic.isProcessing}
                >
                  {logic.isProcessing
                    ? "Saving..."
                    : logic.isEditMode
                      ? "Update Order"
                      : "Complete Transaction"}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product, onAdd }) => (
  <div
    onClick={onAdd}
    className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
  >
    <div className="flex justify-between items-start mb-3">
      <div className="p-2 bg-slate-50 text-slate-400 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
        <Package size={18} />
      </div>
      <span
        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${product.quantity < 5 ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-500"}`}
      >
        Qty: {product.quantity}
      </span>
    </div>
    <p className="font-bold text-slate-800 text-sm line-clamp-1 truncate">
      {product.name}
    </p>
    <p className="text-blue-600 font-bold text-md mt-1">
      {formatINR(product.price)}
    </p>
  </div>
);

const CartItem = ({ item, onUpdate, onRemove, disabled }) => (
  <div className="flex gap-4 group items-center p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
      <p className="text-[10px] font-semibold text-blue-500">
        {formatINR(item.price)}
      </p>
    </div>
    <div
      className={`flex items-center gap-2 bg-slate-50 p-1 rounded-lg ${disabled ? "opacity-50" : ""}`}
    >
      <button
        disabled={disabled}
        onClick={() => onUpdate(item.product, -1)}
        className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-md text-slate-400"
      >
        -
      </button>
      <span className="text-[10px] font-bold w-4 text-center">
        {item.quantity}
      </span>
      <button
        disabled={disabled}
        onClick={() => onUpdate(item.product, 1)}
        className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-md text-slate-400"
      >
        +
      </button>
    </div>
    {!disabled && (
      <button
        onClick={() => onRemove(item.product)}
        className="text-slate-300 hover:text-rose-500 transition-colors"
      >
        <Trash2 size={16} />
      </button>
    )}
  </div>
);

const FullPageLoader = () => (
  <div className="flex h-[70vh] flex-col items-center justify-center space-y-4">
    <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
      Syncing Order Data...
    </p>
  </div>
);

export default OrderWorkstation;
