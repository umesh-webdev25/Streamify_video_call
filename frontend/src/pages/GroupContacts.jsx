import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
  SearchIcon,
  XIcon,
  BriefcaseIcon,
  PencilIcon,
  Trash2Icon,
  MoreVerticalIcon,
  DownloadIcon,
} from "lucide-react";
import { useParams } from "react-router-dom";
import {
  createContact,
  getAllContacts,
  updateContact,
  deleteContact,
  getGroupById,
} from "../lib/api";

const GroupContacts = () => {
  const { groupId } = useParams();

  const [openModal, setOpenModal] = useState(false);
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    designation: "",
    contactImage: null,
  });
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  /** GET GROUP INFO */
  const fetchGroupInfo = async () => {
    try {
      const data = await getGroupById(groupId);
      setGroup(data);
    } catch (error) {
      console.log("Error fetching group info:", error);
    }
  };

  /** GET CONTACTS */
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const data = await getAllContacts();
      const filtered = (data || []).filter((contact) => {
        // Handle both populated and non-populated groupId
        const cid = typeof contact.groupId === "object" ? contact.groupId?._id : contact.groupId;
        return cid === groupId;
      });
      setContacts(filtered);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupInfo();
    fetchContacts();
  }, [groupId]);

  // Close menu on outside click
  useEffect(() => {
    const close = () => setMenuOpenId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  /** INPUT CHANGE */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setContactData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  /** CREATE / UPDATE */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedContact) {
        const formData = new FormData();
        formData.append("name", contactData.name);
        formData.append("email", contactData.email);
        formData.append("mobileNumber", contactData.mobileNumber);
        formData.append("designation", contactData.designation || "");
        if (contactData.contactImage) formData.append("contactImage", contactData.contactImage);
        const updated = await updateContact(selectedContact._id, formData);
        setContacts((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      } else {
        const formData = new FormData();
        formData.append("name", contactData.name);
        formData.append("email", contactData.email);
        formData.append("mobileNumber", contactData.mobileNumber);
        formData.append("designation", contactData.designation || "");
        formData.append("groupId", groupId);
        if (contactData.contactImage) formData.append("contactImage", contactData.contactImage);
        const newContact = await createContact(formData);
        setContacts((prev) => [newContact, ...prev]);
        try { window.dispatchEvent(new CustomEvent("groups:updated")); } catch (e) { }
      }
      setContactData({ name: "", email: "", mobileNumber: "", designation: "", contactImage: null });
      setSelectedContact(null);
      setOpenModal(false);
    } catch (error) {
      console.log(error);
    }
  };

  /** DELETE */
  const handleDeleteContact = async (id) => {
    try {
      await deleteContact(id);
      setContacts((prev) => prev.filter((c) => c._id !== id));
      try { window.dispatchEvent(new CustomEvent("groups:updated")); } catch (e) { }
    } catch (error) {
      console.log(error);
    }
  };

  /** EDIT */
  const handleEditContact = (contact) => {
    setSelectedContact(contact);
    setContactData({
      name: contact.name,
      email: contact.email,
      mobileNumber: contact.mobileNumber,
      designation: contact.designation || "",
      contactImage: null,
    });
    setOpenModal(true);
  };

  /** Export CSV */
  const handleExport = () => {
    const csv = [
      "Name,Email,Mobile,Designation",
      ...contacts.map((c) => `"${c.name}","${c.email}","${c.mobileNumber}","${c.designation || ""}"`)
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "contacts.csv";
    a.click();
  };

  /** FILTER & PAGINATE */
  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredContacts.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const pagedContacts = filteredContacts.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  return (
  <div className="min-h-screen bg-base-200 p-4 md:p-6 font-sans">

    {/* ── PAGE HEADER ── */}
    <div
      className="
    flex items-center justify-between
    mb-6
    bg-base-100
    border border-base-300
    rounded-2xl
    px-6 py-5
    shadow-sm
  "
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content">
            {group?.groupName}
          </h1>

          <p className="text-sm text-base-content/50 mt-1">
            {group?.groupBio || "Manage and organize your group contacts"}
          </p>
        </div>
      </div>

      {/* Right */}
      <button
        className="
      w-10 h-10
      rounded-xl
      flex items-center justify-center
      text-base-content/40
      hover:text-base-content
      hover:bg-base-200
      transition-all
    "
      >
        <MoreVerticalIcon className="w-5 h-5" />
      </button>
    </div>

    {/* ── STAT CARDS ── */}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">

      {/* Total Contacts */}
      <div
        className="
      bg-base-100
      border border-base-300
      rounded-2xl
      px-6
      h-[120px]
      flex items-center justify-between
      shadow-sm hover:shadow-md
      transition-all duration-300
    "
      >
        <div>
          <p className="text-sm font-medium text-base-content/60">
            Total Contacts
          </p>

          <h2 className="text-4xl font-bold text-base-content mt-2">
            {contacts.length}
          </h2>
        </div>

        <div
          className="
        w-14 h-14
        rounded-2xl
        bg-primary/10
        flex items-center justify-center
        flex-shrink-0
      "
        >
          <UserIcon className="w-7 h-7 text-primary" />
        </div>
      </div>

      {/* With Designation */}
      <div
        className="
      bg-base-100
      border border-base-300
      rounded-2xl
      px-6
      h-[120px]
      flex items-center justify-between
      shadow-sm hover:shadow-md
      transition-all duration-300
    "
      >
        <div>
          <p className="text-sm font-medium text-base-content/60">
            With Designation
          </p>

          <h2 className="text-4xl font-bold text-base-content mt-2">
            {contacts.filter((c) => c.designation).length}
          </h2>
        </div>

        <div
          className="
        w-14 h-14
        rounded-2xl
        bg-secondary/10
        flex items-center justify-center
        flex-shrink-0
      "
        >
          <BriefcaseIcon className="w-7 h-7 text-secondary" />
        </div>
      </div>

      {/* Search Results */}
      <div
        className="
      bg-base-100
      border border-base-300
      rounded-2xl
      px-6
      h-[120px]
      flex items-center justify-between
      shadow-sm hover:shadow-md
      transition-all duration-300
    "
      >
        <div>
          <p className="text-sm font-medium text-base-content/60">
            Search Results
          </p>

          <h2 className="text-4xl font-bold text-base-content mt-2">
            {filteredContacts.length}
          </h2>
        </div>

        <div
          className="
        w-14 h-14
        rounded-2xl
        bg-success/10
        flex items-center justify-center
        flex-shrink-0
      "
        >
          <SearchIcon className="w-7 h-7 text-success" />
        </div>
      </div>
    </div>

    {/* ── TABLE CARD ── */}
    <div className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-base-200">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[220px] bg-base-200 border border-base-300 rounded-xl px-3 h-10">
          <SearchIcon className="w-4 h-4 text-base-content/40 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-transparent outline-none text-sm text-base-content placeholder:text-base-content/40"
          />
        </div>

        {/* Add Contact */}
        <button
          onClick={() => {
            setSelectedContact(null);
            setContactData({ name: "", email: "", mobileNumber: "", designation: "", contactImage: null });
            setOpenModal(true);
          }}
          className="h-10 px-4 rounded-xl bg-success hover:bg-success/90 text-success-content text-sm font-semibold flex items-center gap-1.5 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add Contact
        </button>

        {/* Export */}
        <button
          onClick={handleExport}
          className="h-10 px-4 rounded-xl border border-base-300 bg-base-100 hover:bg-base-200 text-base-content text-sm font-semibold flex items-center gap-1.5 transition-colors"
        >
          <DownloadIcon className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-base-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-base-content/60 uppercase tracking-wider border-b border-base-300 w-[28%]">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-base-content/60 uppercase tracking-wider border-b border-base-300 w-[25%]">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-base-content/60 uppercase tracking-wider border-b border-base-300 w-[18%]">Mobile</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-base-content/60 uppercase tracking-wider border-b border-base-300 w-[17%]">Designation</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-base-content/60 uppercase tracking-wider border-b border-base-300 w-[12%]">Action</th>
            </tr>
          </thead>
          <tbody>
            {pagedContacts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <UserIcon className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-base font-semibold text-base-content">No Contacts Found</p>
                    <p className="text-sm text-base-content/40">
                      {search ? `No results for "${search}"` : "Add your first contact to get started"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              pagedContacts.map((contact, idx) => (
                <tr
                  key={contact._id}
                  className={`border-b border-base-200 hover:bg-base-200/50 transition-colors duration-150 ${idx % 2 === 1 ? "bg-base-200/20" : "bg-base-100"}`}
                >
                  {/* Name + Avatar */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {contact.contactImage ? (
                          <img
                            src={contact.contactImage}
                            alt={contact.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = "/contact.png"; }}
                          />
                        ) : (
                          <img src="/contact.png" alt={contact.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <span className="text-sm font-semibold text-primary truncate">{contact.name}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 -ml-10">
                      <MailIcon className="w-3.5 h-3.5 text-base-content/40 flex-shrink-0" />
                      <span className="text-sm text-base-content/70 truncate ">{contact.email}</span>
                    </div>
                  </td>

                  {/* Mobile */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 -ml-6">
                      <PhoneIcon className="w-3.5 h-3.5 text-base-content/40 flex-shrink-0" />
                      <span className="text-sm text-base-content/70">{contact.mobileNumber}</span>
                    </div>
                  </td>

                  {/* Designation */}
                  <td className="px-4 py-3.5">
                    {contact.designation ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary/10 text-secondary border border-secondary/20">
                        <BriefcaseIcon className="w-3 h-3" />
                        {contact.designation}
                      </span>
                    ) : (
                      <span className="text-sm text-base-content/40">N/A</span>
                    )}
                  </td>

                  {/* Action Menu */}
                  <div className="flex items-center justify-center" >
                    <td
                      // left: rect.right - 250,
                      className="px-4 py-3.5 text-center  "
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();

                          const rect = e.currentTarget.getBoundingClientRect();

                          setMenuPosition({
                            top: rect.bottom + 8,
                            left: rect.right - 170,
                          });

                          setMenuOpenId(
                            menuOpenId === contact._id ? null : contact._id
                          );
                        }}
                        className="
      w-8 h-8
      rounded-lg
      border border-base-300
      bg-base-100
      hover:bg-base-200
      text-base-content/40
      flex items-center justify-center
      transition-colors
    "
                      >
                        <MoreVerticalIcon className="w-4 h-4" />
                      </button>

                      {menuOpenId === contact._id && (
                        <div
                          className="
        fixed
        z-[99999]
        w-44
        bg-base-100
        border border-base-300
        rounded-2xl
        shadow-2xl
        overflow-hidden
        animate-in fade-in zoom-in-95 duration-150
      "
                          style={{
                            top: `${menuPosition.top}px`,
                            left: `${menuPosition.left}px`,
                          }}
                        >
                          {/* Edit */}
                          <button
                            onClick={() => {
                              handleEditContact(contact);
                              setMenuOpenId(null);
                            }}
                            className="
          w-full
          px-4 py-3
          text-left
          text-sm
          font-medium
          text-warning
          hover:bg-warning/10
          flex items-center gap-2
          transition-colors
        "
                          >
                            <PencilIcon className="w-4 h-4" />
                            Edit
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              handleDeleteContact(contact._id);
                              setMenuOpenId(null);
                            }}
                            className="
          w-full
          px-4 py-3
          text-left
          text-sm
          font-medium
          text-error
          hover:bg-error/10
          flex items-center gap-2
          transition-colors
        "
                          >
                            <Trash2Icon className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </div>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── PAGINATION ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-base-200">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <select
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
            className="h-8 px-2 rounded-lg border border-base-300 text-sm text-base-content bg-base-100 outline-none cursor-pointer"
          >
            {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <span className="text-sm text-base-content/50">Items per page</span>
        </div>

        {/* Page Buttons */}
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(1)} disabled={safePage === 1}
            className="w-8 h-8 rounded-lg border border-base-300 bg-base-100 text-sm font-semibold text-base-content/60 disabled:opacity-30 hover:bg-base-200 transition-colors">«</button>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}
            className="w-8 h-8 rounded-lg border border-base-300 bg-base-100 text-sm font-semibold text-base-content/60 disabled:opacity-30 hover:bg-base-200 transition-colors">‹</button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
            .reduce((acc, p, i, arr) => {
              if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === "…" ? (
                <span key={`e-${i}`} className="w-8 text-center text-sm text-gray-400">…</span>
              ) : (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${p === safePage ? "bg-primary text-primary-content border-0" : "border border-base-300 bg-base-100 text-base-content hover:bg-base-200"}`}>
                  {p}
                </button>
              )
            )}

          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
            className="w-8 h-8 rounded-lg border border-base-300 bg-base-100 text-sm font-semibold text-base-content/60 disabled:opacity-30 hover:bg-base-200 transition-colors">›</button>
          <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages}
            className="w-8 h-8 rounded-lg border border-base-300 bg-base-100 text-sm font-semibold text-base-content/60 disabled:opacity-30 hover:bg-base-200 transition-colors">»</button>
        </div>

        {/* Jump to */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-base-content/50">Jump to</span>
          <select
            value={safePage}
            onChange={(e) => setPage(Number(e.target.value))}
            className="h-8 px-2 rounded-lg border border-base-300 text-sm text-base-content bg-base-100 outline-none cursor-pointer"
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>
    </div>

    {/* ── MODAL ── */}
    {openModal && (
      <div
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && setOpenModal(false)}
      >
        <div className="bg-base-100 w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-base-200">
            <div>
              <h2 className="text-xl font-bold text-base-content">
                {selectedContact ? "Update Contact" : "Add Contact"}
              </h2>
              <p className="text-sm text-base-content/50 mt-0.5">Manage contact details</p>
            </div>
            <button
              onClick={() => setOpenModal(false)}
              className="w-9 h-9 rounded-xl bg-base-200 hover:bg-base-300 flex items-center justify-center transition"
            >
              <XIcon className="w-4 h-4 text-base-content/60" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Profile Image */}
            <div className="flex justify-center">
              <label className="relative cursor-pointer">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-dashed border-primary/20 flex items-center justify-center overflow-hidden">
                  {contactData.contactImage ? (
                    <img
                      src={typeof contactData.contactImage === "string"
                        ? contactData.contactImage
                        : URL.createObjectURL(contactData.contactImage)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = "/contact.png"; }}
                    />
                  ) : (
                    <img src="/contact.png" alt="Preview" className="w-full h-full object-cover opacity-50" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-success text-success-content flex items-center justify-center shadow">
                  <PlusIcon className="w-3.5 h-3.5" />
                </div>
                <input type="file" name="contactImage" accept="image/*" onChange={handleChange} className="hidden" />
              </label>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-base-content/70 mb-1">Full Name <span className="text-error">*</span></label>
              <input
                type="text" name="name" value={contactData.name} onChange={handleChange} required
                placeholder="Enter full name"
                className="w-full bg-base-100 text-base-content placeholder:text-base-content/30 border border-base-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/10 transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-base-content/70 mb-1">Email Address</label>
              <div className="relative">
                <MailIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/30" />
                <input
                  type="email" name="email" value={contactData.email} onChange={handleChange}
                  placeholder="Enter email"
                  className="w-full bg-base-100 text-base-content placeholder:text-base-content/30 border border-base-300 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/10 transition"
                />
              </div>
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium text-base-content/70 mb-1">Mobile Number</label>
              <div className="relative">
                <PhoneIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/30" />
                <input
                  type="text" name="mobileNumber" value={contactData.mobileNumber} onChange={handleChange}
                  placeholder="Enter mobile number"
                  className="w-full bg-base-100 text-base-content placeholder:text-base-content/30 border border-base-300 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/10 transition"
                />
              </div>
            </div>

            {/* Designation */}
            <div>
              <label className="block text-sm font-medium text-base-content/70 mb-1">Designation</label>
              <div className="relative">
                <BriefcaseIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/30" />
                <input
                  type="text" name="designation" value={contactData.designation} onChange={handleChange}
                  placeholder="Enter designation"
                  className="w-full bg-base-100 text-base-content placeholder:text-base-content/30 border border-base-300 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/10 transition"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-1">
              <button
                type="button" onClick={() => setOpenModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-base-300 text-sm font-medium text-base-content/60 hover:bg-base-200 transition"
              >Cancel</button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-success hover:bg-success/90 text-success-content text-sm font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <PlusIcon className="w-4 h-4" />
                {selectedContact ? "Update" : "Add Contact"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
);
};

export default GroupContacts;