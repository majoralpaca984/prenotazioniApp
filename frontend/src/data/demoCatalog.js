import { toDateInputValue } from "../utils/date";

const DAY_FORMATTER = new Intl.DateTimeFormat("it-IT", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
});

const doctorProfiles = [
  {
    _id: "demo-cardiology",
    name: "Dr. Mario Rossi",
    speciality: "Cardiologia",
    city: "Roma",
    image: "cardiologo",
    rating: "4,9",
    price: 80,
    services: ["Visita cardiologica", "Elettrocardiogramma", "Ecocardiogramma"],
    unavailableOffsets: [3],
  },
  {
    _id: "demo-dermatology",
    name: "Dr.ssa Sofia Bianchi",
    speciality: "Dermatologia",
    city: "Roma",
    image: "dermatologa",
    rating: "4,8",
    price: 75,
    services: ["Visita dermatologica", "Mappatura nei", "Dermatoscopia"],
    unavailableOffsets: [1],
  },
  {
    _id: "demo-neurology",
    name: "Dr.ssa Lucia Verdi",
    speciality: "Neurologia",
    city: "Guidonia",
    image: "default",
    rating: "4,7",
    price: 90,
    services: ["Visita neurologica", "Elettroencefalogramma", "Elettromiografia"],
    unavailableOffsets: [2],
  },
  {
    _id: "demo-radiology",
    name: "Dr. Andrea Romano",
    speciality: "Radiologia",
    city: "Roma",
    image: "radiologo",
    rating: "4,9",
    price: 65,
    services: ["Ecografia", "Risonanza magnetica", "TAC"],
    unavailableOffsets: [4],
  },
];

export const demoServices = [...new Set(doctorProfiles.flatMap((doctor) => doctor.services))].sort();
export const demoSpecialities = [...new Set(doctorProfiles.map((doctor) => doctor.speciality))].sort();

function normalize(value = "") {
  return value.trim().toLocaleLowerCase("it-IT");
}

function getStartDate(value) {
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(value || "")
    ? new Date(`${value}T12:00:00`)
    : new Date();

  if (!value) parsed.setDate(parsed.getDate() + 1);
  return parsed;
}

function buildAvailability(startDate, unavailableOffsets) {
  return Array.from({ length: 5 }, (_, offset) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + offset);
    return {
      value: toDateInputValue(date),
      label: DAY_FORMATTER.format(date),
      available: !unavailableOffsets.includes(offset),
    };
  });
}

export function getDemoDoctors({ service = "", speciality = "", city = "", date = "" } = {}) {
  const serviceQuery = normalize(service);
  const specialityQuery = normalize(speciality);
  const cityQuery = normalize(city);
  const startDate = getStartDate(date);

  return doctorProfiles
    .filter((doctor) => {
      const serviceText = normalize(`${doctor.speciality} ${doctor.services.join(" ")}`);
      const specialityText = normalize(`${doctor.name} ${doctor.speciality}`);
      return (
        (!serviceQuery || serviceText.includes(serviceQuery)) &&
        (!specialityQuery || specialityText.includes(specialityQuery)) &&
        (!cityQuery || normalize(doctor.city).includes(cityQuery))
      );
    })
    .map(({ unavailableOffsets, ...doctor }) => ({
      ...doctor,
      availability: buildAvailability(startDate, unavailableOffsets),
    }));
}
