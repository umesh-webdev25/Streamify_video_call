import { useState } from "react";
import {
  BellIcon,
  BellOffIcon,
  MessageSquareIcon,
  UserPlusIcon,
  VideoIcon,
  CalendarIcon,
  AlertTriangleIcon,
  Volume2Icon,
  MailIcon,
  SmartphoneIcon,
} from "lucide-react";
import toast from "react-hot-toast";

const NotificationSettingsPage = () => {
  const [settings, setSettings] = useState({
    friendRequests: true,
    messages: true,
    callInvites: true,
    meetingReminders: true,
    systemAlerts: true,
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
  });

  const [saved, setSaved] = useState(false);

  const toggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setSaved(true);
    toast.success("Notification settings updated");
    setTimeout(() => setSaved(false), 2000);
  };

  const notificationTypes = [
    {
      key: "friendRequests",
      icon: UserPlusIcon,
      title: "Friend Requests",
      description: "When someone sends you a friend request",
    },
    {
      key: "messages",
      icon: MessageSquareIcon,
      title: "Messages",
      description: "New direct messages from friends",
    },
    {
      key: "callInvites",
      icon: VideoIcon,
      title: "Call Invites",
      description: "When someone invites you to a call",
    },
    {
      key: "meetingReminders",
      icon: CalendarIcon,
      title: "Meeting Reminders",
      description: "Reminders for scheduled meetings",
    },
    {
      key: "systemAlerts",
      icon: AlertTriangleIcon,
      title: "System Alerts",
      description: "Important updates and security alerts",
    },
  ];

  const deliveryChannels = [
    {
      key: "emailNotifications",
      icon: MailIcon,
      title: "Email Notifications",
      description: "Receive notifications via email",
    },
    {
      key: "pushNotifications",
      icon: SmartphoneIcon,
      title: "Push Notifications",
      description: "Receive push notifications on your device",
    },
    {
      key: "soundEnabled",
      icon: Volume2Icon,
      title: "Sound",
      description: "Play notification sounds",
    },
  ];

  return (
    <div className="space-y-8">
      {/* NOTIFICATION TYPES */}
      <section className="bg-base-100/80 backdrop-blur-sm border border-base-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5 -mt-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <BellIcon className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-base-content tracking-tight">
              Notification Types
            </h3>
            <p className="text-sm text-base-content/40 mt-0.5">
              Choose which events trigger notifications
            </p>
          </div>
        </div>

        <div className="space-y-1">
          {notificationTypes.map(({ key, icon: Icon, title, description }) => (
            <label
              key={key}
              className="flex items-center justify-between p-4 rounded-xl bg-base-200/40 border border-base-300/30 cursor-pointer hover:bg-base-200/70 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-base-200 flex items-center justify-center group-hover:bg-base-300 transition-colors">
                  <Icon className="size-4 text-base-content/50" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-base-content">{title}</p>
                  <p className="text-xs text-base-content/40 mt-0.5">{description}</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings[key]}
                onChange={() => toggle(key)}
                className="toggle toggle-primary"
              />
            </label>
          ))}
        </div>
      </section>

      {/* DELIVERY CHANNELS */}
      <section className="bg-base-100/80 backdrop-blur-sm border border-base-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <BellOffIcon className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-base-content tracking-tight">
              Delivery Channels
            </h3>
            <p className="text-sm text-base-content/40 mt-0.5">
              Where you receive your notifications
            </p>
          </div>
        </div>

        <div className="space-y-1">
          {deliveryChannels.map(({ key, icon: Icon, title, description }) => (
            <label
              key={key}
              className="flex items-center justify-between p-4 rounded-xl bg-base-200/40 border border-base-300/30 cursor-pointer hover:bg-base-200/70 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-base-200 flex items-center justify-center group-hover:bg-base-300 transition-colors">
                  <Icon className="size-4 text-base-content/50" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-base-content">{title}</p>
                  <p className="text-xs text-base-content/40 mt-0.5">{description}</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings[key]}
                onChange={() => toggle(key)}
                className="toggle toggle-primary"
              />
            </label>
          ))}
        </div>
      </section>

      {/* QUIET HOURS */}
      <section className="bg-base-100/80 backdrop-blur-sm border border-base-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-base-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-base-content/50">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-base-content tracking-tight">
              Quiet Hours
            </h3>
            <p className="text-sm text-base-content/40 mt-0.5">
              Mute notifications during specific hours
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl bg-base-200/40 border border-base-300/50">
          <div className="flex items-center gap-2">
            <input type="time" defaultValue="22:00" className="input input-bordered input-sm rounded-lg text-sm bg-base-100" />
            <span className="text-sm text-base-content/40 font-medium">to</span>
            <input type="time" defaultValue="08:00" className="input input-bordered input-sm rounded-lg text-sm bg-base-100" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer ml-auto">
            <span className="text-xs text-base-content/50 font-medium">Enabled</span>
            <input type="checkbox" className="toggle toggle-primary toggle-sm" />
          </label>
        </div>
      </section>

      {/* SAVE */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="btn btn-primary rounded-xl px-8 shadow-md hover:shadow-lg transition-all gap-2"
        >
          {saved ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Saved
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
