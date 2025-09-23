import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Define the interface for Product data
interface Product {
  skuFamilyId: string;
  simType: string | string[];
  color: string;
  ram: string | string[];
  storage: string | string[];
  condition: string;
  price: number;
  stock: number;
  country: string;
  moq: number;
  isNegotiable: boolean;
  isFlashDeal?: string;
  expiryTime?: string;
}

// Define the interface for form data
interface FormData {
  skuFamilyId: string;
  simType: string[];
  color: string;
  ram: string[];
  storage: string[];
  condition: string;
  price: number | string;
  stock: number | string;
  country: string;
  moq: number | string;
  isNegotiable: boolean;
  isFlashDeal: string;
  expiryTime: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newItem: FormData) => void;
  editItem?: Product;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem,
}) => {
  const [formData, setFormData] = useState<FormData>({
    skuFamilyId: "",
    simType: [],
    color: "",
    ram: [],
    storage: [],
    condition: "",
    price: 0,
    stock: 0,
    country: "",
    moq: 0,
    isNegotiable: false,
    isFlashDeal: "",
    expiryTime: "",
  });
  const [dateError, setDateError] = useState<string | null>(null);

  const colorOptions = ["Graphite", "Silver", "Gold", "Sierra Blue", "Mixed"];
  const countryOptions = ["Hongkong", "Dubai", "Singapore"];
  const simOptions = ["E-Sim", "Physical Sim"];
  const ramOptions = ["4GB", "6GB", "8GB", "16GB", "32GB"];
  const storageOptions = ["128GB", "256GB", "512GB", "1TB"];
  const conditionOptions = ["AAA", "A+", "Mixed"];

  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setFormData({
          skuFamilyId: editItem.skuFamilyId,
          simType: Array.isArray(editItem.simType) ? editItem.simType : [editItem.simType].filter(Boolean),
          color: editItem.color,
          ram: Array.isArray(editItem.ram) ? editItem.ram : [editItem.ram].filter(Boolean),
          storage: Array.isArray(editItem.storage) ? editItem.storage : [editItem.storage].filter(Boolean),
          condition: editItem.condition,
          price: editItem.price,
          stock: editItem.stock,
          country: editItem.country,
          moq: editItem.moq,
          isNegotiable: editItem.isNegotiable,
          isFlashDeal: editItem.isFlashDeal || "",
          expiryTime: editItem.expiryTime || "",
        });
      } else {
        setFormData({
          skuFamilyId: "",
          simType: [],
          color: "",
          ram: [],
          storage: [],
          condition: "",
          price: 0,
          stock: 0,
          country: "",
          moq: 0,
          isNegotiable: false,
          isFlashDeal: "",
          expiryTime: "",
        });
      }
      setDateError(null);
    }
  }, [isOpen, editItem]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof FormData) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const current = prev[field] as string[];
      const updated = checked
        ? [...current, value]
        : current.filter((item) => item !== value);
      return { ...prev, [field]: updated };
    });
  };

  const handleDateChange = (date: Date | null) => {
    if (date && !isNaN(date.getTime())) {
      setFormData((prev) => ({
        ...prev,
        expiryTime: date.toISOString(),
      }));
      setDateError(null);
    } else {
      setFormData((prev) => ({
        ...prev,
        expiryTime: "",
      }));
      setDateError("Please select a valid date and time");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.skuFamilyId) {
      alert("Please enter a SKU Family ID");
      return;
    }
    if (!formData.expiryTime) {
      setDateError("Expiry time is required");
      return;
    }
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  const title = editItem ? "Edit Product" : "Create Product";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-[800px] max-h-[88vh] overflow-y-auto transform transition-all duration-300 scale-100">
        {/* Close Icon */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-transform duration-200 hover:scale-110"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
          {title}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SKU Family ID and Country Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-base font-medium text-gray-950 dark:text-gray-200 mb-2">
                SKU Family ID
              </label>
              <input
                type="text"
                name="skuFamilyId"
                value={formData.skuFamilyId}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                placeholder="Enter SKU Family ID"
                required
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-950 dark:text-gray-200 mb-2">
                Country
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                required
              >
                <option value="" disabled>
                  Select Country
                </option>
                {countryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SIM Type and Color Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-base font-medium text-gray-950 dark:text-gray-200 mb-2">
                SIM Type
              </label>
              <div className="space-y-3">
                {simOptions.map((option) => (
                  <div key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      value={option}
                      checked={formData.simType.includes(option)}
                      onChange={(e) => handleCheckboxChange(e, 'simType')}
                      className="h-5 w-5 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 transition duration-200"
                    />
                    <span className="ml-3 text-base text-gray-950 dark:text-gray-200">
                      {option}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-base font-medium text-gray-950 dark:text-gray-200 mb-2">
                Color
              </label>
              <select
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                required
              >
                <option value="" disabled>
                  Select Color
                </option>
                {colorOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* RAM and Storage Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-base font-medium text-gray-950 dark:text-gray-200 mb-2">
                RAM
              </label>
              <div className="space-y-3">
                {ramOptions.map((option) => (
                  <div key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      value={option}
                      checked={formData.ram.includes(option)}
                      onChange={(e) => handleCheckboxChange(e, 'ram')}
                      className="h-5 w-5 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 transition duration-200"
                    />
                    <span className="ml-3 text-base text-gray-950 dark:text-gray-200">
                      {option}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-base font-medium text-gray-950 dark:text-gray-200 mb-2">
                Storage
              </label>
              <div className="space-y-3">
                {storageOptions.map((option) => (
                  <div key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      value={option}
                      checked={formData.storage.includes(option)}
                      onChange={(e) => handleCheckboxChange(e, 'storage')}
                      className="h-5 w-5 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 transition duration-200"
                    />
                    <span className="ml-3 text-base  text-gray-950 dark:text-gray-200">
                      {option}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Condition and Price Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-base font-medium text-gray-950 dark:text-gray-200 mb-2">
                Condition
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                required
              >
                <option value="" disabled>
                  Select Condition
                </option>
                {conditionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-base font-medium text-gray-950 dark:text-gray-200 mb-2">
                Price
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                placeholder="Enter Price"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Stock and MOQ Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-base font-medium text-gray-950 dark:text-gray-200 mb-2">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                placeholder="Enter Stock Quantity"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-950 dark:text-gray-200 mb-2">
                MOQ
              </label>
              <input
                type="number"
                name="moq"
                value={formData.moq}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                placeholder="Enter Minimum Order Quantity"
                required
                min="1"
              />
            </div>
          </div>

          {/* Negotiable, Flash Deal, and Expiry Time Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isNegotiable"
                checked={formData.isNegotiable}
                onChange={handleInputChange}
                className="h-5 w-5 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 transition duration-200"
              />
              <label className="ml-3 text-base font-medium text-gray-950 dark:text-gray-200">
                Is Negotiable
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isFlashDeal"
                checked={formData.isFlashDeal === "true"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isFlashDeal: e.target.checked ? "true" : "",
                  }))
                }
                className="h-5 w-5 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 transition duration-200"
              />
              <label className="ml-3 text-base font-medium text-gray-950 dark:text-gray-200">
                Is Flash Deal
              </label>
            </div>
            <div>
              <label className="block text-base font-medium text-gray-950 dark:text-gray-200 mb-2">
                Expiry Time
              </label>
              <DatePicker
                selected={formData.expiryTime ? new Date(formData.expiryTime) : null}
                onChange={handleDateChange}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy-MM-dd HH:mm"
                placeholderText="Select date and time"
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                required
              />
              {dateError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{dateError}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200 transform hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#0071E0] text-white rounded-lg hover:bg-blue-600 transition duration-200 transform hover:scale-105"
              disabled={!!dateError}
            >
              {editItem ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;