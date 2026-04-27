import API from "../services/api";
import dayjs from "dayjs";

// Returns a promise that resolves to a Set of resource IDs/names that are currently booked
export async function getCurrentlyBookedResources() {
  try {
    const res = await API.get("/bookings");
    const bookings = Array.isArray(res.data) ? res.data : [];
    const now = dayjs();
    const bookedSet = new Set();
    bookings.forEach((b) => {
      if (!b.startTime || !b.endTime) return;
      const start = dayjs(b.startTime);
      const end = dayjs(b.endTime);
      if (now.isAfter(start) && now.isBefore(end)) {
        if (b.resourceId) bookedSet.add(String(b.resourceId));
        if (b.resourceName) bookedSet.add(b.resourceName);
      }
    });
    return bookedSet;
  } catch {
    return new Set();
  }
}
