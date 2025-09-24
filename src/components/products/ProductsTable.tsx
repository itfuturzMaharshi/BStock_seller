import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { format } from "date-fns";
import toastHelper from "../../utils/toastHelper";
import UploadExcelModal from "./UploadExcelModal";
import ProductModal from "./ProductsModal";
import { ProductService } from "../../services/products/products.services";

interface Product {
  _id: string;
  specification: string;
  simType: string;
  color: string;
  ram: string;
  storage: string;
  condition: string;
  price: number;
  stock: number;
  country: string;
  moq: number;
  isNegotiable: boolean;
  isFlashDeal: boolean;
  expiryTime: string;
  isVerified: boolean;
  isApproved: boolean;
  canVerify: boolean;
  canApprove: boolean;
}

const ProductsTable: React.FC = () => {
  const [productsData, setProductsData] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalDocs, setTotalDocs] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const itemsPerPage = 10;

  // Fetch products on component mount and when page/search changes
  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await ProductService.list({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
      });
      const docs = (response && response.data && Array.isArray(response.data.docs)) ? response.data.docs : [];
      setProductsData(docs);
      setTotalDocs(Number(response?.data?.totalDocs) || docs.length || 0);
      setTotalPages(Number(response?.data?.totalPages) || 1);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toastHelper.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (productData: any) => {
    try {
      // Convert string values to numbers where needed
      const processedData = {
        ...productData,
        price:
          typeof productData.price === "string"
            ? parseFloat(productData.price)
            : productData.price,
        stock:
          typeof productData.stock === "string"
            ? parseInt(productData.stock)
            : productData.stock,
        moq:
          typeof productData.moq === "string"
            ? parseInt(productData.moq)
            : productData.moq,
        purchaseType:
          String(productData.purchaseType).trim().toLowerCase() === "full"
            ? "full"
            : "partial",
      };

      if (editProduct && editProduct._id) {
        // Update existing product
        await ProductService.update({ id: editProduct._id, ...processedData });
        toastHelper.showTost("Product updated successfully!", "success");
      } else {
        // Create new product
        await ProductService.create(processedData);
        toastHelper.showTost("Product added successfully!", "success");
      }
      setIsModalOpen(false);
      setEditProduct(null);
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error("Failed to save product:", error);
      toastHelper.error("Failed to save product");
    }
  };

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDelete = async (product: Product) => {
    setOpenMenuId(null);
    if (!product._id) return;

    const confirmed = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    });

    if (confirmed.isConfirmed) {
      try {
        await ProductService.deleteProduct(product._id);
        toastHelper.showTost("Product deleted successfully!", "success");
        fetchProducts(); // Refresh the list
      } catch (error) {
        console.error("Failed to delete product:", error);
        toastHelper.error("Failed to delete product");
      }
    }
  };

  const handleVerify = async (product: Product) => {
    setOpenMenuId(null);
    if (!product._id) return;

    const confirmed = await Swal.fire({
      title: "Verify Product",
      text: "Are you sure you want to verify this product?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, verify it!",
      cancelButtonText: "No, cancel!",
    });

    if (confirmed.isConfirmed) {
      try {
        const result = await ProductService.verifyProduct(product._id);
        if (result !== false) {
          toastHelper.showTost("Product verified successfully!", "success");
          fetchProducts(); // Refresh the list only if successful
        }
      } catch (error) {
        console.error("Failed to verify product:", error);
        toastHelper.error("Failed to verify product");
      }
    }
  };

  const handleApprove = async (product: Product) => {
    setOpenMenuId(null);
    if (!product._id) return;

    const confirmed = await Swal.fire({
      title: "Approve Product",
      text: "Are you sure you want to approve this product?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, approve it!",
      cancelButtonText: "No, cancel!",
    });

    if (confirmed.isConfirmed) {
      try {
        const result = await ProductService.approveProduct(product._id);
        if (result !== false) {
          toastHelper.showTost("Product approved successfully!", "success");
          fetchProducts(); // Refresh the list only if successful
        }
      } catch (error) {
        console.error("Failed to approve product:", error);
        toastHelper.error("Failed to approve product");
      }
    }
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setOpenMenuId(null);
  };

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // Prefer the first image from populated skuFamily when available
  const getProductImageSrc = (product: Product): string => {
    return "https://via.placeholder.com/60x60?text=Product";
  };

  // Helper function to safely format price
  const formatPrice = (price: number | string): string => {
    if (typeof price === "string") {
      const num = parseFloat(price);
      return isNaN(num) ? "0.00" : num.toFixed(2);
    }
    return price.toFixed(2);
  };

  // Format expiryTime for display
  const formatExpiryTime = (expiryTime: string): string => {
    if (!expiryTime) return "-";
    try {
      const date = new Date(expiryTime);
      return format(date, "yyyy-MM-dd HH:mm");
    } catch {
      return "-";
    }
  };

  // Get status badge for product
  const getStatusBadge = (product: Product) => {
    if (product.isApproved) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <i className="fas fa-check-circle mr-1"></i>
          Approved
        </span>
      );
    } else if (product.isVerified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <i className="fas fa-clock mr-1"></i>
          Under Approval
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <i className="fas fa-exclamation-circle mr-1"></i>
          Under Verification
        </span>
      );
    }
  };

  return (
    <div className="p-4 max-w-[calc(100vw-360px)] mx-auto">
      {/* Table Container */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 shadow-sm">
        {/* Table Header with Controls */}
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search by SKU Family ID or other..."
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-[#0071E0] text-white px-4 py-2 text-sm font-medium hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <i className="fas fa-upload text-xs"></i>
              Upload File
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-[#0071E0] text-white px-4 py-2 text-sm font-medium hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
              onClick={() => {
                setEditProduct(null);
                setIsModalOpen(true);
              }}
            >
              <i className="fas fa-plus text-xs"></i>
              Add Product
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-100 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 align-middle">
                  Image
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 align-middle">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 align-middle">
                  SIM Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 align-middle">
                  Color
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 align-middle">
                  RAM
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 align-middle">
                  Storage
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 align-middle">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 align-middle">
                  Country
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 align-middle">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 align-middle">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400 text-lg">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600 mx-auto mb-4"></div>
                      Loading Products...
                    </div>
                  </td>
                </tr>
              ) : (Array.isArray(productsData) ? productsData.length === 0 : true) ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400 text-lg">
                      No products found
                    </div>
                  </td>
                </tr>
              ) : (
                (Array.isArray(productsData) ? productsData : []).map((item: Product, index: number) => (
                  <tr
                    key={item._id || index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <img
                        src={getProductImageSrc(item)}
                        alt={item.specification || "Product"}
                        className="w-12 h-12 object-contain rounded-md border border-gray-200 dark:border-gray-600"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-gray-200">
                      {item.specification}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {item.simType}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {item.color}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {item.ram}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {item.storage}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      ${formatPrice(item.price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {item.country}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      {getStatusBadge(item)}
                    </td>
                    <td className="px-6 py-4 text-sm text-center relative">
                      <button
                        onClick={() => toggleMenu(item._id)}
                        className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                        title="Actions"
                      >
                        <i className="fas fa-ellipsis-v"></i>
                      </button>
                      {openMenuId === item._id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10">
                          <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
                            <li>
                              <button
                                onClick={() => handleView(item)}
                                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                              >
                                <i className="fas fa-eye mr-2"></i> View
                              </button>
                            </li>
                            {item.canVerify && (
                              <li>
                                <button
                                  onClick={() => handleVerify(item)}
                                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                >
                                  <i className="fas fa-check mr-2"></i> Verify
                                </button>
                              </li>
                            )}
                            {item.canApprove && (
                              <li>
                                <button
                                  onClick={() => handleApprove(item)}
                                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                >
                                  <i className="fas fa-thumbs-up mr-2"></i> Approve
                                </button>
                              </li>
                            )}
                            <li>
                              <button
                                onClick={() => handleEdit(item)}
                                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                              >
                                <i className="fas fa-edit mr-2"></i> Edit
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => handleDelete(item)}
                                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left text-red-600 dark:text-red-400"
                              >
                                <i className="fas fa-trash mr-2"></i> Delete
                              </button>
                            </li>
                          </ul>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-0">
            Showing {productsData.length} of {totalDocs} items
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-sm transition-colors"
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      currentPage === pageNum
                        ? "bg-[#0071E0] text-white dark:bg-blue-500 dark:text-white border border-blue-600 dark:border-blue-500"
                        : "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    } transition-colors`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-sm transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditProduct(null);
        }}
        onSave={handleSave}
        editItem={editProduct || undefined}
      />
      <UploadExcelModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={fetchProducts}
      />

      {/* View Product Popup */}
      {selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <i className="fas fa-times"></i>
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Product Details</h2>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p><strong>Specification:</strong> {selectedProduct.specification}</p>
              <p><strong>SIM Type:</strong> {selectedProduct.simType}</p>
              <p><strong>Color:</strong> {selectedProduct.color}</p>
              <p><strong>RAM:</strong> {selectedProduct.ram}</p>
              <p><strong>Storage:</strong> {selectedProduct.storage}</p>
              <p><strong>Condition:</strong> {selectedProduct.condition}</p>
              <p><strong>Price:</strong> ${formatPrice(selectedProduct.price)}</p>
              <p><strong>Stock:</strong> {selectedProduct.stock}</p>
              <p><strong>Country:</strong> {selectedProduct.country}</p>
              <p><strong>MOQ:</strong> {selectedProduct.moq}</p>
              <p><strong>Is Negotiable:</strong> {selectedProduct.isNegotiable ? "Yes" : "No"}</p>
              <p><strong>Is Flash Deal:</strong> {selectedProduct.isFlashDeal ? "Yes" : "No"}</p>
              <p><strong>Expiry Time:</strong> {formatExpiryTime(selectedProduct.expiryTime)}</p>
              <p><strong>Status:</strong> {selectedProduct.isApproved ? "Approved" : selectedProduct.isVerified ? "Under Approval" : "Under Verification"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsTable;