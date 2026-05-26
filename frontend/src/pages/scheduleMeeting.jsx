import React, {
  useState,
  useMemo,
} from "react";

import {
  Clock3Icon,
  ShieldCheckIcon,
  BanIcon,
  CalendarIcon,
  MoreVerticalIcon,
  SearchIcon,
  DownloadIcon,
  PlusIcon,
  VideoIcon,
  Trash2Icon,
  PencilIcon,
  ActivityIcon,
  XIcon,
} from "lucide-react";

import {
  getScheduleMeetings,
  createScheduleMeeting,
  updateScheduleMeeting,
  deleteScheduleMeeting,
} from "../lib/api";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import toast from "react-hot-toast";

const ScheduleMeetingPage = () => {
  const queryClient = useQueryClient();

  // ─────────────────────────────────────────────
  // STATES
  // ─────────────────────────────────────────────
  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [openModal, setOpenModal] =
    useState(false);

  const [editingMeeting, setEditingMeeting] =
    useState(null);

  const [menuOpenId, setMenuOpenId] =
    useState(null);

  const [menuPosition, setMenuPosition] =
    useState({
      top: 0,
      left: 0,
    });

  const [page, setPage] = useState(1);

  const [rowsPerPage, setRowsPerPage] =
    useState(10);

  const [meetingData, setMeetingData] =
    useState({
      title: "",
      date: "",
      time: "",
      status: "upcoming",
    });

  // ─────────────────────────────────────────────
  // FETCH
  // ─────────────────────────────────────────────
  const {
    data: scheduleMeeting = [],
    isLoading,
  } = useQuery({
    queryKey: ["scheduleMeeting"],
    queryFn: getScheduleMeetings,
  });

  // ─────────────────────────────────────────────
  // COUNTS
  // ─────────────────────────────────────────────
  const totalMeetings =
    scheduleMeeting.length;

  const pending = scheduleMeeting.filter(
    (m) => m.status === "pending"
  ).length;

  const completed = scheduleMeeting.filter(
    (m) => m.status === "completed"
  ).length;

  const cancelled = scheduleMeeting.filter(
    (m) => m.status === "cancelled"
  ).length;

  const upcoming = scheduleMeeting.filter(
    (m) => m.status === "upcoming"
  ).length;

  const expired = scheduleMeeting.filter(
    (m) => m.status === "expired"
  ).length;

  // ─────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: createScheduleMeeting,

    onSuccess: () => {
      toast.success(
        "Meeting created successfully"
      );

      queryClient.invalidateQueries({
        queryKey: ["scheduleMeeting"],
      });

      closeModal();
    },
  });

  // ─────────────────────────────────────────────
  // UPDATE
  // ─────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      updateScheduleMeeting(id, data),

    onSuccess: () => {
      toast.success(
        "Meeting updated"
      );

      queryClient.invalidateQueries({
        queryKey: ["scheduleMeeting"],
      });

      closeModal();
    },
  });

  // ─────────────────────────────────────────────
  // DELETE
  // ─────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: deleteScheduleMeeting,

    onSuccess: () => {
      toast.success(
        "Meeting deleted"
      );

      queryClient.invalidateQueries({
        queryKey: ["scheduleMeeting"],
      });
    },
  });

  // ─────────────────────────────────────────────
  // FILTER
  // ─────────────────────────────────────────────
  const filteredMeetings =
    useMemo(() => {
      return scheduleMeeting.filter(
        (meeting) => {
          const q =
            search.toLowerCase();

          const matchQ =
            !q ||
            meeting.title
              ?.toLowerCase()
              .includes(q);

          const matchS =
            statusFilter === "all" ||
            meeting.status ===
              statusFilter;

          return (
            matchQ && matchS
          );
        }
      );
    }, [
      scheduleMeeting,
      search,
      statusFilter,
    ]);

  // ─────────────────────────────────────────────
  // PAGINATION
  // ─────────────────────────────────────────────
  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredMeetings.length /
        rowsPerPage
    )
  );

  const safePage = Math.min(
    page,
    totalPages
  );

  const pagedMeetings =
    filteredMeetings.slice(
      (safePage - 1) *
        rowsPerPage,
      safePage * rowsPerPage
    );

  // ─────────────────────────────────────────────
  // OPEN CREATE MODAL
  // ─────────────────────────────────────────────
  const openCreateModal = () => {
    setEditingMeeting(null);

    setMeetingData({
      title: "",
      date: "",
      time: "",
      status: "upcoming",
    });

    setOpenModal(true);
  };

  // ─────────────────────────────────────────────
  // OPEN EDIT MODAL
  // ─────────────────────────────────────────────
  const openEditModal = (
    meeting
  ) => {
    setEditingMeeting(meeting);

    setMeetingData({
      title: meeting.title,
      date: meeting.date,
      time: meeting.time,
      status: meeting.status,
    });

    setOpenModal(true);
  };

  // ─────────────────────────────────────────────
  // CLOSE MODAL
  // ─────────────────────────────────────────────
  const closeModal = () => {
    setOpenModal(false);

    setEditingMeeting(null);

    setMeetingData({
      title: "",
      date: "",
      time: "",
      status: "upcoming",
    });
  };

  // ─────────────────────────────────────────────
  // SUBMIT
  // ─────────────────────────────────────────────
  const handleSubmit = (
    e
  ) => {
    e.preventDefault();

    if (
      !meetingData.title.trim()
    )
      return;

    if (editingMeeting) {
      updateMutation.mutate({
        id: editingMeeting._id,
        data: meetingData,
      });
    } else {
      createMutation.mutate(
        meetingData
      );
    }
  };

  // ─────────────────────────────────────────────
  // EXPORT CSV
  // ─────────────────────────────────────────────
  const handleExport = () => {
    const csv = [
      "Title,Date,Time,Status",
      ...scheduleMeeting.map(
        (m) =>
          `"${m.title}",${m.date},${m.time},${m.status}`
      ),
    ].join("\n");

    const a =
      document.createElement(
        "a"
      );

    a.href =
      URL.createObjectURL(
        new Blob([csv], {
          type: "text/csv",
        })
      );

    a.download =
      "schedule-meetings.csv";

    a.click();
  };

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6 font-sans">

      {/* ───────────────────────────────────── */}
      {/* HEADER */}
      {/* ───────────────────────────────────── */}
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
        <div>
          <h1 className="text-2xl font-bold text-base-content">
            Schedule Meetings
          </h1>

          <p className="text-sm text-base-content/50 mt-1">
            Manage and monitor all
            scheduled meetings
          </p>
        </div>

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

      {/* ───────────────────────────────────── */}
      {/* STAT CARDS */}
      {/* ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5 mb-6">

        {/* TOTAL */}
        <div className="bg-base-100 border border-base-300 rounded-2xl px-6 h-[120px] flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300">
          <div>
            <p className="text-sm font-medium text-base-content/60">
              Total Meetings
            </p>

            <h2 className="text-4xl font-bold text-base-content mt-2">
              {totalMeetings}
            </h2>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Clock3Icon className="w-7 h-7 text-primary" />
          </div>
        </div>

        {/* COMPLETED */}
        <div className="bg-base-100 border border-base-300 rounded-2xl px-6 h-[120px] flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300">
          <div>
            <p className="text-sm font-medium text-base-content/60">
              Completed
            </p>

            <h2 className="text-4xl font-bold text-base-content mt-2">
              {completed}
            </h2>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center">
            <ShieldCheckIcon className="w-7 h-7 text-success" />
          </div>
        </div>

        {/* PENDING */}
        <div className="bg-base-100 border border-base-300 rounded-2xl px-6 h-[120px] flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300">
          <div>
            <p className="text-sm font-medium text-base-content/60">
              Pending
            </p>

            <h2 className="text-4xl font-bold text-base-content mt-2">
              {pending}
            </h2>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-warning/10 flex items-center justify-center">
            <ActivityIcon className="w-7 h-7 text-warning" />
          </div>
        </div>

        {/* UPCOMING */}
        <div className="bg-base-100 border border-base-300 rounded-2xl px-6 h-[120px] flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300">
          <div>
            <p className="text-sm font-medium text-base-content/60">
              Upcoming
            </p>

            <h2 className="text-4xl font-bold text-base-content mt-2">
              {upcoming}
            </h2>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-info/10 flex items-center justify-center">
            <CalendarIcon className="w-7 h-7 text-info" />
          </div>
        </div>

        {/* CANCELLED */}
        <div className="bg-base-100 border border-base-300 rounded-2xl px-6 h-[120px] flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300">
          <div>
            <p className="text-sm font-medium text-base-content/60">
              Cancelled
            </p>

            <h2 className="text-4xl font-bold text-base-content mt-2">
              {cancelled}
            </h2>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-error/10 flex items-center justify-center">
            <BanIcon className="w-7 h-7 text-error" />
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────── */}
      {/* TABLE CARD */}
      {/* ───────────────────────────────────── */}
      <div className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden">

        {/* TOOLBAR */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-base-200">

          {/* SEARCH */}
          <div className="flex items-center gap-2 flex-1 min-w-[220px] bg-base-200 border border-base-300 rounded-xl px-3 h-10">

            <SearchIcon className="w-4 h-4 text-base-content/40" />

            <input
              type="text"
              placeholder="Search meetings..."
              value={search}
              onChange={(e) => {
                setSearch(
                  e.target.value
                );

                setPage(1);
              }}
              className="w-full bg-transparent outline-none text-sm text-base-content placeholder:text-base-content/40"
            />
          </div>

          {/* FILTER */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(
                e.target.value
              );

              setPage(1);
            }}
            className="h-10 px-3 rounded-xl border border-base-300 text-sm bg-base-100"
          >
            <option value="all">
              All Status
            </option>

            <option value="upcoming">
              Upcoming
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="cancelled">
              Cancelled
            </option>

            <option value="expired">
              Expired
            </option>
          </select>

          {/* ADD */}
          <button
            onClick={
              openCreateModal
            }
            className="h-10 px-4 rounded-xl bg-success hover:bg-success/90 text-success-content text-sm font-semibold flex items-center gap-1.5"
          >
            <PlusIcon className="w-4 h-4" />
            Add New
          </button>

          {/* EXPORT */}
          <button
            onClick={handleExport}
            className="h-10 px-4 rounded-xl border border-base-300 bg-base-100 hover:bg-base-200 text-sm font-semibold flex items-center gap-1.5"
          >
            <DownloadIcon className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">

          <table className="w-full text-left border-collapse">

            <thead>
              <tr className="bg-base-200 border-b border-base-300">

                <th className="px-4 py-3.5 text-xs font-bold uppercase">
                  Titel
                </th>

                <th className="px-4 py-3.5 text-xs font-bold uppercase">
                  Date
                </th>

                <th className="px-4 py-3.5 text-xs font-bold uppercase">
                  Time
                </th>

                <th className="px-4 py-3.5 text-xs font-bold uppercase">
                  Status
                </th>

                <th className="px-4 py-3.5 text-xs font-bold uppercase">
                  Updated
                </th>

                <th className="px-4 py-3.5 text-xs font-bold uppercase text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">

              {!pagedMeetings.length ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-12 text-center text-base-content/50"
                  >
                    No meetings found.
                  </td>
                </tr>
              ) : (
                pagedMeetings.map(
                  (meeting) => (
                    <tr
                      key={
                        meeting._id
                      }
                      className="hover:bg-base-200/50 transition-colors"
                    >

                      {/* TITLE */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <VideoIcon className="w-5 h-5 text-primary" />
                          </div>

                          <div>
                            <p className="font-semibold text-base-content">
                              {
                                meeting.title
                              }
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* DATE */}
                      <td className="px-4 py-3.5 text-sm">
                        {
                          meeting.date
                        }
                      </td>

                      {/* TIME */}
                      <td className="px-4 py-3.5 text-sm">
                        {
                          meeting.time
                        }
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-3.5">

                        <span
                          className={`
                            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            
                            ${
                              meeting.status ===
                              "completed"
                                ? "bg-success/10 text-success"
                                : ""
                            }

                            ${
                              meeting.status ===
                              "cancelled"
                                ? "bg-error/10 text-error"
                                : ""
                            }

                            ${
                              meeting.status ===
                              "pending"
                                ? "bg-warning/10 text-warning"
                                : ""
                            }

                            ${
                              meeting.status ===
                              "upcoming"
                                ? "bg-info/10 text-info"
                                : ""
                            }
                          `}
                        >
                          {
                            meeting.status
                          }
                        </span>
                      </td>

                      {/* CREATED */}
                      <td className="px-4 py-3.5 text-sm text-base-content/60">
                        {new Date(
                          meeting.createdAt
                        ).toLocaleDateString()}
                      </td>

                      {/* ACTION */}
                      <td
                        className="px-4 py-3.5 text-center"
                      >
                        <button
                          onClick={(
                            e
                          ) => {
                            const rect =
                              e.currentTarget.getBoundingClientRect();

                            setMenuPosition(
                              {
                                top:
                                  rect.bottom +
                                  8,

                                left:
                                  rect.right -
                                  180,
                              }
                            );

                            setMenuOpenId(
                              menuOpenId ===
                                meeting._id
                                ? null
                                : meeting._id
                            );
                          }}
                          className="w-8 h-8 rounded-lg border border-base-300 bg-base-100 hover:bg-base-200 flex items-center justify-center"
                        >
                          <MoreVerticalIcon className="w-4 h-4" />
                        </button>

                        {menuOpenId ===
                          meeting._id && (
                          <div
                            className="fixed z-[99999] w-44 bg-base-100 border border-base-300 rounded-xl shadow-2xl overflow-hidden"
                            style={{
                              top: `${menuPosition.top}px`,
                              left: `${menuPosition.left}px`,
                            }}
                          >

                            {/* EDIT */}
                            <button
                              onClick={() => {
                                openEditModal(
                                  meeting
                                );

                                setMenuOpenId(
                                  null
                                );
                              }}
                              className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-base-200 flex items-center gap-2"
                            >
                              <PencilIcon className="w-4 h-4" />
                              Edit
                            </button>

                            {/* DELETE */}
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "Delete this meeting?"
                                  )
                                ) {
                                  deleteMutation.mutate(
                                    meeting._id
                                  );
                                }

                                setMenuOpenId(
                                  null
                                );
                              }}
                              className="w-full px-4 py-3 text-left text-sm font-medium text-error hover:bg-error/10 flex items-center gap-2"
                            >
                              <Trash2Icon className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-base-200">

          {/* ROWS */}
          <div className="flex items-center gap-2">

            <select
              value={
                rowsPerPage
              }
              onChange={(e) => {
                setRowsPerPage(
                  Number(
                    e.target.value
                  )
                );

                setPage(1);
              }}
              className="h-8 px-2 rounded-lg border border-base-300 text-sm"
            >
              {[5, 10, 20, 50].map(
                (n) => (
                  <option
                    key={n}
                    value={n}
                  >
                    {n}
                  </option>
                )
              )}
            </select>

            <span className="text-sm text-base-content/50">
              Items per page
            </span>
          </div>

          {/* PAGE */}
          <div className="flex items-center gap-2">

            <button
              onClick={() =>
                setPage((p) =>
                  Math.max(
                    1,
                    p - 1
                  )
                )
              }
              disabled={
                safePage === 1
              }
              className="w-8 h-8 rounded-lg border border-base-300"
            >
              ‹
            </button>

            <span className="text-sm font-medium">
              Page {safePage} of{" "}
              {totalPages}
            </span>

            <button
              onClick={() =>
                setPage((p) =>
                  Math.min(
                    totalPages,
                    p + 1
                  )
                )
              }
              disabled={
                safePage ===
                totalPages
              }
              className="w-8 h-8 rounded-lg border border-base-300"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────── */}
      {/* MODAL */}
      {/* ───────────────────────────────────── */}
      {openModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={(e) =>
            e.target ===
              e.currentTarget &&
            closeModal()
          }
        >

          <div className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-md p-6 relative">

            {/* CLOSE */}
            <button
              onClick={
                closeModal
              }
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-base-200 hover:bg-base-300 flex items-center justify-center"
            >
              <XIcon className="w-4 h-4" />
            </button>

            <h2 className="text-xl font-bold mb-6">
              {editingMeeting
                ? "Edit Meeting"
                : "Add Meeting"}
            </h2>

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5"
            >

              {/* TITLE */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Meeting Title
                </label>

                <input
                  type="text"
                  value={
                    meetingData.title
                  }
                  onChange={(e) =>
                    setMeetingData(
                      {
                        ...meetingData,
                        title:
                          e.target
                            .value,
                      }
                    )
                  }
                  className="w-full border border-base-300 rounded-xl px-4 py-3 text-sm outline-none"
                />
              </div>

              {/* DATE */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Date
                </label>

                <input
                  type="date"
                  value={
                    meetingData.date
                  }
                  onChange={(e) =>
                    setMeetingData(
                      {
                        ...meetingData,
                        date:
                          e.target
                            .value,
                      }
                    )
                  }
                  className="w-full border border-base-300 rounded-xl px-4 py-3 text-sm outline-none"
                />
              </div>

              {/* TIME */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Time
                </label>

                <input
                  type="time"
                  value={
                    meetingData.time
                  }
                  onChange={(e) =>
                    setMeetingData(
                      {
                        ...meetingData,
                        time:
                          e.target
                            .value,
                      }
                    )
                  }
                  className="w-full border border-base-300 rounded-xl px-4 py-3 text-sm outline-none"
                />
              </div>

              {/* STATUS */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Status
                </label>

                <select
                  value={
                    meetingData.status
                  }
                  onChange={(e) =>
                    setMeetingData(
                      {
                        ...meetingData,
                        status:
                          e.target
                            .value,
                      }
                    )
                  }
                  className="w-full border border-base-300 rounded-xl px-4 py-3 text-sm outline-none"
                >
                  <option value="upcoming">
                    Upcoming
                  </option>

                  <option value="pending">
                    Pending
                  </option>

                  <option value="completed">
                    Completed
                  </option>

                  <option value="cancelled">
                    Cancelled
                  </option>

                  <option value="expired">
                    Expired
                  </option>
                </select>
              </div>

              {/* BUTTONS */}
              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  className="flex-1 py-3 rounded-xl border border-base-300 text-sm font-medium"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-success hover:bg-success/90 text-success-content text-sm font-semibold"
                >
                  {editingMeeting
                    ? "Save Changes"
                    : "Create Meeting"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleMeetingPage;