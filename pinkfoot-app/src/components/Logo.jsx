export default function Logo({ size = 38, dark = false }) {
  const pink = "#E85478";
  const navy = "#1B2A4A";
  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/favicon.svg"
        alt="Pinkfoot logo"
        style={{ width: size, height: size, objectFit: "contain" }}
      />
      <div className="leading-none">
        <div
          className="font-display text-[18px] font-bold leading-none"
          style={{ color: pink }}
        >
          PINKFOOT
        </div>
        <div
          className="font-body mt-0.5 text-[12px] font-bold tracking-[2px] leading-none"
          style={{ color: dark ? "#fff" : navy }}
        >
          TRAVEL
        </div>
      </div>
    </div>
  );
}
