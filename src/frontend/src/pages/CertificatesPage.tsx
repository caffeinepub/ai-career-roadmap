import { Skeleton } from "@/components/ui/skeleton";
import { Award, Star } from "lucide-react";
import { motion } from "motion/react";
import { useGetCertificates } from "../hooks/useQueries";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4 } },
};

const STAR_POSITIONS = ["star-1", "star-2", "star-3", "star-4", "star-5"];

function formatDate(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(ms));
}

export function CertificatesPage() {
  const { data: certificates, isLoading } = useGetCertificates();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold gradient-text">
          My Certificates
        </h1>
        <p className="text-muted-foreground mt-1">
          Your achievements, forever on-chain
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[1, 2].map((i) => (
            <Skeleton
              key={i}
              className="h-48 rounded-2xl"
              data-ocid="certificates.loading_state"
            />
          ))}
        </div>
      ) : !certificates?.length ? (
        <div
          data-ocid="certificates.empty_state"
          className="glass rounded-2xl p-16 text-center"
        >
          <Award className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-xl font-display font-semibold text-muted-foreground">
            No certificates yet
          </p>
          <p className="text-sm text-muted-foreground/60 mt-2">
            Complete a course to earn your first certificate and showcase your
            achievements!
          </p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 gap-5"
        >
          {certificates.map((cert, i) => (
            <motion.div
              key={`cert-${cert.studentName}-${i}`}
              variants={itemVariants}
              data-ocid={`certificates.cert.item.${i + 1}`}
              className="relative rounded-2xl overflow-hidden"
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.14 0.04 194 / 0.8), oklch(0.12 0.05 280 / 0.8))",
                  backdropFilter: "blur(16px)",
                }}
              />
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
              <div
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{
                  background:
                    "linear-gradient(90deg, oklch(0.72 0.19 194), oklch(0.65 0.22 280))",
                }}
              />

              <div className="relative z-10 p-6 border border-white/10 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
                      <Award className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-mono uppercase tracking-widest text-primary/70">
                        CareerPath AI
                      </p>
                      <p className="text-xs text-muted-foreground/60">
                        Certificate of Completion
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {STAR_POSITIONS.map((pos) => (
                      <Star
                        key={pos}
                        className="w-3 h-3 text-chart-5 fill-chart-5"
                      />
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                    This certifies that
                  </p>
                  <h3 className="text-2xl font-display font-bold gradient-text">
                    {cert.studentName}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    has successfully completed
                  </p>
                  <p className="text-base font-display font-semibold text-foreground mt-1">
                    {cert.courseName}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Issued:{" "}
                    <span className="text-foreground/70">
                      {formatDate(cert.issueDate)}
                    </span>
                  </p>
                  <div
                    className="w-8 h-8 rounded-full border border-chart-5/40 flex items-center justify-center"
                    style={{ background: "oklch(0.8 0.15 120 / 0.15)" }}
                  >
                    <span className="text-chart-5 text-xs font-bold">✓</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
