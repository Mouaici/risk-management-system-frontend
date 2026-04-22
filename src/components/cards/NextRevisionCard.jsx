import { CardContainer } from "./CardContainer.jsx";

export const NextRevisionCard = () => {
  return (
    <CardContainer
      title="Next revision date"
      description="Backend support for this field is not implemented yet"
    >
      <p className="text-sm text-slate-600">
        Not available yet. Add this once revision scheduling is exposed from the
        API.
      </p>
    </CardContainer>
  );
};
