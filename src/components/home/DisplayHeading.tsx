import Image from "next/image";

export default function DisplayHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center pb-10 text-center lg:pb-14">
      <p className="text-[13px] font-light text-ink-secondary lg:text-[15px]">{eyebrow}</p>
      <div className="relative mt-2 flex items-center justify-center">
        <h2 className="text-[40px] font-semibold uppercase leading-[1.05] tracking-tight text-ink sm:text-[64px] md:text-[92px] lg:text-[130px] xl:text-[160px]">
          {title}
        </h2>
        <Image
          src="/images/home/laurel-icon.png"
          alt=""
          width={102}
          height={102}
          className="absolute -right-6 bottom-1 h-[18px] w-[18px] sm:h-[32px] sm:w-[32px] md:h-[44px] md:w-[44px] lg:h-[64px] lg:w-[64px] xl:-right-12 xl:h-[80px] xl:w-[80px]"
        />
      </div>
      <p className="mt-3 max-w-[420px] text-[15px] font-light text-ink-secondary lg:mt-5 lg:max-w-[300px] lg:text-[17px]">
        {subtitle}
      </p>
    </div>
  );
}
