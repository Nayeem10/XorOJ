import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { apiFetch } from "../../api/client";

export default function EditProfile() {
  const { profile, setProfile } = useOutletContext();

  const [form, setForm] = useState({
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    email: profile.email || "",
    instituteName: profile.instituteName || "",
    contact: profile.contact || "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiFetch(`/api/edit/profile/${profile.username}`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (!res) throw new Error("Failed to update profile");
      setProfile(res);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Error updating profile");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6 space-y-4 max-w-xl">
      <h2 className="text-xl font-semibold">Edit Profile</h2>

      <div className="form-control">
        <label className="label">First Name</label>
        <input
          type="text"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          className="input input-bordered"
        />
      </div>

      <div className="form-control">
        <label className="label">Last Name</label>
        <input
          type="text"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          className="input input-bordered"
        />
      </div>

      <div className="form-control">
        <label className="label">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="input input-bordered"
        />
      </div>

      <div className="form-control">
        <label className="label">Institute</label>
        <input
          type="text"
          name="instituteName"
          value={form.instituteName}
          onChange={handleChange}
          className="input input-bordered"
        />
      </div>

      <div className="form-control">
        <label className="label">Contact</label>
        <input
          type="text"
          name="contact"
          value={form.contact}
          onChange={handleChange}
          className="input input-bordered"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn btn-primary mt-4"
      >
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}
