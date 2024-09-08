const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateEvaluationNotes = async (evaluationResults) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      generatePrompt(evaluationResults)
    ]);

    console.log('Gemini API response:', result);

    if (!result || !result.response || !result.response.text) {
      throw new Error('Invalid response structure from Gemini API');
    }

    return result.response.text().trim();
  } catch (error) {
    console.error('Error generating evaluation notes:', error);
    return 'Error generating evaluation notes.';
  }
};

const generatePrompt = (evaluationResults) => {
  let prompt = `You are evaluating a candidate's performance based on their code submissions. Your evaluation should focus on their overall problem-solving skills, understanding of programming concepts, and suitability for a technical role. After reviewing each submission, provide a clear recommendation on whether the candidate should be considered for a technical role at the company.\n\n`;

  evaluationResults.forEach((result, index) => {
    prompt += `**Problem ${index + 1} Evaluation:**\n`;
    prompt += `- **Code:** ${result.code}\n`;
    prompt += `- **Result:** ${result.result}\n`;
    prompt += `- **Error Message:** ${result.errorMessage || 'None'}\n\n`;
  });

  prompt += `**Final Assessment:**\n`;
  prompt += `- **Problem-Solving Skills:** Based on the submissions, how strong are the candidate's problem-solving abilities?\n`;
  prompt += `- **Technical Proficiency:** Does the candidate demonstrate a solid understanding of programming concepts and the ability to write efficient, effective code?\n`;
  prompt += `- **Recommendation:** Would you recommend hiring this candidate for a technical role at the company? Choose one: "Highly Recommend," "Recommend," "Recommend with Reservations," or "Do Not Recommend." Provide reasons for your recommendation.\n`;

  prompt += `Format the response with HTML elements and Quill-compatible inline styles and classes for text size, bolding, and other formatting.`;

  return prompt;
};

module.exports = { generateEvaluationNotes };
