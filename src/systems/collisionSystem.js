(function () {
  const TheGame = (window.TheGame = window.TheGame || {});

  function getBounds(collider) {
    if (collider.box) {
      return {
        minX: collider.box.min.x,
        maxX: collider.box.max.x,
        minY: collider.box.min.y,
        maxY: collider.box.max.y,
        minZ: collider.box.min.z,
        maxZ: collider.box.max.z,
      };
    }

    return collider;
  }

  function collidesAt(x, z, radius, colliders, minY = -Infinity, maxY = Infinity) {
    return colliders.some((collider) => {
      const bounds = getBounds(collider);
      return (
        collider.enabled !== false &&
        collider.type !== "floor" &&
        collider.type !== "stairs" &&
        maxY > (bounds.minY ?? -Infinity) &&
        minY < (bounds.maxY ?? Infinity) &&
        x > bounds.minX - radius &&
        x < bounds.maxX + radius &&
        z > bounds.minZ - radius &&
        z < bounds.maxZ + radius
      );
    });
  }

  function resolveHorizontalCollision(current, desired, radius, colliders, minY = -Infinity, maxY = Infinity) {
    const resolved = { x: current.x, z: current.z };

    if (!collidesAt(desired.x, current.z, radius, colliders, minY, maxY)) {
      resolved.x = desired.x;
    }

    if (!collidesAt(resolved.x, desired.z, radius, colliders, minY, maxY)) {
      resolved.z = desired.z;
    }

    return resolved;
  }

  TheGame.CollisionSystem = {
    collidesAt,
    resolveHorizontalCollision,
  };
})();
