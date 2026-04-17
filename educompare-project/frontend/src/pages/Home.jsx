import { useEffect, useState } from "react";
import api from "../api/api";

function Home() {
  const [universities, setUniversities] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const [formData, setFormData] = useState({
    country_id: "",
    degree_level: "",
    instruction_language: "",
    max_budget: "",
    user_gpa: "",
    user_ielts: "",
  });

  useEffect(() => {
    api.get("/universities")
      .then((response) => {
        setUniversities(response.data);
      })
      .catch((error) => {
        console.error("Error fetching universities:", error);
      });
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRecommend = async () => {
    try {
      const response = await api.get("/recommend/programs", {
        params: {
          country_id: formData.country_id || undefined,
          degree_level: formData.degree_level || undefined,
          instruction_language: formData.instruction_language || undefined,
          max_budget: formData.max_budget || undefined,
          user_gpa: formData.user_gpa || undefined,
          user_ielts: formData.user_ielts || undefined,
        },
      });

      setRecommendations(response.data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>EduCompare</h1>

      <h2>Recommendation Form</h2>
      <div style={{ display: "grid", gap: "10px", maxWidth: "400px" }}>
        <input
          name="country_id"
          placeholder="Country ID (C001 or C002)"
          value={formData.country_id}
          onChange={handleChange}
        />
        <input
          name="degree_level"
          placeholder="Degree Level (Bachelor)"
          value={formData.degree_level}
          onChange={handleChange}
        />
        <input
          name="instruction_language"
          placeholder="Language (English)"
          value={formData.instruction_language}
          onChange={handleChange}
        />
        <input
          name="max_budget"
          placeholder="Max Budget"
          value={formData.max_budget}
          onChange={handleChange}
        />
        <input
          name="user_gpa"
          placeholder="Your GPA"
          value={formData.user_gpa}
          onChange={handleChange}
        />
        <input
          name="user_ielts"
          placeholder="Your IELTS"
          value={formData.user_ielts}
          onChange={handleChange}
        />

        <button onClick={handleRecommend}>Get Recommendations</button>
      </div>

      <h2 style={{ marginTop: "30px" }}>Results</h2>
      {recommendations.length === 0 ? (
        <p>No recommendations yet.</p>
      ) : (
        <ul>
          {recommendations.map((item) => (
            <li key={item.program_id}>
              <strong>{item.major_name}</strong> - {item.university_name} <br />
              Score: {item.score} <br />
              Cost: {item.estimated_yearly_cost} {item.currency}
            </li>
          ))}
        </ul>
      )}

      <h2 style={{ marginTop: "30px" }}>Universities</h2>
      {universities.length === 0 ? (
        <p>Loading universities...</p>
      ) : (
        <ul>
          {universities.map((uni) => (
            <li key={uni.university_id}>
              <strong>{uni.university_name}</strong> - {uni.city} ({uni.country_id})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Home;