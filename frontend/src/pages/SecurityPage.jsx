import { useState } from "react";
import {
  ShieldIcon,
  KeyIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  CheckCircleIcon,
  XCircleIcon,
  SmartphoneIcon,
  GlobeIcon,
  Trash2Icon,
  LogOutIcon,
  AlertTriangleIcon,
} from "lucide-react";

import useAuthUser from "../hooks/useAuthUser";
import toast from "react-hot-toast";

const SecurityPage = () => {
  const { authUser } = useAuthUser();

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [saved, setSaved] = useState(false);

  const activeSessions = [
    {
      id: 1,
      device: "Chrome on Windows",
      ip: "192.168.1.1",
      location: "New York, US",
      lastActive: "Active now",
      isCurrent: true,
    },
    {
      id: 2,
      device: "Safari on iPhone",
      ip: "192.168.1.1",
      location: "New York, US",
      lastActive: "2 hours ago",
      isCurrent: false,
    },
  ];

  const handlePasswordChange = () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (
      passwordData.newPassword !== passwordData.confirmPassword
    ) {
      toast.error("Passwords do not match");
      return;
    }

    setSaved(true);

    toast.success("Password updated successfully");

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setTimeout(() => setSaved(false), 2000);
  };

  const handleEnable2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);

    toast.success(
      twoFactorEnabled
        ? "Two-factor authentication disabled"
        : "Two-factor authentication enabled"
    );
  };

  const handleRevokeSession = () => {
    toast.success("Session revoked");
  };

  const handleDeleteAccount = () => {
    toast.error("Account deletion is not available yet");
  };

  const strengthChecks = [
    {
      label: "At least 6 characters",
      met: passwordData.newPassword.length >= 6,
    },
    {
      label: "Contains uppercase letter",
      met: /[A-Z]/.test(passwordData.newPassword),
    },
    {
      label: "Contains lowercase letter",
      met: /[a-z]/.test(passwordData.newPassword),
    },
    {
      label: "Contains number",
      met: /\d/.test(passwordData.newPassword),
    },
    {
      label: "Contains special character",
      met: /[!@#$%^&*(),.?":{}|<>]/.test(
        passwordData.newPassword
      ),
    },
  ];

  const strengthScore = strengthChecks.filter(
    (check) => check.met
  ).length;

  return (
    <div className="space-y-8">
      {/* SECURITY OVERVIEW */}
      <section className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/10 via-base-100 to-base-100 p-7 shadow-sm -mt-10">
        <div className="absolute top-0 right-0 w-52 h-52 bg-primary/10 blur-3xl rounded-full" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary text-primary-content shadow-lg">
                <ShieldIcon className="size-6" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-base-content">
                  Security Center
                </h2>

                <p className="text-sm text-base-content/50 mt-1">
                  Manage and secure your account
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <div className="badge badge-success gap-2 px-4 py-4">
                <CheckCircleIcon className="size-3" />
                Email Verified
              </div>

              <div
                className={`badge gap-2 px-4 py-4 ${
                  twoFactorEnabled
                    ? "badge-success"
                    : "badge-warning"
                }`}
              >
                <ShieldIcon className="size-3" />
                {twoFactorEnabled
                  ? "2FA Enabled"
                  : "2FA Disabled"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-base-100/80 border border-base-200 rounded-2xl p-5 min-w-[140px]">
              <p className="text-xs uppercase tracking-wider text-base-content/40 font-semibold">
                Security Score
              </p>

              <h3 className="text-3xl font-bold mt-2 text-primary">
                {twoFactorEnabled ? "95%" : "78%"}
              </h3>
            </div>

            <div className="bg-base-100/80 border border-base-200 rounded-2xl p-5 min-w-[140px]">
              <p className="text-xs uppercase tracking-wider text-base-content/40 font-semibold">
                Active Sessions
              </p>

              <h3 className="text-3xl font-bold mt-2 text-base-content">
                {activeSessions.length}
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* PASSWORD */}
      <section className="bg-base-100 border border-base-200 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <KeyIcon className="size-5 text-primary" />
          </div>

          <div>
            <h3 className="text-lg font-semibold">
              Change Password
            </h3>

            <p className="text-sm text-base-content/50">
              Update your password securely
            </p>
          </div>
        </div>

        <div className="space-y-4 max-w-xl">
          {/* CURRENT PASSWORD */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Current Password
            </label>

            <div className="relative">
              <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40" />

              <input
                type={showPassword ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                placeholder="Enter current password"
                className="input input-bordered w-full pl-10 pr-10 rounded-xl"
              />

              <button
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOffIcon className="size-4" />
                ) : (
                  <EyeIcon className="size-4" />
                )}
              </button>
            </div>
          </div>

          {/* NEW PASSWORD */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              New Password
            </label>

            <div className="relative">
              <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40" />

              <input
                type={showNewPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                placeholder="Enter new password"
                className="input input-bordered w-full pl-10 pr-10 rounded-xl"
              />

              <button
                onClick={() =>
                  setShowNewPassword(!showNewPassword)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showNewPassword ? (
                  <EyeOffIcon className="size-4" />
                ) : (
                  <EyeIcon className="size-4" />
                )}
              </button>
            </div>
          </div>

          {/* PASSWORD STRENGTH */}
          {passwordData.newPassword.length > 0 && (
            <div className="p-4 rounded-2xl bg-base-200/40 border border-base-300 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  Password Strength
                </p>

                <span className="text-xs font-semibold">
                  {strengthScore <= 2
                    ? "Weak"
                    : strengthScore <= 3
                    ? "Medium"
                    : "Strong"}
                </span>
              </div>

              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full ${
                      i <= strengthScore
                        ? "bg-success"
                        : "bg-base-300"
                    }`}
                  />
                ))}
              </div>

              <div className="space-y-1">
                {strengthChecks.map((check, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs"
                  >
                    {check.met ? (
                      <CheckCircleIcon className="size-3 text-success" />
                    ) : (
                      <XCircleIcon className="size-3 text-base-content/30" />
                    )}

                    <span>{check.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CONFIRM PASSWORD */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Confirm Password
            </label>

            <div className="relative">
              <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40" />

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                placeholder="Confirm password"
                className="input input-bordered w-full pl-10 pr-10 rounded-xl"
              />

              <button
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showConfirmPassword ? (
                  <EyeOffIcon className="size-4" />
                ) : (
                  <EyeIcon className="size-4" />
                )}
              </button>
            </div>
          </div>

          <button
            onClick={handlePasswordChange}
            className="btn btn-primary rounded-xl"
          >
            {saved ? "Updated!" : "Update Password"}
          </button>
        </div>
      </section>

      {/* TWO FACTOR AUTH */}
      <section className="bg-base-100 border border-base-200 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <ShieldIcon className="size-5 text-primary" />
            </div>

            <div>
              <h3 className="text-lg font-semibold">
                Two-Factor Authentication
              </h3>

              <p className="text-sm text-base-content/50">
                Extra protection for your account
              </p>
            </div>
          </div>

          <div
            className={`badge ${
              twoFactorEnabled
                ? "badge-success"
                : "badge-warning"
            }`}
          >
            {twoFactorEnabled ? "Enabled" : "Disabled"}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="border border-base-300 rounded-2xl p-5 bg-base-200/30">
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <SmartphoneIcon className="size-6 text-primary" />
            </div>

            <h4 className="font-semibold">
              Authenticator App
            </h4>

            <p className="text-sm text-base-content/50 mt-2">
              Use Google Authenticator or Authy for secure
              verification codes.
            </p>

            <button
              onClick={handleEnable2FA}
              className="btn btn-primary w-full mt-5 rounded-xl"
            >
              {twoFactorEnabled
                ? "Disable 2FA"
                : "Enable 2FA"}
            </button>
          </div>

          <div className="border border-base-300 rounded-2xl p-5 bg-base-200/30">
            <div className="size-12 rounded-2xl bg-warning/10 flex items-center justify-center mb-4">
              <SmartphoneIcon className="size-6 text-warning" />
            </div>

            <h4 className="font-semibold">
              SMS Verification
            </h4>

            <p className="text-sm text-base-content/50 mt-2">
              Receive verification codes directly on your
              mobile phone.
            </p>

            <button className="btn btn-outline w-full mt-5 rounded-xl">
              Setup SMS
            </button>
          </div>
        </div>
      </section>

      {/* ACTIVE SESSIONS */}
      <section className="bg-base-100 border border-base-200 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <SmartphoneIcon className="size-5 text-primary" />
          </div>

          <div>
            <h3 className="text-lg font-semibold">
              Active Sessions
            </h3>

            <p className="text-sm text-base-content/50">
              Manage logged-in devices
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {activeSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 rounded-2xl border border-base-300 bg-base-200/30"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-base-200 flex items-center justify-center">
                  <GlobeIcon className="size-4" />
                </div>

                <div>
                  <p className="font-semibold text-sm">
                    {session.device}
                  </p>

                  <p className="text-xs text-base-content/50">
                    {session.location} · {session.lastActive}
                  </p>
                </div>
              </div>

              {!session.isCurrent && (
                <button
                  onClick={handleRevokeSession}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  <LogOutIcon className="size-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* DANGER ZONE */}
      <section className="border border-error/20 rounded-3xl overflow-hidden">
        <div className="bg-error/5 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-error/10">
              <AlertTriangleIcon className="size-5 text-error" />
            </div>

            <div>
              <h3 className="text-lg font-semibold">
                Danger Zone
              </h3>

              <p className="text-sm text-base-content/50">
                Permanent actions
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 p-5 rounded-2xl border border-error/20 bg-base-100">
            <div>
              <p className="font-semibold">
                Delete Account
              </p>

              <p className="text-sm text-base-content/50 mt-1">
                Permanently remove your account and data
              </p>
            </div>

            <button
              onClick={handleDeleteAccount}
              className="btn btn-outline btn-error rounded-xl"
            >
              <Trash2Icon className="size-4" />
              Delete
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SecurityPage;