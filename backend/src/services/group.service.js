// services/group.service.js

import Group from "../models/group.js";

/**
 * Create Group
 */
export const createGroup = async (
  data
) => {
  const group = await Group.create({
    groupName: data.groupName,

    groupBio: data.groupBio,

    groupImage: data.groupImage,

    members: data.members,

    admins: data.admins,
  });

  return await Group.findById(
    group._id
  )
    .populate(
      "members.user",
      "fullName email"
    )
    .populate(
      "admins",
      "fullName email"
    );
};;

// group.service.js

export const getAllGroups = async () => {
  return await Group.find({ isDeleted: { $ne: true } }) // ✅ matches false AND undefined
    .populate("members.user", "fullName email profilePic")
    .populate("admins", "fullName email profilePic")
    .sort({ createdAt: -1 });
};

export const getGroupById = async (id) => {
  return await Group.findOne({
    _id: id,
    isDeleted: { $ne: true },                           // ✅ same fix
  })
    .populate("members.user", "fullName email profilePic")
    .populate("admins", "fullName email profilePic");
};

/**
 * Update Group
 */
export const updateGroup = async (id, data) => {
  return await Group.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};