import Image from "next/image";

const links = ["Nominees", "Courses", "Collections", "Directory", "Market"];

export default function FloatingNav() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 hidden justify-center md:flex">
      <div className="pointer-events-auto flex items-center gap-1.5 rounded-xl bg-[#222]/80 p-1.5 backdrop-blur-md">
        <span className="flex size-[60px] items-center justify-center rounded-lg bg-[#222]">
          <Image src="/images/home/floating-logo.svg" alt="Awwwards" width={30} height={16} />
        </span>
        <nav className="flex items-center gap-1 rounded-lg bg-[#3e3e3e] px-1.5 py-1.5">
          {links.map((link) => (
            <a
              key={link}
              href="#"
              className="rounded-lg border border-[#4e4e4e] px-4 py-3.5 text-[12px] text-[#dedede]"
            >
              {link}
            </a>
          ))}
        </nav>
        <a
          href="#"
          className="rounded-lg bg-[#e9e9e9] px-5 py-3.5 text-[12px] font-semibold text-[#222]"
        >
          Visit Sotd.
        </a>
      </div>
    </div>
  );
}
