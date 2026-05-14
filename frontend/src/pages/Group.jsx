import React, { useState, useMemo, useEffect, useRef } from "react";

import {
  UsersIcon,
  ImageIcon,
  PlusIcon,
  SearchIcon,
  MessageCircleIcon,
  VideoIcon,
  XIcon,
  UploadIcon,
  SendIcon,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const Group = () => {
  const [openModal, setOpenModal] = useState(false);

  const [openChat, setOpenChat] = useState(false);

  const [selectedGroup, setSelectedGroup] = useState(null);

  const [search, setSearch] = useState("");

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello 👋",
      sender: "me",
    },
  ]);

  const [submitting, setSubmitting] = useState(false);

  const [errors, setErrors] = useState({});

  const [groupData, setGroupData] = useState({
    groupName: "",
    groupBio: "",
    groupImage: null,
  });

  const navigate = useNavigate();

  const [imagePreview, setImagePreview] = useState(null);

  const [groups, setGroups] = useState([
    {
      id: 1,
      name: "Office Team",
      bio: "Frontend & backend developers",
      image: "https://ui-avatars.com/api/?name=Office+Team",
      members: 12,
    },
    {
      id: 2,
      name: "Family",
      bio: "Family members group",
      image: "https://ui-avatars.com/api/?name=Family",
      members: 6,
    },
    {
      id: 3,
      name: "Design Team",
      bio: "UI/UX designers workspace",
      image: "https://ui-avatars.com/api/?name=Design+Team",
      members: 8,
    },
  ]);

  const modalRef = useRef(null);

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setGroupData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setGroupData((prev) => ({
        ...prev,
        groupImage: file,
      }));

      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!groupData.groupName.trim()) {
      newErrors.groupName = "Group name is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 600));

    const newGroup = {
      id: Date.now(),

      name: groupData.groupName.trim(),

      bio: groupData.groupBio.trim(),

      image: groupData.groupImage
        ? URL.createObjectURL(groupData.groupImage)
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
            groupData.groupName,
          )}`,

      members: 1,
    };

    setGroups((prev) => [newGroup, ...prev]);

    setGroupData({
      groupName: "",
      groupBio: "",
      groupImage: null,
    });

    setImagePreview(null);

    setSubmitting(false);

    setOpenModal(false);
  };

  const filteredGroups = useMemo(
    () =>
      groups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase())),
    [groups, search],
  );

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setOpenModal(false);
    }
  };

  const handleDeleteGroup = (id) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: message,
      sender: "me",
    };

    setMessages((prev) => [...prev, newMessage]);

    setMessage("");
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Groups</h1>

          <p className="text-sm text-gray-500 mt-1">
            Create and manage your groups
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search */}
          <div
            className="
              flex items-center gap-2
              border border-gray-200
              bg-white
              px-4 py-3
              rounded-2xl
              min-w-[260px]
            "
          >
            <SearchIcon className="w-4 h-4 text-gray-400" />

            <input
              type="text"
              placeholder="Search groups..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full
                outline-none
                text-sm
                text-gray-700
                bg-transparent
              "
            />
          </div>

          {/* Create */}
          <button
            onClick={() => setOpenModal(true)}
            className="
              btn btn-primary
              rounded-2xl
              gap-2
            "
          >
            <PlusIcon className="w-5 h-5" />
            Create Group
          </button>
        </div>
      </div>

      {/* Group List */}
      <div className="space-y-3">
        {filteredGroups.map((group) => (
          <div
            key={group.id}
            onClick={() => navigate(`/groups/${group.id}`)}
            className="
              bg-white
              border border-gray-200
              rounded-2xl
              px-4 md:px-5
              py-4
              hover:border-blue-300
              hover:shadow-sm
              transition-all
              cursor-pointer
              group
            "
          >
            <div className="flex items-center justify-between gap-4">
              {/* Left */}
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={group.image}
                  alt={group.name}
                  className="
                    w-12 h-12
                    md:w-14 md:h-14
                    rounded-2xl
                    object-cover
                    border border-gray-200
                  "
                />

                <div className="min-w-0">
                  <h2
                    className="
                      text-lg
                      font-semibold
                      text-gray-900
                      truncate
                    "
                  >
                    {group.name}
                  </h2>

                  <p
                    className="
                      text-sm
                      text-gray-500
                      mt-1
                      truncate
                    "
                  >
                    {group.bio}
                  </p>

                  <div
                    className="
                      flex items-center gap-2
                      mt-2
                      text-sm
                      text-gray-400
                    "
                  >
                    <UsersIcon className="w-4 h-4" />

                    <span>{group.members} Members</span>
                  </div>
                </div>
              </div>

              {/* Right */}
              <div className="flex items-center gap-2">
                {/* Chat Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    setSelectedGroup(group);

                    setOpenChat(true);
                  }}
                  className="
      w-12 h-12
      rounded-xl
      flex items-center justify-center
      bg-blue-50
      text-blue-600
      hover:bg-blue-100
      hover:scale-105
      transition-all
      duration-200
    "
                >
                  <MessageCircleIcon className="w-6 h-6" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    handleDeleteGroup(group.id);
                  }}
                  className="
      w-12 h-12
      rounded-xl
      flex items-center justify-center
      bg-red-50
      text-red-600
      hover:bg-red-100
      hover:scale-105
      transition-all
      duration-200
    "
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty */}
        {filteredGroups.length === 0 && (
          <div
            className="
              border border-gray-200
              rounded-3xl
              p-10
              text-center
              bg-white
            "
          >
            <UsersIcon className="w-14 h-14 mx-auto text-gray-300" />

            <h2 className="text-xl font-semibold text-gray-800 mt-4">
              No Groups Found
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Create your first group to get started.
            </p>
          </div>
        )}
      </div>

      {/* Chat Popup */}
      {openChat && selectedGroup && (
        <div
          className="
            fixed inset-0 z-50
            bg-black/30
            flex items-center justify-center
            p-4
          "
        >
          {/* Phone UI */}
          <div
            className="
    w-[360px]
    h-[720px]
    bg-white
    rounded-[45px]
    border-[12px]
    border-black
    shadow-[0_30px_80px_rgba(0,0,0,0.25)]
    overflow-hidden
    flex flex-col
    relative
  "
          >
            {/* Dynamic Island */}
            <div
              className="
      absolute top-3 left-1/2
      -translate-x-1/2
      w-32 h-7
      bg-black
      rounded-full
      z-50
    "
            />

            {/* Top Header */}
            <div
              className="
      px-5
      pt-14
      pb-5
      border-b border-gray-100
      bg-white
      flex items-start justify-between
    "
            >
              {/* Left */}
              <div className="flex items-start gap-3">
                {/* Group Image */}
                <img
                  src={selectedGroup.image}
                  alt={selectedGroup.name}
                  className="
          w-14 h-14
          rounded-2xl
          object-cover
          border border-gray-200
        "
                />

                {/* Content */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedGroup.name}
                  </h2>

                  <p className="text-xs text-blue-500 mt-1">
                    {selectedGroup.members} Members • Online
                  </p>

                  <p
                    className="
            text-xs
            text-gray-500
            mt-2
            max-w-[180px]
            leading-relaxed
          "
                  >
                    {selectedGroup.bio}
                  </p>
                </div>
              </div>

              {/* Close */}
              <button
                onClick={() => setOpenChat(false)}
                className="
        btn btn-sm btn-circle
        btn-ghost
        mt-1
      "
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              className="
      flex-1
      overflow-y-auto
      px-4
      py-5
      bg-gradient-to-b
      from-gray-50
      to-white
      space-y-4
    "
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`
          flex
          ${msg.sender === "me" ? "justify-end" : "justify-start"}
        `}
                >
                  <div
                    className={`
            px-4 py-3
            rounded-3xl
            max-w-[80%]
            text-sm
            shadow-sm
            ${
              msg.sender === "me"
                ? "bg-blue-500 text-white rounded-br-md"
                : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
            }
          `}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom */}
            <div
              className="
      border-t border-gray-100
      p-4
      bg-white
    "
            >
              {/* Input Area */}
              <div
                className="
        flex items-center gap-2
        bg-gray-100
        rounded-3xl
        p-2
      "
              >
                <input
                  type="text"
                  placeholder={`Message ${selectedGroup.name}...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                  className="
          flex-1
          bg-transparent
          text-black
          placeholder:text-gray-400
          px-3
          outline-none
          text-sm
        "
                />

                {/* Send */}
                <button
                  onClick={handleSendMessage}
                  className="
          w-11 h-11
          rounded-full
          bg-blue-500
          flex items-center justify-center
          text-white
          hover:bg-blue-600
          transition-all
          shrink-0
        "
                >
                  <SendIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Cancel */}
              <button
                onClick={() => setOpenChat(false)}
                className="
        w-full
        text-sm
        text-gray-500
        mt-4
        hover:text-gray-700
        transition-all
      "
              >
                Close Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {openModal && (
        <div
          className="
            fixed inset-0 z-50
            bg-black/40
            flex items-center justify-center
            p-4
          "
          onClick={handleBackdropClick}
        >
          <div
            ref={modalRef}
            className="
              bg-white
              w-full max-w-xl
              rounded-3xl
              p-6
              relative
            "
          >
            {/* Close */}
            <button
              onClick={() => setOpenModal(false)}
              className="
                btn btn-sm btn-circle
                absolute top-4 right-4
              "
            >
              <XIcon className="w-4 h-4" />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Create Group
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="label">
                  <span className="label-text">Group Name</span>
                </label>

                <input
                  type="text"
                  name="groupName"
                  value={groupData.groupName}
                  onChange={handleChange}
                  placeholder="Enter group name"
                  className="
                    input input-bordered
                    w-full rounded-2xl
                  "
                />
              </div>

              {/* Image */}
              <div>
                <label className="label">
                  <span className="label-text">Group Image</span>
                </label>

                <label
                  className="
                    flex flex-col items-center justify-center
                    gap-2
                    border border-dashed border-gray-300
                    rounded-2xl
                    p-4
                    cursor-pointer
                    w-32 h-32
                  "
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="
                        w-full h-full
                        object-cover
                        rounded-xl
                      "
                    />
                  ) : (
                    <>
                      <UploadIcon className="w-5 h-5 text-primary" />

                      <span className="text-xs text-gray-500">Upload</span>
                    </>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Bio */}
              <div>
                <label className="label">
                  <span className="label-text">Group Bio</span>
                </label>

                <textarea
                  name="groupBio"
                  value={groupData.groupBio}
                  onChange={handleChange}
                  placeholder="Write group bio..."
                  rows={4}
                  className="
                    textarea textarea-bordered
                    w-full rounded-2xl
                  "
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="
                  btn btn-primary
                  w-full rounded-2xl
                  gap-2
                "
              >
                {submitting ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <PlusIcon className="w-5 h-5" />
                )}

                {submitting ? "Creating..." : "Create Group"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Group;
