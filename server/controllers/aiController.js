import Resume from '../models/Resume.js';
import ai from '../configs/ai.js';

const getAIText = (response) => {
  return response?.choices?.[0]?.message?.content?.trim() || '';
};

const extractJson = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('AI did not return valid JSON');
    return JSON.parse(match[0]);
  }
};

// POST: /api/ai/enhance-pro-sum
export const enhanceProfessionalSummary = async (req, res) => {
  try {
    const { userContent } = req.body;

    if (!userContent) {
      return res.status(400).json({ message: 'Content is required. Missing required fields.' });
    }

    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert resume writer. Improve the professional summary in 1-2 concise ATS-friendly sentences. Highlight key skills, experience, and career objectives. Return only the improved text.',
        },
        {
          role: 'user',
          content: userContent,
        },
      ],
    });

    const enhancedContent = getAIText(response);
    return res.status(200).json({ enhancedContent });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// POST: /api/ai/enhance-job-desc
export const enhanceJobDescription = async (req, res) => {
  try {
    const { userContent } = req.body;

    if (!userContent) {
      return res.status(400).json({ message: 'Content is required. Missing required fields.' });
    }

    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert resume writer. Improve this job description in 1-2 ATS-friendly sentences. Use action verbs and measurable impact when possible. Return only the improved text.',
        },
        {
          role: 'user',
          content: userContent,
        },
      ],
    });

    const enhancedContent = getAIText(response);
    return res.status(200).json({ enhancedContent });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// POST: /api/ai/upload-resume
export const uploadResume = async (req, res) => {
  try {
    const { resumeText, title } = req.body;

    if (!resumeText) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const systemPrompt = 'You are an expert AI resume parser. Extract resume content into clean JSON only.';

    const userPrompt = `Extract data from this resume text and return ONLY valid JSON. Do not include markdown or explanation.

Resume text:
${resumeText}

Return JSON in this exact shape:
{
  "professional_summary": "",
  "skills": [],
  "personal_info": {
    "image": "",
    "full_name": "",
    "profession": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "website": ""
  },
  "experience": [
    {
      "company": "",
      "position": "",
      "start_date": "",
      "end_date": "",
      "description": "",
      "is_current": false
    }
  ],
  "project": [
    {
      "name": "",
      "type": "",
      "description": ""
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "graduation_date": "",
      "gpa": ""
    }
  ]
}`;

    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    const extractedData = getAIText(response);
    const parsedData = extractJson(extractedData);

    const newResume = await Resume.create({
      userId: req.userId,
      title: title || 'Uploaded Resume',
      ...parsedData,
    });

    return res.status(201).json({ resumeId: newResume._id, resume: newResume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
