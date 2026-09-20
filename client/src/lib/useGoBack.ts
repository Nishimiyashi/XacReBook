import { useNavigate, useLocation } from 'react-router-dom';

// A "back" button that steps back through history when there is somewhere in
// the app to return to, so the previous page comes back with its scroll
// position. Pushing a fresh link to the same page would land at the top.
export function useGoBack(fallback: string) {
  const navigate = useNavigate();
  const location = useLocation();
  return () => {
    if (location.key !== 'default') navigate(-1);
    else navigate(fallback);
  };
}
