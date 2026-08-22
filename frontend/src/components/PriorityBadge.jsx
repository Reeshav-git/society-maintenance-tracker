const PriorityBadge = ({ priority }) => (
  <span className={`badge priority-${priority?.toLowerCase()}`}>
    {priority}
  </span>
);

export default PriorityBadge;
