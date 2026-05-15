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
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]); // ✅ empty — no fake data
  const [chatLoading, setChatLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [groupData, setGroupData] = useState({ groupName: "", groupBio: "" });

  // ── Fetch Groups from API ──────────────────────────────────────────────────
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await getAllGroups();
      // Ensure each group has a populated `members` array (some APIs return partial data)
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
      setContacts(data || []); // ✅ store array not data.length
    } catch (err) {
      console.error("fetchContacts error:", err);
      setContacts([]);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchContacts();
  }, []);

  // Refresh groups when contacts or groups change elsewhere
  useEffect(() => {
    const handler = () => fetchGroups();
    window.addEventListener("groups:updated", handler);
    return () => window.removeEventListener("groups:updated", handler);
  }, []);

  // ── Scroll chat to bottom on new message ───────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── ESC key closes modals ──────────────────────────────────────────────────
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

  // ── Revoke blob preview URL on cleanup ────────────────────────────────────
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // ── Open Chat — clears messages, ready for real API ───────────────────────
  const handleOpenChat = async (e, group) => {
    e.stopPropagation();
    // Fetch full group details to guarantee members array is available
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
    setMessages([]); // ✅ no fake data injected
    setOpenChat(true);

    // Uncomment when you have a messages API:
    // setChatLoading(true);
    // try {
    //   const data = await getMessagesByGroup(group._id);
    //   setMessages(data || []);
    // } catch (err) {
    //   console.error("fetchMessages error:", err);
    // } finally {
    //   setChatLoading(false);
    // }
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
      formData.append(
        "members",
        JSON.stringify([{ user: authUser._id, isAdmin: true }]),
      );
      formData.append("admins", JSON.stringify([authUser._id]));

      let response;
      if (editingGroup) {
        response = await updateGroup(editingGroup._id, formData); // ✅ real API call
        setGroups((prev) =>
          prev.map((g) => (g._id === editingGroup._id ? response : g)),
        );
      } else {
        response = await createGroup(formData); // ✅ real API call
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

    // Optimistic UI: remove immediately
    const prev = groups;
    setGroups((p) => p.filter((g) => g._id !== id));

    try {
      await deleteGroup(id);
      // notify others if needed
      window.dispatchEvent(new CustomEvent("groups:updated"));
    } catch (err) {
      console.error("Failed to delete group:", err);
      // revert UI
      setGroups(prev);
    }
  };

  // ── Open edit modal pre-filled with real group data ────────────────────────
  const handleEditGroup = (e, group) => {
    e.stopPropagation();
    setEditingGroup(group);
    setGroupData({ groupName: group.groupName, groupBio: group.groupBio });
    setImagePreview(resolveImageSrc(group.groupImage, group.groupName));
    setImageFile(null);
    setOpenModal(true);
  };

  const openCreateModal = () => {
    setEditingGroup(null);
    setGroupData({ groupName: "", groupBio: "" });
    setImagePreview(null);
    setImageFile(null);
    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
    setEditingGroup(null);
    setGroupData({ groupName: "", groupBio: "" });
    setImagePreview(null);
    setImageFile(null);
  };

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSendMessage = () => {
    if (!message.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text: message.trim(), sender: "me" },
    ]);
    setMessage("");
  };

  const handleMessageKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ── Filter groups by search ────────────────────────────────────────────────
  const filteredGroups = useMemo(
    () =>
      groups.filter((g) =>
        g.groupName?.toLowerCase().includes(search.toLowerCase()),
      ),
    [groups, search],
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
          {/* ✅ real counts from API */}
          <p className="text-sm text-gray-500 mt-1">
            {groups.length} group{groups.length !== 1 ? "s" : ""} ·{" "}
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-gray-200 bg-white px-4 py-3 rounded-2xl min-w-[260px]">
            <SearchIcon className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full outline-none text-sm text-gray-700 bg-transparent"
            />
          </div>

          <button
            onClick={openCreateModal}
            className="btn btn-primary rounded-2xl gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Create Group
          </button>
        </div>
      </div>

      {/* GROUP LIST — rendered from real API data */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : filteredGroups.length > 0 ? (
          filteredGroups.map((group) => (
            <div
              key={group._id}
              onClick={() => navigate(`/groups/${group._id}`)}
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  {/* ✅ real image from backend */}
                  <img
                    src={resolveImageSrc(group.groupImage, group.groupName)}
                    alt={group.groupName}
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(group.groupName || "G")}&background=random`;
                    }}
                    className="w-14 h-14 rounded-2xl object-cover border border-gray-200 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    {/* ✅ real groupName */}
                    <h2 className="text-lg font-semibold text-gray-900 truncate">
                      {group.groupName}
                    </h2>
                    {/* ✅ real groupBio */}
                    <p className="text-sm text-gray-500 mt-1 truncate">
                      {group.groupBio || "No description"}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                      <UsersIcon className="w-4 h-4" />
                      {/* ✅ real member count from populated members array */}
                      <span> Members {group.contactCount ?? 0}</span>
                    </div>
                    {/* <p className="text-sm text-gray-500 mt-1">
                      {group.contactCount ?? 0} Contacts
                    </p> */}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleOpenChat(e, group)}
                    className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center"
                    title="Open Chat"
                  >
                    <MessageCircleIcon className="w-5 h-5" />
                  </button>

                  <button
                    onClick={(e) => handleEditGroup(e, group)}
                    className="w-11 h-11 rounded-xl bg-yellow-50 text-yellow-600 hover:bg-yellow-100 flex items-center justify-center"
                    title="Edit Group"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>

                  <button
                    onClick={(e) => handleDeleteGroup(e, group._id)}
                    className="w-11 h-11 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center"
                    title="Delete Group"
                  >
                    <Trash2Icon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="border border-gray-200 rounded-3xl p-10 text-center bg-white">
            <UsersIcon className="w-14 h-14 mx-auto text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-800 mt-4">
              No Groups Found
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              {search
                ? `No results for "${search}"`
                : "Create your first group"}
            </p>
          </div>
        )}
      </div>

      {/* ── CREATE / EDIT MODAL ─────────────────────────────────────────────── */}
      {openModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500"
            >
              <XIcon className="w-4 h-4" />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingGroup ? "Edit Group" : "Create Group"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Image upload */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center bg-gray-50">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UploadIcon className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <label className="cursor-pointer text-sm text-blue-600 hover:underline font-medium">
                  {imagePreview ? "Change Image" : "Upload Image"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
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
                  className="
    w-full
    bg-white
    text-black
    placeholder:text-gray-400
    border border-gray-200
    rounded-xl
    px-4 py-3
    text-sm
    outline-none
    focus:border-blue-400
    focus:ring-1
    focus:ring-blue-100
    transition
  "
                />
              </div>

              {/* Group Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio / Description
                </label>
                <textarea
                  name="groupBio"
                  value={groupData.groupBio}
                  onChange={handleChange}
                  placeholder="Short description..."
                  rows={3}
                  className="
    w-full
    bg-white
    text-black
    placeholder:text-gray-400
    border border-gray-200
    rounded-xl
    px-4 py-3
    text-sm
    outline-none
    focus:border-blue-400
    focus:ring-1
    focus:ring-blue-100
    transition
    resize-none
  "
                />
              </div>

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
                  className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition"
                >
                  {submitting
                    ? editingGroup
                      ? "Saving…"
                      : "Creating…"
                    : editingGroup
                      ? "Save Changes"
                      : "Create Group"}
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
            {/* Header — real group data from API */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <img
                src={resolveImageSrc(
                  selectedGroup.groupImage,
                  selectedGroup.groupName,
                )}
                alt={selectedGroup.groupName}
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedGroup.groupName || "G")}&background=random`;
                }}
                className="w-10 h-10 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                {/* ✅ real group name */}
                <p className="font-semibold text-gray-900 truncate">
                  {selectedGroup.groupName}
                </p>
                {/* ✅ real member count */}
                <p className="text-xs text-gray-400">
                  {selectedGroup.members?.length ?? 0} members
                </p>
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
                /* ✅ empty state — no fake hardcoded messages */
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <MessageCircleIcon className="w-10 h-10 mb-2 opacity-30" />
                  <p className="text-sm">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.sender === "me"
                          ? "bg-blue-600 text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-800 rounded-bl-sm"
                      }`}
                    >
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
