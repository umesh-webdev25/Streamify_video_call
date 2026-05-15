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
} from "lucide-react";

import { useParams } from "react-router-dom";

import {
  createContact,
  getAllContacts,
  updateContact,
  deleteContact,
} from "../lib/api";

const GroupContacts = () => {
  const { groupId } = useParams();

  // Resolve image URL similar to Group page
  const resolveImageSrc = (img, name) => {
    if (!img) return "";
    if (/^https?:\/\//i.test(img)) return img;
    const base = (import.meta?.env?.VITE_API_BASE_URL || "").replace(/\/$/, "");
    const path = img.startsWith("/") ? img : `/${img}`;
    return `${base}${path}`;
  };

  const [openModal, setOpenModal] = useState(false);

  const [search, setSearch] = useState("");

  const [contacts, setContacts] = useState([]);

  const [selectedContact, setSelectedContact] = useState(null);

  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    designation: "",
    profileImage: null,
  });

  /**
   * GET CONTACTS
   */
  const fetchContacts = async () => {
    try {
      const data = await getAllContacts();

      const filtered = data.filter(
        (contact) => contact.groupId?._id === groupId,
      );

      setContacts(filtered);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  /**
   * INPUT CHANGE
   */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setContactData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  /**
   * CREATE / UPDATE
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      /**
       * UPDATE
       */
      if (selectedContact) {
        // Prepare multipart form data for update
        const formData = new FormData();
        formData.append("name", contactData.name);
        formData.append("email", contactData.email);
        formData.append("mobileNumber", contactData.mobileNumber);
        formData.append("designation", contactData.designation || "");
        if (contactData.profileImage) {
          formData.append("profileImage", contactData.profileImage);
        }

        const updated = await updateContact(selectedContact._id, formData);

        setContacts((prev) =>
          prev.map((c) => (c._id === updated._id ? updated : c)),
        );
      } else {
        /**
         * CREATE
         */
        // Prepare FormData for create
        const formData = new FormData();
        formData.append("name", contactData.name);
        formData.append("email", contactData.email);
        formData.append("mobileNumber", contactData.mobileNumber);
        formData.append("designation", contactData.designation || "");
        formData.append("groupId", groupId);
        if (contactData.profileImage) {
          formData.append("profileImage", contactData.profileImage);
        }

        const newContact = await createContact(formData);

        setContacts((prev) => [newContact, ...prev]);
        // Notify other parts of the app (groups list) to refresh
        try {
          window.dispatchEvent(new CustomEvent("groups:updated"));
        } catch (e) {}
      }

      /**
       * RESET
       */
      setContactData({
        name: "",
        email: "",
        mobileNumber: "",
        designation: "",
        profileImage: null,
      });

      setSelectedContact(null);

      setOpenModal(false);
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * DELETE
   */
  const handleDeleteContact = async (id) => {
    try {
      await deleteContact(id);

      setContacts((prev) => prev.filter((c) => c._id !== id));
      // Notify other parts of the app (groups list) to refresh
      try {
        window.dispatchEvent(new CustomEvent("groups:updated"));
      } catch (e) {}
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * EDIT
   */
  const handleEditContact = (contact) => {
    setSelectedContact(contact);

    setContactData({
      name: contact.name,
      email: contact.email,
      mobileNumber: contact.mobileNumber,
      designation: contact.designation || "",
      profileImage: null,
    });

    setOpenModal(true);
  };

  /**
   * FILTER
   */
  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-white p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Group Contacts</h1>

        <div className="flex items-center gap-3">
          {/* SEARCH */}
          <div
            className="
              flex items-center gap-3
              bg-white
              border border-gray-200
              rounded-2xl
              px-4
              h-12
              min-w-[280px]
            "
          >
            <SearchIcon className="w-4 h-4 text-gray-400" />

            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full
                bg-transparent
                outline-none
              "
            />
          </div>

          {/* ADD */}
          <button
            onClick={() => {
              setSelectedContact(null);

              setContactData({
                name: "",
                email: "",
                mobileNumber: "",
              });

              setOpenModal(true);
            }}
            className="
              btn btn-primary
              rounded-2xl
            "
          >
            <PlusIcon className="w-5 h-5" />
            Add Contact
          </button>
        </div>
      </div>

      {/* CONTACT LIST */}
      <div className="space-y-3">
        {filteredContacts.map((contact) => (
          <div
            key={contact._id}
            className="
                border border-gray-200
                rounded-3xl
                px-5 py-4
                bg-white
              "
          >
            <div className="flex items-center justify-between">
              {/* LEFT */}
              <div className="flex items-center gap-4">
                <div
                  className="
                      w-16 h-16
                      rounded-2xl
                      bg-blue-100
                      flex items-center justify-center
                    "
                >
                  {contact.profileImage ? (
                    <img
                      src={resolveImageSrc(contact.profileImage, contact.name)}
                      alt={contact.name}
                      className="w-full h-full object-cover rounded-2xl"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "";
                      }}
                    />
                  ) : (
                    <UserIcon className="w-7 h-7 text-blue-600" />
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-semibold">{contact.name}</h2>

                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <MailIcon className="w-4 h-4" />

                    <span>{contact.email}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <PhoneIcon className="w-4 h-4" />

                    <span>{contact.mobileNumber}</span>
                  </div>

                  {contact.designation && (
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <BriefcaseIcon className="w-4 h-4" />
                      <span>{contact.designation}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center gap-2">
                {/* EDIT */}
                <button
                  onClick={() => handleEditContact(contact)}
                  className="
                      w-11 h-11
                      rounded-2xl
                      bg-blue-50
                      text-blue-600
                      hover:bg-blue-100
                      flex items-center justify-center
                    "
                >
                  <PencilIcon className="w-4 h-4" />
                </button>

                {/* DELETE */}
                <button
                  onClick={() => handleDeleteContact(contact._id)}
                  className="
                      w-11 h-11
                      rounded-2xl
                      bg-red-50
                      text-red-500
                      hover:bg-red-100
                      flex items-center justify-center
                    "
                >
                  <Trash2Icon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {openModal && (
        <div
          className="
      fixed inset-0 z-50
      bg-black/40 backdrop-blur-sm
      flex items-center justify-center
      p-4
    "
        >
          <div
            className="
        bg-white
        w-full max-w-md
        rounded-3xl
        shadow-2xl
        relative
        overflow-hidden
      "
          >
            {/* HEADER */}
            <div
              className="
          flex items-center justify-between
          px-6 py-5
          border-b border-gray-100
        "
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedContact ? "Update Contact" : "Add Contact"}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Manage contact details
                </p>
              </div>

              <button
                onClick={() => setOpenModal(false)}
                className="
            w-10 h-10
            rounded-2xl
            bg-gray-100
            hover:bg-gray-200
            flex items-center justify-center
            transition-all
          "
              >
                <XIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* IMAGE */}
              <div className="flex justify-center">
                <label className="relative cursor-pointer">
                  {contactData.profileImage ? (
                    <img
                      src={
                        typeof contactData.profileImage === "string"
                          ? contactData.profileImage
                          : URL.createObjectURL(contactData.profileImage)
                      }
                      alt="Preview"
                      className="
                  w-24 h-24
                  rounded-3xl
                  object-cover
                  border-4 border-blue-100
                "
                    />
                  ) : (
                    <div
                      className="
                  w-24 h-24
                  rounded-3xl
                  bg-blue-100
                  flex items-center justify-center
                "
                    >
                      <UserIcon className="w-9 h-9 text-blue-600" />
                    </div>
                  )}

                  <div
                    className="
                absolute bottom-0 right-0
                w-8 h-8
                rounded-xl
                bg-blue-600
                text-white
                flex items-center justify-center
              "
                  >
                    <PlusIcon className="w-4 h-4" />
                  </div>

                  <input
                    type="file"
                    name="profileImage"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* NAME */}
              <input
                type="text"
                name="name"
                value={contactData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="
            input input-bordered
            w-full rounded-2xl
          "
              />

              {/* EMAIL */}
              <input
                type="email"
                name="email"
                value={contactData.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="
            input input-bordered
            w-full rounded-2xl
          "
              />

              {/* MOBILE */}
              <input
                type="text"
                name="mobileNumber"
                value={contactData.mobileNumber}
                onChange={handleChange}
                placeholder="Mobile Number"
                className="
            input input-bordered
            w-full rounded-2xl
          "
              />

              {/* DESIGNATION */}
              <div className="relative">
                <BriefcaseIcon
                  className="
              absolute left-4 top-1/2
              -translate-y-1/2
              w-5 h-5 text-gray-400
            "
                />

                <input
                  type="text"
                  name="designation"
                  value={contactData.designation}
                  onChange={handleChange}
                  placeholder="Designation"
                  className="
              input input-bordered
              w-full rounded-2xl
              pl-12
            "
                />
              </div>

              {/* BUTTONS */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="
              flex-1 h-12
              rounded-2xl
              border border-gray-200
              hover:bg-gray-50
              font-medium
            "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="
              flex-1 h-12
              rounded-2xl
              bg-blue-600
              hover:bg-blue-700
              text-white
              font-medium
              flex items-center justify-center gap-2
            "
                >
                  <PlusIcon className="w-4 h-4" />

                  {selectedContact ? "Update" : "Add"}
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
