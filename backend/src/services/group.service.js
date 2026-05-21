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
    (m) => m.user.toString() === userId.toString()
  );
  if (!isMember) {
    throw new AppError("Not a member of this group", 403);
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
    console.log("groupData:", groupData);

    const group = new Group(groupData);

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
      "members.user": userId,
      isDeleted: { $ne: true }
    }).sort({ createdAt: -1 });
    return groups;
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
    await verifyGroupMembership(id, userId);

    let { groupImage } = updateData;

    if (groupImage && (groupImage.startsWith("/uploads") || groupImage.startsWith("data:image"))) {
      const uploadResponse = await cloudinary.uploader.upload(
        groupImage.startsWith("/") ? `.${groupImage}` : groupImage,
        { folder: "groups" }
      );
      groupImage = uploadResponse.secure_url;

      if (updateData.groupImage.startsWith("/uploads")) {
        try { fs.unlinkSync(`.${updateData.groupImage}`); } catch (e) {}
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
    await verifyGroupMembership(id, userId);

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
