import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Download,
  Upload,
  Loader2,
  Package,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "react-toastify";

// --- Custom Components ---
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import ImportModal from "../../components/common/ImportModal";

// --- Redux API ---
import {
  useDeleteProductMutation,
  useGetProductsQuery,
} from "../../redux/api/apiSlice";

// ==========================================
// 1. CONSTANTS & UTILITIES
// ==========================================
const DATA_TYPE = "products";

const getBadgeVariant = (status) => {
  const variants = {
    "In Stock": "success",
    "Low Stock": "warning",
    Critical: "critical",
  };
  return variants[status] || "success";
};

// ==========================================
// 2. THE BRAINS (Custom Hook)
// ==========================================
const useInventoryLogic = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract URL State (Single Source of Truth)
  const searchQuery = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page")) || 1;
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const order = searchParams.get("order") || "desc";

  // API Calls

  const { data } = useGetProductsQuery({
    search: searchQuery,
    page,
    sortBy,
    order,
  });
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  // Safe Data Extraction
  const products = data?.products || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.totalItems || 0;

  // Actions
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await deleteProduct(id).unwrap();
      toast.success("Product deleted successfully");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete product");
    }
  };

  const handleExport = () => {
    window.open(`http://localhost:5000/api/data/export/${DATA_TYPE}`, "_blank");
  };

  const handlePageChange = (newPage) => {
    searchParams.set("page", newPage);
    setSearchParams(searchParams);
  };

  const handleSort = (columnKey) => {
    if (!columnKey) return; // Ignore un-sortable columns
    const newOrder = sortBy === columnKey && order === "asc" ? "desc" : "asc";
    searchParams.set("sortBy", columnKey);
    searchParams.set("order", newOrder);
    searchParams.set("page", 1); // Reset to page 1 on new sort
    setSearchParams(searchParams);
  };

  return {
    products,
    totalPages,
    currentPage: page,
    totalItems,
    searchQuery,
    isDeleting,
    sortBy,
    order,
    handleDelete,
    handleExport,
    handlePageChange,
    handleSort,
  };
};

// ==========================================
// 3. THE MAIN COMPONENT (Wiring it together)
// ==========================================
const InventoryPage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Consume our custom hook
  const {
    products,
    totalPages,
    currentPage,
    totalItems,
    isLoading,
    isError,
    error,
    searchQuery,
    isDeleting,
    sortBy,
    order,
    handleDelete,
    handleExport,
    handlePageChange,
    handleSort,
  } = useInventoryLogic();

  // Guard Clauses
  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState error={error} />;

  return (
    <div className="space-y-6">
      <ImportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dataType={DATA_TYPE}
      />

      {/* --- HEADER --- */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
            Inventory
          </p>
          <h2 className="text-2xl font-bold text-slate-800">Product Catalog</h2>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleExport} variant="outline">
            <Download size={16} className="mr-2" /> Export CSV
          </Button>
          <Button onClick={() => setIsModalOpen(true)} variant="outline">
            <Upload size={16} className="mr-2" /> Import CSV
          </Button>
          <Button onClick={() => navigate("/inventory/add")} variant="primary">
            + Add Product
          </Button>
        </div>
      </div>

      {/* --- DATA TABLE --- */}
      <Card className="p-0 overflow-hidden border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <SortableHeader
                  label="Product"
                  columnKey="name"
                  currentSort={sortBy}
                  currentOrder={order}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="SKU"
                  columnKey="sku"
                  currentSort={sortBy}
                  currentOrder={order}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Quantity"
                  columnKey="quantity"
                  currentSort={sortBy}
                  currentOrder={order}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Status"
                  columnKey="status"
                  currentSort={sortBy}
                  currentOrder={order}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Price"
                  columnKey="price"
                  currentSort={sortBy}
                  currentOrder={order}
                  onSort={handleSort}
                />
                <th className="py-3 px-6 text-sm font-semibold text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <EmptyState searchQuery={searchQuery} colSpan={6} />
              ) : (
                products.map((product) => (
                  <ProductRow
                    key={product._id}
                    product={product}
                    onEdit={() => navigate(`/inventory/edit/${product._id}`)}
                    onDelete={() => handleDelete(product._id)}
                    isDeleting={isDeleting}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION --- */}
        {totalPages > 1 && (
          <PaginationFooter
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemCount={products.length}
            onPageChange={handlePageChange}
          />
        )}
      </Card>
    </div>
  );
};

