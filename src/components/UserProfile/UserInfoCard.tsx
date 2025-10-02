import { useState } from "react";
import { AuthService } from "../../services/auth/auth.services";
import toastHelper from "../../utils/toastHelper";

interface FormData {
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
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
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [certificateImage, setCertificateImage] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        businessName: formData.businessName || undefined,
        country: formData.businessCountry || undefined,
        address: formData.businessAddress || undefined,
        name: formData.name || undefined,
        email: formData.email || undefined,
        mobileNumber: formData.phone || undefined,
        logo: logoFile || undefined,
        certificate: certificateFile || undefined,
      } as any;

      await AuthService.updateProfile(payload);

      try {
        const profile = await AuthService.getProfile();
        const stored = localStorage.getItem("user");
        const prevUser = stored ? JSON.parse(stored) : {};
        const merged = {
          ...prevUser,
          name: profile?.data?.name ?? payload.name ?? prevUser?.name,
          email: profile?.data?.email ?? payload.email ?? prevUser?.email,
          mobileNumber: profile?.data?.mobileNumber ?? payload.mobileNumber ?? prevUser?.mobileNumber,
          businessProfile: {
            ...(prevUser?.businessProfile || {}),
            businessName: profile?.data?.businessName ?? payload.businessName ?? prevUser?.businessProfile?.businessName,
            country: profile?.data?.country ?? payload.country ?? prevUser?.businessProfile?.country,
            address: profile?.data?.address ?? payload.address ?? prevUser?.businessProfile?.address,
            logo: profile?.data?.logo ?? prevUser?.businessProfile?.logo,
            certificate: profile?.data?.certificate ?? prevUser?.businessProfile?.certificate,
          },
        };
        localStorage.setItem("user", JSON.stringify(merged));
      } catch {}

      setIsEditing(false);
    } catch (error) {
      // Error toasts handled in service
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toastHelper.showTost("Please fill all password fields", "warning");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toastHelper.showTost("New password and confirm password do not match", "warning");
      return;
    }
    if (formData.newPassword.length < 6) {
      toastHelper.showTost("Password must be at least 6 characters", "warning");
      return;
    }

    try {
      setIsChangingPassword(true);
      const response = await AuthService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      if(!response) return;

      // Clear password fields on success
      handleChange({ target: { name: 'currentPassword', value: '' } } as React.ChangeEvent<HTMLInputElement>);
      handleChange({ target: { name: 'newPassword', value: '' } } as React.ChangeEvent<HTMLInputElement>);
      handleChange({ target: { name: 'confirmPassword', value: '' } } as React.ChangeEvent<HTMLInputElement>);
    } catch (error) {
      // Error toast already handled in service
    } finally {
      setIsChangingPassword(false);
    }
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
          setLogoFile(file);
        } else {
          setCertificateImage(result);
          setCertificateFile(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (type: 'logo' | 'certificate') => {
    if (type === 'logo') {
      setLogoImage(null);
      setLogoFile(null);
    } else {
      setCertificateImage(null);
      setCertificateFile(null);
    }
  };

  return (
    <div className="p-5 border bg-white border-gray-200 rounded-2xl shadow dark:border-gray-800 lg:p-6">
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

      {activeTab === "profile" ? (
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <i className="fas fa-user-circle text-[#0071E3]"></i>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 gap-6">
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
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <i className="fas fa-building text-[#0071E3]"></i>
              Business Details
            </h3>
            <div className="grid grid-cols-1 gap-6">
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
              onClick={handleChangePassword}
              className="flex items-center justify-center gap-2 rounded-full border border-gray-300 
    bg-[#0071E3] px-4 py-3 text-base font-medium text-white shadow 
    hover:bg-[#005bb5] dark:border-gray-700 dark:bg-gray-800 
      dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <span className="flex items-center justify-center w-[160px]">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 
             5.373 0 12h4zm2 5.291A7.962 7.962 
             0 014 12H0c0 3.042 1.135 5.824 
             3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
              ) : (
                <span className="flex items-center justify-center w-[160px] gap-2">
                  <i className="fa-solid fa-pen-to-square"></i> Change Password
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-end mt-6 gap-3">
        {isEditing ? (
            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 rounded-full border border-green-500 bg-green-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-green-600 disabled:opacity-60"
              disabled={isSaving}
            >
              {isSaving ? (
                <span className="flex items-center justify-center w-[80px]">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 
             5.373 0 12h4zm2 5.291A7.962 7.962 
             0 014 12H0c0 3.042 1.135 5.824 
             3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
              ) : (
                <span className="flex items-center justify-center w-[80px] gap-2">
                  <i className="fas fa-save"></i> Save
                </span>
              )}
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
