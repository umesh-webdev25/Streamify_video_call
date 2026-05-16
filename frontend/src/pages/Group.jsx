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
  MessageSquareIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  if (!img) return "/group.png";
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
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
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


  console.log("groups", groups);
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
    <div className="min-h-screen bg-base-200 p-4 md:p-6 font-sans">

      {/* ── PAGE HEADER ── */}
      <div
        className="
    flex items-center justify-between
    mb-5
    bg-base-100
    border border-base-300
    rounded-2xl
    px-6 py-5
    shadow-sm
  "
      >
        {/* Left Content */}
        <div>
          <h1 className="text-2xl font-bold text-base-content">
            Groups
          </h1>

          <p className="text-sm text-base-content/50 mt-1">
            Manage your groups and contacts easily
          </p>
        </div>

        {/* Right Button */}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">

        {/* Total Groups */}
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
              Total Groups
            </p>

            <h2 className="text-4xl font-bold text-base-content mt-2">
              {groups.length}
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
            <UsersIcon className="w-7 h-7 text-primary" />
          </div>
        </div>

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
        bg-success/10
        flex items-center justify-center
        flex-shrink-0
      "
          >
            <ContactIcon className="w-7 h-7 text-success" />
          </div>
        </div>

        {/* Active Groups */}
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
              Active Groups
            </p>

            <h2 className="text-4xl font-bold text-base-content mt-2">
              {groups.filter((g) => g.members?.length > 0).length}
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
            <ActivityIcon className="w-7 h-7 text-secondary" />
          </div>
        </div>

        {/* Inactive Groups */}
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
              Inactive Groups
            </p>

            <h2 className="text-4xl font-bold text-base-content mt-2">
              {groups.filter((g) => g.status === "inactive").length}
            </h2>
          </div>

          <div
            className="
        w-14 h-14
        rounded-2xl
        bg-warning/10
        flex items-center justify-center
        flex-shrink-0
      "
          >
            <FolderIcon className="w-7 h-7 text-warning" />
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
              placeholder="Search Name/Bio/Description"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-transparent outline-none text-sm text-base-content placeholder:text-base-content/40"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-10 px-3 rounded-xl border border-base-300 text-sm text-base-content bg-base-100 outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Add New */}
          <button
            onClick={openCreateModal}
            className="h-10 px-4 rounded-xl bg-success hover:bg-success/90 text-success-content text-sm font-semibold flex items-center gap-1.5 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add New
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
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-base-200 border-b border-base-300">
                <th className="px-4 py-3.5 text-xs font-bold text-base-content/60 uppercase tracking-wider">Group</th>
                <th className="px-4 py-3.5 text-xs font-bold text-base-content/60 uppercase tracking-wider">Members</th>
                <th className="px-4 py-3.5 text-xs font-bold text-base-content/60 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3.5 text-xs font-bold text-base-content/60 uppercase tracking-wider">Created</th>
                <th className="px-4 py-3.5 text-xs font-bold text-base-content/60 uppercase tracking-wider">Updated</th>
                <th className="px-4 py-3.5 text-xs font-bold text-base-content/60 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pagedGroups.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-10 text-center text-gray-500">
                    No groups found.
                  </td>
                </tr>
              ) : (
                pagedGroups.map((group) => (
                  <tr
                    key={group._id}
                    onClick={() => navigate(`/groups/${group._id}`)}
                    className="hover:bg-base-200/50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={resolveImageSrc(group.groupImage, group.groupName)}
                          alt={group.groupName}
                          className="w-10 h-10 rounded-xl object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/group.png";
                          }}
                        />
                        <div>
                          <p className="
  text-[15px]
  font-semibold
  text-base-content
  tracking-tight
  leading-5
">{group.groupName}</p>
                          {/* <p className="text-xs text-gray-500 truncate max-w-[200px]">{group.groupBio || "No description"}</p> */}
                        </div>
                      </div>

                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span
                        className="
      inline-flex
      items-center
      justify-center
      min-w-[30px]
      h-7
      px-2.5
      rounded-full
      bg-primary/10
      text-primary
      text-xs
      font-bold
      border border-primary/20 -ml-[9rem]
    "
                      >
                        {group.members?.length || 0}
                      </span>
                    </td>


                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${group.status === "active" ? "bg-success/10 text-success" : "bg-base-200 text-base-content/60"}`}>
                        {group.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-sm text-base-content/60">
                      {new Date(group.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3.5 text-sm text-base-content/60">
                      {new Date(group.updatedAt).toLocaleDateString()}
                    </td>
                    <td
                      className="px-4 py-3.5 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            setMenuPosition({
                              top: rect.bottom + 8,
                              left: rect.right - 180,
                            });
                            setMenuOpenId(menuOpenId === group._id ? null : group._id);
                          }}
                          className="w-8 h-8 rounded-lg border border-base-300 bg-base-100 hover:bg-base-200 text-base-content/40 flex items-center justify-center transition-colors"
                        >
                          <MoreVerticalIcon className="w-4 h-4" />
                        </button>
                      </div>

                      {menuOpenId === group._id && (
                        <div
                          className="fixed z-[99999] w-44 bg-base-100 border border-base-300 rounded-xl shadow-2xl overflow-hidden"
                          style={{
                            top: `${menuPosition.top}px`,
                            left: `${menuPosition.left}px`,
                          }}
                        >
                          <button
                            onClick={(e) => {
                              handleOpenChat(e, group);
                              setMenuOpenId(null);
                            }}
                            className="w-full px-4 py-3 text-left text-sm font-medium text-primary hover:bg-primary/10 flex items-center gap-2 transition-colors"
                          >
                            <MessageCircleIcon className="w-4 h-4" />
                            Open Chat
                          </button>

                          <button
                            onClick={(e) => {
                              handleEditGroup(e, group);
                              setMenuOpenId(null);
                            }}
                            className="w-full px-4 py-3 text-left text-sm font-medium text-amber-600 hover:bg-amber-50 flex items-center gap-2 transition-colors"
                          >
                            <PencilIcon className="w-4 h-4" />
                            Edit Group
                          </button>

                          <button
                            onClick={(e) => {
                              handleDeleteGroup(e, group._id);
                              setMenuOpenId(null);
                            }}
                            className="w-full px-4 py-3 text-left text-sm font-medium text-error hover:bg-error/10 flex items-center gap-2 transition-colors"
                          >
                            <Trash2Icon className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
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
            {/* First */}
            <button
              onClick={() => setPage(1)}
              disabled={safePage === 1}
              className="w-8 h-8 rounded-lg border border-base-300 bg-base-100 text-sm font-semibold text-base-content/60 disabled:opacity-30 hover:bg-base-200 transition-colors"
            >«</button>
            {/* Prev */}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="w-8 h-8 rounded-lg border border-base-300 bg-base-100 text-sm font-semibold text-base-content/60 disabled:opacity-30 hover:bg-base-200 transition-colors"
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
                      ? "bg-primary text-primary-content border-0"
                      : "border border-base-300 bg-base-100 text-base-content hover:bg-base-200"
                      }`}
                  >{p}</button>
                )
              )}

            {/* Next */}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="w-8 h-8 rounded-lg border border-base-300 bg-base-100 text-sm font-semibold text-base-content/60 disabled:opacity-30 hover:bg-base-200 transition-colors"
            >›</button>
            {/* Last */}
            <button
              onClick={() => setPage(totalPages)}
              disabled={safePage === totalPages}
              className="w-8 h-8 rounded-lg border border-base-300 bg-base-100 text-sm font-semibold text-base-content/60 disabled:opacity-30 hover:bg-base-200 transition-colors"
            >»</button>
          </div>

          {/* Jump to page */}
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

      {/* ── CREATE / EDIT MODAL ─────────────────────────────────────────────── */}
      {openModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-md p-6 relative">
            {/* Close */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-base-200 hover:bg-base-300 text-base-content/50 transition"
            >
              <XIcon className="w-4 h-4" />
            </button>

            <h2 className="text-xl font-bold text-base-content mb-6">
              {editingGroup ? "Edit Group" : "Add New Group"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Image Upload */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-base-300 overflow-hidden flex items-center justify-center bg-base-200">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "/group.png"; }} />
                  ) : (
                    <UploadIcon className="w-8 h-8 text-base-content/20" />
                  )}
                </div>
                <label className="cursor-pointer text-sm text-primary hover:underline font-medium">
                  {imagePreview ? "Change Image" : "Upload Image"}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>

              {/* Group Name */}
              <div>
                <label className="block text-sm font-medium text-base-content/70 mb-1">
                  Group Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  name="groupName"
                  value={groupData.groupName}
                  onChange={handleChange}
                  required
                  placeholder="Enter group name"
                  className="w-full bg-base-100 text-base-content placeholder:text-base-content/30 border border-base-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/10 transition"
                />
              </div>

              {/* Group Bio */}
              <div>
                <label className="block text-sm font-medium text-base-content/70 mb-1">Bio / Description</label>
                <textarea
                  name="groupBio"
                  value={groupData.groupBio}
                  onChange={handleChange}
                  placeholder="Short description..."
                  rows={3}
                  className="w-full bg-base-100 text-base-content placeholder:text-base-content/30 border border-base-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/10 transition resize-none"
                />
              </div>

              {/* Status Toggle */}
              <div>
                <label className="block text-sm font-medium text-base-content/70 mb-2">Group Status</label>
                <div className="flex items-center justify-between bg-base-200 border border-base-300 rounded-2xl px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-base-content">
                      {groupData.status === "active" ? "Active Group" : "Inactive Group"}
                    </p>
                    <p className="text-xs text-base-content/50 mt-1">
                      {groupData.status === "active" ? "Group is enabled and visible" : "Group is temporarily disabled"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGroupData((prev) => ({ ...prev, status: prev.status === "active" ? "inactive" : "active" }))}
                    className={`relative w-14 h-8 rounded-full transition-all duration-300 ${groupData.status === "active" ? "bg-success" : "bg-base-300"}`}
                  >
                    <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-base-100 shadow-md transition-all duration-300 ${groupData.status === "active" ? "translate-x-6" : "translate-x-0"}`} />
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
      <AnimatePresence>
        {openChat && selectedGroup && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenChat(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ y: "100%", opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "100%", opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="
                relative
                bg-base-100/95
                backdrop-blur-xl
                w-full sm:max-w-md
                h-[85vh] sm:h-[650px]
                rounded-t-[2.5rem] sm:rounded-[2.5rem]
                shadow-[0_20px_60px_rgba(0,0,0,0.3)]
                border border-base-300/50
                flex flex-col
                overflow-hidden
                z-10
              "
            >
              {/* Header - Sticky */}
              <div className="sticky top-0 z-20 bg-base-100/80 backdrop-blur-md border-b border-base-300 px-6 py-4 flex items-center gap-4">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-tr from-primary to-secondary rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity blur" />
                  <img
                    src={resolveImageSrc(selectedGroup.groupImage, selectedGroup.groupName)}
                    alt={selectedGroup.groupName}
                    onError={(e) => {
                      e.currentTarget.src = "/group.png";
                    }}
                    className="relative w-12 h-12 rounded-2xl object-cover ring-2 ring-primary/20 shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success border-2 border-base-100 rounded-full shadow-sm" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base-content text-lg leading-tight truncate">
                    {selectedGroup.groupName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
                    <p className="text-xs font-medium text-base-content/60">
                      {selectedGroup.members?.length ?? 0} members · Online
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setOpenChat(false)}
                  className="
                    w-10 h-10
                    flex items-center justify-center
                    rounded-2xl
                    bg-base-200/70
                    text-base-content/60
                    hover:bg-error hover:text-white
                    hover:rotate-90
                    hover:scale-95
                    active:scale-90
                    transition-all duration-300
                  "
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Messages Area */}
              <div
                className="
                  flex-1
                  overflow-y-auto
                  px-6 py-6
                  space-y-6
                  scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-transparent
                "
              >
                {chatLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </div>
                    <p className="text-sm font-medium text-base-content/40 animate-pulse">
                      Encrypting connection...
                    </p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-10">
                    <div className="w-20 h-20 rounded-3xl bg-base-200 flex items-center justify-center">
                      <MessageSquareIcon className="w-10 h-10 text-base-content/20" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-base-content">No messages yet</h4>
                      <p className="text-sm text-base-content/40 mt-1">
                        Be the first to break the ice in {selectedGroup.groupName}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Date Divider Placeholder */}
                    <div className="flex items-center gap-4 py-2">
                      <div className="h-px flex-1 bg-base-300/50" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-base-content/30 bg-base-200/50 px-3 py-1 rounded-full">
                        Today
                      </span>
                      <div className="h-px flex-1 bg-base-300/50" />
                    </div>

                    {messages.map((msg, index) => (
                      <motion.div
                        key={msg.id || index}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                      >
                        <div className="flex flex-col gap-1.5 max-w-[85%]">
                          <div
                            className={`
                              relative
                              px-5 py-3
                              text-sm
                              leading-relaxed
                              shadow-sm
                              transition-transform duration-200 hover:scale-[1.02]
                              ${msg.sender === "me"
                                ? "bg-gradient-to-br from-primary to-secondary text-white rounded-[1.25rem] rounded-br-[0.3rem] shadow-primary/20 shadow-lg"
                                : "bg-base-200 text-base-content border border-base-300/50 rounded-[1.25rem] rounded-bl-[0.3rem]"
                              }
                            `}
                          >
                            {msg.text}

                            {/* Glow Effect for user messages */}
                            {msg.sender === "me" && (
                              <div className="absolute inset-0 bg-white/10 rounded-[1.25rem] rounded-br-[0.3rem] blur-xl -z-10 opacity-50" />
                            )}
                          </div>
                          <span className={`text-[10px] font-medium text-base-content/30 ${msg.sender === "me" ? "text-right mr-1" : "ml-1"}`}>
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Section - Glassmorphism */}
              <div className="sticky bottom-0 bg-base-100/80 backdrop-blur-xl border-t border-base-300 px-5 py-4 sm:pb-6">
                <div className="relative group">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleMessageKeyDown}
                    placeholder="Message..."
                    className="
                      w-full
                      bg-base-200
                      text-base-content
                      placeholder:text-base-content/30
                      border border-base-300
                      rounded-[1.25rem]
                      pl-5 pr-14 py-3.5
                      text-sm
                      outline-none
                      focus:border-primary/50
                      focus:ring-4 focus:ring-primary/5
                      transition-all duration-300
                    "
                  />

                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="
                      absolute right-2 top-2 bottom-2
                      px-4
                      bg-gradient-to-br from-primary to-secondary
                      text-white
                      rounded-xl
                      flex items-center justify-center
                      shadow-md shadow-primary/20
                      hover:scale-105 active:scale-95
                      disabled:opacity-40 disabled:grayscale disabled:scale-100
                      transition-all duration-300
                      z-10
                    "
                  >
                    <SendIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Group;