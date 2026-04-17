import { useEffect, useState } from "react";
import api from "../api/api";

function Home() {
  const [universities, setUniversities] = useState([]);

  useEffect(() => {
    api.get("/universities")
      .then((response) => {
        setUniversities(response.data);
      })
      .catch((error) => {
        console.error("Error fetching universities:", error);
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>EduCompare</h1>
      <h2>Universities</h2>

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