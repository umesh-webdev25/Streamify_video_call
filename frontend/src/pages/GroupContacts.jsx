import React, {
  useState,
  useEffect,
} from "react";

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

  const [openModal, setOpenModal] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [contacts, setContacts] =
    useState([]);

  const [selectedContact, setSelectedContact] =
    useState(null);

  const [contactData, setContactData] =
    useState({
      name: "",
      email: "",
      mobileNumber: "",
    });

  /**
   * GET CONTACTS
   */
  const fetchContacts = async () => {
    try {
      const data =
        await getAllContacts();

      const filtered =
        data.filter(
          (contact) =>
            contact.groupId?._id ===
            groupId
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
    setContactData({
      ...contactData,
      [e.target.name]:
        e.target.value,
    });
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
        const updated =
          await updateContact(
            selectedContact._id,
            contactData
          );

        setContacts((prev) =>
          prev.map((c) =>
            c._id === updated._id
              ? updated
              : c
          )
        );
      } else {
        /**
         * CREATE
         */
        const payload = {
          ...contactData,
          groupId,
        };

        const newContact =
          await createContact(
            payload
          );

        setContacts((prev) => [
          newContact,
          ...prev,
        ]);
      }

      /**
       * RESET
       */
      setContactData({
        name: "",
        email: "",
        mobileNumber: "",
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
  const handleDeleteContact =
    async (id) => {
      try {
        await deleteContact(id);

        setContacts((prev) =>
          prev.filter(
            (c) => c._id !== id
          )
        );
      } catch (error) {
        console.log(error);
      }
    };

  /**
   * EDIT
   */
  const handleEditContact = (
    contact
  ) => {
    setSelectedContact(contact);

    setContactData({
      name: contact.name,
      email: contact.email,
      mobileNumber:
        contact.mobileNumber,
    });

    setOpenModal(true);
  };

  /**
   * FILTER
   */
  const filteredContacts =
    contacts.filter((contact) =>
      contact.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (
    <div className="min-h-screen bg-white p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Group Contacts
        </h1>

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
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
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
              setSelectedContact(
                null
              );

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
        {filteredContacts.map(
          (contact) => (
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
                    <UserIcon className="w-7 h-7 text-blue-600" />
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold">
                      {contact.name}
                    </h2>

                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <MailIcon className="w-4 h-4" />

                      <span>
                        {
                          contact.email
                        }
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <PhoneIcon className="w-4 h-4" />

                      <span>
                        {
                          contact.mobileNumber
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-2">
                  {/* EDIT */}
                  <button
                    onClick={() =>
                      handleEditContact(
                        contact
                      )
                    }
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
                    onClick={() =>
                      handleDeleteContact(
                        contact._id
                      )
                    }
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
          )
        )}
      </div>

      {/* MODAL */}
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
            {/* CLOSE */}
            <button
              onClick={() =>
                setOpenModal(false)
              }
              className="
                btn btn-sm btn-circle
                absolute top-4 right-4
              "
            >
              <XIcon className="w-4 h-4" />
            </button>

            <h2 className="text-2xl font-bold mb-6">
              {selectedContact
                ? "Update Contact"
                : "Add Contact"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* NAME */}
              <input
                type="text"
                name="name"
                value={
                  contactData.name
                }
                onChange={
                  handleChange
                }
                placeholder="Name"
                className="
                  input input-bordered
                  w-full rounded-2xl
                "
              />

              {/* EMAIL */}
              <input
                type="email"
                name="email"
                value={
                  contactData.email
                }
                onChange={
                  handleChange
                }
                placeholder="Email"
                className="
                  input input-bordered
                  w-full rounded-2xl
                "
              />

              {/* MOBILE */}
              <input
                type="text"
                name="mobileNumber"
                value={
                  contactData.mobileNumber
                }
                onChange={
                  handleChange
                }
                placeholder="Mobile Number"
                className="
                  input input-bordered
                  w-full rounded-2xl
                "
              />

              {/* BUTTON */}
              <button
                type="submit"
                className="
                  btn btn-primary
                  w-full rounded-2xl
                "
              >
                <PlusIcon className="w-5 h-5" />

                {selectedContact
                  ? "Update Contact"
                  : "Add Contact"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupContacts;