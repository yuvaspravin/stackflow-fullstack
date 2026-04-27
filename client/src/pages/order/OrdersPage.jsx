import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Plus,
  Loader2,
  FileText,
  Edit3,
  AlertCircle,
  History,
  HandCoins,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import { toast } from "react-toastify";
import { formatINR } from "../../utils/formatCurrency";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import {
  useGetOrdersQuery,
  useAddPaymentMutation,
} from "../../redux/api/apiSlice";

const OrdersPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";

  const { data, isLoading } = useGetOrdersQuery({ page, search });
  const [addPayment] = useAddPaymentMutation();

  const [historyModal, setHistoryModal] = useState({
    open: false,
    order: null,
  });
  const [paymentModal, setPaymentModal] = useState({
    open: false,
    order: null,
  });
  const [payAmount, setPayAmount] = useState("");

  const handlePaymentSubmit = async () => {
    if (!payAmount || payAmount <= 0)
      return toast.error("Enter a valid amount");
    try {
      await addPayment({
        id: paymentModal.order._id,
        amount: Number(payAmount),
      }).unwrap();
      toast.success("Payment Recorded");
      setPaymentModal({ open: false, order: null });
      setPayAmount("");
    } catch (err) {
      toast.error(err?.data?.message || "Payment failed");
    }
  };

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Sales Ledger
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Monitor and manage your store transactions
          </p>
        </div>
        <Button
          onClick={() => navigate("/orders/add")}
          variant="primary"
          className="shadow-lg shadow-blue-500/20 px-6 py-3"
        >
          <Plus size={18} className="mr-2" /> New Order
        </Button>
      </div>

      <Card className="p-0 overflow-hidden border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <th className="py-4 px-6">ID & Date</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Total Amount</th>
                <th className="py-4 px-6">Balance</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.orders?.map((order) => (
                <OrderRow
                  key={order._id}
                  order={order}
                  onShowHistory={() => setHistoryModal({ open: true, order })}
                  onShowPayment={() => setPaymentModal({ open: true, order })}
                  onEdit={() => navigate(`/orders/edit/${order._id}`)}
                  onView={() => navigate(`/orders/view/${order._id}`)}
                />
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          data={data}
          page={page}
          setPage={(p) => setSearchParams({ page: p, search })}
        />
      </Card>

      {historyModal.open && (
        <HistoryModal
          order={historyModal.order}
          onClose={() => setHistoryModal({ open: false })}
        />
      )}
      {paymentModal.open && (
        <PaymentModal
          order={paymentModal.order}
          amount={payAmount}
          setAmount={setPayAmount}
          onConfirm={handlePaymentSubmit}
          onClose={() => setPaymentModal({ open: false })}
        />
      )}
    </div>
  );
};

const OrderRow = ({ order, onShowHistory, onShowPayment, onEdit, onView }) => (
  <tr className="hover:bg-slate-50 transition-colors group">
    <td className="py-4 px-6">
      <p className="text-xs font-bold text-blue-600 tracking-tight">
        {order.orderId}
      </p>
      <p className="text-[10px] font-medium text-slate-400 mt-0.5">
        {new Date(order.createdAt).toLocaleDateString()}
      </p>
    </td>
    <td className="py-4 px-6 text-sm font-semibold text-slate-700">
      {order.customerName}
    </td>
    <td className="py-4 px-6 text-sm font-bold text-slate-900">
      {formatINR(order.totalAmount)}
    </td>
    <td className="py-4 px-6">
      <span
        className={`text-sm font-bold ${order.dueAmount > 0 ? "text-rose-500" : "text-emerald-600"}`}
      >
        {formatINR(order.dueAmount)}
      </span>
    </td>
    <td className="py-4 px-6">
      <Badge variant={order.paymentStatus === "Paid" ? "success" : "warning"}>
        {order.paymentStatus}
      </Badge>
    </td>
    <td className="py-4 px-6">
      <div className="flex justify-end gap-2">
        <ActionIcon
          icon={<History size={16} />}
          onClick={onShowHistory}
          title="Payment Logs"
        />
        {order.dueAmount > 0 && (
          <ActionIcon
            icon={<HandCoins size={16} />}
            color="text-emerald-600"
            onClick={onShowPayment}
            title="Collect Payment"
          />
        )}
        <ActionIcon icon={<Edit3 size={16} />} onClick={onEdit} title="Edit" />
        <ActionIcon
          icon={<FileText size={16} />}
          onClick={onView}
          title="Invoice"
        />
      </div>
    </td>
  </tr>
);

const ActionIcon = ({ icon, onClick, title, color = "text-slate-400" }) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-all ${color} hover:shadow-sm`}
  >
    {icon}
  </button>
);

const Pagination = ({ data, page, setPage }) => {
  if (!data || data.totalPages <= 1) return null;
  return (
    <div className="p-4 bg-slate-50 border-t flex justify-between items-center">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        Total {data.totalItems} Orders
      </span>
      <div className="flex gap-2">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="p-2 border rounded-lg bg-white disabled:opacity-30"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="px-4 py-1.5 text-xs font-bold bg-white border rounded-lg">
          {page} / {data.totalPages}
        </span>
        <button
          disabled={page === data.totalPages}
          onClick={() => setPage(page + 1)}
          className="p-2 border rounded-lg bg-white disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center p-20 space-y-4">
    <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
      Fetching Ledger...
    </p>
  </div>
);

// ... Modals (PaymentModal/HistoryModal) can remain mostly as they were but updated with the new text sizes ...
const HistoryModal = ({ order, onClose }) => (
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <Card className="max-w-md w-full p-6 animate-in zoom-in-95 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 uppercase tracking-widest text-xs">
          <History size={16} className="text-blue-500" /> Payment History
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-100 rounded-full"
        >
          <X size={20} />
        </button>
      </div>
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {order.paymentHistory?.map((p, i) => (
          <div
            key={i}
            className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100"
          >
            <div>
              <p className="text-[10px] font-bold text-slate-400">
                {new Date(p.date).toLocaleDateString()}
              </p>
              <p className="text-xs font-bold text-slate-700">
                {p.method || "Cash"}
              </p>
            </div>
            <span className="font-bold text-emerald-600 text-sm">
              {formatINR(p.amount)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

const PaymentModal = ({ order, amount, setAmount, onClose, onConfirm }) => (
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <Card className="max-w-sm w-full p-8 animate-in zoom-in-95 shadow-2xl">
      <div className="text-center space-y-2 mb-8">
        <h3 className="text-xl font-bold text-slate-900">Record Payment</h3>
        <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">
          Due: {formatINR(order.dueAmount)}
        </p>
      </div>
      <div className="space-y-4">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
            ₹
          </span>
          <input
            type="number"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-4 pl-10 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-bold text-center outline-none focus:border-emerald-500 transition-all"
            placeholder="0.00"
          />
        </div>
        <Button
          onClick={onConfirm}
          fullWidth
          variant="primary"
          className="py-4 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
        >
          Record Transaction
        </Button>
        <button
          onClick={onClose}
          className="w-full text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600"
        >
          Cancel
        </button>
      </div>
    </Card>
  </div>
);

export default OrdersPage;
