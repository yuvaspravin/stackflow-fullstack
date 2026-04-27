import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useAddProductMutation,
  useGetProductQuery,
  useUpdateProductMutation,
} from "../../redux/api/apiSlice";

const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  categoryPrefix: z.string().min(1, "Select a category"),
  size: z.string().min(1, "Select a size"),
  color: z.string().min(1, "Select a color"),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  currency: z.string().min(1, "Select a currency"),
});

export default function AddProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [addProduct, { isLoading: isAdding }] = useAddProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const { data: existingProduct, isLoading: isFetching } = useGetProductQuery(
    id,
    { skip: !isEditMode },
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      categoryPrefix: "",
      size: "",
      color: "",
      quantity: 0,
      price: 0,
      currency: "USD",
    },
  });

  const qty = watch("quantity");
  const price = watch("price");
  const currency = watch("currency");
  const generatedSku = `${watch("categoryPrefix") || "XXX"}-${watch("size") || "000"}-${watch("color") || "XXX"}`;
  const totalValue = (qty * price).toFixed(2);

  // Auto-fill for Edit Mode
  useEffect(() => {
    if (existingProduct && isEditMode) {
      const skuParts = existingProduct.sku.split("-");
      reset({
        name: existingProduct.name,
        categoryPrefix: skuParts[0] || "",
        size: skuParts[1] || "",
        color: skuParts[2] || "",
        quantity: existingProduct.quantity,
        price: existingProduct.price,
        currency: existingProduct.currency || "USD",
      });
    }
  }, [existingProduct, isEditMode, reset]);

  const onSubmit = async (data) => {
    try {
      const productData = {
        name: data.name,
        sku: generatedSku,
        quantity: data.quantity,
        price: data.price,
        currency: data.currency,
      };

      if (isEditMode) {
        await updateProduct({ id, ...productData }).unwrap();
        toast.success("Product updated!");
      } else {
        await addProduct(productData).unwrap();
        toast.success("Product added!");
      }
      navigate("/inventory");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save product");
    }
  };

  if (isFetching) return <p>Loading data...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">
        {isEditMode ? "Edit Product" : "Add New Product"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input {...register("name")} className="w-full p-2 border rounded" />
          {errors.name && (
            <p className="text-red-500 text-xs">{errors.name.message}</p>
          )}
        </div>

        <div className="p-4 bg-gray-50 border rounded grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium">Category</label>
            <select
              {...register("categoryPrefix")}
              className="w-full p-2 border rounded"
            >
              <option value="">Select...</option>
              <option value="AWB">Water Bottle</option>
              <option value="TSH">T-Shirt</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium">Size</label>
            <select {...register("size")} className="w-full p-2 border rounded">
              <option value="">Select...</option>
              <option value="500">500ml/SM</option>
              <option value="1000">1000ml/MD</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium">Color</label>
            <select
              {...register("color")}
              className="w-full p-2 border rounded"
            >
              <option value="">Select...</option>
              <option value="BLK">Black</option>
              <option value="BLU">Blue</option>
            </select>
          </div>
          <p className="col-span-3 text-sm font-bold text-blue-600 mt-2">
            SKU: {generatedSku}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Quantity</label>
            <input
              {...register("quantity")}
              type="number"
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-sm font-medium">Price</label>
            <div className="flex">
              <select
                {...register("currency")}
                className="p-2 border rounded-l bg-gray-100"
              >
                <option value="USD">USD</option>
                <option value="INR">INR</option>
              </select>
              <input
                {...register("price")}
                type="number"
                step="0.01"
                className="w-full p-2 border rounded-r"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Total Value</label>
            <div className="w-full p-2 border rounded bg-gray-100 font-bold">
              {currency} {isNaN(totalValue) ? "0.00" : totalValue}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isAdding || isUpdating}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {isEditMode ? "Update Product" : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
