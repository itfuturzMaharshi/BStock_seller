import { useState } from "react";

interface FormData {
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  // Business Details
  businessName: string;
  businessCountry: string;
  businessAddress: string;
}

interface UserInfoCardProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export default function UserInfoCard({ formData, handleChange }: UserInfoCardProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"profile" | "account">("profile");
  const [showPassword, setShowPassword] = useState<{
    current: boolean;
    new: boolean;
    confirm: boolean;
  }>({
    current: false,
    new: false,
    confirm: false,
  });

  // State for logo and certificate images
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [certificateImage, setCertificateImage] = useState<string | null>(null);

  const handleSave = () => {
    console.log("Saving changes...", formData);
    setIsEditing(false);
  };

  const togglePassword = (field: "current" | "new" | "confirm") => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'certificate') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (type === 'logo') {
          setLogoImage(result);
        } else {
          setCertificateImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (type: 'logo' | 'certificate') => {
    if (type === 'logo') {
      setLogoImage(null);
    } else {
      setCertificateImage(null);
    }
  };

  return (
    <div className="p-5 border bg-white border-gray-200 rounded-2xl shadow dark:border-gray-800 lg:p-6">
      {/* Tabs */}
      <div className="flex gap-6 border-b pb-3 mb-5">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-2 text-base font-medium ${
            activeTab === "profile"
              ? "border-b-2 border-[#0071E3] text-[#0071E3]"
              : "text-gray-600 dark:text-gray-400 hover:text-[#0071E3]"
          }`}
        >
          <i className="fas fa-user mr-2"></i> Profile
        </button>

        <button
          onClick={() => setActiveTab("account")}
          className={`pb-2 text-base font-medium ${
            activeTab === "account"
              ? "border-b-2 border-[#0071E3] text-[#0071E3]"
              : "text-gray-600 dark:text-gray-400 hover:text-[#0071E3]"
          }`}
        >
          <i className="fas fa-cog mr-2"></i> Account Setting
        </button>
      </div>

      {/* Content */}
      {activeTab === "profile" ? (
        <div className="space-y-8">
          {/* Personal Information Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <i className="fas fa-user-circle text-[#0071E3]"></i>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 gap-6">
              {/* Name */}
              <div>
                <p className="mb-2 flex items-center gap-2 text-base font-medium text-gray-600 dark:text-gray-400">
                  <i className="fas fa-user text-gray-500"></i> Name
                </p>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring focus:ring-brand-300 dark:bg-gray-800 dark:text-white/90"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {formData.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <p className="mb-2 flex items-center gap-2 text-base font-medium text-gray-600 dark:text-gray-400">
                  <i className="fas fa-envelope text-gray-500"></i> Email
                </p>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring focus:ring-brand-300 dark:bg-gray-800 dark:text-white/90"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {formData.email}
                  </p>
                )}
              </div>

              {/* Country Code + Phone */}
              <div>
                <p className="mb-2 flex items-center gap-2 text-base font-medium text-gray-600 dark:text-gray-400">
                  <i className="fas fa-phone text-gray-500"></i> Phone
                </p>
                <div className="flex gap-3">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={handleChange}
                        className="w-20 px-3 py-2 text-sm border rounded-lg focus:ring focus:ring-brand-300 dark:bg-gray-800 dark:text-white/90"
                      />
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="flex-1 px-3 py-2 text-sm border rounded-lg focus:ring focus:ring-brand-300 dark:bg-gray-800 dark:text-white/90"
                      />
                    </>
                  ) : (
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {formData.countryCode} {formData.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Business Details Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <i className="fas fa-building text-[#0071E3]"></i>
              Business Details
            </h3>
            <div className="grid grid-cols-1 gap-6">
              {/* Business Name */}
              <div>
                <p className="mb-2 flex items-center gap-2 text-base font-medium text-gray-600 dark:text-gray-400">
                  <i className="fas fa-briefcase text-gray-500"></i> Business Name
                </p>
                {isEditing ? (
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring focus:ring-brand-300 dark:bg-gray-800 dark:text-white/90"
                    placeholder="Enter your business name"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {formData.businessName || 'Not specified'}
                  </p>
                )}
              </div>

              {/* Business Country */}
              <div>
                <p className="mb-2 flex items-center gap-2 text-base font-medium text-gray-600 dark:text-gray-400">
                  <i className="fas fa-globe text-gray-500"></i> Country
                </p>
                {isEditing ? (
                  <input
                    type="text"
                    name="businessCountry"
                    value={formData.businessCountry}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring focus:ring-brand-300 dark:bg-gray-800 dark:text-white/90"
                    placeholder="Enter your country"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {formData.businessCountry || 'Not specified'}
                  </p>
                )}
              </div>

              {/* Business Address (Optional) */}
              <div>
                <p className="mb-2 flex items-center gap-2 text-base font-medium text-gray-600 dark:text-gray-400">
                  <i className="fas fa-map-marker-alt text-gray-500"></i> Address 
                  <span className="text-xs text-gray-400">(Optional)</span>
                </p>
                {isEditing ? (
                  <textarea
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring focus:ring-brand-300 dark:bg-gray-800 dark:text-white/90 resize-none"
                    placeholder="Enter your business address"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {formData.businessAddress || 'Not specified'}
                  </p>
                )}
              </div>

              {/* Logo (Optional) */}
              <div>
                <p className="mb-2 flex items-center gap-2 text-base font-medium text-gray-600 dark:text-gray-400">
                  <i className="fas fa-image text-gray-500"></i> Logo 
                  <span className="text-xs text-gray-400">(Optional)</span>
                </p>
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'logo')}
                      className="w-full px-3 py-2 text-sm border rounded-lg focus:ring focus:ring-brand-300 dark:bg-gray-800 dark:text-white/90"
                    />
                    {logoImage && (
                      <div className="relative inline-block">
                        <img
                          src={logoImage}
                          alt="Logo preview"
                          className="w-20 h-20 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage('logo')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {logoImage ? (
                      <img
                        src={logoImage}
                        alt="Business logo"
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        No logo uploaded
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Certificate (Optional) */}
              <div>
                <p className="mb-2 flex items-center gap-2 text-base font-medium text-gray-600 dark:text-gray-400">
                  <i className="fas fa-certificate text-gray-500"></i> Certificate 
                  <span className="text-xs text-gray-400">(Optional)</span>
                </p>
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleImageUpload(e, 'certificate')}
                      className="w-full px-3 py-2 text-sm border rounded-lg focus:ring focus:ring-brand-300 dark:bg-gray-800 dark:text-white/90"
                    />
                    {certificateImage && (
                      <div className="relative inline-block">
                        <img
                          src={certificateImage}
                          alt="Certificate preview"
                          className="w-32 h-24 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage('certificate')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {certificateImage ? (
                      <img
                        src={certificateImage}
                        alt="Business certificate"
                        className="w-32 h-24 object-cover rounded-lg border"
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        No certificate uploaded
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Current Password */}
          <div>
            <p className="mb-2 flex items-center gap-2 text-base font-medium text-gray-600 dark:text-gray-400">
              <i className="fas fa-lock text-gray-500"></i> Current Password
            </p>
            <div className="relative">
              <input
                type={showPassword.current ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 pr-10 text-sm border rounded-lg focus:ring focus:ring-brand-300 dark:bg-gray-800 dark:text-white/90"
              />
              <button
                type="button"
                onClick={() => togglePassword("current")}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                <i
                  className={`fas ${
                    showPassword.current ? "fa-eye" : "fa-eye-slash"
                  }`}
                ></i>
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <p className="mb-2 flex items-center gap-2 text-base font-medium text-gray-600 dark:text-gray-400">
              <i className="fas fa-lock text-gray-500"></i> New Password
            </p>
            <div className="relative">
              <input
                type={showPassword.new ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 pr-10 text-sm border rounded-lg focus:ring focus:ring-brand-300 dark:bg-gray-800 dark:text-white/90"
              />
              <button
                type="button"
                onClick={() => togglePassword("new")}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                <i
                  className={`fas ${
                    showPassword.new ? "fa-eye" : "fa-eye-slash"
                  }`}
                ></i>
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <p className="mb-2 flex items-center gap-2 text-base font-medium text-gray-600 dark:text-gray-400">
              <i className="fas fa-lock text-gray-500"></i> Confirm Password
            </p>
            <div className="relative">
              <input
                type={showPassword.confirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 pr-10 text-sm border rounded-lg focus:ring focus:ring-brand-300 dark:bg-gray-800 dark:text-white/90"
              />
              <button
                type="button"
                onClick={() => togglePassword("confirm")}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                <i
                  className={`fas ${
                    showPassword.confirm ? "fa-eye" : "fa-eye-slash"
                  }`}
                ></i>
              </button>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() =>
                console.log("Password Saved:", formData.newPassword)
              }
              className="flex items-center justify-center gap-2 rounded-full border border-gray-300 
      bg-[#0071E3] px-4 py-3 text-base font-medium text-white shadow 
      hover:bg-[#005bb5] dark:border-gray-700 dark:bg-gray-800 
      dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              <i className="fa-solid fa-pen-to-square"></i> Change Password
            </button>
          </div>
        </div>
      )}

      {/* Edit / Save Button */}
      <div className="flex justify-end mt-6">
        {isEditing ? (
          <button
            onClick={handleSave}
            className="flex items-center justify-center gap-2 rounded-full border border-green-500 bg-green-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-green-600"
          >
            <i className="fas fa-save"></i> Save
          </button>
        ) : (
          activeTab === "profile" && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center justify-center gap-2 rounded-full border border-gray-300 
             bg-[#0071E3] px-4 py-2 text-sm font-medium text-white shadow 
             hover:bg-[#005bb5] dark:border-gray-700 dark:bg-gray-800 
             dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              <i className="fas fa-edit"></i> Edit
            </button>
          )
        )}
      </div>
    </div>
  );
}