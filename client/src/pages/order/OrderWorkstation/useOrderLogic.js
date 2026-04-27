import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useGetProductsQuery,
  useGetCustomersQuery,
  useAddOrderMutation,
  useGetOrderQuery,
  useUpdateOrderMutation,
} from "../../../redux/api/apiSlice";

export const useOrderLogic = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { pathname } = useLocation();

  const isViewOnly = pathname.includes("/view/");
  const isEditMode = pathname.includes("/edit/");
  const isExisting = isViewOnly || isEditMode;

  const { data: productsData, isLoading: loadingProducts } =
    useGetProductsQuery({ limit: 100 });
  const { data: customersData } = useGetCustomersQuery({ limit: 100 });
  const { data: existingOrder, isLoading: loadingOrder } = useGetOrderQuery(
    id,
    { skip: !isExisting },
  );

  const [addOrder, { isLoading: isCreating }] = useAddOrderMutation();
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();

  const [searchTerm, setSearchTerm] = useState("");

  // CONSOLIDATED STATE
  const [formState, setFormState] = useState({
    customerId: "",
    paidAmount: 0,
    cart: [],
    isHydrated: false,
  });

  // HYDRATION FIX: Use a single update and a timeout to prevent cascading render error
  useEffect(() => {
    if (isExisting && existingOrder && !formState.isHydrated) {
      const mappedItems =
        existingOrder.items?.map((item) => ({
          product: item.product,
          name: item.name,
          price: item.priceAtPurchase,
          quantity: item.quantity,
          stock: 999,
        })) || [];

      const timer = setTimeout(() => {
        setFormState({
          customerId: existingOrder.customerId || "",
          paidAmount: existingOrder.paidAmount || 0,
          cart: mappedItems,
          isHydrated: true,
        });
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [existingOrder, isExisting, formState.isHydrated]);

  const updateForm = (updates) =>
    setFormState((prev) => ({ ...prev, ...updates }));

  const subtotal = useMemo(() => {
    return formState.cart.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
  }, [formState.cart]);

  const balanceDue = Math.max(0, subtotal - formState.paidAmount);

  const addToCart = (product) => {
    if (isViewOnly) return;
    const exists = formState.cart.find((i) => i.product === product._id);
    if (exists) {
      updateQty(product._id, 1);
    } else {
      updateForm({
        cart: [
          ...formState.cart,
          {
            product: product._id,
            name: product.name,
            price: product.price,
            quantity: 1,
            stock: product.quantity,
          },
        ],
      });
    }
  };

  const updateQty = (pid, delta) => {
    if (isViewOnly) return;
    const newCart = formState.cart.map((i) =>
      i.product === pid
        ? { ...i, quantity: Math.max(1, i.quantity + delta) }
        : i,
    );
    updateForm({ cart: newCart });
  };

  const removeFromCart = (pid) => {
    updateForm({ cart: formState.cart.filter((i) => i.product !== pid) });
  };

  const handleSave = async () => {
    if (!formState.customerId) return toast.error("Please select a customer");
    const payload = {
      customerId: formState.customerId,
      items: formState.cart,
      paidAmount: Number(formState.paidAmount),
    };

    try {
      if (isEditMode) {
        await updateOrder({ id, ...payload }).unwrap();
        toast.success("Transaction Updated");
      } else {
        await addOrder(payload).unwrap();
        toast.success("Transaction Finalized");
      }
      navigate("/orders");
    } catch (err) {
      toast.error(err?.data?.message || "Operation failed");
    }
  };

  return {
    navigate,
    isViewOnly,
    isEditMode,
    isExisting,
    productsData,
    customersData,
    existingOrder,
    loadingOrder,
    loadingProducts,
    searchTerm,
    setSearchTerm,
    formState,
    updateForm,
    subtotal,
    balanceDue,
    addToCart,
    updateQty,
    removeFromCart,
    handleSave,
    isProcessing: isCreating || isUpdating,
  };
};
