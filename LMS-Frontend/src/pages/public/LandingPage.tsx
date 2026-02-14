import React from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  BarChart3,
  Users,
  ShieldCheck,
  BookOpen,
  Star,
} from "lucide-react";
import WhatsAppFloat from "../../components/common/WhatsAppFloat";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">

      {/* ================= HERO ================= */}
      <section className="relative pt-32 pb-28">

        {/* Glow Background */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
             style={{ background: "var(--primary)" }} />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
             style={{ background: "var(--secondary)" }} />

        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

          <div>
            <span className="inline-block px-4 py-1 text-sm font-semibold rounded-full bg-[var(--primary-light)] text-[var(--primary)] mb-6">
              Next-Gen Learning Infrastructure
            </span>

            <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6 heading-font">
              Build, Manage & Scale
              <br />
              <span className="text-[var(--primary)]">
                Your Institution Digitally
              </span>
            </h1>

            <p className="text-lg text-[var(--muted-foreground)] mb-8 max-w-xl">
              BKIT LMS empowers institutions with automation, advanced analytics,
              secure authentication, and seamless role-based dashboards —
              all within a unified, scalable ecosystem.
            </p>

            <div className="flex gap-4 flex-wrap">
              <Link
                to="/login"
                className="px-8 py-4 rounded-2xl font-bold text-white shadow-lg hover:scale-105 transition"
                style={{ background: "var(--primary)" }}
              >
                Get Started
              </Link>

              <a
                href="#demo"
                className="px-8 py-4 rounded-2xl font-bold border transition hover:bg-[var(--muted)]"
                style={{ borderColor: "var(--border)" }}
              >
                Watch Demo
              </a>
            </div>

            <div className="flex gap-12 mt-14 flex-wrap">
              <Stat number="10K+" label="Active Students" />
              <Stat number="120+" label="Institutions" />
              <Stat number="98%" label="Success Rate" />
            </div>
          </div>

          <div id="demo">
            <div
              className="rounded-3xl overflow-hidden border shadow-2xl"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div className="h-96 flex items-center justify-center text-[var(--muted-foreground)]">
                LMS Demo Video Placeholder
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="py-32 bg-[var(--surface)]">
        <div className="max-w-7xl mx-auto px-6 text-center">

          <h2 className="text-5xl font-black heading-font mb-6">
            Everything You Need in One Intelligent Platform
          </h2>

          <p className="text-lg text-[var(--muted-foreground)] max-w-3xl mx-auto mb-20">
            BKIT LMS integrates academic operations, performance tracking,
            user governance, and security into a single streamlined ecosystem
            built for institutions of every scale.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            <FeatureCard
              icon={<ClipboardList className="w-6 h-6" />}
              title="Smart Assessments"
              description="Create structured exams, automate grading, generate instant reports, and analyze performance trends with ease."
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Analytics Dashboard"
              description="Monitor student engagement, track institutional KPIs, and generate actionable academic insights in real time."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Role-Based Access"
              description="Secure multi-role architecture for Root Admin, Super Admin, Faculty, and Students with granular permissions."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6" />}
              title="Enterprise Security"
              description="JWT-based authentication, protected routes, encrypted data handling, and scalable infrastructure."
            />
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6 text-center">

          <h2 className="text-5xl font-black heading-font mb-20">
            How BKIT LMS Works
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <Step
              number="01"
              title="Initialize Institution"
              description="Set up institutional hierarchy, configure governance roles, and establish administrative workflows."
            />
            <Step
              number="02"
              title="Create Courses & Assessments"
              description="Design structured curriculum, schedule tests, assign faculty, and automate evaluation pipelines."
            />
            <Step
              number="03"
              title="Monitor & Optimize"
              description="Track performance metrics, analyze insights, and continuously improve academic outcomes."
            />
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="py-32 bg-[var(--surface)]">
        <div className="max-w-7xl mx-auto px-6 text-center">

          <h2 className="text-5xl font-black heading-font mb-16">
            Trusted by Institutions Nationwide
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Testimonial />
            <Testimonial />
            <Testimonial />
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6 text-center">

          <h2 className="text-5xl font-black heading-font mb-6">
            Ready to Digitize Your Institution?
          </h2>

          <p className="text-lg text-[var(--muted-foreground)] mb-10">
            Join progressive institutions leveraging intelligent automation
            to transform education delivery.
          </p>

          <Link
            to="/login"
            className="inline-block px-12 py-5 text-white font-bold rounded-2xl shadow-2xl hover:scale-105 transition"
            style={{ background: "var(--primary)" }}
          >
            Launch Your LMS Today
          </Link>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-[var(--border)] bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-3 gap-16">

          {/* Left */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="text-[var(--primary)] w-8 h-8" />
              <span className="font-black text-xl heading-font">
                BKIT LMS
              </span>
            </div>
            <p className="text-[var(--muted-foreground)] max-w-sm">
              Empowering institutions with scalable, secure, and intelligent
              digital learning infrastructure.
            </p>
          </div>

          {/* Middle */}
          <div>
            <h4 className="font-bold mb-4">Services</h4>
            <ul className="space-y-3 text-[var(--muted-foreground)]">
              <li>Corporate Training</li>
              <li>Placement Assistance</li>
              <li>Digital Solutions</li>
            </ul>
          </div>

          {/* Right */}
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <ul className="space-y-3 text-[var(--muted-foreground)]">
              <li>info@bkitsolutions.in</li>
              <li>+91 8121034516</li>
              <li>bkitsolutions.in</li>
            </ul>
          </div>

        </div>

        <div className="text-center py-6 border-t border-[var(--border)] text-sm text-[var(--muted-foreground)]">
          © {new Date().getFullYear()} BKIT Solutions. All rights reserved.
        </div>
      </footer>

      <WhatsAppFloat />
    </div>
  );
};

/* COMPONENTS */

const FeatureCard = ({ icon, title, description }: any) => (
  <div
    className="p-8 rounded-3xl border shadow-sm hover:shadow-xl transition"
    style={{ background: "var(--card)", borderColor: "var(--border)" }}
  >
    <div className="w-14 h-14 bg-[var(--primary-light)] rounded-2xl flex items-center justify-center mb-6 mx-auto text-[var(--primary)]">
      {icon}
    </div>
    <h3 className="font-bold text-lg mb-3">{title}</h3>
    <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">
      {description}
    </p>
  </div>
);

const Step = ({ number, title, description }: any) => (
  <div
    className="p-10 border rounded-3xl hover:shadow-lg transition"
    style={{ borderColor: "var(--border)" }}
  >
    <div className="text-5xl font-black text-[var(--primary)] mb-6">
      {number}
    </div>
    <h3 className="font-bold text-xl mb-3">{title}</h3>
    <p className="text-[var(--muted-foreground)] leading-relaxed">
      {description}
    </p>
  </div>
);

const Testimonial = () => (
  <div
    className="p-10 rounded-3xl border shadow-sm hover:shadow-lg transition"
    style={{ background: "var(--card)", borderColor: "var(--border)" }}
  >
    <div className="flex gap-1 mb-4 justify-center">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="text-[var(--primary)] w-4 h-4" />
      ))}
    </div>
    <p className="text-[var(--muted-foreground)] mb-4 italic">
      “BKIT LMS transformed our academic workflow completely,
      improving efficiency and transparency across departments.”
    </p>
    <span className="font-bold">Institution Administrator</span>
  </div>
);

const Stat = ({ number, label }: any) => (
  <div>
    <h3 className="text-3xl font-black">{number}</h3>
    <p className="text-sm text-[var(--muted-foreground)]">{label}</p>
  </div>
);

export default LandingPage;
