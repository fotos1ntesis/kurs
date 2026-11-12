"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { courses, categories } from "@/data/data.json";

export default function Mainpage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredCourses =
    activeCategory === "all"
      ? courses
      : courses.filter((course) => course.category === activeCategory);

  return (
    <div className="my-15">
      <section>
        <h1 className="text-[32px] font-bold leading-tight tracking-[0.02em]  mb-15 text-navy-blue md:text-[36px]">
          Курсы по {""}
          {activeCategory === "all"
            ? "Всем категориям"
            : categories.find((category) => category.id === activeCategory)
                ?.heading}
        </h1>

        <div className="mt-6 flex flex-wrap gap-4">
          {categories.map((category) => {
            const count =
              category.id === "all"
                ? courses.length
                : courses.filter((course) => course.category === category.id)
                    .length;

            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`cursor-pointer rounded-[21px] border border-slate-200/80 py-2 px-4 text-[16px] font-medium leading-6 transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-iris text-white"
                    : "text-navy-blue hover:bg-iris hover:text-white"
                }`}
              >
                {category.title} ({count})
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredCourses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="mt-6 flex max-w-100 flex-col items-center gap-2 rounded-[21px] border border-slate-200/80 py-4 px-6 text-center transition-all duration-300 hover:scale-105 hover:border-iris cursor-pointer"
            >
              <Image
                src={course.img}
                alt={course.title}
                width={240}
                height={240}
              />

              <h2 className="text-[18px] font-semibold leading-tight tracking-[0.02em] text-navy-blue">
                {course.title}
              </h2>

              <p className="text-[14px] text-left leading-6 text-slate-600">
                {course.studies}
              </p>
            </Link>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <p className="mt-10 text-center text-slate-500">
            Курсов в этой категории пока нет.
          </p>
        )}
      </section>
    </div>
  );
}
