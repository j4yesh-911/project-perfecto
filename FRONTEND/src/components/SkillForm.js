import API from "../services/api";

export default function SkillForm() {
  const saveSkills = async () => {
    await API.put("/user/skills", {
      skillsToTeach: ["React"],
      skillsToLearn: ["Node"],
      teachingMode: ["online"],
      learningMode: ["online"]
    });
  };

  return <button onClick={saveSkills}>Save Skills</button>;
}
