import type {
  AircraftManufacturerId,
} from "@/lib/game-data";

const manufacturerNames: Record<
  AircraftManufacturerId,
  string
> = {
  atr: "ATR",
  embraer: "Embraer",
  airbus: "Airbus",
  boeing: "Boeing",
};

export function ManufacturerLogo({
  manufacturerId,
}: {
  manufacturerId: AircraftManufacturerId;
}) {
  return (
    <div
      className={`manufacturer-logo manufacturer-logo-${manufacturerId}`}
      role="img"
      aria-label={`${manufacturerNames[manufacturerId]} logo`}
    >
      {manufacturerId === "atr" && (
        <span className="atr-wordmark">
          ATR
        </span>
      )}

      {manufacturerId === "embraer" && (
        <>
          <svg
            viewBox="0 0 42 28"
            aria-hidden="true"
          >
            <path d="M3 14 17 3h20L23 11H10v6h13l14 8H17Z" />
          </svg>
          <span>EMBRAER</span>
        </>
      )}

      {manufacturerId === "airbus" && (
        <>
          <svg
            viewBox="0 0 34 34"
            aria-hidden="true"
          >
            <path d="M17 2a15 15 0 1 0 0 30 15 15 0 0 0 0-30Zm0 5a10 10 0 0 1 8.7 5H8.3A10 10 0 0 1 17 7Zm0 20a10 10 0 0 1-8.7-5h17.4A10 10 0 0 1 17 27Z" />
          </svg>
          <span>AIRBUS</span>
        </>
      )}

      {manufacturerId === "boeing" && (
        <>
          <svg
            viewBox="0 0 46 34"
            aria-hidden="true"
          >
            <ellipse
              cx="21"
              cy="17"
              rx="17"
              ry="8"
            />
            <path d="M6 29 29 4 18 30M4 11l38 12" />
          </svg>
          <span>BOEING</span>
        </>
      )}
    </div>
  );
}
