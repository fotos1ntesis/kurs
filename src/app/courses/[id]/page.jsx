import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CoursePurchaseButton from "@/components/courses/course-purchase-button";
import { courses } from "@/data/data.json";

function findCourse(id) {
  return courses.find((course) => String(course.id) === id);
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const course = findCourse(id);

  return {
    title: course ? `${course.title} | EDUFORM` : "Курс не найден | EDUFORM",
  };
}

export default async function CoursePage({ params }) {
  const { id } = await params;
  const course = findCourse(id);

  if (!course) {
    notFound();
  }

  return (
    <main className="flex-1 px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <Link className="font-medium text-iris hover:text-ocean" href="/">
          ← Все курсы
        </Link>

        <div className="mt-8 grid items-center gap-10 md:grid-cols-2">
          <div className="overflow-hidden rounded-3xl bg-cloud">
            <Image
              alt={course.title}
              className="h-full w-full object-cover"
              height={520}
              priority
              src={course.img}
              width={640}
            />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-iris">
              Продолжительность: {course.studies}
            </p>
            <h1 className="mt-3 text-3xl font-bold text-navy-blue sm:text-4xl">
              {course.title}
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate">
              {course.description}
            </p>
            <div className="mt-8">
              <CoursePurchaseButton courseId={course.id} />
            </div>
          </div>
        </div>

        {/* <section className="mt-14 max-w-3xl">
          <h2 className="text-2xl font-bold text-navy-blue">Программа курса</h2>
          <ol className="mt-5 space-y-3">
            {course.program.map((topic, index) => (
              <li
                className="flex items-start gap-4 rounded-2xl border border-slate-200/80 p-4"
                key={topic}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cloud font-semibold text-iris">
                  {index + 1}
                </span>
                <span className="pt-1 text-slate">{topic}</span>
              </li>
            ))}
          </ol>
        </section> */}
      </div>
    </main>
  );
}
