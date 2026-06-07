import Group from "../models/group.js";
import cloudinary from "../lib/cloudinary.js";
import fs from "fs";
import AppError from "../utils/AppError.js";

/**
 * VERIFY GROUP MEMBERSHIP HELPER
 */
export const verifyGroupMembership = async (groupId, userId) => {
  const group = await Group.findById(groupId);
  if (!group || group.isDeleted) {
    throw new AppError("Group not found", 404);
  }
  const isMember = group.members.some(
    (m) => m.userId.toString() === userId.toString()
  );
  if (!isMember) {
    throw new AppError("Not a member of this group", 403);
  }
  return group;
};

/**
 * VERIFY GROUP ADMIN HELPER
 */
export const verifyGroupAdmin = async (groupId, userId) => {
  const group = await verifyGroupMembership(groupId, userId);
  
  const isAdmin = group.admins.some(
    (a) => a.toString() === userId.toString()
  ) || group.members.some(
    (m) => m.userId.toString() === userId.toString() && m.role === "admin"
  );

  if (!isAdmin) {
    throw new AppError("Only group admins can perform this action", 403);
  }

  return group;
};

/**
 * CREATE GROUP
 */
// export const createGroup = async (groupData) => {
//   try {
//     console.log("groupData:", groupData);
//     console.log("groupImage:", groupData.groupImage);

//     let { groupImage } = groupData;

//     if (
//       typeof groupImage === "string" &&
//       (groupImage.startsWith("/uploads") ||
//         groupImage.startsWith("data:image"))
//     ) {
//       const uploadResponse = await cloudinary.uploader.upload(
//         groupImage.startsWith("/")
//           ? `.${groupImage}`
//           : groupImage,
//         {
//           folder: "groups",
//         }
//       );

//       groupImage = uploadResponse.secure_url;
//     }

//     const group = new Group({
//       ...groupData,
//       groupImage,
//     });

//     await group.save();

//     return group;
//   } catch (error) {
//     console.log("CREATE GROUP ERROR:", error);
//     throw new Error(error.message);
//   }
// };

export const createGroup = async (groupData) => {
  try {
    let { groupImage } = groupData;

    if (groupImage) {
      // Normalize path for Windows backslashes
      groupImage = groupImage.replace(/\\/g, "/");

      if (groupImage.startsWith("data:") || groupImage.startsWith("/uploads/") || groupImage.startsWith("uploads/")) {
        const uploadPath = groupImage.startsWith("data:") ? groupImage : (groupImage.startsWith("/") ? `.${groupImage}` : `./${groupImage}`);
        const uploadResponse = await cloudinary.uploader.upload(uploadPath, {
          folder: "groups",
        });
        groupImage = uploadResponse.secure_url;
      }
    }

    const group = new Group({
      ...groupData,
      groupImage,
    });

    await group.save();

    return group;
  } catch (error) {
    console.log("CREATE GROUP ERROR:", error);
    throw new Error(error.message);
  }
};

/**
 * GET ALL GROUPS (scoped to user)
 */
export const getAllGroups = async (userId) => {
  try {
    const groups = await Group.find({
      "members.userId": userId,
      isDeleted: { $ne: true }
    }).sort({ createdAt: -1 });
    return groups;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * GET MY GROUPS WITH STATS
 */
export const getMyGroups = async (userId) => {
  try {
    const groups = await Group.find({
      "members.userId": userId,
      isDeleted: { $ne: true }
    }).sort({ createdAt: -1 });

    const ScheduleMeeting = (await import("../models/Schedulemeeting.js")).default;
    const Meeting = (await import("../models/Meeting.js")).default;

    const groupStats = await Promise.all(groups.map(async (group) => {
      // Get Upcoming Meetings Count
      const upcomingCount = await ScheduleMeeting.countDocuments({
        groupId: group._id,
        status: { $in: ["pending", "upcoming"] },
      });

      // Check for active meeting
      const activeMeeting = await Meeting.findOne({
        groupId: group._id,
        status: "active"
      });

      return {
        groupId: group._id,
        groupName: group.groupName,
        groupImage: group.groupImage,
        memberCount: group.members.length,
        upcomingMeetingCount: upcomingCount,
        activeMeeting: activeMeeting ? activeMeeting.meetingCode : null
      };
    }));

    return groupStats;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * GET GROUP BY ID (membership validated)
 */
export const getGroupById = async (id, userId) => {
  try {
    const group = await verifyGroupMembership(id, userId);
    return group;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new Error(error.message);
  }
};

/**
 * UPDATE GROUP (membership validated)
 */
export const updateGroup = async (id, userId, updateData) => {
  try {
    await verifyGroupAdmin(id, userId);

    let { groupImage } = updateData;

    if (groupImage) {
      // Normalize path for Windows backslashes
      groupImage = groupImage.replace(/\\/g, "/");

      if (groupImage.startsWith("data:") || groupImage.startsWith("/uploads/") || groupImage.startsWith("uploads/")) {
        const uploadPath = groupImage.startsWith("data:") ? groupImage : (groupImage.startsWith("/") ? `.${groupImage}` : `./${groupImage}`);
        const uploadResponse = await cloudinary.uploader.upload(uploadPath, { 
          folder: "groups" 
        });
        
        groupImage = uploadResponse.secure_url;

        // Try to delete local file if it was uploaded via multer
        if (!uploadPath.startsWith("data:")) {
          try { fs.unlinkSync(uploadPath); } catch (e) {}
        }
      }
    }

    const group = await Group.findByIdAndUpdate(
      id,
      { ...updateData, groupImage },
      { new: true }
    );
    return group;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new Error(error.message);
  }
};

/**
 * DELETE GROUP (membership validated)
 */
export const deleteGroup = async (id, userId) => {
  try {
    await verifyGroupAdmin(id, userId);

    const group = await Group.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    return group;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new Error(error.message);
  }
};
