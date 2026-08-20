import Image from "next/image";
import Container from "./Container";
import SectionHeading from "./SectionHeading";
import SectionCta from "./SectionCta";
import { courses } from "@/lib/home-data";

export default function Academy() {
  return (
    <section className="bg-page py-16 lg:py-[80px]">
      <Container>
        <SectionHeading eyebrow="Academy" title={"Learn from the\nbest instructors."} />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course) => (
            <a
              key={course.title}
              href="#"
              className="group flex flex-col overflow-hidden rounded-[14px] bg-surface shadow-card"
            >
              <div className="relative aspect-[439/263] overflow-hidden">
                <Image
                  src={course.image}
                  alt={course.instructor}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-4 p-6">
                <h3 className="text-[18px] font-semibold leading-[1.2] text-ink">
                  {course.title}
                </h3>
                <div className="-mx-6 flex justify-between border-y border-line px-6 py-4 text-[13px]">
                  <span className="font-semibold text-ink">Instructor</span>
                  <span className="font-light text-ink-secondary">{course.instructor}</span>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-ink">
                      Score <span className="font-light text-ink-secondary">{course.score}</span>
                    </p>
                    <div className="mt-2 h-1 w-[100px] overflow-hidden rounded-full bg-surface-hover">
                      <div
                        className="h-full rounded-full bg-eu-yellow"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="text-ink-secondary transition-colors group-hover:text-accent"
                    aria-hidden
                  >
                    <path
                      d="M3 10h13.5M11 4.5 16.5 10 11 15.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
        <SectionCta label="Choose from over hundreds of courses" linkLabel="View Academy" />
      </Container>
    </section>
  );
}
