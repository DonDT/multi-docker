import React, { useState, useEffect } from "react";
import axios from "axios";

const Fib = () => {
  const [seenIndexes, setSeenIndexes] = useState([]);
  const [values, setValues] = useState({});
  const [index, setIndexe] = useState(" ");

  useEffect(() => {
    fetchValues();
    fetchIndexes();
  }, []);

  const fetchValues = async () => {
    const values = await axios.get("/api/values/current");
    setValues(values.data);
  };
  const fetchIndexes = async () => {
    const indexes = await axios.get("/api/values/all");
    setSeenIndexes(indexes.data);
  };
  const renderSeenIndexes = () => {
    return seenIndexes.map(({ number }) => number).join(", ");
  };
  const renderValues = () => {
    const entries = [];
    console.log(values);
    for (let key in values) {
      entries.push(
        <div key={key}>
          For index {key} I Calculated {values[key]}
        </div>
      );
    }
    return entries;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("/api/values", {
      index,
    });
    setIndexe("");
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>Enter your index</label>
        <input value={index} onChange={(e) => setIndexe(e.target.value)} />
        <button>Submit</button>
      </form>
      <h3>Indexes I have seen</h3>
      {renderSeenIndexes()}
      <h3>Calculated values</h3>
      {renderValues()}
    </div>
  );
};

export default Fib;
