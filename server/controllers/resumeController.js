import fs from 'fs';

import imagekit from '../configs/imageKit.js';
import Resume from '../models/Resume.js';

// POST: /api/resumes/create
export const createResume = async (req, res) => {
  try {
    const { title } = req.body;

    const newResume = await Resume.create({
      userId: req.userId,
      title: title || 'Untitled Resume',
    });

    return res.status(201).json({
      message: 'Resume created successfully',
      resume: newResume,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// DELETE: /api/resumes/delete/:resumeId
export const deleteResume = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const deletedResume = await Resume.findOneAndDelete({
      userId: req.userId,
      _id: resumeId,
    });

    if (!deletedResume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    return res.status(200).json({ message: 'Resume deleted successfully' });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// GET: /api/resumes/get/:resumeId
export const getResumeById = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await Resume.findOne({
      userId: req.userId,
      _id: resumeId,
    }).select('-__v');

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    return res.status(200).json({ resume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// GET: /api/resumes/public/:resumeId
export const getPublicResumeById = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await Resume.findOne({
      public: true,
      _id: resumeId,
    }).select('-__v');

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    return res.status(200).json({ resume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// PUT: /api/resumes/update
export const updateResume = async (req, res) => {
  try {
    const { resumeId, resumeData, removeBackground } = req.body;
    const image = req.file;

    if (!resumeId) {
      return res.status(400).json({ message: 'resumeId is required' });
    }

    let resumeDataCopy = {};

    if (resumeData) {
      resumeDataCopy = typeof resumeData === 'string' ? JSON.parse(resumeData) : structuredClone(resumeData);
    }

    delete resumeDataCopy._id;
    delete resumeDataCopy.userId;
    delete resumeDataCopy.createdAt;
    delete resumeDataCopy.updatedAt;
    delete resumeDataCopy.__v;

    if (image) {
      try {
        const imageBufferData = fs.createReadStream(image.path);

        const response = await imagekit.files.upload({
          file: imageBufferData,
          fileName: image.filename || 'resume-profile.png',
          folder: '/user-resumes',
          transformation: {
            pre: `w-300,h-300,fo-face,z-0.75${removeBackground ? ',e-bgremove' : ''}`,
          },
        });

        if (!resumeDataCopy.personal_info) {
          resumeDataCopy.personal_info = {};
        }

        resumeDataCopy.personal_info.image = response.url;
      } finally {
        if (image.path && fs.existsSync(image.path)) {
          fs.unlinkSync(image.path);
        }
      }
    }

    const resume = await Resume.findOneAndUpdate(
      { userId: req.userId, _id: resumeId },
      { $set: resumeDataCopy },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    return res.status(200).json({ message: 'Saved successfully', resume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
