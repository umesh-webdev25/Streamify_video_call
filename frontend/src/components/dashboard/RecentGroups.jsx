import React, { useState } from 'react';
import {
  UsersIcon,
  FolderIcon,
  PenSquareIcon,
  Trash2Icon,
  SearchIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RecentGroups = ({ groups = [], onDelete }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroups =
    groups?.filter(
      (group) =>
        (group.groupName?.toLowerCase() || '').includes(
          searchQuery.toLowerCase()
        ) ||
        (group.groupBio?.toLowerCase() || '').includes(
          searchQuery.toLowerCase()
        )
    ) || [];

  return (
    <section className="mb-10 h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold text-base-content/70 uppercase tracking-wider">
          Recent Groups
        </h2>

        <button
          onClick={() => navigate('/groups')}
          className="text-xs font-bold text-primary hover:underline"
        >
          View All
        </button>
      </div>

      <div className="bg-base-100 border border-base-300 rounded-3xl p-2 sm:p-4 shadow-sm h-[calc(100%-2rem)] flex flex-col">
        <div className="p-2 mb-2">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40" />

            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-base-200 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 px-2 pb-2">
          {filteredGroups.length > 0 ? (
            filteredGroups.slice(0, 5).map((group, idx) => (
              <div
                key={group._id || idx}
                onClick={() => navigate(`/groups/${group._id}`)}
                className="flex items-center justify-between p-4 rounded-2xl hover:bg-base-200/50 transition-colors group cursor-pointer h-12.5 "
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className={`relative size-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-base-300 ${
                      group.status === 'active'
                        ? 'bg-secondary/10 text-secondary'
                        : 'bg-base-300 text-base-content/50'
                    }`}
                  >
                    {group.groupImage || group.image ? (
                      <img
                        src={group.groupImage || group.image}
                        alt={group.groupName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FolderIcon className="size-6" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-sm font-bold text-base-content truncate">
                      {group.groupName}
                    </h3>

                    {group.groupBio && (
                      <p className="text-xs font-medium text-base-content/60 truncate">
                        {group.groupBio}
                      </p>
                    )}

                    <div className="flex items-center gap-2 -mt-3 ml-14">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-base-content/50 uppercase tracking-wider">
                        <UsersIcon className="size-3" />
                        {group.members?.length || 0} Members
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* <button
                    onClick={() =>
                      navigate(`/groups/edit/${group._id}`)
                    }
                    className="btn btn-ghost btn-xs btn-circle"
                  >
                    <PenSquareIcon className="size-4 text-base-content/50" />
                  </button>

                  <button
                    onClick={() => onDelete?.(group._id)}
                    className="btn btn-ghost btn-xs btn-circle hover:text-error"
                    title="Delete Group"
                  >
                    <Trash2Icon className="size-4" />
                  </button> */}

                  {/* <button
                    onClick={() => navigate(`/groups/${group._id}`)}
                    className="btn btn-primary btn-sm px-4 rounded-lg text-xs"
                  >
                    Open
                  </button> */}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-10">
              <FolderIcon className="size-10 text-base-content/20 mb-3" />
              <p className="text-sm font-bold text-base-content/50">
                No groups found
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RecentGroups;