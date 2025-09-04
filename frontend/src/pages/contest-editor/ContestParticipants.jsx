import { useOutletContext } from "react-router-dom";

export default function ContestParticipants() {
  const { contestData, setContestData } = useOutletContext();

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Participants</h2>
      <p>Manage participants for contest: {contestData.title}</p>
    </div>
  );
}
