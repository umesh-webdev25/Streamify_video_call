import React, { useState } from "react";

import {
  ArrowLeftIcon,
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

import { useNavigate, useParams } from "react-router-dom";

const GroupContacts = () => {
  const navigate = useNavigate();

  const { groupId } = useParams();

  const [openModal, setOpenModal] = useState(false);

  const [search, setSearch] = useState("");

  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    mobile: "",
    designation: "",
    
  });
const handleEditContact = (contact) => {
  console.log("Edit:", contact);
};

const handleDeleteContact = (id) => {
  setContacts((prev) =>
    prev.filter((c) => c.id !== id)
  );
};

  const [contacts, setContacts] = useState([
    {
      id: 1,
      name: "Rahul Sharma",
      email: "rahul@gmail.com",
      mobile: "+91 9876543210",
      designation: "Software Engineer",
    },
    {
      id: 2,
      name: "Aman Verma",
      email: "aman@gmail.com",
      mobile: "+91 9876543211",
      designation: "Software Engineer",
    },
    {
      id: 3,
      name: "Sneha Patel",
      email: "sneha@gmail.com",
      mobile: "+91 9876543212",
      designation: "Software Engineer",
    },
  ]);

  const handleChange = (e) => {
    setContactData({
      ...contactData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newContact = {
      id: Date.now(),
      ...contactData,
    };

    setContacts([newContact, ...contacts]);

    setContactData({
      name: "",
      email: "",
      mobile: "",
      designation: "",
    });

    setOpenModal(false);
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        {/* Left */}
        <div className="flex items-center gap-3">
          {/* <button
            onClick={() => navigate(-1)}
            className="
              btn btn-sm btn-circle
              btn-ghost
            "
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button> */}

          <div>
            <h1 className="text-3xl font-bold text-gray-900 ml-4">Group Contacts</h1>

            {/* <p className="text-sm text-gray-500 mt-1">Group ID: {groupId}</p> */}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div
            className="
    flex items-center gap-3
    bg-white
    border border-gray-200
    rounded-2xl
    px-4
    h-12
    min-w-[280px]
    focus-within:border-blue-400
    focus-within:ring-4
    focus-within:ring-blue-50
    transition-all
  "
          >
            <SearchIcon className="w-4 h-4 text-gray-400" />

            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
      w-full
      bg-transparent
      outline-none
      text-sm
      text-gray-700
      placeholder:text-gray-400
    "
            />
          </div>

          {/* Add */}
          <button
            onClick={() => setOpenModal(true)}
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

      {/* Contact List */}
   <div className="space-y-3">
  {filteredContacts.map((contact) => (
    <div
      key={contact.id}
      className="
        border border-gray-200
        rounded-3xl
        px-5 py-4
        hover:border-blue-300
        hover:shadow-md
        transition-all
        bg-white
        group
      "
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-4 min-w-0">
          {/* Avatar */}
          <div
            className="
              w-16 h-16
              rounded-2xl
              bg-blue-100
              flex items-center justify-center
              shrink-0
            "
          >
            <UserIcon className="w-7 h-7 text-blue-600" />
          </div>

          {/* Content */}
          <div className="min-w-0">
            {/* Name */}
            <h2
              className="
                text-xl
                font-semibold
                text-gray-900
                truncate
              "
            >
              {contact.name}
            </h2>

            {/* Email */}
            <div
              className="
                flex items-center gap-2
                mt-2
                text-sm
                text-gray-500
              "
            >
              <MailIcon className="w-4 h-4 shrink-0" />

              <span className="truncate">
                {contact.email}
              </span>
            </div>

            {/* Mobile */}
            <div
              className="
                flex items-center gap-2
                mt-1.5
                text-sm
                text-gray-500
              "
            >
              <PhoneIcon className="w-4 h-4 shrink-0" />

              <span>
                {contact.mobile}
              </span>
            </div>

            {/* Designation */}
            <div
              className="
                flex items-center gap-2
                mt-1.5
                text-sm
                text-gray-500
              "
            >
              <BriefcaseIcon className="w-4 h-4 shrink-0" />

              <span>
                {contact.designation}
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Edit */}
          <button
  onClick={() => {
    setSelectedContact(contact);

    setOpenModal(true);
  }}
  className="
    w-11 h-11
    rounded-2xl
    bg-blue-50
    text-blue-600
    hover:bg-blue-100
    hover:scale-105
    transition-all
    flex items-center justify-center
  "
>
  <PencilIcon className="w-4 h-4" />
</button>

          {/* Delete */}
          <button
            onClick={() =>
              handleDeleteContact(
                contact.id
              )
            }
            className="
              w-11 h-11
              rounded-2xl
              bg-red-50
              text-red-500
              hover:bg-red-100
              hover:scale-105
              transition-all
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

      {/* Modal */}
      {openModal && (
        <div
          className="
            fixed inset-0 z-50
            bg-black/40
            flex items-center justify-center
            p-4
          "
        >
          <div
            className="
              bg-white
              w-full max-w-lg
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

            <h2 className="text-2xl font-bold mb-6">Add Contact</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="label">
                  <span className="label-text">Name</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={contactData.name}
                  onChange={handleChange}
                  placeholder="Enter name"
                  className="
                    input input-bordered
                    w-full rounded-2xl
                  "
                />
              </div>

              {/* Email */}
              <div>
                <label className="label">
                  <span className="label-text">Email</span>
                </label>

                <input
                  type="email"
                  name="email"
                  value={contactData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  className="
                    input input-bordered
                    w-full rounded-2xl
                  "
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="label">
                  <span className="label-text">Mobile Number</span>
                </label>

                <input
                  type="text"
                  name="mobile"
                  value={contactData.mobile}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  className="
                    input input-bordered
                    w-full rounded-2xl
                  "
                />
              </div>
              {/* Designation */}
              <div>
                <label className="label">
                  <span className="label-text">Designation</span>
                </label>

                <input
                  type="text"
                  name="designation"
                  value={contactData.designation}
                  onChange={handleChange}
                  placeholder="Enter designation"
                  className="
                    input input-bordered
                    w-full rounded-2xl
                  "
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="
                  btn btn-primary
                  w-full rounded-2xl
                "
              >
                <PlusIcon className="w-5 h-5" />
                Add Contact
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupContacts;
