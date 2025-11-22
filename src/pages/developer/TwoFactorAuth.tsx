import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "../../components/templates";
import { Card, Button, Input, Modal } from "../../components/atoms";
import { twoFactorApi } from "../../api/twoFactorApi";
import { userApi } from "../../api/userApi";
import { showErrorToast, showSuccessToast } from "../../utils/errorHandler";
import {
  ShieldCheckIcon,
  QrCodeIcon,
  KeyIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon as CheckCircleIconOutline,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const TwoFactorAuth: React.FC = () => {
  const queryClient = useQueryClient();
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [verifyToken, setVerifyToken] = useState("");
  const [disableToken, setDisableToken] = useState("");
  const [tempSecret, setTempSecret] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  // Fetch current user profile to check 2FA status
  const {
    data: userProfile,
    isLoading: profileLoading,
    isError: profileIsError,
    error: profileError,
  } = useQuery<any, unknown>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await userApi.getProfile();
      return res.data;
    },
  });

  useEffect(() => {
    if (profileIsError) {
      showErrorToast(profileError, "Failed to load profile");
    }
  }, [profileIsError, profileError]);

  const is2FAEnabled = userProfile?.twoFactorEnabled || false;

  // Generate secret mutation
  const generateSecretMutation = useMutation<
    { success: boolean; data: import('../../api/twoFactorApi').TwoFactorSecret },
    unknown,
    void
  >({
    mutationFn: twoFactorApi.generateSecret,
    onSuccess: (data) => {
      setTempSecret(data.data.secret);
      setQrCodeUrl(data.data.qrCodeDataUrl);
      setSetupModalOpen(true);
    },
    onError: (error: unknown) => {
      showErrorToast(error, "Failed to generate 2FA secret");
    },
  });

  // Enable 2FA mutation
  const enableMutation = useMutation<
    import('../../api/twoFactorApi').TwoFactorEnableResponse,
    unknown,
    import('../../api/twoFactorApi').TwoFactorVerifyPayload
  >({
    mutationFn: twoFactorApi.enable,
    onSuccess: (data) => {
      showSuccessToast(data.message);
      setBackupCodes(data.data.backupCodes);
      setShowBackupCodes(true);
      setVerifyToken("");
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error: unknown) => {
      showErrorToast(error, "Failed to enable 2FA");
    },
  });

  // Disable 2FA mutation
  const disableMutation = useMutation<
    { success: boolean; message: string },
    unknown,
    import('../../api/twoFactorApi').TwoFactorDisablePayload
  >({
    mutationFn: twoFactorApi.disable,
    onSuccess: (data) => {
      showSuccessToast(data.message);
      setDisableModalOpen(false);
      setDisableToken("");
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error: unknown) => {
      showErrorToast(error, "Failed to disable 2FA");
    },
  });

  const handleStartSetup = () => {
    generateSecretMutation.mutate();
  };

  const handleVerifyAndEnable = () => {
    if (verifyToken.length !== 6) {
      showErrorToast(new Error("Invalid token"), "Please enter a 6-digit code");
      return;
    }

    enableMutation.mutate({
      token: verifyToken,
      secret: tempSecret,
    });
  };

  const handleDisable = () => {
    if (disableToken.length !== 6) {
      showErrorToast(new Error("Invalid token"), "Please enter a 6-digit code");
      return;
    }

    disableMutation.mutate({
      token: disableToken,
    });
  };

  const handleCloseSetup = () => {
    setSetupModalOpen(false);
    setShowBackupCodes(false);
    setVerifyToken("");
    setTempSecret("");
    setQrCodeUrl("");
    setBackupCodes([]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccessToast("Copied to clipboard");
  };

  const copyAllBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    showSuccessToast("All backup codes copied");
  };

  if (profileLoading) {
    return (
      <DashboardLayout title="Two-Factor Authentication">
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-600">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Two-Factor Authentication">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-3">
                Two-Factor Authentication
              </h1>
              <p className="text-blue-100 text-lg">
                Protect your developer account with an additional layer of
                security
              </p>
            </div>
            <div
              className={`p-4 rounded-full ${
                is2FAEnabled ? "bg-green-500" : "bg-amber-500"
              }`}
            >
              {is2FAEnabled ? (
                <CheckCircleIconOutline className="w-8 h-8" />
              ) : (
                <ShieldCheckIcon className="w-8 h-8" />
              )}
            </div>
          </div>
        </div>

        {/* Status Card */}
        <Card className="border-2 shadow-md">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Current Status
                </h3>
                <p className="text-slate-600">
                  Two-factor authentication is currently{" "}
                  <span
                    className={`font-semibold ${
                      is2FAEnabled ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {is2FAEnabled ? "enabled" : "disabled"}
                  </span>
                </p>
              </div>
              <div>
                {is2FAEnabled ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg font-medium">
                      <CheckCircleIconOutline className="w-5 h-5" />
                      Enabled
                    </div>
                    <Button
                      variant="danger"
                      onClick={() => setDisableModalOpen(true)}
                    >
                      Disable 2FA
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg font-medium">
                      <XCircleIcon className="w-5 h-5" />
                      Disabled
                    </div>
                    <Button
                      variant="primary"
                      onClick={handleStartSetup}
                      disabled={generateSecretMutation.isPending}
                    >
                      {generateSecretMutation.isPending ? "Loading..." : "Enable 2FA"}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {is2FAEnabled && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  <strong>Protected:</strong> Your account is secured with
                  two-factor authentication. You'll need your authenticator app
                  to sign in.
                </p>
              </div>
            )}

            {!is2FAEnabled && (
              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Warning:</strong> Your account is not protected by
                  two-factor authentication. Enable it now for enhanced
                  security.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* What is 2FA */}
          <Card className="shadow-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center">
                  <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  What is 2FA?
                </h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Two-factor authentication adds an extra layer of security by
                requiring a 6-digit code from your authenticator app in addition
                to your password when logging in.
              </p>
            </div>
          </Card>

          {/* Supported Apps */}
          <Card className="shadow-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center">
                  <QrCodeIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Supported Apps
                </h3>
              </div>
              <ul className="text-sm text-slate-600 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                  Google Authenticator
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                  Microsoft Authenticator
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                  Authy
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                  Any TOTP-compatible app
                </li>
              </ul>
            </div>
          </Card>
        </div>

        {/* Setup Steps */}
        <Card className="shadow-md">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">
              How to Enable 2FA
            </h3>
            <div className="space-y-4">
              {[
                {
                  step: 1,
                  title: "Download Authenticator App",
                  desc: "Install Google Authenticator or any TOTP-compatible app on your mobile device",
                },
                {
                  step: 2,
                  title: "Click Enable 2FA",
                  desc: 'Click the "Enable 2FA" button above to generate your QR code',
                },
                {
                  step: 3,
                  title: "Scan QR Code",
                  desc: "Open your authenticator app and scan the displayed QR code",
                },
                {
                  step: 4,
                  title: "Enter Verification Code",
                  desc: "Enter the 6-digit code from your app to complete setup",
                },
                {
                  step: 5,
                  title: "Save Backup Codes",
                  desc: "Store your backup codes securely for account recovery",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-slate-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Setup Modal */}
        <Modal
          isOpen={setupModalOpen}
          onClose={handleCloseSetup}
          title="Enable Two-Factor Authentication"
        >
          <div className="space-y-6">
            {!showBackupCodes ? (
              <>
                {/* QR Code Step */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4">
                      Step 1: Scan QR Code
                    </h4>
                    {qrCodeUrl && (
                      <div className="inline-block bg-white p-4 rounded-lg shadow-sm">
                        <img
                          src={qrCodeUrl}
                          alt="QR Code"
                          className="w-64 h-64"
                        />
                      </div>
                    )}
                    <p className="text-sm text-slate-600 mt-4">
                      Scan this code with your authenticator app
                    </p>
                  </div>
                </div>

                {/* Manual Entry */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    Can't scan? Enter manually:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white px-3 py-2 rounded border border-blue-200 font-mono text-sm text-slate-900 break-all">
                      {tempSecret}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(tempSecret)}
                    >
                      <ClipboardDocumentIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Verification */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Step 2: Enter 6-digit verification code
                  </label>
                  <Input
                    type="text"
                    value={verifyToken}
                    onChange={(e) =>
                      setVerifyToken(
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    placeholder="000000"
                    maxLength={6}
                    className="text-center text-3xl tracking-[0.5em] font-mono font-bold"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Enter the code shown in your authenticator app
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={handleCloseSetup}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleVerifyAndEnable}
                    disabled={verifyToken.length !== 6 || enableMutation.isPending}
                  >
                    {enableMutation.isPending ? "Verifying..." : "Verify & Enable"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Success & Backup Codes */}
                <div className="text-center pb-4">
                  <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    2FA Enabled Successfully!
                  </h3>
                  <p className="text-slate-600">
                    Your account is now protected with two-factor authentication
                  </p>
                </div>

                <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <KeyIcon className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-900">
                      <p className="font-bold mb-2">
                        ⚠️ Important: Save Your Backup Codes
                      </p>
                      <p>
                        These codes can restore access if you lose your
                        authenticator device. Each code works only once. Store
                        them securely!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-semibold text-slate-900">
                      Your Backup Codes ({backupCodes.length} codes)
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyAllBackupCodes}
                    >
                      <ClipboardDocumentIcon className="w-4 h-4 mr-2" />
                      Copy All
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, index) => (
                      <div
                        key={index}
                        className="font-mono text-sm bg-white px-3 py-2 rounded border border-slate-200 text-center hover:bg-slate-50 transition-colors"
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button
                    variant="primary"
                    onClick={handleCloseSetup}
                    className="px-8"
                  >
                    Done
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>

        {/* Disable Modal */}
        <Modal
          isOpen={disableModalOpen}
          onClose={() => setDisableModalOpen(false)}
          title="Disable Two-Factor Authentication"
        >
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> Disabling 2FA will make your account
                less secure. You'll only need your password to sign in.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Enter verification code from your authenticator app:
              </label>
              <Input
                type="text"
                value={disableToken}
                onChange={(e) =>
                  setDisableToken(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                maxLength={6}
                className="text-center text-3xl tracking-[0.5em] font-mono font-bold"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setDisableModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDisable}
                disabled={disableToken.length !== 6 || disableMutation.isPending}
              >
                {disableMutation.isPending ? "Disabling..." : "Disable 2FA"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default TwoFactorAuth;
