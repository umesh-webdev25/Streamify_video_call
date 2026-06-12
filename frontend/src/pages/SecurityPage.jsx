import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggle2FA } from "../lib/api";
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
  MailIcon,
  ChevronRightIcon,
  ZapIcon,
} from "lucide-react";

import useAuthUser from "../hooks/useAuthUser";
import toast from "react-hot-toast";

const SecurityPage = () => {
  const { authUser } = useAuthUser();

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const twoFactorEnabled = authUser?.twoFactorEnabled || false;
  const queryClient = useQueryClient();

  const { mutate: toggle2FAMutation, isPending: is2FAPending } = useMutation({
    mutationFn: toggle2FA,
    onSuccess: (data) => {
      queryClient.setQueryData(["authUser"], data);
      toast.success(
        data.twoFactorEnabled
          ? "Two-factor authentication enabled"
          : "Two-factor authentication disabled"
      );
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to toggle 2FA");
    },
  });

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
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSaved(true);
    toast.success("Password updated successfully");
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setTimeout(() => setSaved(false), 2000);
  };

  const handleEnable2FA = () => toggle2FAMutation();
  const handleRevokeSession = () => toast.success("Session revoked");
  const handleDeleteAccount = () => toast.error("Account deletion is not available yet");

  const strengthChecks = [
    { label: "At least 6 characters", met: passwordData.newPassword.length >= 6 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(passwordData.newPassword) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(passwordData.newPassword) },
    { label: "Contains number", met: /\d/.test(passwordData.newPassword) },
    { label: "Contains special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword) },
  ];

  const strengthScore = strengthChecks.filter((c) => c.met).length;
  const strengthLabel = strengthScore <= 2 ? "Weak" : strengthScore <= 3 ? "Medium" : "Strong";
  const strengthColor = strengthScore <= 2 ? "text-error" : strengthScore <= 3 ? "text-warning" : "text-success";

  return (
    <div>
      <div className="space-y-6 max-w-8xl">
        {/* ── SECURITY OVERVIEW ── */}
        <section className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/10 via-base-100 to-base-100 p-8 shadow-sm -mt-10">
          {/* decorative blobs */}
          <div className="pointer-events-none absolute -top-10 -right-10 w-64 h-64 bg-primary/10 blur-3xl rounded-full" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 w-40 h-40 bg-primary/5 blur-2xl rounded-full" />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-primary text-primary-content shadow-lg shadow-primary/30">
                  <ShieldIcon className="size-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-base-content">Security Center</h2>
                  <p className="text-sm text-base-content/50 mt-0.5">Protect and manage your account</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 mt-6">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20">
                  <CheckCircleIcon className="size-3" /> Email Verified
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${twoFactorEnabled ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"}`}>
                  <ShieldIcon className="size-3" />
                  {twoFactorEnabled ? "2FA Enabled" : "2FA Disabled"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="bg-base-100/90 backdrop-blur border border-base-200 rounded-2xl p-5 min-w-[140px]">
                <p className="text-[10px] uppercase tracking-widest text-base-content/40 font-bold">Security Score</p>
                <h3 className="text-4xl font-black mt-2 text-primary">{twoFactorEnabled ? "95" : "78"}<span className="text-xl font-semibold text-primary/60">%</span></h3>
                <div className="w-full h-1.5 rounded-full bg-base-200 mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700"
                    style={{ width: twoFactorEnabled ? "95%" : "78%" }}
                  />
                </div>
              </div>
              <div className="bg-base-100/90 backdrop-blur border border-base-200 rounded-2xl p-5 min-w-[140px]">
                <p className="text-[10px] uppercase tracking-widest text-base-content/40 font-bold">Active Sessions</p>
                <h3 className="text-4xl font-black mt-2 text-base-content">{activeSessions.length}</h3>
                <p className="text-[11px] text-base-content/40 mt-2">{activeSessions.filter(s => s.isCurrent).length} current device</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className="space-y-6 max-w-4xl">

        {/* ── CHANGE PASSWORD ── */}
        <section className="w-[600px] bg-base-100 border border-base-200 rounded-3xl shadow-sm overflow-hidden mt-10 mb-6">
          <div className="px-6 pt-6 pb-5 border-b border-base-200 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <KeyIcon className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold leading-tight">Change Password</h3>
              <p className="text-xs text-base-content/50 mt-0.5">Update your password regularly to stay secure</p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-base-content/50">Current Password</label>
              <div className="relative">
                <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-base-content/30" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))}
                  placeholder="••••••••"
                  className="input input-bordered w-full pl-10 pr-11 rounded-xl text-sm h-11"
                />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content transition-colors">
                  {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-base-content/50">New Password</label>
              <div className="relative">
                <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-base-content/30" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData((p) => ({ ...p, newPassword: e.target.value }))}
                  placeholder="••••••••"
                  className="input input-bordered w-full pl-10 pr-11 rounded-xl text-sm h-11"
                />
                <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content transition-colors">
                  {showNewPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              </div>
            </div>

            {/* Password Strength */}
            {passwordData.newPassword.length > 0 && (
              <div className="rounded-2xl border border-base-300 bg-base-200/40 overflow-hidden">
                <div className="px-4 pt-4 pb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold text-base-content/70">Password Strength</p>
                  <span className={`text-xs font-bold ${strengthColor}`}>{strengthLabel}</span>
                </div>
                <div className="flex gap-1 px-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strengthScore
                          ? strengthScore <= 2 ? "bg-error" : strengthScore <= 3 ? "bg-warning" : "bg-success"
                          : "bg-base-300"
                        }`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 p-4">
                  {strengthChecks.map((check, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px]">
                      {check.met
                        ? <CheckCircleIcon className="size-3 text-success shrink-0" />
                        : <XCircleIcon className="size-3 text-base-content/25 shrink-0" />}
                      <span className={check.met ? "text-base-content/70" : "text-base-content/35"}>{check.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-base-content/50">Confirm New Password</label>
              <div className="relative">
                <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-base-content/30" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="••••••••"
                  className={`input input-bordered w-full pl-10 pr-11 rounded-xl text-sm h-11 ${passwordData.confirmPassword && passwordData.confirmPassword !== passwordData.newPassword
                      ? "input-error"
                      : passwordData.confirmPassword && passwordData.confirmPassword === passwordData.newPassword
                        ? "input-success"
                        : ""
                    }`}
                />
                <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content transition-colors">
                  {showConfirmPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              </div>
              {passwordData.confirmPassword && passwordData.confirmPassword !== passwordData.newPassword && (
                <p className="text-xs text-error flex items-center gap-1 mt-1">
                  <XCircleIcon className="size-3" /> Passwords don't match
                </p>
              )}
            </div>

            <button onClick={handlePasswordChange} className="btn btn-primary rounded-xl h-11 px-6 text-sm font-semibold">
              {saved ? (
                <><CheckCircleIcon className="size-4" /> Updated!</>
              ) : (
                "Update Password"
              )}
            </button>
          </div>
        </section>
      </div>
      <div className="space-y-6 max-w-8xl">
        {/* ── TWO-FACTOR AUTH ── */}
        <section className="bg-base-100 border border-base-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-5 border-b border-base-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <ShieldIcon className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold leading-tight">Two-Factor Authentication</h3>
                <p className="text-xs text-base-content/50 mt-0.5">Add an extra layer of protection</p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${twoFactorEnabled ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"}`}>
              <span className={`size-1.5 rounded-full ${twoFactorEnabled ? "bg-success" : "bg-warning"}`} />
              {twoFactorEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`relative overflow-hidden rounded-2xl border p-5 transition-all ${twoFactorEnabled ? "border-success/30 bg-success/5" : "border-base-300 bg-base-200/30"}`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full pointer-events-none" />
                <div className="relative">
                  <div className="size-11 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <MailIcon className="size-5 text-primary" />
                  </div>
                  <h4 className="font-semibold text-sm">Email Verification</h4>
                  <p className="text-xs text-base-content/50 mt-1.5 leading-relaxed">
                    Receive secure one-time codes in your inbox whenever you sign in.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-base-content/40">
                    <ZapIcon className="size-3" />
                    <span>Instant delivery · No extra app needed</span>
                  </div>
                  <button
                    onClick={handleEnable2FA}
                    className={`btn w-full mt-5 rounded-xl h-10 text-sm font-semibold ${twoFactorEnabled ? "btn-outline btn-error" : "btn-primary"}`}
                    disabled={is2FAPending}
                  >
                    {is2FAPending ? (
                      <span className="loading loading-spinner loading-sm" />
                    ) : twoFactorEnabled ? (
                      "Disable 2FA"
                    ) : (
                      "Enable 2FA"
                    )}
                  </button>
                </div>
              </div>

              {/* Info card */}
              <div className="rounded-2xl border border-base-300 bg-base-200/30 p-5 flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-sm mb-3">Why enable 2FA?</h4>
                  <ul className="space-y-2.5">
                    {[
                      "Blocks unauthorized access even if your password leaks",
                      "Instant alerts on new sign-in attempts",
                      "Recommended for all accounts with sensitive data",
                    ].map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-base-content/60">
                        <ChevronRightIcon className="size-3 mt-0.5 text-primary shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-5 pt-4 border-t border-base-300 flex items-center justify-between">
                  <span className="text-xs text-base-content/40">Security impact</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className={`w-4 h-1.5 rounded-full ${i <= 4 ? "bg-primary" : "bg-base-300"}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── ACTIVE SESSIONS ── */}
        <section className="bg-base-100 border border-base-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-5 border-b border-base-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <SmartphoneIcon className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold leading-tight">Active Sessions</h3>
                <p className="text-xs text-base-content/50 mt-0.5">Devices currently signed in to your account</p>
              </div>
            </div>
            <span className="text-xs text-base-content/40 font-medium">{activeSessions.length} device{activeSessions.length !== 1 ? "s" : ""}</span>
          </div>

          <div className="p-6 space-y-3">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${session.isCurrent ? "border-primary/20 bg-primary/5" : "border-base-300 bg-base-200/30"}`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`size-10 rounded-xl flex items-center justify-center ${session.isCurrent ? "bg-primary/10" : "bg-base-200"}`}>
                    <GlobeIcon className={`size-4 ${session.isCurrent ? "text-primary" : "text-base-content/50"}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{session.device}</p>
                      {session.isCurrent && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-base-content/50 mt-0.5">
                      {session.location} · {session.lastActive}
                    </p>
                  </div>
                </div>
                {!session.isCurrent && (
                  <button
                    onClick={handleRevokeSession}
                    className="btn btn-ghost btn-sm gap-1.5 text-xs text-error hover:bg-error/10 rounded-xl"
                  >
                    <LogOutIcon className="size-3.5" />
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── DANGER ZONE ── */}
        <section className="rounded-3xl border border-error/20 overflow-hidden">
          <div className="bg-error/5 px-6 pt-6 pb-5 border-b border-error/10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-error/10">
              <AlertTriangleIcon className="size-5 text-error" />
            </div>
            <div>
              <h3 className="text-base font-semibold leading-tight">Danger Zone</h3>
              <p className="text-xs text-base-content/50 mt-0.5">Irreversible account actions</p>
            </div>
          </div>

          <div className="bg-error/5 p-6">
            <div className="flex items-center justify-between gap-6 p-5 rounded-2xl border border-error/15 bg-base-100">
              <div>
                <p className="font-semibold text-sm">Delete Account</p>
                <p className="text-xs text-base-content/50 mt-1 leading-relaxed">
                  Permanently remove your account, profile, and all associated data. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="btn btn-outline btn-error rounded-xl h-10 px-5 text-sm font-semibold shrink-0"
              >
                <Trash2Icon className="size-4" />
                Delete
              </button>
            </div>
          </div>
        </section>
      </div>

    </div>


  );
};

export default SecurityPage;