import * as groupService from "../services/group.service.js";

/**
 * Helper – safely parse a JSON string sent as a FormData text field.
 * Returns fallback value if parsing fails.
 */
const parseJSON = (value, fallback = []) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

/**
 * Create Group
 * POST /api/groups
 *
 * req.body  → groupName, groupBio, members (JSON string), admins (JSON string)
 * req.file  → uploaded image (set by multer)
 */
export const createGroup = async (req, res) => {
  try {
    const { groupName, groupBio, members, admins } = req.body;

    // multer saves the file and gives us req.file.filename
    const groupImage = req.file ? `/uploads/${req.file.filename}` : "";

    const group = await groupService.createGroup({
      groupName,
      groupBio,
      groupImage,
      members: parseJSON(members),   // front-end sends JSON.stringify([...])
      admins:  parseJSON(admins),
    });

    return res.status(201).json({
      success: true,
      message: "Group created successfully",
      data: group,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get All Groups
 * GET /api/groups
 */
export const getAllGroups = async (req, res) => {
  try {
    const groups = await groupService.getAllGroups();

    return res.status(200).json({
      success: true,
      data: groups,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Single Group
 * GET /api/groups/:id
 */
export const getGroupById = async (req, res) => {
  try {
    const group = await groupService.getGroupById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update Group
 * PUT /api/groups/:id
 *
 * req.body  → groupName, groupBio  (text fields from FormData)
 * req.file  → new image (optional)
 */
export const updateGroup = async (req, res) => {
  try {
    const { groupName, groupBio } = req.body;

    const updateData = { groupName, groupBio };

    // Only overwrite groupImage if a new file was uploaded
    if (req.file) {
      updateData.groupImage = `/uploads/${req.file.filename}`;
    }

    const group = await groupService.updateGroup(req.params.id, updateData);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Group updated successfully",
      data: group,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};