import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeftIcon, Loader } from 'lucide-react';

import ResumePreview from '../components/ResumePreview';
import api from '../configs/api';

const Preview = () => {
  const { resumeId } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [resumeData, setResumeData] = useState(null);

  const loadResume = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/resumes/public/${resumeId}`);
      setResumeData(data.resume);
    } catch (error) {
      console.log(error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  }, [resumeId]);

  useEffect(() => {
    if (resumeId) {
      loadResume();
    }
  }, [resumeId, loadResume]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return resumeData ? (
    <div className="bg-slate-100 min-h-screen">
      <div className="max-w-3xl mx-auto py-10">
        <ResumePreview
          data={resumeData}
          template={resumeData.template}
          accentColor={resumeData.accent_color}
          className="py-4 bg-white"
        />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="text-center text-6xl text-slate-400 font-medium">
        Resume not found
      </p>

      <a
        href="/"
        className="mt-6 bg-pink-500 hover:bg-pink-600 text-white rounded-full px-6 h-9 m-1 ring-offset-1 ring-1 ring-pink-400 flex items-center transition-colors"
      >
        <ArrowLeftIcon className="mr-2 size-4" />
        Go to home page
      </a>
    </div>
  );
};

export default Preview;
