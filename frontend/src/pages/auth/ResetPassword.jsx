import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "@/Services/authService";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { uid, token } = useParams();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordStrengthRegex.test(newPassword)) {
      setError("Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await resetPassword({
        uid,
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      navigate("/login", {
        replace: true,
        state: {
          message:
            "Password reset successful. Please login.",
        },
      });

    } catch (err) {

      if (err.response?.data) {

        const errors = err.response.data;

        const firstError = Object.values(errors)[0];

        if (Array.isArray(firstError)) {
          setError(firstError[0]);
        } else {
          setError(firstError);
        }

      } else {

        setError("Unable to reset password.");

      }

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <h1 className="text-2xl font-bold text-center mb-6">
          Reset Password
        </h1>

        {error && (
          <p className="text-red-500 text-sm mb-4">
            {error}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            className="w-full border rounded-xl p-3"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
            required
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            className="w-full border rounded-xl p-3"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            required
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              onChange={() =>
                setShowPassword(!showPassword)
              }
            />
            Show Password
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white rounded-xl py-3"
          >
            {loading
              ? "Resetting..."
              : "Reset Password"}
          </button>

        </form>

      </div>

    </div>
  );
}