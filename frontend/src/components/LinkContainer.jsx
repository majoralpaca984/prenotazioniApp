// src/components/LinkContainer.jsx
import { Link, useMatch, useResolvedPath } from "react-router-dom";


const LinkContainer = ({ to, children, ...rest }) => {
  let resolved = useResolvedPath(to);
  let match = useMatch({ path: resolved.pathname, end: true });

  return (
    <Link to={to} {...rest} className={match ? "active" : ""}>
      {children}
    </Link>
  );
};

export default LinkContainer;
