import Image from "next/image";

export default function PageHero({
  title,
  subtitle,
  image,
  alt,
}: {
  title: string;
  subtitle?: string;
  image: string;
  alt: string;
}) {
  return (
    <section className="relative flex h-64 items-end overflow-hidden sm:h-80">
      <Image src={image} alt={alt} fill priority className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-ink/10" />
      <div className="relative mx-auto w-full max-w-6xl px-6 pb-8 text-cream">
        <h1 className="font-head text-4xl font-bold sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-xl text-sand-dark">{subtitle}</p>}
      </div>
    </section>
  );
}