// ==========================================
// 4. UI LEGO BLOCKS (Sub-components)
// ==========================================

const SortableHeader = ({
  label,
  columnKey,
  currentSort,
  currentOrder,
  onSort,
}) => {
  const isActive = currentSort === columnKey;
  return (
    <th
      onClick={() => onSort(columnKey)}
      className="py-3 px-6 text-sm font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors select-none group"
    >
      <div className="flex items-center gap-1">
        {label}
        <span
          className={`flex flex-col text-[10px] leading-none ${isActive ? "text-blue-600" : "text-slate-300 group-hover:text-slate-400"}`}
        >
          <ArrowUp
            size={12}
            className={isActive && currentOrder === "desc" ? "opacity-30" : ""}
          />
          <ArrowDown
            size={12}
            className={`-mt-1 ${isActive && currentOrder === "asc" ? "opacity-30" : ""}`}
          />
        </span>
      </div>
    </th>
  );
};

const ProductRow = ({ product, onEdit, onDelete, isDeleting }) => (
  <tr className="hover:bg-slate-50 transition-colors">
    <td className="py-4 px-6 flex items-center gap-3">
      <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
        <Package size={20} />
      </div>
      <div>
        <p className="font-semibold text-slate-800">{product.name}</p>
        <p className="text-xs text-slate-500">
          {product.category || "Uncategorized"}
        </p>
      </div>
    </td>
    <td className="py-4 px-6 text-sm text-slate-600 font-mono">
      {product.sku}
    </td>
    <td className="py-4 px-6 text-sm font-bold text-slate-800">
      {product.quantity}
    </td>
    <td className="py-4 px-6">
      <Badge variant={getBadgeVariant(product.status)}>{product.status}</Badge>
    </td>
    <td className="py-4 px-6 text-sm font-medium text-slate-700">
      {product.currency} {product.price.toFixed(2)}
    </td>
    <td className="py-4 px-6">
      <div className="flex gap-2">
        <Button onClick={onEdit} variant="outline" size="sm">
          Edit
        </Button>
        <Button
          onClick={onDelete}
          variant="dangerOutline"
          size="sm"
          disabled={isDeleting}
        >
          Delete
        </Button>
      </div>
    </td>
  </tr>
);

const PaginationFooter = ({
  currentPage,
  totalPages,
  totalItems,
  itemCount,
  onPageChange,
}) => (
  <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
    <p className="text-sm text-slate-500">
      Showing <span className="font-bold text-slate-700">{itemCount}</span> of{" "}
      <span className="font-bold text-slate-700">{totalItems}</span> items
    </p>
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      <span className="px-3 py-1 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded">
        {currentPage} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  </div>
);

const EmptyState = ({ searchQuery, colSpan }) => (
  <tr>
    <td colSpan={colSpan} className="py-16 text-center">
      <div className="flex flex-col items-center justify-center text-slate-500">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Package size={32} className="text-slate-400" />
        </div>
        <p className="text-lg font-bold text-slate-700">No products found</p>
        <p className="text-sm mt-1 max-w-sm">
          {searchQuery
            ? `We couldn't find anything matching "${searchQuery}". Try checking for typos.`
            : "Your inventory is completely empty. Start by adding a new product or importing a CSV."}
        </p>
      </div>
    </td>
  </tr>
);

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
    <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-600" />
    <p className="font-medium">Loading catalog...</p>
  </div>
);

const ErrorState = ({ error }) => (
  <div className="m-6 p-6 bg-red-50 text-red-700 rounded-xl border border-red-200 flex flex-col items-center text-center">
    <p className="text-lg font-bold">Failed to load inventory</p>
    <p className="text-sm mt-2">
      {error?.data?.message ||
        "Ensure your Node.js backend is running and connected to MongoDB."}
    </p>
  </div>
);

export default InventoryPage;
