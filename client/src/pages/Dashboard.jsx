import React, { useCallback, useEffect, useState } from 'react';
import {
  FilePenLineIcon,
  LoaderCircleIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UploadCloud,
  UploadCloudIcon,
  XIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import pdfToText from 'react-pdftotext';

import api from '../configs/api';

const Dashboard = () => {
  const { token, user } = useSelector((state) => state.auth);

  const colors = ['#34D399', '#60A5FA', '#F472B6', '#FBBF24', '#A78BFA', '#F87171'];

  const [allResumes, setAllResumes] = useState([]);
  const [showCreateResume, setShowCreateResume] = useState(false);
  const [showUploadResume, setShowUploadResume] = useState(false);
  const [title, setTitle] = useState('');
  const [resume, setResume] = useState(null);
  const [editResumeId, setEditResumeId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const loadAllResumes = useCallback(async () => {
    if (!token) return;

    try {
      // NOTE: '/api/user/resumes' must match server routes (confirm in routes files)
      const { data } = await api.get('/api/user/resumes');
      setAllResumes(data.resumes || []);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  }, [token]);

  const createResume = async (event) => {
    event.preventDefault();

    try {
      const { data } = await api.post('/api/resumes/create', { title });

      setAllResumes((prev) => [...prev, data.resume]);
      setTitle('');
      setShowCreateResume(false);

      navigate(`/app/builder/${data.resume._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const uploadResume = async (event) => {
    event.preventDefault();

    if (!resume) {
      toast.error('Please select a PDF resume');
      return;
    }

    setIsLoading(true);

    try {
      const resumeText = await pdfToText(resume);

      const { data } = await api.post('/api/ai/upload-resume', {
        title,
        resumeText,
      });

      setTitle('');
      setResume(null);
      setShowUploadResume(false);

      navigate(`/app/builder/${data.resumeId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const editTitle = async (event) => {
    event.preventDefault();

    try {
      const { data } = await api.put('/api/resumes/update', {
        resumeId: editResumeId,
        resumeData: { title },
      });

      setAllResumes((prev) =>
        prev.map((resumeItem) =>
          resumeItem._id === editResumeId ? { ...resumeItem, title } : resumeItem
        )
      );

      setTitle('');
      setEditResumeId('');

      toast.success(data.message || 'Resume updated');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const deleteResume = async (resumeId) => {
    try {
      const confirmed = window.confirm('Are you sure you want to delete this resume?');

      if (!confirmed) return;

      const { data } = await api.delete(`/api/resumes/delete/${resumeId}`);

      setAllResumes((prev) => prev.filter((resumeItem) => resumeItem._id !== resumeId));

      toast.success(data.message || 'Resume deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    loadAllResumes();
  }, [loadAllResumes]);

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-2xl font-medium mb-6 bg-linear-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent sm:hidden">
          Welcome, {user?.name || 'User'}
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => setShowCreateResume(true)}
            className="w-full bg-white sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-pink-500 hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <PlusIcon className="size-11 transition-all duration-300 p-2.5 bg-linear-to-br from-green-300 to-red-500 text-white rounded-full" />
            <p className="text-sm group-hover:text-pink-600 transition-all duration-300">
              Create Resume
            </p>
          </button>

          <button
            onClick={() => setShowUploadResume(true)}
            className="w-full bg-white sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-pink-500 hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <UploadCloudIcon className="size-11 transition-all duration-300 p-2.5 bg-linear-to-br from-green-300 to-purple-500 text-white rounded-full" />
            <p className="text-sm group-hover:text-pink-600 transition-all duration-300">
              Upload Existing
            </p>
          </button>
        </div>

        <hr className="border-slate-300 my-6 sm:w-[305px]" />

        <div className="grid grid-cols-2 sm:flex flex-wrap gap-4">
          {allResumes.map((resumeItem, index) => {
            const baseColor = colors[index % colors.length];

            return (
              <button
                key={resumeItem._id}
                onClick={() => navigate(`/app/builder/${resumeItem._id}`)}
                className="relative w-full sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 border group hover:shadow-lg transition-all duration-300 cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${baseColor}10, ${baseColor}40)`,
                  borderColor: `${baseColor}40`,
                }}
              >
                <FilePenLineIcon
                  className="size-7 group-hover:scale-105 transition-all"
                  style={{ color: baseColor }}
                />

                <p
                  className="text-sm group-hover:scale-105 transition-all px-2 text-center"
                  style={{ color: baseColor }}
                >
                  {resumeItem.title}
                </p>

                <p
                  className="absolute bottom-1 text-[11px] text-slate-400 group-hover:text-slate-500 transition-all duration-300 px-2 text-center"
                  style={{ color: `${baseColor}90` }}
                >
                  Updated on {new Date(resumeItem.updatedAt).toLocaleDateString()}
                </p>

                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-1 right-1 group-hover:flex items-center hidden"
                >
                  <TrashIcon
                    onClick={() => deleteResume(resumeItem._id)}
                    className="size-7 p-1.5 hover:bg-white/50 rounded text-slate-700 transition-colors"
                  />
                  <PencilIcon
                    onClick={() => {
                      setEditResumeId(resumeItem._id);
                      setTitle(resumeItem.title);
                    }}
                    className="size-7 p-1.5 hover:bg-white/50 rounded text-slate-700 transition-colors"
                  />
                </div>
              </button>
            );
          })}
        </div>

        {showCreateResume && (
          <form
            onSubmit={createResume}
            onClick={() => setShowCreateResume(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur z-10 flex items-center justify-center"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6"
            >
              <h2 className="text-xl font-bold mb-4">Create a Resume</h2>

              <input
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                type="text"
                placeholder="Enter resume title"
                className="w-full px-4 py-2 mb-4 border rounded focus:border-pink-600 outline-none"
                required
              />

              <button className="w-full py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors">
                Create Resume
              </button>

              <XIcon
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                onClick={() => {
                  setShowCreateResume(false);
                  setTitle('');
                }}
              />
            </div>
          </form>
        )}

        {showUploadResume && (
          <form
            onSubmit={uploadResume}
            onClick={() => setShowUploadResume(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur z-10 flex items-center justify-center"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6"
            >
              <h2 className="text-xl font-bold mb-4">Upload Resume</h2>

              <input
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                type="text"
                placeholder="Enter resume title"
                className="w-full px-4 py-2 mb-4 border rounded focus:border-pink-600 outline-none"
                required
              />

              <div>
                <label htmlFor="resume-input" className="block text-sm text-slate-700">
                  Select resume file
                  <div className="flex flex-col items-center justify-center gap-2 border group text-slate-400 border-slate-400 border-dashed rounded-md p-4 py-10 my-4 hover:border-pink-500 hover:text-pink-700 cursor-pointer transition-colors">
                    {resume ? (
                      <p className="text-pink-700">{resume.name}</p>
                    ) : (
                      <>
                        <UploadCloud className="size-14 stroke-1" />
                        <p>Upload resume</p>
                      </>
                    )}
                  </div>
                </label>

                <input
                  type="file"
                  id="resume-input"
                  accept=".pdf"
                  hidden
                  onChange={(e) => setResume(e.target.files[0])}
                />
              </div>

              <button
                disabled={isLoading}
                className="w-full py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading && <LoaderCircleIcon className="size-4 animate-spin text-white" />}
                {isLoading ? 'Uploading...' : 'Upload Resume'}
              </button>

              <XIcon
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                onClick={() => {
                  setShowUploadResume(false);
                  setTitle('');
                  setResume(null);
                }}
              />
            </div>
          </form>
        )}

        {editResumeId && (
          <form
            onSubmit={editTitle}
            onClick={() => setEditResumeId('')}
            className="fixed inset-0 bg-black/70 backdrop-blur z-10 flex items-center justify-center"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6"
            >
              <h2 className="text-xl font-bold mb-4">Edit Resume Title</h2>

              <input
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                type="text"
                placeholder="Enter resume title"
                className="w-full px-4 py-2 mb-4 border rounded focus:border-pink-600 outline-none"
                required
              />

              <button className="w-full py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors">
                Update
              </button>

              <XIcon
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                onClick={() => {
                  setEditResumeId('');
                  setTitle('');
                }}
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
