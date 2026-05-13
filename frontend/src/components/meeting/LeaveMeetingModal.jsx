import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import {
  PhoneOffIcon,
  XIcon,
  LogOutIcon,
  BanIcon,
  ArrowLeftIcon,
  UsersIcon,
  ShieldAlertIcon,
  ChevronRightIcon,
} from "lucide-react";
import { cn } from "../../lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
  exit: { opacity: 0, transition: { staggerChildren: 0.04, staggerDirection: -1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
  exit: { y: -10, opacity: 0, scale: 0.95 },
};

const LeaveMeetingModal = ({ onConfirm, onCancel, isHost }) => {
  const confirmLeave = (endForEveryone = false) => {
    onConfirm(endForEveryone);
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onCancel]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      {/* BACKDROP */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onCancel}
      />

      {/* MODAL */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative bg-gradient-to-b from-zinc-900 to-zinc-950 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl shadow-black/50 overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-error/10 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-error/5 rounded-full blur-[60px] pointer-events-none" />

        {/* CLOSE */}
        <motion.button
          variants={itemVariants}
          onClick={onCancel}
          className="absolute top-4 right-4 btn btn-ghost btn-circle btn-sm text-white/30 hover:text-white hover:bg-white/5 transition-all z-10"
        >
          <XIcon className="size-4" />
        </motion.button>

        {/* ICON */}
        <motion.div variants={itemVariants} className="flex justify-center mb-2">
          <div className="size-16 sm:size-20 rounded-full bg-gradient-to-br from-error/20 to-error/10 flex items-center justify-center ring-8 ring-error/5">
            <motion.div
              animate={{ rotate: [0, -10, 10, -5, 0] }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <PhoneOffIcon className="size-7 sm:size-9 text-error" />
            </motion.div>
          </div>
        </motion.div>

        {/* TITLE */}
        <motion.div variants={itemVariants} className="text-center space-y-1.5 mb-6">
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Leave Meeting?
          </h3>
          <p className="text-sm text-white/40 font-medium leading-relaxed">
            Choose how you want to leave this meeting.
            {isHost && " As the host, you can end it for everyone."}
          </p>
        </motion.div>

        {/* OPTIONS */}
        <motion.div variants={itemVariants} className="space-y-2.5">
          {/* LEAVE FOR ME */}
          <button
            onClick={() => confirmLeave(false)}
            className="w-full group flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-left"
          >
            <div className="size-10 rounded-xl bg-white/5 group-hover:bg-white/10 flex items-center justify-center shrink-0 transition-colors">
              <LogOutIcon className="size-5 text-white/60 group-hover:text-white/90 transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white group-hover:text-white/90 transition-colors">
                Leave for me
              </p>
              <p className="text-xs text-white/30 group-hover:text-white/40 transition-colors mt-0.5">
                You leave; others stay in the meeting
              </p>
            </div>
            <ChevronRightIcon className="size-4 text-white/20 group-hover:text-white/40 transition-colors shrink-0" />
          </button>

          {/* END FOR EVERYONE (host only) */}
          {isHost && (
            <button
              onClick={() => confirmLeave(true)}
              className="w-full group flex items-center gap-4 p-4 rounded-2xl bg-error/5 hover:bg-error/10 border border-error/10 hover:border-error/30 transition-all text-left"
            >
              <div className="size-10 rounded-xl bg-error/10 group-hover:bg-error/20 flex items-center justify-center shrink-0 transition-colors">
                <BanIcon className="size-5 text-error group-hover:text-error/80 transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-error/90 group-hover:text-error transition-colors">
                  End for everyone
                </p>
                <p className="text-xs text-white/30 group-hover:text-white/40 transition-colors mt-0.5">
                  Disconnect all participants immediately
                </p>
              </div>
              <ShieldAlertIcon className="size-4 text-error/40 group-hover:text-error/60 transition-colors shrink-0" />
            </button>
          )}

          {/* PARTICIPANT COUNT */}
          <div className="flex items-center gap-2 px-1 pt-1">
            <UsersIcon className="size-3 text-white/20" />
            <span className="text-[10px] text-white/20 font-medium">
              Other participants will be notified
            </span>
          </div>
        </motion.div>

        {/* FOOTER */}
        <motion.div variants={itemVariants} className="mt-5 pt-4 border-t border-white/5">
          <button
            onClick={onCancel}
            className="w-full h-10 rounded-xl text-xs font-bold text-white/30 hover:text-white/50 bg-white/5 hover:bg-white/10 transition-all"
          >
            Press <kbd className="kbd kbd-xs bg-white/10 border-white/5 text-white/40 mx-1">ESC</kbd> to cancel
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default LeaveMeetingModal;
