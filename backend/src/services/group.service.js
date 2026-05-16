import Group from "../models/group.js";
import cloudinary from "../lib/cloudinary.js";
import fs from "fs";

/**
 * CREATE GROUP
 */
export const createGroup = async (groupData) => {
  try {
    let { groupImage } = groupData;

    // If image is a local path or base64, upload to cloudinary
    if (groupImage && (groupImage.startsWith("/uploads") || groupImage.startsWith("data:image"))) {
      const uploadResponse = await cloudinary.uploader.upload(
        groupImage.startsWith("/") ? `.${groupImage}` : groupImage,
        { folder: "groups" }
      );
      groupImage = uploadResponse.secure_url;

      // Clean up local file if it was a local path
      if (groupData.groupImage.startsWith("/uploads")) {
        try { fs.unlinkSync(`.${groupData.groupImage}`); } catch (e) {}
      }
    }

    const group = new Group({
      ...groupData,
      groupImage,
    });

    await group.save();
    return group;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * GET ALL GROUPS
 */
export const getAllGroups = async () => {
  try {
    const groups = await Group.find().sort({ createdAt: -1 });
    return groups;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * GET GROUP BY ID
 */
export const getGroupById = async (id) => {
  try {
    const group = await Group.findById(id);
    return group;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * UPDATE GROUP
 */
export const updateGroup = async (id, updateData) => {
  try {
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
    throw new Error(error.message);
  }
};

/**
 * DELETE GROUP
 */
export const deleteGroup = async (id) => {
  try {
    const group = await Group.findByIdAndDelete(id);
    return group;
  } catch (error) {
    throw new Error(error.message);
  }
};
