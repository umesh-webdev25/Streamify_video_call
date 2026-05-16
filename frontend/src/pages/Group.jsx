import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  UsersIcon,
  PlusIcon,
  SearchIcon,
  MessageCircleIcon,
  XIcon,
  UploadIcon,
  SendIcon,
  PencilIcon,
  Trash2Icon,
  ContactIcon,
  ActivityIcon,
  FolderIcon,
  MoreVerticalIcon,
  DownloadIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  createGroup,
  getAllGroups,
  updateGroup,
  getAllContacts,
  getGroupById,
  deleteGroup,
} from "../lib/api";

/** Replace with real auth user from your store/context */
const authUser = {
  _id: "664d8a1b2c9f8f0012345678",
};

/** Resolve image URL from backend */
const resolveImageSrc = (img, name) => {
  if (!img)
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Group")}&background=random`;
  if (/^https?:\/\//i.test(img)) return img;
  const base = (import.meta?.env?.VITE_API_BASE_URL || "").replace(/\/$/, "");
  const path = img.startsWith("/") ? img : `/${img}`;
  return `${base}${path}`;
};

const Group = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // ── State ──────────────────────────────────────────────────────────────────
  const [groups, setGroups] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [groupData, setGroupData] = useState({ groupName: "", groupBio: "", status: "active" });
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ── Fetch Groups from API ──────────────────────────────────────────────────
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await getAllGroups();
      const groupsWithMembers = await Promise.all(
        (data || []).map(async (g) => {
          if (Array.isArray(g.members)) return g;
          try {
            const full = await getGroupById(g._id);
            return { ...g, members: full?.members || [] };
          } catch (e) {
            return { ...g, members: [] };
          }
        }),
      );
      setGroups(groupsWithMembers);
    } catch (err) {
      console.error("fetchGroups error:", err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch Contacts from API ────────────────────────────────────────────────
  const fetchContacts = async () => {
    try {
      const data = await getAllContacts();
      setContacts(data || []);
    } catch (err) {
      console.error("fetchContacts error:", err);
      setContacts([]);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchContacts();
  }, []);

  useEffect(() => {
    const handler = () => fetchGroups();
    window.addEventListener("groups:updated", handler);
    return () => window.removeEventListener("groups:updated", handler);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setOpenModal(false);
        setOpenChat(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // Close action menu on outside click
  useEffect(() => {
    const close = () => setMenuOpenId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  // ── Open Chat ─────────────────────────────────────────────────────────────
  const handleOpenChat = async (e, group) => {
    e.stopPropagation();
    try {
      setChatLoading(true);
      const full = await getGroupById(group._id);
      setSelectedGroup(full || group);
    } catch (err) {
      console.error("getGroupById error:", err);
      setSelectedGroup(group);
    } finally {
      setChatLoading(false);
    }
    setMessages([]);
    setOpenChat(true);
  };

  // ── Form field change ──────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setGroupData((prev) => ({ ...prev, [name]: value }));
  };

  // ── Image file select ──────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ── Create / Update group via API ──────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupData.groupName.trim()) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("groupName", groupData.groupName);
      formData.append("groupBio", groupData.groupBio);
      if (imageFile) formData.append("groupImage", imageFile);
      formData.append("status", groupData.status || "active");
      formData.append("members", JSON.stringify([{ user: authUser._id, isAdmin: true }]));
      formData.append("admins", JSON.stringify([authUser._id]));

      let response;
      if (editingGroup) {
        response = await updateGroup(editingGroup._id, formData);
        setGroups((prev) => prev.map((g) => (g._id === editingGroup._id ? response : g)));
      } else {
        response = await createGroup(formData);
        setGroups((prev) => [response, ...prev]);
      }
      closeModal();
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete group ───────────────────────────────────────────────────────────
  const handleDeleteGroup = async (e, id) => {
    e.stopPropagation();
    const prev = groups;
    setGroups((p) => p.filter((g) => g._id !== id));
    try {
      await deleteGroup(id);
      window.dispatchEvent(new CustomEvent("groups:updated"));
    } catch (err) {
      console.error("Failed to delete group:", err);
      setGroups(prev);
    }
  };

  // ── Open edit modal ────────────────────────────────────────────────────────
  const handleEditGroup = (e, group) => {
    e.stopPropagation();
    setEditingGroup(group);
    setGroupData({ groupName: group.groupName, groupBio: group.groupBio, status: group.status });
    setImagePreview(resolveImageSrc(group.groupImage, group.groupName));
    setImageFile(null);
    setOpenModal(true);
  };

  const openCreateModal = () => {
    setEditingGroup(null);
    setGroupData({ groupName: "", groupBio: "", status: "active" });
    setImagePreview(null);
    setImageFile(null);
    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
    setEditingGroup(null);
    setGroupData({ groupName: "", groupBio: "", status: "active" });
    setImagePreview(null);
    setImageFile(null);
  };

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSendMessage = () => {
    if (!message.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), text: message.trim(), sender: "me" }]);
    setMessage("");
  };

  const handleMessageKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ── Export CSV ────────────────────────────────────────────────────────────
  const handleExport = () => {
    const csv = [
      "Name,Bio,Status,Members,Created",
      ...groups.map((g) =>
        `"${g.groupName}","${g.groupBio || ""}",${g.status},${g.contactCount ?? 0},${new Date(g.createdAt).toLocaleDateString()}`
      ),
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "groups.csv";
    a.click();
  };

  // ── Filter & paginate ──────────────────────────────────────────────────────
  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      const q = search.toLowerCase();
      const matchQ = !q || g.groupName?.toLowerCase().includes(q) || (g.groupBio || "").toLowerCase().includes(q);
      const matchS = statusFilter === "all" || g.status === statusFilter;
      return matchQ && matchS;
    });
  }, [groups, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredGroups.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const pagedGroups = filteredGroups.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans">

      {/* ── PAGE HEADER ── */}
      <div
        className="
    flex items-center justify-between
    mb-5
    bg-white
    border border-gray-200
    rounded-2xl
    px-6 py-5
    shadow-sm
  "
      >
        {/* Left Content */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Groups
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage your groups and contacts easily
          </p>
        </div>

        {/* Right Button */}
        <button
          className="
      w-10 h-10
      rounded-xl
      flex items-center justify-center
      text-gray-400
      hover:text-gray-700
      hover:bg-gray-100
      transition-all
    "
        >
          <MoreVerticalIcon className="w-5 h-5" />
        </button>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">

        {/* Total Groups */}
        <div
          className="
      bg-white
      border border-gray-200
      rounded-2xl
      px-6
      h-[120px]
      flex items-center justify-between
      shadow-sm hover:shadow-md
      transition-all duration-300
    "
        >
          <div>
            <p className="text-sm font-medium text-gray-500">
              Total Groups
            </p>

            <h2 className="text-4xl font-bold text-gray-900 mt-2">
              {groups.length}
            </h2>
          </div>

          <div
            className="
        w-14 h-14
        rounded-2xl
        bg-blue-50
        flex items-center justify-center
        flex-shrink-0
      "
          >
            <UsersIcon className="w-7 h-7 text-blue-600" />
          </div>
        </div>

        {/* Total Contacts */}
        <div
          className="
      bg-white
      border border-gray-200
      rounded-2xl
      px-6
      h-[120px]
      flex items-center justify-between
      shadow-sm hover:shadow-md
      transition-all duration-300
    "
        >
          <div>
            <p className="text-sm font-medium text-gray-500">
              Total Contacts
            </p>

            <h2 className="text-4xl font-bold text-gray-900 mt-2">
              {contacts.length}
            </h2>
          </div>

          <div
            className="
        w-14 h-14
        rounded-2xl
        bg-green-50
        flex items-center justify-center
        flex-shrink-0
      "
          >
            <ContactIcon className="w-7 h-7 text-green-600" />
          </div>
        </div>

        {/* Active Groups */}
        <div
          className="
      bg-white
      border border-gray-200
      rounded-2xl
      px-6
      h-[120px]
      flex items-center justify-between
      shadow-sm hover:shadow-md
      transition-all duration-300
    "
        >
          <div>
            <p className="text-sm font-medium text-gray-500">
              Active Groups
            </p>

            <h2 className="text-4xl font-bold text-gray-900 mt-2">
              {groups.filter((g) => g.members?.length > 0).length}
            </h2>
          </div>

          <div
            className="
        w-14 h-14
        rounded-2xl
        bg-purple-50
        flex items-center justify-center
        flex-shrink-0
      "
          >
            <ActivityIcon className="w-7 h-7 text-purple-600" />
          </div>
        </div>

        {/* Inactive Groups */}
        <div
          className="
      bg-white
      border border-gray-200
      rounded-2xl
      px-6
      h-[120px]
      flex items-center justify-between
      shadow-sm hover:shadow-md
      transition-all duration-300
    "
        >
          <div>
            <p className="text-sm font-medium text-gray-500">
              Inactive Groups
            </p>

            <h2 className="text-4xl font-bold text-gray-900 mt-2">
              {groups.filter((g) => g.status === "inactive").length}
            </h2>
          </div>

          <div
            className="
        w-14 h-14
        rounded-2xl
        bg-orange-50
        flex items-center justify-center
        flex-shrink-0
      "
          >
            <FolderIcon className="w-7 h-7 text-orange-500" />
          </div>
        </div>
      </div>

      {/* ── TABLE CARD ── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-gray-100">
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 min-w-[220px] bg-gray-50 border border-gray-200 rounded-xl px-3 h-10">
            <SearchIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search Name/Bio/Description"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-10 px-3 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Add New */}
          <button
            onClick={openCreateModal}
            className="h-10 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold flex items-center gap-1.5 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add New
          </button>

          {/* Export */}
          <button
            onClick={handleExport}
            className="h-10 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold flex items-center gap-1.5 transition-colors"
          >
            <DownloadIcon className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[22%]">Name</th>
                {/* <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[18%]">Department</th> */}
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[25%]">Description</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[12%]">Status</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[10%]">Members</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[13%]">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-20">
                    <span className="loading loading-spinner loading-lg text-blue-600" />
                  </td>
                </tr>
              ) : pagedGroups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <UsersIcon className="w-8 h-8 text-blue-400" />
                      </div>
                      <p className="text-base font-semibold text-gray-700">No Groups Found</p>
                      <p className="text-sm text-gray-400">
                        {search ? `No results for "${search}"` : "Create your first group to get started"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedGroups.map((group, idx) => (
                  <tr
                    key={group._id}
                    onClick={() => navigate(`/groups/${group._id}`)}
                    className={`cursor-pointer border-b border-gray-50 hover:bg-blue-50 transition-colors duration-150 ${idx % 2 === 1 ? "bg-gray-50/50" : "bg-white"}`}
                  >
                    {/* Name */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={resolveImageSrc(group.groupImage, group.groupName)}
                          alt={group.groupName}
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(group.groupName || "G")}&background=random`;
                          }}
                          className="w-9 h-9 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                        />
                        <span className="text-sm font-semibold text-blue-600 truncate">{group.groupName}</span>
                      </div>
                    </td>

                    {/* Department (status label) */}
                    {/* <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        {group.status === "active" ? "Active Group" : "Inactive Group"}
                      </span>
                    </td> */}

                    {/* Description */}
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-gray-500 truncate block max-w-[220px]">
                        {group.groupBio || "N/A"}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${group.status === "active"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                          }`}
                      >
                        <span className={` w-1.5 h-1.5 rounded-full ${group.status === "active" ? "bg-green-500" : "bg-gray-400"}`} />
                        {group.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Members Count */}
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
                        {group.contactCount ?? 0}
                      </span>
                    </td>

                    {/* Action Menu */}
                    <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(menuOpenId === group._id ? null : group._id);
                          }}
                          className="w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 flex items-center justify-center transition-colors"
                        >
                          <MoreVerticalIcon className="w-4 h-4" />
                        </button>

                        {menuOpenId === group._id && (
                          <div className="absolute right-0 top-9 z-30 bg-white border border-gray-200 rounded-xl shadow-xl min-w-[148px] overflow-hidden">
                            <button
                              onClick={(e) => { handleOpenChat(e, group); setMenuOpenId(null); }}
                              className="w-full px-4 py-2.5 text-left text-sm font-medium text-blue-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                            >
                              <MessageCircleIcon className="w-4 h-4" /> Open Chat
                            </button>
                            <button
                              onClick={(e) => { handleEditGroup(e, group); setMenuOpenId(null); }}
                              className="w-full px-4 py-2.5 text-left text-sm font-medium text-amber-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                            >
                              <PencilIcon className="w-4 h-4" /> Edit Group
                            </button>
                            <button
                              onClick={(e) => { handleDeleteGroup(e, group._id); setMenuOpenId(null); }}
                              className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-500 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                            >
                              <Trash2Icon className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
          {/* Rows per page */}
          <div className="flex items-center gap-2">
            <select
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
              className="h-8 px-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white outline-none cursor-pointer"
            >
              {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <span className="text-sm text-gray-500">Items per page</span>
          </div>

          {/* Page Buttons */}
          <div className="flex items-center gap-1">
            {/* First */}
            <button
              onClick={() => setPage(1)}
              disabled={safePage === 1}
              className="w-8 h-8 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-600 disabled:text-gray-300 hover:bg-gray-50 transition-colors"
            >«</button>
            {/* Prev */}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="w-8 h-8 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-600 disabled:text-gray-300 hover:bg-gray-50 transition-colors"
            >‹</button>

            {/* Page numbers */}
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
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${p === safePage
                      ? "bg-blue-600 text-white border-0"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                  >{p}</button>
                )
              )}

            {/* Next */}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="w-8 h-8 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-600 disabled:text-gray-300 hover:bg-gray-50 transition-colors"
            >›</button>
            {/* Last */}
            <button
              onClick={() => setPage(totalPages)}
              disabled={safePage === totalPages}
              className="w-8 h-8 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-600 disabled:text-gray-300 hover:bg-gray-50 transition-colors"
            >»</button>
          </div>

          {/* Jump to page */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Jump to</span>
            <select
              value={safePage}
              onChange={(e) => setPage(Number(e.target.value))}
              className="h-8 px-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white outline-none cursor-pointer"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── CREATE / EDIT MODAL ─────────────────────────────────────────────── */}
      {openModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative">
            {/* Close */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition"
            >
              <XIcon className="w-4 h-4" />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingGroup ? "Edit Group" : "Add New Group"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Image Upload */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center bg-gray-50">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <UploadIcon className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <label className="cursor-pointer text-sm text-blue-600 hover:underline font-medium">
                  {imagePreview ? "Change Image" : "Upload Image"}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>

              {/* Group Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="groupName"
                  value={groupData.groupName}
                  onChange={handleChange}
                  required
                  placeholder="Enter group name"
                  className="w-full bg-white text-black placeholder:text-gray-400 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition"
                />
              </div>

              {/* Group Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio / Description</label>
                <textarea
                  name="groupBio"
                  value={groupData.groupBio}
                  onChange={handleChange}
                  placeholder="Short description..."
                  rows={3}
                  className="w-full bg-white text-black placeholder:text-gray-400 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition resize-none"
                />
              </div>

              {/* Status Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group Status</label>
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {groupData.status === "active" ? "Active Group" : "Inactive Group"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {groupData.status === "active" ? "Group is enabled and visible" : "Group is temporarily disabled"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGroupData((prev) => ({ ...prev, status: prev.status === "active" ? "inactive" : "active" }))}
                    className={`relative w-14 h-8 rounded-full transition-all duration-300 ${groupData.status === "active" ? "bg-green-500" : "bg-gray-300"}`}
                  >
                    <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${groupData.status === "active" ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold disabled:opacity-60 transition"
                >
                  {submitting ? (editingGroup ? "Saving..." : "Creating...") : (editingGroup ? "Save Changes" : "Add New")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CHAT PANEL ──────────────────────────────────────────────────────── */}
      {openChat && selectedGroup && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md sm:rounded-3xl shadow-2xl flex flex-col h-[85vh] sm:h-[600px] overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <img
                src={resolveImageSrc(selectedGroup.groupImage, selectedGroup.groupName)}
                alt={selectedGroup.groupName}
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedGroup.groupName || "G")}&background=random`;
                }}
                className="w-10 h-10 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{selectedGroup.groupName}</p>
                <p className="text-xs text-gray-400">{selectedGroup.members?.length ?? 0} members</p>
              </div>
              <button
                onClick={() => setOpenChat(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {chatLoading ? (
                <div className="flex justify-center py-10">
                  <span className="loading loading-spinner loading-md" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <MessageCircleIcon className="w-10 h-10 mb-2 opacity-30" />
                  <p className="text-sm">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.sender === "me" ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleMessageKeyDown}
                placeholder="Type a message…"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition"
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="w-10 h-10 flex-shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center disabled:opacity-40 transition"
              >
                <SendIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Group;