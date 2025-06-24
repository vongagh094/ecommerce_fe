import Image from "next/image"

export function HeroSection() {
  return (
    <div className="relative h-96 overflow-hidden">
      <Image
        src="/images/vietnam-hero.png"
        alt="Vietnam landscape"
        fill
        className="object-contain"
  />

      <div className="absolute inset-0 bg-black bg-opacity-20" />
      <div className="absolute inset-0 flex items-center justify-start">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        </div>
      </div>
    </div>
  )
}
