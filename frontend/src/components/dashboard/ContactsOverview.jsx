import React, { useState } from 'react';
import { ContactIcon, SearchIcon, MoreHorizontalIcon, MessageSquareIcon, Trash2Icon } from 'lucide-react';

const ContactsOverview = ({ contacts, onDelete }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts?.filter(contact => 
    (contact.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (contact.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <section className="mb-10 h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold text-base-content/70 uppercase tracking-wider">Contacts Overview</h2>
        <button className="text-xs font-bold text-primary hover:underline">Manage All</button>
      </div>

      <div className="bg-base-100 border border-base-300 rounded-3xl p-2 sm:p-4 shadow-sm h-[calc(100%-2rem)] flex flex-col">
        <div className="p-2 mb-2">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40" />
            <input 
              type="text" 
              placeholder="Search contacts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-base-200 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 px-2 pb-2">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-2xl hover:bg-base-200/50 transition-colors group">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative shrink-0">
                    <img src={contact.contactImage || contact.avatar || "/avatar.png"} alt={contact.name} className="size-10 rounded-xl object-cover border border-base-300" />
                    {/* <span className={`absolute -bottom-0.5 -right-0.5 size-3 border-2 border-base-100 rounded-full ${contact.status === 'online' ? 'bg-success' : 'bg-base-300'}`}></span> */}
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="text-sm font-bold text-base-content truncate">{contact.name}</h4>
                    {contact.designation && (
                      <p className="text-xs font-medium text-base-content/70 truncate mt-0.5">{contact.designation}</p>
                    )}
                    {/* <p className="text-xs text-base-content/50 truncate mt-0.5">{contact.email}</p> */}
                    {/* {contact.mobileNumber && contact.mobileNumber !== "N/A" && (
                      <p className="text-xs text-base-content/40 truncate mt-0.5">{contact.mobileNumber}</p>
                    )} */}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="btn btn-ghost btn-xs btn-circle text-primary">
                    <MessageSquareIcon className="size-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(contact._id)}
                    className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:text-error"
                    title="Delete Contact"
                  >
                    <Trash2Icon className="size-4" />
                  </button>
                  <button className="btn btn-ghost btn-xs btn-circle text-base-content/50">
                    <MoreHorizontalIcon className="size-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-10">
              <ContactIcon className="size-10 text-base-content/20 mb-3" />
              <p className="text-sm font-bold text-base-content/50">No contacts found</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactsOverview;
