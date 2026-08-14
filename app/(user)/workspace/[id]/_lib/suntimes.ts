/**
 * Sonnenauf- und -untergang aus lat/lon — dieselbe Sonnengleichung, die auch
 * `astral` (Python, auf dem Pi) und suncalc.js verwenden. Keine Bibliothek für
 * eine Funktion: ~40 Zeilen bekannte Mathematik statt einer Abhängigkeit.
 * Genauigkeit liegt im Minutenbereich — reicht, um das Aufnahmefenster auf der
 * Volk-Seite zu markieren, das Projekt strebt ohnehin keine Präzision an.
 */

const RAD = Math.PI / 180;
const DAY_MS = 86400000;
const J1970 = 2440588;
const J2000 = 2451545;
const OBLIQUITY = RAD * 23.4397;

function toJulian(date: Date): number {
  return date.valueOf() / DAY_MS - 0.5 + J1970;
}

function fromJulian(j: number): Date {
  return new Date((j + 0.5 - J1970) * DAY_MS);
}

function toDays(date: Date): number {
  return toJulian(date) - J2000;
}

function solarMeanAnomaly(d: number): number {
  return RAD * (357.5291 + 0.98560028 * d);
}

function eclipticLongitude(m: number): number {
  const c = RAD * (1.9148 * Math.sin(m) + 0.02 * Math.sin(2 * m) + 0.0003 * Math.sin(3 * m));
  const p = RAD * 102.9372;
  return m + c + p + Math.PI;
}

function declination(l: number): number {
  return Math.asin(Math.sin(l) * Math.sin(OBLIQUITY));
}

function julianCycle(d: number, lw: number): number {
  return Math.round(d - 0.0009 - lw / (2 * Math.PI));
}

function approxTransit(ht: number, lw: number, n: number): number {
  return 0.0009 + (ht + lw) / (2 * Math.PI) + n;
}

function solarTransitJ(ds: number, m: number, l: number): number {
  return J2000 + ds + 0.0053 * Math.sin(m) - 0.0069 * Math.sin(2 * l);
}

function hourAngle(h: number, phi: number, d: number): number {
  return Math.acos(
    (Math.sin(h) - Math.sin(phi) * Math.sin(d)) / (Math.cos(phi) * Math.cos(d)),
  );
}

export interface SunTimes {
  sunrise: Date;
  sunset: Date;
}

/** Liefert null, wenn die Sonne an diesem Tag/Ort gar nicht auf-/untergeht
 * (Polarregionen) — für Bienenstandorte praktisch nie relevant, aber sauber
 * statt NaN zurückzugeben. */
export function sunTimes(lat: number, lon: number, date: Date): SunTimes | null {
  const lw = RAD * -lon;
  const phi = RAD * lat;
  const d = toDays(date);
  const n = julianCycle(d, lw);
  const ds = approxTransit(0, lw, n);
  const m = solarMeanAnomaly(ds);
  const l = eclipticLongitude(m);
  const dec = declination(l);
  const jNoon = solarTransitJ(ds, m, l);

  const h0 = -0.833 * RAD;
  const w = hourAngle(h0, phi, dec);
  if (Number.isNaN(w)) return null;

  const a = approxTransit(w, lw, n);
  const jSet = solarTransitJ(a, m, l);
  const jRise = jNoon - (jSet - jNoon);

  return { sunrise: fromJulian(jRise), sunset: fromJulian(jSet) };
}
