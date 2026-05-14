import sessionService from "../services/session.service.js";

/**
 * Get all sessions
 */
export const getAllSessions = async (req, res) => {
  try {
    const sessions = await sessionService.getAllSessions();

    return res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get logged in user sessions
 */
export const getMySessions = async (req, res) => {
  try {
    const userId = req.user._id;

    const sessions = await sessionService.getUserSessions(
      userId
    );

    return res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get single session
 */
export const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await sessionService.getSessionById(id);

    return res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete session
 */
export const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await sessionService.deleteSession(id);

    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete all sessions of logged in user
 */
export const deleteAllMySessions = async (
  req,
  res
) => {
  try {
    const userId = req.user._id;

    const response =
      await sessionService.deleteAllUserSessions(
        userId
      );

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Invalidate session
 */
export const invalidateSession = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const session =
      await sessionService.invalidateSession(id);

    return res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};