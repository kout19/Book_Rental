// Simple, dependency-free ability helper. It exposes defineAbilitiesFor(user)
// which returns an object with a `can(action, subject, resource?)` function.
// This is intentionally lightweight and only covers the checks we need server-side.
export function defineAbilitiesFor(user) {
  const uid = user ? String(user._id || user.id) : null;

  return {
    can(action, subject, resource) {
      // Admins can do anything
      if (user && user.role === 'admin') return true;

      // Guests (no user) can only read approved books
      if (!user) {
        if (action === 'read' && subject === 'Book') {
          if (!resource) return true; // allow listing; controllers still apply approved filter by default
          return Boolean(resource.approved === true);
        }
        return false;
      }

      // Owners: can manage Book only if they own it; can read approved books
      if (user.role === 'owner') {
        if (subject === 'Book') {
          if (action === 'manage') {
            if (!resource) return true; // when resource not provided, allow owner management in contexts where it's safe
            return String(resource.owner) === uid;
          }
          if (action === 'read') {
            if (!resource) return true; // list view handled by controllers
            return resource.approved === true || String(resource.owner) === uid;
          }
        }
      }

      // Regular authenticated users: can read approved books
      if (user.role === 'user') {
        if (action === 'read' && subject === 'Book') {
          if (!resource) return true;
          return Boolean(resource.approved === true);
        }
      }

      return false;
    }
  };
}
