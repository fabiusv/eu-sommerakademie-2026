export default function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="pb-8 lg:pb-12">
      <p className="text-[15px] font-semibold text-[#222] lg:text-[20px]">{eyebrow}</p>
      <h2 className="mt-2 max-w-[600px] whitespace-pre-line text-[26px] font-semibold leading-[1.15] text-[#222] md:text-[34px] lg:text-[46px]">
        {title}
      </h2>
    </div>
  );
}
