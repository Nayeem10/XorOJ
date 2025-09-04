import { useOutletContext } from "react-router-dom";

export default function ContestSettings() {
  const { contestData, setContestData } = useOutletContext();

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Settings</h2>
      <p>Configure rules, scoring, and advanced settings for contest: {contestData.title}</p>
    </div>
  );
}
