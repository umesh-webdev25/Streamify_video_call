import mongoose from "mongoose";
import dotenv from "dotenv";
import Group from "./src/models/group.js";
import Contact from "./src/models/contect.js";
import User from "./src/models/User.js";

import { connectDB } from "./src/lib/db.js";

dotenv.config();

const migrateGroups = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB.");

    const groups = await Group.find({});
    console.log(`Found ${groups.length} groups to migrate.`);

    for (let group of groups) {
      const newMembers = [];
      const migratedUserIds = new Set();

      // Migrate existing admins
      if (group.admins && group.admins.length > 0) {
        for (let adminId of group.admins) {
          const user = await User.findById(adminId);
          if (user && !migratedUserIds.has(user._id.toString())) {
            newMembers.push({
              userId: user._id,
              role: "admin",
            });
            migratedUserIds.add(user._id.toString());
          }
        }
      }

      // Migrate existing members from Contact
      if (group.members && group.members.length > 0) {
        for (let member of group.members) {
          // member.user is historically a Contact ID
          const contactId = member.user || member.userId; // handle if it was already updated partially
          if (!contactId) continue;

          const contact = await Contact.findById(contactId);
          if (!contact || !contact.email) continue;

          const user = await User.findOne({ email: contact.email.toLowerCase() });
          if (user && !migratedUserIds.has(user._id.toString())) {
            newMembers.push({
              userId: user._id,
              role: member.isAdmin ? "admin" : "member",
            });
            migratedUserIds.add(user._id.toString());
          }
        }
      }

      // Important: We need to override the old members array
      // Because we changed the schema, Mongoose might complain if we just assign it,
      // but since we fetched the raw doc or Mongoose doc, we can set members.
      // We will use updateOne to bypass schema strictness issues if any, or just save.
      
      await Group.updateOne(
        { _id: group._id },
        { 
          $set: { members: newMembers },
          $unset: { admins: 1 } // Optionally remove admins array as it is deprecated
        }
      );
      
      console.log(`Migrated group: ${group.groupName} with ${newMembers.length} valid User members.`);
    }

    console.log("Migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateGroups();
