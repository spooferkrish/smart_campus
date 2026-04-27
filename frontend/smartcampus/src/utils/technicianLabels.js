const TECHNICIANS = new Map();

export const registerTechnicians = (technicians = []) => {
  technicians.forEach((tech) => {
    if (!tech || tech.id === null || tech.id === undefined) {
      return;
    }

    const numericId = Number(tech.id);
    if (Number.isNaN(numericId)) {
      return;
    }

    const name =
      (typeof tech.fullName === "string" && tech.fullName.trim()) ||
      (typeof tech.name === "string" && tech.name.trim()) ||
      (typeof tech.email === "string" && tech.email.trim()) ||
      `Technician #${numericId}`;

    TECHNICIANS.set(numericId, { name });
  });
};

export const getTechnicianLabel = (id) => {
  if (id === null || id === undefined) return "";
  const numericId = Number(id);
  const tech = TECHNICIANS.get(numericId);
  if (!tech) return `Technician #${id}`;
  return `${tech.name} (Technician #${numericId})`;
};
