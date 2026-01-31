const calculateScore = (resumeData, jobDescription) => {
    const { skills: resumeSkills, experience: resumeExp, education: resumeEdu } = resumeData;
    const { requiredSkills, minExperience, preferredEducation } = jobDescription;

    // 1. Skill Matching (50%)
    const matchedSkills = resumeSkills.filter(skill =>
        requiredSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase())
    );
    const skillScore = requiredSkills.length > 0
        ? (matchedSkills.length / requiredSkills.length) * 50
        : 0;

    // 2. Experience (30%)
    let expScore = 0;
    if (resumeExp >= minExperience) {
        expScore = 30;
    } else if (resumeExp > 0) {
        expScore = (resumeExp / minExperience) * 30;
    }

    // 3. Education (20%)
    let eduScore = 0;
    if (resumeEdu.toLowerCase().includes(preferredEducation.toLowerCase())) {
        eduScore = 20;
    } else if (resumeEdu !== 'Not specified') {
        eduScore = 10;
    }

    const totalScore = Math.min(100, Math.round(skillScore + expScore + eduScore));

    return {
        totalScore,
        breakdown: {
            skillScore,
            expScore,
            eduScore
        }
    };
};

module.exports = {
    calculateScore
};
